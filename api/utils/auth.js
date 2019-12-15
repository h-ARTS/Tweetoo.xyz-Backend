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

export const signup = async (req, res) => {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.fullName ||
    !req.body.handle
  ) {
    return res.status(400).send({
      message: 'Email, password, full name and user handle are required.'
    })
  }

  try {
    const user = await User.create(req.body)
    const token = newToken(user)
    return res.status(201).json(token)
  } catch (e) {
    return res.status(500).end()
  }
}
