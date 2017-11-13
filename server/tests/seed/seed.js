const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')

const {Room} = require('./../../models/room')
const {User} = require('./../../models/user')

const user1Id = new ObjectID()
const user2Id = new ObjectID()

const users = [{
  _id: user1Id,
  email: 'philly@example.com',
  password: 'user1pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: user1Id, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: user2Id,
  email: 'joe@example.com',
  password: 'user2pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: user2Id, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}]

const rooms = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: user1Id
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: user2Id
}]

const populateRooms = (done) => {
  Room.remove({}).then(() => {
    return Room.insertMany(rooms)
  }).then(() => done())
}

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save()
    var userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

module.exports = {rooms, populateRooms, users, populateUsers}
