'use strict';

module.exports.testReactions = async (message) => {
	const msg = await message.channel.send('React to this message in the next minute to get information about emojis:');
	const collector = msg.createReactionCollector(r => r.users.get(message.author.id), {maxUsers: 1, time: 60 * 1000});
	collector.on('end', collected => {
		console.log(collected.first().emoji.name);
	});
	return;
};

module.exports.endGame = (message) => {
	let server = global.servers[message.guild.id];
	if (typeof server.players[message.author.id].tictactoe !== 'number')
		return message.channel.send('You are not currently in a game to cancel');

	let id = server.players[message.author.id];
	server.games[id].players.forEach(player => delete server.players[player].tictactoe);
	delete server.games[id];
	return message.channel.send('Game cancelled');
};