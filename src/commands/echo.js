module.exports = {
	desc: 'Gets the bot to send a phrase.',
	params: {
		phrase: 'The phrase for the bot to send'
	},
	run: (message, args) => {
		if (args.length < 1) return message.channel.send('Cannot echo an empty phrase.');
		message.channel.send(args.join(' ')).catch(global.logger.error);
	}
};