import { getBookmarks, createBookmark } from '../bookmarks.controller'
import { Bookmarks } from '../bookmarks.model'
import mongoose from 'mongoose'
import { User } from '../../user/user.model'

describe('Bookmarks-controller:', () => {
  let user
  beforeEach(async () => {
    user = await User.create({
      email: 'max@mustard.com',
      password: '1234567',
      fullName: 'Max Mustard',
      handle: '@maxmustard'
    })
    await Bookmarks.create({
      userId: user._id,
      tweet: {
        tweetId: mongoose.Types.ObjectId(),
        fullText: 'Bla bla',
        fullName: 'Pakster',
        handle: 'paki',
        createdBy: mongoose.Types.ObjectId(),
        likeCount: 1,
        retweetCount: 0,
        userImageUrl: 'media/standard/no_cover.jpg'
      }
    })
  })
  test('getBookmarks', async () => {
    expect.assertions(2)

    const req = { user }

    const res = {
      status(code) {
        expect(code).toBe(200)
        return this
      },
      json(result) {
        expect(result).toHaveLength(1)
      }
    }

    await getBookmarks(req, res)
  })

  test('createBookmark', async () => {
    expect.assertions(3)

    const tweetId = mongoose.Types.ObjectId()
    const req = {
      user,
      body: {
        tweet: {
          handle: 'julian',
          fullText: 'Bla bla',
          fullName: 'Julian Manfred',
          likeCount: 1,
          retweetCount: 0,
          createdBy: mongoose.Types.ObjectId(),
          userImageUrl: 'media/standard/no_cover.jpg'
        },
        tweetId
      }
    }
    const res = {
      status(code) {
        expect(code).toBe(201)
        return this
      },
      json(result) {
        expect(result.userId).toEqual(user._id)
        expect(result.tweet.tweetId).toEqual(tweetId)
      }
    }

    await createBookmark(req, res)
  })
})
