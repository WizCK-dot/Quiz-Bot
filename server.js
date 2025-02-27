require("dotenv").config();
const he = require('he');
const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const allowedChannelIds = process.env.CHANNEL_ID.split(',');

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const fetchQuizQuestion = async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0];
    } else {
      console.error('No quiz questions available from the API.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching quiz question:', error);
    return null;
  }
}

const userAnswers = new Map();

client.on("interactionCreate", async (interaction) => {
  try {
    if (!allowedChannelIds.includes(interaction.channelId)) {
      return interaction.reply({ content: "This command can only be used in specific channels.", ephemeral: true });
    }

    if (interaction.isCommand()) {
      const { commandName } = interaction;

      if (commandName === "start_quiz") {
        await interaction.deferReply({ ephemeral: true });

        const question = await fetchQuizQuestion();
        if (question) {
          const { question: quizQuestion, correct_answer, incorrect_answers } = question;
          const options = [correct_answer, ...incorrect_answers].sort(() => Math.random() - 0.5);

          const decodedQuestion = he.decode(quizQuestion);
          const decodedOptions = options.map(option => he.decode(option));

          userAnswers.set(interaction.user.id, correct_answer);

          const buttons = decodedOptions.map((option, index) => 
            new ButtonBuilder()
              .setCustomId(`answer_${index}`)
              .setLabel(option)
              .setStyle(ButtonStyle.Primary)
          );

          const row = new ActionRowBuilder().addComponents(buttons);

          const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎉 Quiz Time! 🎉')
            .setDescription(`**Question:**\n${decodedQuestion}`)
            .setFooter({ text: 'Choose an option below:' });

          await interaction.editReply({
            embeds: [embed],
            components: [row],
          });
        } else {
          await interaction.editReply("Failed to fetch a quiz question. Please try again later.");
        }
      } else if (commandName === "leaderboard") {
        await interaction.reply({ content: "Here is the leaderboard!", ephemeral: true });
      }
    } else if (interaction.isButton()) {
      const userId = interaction.user.id;
      const correctAnswer = userAnswers.get(userId);

      if (correctAnswer) {
        const selectedOption = interaction.component.label;

        const embed = new EmbedBuilder()
          .setColor(selectedOption.toLowerCase() === correctAnswer.toLowerCase() ? 0x00ff00 : 0xff0000)
          .setTitle(selectedOption.toLowerCase() === correctAnswer.toLowerCase() ? 'Correct!' : 'Incorrect!')
          .setDescription(selectedOption.toLowerCase() === correctAnswer.toLowerCase() 
            ? "<:pepe_yes:1344583665899929640> You got it right!" 
            : `<:pepe_no:1344583683075604510> The correct answer was: **${correctAnswer}**`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
        userAnswers.delete(userId);
      } else {
        await interaction.reply({ content: "No quiz in progress or answer not provided.", ephemeral: true });
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (interaction.isRepliable()) {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN); 