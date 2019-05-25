const express = require('express')
const passport = require('passport')
const Account = require('../models/account')
const path = require('path')
const router = express.Router()
const async = require('async');
const { check, validationResult } = require('express-validator/check')

const nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var tempPass = 'Initial';
var tempUser = {};


//REGISTER USER
router.post('/register', [
  check('username').isEmail(),
], function(req, res) {
  console.log('Someone sends a register request')
  if (!req.body.username || !req.body.password) {
    console.log('Missing field in register request.')
    return res.status(400).end()
  }
  req.body.username = req.body.username.toLowerCase()

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // we want to share these errors to the client
    console.log(errors.array())
    return res.status(422).json({ errors: errors.array() })
  }

  if (typeof req.body.username !== 'string' ||
    typeof req.body.password !== 'string' ||
    req.body.username.length > 30 ||
    req.body.password.length > 30) {
    return res.status(422).end()
  }

  Account.register(new Account({
    username: req.body.username,
  }), req.body.password, function(err, account) {
    if (err) {
      // we don't want to share these errors to the client,
      // we just want to prevent them in the first place
      console.log(err.name)
      if (err.name === 'UserExistsError') return res.status(409).end()
      else return res.status(500).end()
    }

    passport.authenticate('local')(req, res, () => {
      res.status(200).json({ user: req.user })
    })
  })
})

//DELETE USER
router.post('/delete', (req, res, next) => {
  req.body.username = req.body.username.toLowerCase()
  next()
})

router.post('/delete',
[check('username').isEmail(),],
passport.authenticate('local'), function(req, res, next) {
  if (!req.body.password || !req.body.username) {
    console.log('Missing password in delete request.')
    return res.status(400).end()
  }

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // we want to share these errors to the client
    console.log(errors.array())
    return res.status(422).json({ errors: errors.array() })
  }

  if (typeof req.body.password !== 'string' ||
    typeof req.body.username !== 'string' ||
    req.body.password.length > 30 ||
    req.body.username.length > 30) {
    return res.status(422).end()
  }

  /*router.post('/:id/delete', (req, res, next)
  => {*/
    Account.findOneAndRemove({_id: req.session.passport.user}, (err) => {
      if (err) {
        console.log('Error')
        return req.status(423).end()
      }
      req.logout();
      return res.status(200).end()
  })
})


//LOGIN USER
router.post('/login', (req, res, next) => {
  req.body.username = req.body.username.toLowerCase()
  next()
})
router.post('/login', passport.authenticate('local'), function(req, res) {
  req.isAuthenticated = true;
  res.status(200).json({ user: req.user })
})

router.post('/logout', function(req, res) {
  req.logout()
  res.status(200).end()
})

router.get('/authed', (req, res) => {
  if (req.isAuthenticated()){
  res.status(200).end()}

  else{
    res.status(401).end()
  }
})

router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user)
  } else {
    passport.authenticate('local')(req, res, () => {
      res.status(200).json(req.user)
    })
  }
})

module.exports = router


//Forgot password
router.post('/forgot', [check('username').isEmail(),],
function(req, res, next) {
  if (!req.body.password || !req.body.username) {
    console.log('Missing password in delete request.')
    return res.status(400).end()
  }
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        req.body.username = req.body.username.toLowerCase()
        done(err, token);
      });
    },
    function(token, done) {
      Account.findOne({ username: req.body.username }, function(err, user) {
        if (!user) {
          res.status(403).end();
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token valid 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      tempPass = req.body.password;
      tempUser = user;
      var smtpTransport = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'datavizsweden',
          pass: 'JNLpQge7nsPjHyxGh3j9HhJM6mvu2qZwsC8L5MzVDGMCDS9EjHcYEtTFCJXi'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'passwordreset@demo.com',
        subject: 'dataViz Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to confirm your change of password.\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
          'Have a great day!\n' +
          '/The dataViz team\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('An e-mail has been sent to ' + user.username + ' with further instructions.');
        res.status(200).end();
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
  });
});

router.get('/reset/:token', function(req, res) {
  Account.findOne({ username: tempUser.username }, function(err, user) {
      if (req.params.token != tempUser.resetPasswordToken) {
      return res.status(403).json({message: 'Password reset token is invalid.'})
    }
    else if (Date.now() > user.resetPasswordExpires){
      res.status(400).json({message: 'Password reset token has expired.'})
    }
    else {
      Account.findByUsername(user.username).then(function(user){
    if (user){
        user.setPassword(tempPass, function(){
            user.save();
            res.status(200).json({message: 'Password reset successful!'});
            tempUser = null;
            tempPass = null;
        });
    } else {
        res.status(500).json({message: 'This user does not exist'});
    }
},function(err){
    console.error(err);
})
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      }
    })})

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/../webpage.html'));
});
