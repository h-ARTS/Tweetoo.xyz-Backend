import * as mongoose from 'mongoose'
import { getBookmarks, createBookmark } from '../bookmarks.controller'
import { Bookmarks, IBookmark } from '../bookmarks.model'
import { User, IUser } from '../../user/user.model'
import { IRequestUser } from '../../../utils/auth'
import { Response } from 'express'

describe('Bookmarks-controller:', () => {
  let user: IUser
  beforeEach(async () => {
    user = await User.create({
      email: 'max@mustard.com',
      password: '1234567',
      fullName: 'Max Mustard',
      handle: '@maxmustard'
    })
    await Bookmarks.create({
      userId: user._id,
      tweetId: mongoose.Types.ObjectId()
    })
  })
  test('getBookmarks', async () => {
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

  test('createBookmark', async () => {
    expect.assertions(3)

    const tweetId = mongoose.Types.ObjectId()
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
        expect(result.tweetId).toEqual(tweetId)
      }
    } as Response

    await createBookmark(req, res)
  })
})
