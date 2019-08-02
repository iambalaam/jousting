const express = require('express');
const socketIO = require('socket.io');
const { resolve } = require('path');

const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const { html } = require('./html');

const PGK_ROOT = resolve(__dirname, '../../');
const LIB_DIR = resolve(PGK_ROOT, 'lib');

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
    socket.emit('chat message', 'welcome to the chat room!');
});

app.use('/lib', express.static(LIB_DIR));

app.get('*', (_req, res) => {
    res.send(html());
});

server.listen(3000, function () {
    console.log('listening on *:3000');
});