const RichEmbed = require('discord.js').RichEmbed;
const commands = (require('./../internal/getCommands.js'))();
module.exports = {
	run: sendHelp,
	usage: (prefix) => `${prefix}help [__command__]`,
	desc: 'sends help'
};

function sendHelp (message, args) {
	const prefix = require('./../../res/auth.json').prefix;

	if (args.length > 0) {
		if (commands.hasOwnProperty(args[0].toLowerCase())) {
			let cmd = commands[args[0].toLowerCase()];
			let help = new RichEmbed()
				.setTitle(`${args[0].toLowerCase()} help`)
				.setDescription(cmd.desc)
				.addField('Example', cmd.usage ? cmd.usage(prefix) : 'No examples defined yet');
			return message.channel.send({embed: help}).catch(console.error);
		} else {
			return message.channel.send(`${args[0]} is not a valid command. Type .help to get a list of valid commands.`);
		}
	}

	const help = new RichEmbed()
		.setTitle('Help')
		.setDescription('If there\'s a place you got to go, I\'m the command you need to know, I\'m the help message, I\'m the help message, I\'m the help message... (To the tune of ["I\'m the Map" from Dora](https://www.youtube.com/watch?v=gRup3mJCmm4))')
		.addField('Info', 'Click [here](https://piguyinthesky.github.io/games-bot/) to visit GamesBot\'s site! (It\'s a work in progress)')
		.addField('Contribute', 'I\'m a Node.js app written using discord.js. If you want to help out, feel free to open up a pull request on my [github repo](https://github.com/piguyinthesky/games-bot)')
		.addField('Invite', 'Click [here](https://discordapp.com/oauth2/authorize?client_id=468534527573098506&permissions=8&scope=bot) to invite GamesBot to your server!');

	const cmds = new RichEmbed()
		.setTitle('Commands')
		.setDescription('A list of commands this bot listens to.');

	Object.values(commands).forEach(cmd => {
		cmds.addField(cmd.usage ? cmd.usage(prefix) : 'No examples defined yet', cmd.desc);
	});

	message.channel.send({embed: help}).catch(console.error);
	message.channel.send({embed: cmds}).catch(console.error);
}