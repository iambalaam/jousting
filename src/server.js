const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const { html } = require('./html');

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
    socket.emit('chat message', 'welcome to the chat room!');
});

app.get('*', (_req, res) => {
    res.send(html());
});

server.listen(3000, function () {
    console.log('listening on *:3000');
});