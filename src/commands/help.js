const RichEmbed = require('discord.js').RichEmbed;

module.exports = {
  desc: 'sends help',
  options: {
    command: {
      desc: 'The command to get help on.',
      noflag: true
    }
  },
  run: sendHelp
};

function sendHelp(message, args) {
  const prefix = process.env.DEFAULT_PREFIX;
  // Required here so that help itself gets loaded
  const commands = require('../internal/getCommands.js');

  if (args.length > 0) {
    if (commands.hasOwnProperty(args[0])) {
      let cmd = commands[args[0]];
      let help = new RichEmbed()
        .setTitle(`${args[0]}`)
        .setDescription(cmd.desc)
        .addField('Example', prefix + cmd.usage);
			
      let options = [];
      if (cmd.options) {
        let optionData;
        for (let option of Object.keys(cmd.options)) {
          optionData = cmd.options[option];
          if (optionData.required || optionData.noflag) options.push(`__${option}__\n  - ${optionData.desc}`);
          else options.push(`**-${optionData.short}**${option.flag ? '' : `__${option}__`}\n  - ${optionData.desc}`);
        }
      }
      if (options.length > 0)
        help.addField('Options', options);
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
		The values within the [brackets] are optional.`);
	
  Object.values(commands).forEach(cmd => cmds.addField(prefix + cmd.usage, cmd.desc));

  message.channel.send({embed: help}).catch(global.logger.error);
  message.channel.send({embed: cmds}).catch(global.logger.error);
}