import {
  newToken,
  verifyToken,
  signup,
  login,
  authGuard,
  IRequestUser
} from '../auth'
import * as jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { User, IUser } from '../../resources/user/user.model'
import config from '../../../config'
import { Blacklist } from '../../resources/blacklist-token/blacklist.model'
import { Request, Response } from 'express'

describe('Authentication:', () => {
  describe('newToken', () => {
    test('creates a new json web token from user id.', () => {
      const id = 493
      const token = newToken({ id })
      jwt.verify(token, config.secrets.publicKey, (err: null|Error, payload: IUser) => {
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

      const req = { body: {} } as Request
      const res = {
        status(code: number) {
          expect(code).toBe(400)
          return this
        },
        send(result: { message: string }) {
          expect(typeof result.message).toBe('string')
        }
      } as Response

      await login(req, res)
    })

    test('user must exist.', async () => {
      expect.assertions(2)

      const req = { 
        body: { 
          email: 'wrong@me.com', 
          password: '1234' 
        } 
      } as Request
      const res = {
        status(code: number) {
          expect(code).toBe(401)
          return this
        },
        send(result: { message: string }) {
          expect(typeof result.message).toBe('string')
        }
      } as Response

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
      } as Request
      const res = {
        status(code: number) {
          expect(code).toBe(401)
          return this
        },
        send(result: { message: string }) {
          expect(typeof result.message).toBe('string')
        }
      } as Response

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
      } as Request
      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        async json(token: string) {
          let user: IUser = await verifyToken(token)
          user = await User.findById(user.id)
            .lean()
          expect(user._id.toString()).toBe(savedUser._id.toString())
        }
      } as any // TODO: Define exact type

      await login(req, res)
    })
  })

  describe('signup', () => {
    test('requires email and password, full name and user handle.', async () => {
      expect.assertions(2)

      const req = { body: {} } as Request
      const res = {
        status(code: number) {
          expect(code).toBe(400)
          return this
        },
        send(result: { message: string }) {
          expect(typeof result.message).toBe('string')
        }
      } as Response

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
      } as Request
      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        async json(token: string) {
          let user: IUser = await verifyToken(token)
          user = await User.findById(user.id)
            .lean()

          expect(user.email).toBe(req.body.email)
        }
      } as any // TODO: Define exact type

      await signup(req, res)
    })
  })

  describe('authGuard', () => {
    test('looks for Bearer token in headers.', async () => {
      expect.assertions(2)

      const req = { headers: {} } as IRequestUser
      const res = {
        status(code: number) {
          expect(code).toBe(401)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

      await authGuard(req, res)
    })

    test('looks for the token and must have correct prefix.', async () => {
      expect.assertions(2)

      const req = { headers: { authorization: newToken({ id: '32758gf' }) } } as IRequestUser
      const res = {
        status(code: number) {
          expect(code).toBe(401)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

      await authGuard(req, res)
    })

    test('checks for a real user.', async () => {
      expect.assertions(2)

      const token = `Bearer ${newToken({ id: Types.ObjectId() })}`
      const req = { headers: { authorization: token } } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(401)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

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
      const req = { headers: { authorization: token } } as IRequestUser
      const next = () => {}

      await authGuard(req, {} as Response, next)

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
      // TODO: Define exact type
      const { exp, iat }: any = jwt.decode(token)

      const req = { headers: { authorization: bearer } } as IRequestUser
      await Blacklist.create({ token, exp, iat })

      const res = {
        status(code: number) {
          expect(code).toBe(401)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

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

      const req = { headers: { authorization: bearer } } as IRequestUser
      await Blacklist.create({
        token,
        exp: 1578683384,
        iat: 1578683264
      })

      const res = {
        status(code: number) {
          expect(code).toBe(401)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

      await authGuard(req, res)
    })
  })

  // TODO: Create logout tests
})
