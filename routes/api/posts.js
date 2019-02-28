const express = require('express')
const router = express.Router()

// @route api/posts/test
// @desc test post route
// @access Public
router.get('/test', (req, res, next) => res.json({ msg: 'posts works' }))

module.exports = router