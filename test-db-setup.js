import mongoose from 'mongoose'
// import { User } from './api/resources/user/user.model'

const testingDbUrl = 'mongodb://localhost:27017/hanan-api-testing'

beforeEach(async done => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(testingDbUrl, {
        useNewUrlParser: true,
        autoIndex: true
      })
    } catch (e) {
      console.log('connection error')
      console.error(e)
      throw e
    }
  }

  done()
})

afterEach(async done => {
  await mongoose.connection.db.dropDatabase()
  await mongoose.disconnect()
  return done()
})

afterAll(done => {
  return done()
})
