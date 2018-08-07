module.exports = {
	run: (message) => ping(message),
	usage: (prefix) => `${prefix}ping`,
	desc: 'Returns the ping time to the bot.'
};

function ping (message) {
	message.channel.send('Pong! ' + (new Date().getTime() - message.createdTimestamp) + ' ms').catch(console.error);
}