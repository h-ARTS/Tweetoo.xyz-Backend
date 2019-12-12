import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

describe('API Authentication:', () => {
  let token
  beforeEach(async () => {
    // TODO: Create new user and token
  })
  describe('/api auth', () => {
    test('should be locked and throws 401 Unauthorized', async () => {})

    test('passes with JWT', async () => {})
  })
})
