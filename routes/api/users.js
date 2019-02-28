const express = require('express')
const router = express.Router()

// @route api/users/test
// @desc test users route
// @access Public
router.get('/test', (req, res, next) => res.json({ msg: 'users works' }))

module.exports = router