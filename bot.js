'use strict';

const Discord = require('discord.js');
const fs = require('fs');
const auth = require('./res/auth.json');

let commands = {};
fs.readdirSync('src/commands').forEach(file => {
	let command = require(`./src/commands/${file}`);
	let cmdName = file.slice(0, -3);
	
	commands[cmdName] = command;
	if (command.aliases)
		command.aliases.forEach(alias => Object.defineProperty(commands, alias, { get: () => command }));
});

const bot = new Discord.Client();
global.bot = bot;
bot.login(auth.token);

bot.on('ready', async () => {
	console.log(`\x1B[32m${bot.user.username} is connected.\x1B[0m`);
	bot.user.setActivity('with my board games', {type: 'PLAYING'});
	global.servers = {};
	bot.guilds.forEach((guild, guildID) => {
		global.servers[guildID] = {
			games: {},
			players: {}
		};
		bot.guilds.get(guildID).members.forEach((member, memberID) => global.servers[guildID].players[memberID] = {});
	});
});

bot.on('message', async (message) => {
	if (message.author.bot) return;
	if (message.channel.type !== 'text') return;

	if (!(message.content.indexOf(auth.prefix) === 0)) return;

	let args = message.content.substring(1).split(' ');
	let cmd = args.shift();

	if (!commands.hasOwnProperty(cmd)) return message.channel.send('That is not a valid command. Please type .help to get help').catch(console.error);

	try {
		commands[cmd].run(message, args);
	} catch (err) {
		message.channel.send('Beep boop error error').catch(console.error);
		console.log(err.stack);
	}
});
