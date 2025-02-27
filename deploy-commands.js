require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "start_quiz",
    description: "Starts a new quiz session with random questions.",
  },
  {
    name: "answer",
    description: "Submit your answer.",
    options: [
      {
        type: 3, // STRING
        name: "option",
        description: "Your answer option (e.g., A, B, C, D)",
        required: true,
      },
    ],
  },
  {
    name: "leaderboard",
    description: "Displays the top scorers in the server.",
  },
  {
    name: "skip_question",
    description: "Skips the current question if no one gets it right.",
  },
  {
    name: "set_category",
    description: "Selects a specific trivia category.",
    options: [
      {
        type: 3, // STRING
        name: "category",
        description: "The trivia category (e.g., Science, History, Gaming)",
        required: true,
      },
    ],
  },
  {
    name: "set_difficulty",
    description: "Adjusts quiz difficulty.",
    options: [
      {
        type: 3, // STRING
        name: "difficulty",
        description: "The difficulty level (Easy, Medium, Hard)",
        required: true,
      },
    ],
  },
  {
    name: "end_quiz",
    description: "Ends the current quiz session.",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})(); 