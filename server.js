const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const users = require('./routes/api/users')
const posts = require('./routes/api/posts')
const profile = require('./routes/api/profile')
const passport = require('passport')

const app = express()

// BODY PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// DB CONFIG
const db = require('./config/keys').MONGO_URI

// CONNECT TO MONGODB
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log(`MONGO CONNECTED`))
    .catch(console.error)

// PASSPORT MIDDLEWARE
app.use(passport.initialize())

// PASSPORT CONFIG
require('./config/passport')(passport)

// USER ROUTES
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`SERVER RUN ON ${PORT}`))