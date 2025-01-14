require("dotenv").config();
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const axios = require("axios");

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

    // Extract the fields you need from the IPQS response
    const {
      region,
      country_code,
      proxy,
      vpn,
      tor,
      bot_status,
      latitude,
      longitude,
    } = data;

    const isSuspicious = proxy || vpn || tor || bot_status;

    const embedFields = [
      { name: "IP Address", value: ip, inline: true },
      { name: "Region", value: region || "N/A", inline: true },
      { name: "Country", value: country_code || "N/A", inline: true },
      { name: "VPN/Proxy/Tor/Bot?", value: isSuspicious ? "Yes" : "No", inline: true },
    ];

    // Create your embed
    const dmEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("New IP Visit Notification")
      .addFields(embedFields)
      .setTimestamp()
      .setFooter({ text: "Webhook Notification" });

    // Create a button row to link to the location on Google Maps
    // (If latitude/longitude are undefined, you may want to handle it gracefully)
    const mapButtonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("View Location")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)
    );

    // Send the embed + button to the user in DM
    const user = await client.users.fetch(userId);
    await user.send({ embeds: [dmEmbed], components: [mapButtonRow] });

    // Send a similar embed + button to your channel
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const channelEmbed = new EmbedBuilder()
        .setColor("#ff4500")
        .setTitle("New IP Visit Detected")
        .addFields(embedFields)
        .setTimestamp()
        .setFooter({ text: "Webhook Notification" });

      await channel.send({
        embeds: [channelEmbed],
        components: [mapButtonRow],
      });
    }

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
