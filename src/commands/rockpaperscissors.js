

const reactions = {
  '🇷': 0,
  '🇵': 1,
  '🇸': 2,
};

const words = ['Rock', 'Paper', 'Scissors'];

const results = [
  // Rock Paper Scissors
  [0, 1, -1], // Rock
  [-1, 0, 1], // Paper
  [1, -1, 0], // Scissors
];

module.exports = {
  aliases: ['rps'],
  desc: 'Plays rock paper scissors',
  async run(message) {
    if (message.mentions.members.size < 1) {
      message.channel.send('Please ping someone to challenge them to tic tac toe!');
      return;
    }
    message.channel.send('Wait for a DM to tell me your choice!').catch(logger.error);
    const players = [message.author, message.mentions.users.first()];

    Promise.all(players.map(async (player) => {
      if (player.id === bot.id) {
        return Object.values(reactions)[Math.floor(Math.random() * 3)];
      }

      const msg = await player.send('Would you like to show 🇷ock, 🇵aper, or 🇸cissors?').catch(logger.error);
      // eslint-disable-next-line no-restricted-syntax
      for (const r of Object.keys(reactions)) {
        // eslint-disable-next-line no-await-in-loop
        await msg.react(r);
      }

      const collected = await msg.awaitReactions((r, user) => ['🇷', '🇵', '🇸'].includes(r.emoji.name) && user.id === player.id, { maxUsers: 1, time: 60 * 1000 }).catch(logger.error);
      if (collected.size < 1) {
        return message.channel.send('The collector timed out. Please play again!').catch(logger.error);
      }

      player.send(`You chose ${collected.first().emoji.name}.`);
      return reactions[collected.first().emoji.name];
    })).then((val) => {
      let result = '';
      [0, 1].forEach((ind) => {
        result += `${players[ind]} chose ${words[val[ind]]}\n`;
      });
      const p1won = results[val[0]][val[1]];
      result += p1won ? `${(p1won === 1 ? players[0] : players[1])} won. GG!` : 'It was a draw. GG!';
      return message.channel.send(result).catch(logger.error);
    });
  },
};
