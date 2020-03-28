const incScore = require('../util/incScore');

module.exports = {
  desc: 'Give your points to someone else',
  options: {
    '@player': {
      desc: 'The player to give points to',
      required: true,
    },
  },
  run(message, args) {
    const p2 = message.mentions.users.first();
    if (!p2) return message.reply('Please ping someone to give points to!');
    debug(args);
    const amt = parseInt(args[1], 10);
    if (!amt) return message.reply('Please enter a positive number!');
    return incScore(message.author.id, message.guild.id, -amt, (err) => {
      if (err) return message.reply('Oops, an error occurred!');
      return incScore(p2.id, message.guild.id, amt, (e) => {
        if (e) message.reply('Oops, an error occurred!');
        else message.reply(`You just gave ${p2} ${amt} point(s)!`);
      });
    });
  },
};
