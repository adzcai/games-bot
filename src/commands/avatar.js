module.exports = {
  desc: 'Sends you a user\'s avatar.',
  options: {
    user: {
      desc: 'Ping the user whose avatar you want'
    }
  },
  run: getAvatar
}

function getAvatar(message) {
  message.reply((message.mentions.users.first() || message.author).avatarURL).catch(logger.error);
}
