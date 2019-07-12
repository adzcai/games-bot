module.exports = {
  desc: 'Returns the ping time to the bot.',
  run: message => message.channel.send(`Pong! ${bot.ping} ms`).catch(logger.error),
};
