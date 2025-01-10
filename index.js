const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

app.post("/track_ip", async (req, res) => {
  const ip = req.body.ip;
  const userId = process.env.USER_ID;
  const channelId = process.env.CHANNEL_ID;

  try {
    // Send a DM to the user with an embed
    const user = await client.users.fetch(userId);
    const dmEmbed = new EmbedBuilder()
      .setColor("#0099ff") // Blue color
      .setTitle("New IP Visit Notification")
      .setDescription("Someone visited your site:")
      .addFields(
        { name: "IP Address", value: ip, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Webhook Notification" });

    await user.send({ embeds: [dmEmbed] });

    // Post a message to the specified channel with an embed
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const channelEmbed = new EmbedBuilder()
        .setColor("#ff4500") // Orange color
        .setTitle("New IP Visit Detected")
        .setDescription("A new visitor has accessed the site:")
        .addFields(
          { name: "IP Address", value: ip, inline: true }
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

