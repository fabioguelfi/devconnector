const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

// LOAD USER MODEL
const User = require('../../models/User')

// @route api/users/test
// @desc test users route
// @access Public
router.get('/test', (req, res, next) => res.json({ msg: 'users works' }))

// @route api/users/register
// @desc Register user
// @access Public
router.post('/register', (req, res, next) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: 'email already exists' })
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar: gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' }),
                password: req.body.password
            })
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err
                    newUser.password = hash
                    newUser.save()
                        .then(user => res.json(user))
                        .catch(console.error)
                })
            })
        }
    })
})

// @route api/users/login
// @desc Login user / Return JWT
// @access Public
router.post('/login', (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    // Find user by email
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ email: 'User not found' })
            }

            // Check Password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // User matched
                        const payload = { id: user.id, name: user.name, avatar: user.avatar } // Create jwt payload

                        // Sign Token
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                            })
                    } else {
                        res.status(400).json({ password: 'Password incorrect' })
                    }
                })
        })
        .catch(console.error)
})

// @route api/users/current
// @desc Return current user
// @access Privcate
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
})


module.exports = router