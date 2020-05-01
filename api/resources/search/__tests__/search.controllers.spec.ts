import * as mongoose from 'mongoose'
import { Response } from 'express'
import { getEntries } from '../search.controllers'
import { IRequestUser } from '../../../utils/auth'
import { IUser, User } from '../../user/user.model'
import { ITweet, Tweet } from '../../tweet/tweet.model'

describe('Search-controllers:', () => {
  let user: IUser
  let tweet: ITweet

  beforeEach(async () => {
    user = await User.create({
      email: 'paki@gmx.com',
      password: '1234567890',
      fullName: 'Paki',
      handle: 'Paki'
    })
    tweet = await Tweet.create({
      createdBy: user._id,
      fullText: 'This is my new tweet.',
      fullName: 'Paki',
      handle: 'Paki'
    })
  })
  describe('getEntries', () => {
    test('should return entries from tweets and users', async () => {
      expect.assertions(5)

      const req = {
        user: { _id: user._id },
        query: { entry: 'Paki' }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { users: IUser[]; tweets: ITweet[] }) {
          expect(result.users).not.toHaveLength(0)
          expect(result.tweets).not.toHaveLength(0)
          expect(result.users[0].handle).toEqual('Paki')
          expect(result.tweets[0].handle).toEqual('Paki')
        }
      } as Response

      await getEntries(req, res)
    })

    test('should return entries from tweets when random text entered', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        query: { entry: 'new tweet' }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { users: IUser[]; tweets: ITweet[] }) {
          expect(result.tweets).not.toHaveLength(0)
          expect(result.tweets[0].fullText.includes('new tweet')).toBe(true)
        }
      } as Response

      await getEntries(req, res)
    })
  })
})
