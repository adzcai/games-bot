module.exports = {
	desc: 'Returns the ping time to the bot.',
	run: (message) => message.channel.send(`Pong! ${global.bot.ping} ms`).catch(global.logger.error)
};