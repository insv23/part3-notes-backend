const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Note = require('../models/note')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    await Note.deleteMany({})
    // await Promise.all(helper.initialNotes.map( note => new Note(note).save()))
    await Note.insertMany(helper.initialNotes)
  })

  test('notes are returned as json', async () => {
    await api.
      get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test(`all ${helper.initialNotes.length} notes are returned`, async () => {
    const res = await api.get('/api/notes')

    assert.strictEqual(res.body.length, helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(r => r.content)
    assert(contents.includes('Browser can execute only JavaScript'))
  })
})

describe('viewing a specific note', () => {
  beforeEach(async () => {
    await Note.deleteMany({})
    // await Promise.all(helper.initialNotes.map( note => new Note(note).save()))
    await Note.insertMany(helper.initialNotes)
  })

  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultNote.body, noteToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNonExistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new note', () => {
  let testUser

  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('aEasyPassword', 10)
    testUser = new User({ username: 'testUser', passwordHash })
    await testUser.save()
  })

  test('POSTing valid data to /api/notes should create a new note and return a 201 status code and JSON content type', async () => {
    const newNote = {
      content: 'a test note with user id',
      important: true,
      userId: testUser.id,
    }

    const res = await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

    const contents = notesAtEnd.map(n => n.content)
    assert(contents.includes('a test note with user id'))

    const notes = await helper.notesOfUser(testUser.id)
    assert(notes.includes(res.body.id))
  })

  test('fails with statuscode 400 if data invalid', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const notesAtEnd = await helper.notesInDb()
    console.log(notesAtEnd)
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
  })
})

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const notesAtEnd = await helper.notesInDb()

    const contents = notesAtEnd.map(r => r.content)
    assert(!contents.includes(noteToDelete.content))

    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})