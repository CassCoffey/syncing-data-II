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

const maxCoins = 100;
const coinsPer = 3;
const coins = [];

function coin(x, y, radius) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.visible = true;
}

const createCoins = () => {
	for (var i = 0; i < coinsPer; i++)
	{
		if (coins.length <= maxCoins)
		{
			let x = Math.floor(Math.random()*(1280-10) + 10);
			let y = Math.floor(Math.random()*(720-10) + 10);
			var tempCoin = new coin(x, y, 20);
			coins.push(tempCoin);
		}
	}
	io.sockets.in('room1').emit('updateCoins', { coins: coins });
}

const checkCoins = (data) => {
	
	let coinChanged = false;
	
	for (var i = 0; i < coins.length; i++)
	{
		if (coins[i].visible)
		{
			var a = coins[i].x - (data.coords.x + (data.coords.width/2));
			var b = coins[i].y - (data.coords.y + (data.coords.height/2));
			
			var c = Math.sqrt(a * a + b * b);
			
			if (c < coins[i].radius + (data.coords.width/2))
			{
				coinChanged = true;
				coins[i].visible = false;
			}
		}
	}
	
	if (coinChanged)
	{
		io.sockets.in('room1').emit('updateCoins', { coins: coins });
	}
}

const onJoined = (sock) => {
  const socket = sock;
  socket.on('join', () => {
    socket.join('room1');
	socket.emit('updateCoins', { coins: coins });
  });

  socket.on('draw', (data) => {
	checkCoins(data);
    io.sockets.in('room1').emit('draw', { name: data.name, coords: data.coords });
  });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
});

setInterval(createCoins, 2000);