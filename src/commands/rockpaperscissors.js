module.exports = {
	run: (message, args) => rockPaperScissors(message, args),
	help: 'Plays rock paper scissors',
	aliases: ['rps']
};

const reactions = {
	'🇷': 0,
	'🇵': 1,
	'🇸': 2
};

const words = ['Rock', 'Paper', 'Scissors'];

const results = [
	//Rock, Paper, Scissors
	[0, 1, -1], // Rock
	[-1, 0, 1], // Paper
	[1, -1, 0] // Scissors
];

async function rockPaperScissors(message, args) {
	if (message.mentions.members.size < 1) throw new Error('Please ping someone to challenge them to tic tac toe!');
	message.channel.send('Wait for a DM to tell me your choice');
	let players = [message.member, message.mentions.members.first()];
	let choices = [null, null];

	console.log('before loop');
	await players.forEach(async (player, ind) => {
		if (player.id === global.bot.id) {
			choices[ind] = Object.values(reactions)[Math.floor(Math.random() * 3)];
			return;
		}
		let msg = await player.user.send('Would you like to show 🇷ock, 🇵aper, or 🇸cissors?');
		for (let i = 0; i < 3; i++) await msg.react(Object.keys(reactions)[i]);
		let collected = await msg.awaitReactions((r, user) => r.emoji.name === '🇷' || r.emoji.name === '🇵' || r.emoji.name === '🇸' && user.id === player.id, {maxUsers: 1, time: 60 * 1000});
		if (collected.size < 1) throw new Error(this.sendCollectorEndedMessage().content);
		player.user.send(`You chose ${reactions[collected.first().emoji.name]}.`);
		choices[ind] = reactions[collected.first().emoji.name];
	});
	console.log('after loop');

	console.log(choices);
	let result = '';
	[0, 1].forEach(ind => result += `${players[ind]} chose ${words[choices[ind]]}\n`);
	let p1won = results[choices[0]][choices[1]];
	result += p1won ? `${(p1won === 1 ? players[0] : players[1])} won. GG!` : 'It was a draw. GG!';
}