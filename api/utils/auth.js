import config from '../../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'

export const newToken = user => {
  return jwt.sign({ id: user.id }, config.secrets.privateKey, {
    expiresIn: config.secrets.jwtExp
  })
}
