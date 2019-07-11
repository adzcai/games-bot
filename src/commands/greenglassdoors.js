module.exports = {
  aliases: ['ggg'],
  desc: 'Tells if you can bring an item through the green glass doors.',
  options: {
    item: {
      desc: 'The item you want to try and bring through the Green Glass Doors',
      required: true,
    },
  },
  run: (message, args) => playGreenGlassDoors(message, args.join(' ')),
};

function playGreenGlassDoors(message, phrase) {
  if (!/[\sa-z]+/i.test(phrase)) return message.channel.send('You need to choose something to bring!').catch(global.logger.error);

  for (let i = 1; i < phrase.length; i++) if (phrase.charAt(i).toLowerCase() === phrase.charAt(i - 1).toLowerCase()) return message.channel.send(`Yes, you can bring ${phrase} through the Green Glass Doors.`).catch(global.logger.error);

  message.channel.send(`No, you cannot bring ${phrase} through the Green Glass Doors.`).catch(global.logger.error);
}
