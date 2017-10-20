var socket = io()

socket.on('connect', function () {
  console.log('Connected to server')

  socket.emit('createMessage', {
    from: 'Phil',
    text: "hey its phil"
  })
})

socket.on('disconnect', function () {
  console.log('disconnected from server')
})

socket.on('newMessage', function (message) {
  console.log('New Message', message)
})
