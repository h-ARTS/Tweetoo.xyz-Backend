require('dotenv').config()
import * as fs from 'fs'
import * as path from 'path'

const privateKeyPath: string = path.resolve('.ssh', process.env.PRIVATE_KEY_FILE)
const publicKeyPath: string = path.resolve('.ssh', process.env.PUBLIC_KEY_FILE)

const config = {
  port: 6500,
  secrets: {
    privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
    publicKey: fs.readFileSync(publicKeyPath, 'utf8'),
    jwtExp: '30d'
  },
  dbUrl:
    'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/api?=replicaSet=tweetoo'
}

export default config
