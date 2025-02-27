require("dotenv").config();
const he = require('he');
const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const connectToDatabase = require('./src/database');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const allowedChannelIds = process.env.CHANNEL_ID;
const QUIZ_INTERVAL = 5 * 60 * 1000;
const QUIZ_DURATION = 4 * 60 * 1000;

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await connectToDatabase();

  const channel = client.channels.cache.get(allowedChannelIds);
  if (!channel) {
    console.error("Channel not found or bot does not have access.");
  } else {
    setInterval(() => {
      postQuizQuestion(channel);
    }, QUIZ_INTERVAL);
  }

  client.user.setPresence({
    activities: [{ name: 'with quizzes', type: 'PLAYING' }],
    status: 'online',
  });
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
      await interaction.reply({ content: "This command can only be used in specific channels.", flags: 64 });
      return;
    }

    if (interaction.isCommand()) {
      await handleCommandInteraction(interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (interaction.isRepliable()) {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
    }
  }
});

const handleCommandInteraction = async (interaction) => {
  const { commandName } = interaction;

  if (commandName === "start_quiz") {
    await startQuiz(interaction);
  } else if (commandName === "leaderboard") {
    await showLeaderboard(interaction);
  }
};

const startQuiz = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const question = await fetchQuizQuestion();
  if (question) {
    const { question: quizQuestion, correct_answer, incorrect_answers } = question;
    const options = [correct_answer, ...incorrect_answers].sort(() => Math.random() - 0.5);

    const decodedQuestion = he.decode(quizQuestion);
    const decodedOptions = options.map(option => he.decode(option));

    console.log(`Storing correct answer for user ${interaction.user.id}: ${correct_answer}`);
    userAnswers.set(interaction.user.id, correct_answer);

    const buttons = createOptionButtons(decodedOptions);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🎉 Quiz Time! 🎉')
      .setDescription(`**Question:**\n${decodedQuestion}`)
      .setFooter({ text: 'Choose an option below:' });

    await interaction.editReply({
      embeds: [embed],
      components: [buttons],
    });

    logQuizStart(interaction);
  } else {
    await interaction.editReply("Failed to fetch a quiz question. Please try again later.");
  }
};

const showLeaderboard = async (interaction) => {
  const db = await connectToDatabase();
  const collection = db.collection('userScores');
  const topUsers = await collection.find().sort({ score: -1 }).limit(10).toArray();

  const leaderboard = topUsers.map((user, index) => {
    const correctAnswers = user.attempts.filter(attempt => attempt.isCorrect).length;
    const totalAttempts = user.attempts.length;
    return `${index + 1}. <@${user.userId}> - ${user.score} points (${correctAnswers}/${totalAttempts} correct)`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('🏆 Leaderboard 🏆')
    .setDescription(leaderboard || 'No scores yet.');

  await interaction.reply({ embeds: [embed], flags: 64 });
};

const handleButtonInteraction = async (interaction) => {
  const userId = interaction.user.id;
  const correctAnswer = userAnswers.get(userId);

  console.log(`Retrieved answer for user ${userId}: ${correctAnswer}`);

  if (correctAnswer) {
    const selectedOption = interaction.component.label;
    const isCorrect = selectedOption.toLowerCase() === correctAnswer.toLowerCase();

    const embed = new EmbedBuilder()
      .setColor(isCorrect ? 0x00ff00 : 0xff0000)
      .setTitle(isCorrect ? 'Correct!' : 'Incorrect!')
      .setDescription(isCorrect 
        ? "<:pepe_yes:1344583665899929640> You got it right!" 
        : `<:pepe_no:1344583683075604510> The correct answer was: **${correctAnswer}**`);

    await interaction.reply({ embeds: [embed], flags: 64 });

    const db = await connectToDatabase();
    const collection = db.collection('userScores');
    await collection.updateOne(
      { userId },
      {
        $inc: { score: isCorrect ? 1 : 0 },
        $push: { attempts: { isCorrect, timestamp: new Date() } }
      },
      { upsert: true }
    );

    userAnswers.delete(userId);
  } else {
    await interaction.reply({ content: "No quiz in progress or answer not provided.", flags: 64 });
  }
};

const postQuizQuestion = async (channel) => {
  const question = await fetchQuizQuestion();
  if (question) {
    const { question: quizQuestion, correct_answer, incorrect_answers } = question;
    const options = [correct_answer, ...incorrect_answers].sort(() => Math.random() - 0.5);

    const decodedQuestion = he.decode(quizQuestion);
    const decodedOptions = options.map(option => he.decode(option));

    const buttons = createOptionButtons(decodedOptions);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🎉 Quiz Time! 🎉')
      .setDescription(`**Question:**\n${decodedQuestion}`)
      .setFooter({ text: 'Choose an option below:' });

    const message = await channel.send({
      embeds: [embed],
      components: [buttons],
    });

    const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: QUIZ_DURATION });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        buttons.map(button => {
          if (button.label === correct_answer) {
            return button.setStyle(ButtonStyle.Success).setDisabled(true);
          }
          return button.setDisabled(true);
        })
      );
      await message.edit({ components: [disabledRow] });
    });
  } else {
    console.error("Failed to fetch a quiz question.");
  }
};

const createOptionButtons = (options) => {
  return new ActionRowBuilder().addComponents(
    options.map((option, index) => 
      new ButtonBuilder()
        .setCustomId(`answer_${index}`)
        .setLabel(option)
        .setStyle(ButtonStyle.Primary)
    )
  );
};

const logQuizStart = (interaction) => {
  const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);
  if (logChannel) {
    logChannel.send(`${interaction.user.tag} started a quiz!`);
  }
};

client.login(process.env.DISCORD_TOKEN); 