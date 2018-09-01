const RichEmbed = require('discord.js').RichEmbed;

module.exports = {
	desc: 'sends help',
	options: {
		command: {
			desc: 'The command to get help on.',
			arg: 'cmd',
			noflag: true
		}
	},
	run: sendHelp
};

// Called after because help itself wasn't getting loaded into the function
const commands = require('../internal/getCommands.js')();

function sendHelp(message, args) {
	const prefix = process.env.DEFAULT_PREFIX;

	if (args.length > 0) {
		if (commands.hasOwnProperty(args[0])) {
			let cmd = commands[args[0]];
			let help = new RichEmbed()
				.setTitle(`${args[0]} help`)
				.setDescription(cmd.desc)
				.addField('Example', cmd.usage ? `${prefix}${cmd.usage}` : 'No examples defined yet');
			return message.channel.send({embed: help}).catch(global.logger.error);
		} else {
			return message.channel.send(`${args[0]} is not a valid command. Type .help to get a list of valid commands.`).catch(global.logger.error);
		}
	}

	const help = new RichEmbed()
		.setTitle('Help')
		.setDescription('Hi, I\'m the Games Bot! Are you having a fun time?')
		.addField('Info', 'Click [here](https://piguyinthesky.github.io/games-bot/) to visit GamesBot\'s site! \
		(It\'s a work in progress)')
		.addField('Contribute', 'I\'m a Node.js app written using discord.js. If you want to help out, \
		feel free to open up a pull request on my [github repo](https://github.com/piguyinthesky/games-bot)')
		.addField('Invite', 'Click [here](https://discordapp.com/oauth2/authorize?client_id=468534527573098506&permissions=8&scope=bot) \
		to invite GamesBot to your server!');

	const cmds = new RichEmbed()
		.setTitle('Commands')
		.setDescription(`A list of commands this bot listens to. Type ${prefix}help [__command__] for more info on a given command. \
		The values within the brackets are optional.`);

	Object.values(commands).forEach(cmd => {
		cmds.addField(cmd.usage ? `${prefix}${cmd.usage}` : 'No examples defined yet', cmd.desc);
	});

	message.channel.send({embed: help}).catch(global.logger.error);
	message.channel.send({embed: cmds}).catch(global.logger.error);
}