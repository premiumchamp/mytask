const express = require('express')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')

const router = express.Router()

router.get('/', auth, (req, res) => {
    res.redirect(req.baseUrl + '/login')
})

router.get('/login', auth, (req, res) => {
    res.render('login')
})

router.post('/login', auth, async (req, res) => {

    try {

        const username = req.body.username || ''
        const password = req.body.password || ''

        const user = await Parse.User.logIn(username, password)

        const query = new Parse.Query(Parse.Role)
        query.equalTo('name', 'Admin')
        query.equalTo('users', user)
        const isAdmin = await query.first()

        if (!isAdmin) {
            throw new Parse.Error(5000, 'Not Authorized')
        } else if (user.get('status') === 'Banned') {
            throw new Parse.Error(5001, 'Account Banned')
        } else if (user.get('status') === 'Inactive') {
            throw new Parse.Error(5002, 'Account Inactive')
        }
       
        req.session.user = user.toJSON()
        req.session.token = user.getSessionToken()
        res.redirect('/admin')

    } catch (error) {
        res.render('login', {
            flash: error.message
        })
    }
})

router.get('/reset-password', auth, (req, res) => {
    res.render('reset-password')
})

router.get('/logout', admin, (req, res) => {
    req.session = null
    res.redirect('login')
})

module.exports = router