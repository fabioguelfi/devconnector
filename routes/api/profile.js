const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')
const validateProfileInput = require('../../validation/profile')

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
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
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

// @route GET api/profile/all
// @desc GET all profiles
// @access Public
router.get('/all', async (req, res, next) => {
    const profile = await Profile.find().populate('user', ['name', 'avatar'])
    if (!profile) {
        errors.noprofile = 'Not exists profiles'
        res.status(404).json(errors)
    }
    res.json(profile)
})

// @route GET api/profile/handle/:handle
// @desc GET profile by handle
// @access Public
router.get('/handle/:handle', async (req, res, next) => {
    const errors = {}
    try {
        const profile = await Profile.findOne({ handle: req.params.handle }).populate('user', ['name', 'avatar'])
        if (!profile) {
            errors.noprofile = 'There is no profile for this user'
            res.status(404).json(errors)
        }
        res.json(profile)
    } catch (err) {
        res.status(404).json(err)
    }
})

// @route GET api/profile/user/:user_id
// @desc GET profile by User ID
// @access Public
router.get('/user/:user_id', async (req, res, next) => {
    const errors = {}
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            errors.noprofile = 'There is no profile for this user'
            res.status(404).json(errors)
        }
        res.json(profile)
    } catch (err) {
        errors.noprofile = 'There is no profile for this user'
        res.status(404).json(errors)
    }
})

// @route POST api/profile
// @desc Create or Edit user profile
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res, nest) => {
    const { errors, isValid } = validateProfileInput(req.body)

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors)
    }

    // Get fields
    const profileFields = {}
    profileFields.user = req.user.id
    if (req.body.handle) profileFields.handle = req.body.handle
    if (req.body.status) profileFields.status = req.body.status
    if (req.body.company) profileFields.company = req.body.company
    if (req.body.website) profileFields.website = req.body.website
    if (req.body.location) profileFields.location = req.body.location
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername
    // Skills slipt into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',')
    }
    // Social
    profileFields.social = {}
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin

    const profile = await Profile.findOne({ user: req.user.id })
    if (profile) {
        // Update
        res.json(await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true }).populate('user', ['name', 'avatar']))
    } else {
        // Create

        // Check if handles exists
        const profileHandle =
            await Profile.findOne({ handle: profileFields.handle })

        if (profileHandle) {
            errors.handle = 'That handle already exists'
            res.status(400).json(errors)
        }

        // Save Profile
        res.json(await new Profile(profileFields).save())
    }
})

module.exports = router