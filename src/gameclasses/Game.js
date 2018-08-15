'use strict';

module.exports = Game;

function Game(id, channel) {
	this.id = id;
	this.channel = channel;
	this.players = {};
	this.status = 'beginning';
}

Game.prototype.addPlayer = function (id) {
	this.players[id] = {
		id: id,
		game: this,
		user: global.bot.users.get(id)
	};
};

Game.prototype.sendCollectorEndedMessage = function (reason) {
	this.channel.send(`Collector ended. Reason: ${reason}. Type "cancel" to cancel this game and then type .${this.command} to start a new one.`).catch(console.error);
};

Game.prototype.resetReactions = async function (msg = this.boardMessage, reactions = Object.keys(this.reactions)) {
	await msg.clearReactions().catch(console.error);
	for (let emoji = 0; emoji < Object.keys(this.reactions).length; emoji++)
		await msg.react(reactions[emoji]);
};

Game.prototype.areReactionsReset = function (msg, reactions = Object.keys(this.reactions)) {
	const reactedEmojis = msg.reactions.map(re => re.emoji.name);
	return (reactions.every(emoji => reactedEmojis.includes(emoji)));
};