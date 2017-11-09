require('./config/config');
require('./db/mongoose');

const _ = require('lodash');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const http = require('http');
const {ObjectID} = require('mongodb');


const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {User} = require('./models/user');
const {Room} = require('./models/room');

const port = process.env.PORT || 3000;
const public_path = path.join(__dirname, '../public')

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use( bodyParser.json() );
app.use( express.static(public_path) );

Room.cleanAllUserList().then( () => {
  console.log('Rooms were cleaned');
}).catch( (e) =>{
  console.log(e);
});

io.on('connection', (socket) => {

  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Joined'))

  socket.broadcast.emit('newNotice', generateMessage('Admin', 'swipe right on mobile phones to see the people list!'))


  socket.on('join', (params, callback) => {
    let user;
    console.log(params.name, params.room)
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name required')
    }

    socket.join(params.room)
    users.removeUser(socket.id)
    users.addUser(socket.id, params.name, params.room)

    io.to(params.room).emit('updateUserList', users.getUserList(params.room))
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'))
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined ${params.room}`))



    callback()
  })

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id)
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id)

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude))
    }
  });

  socket.on('disconnect', () => {

    if( socket._customdata ){
      let params = socket._customdata;
      let tmp_room;
      Room.findById(params.room_id).then( (roomDoc) => {
        tmp_room = roomDoc;
        return tmp_room.removeUser(params.user_id);
      }).then( (userDoc) => {
        tmp_room.users = tmp_room.users.filter( user => user._id != params.user_id);
        io.to(params.room_id).emit('updateUserList', tmp_room.users);
        io.to(params.room_id).emit('newMessage', generateMessage('Admin', `${params.user_name} has left.`));

        console.log(`${params.user_name} has left room \'${tmp_room.name}\'`);
      }).catch( (e) => {
        console.log('error:' +e);
      });
    }

  });
});

server.listen(port, () => {
  console.log(`started on port ${port}`)
});
