module.exports = (channel, gameID, gameType) => {
	let server = global.servers[channel.guild.id];
	let players = [];
	server.games[gameID].players.forEach(player => {
		players.push(player);
		delete server.players[player][gameType];
	});

	delete server.games[gameID];
	return channel.send(`${Object.values(players).map(p => p.user).join(', ')}, your ${gameType} games have been cancelled.`).catch(console.error);
};