import {
  newToken,
  verifyToken,
  signup,
  login,
  authGuard,
  logout
} from '../auth'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { User } from '../../resources/user/user.model'
import config from '../../../config'
import { Blacklist } from '../../resources/blacklist-token/blacklist.model'

describe('Authentication:', () => {
  describe('newToken', () => {
    test('creates a new json web token from user id.', () => {
      const id = 493
      const token = newToken({ id })
      jwt.verify(token, config.secrets.publicKey, (err, payload) => {
        if (err) {
          return err
        }
        return expect(payload.id).toBe(id)
      })
    })
  })

  describe('verifyToken', () => {
    test('validates the token and returns payload.', async () => {
      const id = 234
      const token = jwt.sign({ id }, config.secrets.privateKey, {
        algorithm: 'RS256'
      })
      const user = await verifyToken(token)
      return expect(user.id).toBe(id)
    })
  })

  describe('login', () => {
    test('requires email and password.', async () => {
      expect.assertions(2)

      const req = { body: {} }
      const res = {
        status(code) {
          expect(code).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await login(req, res)
    })

    test('user must exist.', async () => {
      expect.assertions(2)

      const req = { body: { email: 'wrong@me.com', password: '1234' } }
      const res = {
        status(code) {
          expect(code).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await login(req, res)
    })

    test('passwords must match.', async () => {
      expect.assertions(2)

      await User.create({
        email: 'william@wallace.com',
        password: '1234567890',
        fullName: 'William Wallace',
        handle: '@WWallace'
      })

      const req = {
        body: {
          email: 'william@wallace.com',
          password: 'thecompletewrongpw'
        }
      }
      const res = {
        status(code) {
          expect(code).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await login(req, res)
    })

    test('creates a new token.', async () => {
      expect.assertions(2)
      const fields = {
        email: 'mao@han.com',
        password: '12345',
        fullName: 'Mao Han',
        handle: '@maohan'
      }
      const savedUser = await User.create(fields)

      const req = {
        body: {
          email: fields.email,
          password: fields.password
        }
      }
      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        async json(token) {
          let user = await verifyToken(token)
          user = await User.findById(user.id)
            .lean()
            .exec()
          expect(user._id.toString()).toBe(savedUser._id.toString())
        }
      }

      await login(req, res)
    })
  })

  describe('signup', () => {
    test('requires email and password, full name and user handle.', async () => {
      expect.assertions(2)

      const req = { body: {} }
      const res = {
        status(code) {
          expect(code).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await signup(req, res)
    })

    test('creates a new user and sends a token from user.', async () => {
      expect.assertions(2)

      const req = {
        body: {
          email: 'max@mustard.com',
          password: '1234567',
          fullName: 'Dr. Max Mustard',
          handle: '@DrMustard'
        }
      }
      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        async json(token) {
          let user = await verifyToken(token)
          user = await User.findById(user.id)
            .lean()
            .exec()
          expect(user.email).toBe(req.body.email)
        }
      }

      await signup(req, res)
    })
  })

  describe('authGuard', () => {
    test('looks for Bearer token in headers.', async () => {
      expect.assertions(2)

      const req = { headers: {} }
      const res = {
        status(code) {
          expect(code).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await authGuard(req, res)
    })

    test('looks for the token and must have correct prefix.', async () => {
      expect.assertions(2)

      const req = { headers: { authorization: newToken({ id: '32758gf' }) } }
      const res = {
        status(code) {
          expect(code).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await authGuard(req, res)
    })

    test('checks for a real user.', async () => {
      expect.assertions(2)

      const token = `Bearer ${newToken({ id: Types.ObjectId() })}`
      const req = { headers: { authorization: token } }

      const res = {
        status(code) {
          expect(code).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await authGuard(req, res)
    })

    test('finds a user from token and passes on.', async () => {
      expect.assertions(2)

      const user = await User.create({
        email: 'max@mustard.com',
        password: '123456',
        fullName: 'Max Mustard',
        handle: '@maxmustard'
      })

      const token = `Bearer ${newToken(user)}`
      const req = { headers: { authorization: token } }
      const next = () => {}

      await authGuard(req, {}, next)

      expect(req.user._id.toString()).toBe(user._id.toString())
      expect(req.user).not.toHaveProperty('password')
    })

    test('if blacklisted token is used it will return 401.', async () => {
      expect.assertions(2)

      const user = await User.create({
        email: 'max@mustard.com',
        password: '123456',
        fullName: 'Max Mustard',
        handle: '@maxmustard'
      })

      const bearer = `Bearer ${newToken(user)}`
      const token = bearer.split('Bearer ')[1]
      const { exp, iat } = jwt.decode(token)

      const req = { headers: { authorization: bearer } }
      await Blacklist.create({ token, exp, iat })

      const res = {
        status(code) {
          expect(code).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await authGuard(req, res)
    })

    test('if a blacklisted expired token is used it will return 401 unauthorized.', async () => {
      expect.assertions(2)

      const user = await User.create({
        email: 'max@mustard.com',
        password: '123456',
        fullName: 'Max Mustard',
        handle: '@maxmustard'
      })

      const bearer = `Bearer ${newToken(user)}`
      const token = bearer.split('Bearer ')[1]

      const req = { headers: { authorization: bearer } }
      await Blacklist.create({
        token,
        exp: 1578683384,
        iat: 1578683264
      })

      const res = {
        status(code) {
          expect(code).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await authGuard(req, res)
    })
  })
})
