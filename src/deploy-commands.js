require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "start_quiz",
    description: "Starts a new quiz session with random questions.",
  },
  {
    name: "leaderboard",
    description: "Displays the top scorers in the server.",
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Error reloading application (/) commands:', error);
  }
})(); 