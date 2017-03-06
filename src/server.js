const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

const io = socketio(app);

let num = 0;

const onJoined = (sock) => {
  const socket = sock;
  socket.on('join', () => {
    socket.join('room1');

    socket.emit('updatePara', { message: `The current value is ${num}` });
  });

  socket.on('updatePara', () => {
    num += 1;
    io.sockets.in('room1').emit('updatePara', { message: `The current value is ${num}` });
  });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
});
