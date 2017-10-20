const path = require('path')
const http = require('http')
const express = require("express")
const socketIO = require('socket.io')

const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000;
var app = express()
var server = http.createServer(app)
var io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', (socket) => {
  console.log('New User Connected')

  //socket.emit from admin to say welcome to my site
  socket.emit('newMessage', {
    from: 'Admin',
    text: `welcome to the chat app :)`
  })
  //socket.broastcast.emit from admin text New user joined
  socket.broadcast.emit('newMessage', {
    from: 'Admin',
    text: 'New user joined',
    createdAt: new Date().getTime()
  })
  socket.on('createMessage', (message) => {
    console.log('createMessage', message)
    io.emit('newMessage', {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime()
    })
    // socket.broadcast.emit('newMessage', {
    //   frome: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // })
  })

  socket.on("disconnect", () => {
    console.log('disconnected from client')
  })
})

server.listen(port, () => {
  console.log(`started on port ${port}`)
})
