'use strict';

const Discord = require('discord.js');
const auth = require('./res/auth.json');
const commands = require('./src/internal.js').getCommands();

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

	commands[cmd].run(message, args);
});
