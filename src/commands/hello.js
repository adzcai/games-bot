const languages = {
  Portuguese: 'Olá',
  Latin: 'Salve',
  Dutch: 'Hallo',
  Hawaiian: 'Aloha',
  Chinese: '你好',
  German: 'Hallo',
  Spanish: '¡Hola',
  Japanese: 'こんにちは',
  French: 'Bonjour',
  Greek: 'Χαίρετε',
  Hindi: 'नमस्ते',
  Hebrew: 'שלום',
  Russian: 'Здравствуйте',
  Korean: '여보세요',
  Thai: 'สวัสดี',
  English: 'Hello',
  Italian: 'Ciao',
};

module.exports = {
  aliases: ['hi', 'sayHi', 'sayHello'],
  desc: 'Says hello!',
  options: {
    language: {
      desc: 'The language to say hello in',
      noflag: true,
    },
  },
  run(message, args) {
    let lang;
    if (args[0]) lang = args[0].charAt(0).toUpperCase() + args[0].slice(1);

    if (!Object.keys(languages).includes(lang)) {
      lang = Object.keys(languages)[Math.floor(Math.random() * Object.keys(languages).length)];
    }
    message.channel.send(`${languages[lang]}! (${lang})`);
  },
};
