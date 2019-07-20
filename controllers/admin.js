const express = require('express')
const admin = require('../middlewares/admin')

const router = express.Router()

router.get('/', admin, (req, res) => {
  res.redirect(req.baseUrl + '/orders')
})

router.get('/users', admin, (req, res) => {
  res.render('users')
})

router.get('/items', admin, (req, res) => {
  res.render('items')
})

router.get('/orders', admin, (req, res) => {
  res.render('orders')
})

router.get('/slide-images', admin, (req, res) => {
  res.render('slide-images')
})

router.get('/zones', admin, (req, res) => {
  res.render('zones')
})

router.get('/categories', admin, (req, res) => {
  res.render('categories')
})

router.get('/subcategories', admin, (req, res) => {
  res.render('sub-categories')
})

router.get('/notifications', admin, (req, res) => {
  res.render('notifications')
})

module.exports = router