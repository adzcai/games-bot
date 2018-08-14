'use strict';

const Game = require('./Game.js');
const internal = require('./../internal.js');

function CoupGame (id, channel) {
	Game.call(this, id, channel);
}
CoupGame.prototype = Object.create(Game.prototype);
CoupGame.constructor = CoupGame;

CoupGame.generateDeck = function (shuffle = false) {
	let deck = [];
	Object.values(CoupGame.cards).forEach(card => {
		for (let i = 0; i < 3; i++) {
			deck.push(Object.assign({}, card));
		}
	});
	return shuffle ? internal.shuffle(deck) : deck;
};

function Hand (cards) {
	this.cards = cards;
	this.randomCard = function (numCards = 1, deleteChosen) {
		let rands = [];
		for (let i = 0; i < numCards; i++)
			rands.push(
				Object.assign({},
					this.cards[Math.floor(Math.random() * Object.keys(this.cards).length)])
			);
	};
	this.topCard = () => this.cards[0];
}

function Player (id, game) {
	this.id = id;
	this.game = game;
	this.cards = this.game.courtDeck;
}

function Card (name, actionName, action) {
	this.name = name;
	this.actionName = actionName;
	this.action = () => action.call(this);
}

CoupGame.cards = {
	duke: new Card('Duke', 'Tax', function () { this.coins += 3; }),
	assassin: new Card('Assassin', 'Assassinate', function (target) { target.loseInfluence(); }),
	ambassador: new Card('Ambassador', 'Exchange', function () {this.game.courtDeck.topCard();}),
	captain: new Card('Captain', 'Steal', function (target) {target.coins -= 2; this.coins += 2;}),
	contessa: new Card('Contessa', undefined, undefined)
};