const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios"); // npm install axios
require("dotenv").config();

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

app.post("/track_ip", async (req, res) => {
  const ip = req.body.ip;
  const userId = process.env.USER_ID;
  const channelId = process.env.CHANNEL_ID;
  
  try {
    // 1. Use ipdata.co to get location & VPN/proxy info
    //    Make sure you have IPDATA_API_KEY in your .env
    const ipdataApiKey = process.env.IPDATA_API_KEY;
    const response = await axios.get(
      `https://api.ipdata.co/${ip}?api-key=${ipdataApiKey}`
    );
    const data = response.data;

    // 2. Extract region/country from ipdata's response
    const region = data.region || "N/A";
    const country = data.country_name || "N/A";

    // 3. Detect VPN/Proxy/Tor using ipdata's "threat" object
    //    (ipdata includes fields like is_tor, is_proxy, is_anonymous, etc.)
    const { is_tor, is_proxy, is_anonymous } = data.threat || {};
    const isVpn = Boolean(is_tor || is_proxy || is_anonymous);

    // 4. Create Discord Embed for DM
    const user = await client.users.fetch(userId);
    const dmEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("New IP Visit Notification")
      .setDescription("Someone visited your site:")
      .addFields(
        { name: "IP Address", value: ip, inline: true },
        { name: "Region", value: region, inline: true },
        { name: "Country", value: country, inline: true },
        { name: "Uses VPN/Proxy?", value: isVpn ? "Yes" : "No", inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Webhook Notification" });

    await user.send({ embeds: [dmEmbed] });

    // 5. Create Discord Embed for Channel
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
          { name: "Uses VPN/Proxy?", value: isVpn ? "Yes" : "No", inline: true }
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

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
