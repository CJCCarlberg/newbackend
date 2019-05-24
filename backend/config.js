const env = require('dotenv')
const path = require('path')
env.config({ path: path.join(__dirname, '.env.local') })


module.exports = {
 // username: process.env.USER,
 // password: process.env.PASSWORD,
  port: 3000,
  db: {
    username: process.env.USER,
    password: process.env.PASSWORD,

   // uri: 'mongodb://' + username + ':' + password + '@127.0.0.1:27017/accounts',
    uri: 'mongodb://cj:DwkfMHRUcmVZ2MM3FsELrEJQXK9tXUx8zrneGoKrNYozTaSDWVnSovWghepM@127.0.0.1:27017/accounts',
    //uri: 'mongodb://127.0.0.1:27017/cj', //for local testing
    options: {
      useNewUrlParser: true
    }
  },
  secret: process.env.SECRET,
  sessionMaxAge: 1000 * 3600 * 3, // 3 hours max time,
}

