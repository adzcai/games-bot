module.exports = (socket, msg) => {
  socket.broadcast.emit('chatMessage', msg);
};
