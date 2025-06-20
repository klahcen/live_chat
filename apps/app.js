const express = require('express')
const path = require('path')
const { Socket } = require('socket.io')
const app = express()
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`server opn ${PORT}`))



const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))


let socketsConnected = new Set()

io.on('connection', onConnected)

function onConnected(socket) {
    console.log('Socket Connected', socket.id)
    socketsConnected.add(socket.id)
    io.emit('client-total', socketsConnected.size);
    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id)
        socketsConnected.delete(socket.id)
        io.emit('client-total', socketsConnected.size);
    })
    socket.on('message', (data) => {
        // console.log(data)
        socket.broadcast.emit('chat-message', data)
    })
    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data)
    })
}