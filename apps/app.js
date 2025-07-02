const path = require('path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const { Server } = require('socket.io');
const db = require('./db');

const fastify = Fastify();
const PORT = 4000;

// Maps to keep track of users
const userMap = {};   // socket.id => username
const socketMap = {}; // username => socket.id

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

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('user-joined', (username) => {
      userMap[socket.id] = username;
      socketMap[username] = socket.id;  // <-- add this line

      console.log(`User joined: ${username} (Socket ID: ${socket.id})`);
      io.emit('client-total', Object.keys(userMap).length);
      io.emit('user-list', userMap);
    });

    // socket.on('message', (data) => {
    //   const sender = userMap[socket.id] || "Unknown";

    //   // Optional: Save public chat messages to DB here if needed
    //   const insert = db.prepare(`INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)`);
    //   insert.run(sender, 'public', data.message);

    //   socket.broadcast.emit('chat-message', { ...data, sender });
    // });
    socket.on('message', (data) => {
      const sender = userMap[socket.id] || "Unknown";
      socket.broadcast.emit('chat-message', { ...data, sender });
    });

    socket.on('private-message', ({ to, from, message }) => {
      const insert = db.prepare(`
        INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)
      `);
      insert.run(from, to, message);
      io.to(to).emit('private-message', {
        from,
        message,
        dateTime: new Date(),
      });
    });

    // socket.on('private-message', ({ to, from, message }) => {
    //   // Save private message in SQLite
    //   const insert = db.prepare(`
    //     INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)
    //   `);
    //   insert.run(from, to, message);

    //   // Send message to receiver if online
    //   const toSocketId = socketMap[to];
    //   if (toSocketId) {
    //     io.to(toSocketId).emit('private-message', {
    //       from,
    //       message,
    //       timestamp: new Date().toISOString()
    //     });
    //   }

    //   // Confirm to sender
    //   socket.emit('private-sent', {
    //     to,
    //     message,
    //     timestamp: new Date().toISOString()
    //   });
    // });

    socket.on('feedback', (data) => {
      socket.broadcast.emit('feedback', data);
    });

    socket.on('disconnect', () => {
      const username = userMap[socket.id];
      console.log(`Socket disconnected: ${socket.id} (User: ${username})`);

      // Remove user from both maps
      delete userMap[socket.id];
      if (username) {
        delete socketMap[username];
      }

      io.emit('client-total', Object.keys(userMap).length);
      io.emit('user-list', userMap);
    });
  });
});


