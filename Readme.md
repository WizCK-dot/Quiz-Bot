# Discord Quiz Bot

This is a Discord bot that provides a quiz game using questions from the Open Trivia Database API. Users can start a quiz and answer questions directly in Discord.

## Features

- Fetches random quiz questions from the Open Trivia Database.
- Supports multiple-choice questions.
- Provides feedback on correct and incorrect answers.
- Restricts quiz commands to specific channels.

## Prerequisites

- Node.js (version 16.6.0 or higher)
- A Discord bot token
- A `.env` file with the following variables:
  - `DISCORD_TOKEN`: Your Discord bot token.
  - `CHANNEL_ID`: Comma-separated list of channel IDs where the bot is allowed to operate.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/BJ-dev0706/discord-quiz-bot
   cd discord-quiz-bot
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Discord bot token and allowed channel IDs:
   ```
   DISCORD_TOKEN=your_discord_token
   CHANNEL_ID=channel_id1,channel_id2
   ```

4. Start the bot:
   ```bash
   node server.js
   ```

## Usage

- **Start a Quiz**: Use the `/start_quiz` command in a designated channel to begin a quiz.
- **Answer a Question**: Click on the button corresponding to your answer choice.
- **View Leaderboard**: Use the `/leaderboard` command to view the leaderboard (functionality to be implemented).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Open Trivia Database](https://opentdb.com/) for providing the quiz questions.
- [Discord.js](https://discord.js.org/) for the Discord API library.
