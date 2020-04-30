import * as mongoose from 'mongoose'
import * as request from 'supertest'
import { app } from '../server'
import { User } from '../resources/user/user.model'
import { newToken } from '../utils/auth'

describe('API Authentication:', () => {
  let token: string
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
      expect(response.status).toBe(401)

      response = await request(app).get('/api/tweet')
      expect(response.status).toBe(401)

      response = await request(app).get('/api/tweets')
      expect(response.status).toBe(401)

      response = await request(app).get('/api/notifications')
      expect(response.status).toBe(401)
    })

    test('passes with JWT', async () => {
      const jwt = `Bearer ${token}`
      const id = mongoose.Types.ObjectId()
      const results = await Promise.all([
        request(app)
          .get('/api/tweets')
          .set('Authorization', jwt),
        request(app)
          .get(`/api/tweet/${id}`)
          .set('Authorization', jwt),
        request(app)
          .post(`/api/tweet/${id}`)
          .set('Authorization', jwt),
        request(app)
          .put(`/api/tweet/${id}`)
          .set('Authorization', jwt),
        request(app)
          .delete(`/api/tweet/${id}`)
          .set('Authorization', jwt)
      ])

      return results.forEach(res => {
        expect(res.status).not.toBe(401)
      })
    })
  })
})
