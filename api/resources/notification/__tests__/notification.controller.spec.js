import request from 'supertest'
import { app } from '../../../server'
import { User } from '../../user/user.model'
import { getNotifications } from '../notification.controllers'
import { newToken } from '../../../utils/auth'
import initNotificationEmitter, {
  removeNotifyListeners
} from '../../../utils/notificationEmitter'

describe('Notification-controllers:', () => {
  initNotificationEmitter()

  let user, following
  beforeEach(async () => {
    user = await User.create({
      email: 'johndoe@gmail.com',
      password: 'safdsfsd',
      fullName: 'John Doe',
      handle: 'john_doe'
    })

    following = await User.create({
      email: 'chris@brian.org',
      password: 'fdfwecs',
      fullName: 'Chris J. Brian',
      handle: 'chris_b'
    })

    const token = newToken(user)

    await request(app)
      .put(`/api/user/${following.handle}?follow=true`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
  })

  test('getNotifications', async () => {
    expect.assertions(4)

    const req = {
      user: following
    }
    const res = {
      status(code) {
        expect(code).toBe(200)
        return this
      },
      json(result) {
        expect(result.notifications).not.toHaveLength(0)
        expect(result.notifications.length).toBeGreaterThan(0)
        result.notifications.forEach(notification => {
          expect(notification.recipient).toBe(req.user.handle)
        })
      }
    }

    await getNotifications(req, res)
  })

  afterEach(() => {
    removeNotifyListeners()
  })
})
