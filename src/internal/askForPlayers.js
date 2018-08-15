const RichEmbed = require('discord.js').RichEmbed;

module.exports = async (message, invitationMessage, filter, collectorOptions, onCollect, onEnd, reactions = []) => {
	let msg = await message.channel.send(invitationMessage);
	for (let i = 0; i < reactions.length; i++)
		await msg.react(reactions[i]);

	let playersEmbed = new RichEmbed().setTitle('Players').setDescription(message.member);
	let playersMsg = await message.channel.send({embed: playersEmbed});

	const collector = msg.createReactionCollector(filter, collectorOptions);
	collector.on('collect', (r, c) => {
		let playerIDs = r.users.keyArray().filter(id => !global.bot.users.get(id).bot);
		playersEmbed.setDescription(playerIDs.map(id => message.guild.members.get(id)).join('\n'));
		playersMsg.edit({embed: playersEmbed});
		onCollect(r, c).catch(console.error);
	});
	collector.on('end', (collected, reason) => onEnd(collected, reason).catch(console.error));
};