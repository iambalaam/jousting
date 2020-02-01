const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const { resolve } = require('path');

const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const { html } = require('./html');
const { joinGame } = require('./game');

const PORT = process.env.PORT || 3000;
const PGK_ROOT = resolve(__dirname, '../../');
const LIB_DIR = resolve(PGK_ROOT, 'dist', 'lib');

const activePlayers = {};
const matchmakingPlayers = {};
const registeredNames = new Set();
io.on('connection', (socket) => {
    const { id } = socket;
    activePlayers[id] = { socket };
    matchmakingPlayers[id] = activePlayers[id];
    console.debug(`Player joined: ${id}`);
    const players = Object.keys(matchmakingPlayers)
        .map((id) => ({ id, name: activePlayers[id].name }));
    socket.broadcast.emit('players-changed', players);

    socket.on('disconnect', () => {
        const name = activePlayers[id].name;
        registeredNames.delete(name);
        delete activePlayers[id];
        delete matchmakingPlayers[id];
        console.debug(`Player left: ${id}`);
        socket.broadcast.emit('players-changed', Object.keys(matchmakingPlayers)
            .map((id) => ({ id, name: activePlayers[id].name })));
    });

    // Matchmaking
    socket.on('invite-request', (playerId) => {
        console.debug(`${id} invited ${playerId}`);
        const player = matchmakingPlayers[playerId];
        if (player) {
            const { name } = activePlayers[id];
            player.socket.emit('invite-request', { id, name });
        }
    });
    socket.on('invite-accept', (playerId) => {
        console.debug(`${id} accepted ${playerId}'s invitation`);
        const player = matchmakingPlayers[playerId];
        const name = activePlayers[playerId].name;
        if (player) {
            joinGame(socket, activePlayers[playerId].socket);
            delete matchmakingPlayers[id];
            delete matchmakingPlayers[playerId];
            player.socket.emit('invite-accept', { id, name });
            io.emit('players-changed', Object.keys(matchmakingPlayers));
        }
    });

    // Debug
    socket.on('debug-ping', (...args) => {
        socket.emit('debug-pong', args);
    });
});

app.use('/lib', express.static(LIB_DIR));

app.use('/api', bodyParser.json());
app.get('/api/matchmaking', (_req, res) => {
    res.send(Object.keys(matchmakingPlayers).map((id) => ({ id, name: activePlayers[id].name })));
});

app.post('/api/setUsername', (req, res) => {
    const { playerId, username } = req.body;
    if (!playerId) return res.status(400).send('playerId is missing');
    if (!username) return res.status(400).send('name is missing');
    if (typeof username !== 'string') return res.status(400).send('name must be a string');
    const player = activePlayers[playerId];
    if (!player) return res.status(400).send(`player ${playerId} does not exist`);
    if (player.name) return res.status(400).send(`player ${playerId} has already set their name`);
    if (registeredNames.has(username)) return res.status(400).send(`name ${username} is already taken`);

    console.debug(`${playerId} set their name as '${username}'`);
    player.name = username;
    registeredNames.add(username);
    res.sendStatus(200);
    const players = Object.keys(matchmakingPlayers)
        .map((id) => ({ id, name: activePlayers[id].name }));
    io.emit('players-changed', players);
});

app.get('*', (_req, res) => {
    res.send(html());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`listening on *:${PORT}`);
});