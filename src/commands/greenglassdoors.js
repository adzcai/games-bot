module.exports = {
	run: (message, args) => playGreenGlassDoors(message, args.join(' ')),
	usage: (prefix) => `${prefix}greenglassdoors __item__`,
	desc: 'Tells if you can bring __item__ through the green glass doors.',
	aliases: ['ggg']
};

function playGreenGlassDoors(message, phrase) {
	if (!/[\sa-z]+/i.test(phrase))
		return message.channel.send('You need to choose something to bring!').catch(console.error);
    
	for (let i = 1; i < phrase.length; i++)
		if (phrase.charAt(i).toLowerCase() === phrase.charAt(i-1).toLowerCase())
			return message.channel.send(`Yes, you can bring ${phrase} through the Green Glass Doors.`).catch(console.error);
    
	message.channel.send(`No, you cannot bring ${phrase} through the Green Glass Doors.`).catch(console.error);
}