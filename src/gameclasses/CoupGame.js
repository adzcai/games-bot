'use strict';

const RichEmbed = require('discord.js').RichEmbed;
const Game = require('./Game.js');
const shuffle = require('../internal/shuffle.js');

module.exports = {
  cmd: 'coup',
  desc: 'Plays coup',
  gameClass: CoupGame
};

function CoupGame (id, channel) {
  Game.call(this, id, channel, 'coup');
}
CoupGame.prototype = Object.create(Game.prototype);
CoupGame.constructor = CoupGame;

CoupGame.prototype.start = function (settings) {
  this.players = {};
  this.deck = createCourtDeck();
  for (let i = 0; i < settings.players.length; i++) {
    this.addPlayer(settings.players[i]);
    settings.players[i].cards = [this.game.topCard(true), this.game.topCard(true)];
    settings.players[i].coins = 2;
  }
  promptMove(this.players[0]);
};

CoupGame.prototype.topCard = function (deleteAfter) {
  return deleteAfter ? (delete this.cards(0)) : this.cards[0];
};

function createCourtDeck () {
  let deck = [];
  Object.values(CoupGame.cards).forEach(card => {
    for (let i = 0; i < 3; i++)
      deck.push(Object.assign({}, card));
  });
  return shuffle(deck);
}

function promptMove (player) {
  let user = global.bot.users.get(player.id);
  let options = 'Which action would you like to take?';
  for (let i = 0; i < Object.keys(CoupGame.actions).length; i++)
    options += `[${i+1}] ${Object.keys(CoupGame.actions)[i]} (${Object.values(CoupGame.actions)[i].effect})\n`;

  const embed = new RichEmbed()
    .setTitle('It\'s your turn!')
    .setDescription(options);

  user.send({embed: embed});
  const collector = user.dmChannel.createMessageCollector(m => /^[1-7]$/.test(m.content));
  collector.on('collect', m => {
    let action = Object.values(CoupGame.actions)[parseInt(m) - 1];
    player.game.channel.send(`${player.user} is using ${action.name}. Type 'challenge' if you would like to challenge them.`).catch(global.logger.error);
  });
}

function Card (name, action, counterAction) {
  this.name = name;
  this.action = (player, target) => action.call(player, target);
  this.counterAction = (player) => counterAction.call(player);
}

function Action(name, effect, use, blockedBy, challengeable, cost) {
  this.name = name;
  this.effect = effect;
  this.use = (player, target) => use.call(player, target);
  this.blockedBy = blockedBy;
  this.challengeable = challengeable;
  this.cost = cost;
}

CoupGame.actions = {
  Income: new Action('Income', 'Take 1 coin. Cannot be blocked or challenged.', function () { this.coins += 1; }, [], false, 0),
  'Foreign Aid': new Action('Foreign Aid', 'Take 2 coins. Cannot be challenged. Can be blocked by player claiming Duke.', function () { this.coins += 2; }, ['Duke'], false, 0),
  Coup: new Action('Coup', 'Pay 7 coins, choose player to lose Influence. Cannot be blocked or challenged.', function (target) { target.loseInfluence(); }, [], false, 7),
  Tax: new Action('Tax', 'Take 3 coins. Cannot be blocked.', function () { this.coins += 3; }, [], true, 0),
  Assassinate: new Action('Assassinate', 'Pay 3 coins, choose player to lose Influence. Can be blocked by Contessa.', function (target) { target.loseInfluence(); }, ['Contessa'], true, 3),
  Exchange: new Action('Exchange', 'Take 2 cards, return 2 cards to court deck. Cannot be blocked.', function () { this.game.courtDeck.topCard(); }, [], true, 0),
  Steal: new Action('Steal', 'Take 2 coins from another player. Can be blocked by Captain or Ambassador.', function (target) { target.coins -= 2; this.coins += 2; }, ['Captain', 'Ambassador'], true, 0)
};

CoupGame.cards = {
  Duke: new Card('Duke', CoupGame.actions.Tax, 'Foreign Aid'),
  Assassin: new Card('Assassin', CoupGame.actions.Assassinate, undefined),
  Ambassador: new Card('Ambassador', CoupGame.actions.Exchange, 'Steal'),
  Captain: new Card('Captain', CoupGame.actions.Steal, 'Steal'),
  Contessa: new Card('Contessa', undefined, 'Assassinate')
};