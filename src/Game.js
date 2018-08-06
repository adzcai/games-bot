'use strict';

module.exports = Game;

function Game(id, channel) {
	this.id = id;
	this.channel = channel;
	this.players = {};
	this.status = 'beginning';
}

Game.prototype.addPlayer = function (id, symbol) {
	this.players[id] = {id: id, symbol: symbol};
};
