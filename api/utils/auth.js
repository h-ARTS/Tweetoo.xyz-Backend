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
    console.error(e)
    return res.status(500).end()
  }
}

export const login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'Email and password required!' })
  }

  const invalid = { message: 'Wrong email and password combination.' }

  try {
    const user = await User.findOne({ email: req.body.email })
      .select('email password') // We only include email and password and exclude the rest
      .exec()

    if (!user) {
      return res.status(401).send(invalid)
    }

    const match = await user.verifyPassword(req.body.password)

    if (!match) {
      return res.status(401).send(invalid)
    }

    const token = newToken(user)
    return res.status(201).json(token)
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

export const authGuard = async (req, res, next) => {
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end()
  }

  const token = bearer.split('Bearer ')[1].trim()

  let payload
  try {
    payload = await verifyToken(token)
  } catch (e) {
    return res.status(401).end()
  }

  const user = await User.findById(payload.id)
    .select('-password') // We exclude password since it's not needed for protected routes.
    .lean()
    .exec()

  if (!user) {
    return res.status(401).end()
  }

  req.user = user
  next()
}
