require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "start_quiz") {

    await interaction.reply("Starting a new quiz session!");
  } else if (commandName === "answer") {

    await interaction.reply("Answer received!");
  } else if (commandName === "leaderboard") {

    await interaction.reply("Here is the leaderboard!");
  } else if (commandName === "skip_question") {

    await interaction.reply("Question skipped!");
  } else if (commandName === "set_category") {

    await interaction.reply("Category set!");
  } else if (commandName === "set_difficulty") {

    await interaction.reply("Difficulty set!");
  } else if (commandName === "end_quiz") {

    await interaction.reply("Quiz ended!");
  }
});

client.login(process.env.DISCORD_TOKEN); 