const bcrypt = require('bcrypt')
const router = require('express').Router()
const User = require('../models/user')

router.get('/', async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  console.log('user ----', user)
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username needs to be at least 3 characters' })
  }

  // check username only consists of permitted characters(e.g. letters and numbers)
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters and numbers' })
  }

  // check password strength(Just a simple example, more complex rules may be required in practical application)
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password needs to be at least 6 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = router
