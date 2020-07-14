/*
 * This is the entry point for GamesBot, a discord bot in javascript using the discord.js library.
 * It was first created by Alexander Cai in 2017.
 * Its main purpose is to provide entertainment to discord users by allowing them to play board
 * games directly in Discord.
 * Further information, such as the GitHub repo and installation instructions are in the README.
 * Feel free to make a pull request or post any errors you find, even if it's just messy code.
 */

require('dotenv').config();
const debug = require('debug')('games-bot:bot');
const { Client, Collection } = require('discord.js');
const commands = require('./src/util/getCommands');

const prefix = process.env.DEFAULT_PREFIX || '.';

debug('Initializing client');

const bot = new Client();
bot.commands = new Collection();
bot.games = new Collection();
bot.dicecloudUsers = new Collection();

Object.keys(commands).forEach((cmd) => {
  bot.commands.set(cmd, commands[cmd]);
  if (commands[cmd].aliases) {
    commands[cmd].aliases.forEach((alias) => {
      bot.commands.set(alias, Object.assign({}, commands[cmd], { isAlias: true }));
    });
  }
});

// From the discord.js docs: "Emitted when the client becomes ready to start working."
bot.on('ready', () => {
  debug(`${bot.user.username} is connected.`);
  bot.user.setActivity('with my board games', { type: 'PLAYING' });
});

/**
 * The main command for handling messages. If the message starts with the prefix for the bot on the
 * server, it will run the command they type.
 */
let args, cmd;
bot.on('message', (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== 'text') return;

  if (message.content.indexOf(prefix) !== 0) return;

  args = message.content.substring(1).split(' ');
  cmd = args.shift();

  if (!bot.commands.has(cmd)) {
    message.channel.send('That is not a valid command. Please type .help to get help');
    return;
  }

  try {
    debug(`message responded from user ${message.author.username}. Content: "${message.content}"`);
    bot.commands.get(cmd).run(message, args);
  } catch (err) {
    message.channel.send(`\`\`\`diff\n- BEEP BOOP ERROR ERROR -\n\`\`\`\n\`\`\`${err}\`\`\``);
    debug(err);
  }
});

bot.login(process.env.BOT_TOKEN);
