const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: '../.env.local' })

const dbUrl = process.env.TEST_MONGODB_URI
mongoose.set('strictQuery', false)


const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const notes = [
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

mongoose.connect(dbUrl).then(() => {
  console.log('Connected to MongoDB')

  // 使用 Promise.all 等待所有笔记保存完成
  Promise.all(notes.map(note => {

    const noteToSave = new Note({
      content: note.content,
      important: note.important
    })

    return noteToSave.save()
  }))
    .then(() => {
      console.log('All notes are saved!')
      mongoose.connection.close()
    })
    .catch(error => {
      console.error('Error saving notes: ', error)
    })
}).catch(error => {
  console.error('Error connecting to MongoDB: ', error.message)
})

