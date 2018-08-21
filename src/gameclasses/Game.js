'use strict';

module.exports = Game;

function Game(id, channel, type) {
	this.id = id;
	this.channel = channel;
	this.type = type;
	this.server = global.servers[this.channel.guild.id];
	this.players = {};
	this.status = 'beginning';
}

Game.prototype.addPlayer = function (id, otherProperties) {
	this.players[id] = {
		id: id,
		game: this,
		user: global.bot.users.get(id)
	};
	Object.assign(this.players[id], otherProperties);
	this.server.players[id][this.type] = this.id;
};

Game.prototype.sendCollectorEndedMessage = function (reason) {
	this.channel.send(`Collector ended. ${reason ? `Reason: ${reason}. ` : ''}Type ".${this.command} cancel" to cancel this game and then type .${this.command} to start a new one.`).catch(global.logger.error);
};

Game.prototype.resetReactions = async function (msg = this.boardMessage, reactions = Object.keys(this.reactions)) {
	await msg.clearReactions().catch(global.logger.error);
	for (let emoji = 0; emoji < Object.keys(this.reactions).length; emoji++)
		await msg.react(reactions[emoji]);
};

Game.prototype.areReactionsReset = function (msg, reactions = Object.keys(this.reactions)) {
	const reactedEmojis = msg.reactions.map(re => re.emoji.name);
	return (reactions.every(emoji => reactedEmojis.includes(emoji)));
};