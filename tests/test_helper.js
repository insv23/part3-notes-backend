const Note = require('../models/note')
const User = require('../models/user')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: true,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
]

const nonExistingId = async () => {
  const note = new Note({ content: 'will remove this soon' })
  await note.save()
  await note.deleteOne()

  // 在调用 save() 方法并成功保存到数据库后，这个 Note 实例的 _id 属性就会被自动填充为一个 MongoDB ObjectId 对象。这个 ObjectId 是 MongoDB 自动生成的，用于唯一标识这个文档。
  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const notesOfUser = async (userId) => {
  const user = await User.findById(userId)
  const notes = user.notes.map(note => note.toString())
  return notes
}

module.exports = {
  initialNotes, nonExistingId, notesInDb, usersInDb, notesOfUser
}