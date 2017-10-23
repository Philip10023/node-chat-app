const path = require('path')
const http = require('http')
const express = require("express")
const socketIO = require('socket.io')

const {generateMessage, generateLocationMessage} = require('./utils/message')
const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000;
var app = express()
var server = http.createServer(app)
var io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', (socket) => {
  console.log('New User Connected')

  //socket.emit from admin to say welcome to my site
  socket.emit('newMessage', generateMessage('Admin', 'Welcome to my chat app'))
  //socket.broastcast.emit from admin text New user joined
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Joined'))

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message)
    io.emit('newMessage', generateMessage(message.from, message.text))
    callback()
  })

  socket.on('createLocationMessage', (coords) => {
    io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude))
  })

  socket.on("disconnect", () => {
    console.log('disconnected from client')
  })
})

server.listen(port, () => {
  console.log(`started on port ${port}`)
})
