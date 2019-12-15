import config from '../../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'

export const newToken = user => {
  const options = {
    algorithm: 'RS256',
    expiresIn: config.secrets.jwtExp
  }
  return jwt.sign({ id: user.id }, config.secrets.privateKey, options)
}

export const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.secrets.publicKey,
      { algorithms: ['RS256'] },
      (err, payload) => {
        if (err) return reject(err)
        return resolve(payload)
      }
    )
  })
}
