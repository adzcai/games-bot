const fs = require('fs');

module.exports = () => {
	let commands = {};
	fs.readdirSync('src/commands').forEach(file => {
		let command = require(`../commands/${file}`);
		let cmdName = file.slice(0, -3);
		
		commands[cmdName] = command;
		if (command.aliases)
			command.aliases.forEach(alias => Object.defineProperty(commands, alias, { get: () => command }));
	});
	return commands;
};