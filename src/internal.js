'use strict';

module.exports.endGame = (message) => {
	let server = global.servers[message.guild.id];
	if (typeof server.players[message.author.id].tictactoe !== 'number')
		throw new Error('You are not currently in a game to cancel');

	let id = server.players[message.author.id];
	server.games[id].players.forEach(player => delete server.players[player].tictactoe);
	delete server.games[id];
	return message.channel.send('Game cancelled');
};

module.exports.clone = (obj) => {
	let clone = {};
	for (let i in obj) {
		if (obj[i] != null &&  typeof obj[i] == 'object')
			clone[i] = clone(obj[i]);
		else
			clone[i] = obj[i];
	}
	return clone;
};

module.exports.shuffle = (list) => {
	let arr = list.slice();
	let j, x, i;
	for (i = arr.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = arr[i];
		arr[i] = arr[j];
		arr[j] = x;
	}
	return arr;
};