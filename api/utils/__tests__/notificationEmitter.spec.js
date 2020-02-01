import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../server'
import initNotificationEmitter, {
  notify,
  removeNotifyListeners
} from '../notificationEmitter'
import { Tweet } from '../../resources/tweet/tweet.model'
import { User } from '../../resources/user/user.model'
import { Notification } from '../../resources/notification/notification.model'

describe('Notification event emitter', () => {
  let user
  beforeEach(async () => {
    user = await User.create({
      email: 'jane@doe-company.org',
      password: '1234567',
      fullName: 'Jane Doe',
      handle: 'janeDoe'
    })
    initNotificationEmitter()
  })

  test('should have reply, like, retweet and follow events', () => {
    const events = notify.eventNames()

    expect(events).toEqual(['reply', 'like', 'retweet', 'follow'])
    expect(events).toHaveLength(4)
  })

  test('notifies on reply and creates a new notification document.', async () => {
    expect.assertions(4)

    let token
    await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'jane@doe-company.org',
        password: '1234567'
      })
      .then(res => {
        token = 'Bearer ' + res.text.replace(/['"]+/g, '')
      })

    const tweet = await Tweet.create({
      createdBy: mongoose.Types.ObjectId(),
      fullText: 'New tweet',
      fullName: 'Tom Boy',
      handle: 'tomBoy'
    })

    await request(app)
      .post(`/api/reply/?tweetId=${tweet._id}`)
      .set('Authorization', token)
      .send({ fullText: 'New reply' })
      .expect(201)
      .then(async () => {
        const notifications = await Notification.find()
        expect(notifications).toHaveLength(1)
        expect(notifications).not.toHaveLength(0)
        expect(notifications[0].sender).toBe(user.handle)
        expect(notifications[0].sender).not.toBe('tomBoy')
      })
  })

  afterEach(() => {
    removeNotifyListeners()
  })
})
