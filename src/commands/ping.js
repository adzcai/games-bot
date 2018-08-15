module.exports = {
	run: (message) => ping(message),
	usage: (prefix) => `${prefix}ping`,
	desc: 'Returns the ping time to the bot.'
};

function ping (message) {
	message.channel.send(`Pong! ${global.bot.ping} ms`).catch(console.error);
}