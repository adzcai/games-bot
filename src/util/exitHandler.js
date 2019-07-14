function pruneEndedGames() {
  bot.games.filter(game => game.status === 'ended').forEach((game) => {
    bot.games.delete(game.id);
  });
}

// We get rid of ended games every 5 seconds
const handle = setInterval(pruneEndedGames, 5 * 1000);

/*
 * This exit handler simply makes sure the program terminates gracefully when
 * it is killed, nodemon restarts, or an error occurs.
 */
function exitHandler(exitCode) {
  clearInterval(handle);
  logger.info('Interval cleared');
  if (exitCode) logger.info(`Exit code: ${exitCode}`);
  process.exit();
}

process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
/**
 * We set up an uncaught exception capture callback so that the bot keeps running even when an
 * error occurs
 */
process.setUncaughtExceptionCaptureCallback((err) => {
  logger.error(`An error occurred. ${(err.stack)}`);
});
