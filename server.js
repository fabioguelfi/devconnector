const express = require('express')
const mongoose = require('mongoose')

const users = require('./routes/api/users')
const posts = require('./routes/api/posts')
const profile = require('./routes/api/profile')

const app = express()

// DB CONFIG
const db = require('./config/keys').MONGO_URI

// CONNECT TO MONGODB
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log(`MONGO CONNECTED`))
    .catch(console.error)

app.get('/', (req, res, next) => res.send('hello!'))

// USER ROUTES
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`SERVER RUN ON ${PORT}`))