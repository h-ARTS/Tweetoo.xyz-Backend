import * as mongoose from 'mongoose'
import {
  getBookmarks,
  createBookmark,
  removeBookmark
} from '../bookmarks.controller'
import { Bookmarks, IBookmark } from '../bookmarks.model'
import { User, IUser } from '../../user/user.model'
import { IRequestUser } from '../../../utils/auth'
import { Response } from 'express'

describe('Bookmarks-controller:', () => {
  let user: IUser
  const tweetId = mongoose.Types.ObjectId()
  beforeEach(async () => {
    user = await User.create({
      email: 'max@mustard.com',
      password: '1234567',
      fullName: 'Max Mustard',
      handle: '@maxmustard'
    })
    await Bookmarks.create({
      userId: user._id,
      tweetId
    })
  })

  describe('getBookmarks', () => {
    test('should get bookmarks from the authenticated user', async () => {
      expect.assertions(2)

      const req = { user: { _id: user._id } } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: IBookmark[]) {
          expect(result).toHaveLength(1)
        }
      } as Response

      await getBookmarks(req, res)
    })
  })

  describe('createBookmark', () => {
    test('should create a new bookmark based on tweet id', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        body: {
          tweetId
        }
      } as IRequestUser
      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: IBookmark) {
          expect(result.userId).toEqual(user._id)
          expect(result.tweetId.toString()).toEqual(tweetId.toHexString())
        }
      } as Response

      await createBookmark(req, res)
    })
  })

  describe('removeBookmark', () => {
    test('should remove bookmark', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        query: {
          tweetId: tweetId.toHexString()
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: IBookmark) {
          expect(result.tweetId.toString()).toBe(tweetId.toHexString())
          expect(result.userId.toString()).toBe(user._id.toString())
        }
      } as Response

      await removeBookmark(req, res)
    })
  })
})
