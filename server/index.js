const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

const users = {}; // { socketId: username }

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    users[socket.id] = socket.id; // Replace with username if needed

    // Send the updated user list to all clients
    io.emit('userList', users);

    socket.on('privateMessage', ({ to, message }) => {
        io.to(to).emit('privateMessage', {
            from: socket.id,
            message
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        io.emit('userList', users);
    });
});

http.listen(8080, () => console.log('Server running on http://localhost:8080'));
