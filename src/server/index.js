const express = require('express');
const socketIO = require('socket.io');
const { resolve } = require('path');

const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const { html } = require('./html');

const PORT = process.env.PORT || 3000;
const PGK_ROOT = resolve(__dirname, '../../');
const LIB_DIR = resolve(PGK_ROOT, 'dist', 'lib');

const gameEvents = ['player-state', 'hit'];
const proxyGameEvents = (socket1, socket2) => {
    for (const event of gameEvents) {
        socket1.on(event, (payload) => socket2.emit(event, payload));
        socket2.on(event, (payload) => socket1.emit(event, payload));
    }
}

const activePlayers = {};
const matchmakingPlayers = {};
io.on('connection', (socket) => {
    const { id } = socket;
    activePlayers[id] = { socket };
    matchmakingPlayers[id] = activePlayers[id];
    console.debug(`Player joined: ${id}`);
    socket.broadcast.emit('players-changed', Object.keys(matchmakingPlayers));

    socket.on('disconnect', () => {
        delete activePlayers[id];
        delete matchmakingPlayers[id];
        console.debug(`Player left: ${id}`);
        socket.broadcast.emit('players-changed', Object.keys(matchmakingPlayers));
    });

    // Matchmaking
    socket.on('invite-request', (playerId) => {
        console.debug(`${id} invited ${playerId}`);
        const player = matchmakingPlayers[playerId];
        if (player) {
            player.socket.emit('invite-request', id);
        }
    });
    socket.on('invite-accept', (playerId) => {
        console.debug(`${id} accepted ${playerId}'s invitation`);
        const player = matchmakingPlayers[playerId];
        if (player) {
            delete matchmakingPlayers[id];
            delete matchmakingPlayers[playerId];
            player.socket.emit('invite-accept', id);
            io.emit('players-changed', Object.keys(matchmakingPlayers));
        }
    });
});


app.use('/lib', express.static(LIB_DIR));

app.get('/api/matchmaking', (_req, res) => {
    res.send(Object.keys(matchmakingPlayers));
});

app.get('*', (_req, res) => {
    res.send(html());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`listening on *:${PORT}`);
});