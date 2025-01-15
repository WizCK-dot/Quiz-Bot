
# Discord IP Tracking Bot

This repository contains a Discord bot built with `discord.js` and Express. It tracks IP addresses and sends notifications to a specified Discord user and channel using the IPQualityScore (IPQS) API.

## Features

- Fetches IP information using the IPQS API.
- Sends detailed IP information to a Discord user and channel.
- Detects suspicious IP activity (VPN, proxy, Tor, etc.).
- Includes a button to view the IP's location on Google Maps.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.9.0 or newer is required to use Discord.js v14).
- A Discord bot token. [Create a bot](https://discord.com/developers/applications).
- An IPQS API key. [Sign up for IPQualityScore](https://www.ipqualityscore.com/).
- A `.env` file with the following environment variables:

```env
DISCORD_TOKEN=your_discord_bot_token
IPQS_API_KEY=your_ipqs_api_key
USER_ID=discord_user_id_to_notify
CHANNEL_ID=discord_channel_id_to_notify
PORT=optional_port_for_express_server (default is 5050)
```

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/BJ-dev0706/IP-notification-discord_bot.git
   cd IP-notification-discord_bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project and add your environment variables:

   ```env
   DISCORD_TOKEN=your_discord_bot_token
   IPQS_API_KEY=your_ipqs_api_key
   USER_ID=discord_user_id_to_notify
   CHANNEL_ID=discord_channel_id_to_notify
   PORT=optional_port_for_express_server (default is 5050)
   ```

## Usage

1. Start the bot:

   ```bash
   npm start
   ```

2. Make a POST request to the `/track_ip` endpoint with the following JSON payload:

   ```json
   {
     "ip": "8.8.8.8"
   }
   ```

   Replace `8.8.8.8` with the IP address you want to track.

3. The bot will send notifications to the specified Discord user and channel.

## Example Notification

### Direct Message to User
- IP Address: 8.8.8.8
- Region: California
- Country: US
- VPN/Proxy/Tor/Bot: No
- View Location: [Google Maps Link](https://www.google.com/maps/search/?api=1&query=latitude,longitude)

### Channel Message
Similar to the DM notification, with an embed formatted for the channel.

## Contributing

Feel free to open issues or submit pull requests for improvements and bug fixes. Contributions are welcome!

## License

This project is licensed under the [MIT License](LICENSE).

---

### Disclaimer

This bot is for educational purposes only. Always respect privacy and use responsibly.
