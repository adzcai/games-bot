'use strict';

// User commands

module.exports.commands = {
	showcard: {
		run: (message, args) => showCard(message, args),
		usage: (prefix) => `${prefix}showcard __val__ __suit__`,
		desc: 'shows what the __val__ of __suit__s looks like'
	}
};

function showCard(message, args) {
	let card = createCard(args[0], args[1]);
	if (!card)
		return false;
	card.show(message);
}

// Dev commands

const suits = {
	'Spades': /s[pades]?/i,
	'Hearts': /h[earts]?/i,
	'Diamonds': /d[iamonds]?/i,
	'Clubs': /c[lubs]?/i
};

const faceCards = ['A', 'K', 'Q', 'J'];

function Card(value, suit) {
	this.value = value;
	this.suit = suit;
    
	this.shortDescription = function () {
		return this.value + this.suit.charAt(0);
	};
    
	this.imageURL = 'res/cards/' + this.shortDescription() + '.jpg';
    
	this.description = function () {
		return 'The ' + this.value + ' of ' + this.suit;
	};

	this.show = function (message) {
		message.channel.send(this.description(), {file: this.imageURL}).catch(console.error);
	};
}

function createCard(value, suit) {
	if (!parseInt(value) && !faceCards.includes(value)) return false;
    
	let suitNames = Object.getOwnPropertyNames(suits);
	let cardSuit = false;
    
	Object.getOwnPropertyNames(suits).forEach(suitName => {
		if (suits[suitName].test(suit))
			cardSuit = suitNames[suitName];
	});
    
	if (!cardSuit)
		return false;
    
	return new Card(value, cardSuit);
}

// function createDeck() {
// 	let suitNames = Object.getOwnPropertyNames(suits);
// 	let deck = [];
    
// 	for (let i = 0; i < suitNames.length; i++) {
// 		for (let val = 2; val < 11; val++) {
// 			deck.push(createCard(val, suitNames[i]));
// 		}
// 		for (let face = 0; face < faceCards.length; face++) {
// 			deck.push(createCard(faceCards[face], suitNames[i]));
// 		}
// 	}
    
// 	return deck;
// }