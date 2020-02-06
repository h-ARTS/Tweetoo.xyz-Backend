import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../server'
import { newToken } from '../auth'
import initNotificationEmitter, {
  notify,
  removeNotifyListeners
} from '../notificationEmitter'
import { Tweet } from '../../resources/tweet/tweet.model'
import { User } from '../../resources/user/user.model'
import { Notification } from '../../resources/notification/notification.model'

describe('Notification event emitter', () => {
  let user
  let token
  let tweet

  beforeEach(async () => {
    user = await User.create({
      email: 'jane@doe-company.org',
      password: '1234567',
      fullName: 'Jane Doe',
      handle: 'janeDoe'
    })
    initNotificationEmitter()

    token = `Bearer ${newToken(user)}`

    tweet = await Tweet.create({
      createdBy: mongoose.Types.ObjectId(),
      fullText: 'New tweet',
      fullName: 'Tom Boy',
      handle: 'tomBoy'
    })
  })

  test('should have reply, like, retweet and follow events', () => {
    const events = notify.eventNames()

    expect(events).toEqual(['reply', 'like', 'retweet', 'follow'])
    expect(events).toHaveLength(4)
  })

  test('notifies on reply and creates a new notification document.', async () => {
    expect.assertions(5)

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
        expect(notifications[0].type).toBe('reply')
      })
  })

  test('notifies on like and creates a new notification document.', async () => {
    expect.assertions(5)

    await request(app)
      .put(`/api/tweet/${tweet._id}/like`)
      .set('Authorization', token)
      .expect(201)
      .then(async () => {
        const notifications = await Notification.find()
        expect(notifications).toHaveLength(1)
        expect(notifications).not.toHaveLength(0)
        expect(notifications[0].sender).toBe(user.handle)
        expect(notifications[0].sender).not.toBe('tomBoy')
        expect(notifications[0].type).toBe('like')
      })
  })

  test('notifies on retweet and creates a new notification document.', async () => {
    expect.assertions(5)

    await request(app)
      .post(`/api/tweet/${tweet._id}/retweet`)
      .set('Authorization', token)
      .expect(201)
      .then(async () => {
        const notifications = await Notification.find()
        expect(notifications).toHaveLength(1)
        expect(notifications).not.toHaveLength(0)
        expect(notifications[0].sender).toBe(user.handle)
        expect(notifications[0].sender).not.toBe('tomBoy')
        expect(notifications[0].type).toBe('retweet')
      })
  })

  test('notifies on follow and creates a new notification document.', async () => {
    expect.assertions(5)

    const targetUser = await User.create({
      email: 'thomas@maccain.org',
      password: '1234567',
      fullName: 'Thomas K. Maccain',
      handle: 'thomas_mac'
    })

    await request(app)
      .put(`/api/user/${targetUser.handle}?follow=true`)
      .set('Authorization', token)
      .expect(200)
      .then(async () => {
        const notifications = await Notification.find()
        expect(notifications).toHaveLength(1)
        expect(notifications).not.toHaveLength(0)
        expect(notifications[0].sender).toBe(user.handle)
        expect(notifications[0].sender).not.toBe('thomas_mac')
        expect(notifications[0].type).toBe('follow')
      })
  })

  afterEach(() => {
    removeNotifyListeners()
  })
})
