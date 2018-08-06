'use strict';

// Node modules
const internal = require('./internal.js');
const RichEmbed = require('discord.js').RichEmbed;

// User commands
module.exports.commands = {
	echo: {
		run: (message, args) => echo(message, args),
		usage: (prefix) => `${prefix}echo __phrase__`,
		desc: 'Gets the bot to send __phrase__.'
	},
	help: {
		run: (message) => sendHelp(message),
		usage: (prefix) => `${prefix}help`,
		desc: 'sends help'
	},
	ping: {
		run: (message) => ping(message),
		usage: (prefix) => `${prefix}ping`,
		desc: 'Returns the ping time to the bot.'
	},
	sayHi: {
		run: (message, args) => sayHi(message, args),
		usage: (prefix) => `${prefix}sayHi [**-l** __language__]`,
		desc: 'Says hello!',
		options: {'**-l, --language**': 'Says hi in the specified __language__.'}
	}
};

function echo (message, args) {
	message.channel.send(args.join(' ')).catch(console.error);
}

function ping (message) {
	message.channel.send('Pong! ' + (new Date().getTime() - message.createdTimestamp) + ' ms').catch(console.error);
}

function sayHi (message, args) {
	const languages = {
		'Portuguese': 'Olá',
		'Latin': 'Salve',
		'Dutch': 'Hallo',
		'Hawaiian': 'Aloha',
		'Chinese': '你好',
		'German': 'Hallo',
		'Spanish': '¡Hola',
		'Japanese': 'こんにちは',
		'French': 'Bonjour',
		'Greek': 'Χαίρετε',
		'Hindi': 'नमस्ते',
		'Hebrew': 'שלום',
		'Russian': 'Здравствуйте',
		'Korean': '여보세요',
		'Thai': 'สวัสดี',
		'English': 'Hello',
		'Italian': 'Ciao'
	};
	let lang;
	if (args[0])
		lang = args[0].charAt(0).toUpperCase() + args[0].slice(1);
	else
		lang = Object.keys(languages)[Math.floor(Math.random() * Object.keys(languages).length)];
	message.channel.send(`${languages[lang]}! (${lang})`).catch(console.error);
}


function sendHelp (message) {
	const help = new RichEmbed()
		.setTitle('Help')
		.setDescription('If there\'s a place you got to go, I\'m the command you need to know, I\'m the help message, I\'m the help message, I\'m the help message... (To the tune of ["I\'m the Map" from Dora](https://www.youtube.com/watch?v=gRup3mJCmm4))')
		.addField('Info', 'Click [here](https://piguyinthesky.github.io/games-bot/) to visit GamesBot\'s site! (It\'s a work in progress)')
		.addField('Contribute', 'I\'m a Node.js app written using discord.js. If you want to help out, feel free to open up a pull request on my [github repo](https://github.com/piguyinthesky/games-bot)')
		.addField('Invite', 'Click [here](https://discordapp.com/oauth2/authorize?client_id=468534527573098506&permissions=8&scope=bot) to invite GamesBot to your server!');

	const prefix = require('./../res/auth.json').prefix;
	const cmds = new RichEmbed()
		.setTitle('Commands')
		.setDescription('A list of commands this bot listens to.');
	const commands = internal.getCommands();
	Object.keys(commands).forEach(cmdName => {
		cmds.addField(`${prefix}${cmdName}`, `${commands[cmdName].desc}
		${commands[cmdName].usage ? `Usage: ${commands[cmdName].usage(prefix)}` : 'No usage defined yet'}`);
	});

	message.channel.send({embed: help});
	message.channel.send({embed: cmds});
}
