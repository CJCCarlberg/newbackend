const env = require('dotenv')
const path = require('path')
env.config({ path: path.join(__dirname, '.env.local') })


module.exports = {
  port: 3000,
  db: {
    uri: 'mongodb://127.0.0.1:27017/accounts',
    //uri: 'mongodb://127.0.0.1:27017/cj', //for local testing
    options: {
      useNewUrlParser: true
    }
  },
  secret: process.env.SECRET,
  sessionMaxAge: 1000 * 3600 * 3, // 3 hours max time,
}
