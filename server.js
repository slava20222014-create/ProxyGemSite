
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.static('public'));

let players = {};
let enemies = [];
let gameState = { score: 0, baseHealth: 10 };

io.on('connection', (socket) => {
    console.log('👤 Игрок подключился:', socket.id);
    
    socket.on('player_join', ({ username }) => {
        players[socket.id] = { username, x: 0, z: 0 };
        io.emit('players_update', Object.values(players));
    });
    
    socket.on('player_move', ({ x, z }) => {
        if (players[socket.id]) {
            players[socket.id].x = (players[socket.id].x || 0) + x;
            players[socket.id].z = (players[socket.id].z || 0) + z;
            io.emit('players_update', Object.values(players));
        }
    });
    
    socket.on('place_tower', ({ x, z, type }) => {
        io.emit('tower_placed', { x, z, type, player: players[socket.id]?.username });
    });
    
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('players_update', Object.values(players));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));