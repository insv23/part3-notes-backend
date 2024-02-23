require('dotenv').config({ path: './.env.local' })
const express = require('express')
const app = express()
const cors = require('cors')

const Note = require('./models/note')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send(
    '<h1>May be you need a frontend</h1></br><div>app.use(express.static(\'dist\'))</div>'
  )
})

/* Use DB */
app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.post('/api/notes', (request, response, next) => {
  // const body = request.body;
  const { content, important } = request.body

  // if (body.content === undefined) {
  //   return response.status(400).json({
  //     error: "content missing",
  //   });
  // }

  const note = new Note({
    content: content,
    important: important || false,
  })

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  // const note = {
  //   content: body.content,
  //   important: body.important,
  // };

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

/* Error handling */
const errorHandler = (error, req, res, next) => {
  console.error('\x1b[31m%s\x1b[0m', `Error: ${error.message}`) // 将错误信息以红色输出

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
