'use strict';

const RichEmbed = require('discord.js').RichEmbed;
const Game = require('./Game.js');

module.exports = SpyfallGame;

const locations = [
	['Airplane', 'Bank', 'Beach', 'Cathedral', 'Circus Tent', 'Corporate Party', 'Crusader Army', 'Casino', 'Day Spa', 'Embassy', 'Hospital', 'Hotel', 'Military Base', 'Movie Studio', 'Ocean Liner', 'Passenger Train', 'Pirate Ship', 'Polar Station', 'Police Station', 'Restaurant', 'School', 'Service Station', 'Space Station', 'Submarine', 'Supermarket', 'Theater', 'University', 'World War II Squad'],
	['Race Track', 'Art Museum', 'Vineyard', 'Baseball Stadium', 'Library', 'Cat Show', 'Retirement Home', 'Jail', 'Construction Site', 'The United Nations', 'Candy Factory', 'Subway', 'Coal Mine', 'Cemetery', 'Rock Concert', 'Jazz Club', 'Wedding', 'Gas Station', 'Harbor Docks', 'Sightseeing Bus']
];

function SpyfallGame(id, channel, version = '1') {
	this.id = id;
	this.channel = channel;
	this.playerMessages = {};
    
	if (version === '1')
		this.locations = locations[0];
	else if (version === '2')
		this.locations = locations[1];
	else if (version === '3')
		this.locations = locations[0].concat(locations[1]);
	else
		throw new Error('That is not a valid version');
}
SpyfallGame.prototype = Object.create(Game.prototype);
SpyfallGame.constructor = SpyfallGame;

SpyfallGame.prototype.start = async function (players) {
	this.players = players;
	this.spy = this.players[Math.floor(Math.random() * this.players.length)];
	this.players.map(id => this.channel.guild.members.get(id).user).forEach(async user => {
		let embed = new RichEmbed()
			.setTitle(`You are ${(user.id === this.spy) ? '' : '**not**'}the spy!`)
			.addField('Location Reference', this.locations.join('\n'));
		this.playerMessages[user.id] = await user.send({embed: embed});
	});
};