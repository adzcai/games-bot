const fs = require('fs');
const RichEmbed = require('discord.js').RichEmbed;
module.exports = {
	run: (message) => sendHelp(message),
	usage: (prefix) => `${prefix}help`,
	desc: 'sends help'
};

function sendHelp (message) {
	const help = new RichEmbed()
		.setTitle('Help')
		.setDescription('If there\'s a place you got to go, I\'m the command you need to know, I\'m the help message, I\'m the help message, I\'m the help message... (To the tune of ["I\'m the Map" from Dora](https://www.youtube.com/watch?v=gRup3mJCmm4))')
		.addField('Info', 'Click [here](https://piguyinthesky.github.io/games-bot/) to visit GamesBot\'s site! (It\'s a work in progress)')
		.addField('Contribute', 'I\'m a Node.js app written using discord.js. If you want to help out, feel free to open up a pull request on my [github repo](https://github.com/piguyinthesky/games-bot)')
		.addField('Invite', 'Click [here](https://discordapp.com/oauth2/authorize?client_id=468534527573098506&permissions=8&scope=bot) to invite GamesBot to your server!');

	const prefix = require('./../../res/auth.json').prefix;
	const cmds = new RichEmbed()
		.setTitle('Commands')
		.setDescription('A list of commands this bot listens to.');

	fs.readdirSync('src/commands').forEach(cmdName => {
		const command = require(`./${cmdName}`);
		cmds.addField(`${prefix}${cmdName}`, `${command.desc}
		${command.usage ? `Usage: ${command.usage(prefix)}` : 'No usage defined yet'}`);
	});

	message.channel.send({embed: help});
	message.channel.send({embed: cmds});
}