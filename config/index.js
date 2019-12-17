require('dotenv').config()
const fs = require('fs')
const path = require('path')

const privateKeyPath = path.resolve('.ssh', process.env.PRIVATE_KEY_FILE)
const publicKeyPath = path.resolve('.ssh', process.env.PUBLIC_KEY_FILE)

const config = {
  port: 3000,
  secrets: {
    privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
    publicKey: fs.readFileSync(publicKeyPath, 'utf8'),
    jwtExp: '30d'
  },
  dbUrl: 'mongodb://127.0.0.1:27017/api'
}

module.exports = config
