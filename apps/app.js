const path = require('path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const { Server } = require('socket.io');

const fastify = Fastify();
const PORT = 4000;

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);

  const io = new Server(fastify.server);
  const userMap = {}; // socket.id => username

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('user-joined', (username) => {
      userMap[socket.id] = username;
      console.log(`User joined: ${username} (Socket ID: ${socket.id})`);
      io.emit('client-total', Object.keys(userMap).length);
      io.emit('user-list', userMap);
    });

    socket.on('message', (data) => {
      const sender = userMap[socket.id] || "Unknown";
      socket.broadcast.emit('chat-message', { ...data, sender });
    });

    socket.on('private-message', ({ to, from, message }) => {
      io.to(to).emit('private-message', {
        from,
        message,
        dateTime: new Date(),
      });
    });

    socket.on('feedback', (data) => {
      socket.broadcast.emit('feedback', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      delete userMap[socket.id];
      io.emit('client-total', Object.keys(userMap).length);
      io.emit('user-list', userMap);
    });
  });
});