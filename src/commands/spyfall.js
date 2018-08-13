'use strict';

const RichEmbed = require('discord.js').RichEmbed;

// User commands

module.exports = {
	run: (message, args) => playSpyfall(message, args),
	usage: (prefix) => `${prefix}spyfall [**-l**] [-v __edition__]`,
	desc: 'Play Spyfall with a group of friends!',
};

const options = {
	version: {
		aliases: ['v'],
		usage: 'Plays with the locations in Spyfall __edition__ (1, 2, or "both")'},
	leave: {
		aliases: ['l'],
		usage: 'If the user is in a game, leaves it'
	}
};

async function playSpyfall(message, args) {
	let server = global.servers[message.guild.id];
    
	if (typeof server.players[message.author.id].spyfall === 'undefined') {
		let id = Object.keys(server.games).length;
		let players = [message.author.id];
        
		message.mentions.members.forEach(mentioned => players.push(mentioned.id));
		let msg = await message.channel.send(`Let's play Spyfall! Tap 🤝 to join the game. ${message.member}, tap 🕵 whenever you're ready to start the game!`);
		let joined = await message.channel.send(`Players:\n${message.member}`);
		await msg.react('🤝');
		await msg.react('🕵');
		const collector = await msg.createReactionCollector((r, user) => (r.emoji.name === '🤝') || ((r.emoji.name === '🕵') && (user.id === message.author.id)));
		collector.on('collect', async (r, col) => {
			if (r.emoji.name === '🕵') {
				server.games[id] = new SpyfallGame(id, message.channel, players, args.includes('-v') ? (['1', '2', 'both'].includes(args[(args.indexOf('-v') + 1)]) ? args[(args.indexOf('-v') + 1)] : undefined) : undefined);
				await server.games[id].start(players);
				col.stop('game starting');
				return;
			}

			Object.assign(players, Object.keys(r.users).map(id => id !== global.bot.user.id));
			joined.edit(`Players:\n${players.map(id => message.guild.members.get(id)).join('\n')}`);
		});
	} else {
		for (let i = 0; i < args.length; i++) {
			switch (args[i]) {
				case '--cancel':
				case '-c':
					internal.endGame(message);
					return;
					break;
				case '--view':
				case '-v':
					let gameID = server.players[message.author.id].tictactoe;
					let game = server.games[gameID];
					const msg = await message.guild.channels.get(game.channel).send({embed: game.boardEmbed()});
					game.boardMessage = msg;
					break;
			}
		}
		message.channel.send('You are already in a game! Type .ttt -v to resend the grid.');
	}
}

// Constants
const locations = [
	['Airplane', 'Bank', 'Beach', 'Cathedral', 'Circus Tent', 'Corporate Party', 'Crusader Army', 'Casino', 'Day Spa', 'Embassy', 'Hospital', 'Hotel', 'Military Base', 'Movie Studio', 'Ocean Liner', 'Passenger Train', 'Pirate Ship', 'Polar Station', 'Police Station', 'Restaurant', 'School', 'Service Station', 'Space Station', 'Submarine', 'Supermarket', 'Theater', 'University', 'World War II Squad'],
	['Race Track', 'Art Museum', 'Vineyard', 'Baseball Stadium', 'Library', 'Cat Show', 'Retirement Home', 'Jail', 'Construction Site', 'The United Nations', 'Candy Factory', 'Subway', 'Coal Mine', 'Cemetery', 'Rock Concert', 'Jazz Club', 'Wedding', 'Gas Station', 'Harbor Docks', 'Sightseeing Bus']
];

// Dev functions

function SpyfallGame(id, channel, players, version) {
	this.id = id;
	this.channel = channel;
	this.players = players;
	this.playerMessages = {};
	if (typeof version === 'undefined' || version === '1')
		this.locations = locations[0];
	else if (version === '2')
		this.locations = locations[1];
	else if (version === '3')
		this.locations = locations[0].concat(locations[1]);
	else
		throw 'That is not a valid version';
}

SpyfallGame.prototype.start = async function () {
	this.spy = this.players[Math.floor(Math.random() * this.players.length)];
	this.players.map(id => this.channel.guild.members.get(id).user).forEach(async user => {
		let embed = new RichEmbed()
			.setTitle(`You are ${(user.id === this.spy) ? '' : '**not**'}the spy!`)
			.addField('Location Reference', this.locations.join('\n'));
		this.playerMessages[user.id] = await user.send({embed: embed});
	});
};