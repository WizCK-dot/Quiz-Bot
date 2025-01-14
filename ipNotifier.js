const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

/**
 * Utility function to convert a two-letter country code into a Discord flag emoji.
 *
 * @param {string} countryCode - A two-letter ISO country code (e.g. "US", "GB").
 * @returns {string} - The corresponding flag emoji or an empty string if invalid.
 */
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  
  // Convert each letter to its regional indicator symbol
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Sends an IP notification to a specific user (DM) and channel in Discord.
 *
 * @param {Client} client - An instance of Discord's Client.
 * @param {string} ip - The IP address.
 * @param {Object} data - The IP data (e.g., from IPQualityScore) containing region, country, etc.
 * @param {string} userId - The user ID to DM.
 * @param {string} channelId - The channel ID to send the notification.
 */
async function sendIpNotification(client, ip, data, userId, channelId) {
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

  const flagEmoji = getFlagEmoji(country_code);

  const isSuspicious = proxy || vpn || tor || bot_status;

  const embedFields = [
    { name: "IP Address", value: ip || "N/A", inline: true },
    { name: "Region", value: region || "N/A", inline: true },
    {
      name: "Country",
      value: country_code
        ? `${country_code} ${flagEmoji}`
        : "N/A",
      inline: true,
    },
    {
      name: "VPN/Proxy/Tor/Bot?",
      value: isSuspicious ? "Yes" : "No",
      inline: true,
    },
  ];

  const dmEmbed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("New IP Visit Notification")
    .addFields(embedFields)
    .setTimestamp()
    .setFooter({ text: "Webhook Notification" });

  const mapButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("View Location")
      .setStyle(ButtonStyle.Link)
      .setURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      )
  );

  const user = await client.users.fetch(userId);
  await user.send({ embeds: [dmEmbed], components: [mapButtonRow] });

  // Send to channel
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
}

module.exports = {
  sendIpNotification,
};
