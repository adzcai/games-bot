'use strict';

const Game = require('./Game.js');
const shuffle = require('../internal/shuffle.js');

function CoupGame (id, channel) {
	Game.call(this, id, channel);
}
CoupGame.prototype = Object.create(Game.prototype);
CoupGame.constructor = CoupGame;

CoupGame.prototype.start = function (settings) {
	this.players = {};
	this.deck = createCourtDeck();
	for (let i = 0; i < settings.players.length; i++) {
		this.players[settings.playerIDs[i]] = new Player(settings.playerIDs[i], this)
	}
}

CoupGame.prototype.topCard = function (deleteAfter) {
	return deleteAfter ? (delete this.cards(0)) : this.cards[0];
}

function createCourtDeck () {
	deck = [];
	Object.values(CoupGame.cards).forEach(card => {
		for (let i = 0; i < 3; i++)
			deck.push(Object.assign({}, card));
	});
	return shuffle(deck);
};

function Player (id, game) {
	this.id = id;
	this.game = game;
	this.cards = [this.game.topCard(true), this.game.topCard(true)];
	this.coins = 2;
}

function Card (name, action, counterAction) {
	this.name = name;
	this.action = (player, target) => action.call(player, target);
	this.counterAction = () => counterAction.call(this);
}

CoupGame.actions = {
	Income: function () {
		this.coins += 1;
	},
	'Foreign Aid': function () {
		this.coins += 2;
	},
	Coup: function (target) {
		target.loseInfluence();
	},
	Tax: function () {
		this.coins += 3;
	},
	Assassinate: function (target) {
		target.loseInfluence();
	},
	Exchange: function () {
		this.game.courtDeck.topCard();
	},
	Steal: function (target) {
		target.coins -= 2;
		this.coins += 2;
	},
};

CoupGame.cards = {
	Duke: new Card('Duke', CoupGame.actions.Tax, 'Foreign Aid'),
	Assassin: new Card('Assassin', CoupGame.actions.Assassinate, undefined),
	Ambassador: new Card('Ambassador', CoupGame.actions.Exchange, 'Steal'),
	Captain: new Card('Captain', CoupGame.actions.Steal, 'Steal'),
	Contessa: new Card('Contessa', undefined, 'Assassinate')
};