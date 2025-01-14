require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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

    const country = data.country_code || "N/A";
    const region = data.region || "N/A";
    const proxy = data.proxy || false;
    const vpn = data.vpn || false;
    const tor = data.tor || false;
    const botStatus = data.is_bot || false;

    const isVpnOrProxy = vpn || proxy || tor || botStatus;

    const user = await client.users.fetch(userId);
    const dmEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("New IP Visit Notification")
      .setDescription("Someone visited your site:")
      .addFields(
        { name: "IP Address", value: ip, inline: true },
        { name: "Region", value: region, inline: true },
        { name: "Country", value: country, inline: true },
        { name: "VPN/Proxy/Tor?", value: isVpnOrProxy ? "Yes" : "No", inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Webhook Notification" });

    // Send DM to the specified user
    await user.send({ embeds: [dmEmbed] });

    // Send a message to the specified channel
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const channelEmbed = new EmbedBuilder()
        .setColor("#ff4500")
        .setTitle("New IP Visit Detected")
        .setDescription("A new visitor has accessed the site:")
        .addFields(
          { name: "IP Address", value: ip, inline: true },
          { name: "Region", value: region, inline: true },
          { name: "Country", value: country, inline: true },
          { name: "VPN/Proxy/Tor?", value: isVpnOrProxy ? "Yes" : "No", inline: true }
        )
        .setTimestamp()
        .setFooter({ text: "Webhook Notification" });

      await channel.send({ embeds: [channelEmbed] });
    } else {
      console.error("Channel not found!");
    }

    res.status(200).send("DM and channel message sent successfully!");
  } catch (error) {
    console.error("Error sending DM or posting to channel:", error);
    res.status(500).send("Error sending DM or posting to channel");
  }
});

// Start the Express server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
