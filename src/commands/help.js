const { RichEmbed } = require('discord.js');

module.exports = {
  desc: 'sends help',
  options: {
    command: {
      desc: 'The command to get help on.',
      noflag: true,
    },
  },
  run(message, args) {
    const prefix = process.env.DEFAULT_PREFIX || '.';
    // Required here so that help itself gets loaded

    if (args.length > 0) {
      if (bot.commands.has(args[0])) {
        const cmd = bot.commands.get(args[0]);
        const help = new RichEmbed()
          .setTitle(`${args[0]}`)
          .setDescription(cmd.desc)
          .addField('Example', prefix + cmd.usage);

        const options = [];
        if (cmd.options) {
          let optionData;
          Object.keys(cmd.options).forEach((option) => {
            optionData = cmd.options[option];
            if (optionData.required || optionData.noflag) options.push(`__${option}__\n  - ${optionData.desc}`);
            else options.push(`**-${optionData.short}**${option.flag ? '' : `__${option}__`}\n  - ${optionData.desc}`);
          });
        }
        if (options.length > 0) help.addField('Options', options);
        return message.channel.send({ embed: help });
      }
      return message.channel.send(`${args[0]} is not a valid command. Type .help to get a list of valid commands.`);
    }

    // The permissions that the bot has are: View Channels, Send Messages, Manage Messages,
    // Embed Links, Read Message History, Add Reactions
    const help = new RichEmbed()
      .setTitle('Help')
      .setDescription('Hi, I\'m the Games Bot! Are you having a fun time?')
      .addField('Info', 'Click [here](https://piguyinthesky.github.io/games-bot/) to visit GamesBot\'s site! (It\'s a work in progress)')
      .addField('Contribute', 'I\'m a Node.js app written using discord.js. If you want to help out, feel free to open up a pull request on my [github repo](https://github.com/piguyinthesky/games-bot)')
      .addField('Invite', 'Click [here](https://discordapp.com/oauth2/authorize?client_id=468534527573098506&permissions=93248&scope=bot) to invite GamesBot to your server!');

    const cmds = new RichEmbed()
      .setTitle('Commands')
      .setDescription(`A list of commands this bot listens to. Type ${prefix}help [__command__] for more info on a given command. The values within the [brackets] are optional.`);

    bot.commands
      .filter(cmd => !cmd.isAlias)
      .forEach(cmd => cmds.addField(prefix + cmd.usage, cmd.desc));

    message.channel.send({ embed: help });
    return message.channel.send({ embed: cmds });
  },
};
