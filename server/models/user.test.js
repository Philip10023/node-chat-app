const expect = require('expect')

const {Users} = require('./users')

describe('Users', () => {
  var users
  beforeEach(() => {
    users = new Users()
    users.users = [{
      id: '1',
      name: 'Mike',
      room: 'Node course'
    },
    {
      id: '2',
      name: 'Phil',
      room: 'React course'
    },
    {
      id: '3',
      name: 'Julie',
      room: 'Node course'
    }]
  })

  it('should add new users', () => {
    var users = new Users()
    var user = {
      id: '123',
      name: 'Phil',
      room: 'The office fans'
    }
    var resUser = users.addUser(user.id, user.name, user.room)

    expect(users.users).toEqual([user])
  })

  it('should remove a user', () => {
    var userId = '1'
    var user = users.removeUser(userId)

    expect(user.id).toBe(userId)
    expect(users.users.length).toBe(2)
  })

  it('should not remove user', () => {
    var userId = '22'
    var user = users.removeUser(userId)

    expect(user).toNotExist()
    expect(users.users.length).toBe(3)
  })

  it('should find find user', () => {
    var userId = '1'
    var user = users.getUser(userId)

    expect(user.id).toBe(userId)
  })

  it('should not find a user', () => {
    var userId = '100'
    var user = users.getUser(userId)

    expect(user).toNotExist()
  })

  it('shuold return names for node course', () => {
    var userList = users.getUserList('Node course')

    expect(userList).toEqual(['Mike', 'Julie'])
  })

  it('shuold return names for react course', () => {
    var userList = users.getUserList('React course')

    expect(userList).toEqual(['Phil'])
  })
})
