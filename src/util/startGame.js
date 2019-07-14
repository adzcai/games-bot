/*
 * This function simply starts the game. It is called when a player types the prefix followed by
 * the name of the game.
 */

module.exports = async function startGame(message, args, GameClass) {
  const server = servers[message.guild.id];

  // If the player is already in a game, see if they call any arguments
  const playerGameID = server.players[message.author.id][GameClass.type];
  let argsPassed = false;
  if (playerGameID) {
    const playerGame = server.games[playerGameID];
    args.forEach((arg) => {
      if (arg in bot.commands.get(playerGame.command).options) {
        arg.action.call(playerGame, message, args);
        argsPassed = true;
      }
    });
    if (argsPassed) return;
    playerGame.channel.send(`You are already in a game! Type ${process.env.DEFAULT_PREFIX}${playerGame.type} view to resend the message.`).catch(logger.error);
    return;
  }

  const id = Math.random().toString(36).substr(2, 9);
  server.games[id] = new GameClass(id, message.channel);
  server.games[id].init(message, args);
};
