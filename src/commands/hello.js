module.exports = {
	usage: (prefix) => `${prefix}sayHi [**-l** __language__]`,
	desc: 'Says hello!',
	options: {'**-l, --language**': 'Says hi in the specified __language__.'},
	aliases: ['hi', 'sayHi', 'sayHello'],
	run: (message, args) => {
		let lang;
		if (args[0])
			lang = args[0].charAt(0).toUpperCase() + args[0].slice(1);
		else
			lang = Object.keys(languages)[Math.floor(Math.random() * Object.keys(languages).length)];
		message.channel.send(`${languages[lang]}! (${lang})`).catch(console.error);
	}
};

const languages = {
	'Portuguese': 'Olá',
	'Latin': 'Salve',
	'Dutch': 'Hallo',
	'Hawaiian': 'Aloha',
	'Chinese': '你好',
	'German': 'Hallo',
	'Spanish': '¡Hola',
	'Japanese': 'こんにちは',
	'French': 'Bonjour',
	'Greek': 'Χαίρετε',
	'Hindi': 'नमस्ते',
	'Hebrew': 'שלום',
	'Russian': 'Здравствуйте',
	'Korean': '여보세요',
	'Thai': 'สวัสดี',
	'English': 'Hello',
	'Italian': 'Ciao'
};