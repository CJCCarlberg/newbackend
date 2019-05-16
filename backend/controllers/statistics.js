const express = require('express')
const passport = require('passport')
const router = express.Router()

const Statistics = require('../models/statistics')

router.get('/data:userId', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).end()

  Statistics.findById(req.params.userId, (err, data) => {
    if (err || !comment) {
      if (err) {
        console.log(err)
        return res.status(500).end()
      }
      debug('Didn\'t find statistics for user.')
      return res.status(404).end()
    }
    return res.json({ data: data })
  })
})

module.exports = router
