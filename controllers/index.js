const express = require('express')

const router = express.Router()

router.use('/auth', require('./auth'))
router.use('/admin', require('./admin'))
router.use('/install', require('./install'))

router.get('/', (req, res) => {
  res.redirect('/auth')
})

module.exports = router