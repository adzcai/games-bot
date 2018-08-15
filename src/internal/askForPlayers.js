const RichEmbed = require('discord.js').RichEmbed;

module.exports = async (message, invitationMessage, filter, collectorOptions, onCollect, onEnd, reactions = []) => {
	let msg = await message.channel.send(invitationMessage);
	for (let i = 0; i < reactions.length; i++)
		await msg.react(reactions[i]);

	let playersEmbed = new RichEmbed().setTitle('Players').setDescription(message.member);
	let playerIDs = [];
	let playersMsg = await message.channel.send({embed: playersEmbed});

	const collector = msg.createReactionCollector(filter, collectorOptions);
	collector.on('collect', (r, c) => {
		playerIDs = r.users.filter(userID => userID !== global.bot.user.id);
		playersEmbed.setDescription(playerIDs.map(id => message.guild.members.get(id)).join('\n'));
		playersMsg.edit({embed: playersEmbed});
		onCollect(r, c);
	});
	collector.on('end', onEnd);
};