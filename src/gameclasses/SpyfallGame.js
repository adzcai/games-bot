'use strict';

const RichEmbed = require('discord.js').RichEmbed;
const Game = require('./Game.js');

module.exports = SpyfallGame;

const locations = [
	['Airplane', 'Bank', 'Beach', 'Cathedral', 'Circus Tent', 'Corporate Party', 'Crusader Army', 'Casino', 'Day Spa', 'Embassy', 'Hospital', 'Hotel', 'Military Base', 'Movie Studio', 'Ocean Liner', 'Passenger Train', 'Pirate Ship', 'Polar Station', 'Police Station', 'Restaurant', 'School', 'Service Station', 'Space Station', 'Submarine', 'Supermarket', 'Theater', 'University', 'World War II Squad'],
	['Race Track', 'Art Museum', 'Vineyard', 'Baseball Stadium', 'Library', 'Cat Show', 'Retirement Home', 'Jail', 'Construction Site', 'The United Nations', 'Candy Factory', 'Subway', 'Coal Mine', 'Cemetery', 'Rock Concert', 'Jazz Club', 'Wedding', 'Gas Station', 'Harbor Docks', 'Sightseeing Bus']
];

function SpyfallGame(id, channel, version = '1', time = 8 * 60 * 1000) {
	Game.call(this, id, channel);
	
	this.gameTime = time;
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

SpyfallGame.prototype.start = async function (pIDs) {
	this.status = 'running';
	this.spyID = pIDs[Math.floor(Math.random() * pIDs.length)];
	for (let id of pIDs) {
		this.addPlayer(id);
		this.players[id].isSpy = id === this.spyID;
		this.players[id].scratched = [];
	}

	Object.values(this.players).forEach(async player => {
		player.message = await player.user.send({embed: this.locationEmbed(player)});
		player.collector = player.user.dmChannel.createMessageCollector(m => (parseInt(m.content) > 0) && (parseInt(m.content) <= this.locations.length), {time: this.gameTime});
	
		player.collector.on('collect', msg => {
			let toScratch = parseInt(msg) - 1;
			if (player.scratched.includes(toScratch))
				player.scratched.splice(player.scratched.indexOf(toScratch), 1);
			else player.scratched.push(toScratch);
			player.message.edit({embed: this.locationEmbed(player)});
		});
	});

	this.startingTime = new Date().getTime();
	this.boardMessage = await this.channel.send(`Time remaining: ${this.gameTime}`);
	setInterval(() => {
		let remaining = this.gameTime - (new Date().getTime() - this.startingTime);
		if (remaining <= 0) return this.boardMessage.edit('Time\'s up!');
		let minutes = Math.floor(remaining / 1000 / 60);
		let seconds = Math.floor((remaining / 1000) % 60);
		this.boardMessage.edit(`Time remaining: ${minutes}:${seconds}`);
	}, 1000);
};

SpyfallGame.prototype.locationEmbed = function (player) {
	let embed = new RichEmbed()
	.setTitle(`You are ${player.isSpy ? '' : '**not**'} the spy!`)
	.addField('Location Reference', this.locations.map((loc, ind) => `${player.scratched.includes(ind) ? '~~' : ''}[${ind+1}] ${loc}${player.scratched.includes(ind) ? '~~' : ''}`))
	.setFooter('To cross out/un-cross out a location, type its number.');
	return embed;
}