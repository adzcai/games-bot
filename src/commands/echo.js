module.exports = {
    run: (message, args) => echo(message, args),
    usage: (prefix) => `${prefix}echo __phrase__`,
    desc: 'Gets the bot to send __phrase__.'
}

function echo (message, args) {
	message.channel.send(args.join(' ')).catch(console.error);
}