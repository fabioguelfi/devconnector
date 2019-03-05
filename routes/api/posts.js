const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Post Model
const Post = require('../../models/Post')

// Profile Model
const Profile = require('../../models/Profile')

// Validation
const validatePostInput = require('../../validation/post')

// @route api/posts/test
// @desc test post route
// @access Public
router.get('/test', (req, res, next) => res.json({ msg: 'posts works' }))

// @route GET api/posts
// @desc Get post
// @access public
router.get('/', async (req, res, next) => {
    res.json(await Post.find().sort({ data: -1 }))
})

// @route GET api/posts/:id
// @desc Get post by id
// @access public
router.get('/:id', async (req, res, next) => {
    const errors = {}
    try {
        const post = await Post.findOne({ _id: req.params.id }).sort({ data: -1 })
        res.json(post)
    } catch (err) {
        errors.nopostfound = 'Post not found with that ID'
        res.status(404).json(errors)
    }
})

// @route POST api/posts
// @desc Create post
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body)

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    const newPost = await new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    })

    res.json(await newPost.save())
})

// @route DELETE api/posts/:id
// @desc Delete post by id
// @access Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Post.findById(req.params.id)
        .then(async post => {
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ notAuthorize: 'User not authorized' })
            }
            try {
                // Delete
                await post.remove()
                res.json({ success: true })
            } catch (err) {
                res.status(404).json({ postnotfound: 'No post found' })
            }
        }).catch(e => res.status(404).json({ postnotfound: 'No post found' }))
})

module.exports = router