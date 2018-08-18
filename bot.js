'use strict';

/*
This is the entry point for GamesBot, a discord bot in javascript using the discord.js library.
It was first created by Alexander Cai in 2017.
It's main purpose is to provide entertainment to discord users by allowing them to play board games directly in discord.
Further information, such as the GitHub repo and installation instructions are in the README.
Feel free to make a pull request or post any errors you find, even if it's just messy code.
*/

// Importing required modules
const Discord = require('discord.js');
const mysql = require('mysql');
const auth = require('./res/auth.json');
const commands = (require('./src/internal/getCommands.js'))();

console.log('Initializing client');
const bot = new Discord.Client();
global.bot = bot;

bot.on('ready', () => {
	console.log(`${bot.user.username} is connected.`);
	bot.user.setActivity('with my board games', {type: 'PLAYING'});
	global.servers = {};
	bot.guilds.forEach((guild, guildID) => {
		global.servers[guildID] = {
			games: {},
			players: {}
		};
		bot.guilds.get(guildID).members.forEach((member, memberID) => {
			global.servers[guildID].players[memberID] = {};
			let sql = `INSERT IGNORE INTO players (userID, serverID) VALUES (${memberID}, ${guildID})`;
			global.dbconn.query(sql, err => {
				if (err) throw err;
				console.log(`(${memberID}, ${guildID}) successfully inserted into players`);
			});
		});
	});
});

bot.on('message', async (message) => {
	if (message.author.bot) return;
	if (message.channel.type !== 'text') return;

	if (!(message.content.indexOf(auth.prefix) === 0)) return;

	let args = message.content.substring(1).split(' ');
	let cmd = args.shift();

	if (!commands.hasOwnProperty(cmd))
		return message.channel.send('That is not a valid command. Please type .help to get help').catch(console.error);

	try {
		commands[cmd].run(message, args);
	} catch (err) {
		message.channel.send('Beep boop error error').catch(console.error);
		console.error(err.stack);
	}
});

const dbconn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: auth.mysqlpw,
	database: 'gamesbot'
});
global.dbconn = dbconn;
dbconn.connect(err => {
	if (err) throw err;
	console.log('Connected to database');
});

bot.login(auth.token);

let exitHandler = function (exitCode) {
	dbconn.end((err) => {
		if (err) throw err;
		console.log('Mysql connection ended');
		if (exitCode || exitCode === 0) console.log(exitCode);
		process.exit();
	});
};

process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
