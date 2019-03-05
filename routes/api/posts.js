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

// @route POST api/posts/like/:id
// @desc Like post
// @access Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
            .then(async post => {
                if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({ alreadyliked: 'User liked this post' })
                }
                // Add user id likes array
                post.likes.unshift({ user: req.user.id })
                res.json(await post.save())
            })
        }).catch(e => res.status(404).json({ postnotfound: 'No post found' }))
})

// @route POST api/posts/unlike/:id
// @desc Unlike post
// @access Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
            .then(async post => {
                if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                    return res.status(400).json({ notliked: 'You have not yet liked this post' })
                }
                // Get remove index
                const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id)

                // Slice out of array
                post.likes.slice(removeIndex, 1)

                res.json(await post.save())
            })
        }).catch(e => res.status(404).json({ postnotfound: 'No post found' }))
})

// @route POST api/posts/comment/:id
// @desc Add comment to post
// @access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body)

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    Post.findById(req.params.id)
    .then(async post => {
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id,
        }
        // Add to comment array
        post.comments.unshift(newComment)

        res.json(await post.save())
    }).catch(e => res.status(404).json({ postnotfound: 'No post found' }))
})

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Remove comment from post
// @access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    Post.findById(req.params.id)
    .then(async post => {
        // Check if comment exists
        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({ commentnotexists: 'Comment does not exists' })
        }
        
        post.comments = post.comments.filter(post => post._id.toString() !== req.params.comment_id)

        res.json(await post.save())
    }).catch(e => res.status(404).json({ postnotfound: 'No post found' }))
})


module.exports = router