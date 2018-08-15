module.exports = (message, gameType) => {
	let server = global.servers[message.guild.id];
	if (typeof server.players[message.author.id][gameType] !== 'number')
		throw new Error('You are not currently in a game to cancel');

	let id = server.players[message.author.id][gameType];
	let players = [];
	server.games[id].players.forEach(player => {
		players.push(player);
		delete server.players[player][gameType];
	});

	delete server.games[id];
	return message.channel.send(`${players.map(id => message.guild.members.get(id)).join(', ')}, your games have been cancelled.`).catch(console.error);
};