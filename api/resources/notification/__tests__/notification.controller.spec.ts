import * as request from 'supertest'
import { Response } from 'express'
import { app } from '../../../server'
import { User, IUser } from '../../user/user.model'
import {
  getNotifications,
  updateAllNotifications
} from '../notification.controllers'
import { newToken, IRequestUser } from '../../../utils/auth'
import initNotificationEmitter, {
  removeNotifyListeners
} from '../../../utils/notificationEmitter'
import { IFollower } from '../../user/follower.schema'
import { INotification } from '../notification.model'

describe('Notification-controllers:', () => {
  initNotificationEmitter()

  let user: IUser, following: IFollower
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
    } as IRequestUser
    const res = {
      status(code: number) {
        expect(code).toBe(200)
        return this
      },
      json(result: INotification[]) {
        expect(result).not.toHaveLength(0)
        expect(result.length).toBeGreaterThan(0)
        result.forEach(notification => {
          expect(notification.recipient).toBe(req.user.handle)
        })
      }
    } as Response

    await getNotifications(req, res)
  })

  test('updateAllNotifications', async () => {
    expect.assertions(2)

    const req = {
      body: { read: true }
    } as IRequestUser
    
    const res = {
      status(code: number) {
        expect(code).toBe(200)
        return this
      },
      json(result: INotification) {
        expect(result).toEqual({ read: true })
      }
    } as Response

    await updateAllNotifications(req, res)
  })

  afterEach(() => {
    removeNotifyListeners()
  })
})
