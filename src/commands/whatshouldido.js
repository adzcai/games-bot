const { RichEmbed } = require('discord.js');

const COMBAT_ACTIONS = require('../util/actions.json');

const summary = Object.keys(COMBAT_ACTIONS).join(', ');

module.exports = {
  aliases: ['wsid'],
  desc: 'Sends a list of possible actions for D&D combat!',
  run(message, args) {
    if (args.length === 0) {
      const options = new RichEmbed()
      .setTitle('Actions in Combat')
      .setURL('https://5e.tools/actions.html')
      .setDescription(`When you take your action on your turn, you can take one of the actions presented here, an action you gained from your class or a special feature, or an action that you improvise. Many monsters have action options of their own in their stat blocks.

      When you describe an action not detailed elsewhere in the rules, the DM tells you whether that action is possible and what kind of roll you need to make, if any, to determine success or failure.`)
      .addField('Actions', summary);
      message.channel.send(options);
    } else {
      const search = args.join(' ').toLowerCase();
      for (const key in COMBAT_ACTIONS) {
        if (search === key.toLowerCase()) {
          message.channel.send({ embed: {
            title: key,
            description: COMBAT_ACTIONS[key],
            url: `https://5e.tools/actions.html#${search.replace(/ /g, '%20')}_phb`
          }});
        }
      }
    }
  }
};
