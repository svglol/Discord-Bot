module.exports = function () {
  // const server = require('http').createServer(this.nuxt.renderer.app);
  // const io = require('socket.io')(server);
  //
  // // overwrite nuxt.listen()
  // this.nuxt.listen = (port, host) => new Promise((resolve) => server.listen(port || 3000, host || 'localhost', resolve));
  // // close this server on 'close' event
  // this.nuxt.hook('close', async nuxt => {
  //   server.close();
  // });
  //
  // // Add socket.io events
  // let messages = [];
  // io.on('connection', (socket) => {
  //   socket.on('last-messages', function (fn) {
  //     fn(messages.slice(-50));
  //   });
  //   socket.on('send-message', function (message) {
  //     messages.push(message);
  //     socket.broadcast.emit('new-message', message);
  //   });
  // });
};
