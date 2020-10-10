module.exports = {
  desc: 'roll dice!',
  run(message, args) {
    return message.channel.send(Math.random() * 6);
  }
}
