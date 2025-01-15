require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const { sendIpNotification } = require("./src/ipNotifier");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

app.post("/track_ip", async (req, res) => {
  const ip = req.body.ip;
  const userId = process.env.USER_ID;
  const channelId = process.env.CHANNEL_ID;
  const ipqsApiKey = process.env.IPQS_API_KEY;

  try {
    const response = await axios.get(
      `https://ipqualityscore.com/api/json/ip/${ipqsApiKey}/${ip}`
    );
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch IP data from IPQS");
    }

    await sendIpNotification(client, ip, data, userId, channelId);

    res.status(200).send("Notification sent to Discord!");
  } catch (error) {
    console.error("Error:", error);

    try {
      const user = await client.users.fetch(userId);
      await user.send(`Request failed. IP Address: **${ip}**`);
    } catch (sendUserError) {
      console.error("Error sending IP address to user:", sendUserError);
    }

    try {
      const channel = await client.channels.fetch(channelId);
      if (channel) {
        await channel.send(`Request failed. IP Address: **${ip}**`);
      }
    } catch (sendChannelError) {
      console.error("Error sending IP address to channel:", sendChannelError);
    }

    res.status(500).send("Failed to send notifications");
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
