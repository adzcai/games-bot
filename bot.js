/*
 * This is the entry point for GamesBot, a discord bot in javascript using the discord.js library.
 * It was first created by Alexander Cai in 2017.
 * It's main purpose is to provide entertainment to discord users by allowing them to play board games directly in discord.
 * Further information, such as the GitHub repo and installation instructions are in the README.
 * Feel free to make a pull request or post any errors you find, even if it's just messy code.
 */

const { Client } = require('discord.js');
const dotenv = require('dotenv');
const commands = require('./src/internal/getCommands.js');

dotenv.load();

const prefix = process.env.DEFAULT_PREFIX || '.';

require('./src/internal/logger.js');
// require('./dbconn.js');

global.logger.info('Initializing client');
const bot = new Client();
global.bot = bot;

// From the discord.js docs: "Emitted when the client becomes ready to start working."
bot.on('ready', () => {
  global.logger.info(`${bot.user.username} is connected.`);
  bot.user.setActivity('with my board games', { type: 'PLAYING' });

  /*
	 * Initializes the non-permanent servers, where data about games are stored.
	 * The hierarchy of data looks like this (example):
	 * 			              servers
	 * 	    /-------------------^  ^--------------------\
	 *  games: {0: object Game, 1: object Game}      players: {user ID: [0, 2]}
	 *           \                                                      /
	 *            \----------------------------------------------------/
	 */
  global.servers = {};
  bot.guilds.forEach((guild, guildID) => {
    global.servers[guildID] = {
      games: {},
      players: {},
    };

    // dbconn.initTable(guildID);

    bot.guilds.get(guildID).members.forEach((member, playerID) => {
      global.servers[guildID].players[playerID] = {};
      // dbconn.initPlayer(guildID, playerID);
    });
  });
});

/*
 * The main command for handling messages. If the message starts with the prefix for the bot on the server,
 * it will run the command they type
 */
let args; let
  cmd;
bot.on('message', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== 'text') return;

  if (!(message.content.indexOf(prefix) === 0)) return;

  args = message.content.substring(1).split(' ');
  cmd = args.shift();

  if (!commands.hasOwnProperty(cmd)) return message.channel.send('That is not a valid command. Please type .help to get help').catch(global.logger.error);
  try {
    global.logger.info(`message responded from user ${message.author.username}. Content: "${message.content}"`);
    commands[cmd].run(message, args);
  } catch (err) {
    message.channel.send('Beep boop error error').catch(global.logger.error);
    global.logger.error(err.stack);
  }
});

function pruneEndedGames() {
  Object.values(global.servers).forEach((server) => {
    for (const gameID of Object.getOwnPropertyNames(server.games)) if (server.games[gameID].status === 'ended') delete server[gameID];
  });
}

bot.login(process.env.BOT_TOKEN);
const handle = setInterval(pruneEndedGames, 5 * 60 * 1000);

/*
 * This exit handler simply makes sure the program terminates gracefully when
 * it is killed, nodemon restarts, or an error occurs.
 */
const exitHandler = function (exitCode) {
  // global.dbconn.end((err) => {
  //   if (err) throw err;
  //   global.logger.info('Mysql connection ended');
  // });

  clearInterval(handle);
  global.logger.info('Interval cleared');
  if (exitCode !== undefined) global.logger.info(exitCode);
  process.exit();
};

process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
