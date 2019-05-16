const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const async = require('async');
const MongoStore = require('connect-mongo')(session)
const config = require('./config')
const authController = require('./controllers/auth')
const statisticsController = require('./controllers/statistics')

const app = express()

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'))

if (process.env.NODE_ENV === 'development' || process.env.DEBUG) app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/*app.use(function(req, res, next) {
  const host = req.get('host').split(':')[0]
  const allowedHosts = [
    '127.0.0.1',
    'localhost',
    // insert host here
  ]
  if (host && allowedHosts.includes(host)) {
    res.header('Access-Control-Allow-Origin', req.get('origin'))
  }
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})*/

// mongoose
mongoose.set('useFindAndModify', false);
mongoose.connect(config.db.uri, config.dbOptions)
app.use(session({
  secret: config.secret,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: config.sessionMaxAge, // expiration time
  },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))
console.log('Max session age: ' + config.sessionMaxAge + 'ms')
app.use(passport.initialize())
app.use(passport.session())

// passport config
const Account = require('./models/account')
const passportLocalMongoStrategy = Account.authenticate()
passport.use(new LocalStrategy((username, password, done) => {
  // prevent mongo injection
  if (typeof username !== 'string' || typeof password !== 'string') {
    return done(new Error('email or password is not a string.'))
  }

  // need to modify passportLocalMongoStrategy to remove password hash and salt
  // from user object
  passportLocalMongoStrategy(username, password, (err, user) => {
    if (user) {
      user.hash = user.salt = undefined
    }
    done(err, user)
  })
}))
passport.serializeUser((user, done) => {
  console.log('serializeUser runs')
  done(null, user._id)
})
passport.deserializeUser((id, done) => {
  Account.findById(id, '-hash -salt', (err, user) => {
    console.log('deserializeUser runs')
    if (err) {
      console.log(err)
      done(err)
    } else done(null, user)
  })
})

// routes
app.use('/', authController)
app.use('/', statisticsController)

app.get('/ping', function(req, res) {
  res.status(200).send('pong!')
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err)
    res.status(err.status || 500).json(err)
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err)
  res.status(err.status || 500).end()
})

module.exports = app
