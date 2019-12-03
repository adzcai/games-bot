const COLOR_INFO = {
  r: { // red
    lang: 'diff',
    fn: text => `- ${text}`,
    fn2: text => `+ ${text}`,
  },
  g: { // green
    lang: 'diff',
    fn: text => `+ ${text}`,
    fn2: text => `- ${text}`,
  },
  c: { // cyan
    lang: 'cs',
    fn: text => `"${text}"`,
  },
  b: { // blue
    lang: 'asciidoc',
    fn: text => `= ${text} =`,
  },
  y: { // yellow
    lang: 'autohotkey',
    fn: text => `% ${text} %`,
  },
  o: { // orange
    lang: 'css',
    fn: text => `[ ${text} ]`,
  },
};

module.exports = {
  aliases: ['c'],
  options: {
    color: {
      desc: 'The color to make the text. Can be one of (r)ed, (g)reen, (b)lue, (c)yan, (y)ellow, or (o)range.',
      required: true,
      noflag: true,
    },
  },
  desc: 'Use code blocks to colorify a message! Supported colors: red, green, blue, cyan, yellow, orange. Put your text on new lines with a | at the front to color it. Use \\ for the secondary color, when enabled.',
  async run(message, args) {
    const color = args[0].split('\n')[0].toLowerCase().charAt(0);

    let str = `${message.author.username}:\n\`\`\``;
    str += `${COLOR_INFO[color].lang}\n`;
    for (const line of message.content.split('\n').slice(1)) {
      let s = line.trim();
      if (line.startsWith('|')) s = COLOR_INFO[color].fn(line.slice(1).trim());
      else if (line.startsWith('\\')) s = (COLOR_INFO[color].fn2 || COLOR_INFO[color].fn)(line.slice(1).trim());
      str += `${s}\n`;
    }
    str += '```';
    message.channel.send(str);
    message.delete();
  },
};
