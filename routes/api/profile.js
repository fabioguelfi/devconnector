const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Load Profile Model
const Profile = require('../../models/Profile')
// Load User Profile
const User = require('../../models/User')

// @route api/profile/test
// @desc test profile route
// @access Public
router.get('/test', (req, res, next) => res.json({ msg: 'profile works' }))

// @route api/profile
// @desc Get current users profile
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, nest) => {
    const errors = {}
    try {
        const profile = await Profile.findOne({ user: req.user.id })
        if (!profile) {
            errors.noprofile = 'There is no profile for this user'
            return res.status(404).json(errors)
        }
        res.json(profile)
    } catch (e) {
        errors.undefined = 'Internal Error'
        res.status(404).json(errors)
    }

})

module.exports = router