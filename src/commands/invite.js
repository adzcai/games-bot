const { RichEmbed } = require('discord.js');

module.exports = {
  desc: 'Invite GamesBot to your server!',
  run(message, args) {
    const embed = new RichEmbed()
      .setTitle('Invite GamesBot to your server!')
      .setDescription('Click [here](https://discordapp.com/oauth2/authorize?client_id=468534527573098506&permissions=8&scope=bot) to invite GamesBot to your server!');
    message.channel.send(embed);
  }
}