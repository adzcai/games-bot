const emojis = {
  Artificer: '🛠',
  Barbarian: '✊',
  Bard: '🎷',
  Cleric: '🙏',
  Druid: '🐻',
  Fighter: '⚔',
  Monk: '🥋',
  Paladin: '🛡',
  Ranger: '🏹',
  Rogue: '🕵',
  Sorcerer: '🐉',
  Warlock: '😈',
  Wizard: '🔮',
};

module.exports = {
  desc: 'Send a message with a reaction for each class',
  async run(message) {
    let msg = 'React to the emoji corresponding with the class you want to play!';
    msg += Object.keys(emojis).map(cls => `\n${cls}: ${emojis[cls]}`);
    const sent = await message.channel.send(msg);
    for (const emoji of Object.values(emojis)) {
      await sent.react(emoji);
    }
  },
};
