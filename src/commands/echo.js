module.exports = {
	usage: (prefix) => `${prefix}echo __phrase__`,
	desc: 'Gets the bot to send __phrase__.', 
	run: (message, args) => {
		if (args.length < 1) throw new Error('Cannot echo empty phrase.');
		message.channel.send(args.join(' ')).catch(console.error);
	}
};