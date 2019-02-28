const express = require('express')
const router = express.Router()

// @route api/profile/test
// @desc test profile route
// @access Public
router.get('/test', (req, res, next) => res.json({ msg: 'profile works' }))

module.exports = router