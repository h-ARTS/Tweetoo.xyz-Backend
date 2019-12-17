import request from 'supertest'
import { app } from '../server'
import { User } from '../resources/user/user.model'
import { newToken } from '../utils/auth'
import mongoose from 'mongoose'

describe('API Authentication:', () => {
  let token
  beforeEach(async () => {
    const user = await User.create({
      email: 'max@mustard.com',
      password: '123456',
      fullName: 'Dr. Max Mustard',
      handle: '@DrMustard'
  })
    token = newToken(user)
  })

  describe('/api auth', () => {
    test('should be locked down and throws 401 Unauthorized', async () => {
      expect.assertions(4)

      let response = await request(app).get('/api/user')
      expect(response.statusCode).toBe(401)

      response = await request(app).get('/api/tweet')
      expect(response.statusCode).toBe(401)

      response = await request(app).get('/api/tweets')
      expect(response.statusCode).toBe(401)

      response = await request(app).get('/api/notifications')
      expect(response.statusCode).toBe(401)
    })
  })
})
