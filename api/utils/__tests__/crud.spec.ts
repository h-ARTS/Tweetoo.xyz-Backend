import * as mongoose from 'mongoose'
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  removeOne,
  reTweet,
  undoRetweet,
  getAllLiked,
  getSpecific
} from '../crud'
import { Tweet, ITweet, IUserTweet } from '../../resources/tweet/tweet.model'
import { User, IUser } from '../../resources/user/user.model'
import { Reply, IReply, IUserReply } from '../../resources/reply/reply.model'
import { Like, ILike } from '../../resources/like/like.model'
import { IRequestUser } from '../auth'
import { Response } from 'express'

describe('CRUD controllers for Tweets and Replies:', () => {
  describe('getAll', () => {
    test('finds an array of docs.', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()

      await Tweet.create([
        {
          createdBy: user,
          fullText: 'My tweet 1. Yaaay!',
          fullName: 'Dr Maxx',
          handle: '@drmxx'
        },
        {
          createdBy: user,
          fullText: 'Wow this is awesome!',
          fullName: 'Dr Maxx',
          handle: '@drmxx'
        },
        {
          createdBy: user,
          fullText: 'Great news here now at TV.',
          fullName: 'Dr Maxx',
          handle: '@drmxx'
        }
      ])

      const req = {
        user: {
          _id: user
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: any) {
          expect(result.data).toHaveLength(3)
        }
      } as Response

      await getAll(Tweet)(req, res)
    })
  })

  describe('getSpecific', () => {
    const user = mongoose.Types.ObjectId()
    let tweetOne: ITweet
    let tweetTwo: ITweet
    let tweetThree: ITweet

    beforeEach(async () => {
      tweetOne = await Tweet.create({
        createdBy: user,
        fullText: 'My tweet 1. Yaaay!',
        fullName: 'Dr Maxx',
        handle: '@drmxx'
      })
      tweetTwo = await Tweet.create({
        createdBy: user,
        fullText: 'Wow this is awesome!',
        fullName: 'Dr Maxx',
        handle: '@drmxx'
      })
      tweetThree = await Tweet.create({
        createdBy: user,
        fullText: 'Great news here now at TV.',
        fullName: 'Dr Maxx',
        handle: '@drmxx'
      })
    })

    test('should find docs specified from a given array of _id', async () => {
      expect.assertions(5)

      const req = {
        user: {
          _id: user
        },
        body: {
          docs: [tweetOne._id, tweetTwo._id, tweetThree._id]
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: any) {
          expect(result).toHaveLength(3)
          result.forEach((tweet: ITweet, idx: number) => {
            expect(tweet._id).toEqual(req.body.docs[idx])
          })
        }
      } as Response

      await getSpecific(Tweet)(req, res)
    })

    test('should return 404 if no docs found', async () => {
      expect.assertions(3)

      const req = {
        user: {
          _id: user
        },
        body: {
          docs: [
            mongoose.Types.ObjectId(),
            mongoose.Types.ObjectId(),
            mongoose.Types.ObjectId()
          ]
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        send(result: string) {
          expect(result).toEqual('No docs found')
        }
      } as Response

      await getSpecific(Tweet)(req, res)
    })
  })

  describe('getOne', () => {
    test('finds a doc by id.', async () => {
      expect.assertions(2)

      const tweet = await Tweet.create({
        createdBy: mongoose.Types.ObjectId(),
        fullText: 'This is my new tweet.',
        fullName: 'Dr Maxx',
        handle: '@Drmaxx'
      })

      const req = {
        params: {
          tweetId: tweet._id
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: any) {
          expect(result.data._id.toString()).toBe(tweet._id.toString())
        }
      } as Response

      await getOne(Tweet)(req, res)
    })

    test('responds 404 if no doc was found.', async () => {
      expect.assertions(2)

      const req = {
        params: {
          tweetId: mongoose.Types.ObjectId().toHexString()
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

      await getOne(Tweet)(req, res)
    })
  })

  describe('getAllLiked', () => {
    const createdBy = mongoose.Types.ObjectId()
    let tweet: ITweet
    let like: ILike

    beforeEach(async () => {
      tweet = await Tweet.create({
        createdBy,
        fullText: 'This is my new tweet.',
        fullName: 'Dr Maxx',
        handle: 'Drmaxx',
        likeCount: 1
      })
      like = await Like.create({
        createdBy,
        docId: tweet._id,
        handle: 'Drmaxx'
      })
    })

    test('should get all liked tweets/replies.', async () => {
      expect.assertions(3)

      const req = { user: { _id: createdBy } } as IRequestUser
      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: any) {
          expect(result[0].handle).toEqual(like.handle)
          expect(result[0]._id).toEqual(tweet._id)
        }
      } as Response

      await getAllLiked(Tweet)(req, res)
    })
  })

  describe('createOne', () => {
    const createdBy = mongoose.Types.ObjectId()

    test('creates a new doc.', async () => {
      const body = {
        fullText: 'My new tweet!'
      }

      const req = {
        user: { _id: createdBy, fullName: 'Max', handle: '@max' },
        query: {},
        body
      } as IRequestUser
      const next = () => {}

      await createOne(Tweet)(req, {} as Response, next)

      expect(req.body.hasOwnProperty('doc')).toBe(true)
    })

    test('createdBy should be the authenticated user.', async () => {
      const body = {
        fullText: 'This is another test tweet.'
      }

      const req = {
        user: { _id: createdBy, fullName: 'Max Fritz', handle: '@maxFritz' },
        query: {},
        body
      } as IRequestUser
      const next = () => {}

      await createOne(Tweet)(req, {} as Response, next)

      expect(req.body.doc).toEqual(
        expect.objectContaining({
          createdBy: req.user._id
        })
      )
    })
  })

  describe('updateOne', () => {
    test('finds a doc by authenticated user and id to update.', async () => {
      expect.assertions(3)

      const user = mongoose.Types.ObjectId()
      const tweet = await Tweet.create({
        fullText: 'My new tweet for update',
        createdBy: user,
        fullName: 'Max',
        handle: '@max'
      })

      const update = { fullText: 'Hot news here now! 🔥 #hot_news' }

      const req = {
        params: { tweetId: tweet._id },
        user: { _id: user },
        body: update
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: any) {
          expect(result.data._id.toString()).toBe(tweet._id.toString())
          expect(result.data.fullText).toBe(update.fullText)
        }
      } as Response

      await updateOne(Tweet)(req, res)
    })

    test('responds 404 if no doc was found.', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const update = { fullText: 'hello' }

      const req = {
        params: { tweetId: mongoose.Types.ObjectId().toHexString() },
        user: { _id: user },
        body: update
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

      await updateOne(Tweet)(req, res)
    })
  })

  describe('removeOne', () => {
    test('removes one doc by authenticated user and id.', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const tweet = await Tweet.create({
        fullText: 'My new tweet for update',
        createdBy: user,
        fullName: 'Max',
        handle: '@max'
      })

      const req = {
        params: { tweetId: tweet._id },
        user: { _id: user },
        body: {}
      } as IRequestUser
      const next = () => {}

      await removeOne(Tweet)(req, {} as Response, next)

      expect(req.body.removed).not.toBe({})
      expect(req.body.removed).toEqual(
        expect.objectContaining({
          _id: req.params.tweetId,
          createdBy: req.user._id
        })
      )
    })

    test('responds 404 if no doc was found.', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()

      const req = {
        params: { tweetId: mongoose.Types.ObjectId().toHexString() },
        user: { _id: user }
      } as IRequestUser
      const next = () => {}

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        send(result: { message: string }) {
          expect(result.message).not.toBe('')
        }
      } as Response

      await removeOne(Tweet)(req, res, next)
    })
  })

  describe('reTweet', () => {
    let user: IUser
    let tweet: ITweet
    let reply: IReply
    beforeEach(async () => {
      user = await User.create({
        email: 'max2@aol.com',
        password: '123456',
        fullName: 'Max 2Ol',
        handle: '@max_o2'
      })
      reply = await Reply.create({
        createdBy: mongoose.Types.ObjectId(),
        fullText: 'This is my new tweet.',
        fullName: 'Dr Maxx',
        handle: '@Drmaxx',
        tweetId: mongoose.Types.ObjectId()
      })
      tweet = await Tweet.create({
        createdBy: mongoose.Types.ObjectId(),
        fullText: 'This is my new tweet.',
        fullName: 'Dr Maxx',
        handle: '@Drmaxx'
      })
    })

    test('adds a reply reference doc to the authenticated user.', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        params: {},
        query: { replyId: reply._id }
      } as IRequestUser // TODO: Define exact type

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: any) {
          result.user.replies.forEach((reply: IUserReply) => {
            expect(reply.replyId.toString()).toEqual(
              req.query.replyId.toString()
            )
          })
          expect(result.user.replies).toHaveLength(1)
        }
      } as Response

      await reTweet(Reply)(req, res)
    })

    test('adds a tweet reference doc to the authenticated user.', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        params: { tweetId: tweet._id }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: any) {
          result.user.tweets.forEach((tweet: IUserTweet) => {
            expect(tweet.tweetId.toString()).toEqual(
              req.params.tweetId.toString()
            )
          })
          expect(result.user.tweets).toHaveLength(1)
        }
      } as Response

      await reTweet(Tweet)(req, res)
    })

    test('sets the retweet count by 1.', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        params: { tweetId: tweet._id }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { user: IUser, doc: ITweet|IReply }) {
          expect(result.user.tweets).toHaveLength(1)
          expect(result.doc.retweetCount).toBe(1)
        }
      } as Response

      await reTweet(Tweet)(req, res)
    })

    test('sets the retweet property to true.', async () => {
      expect.assertions(2)

      const req = {
        user: { _id: user._id },
        params: { tweetId: tweet._id }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: any) {
          const doc = result.user.tweets.find(
            (t: IUserTweet) => t.tweetId.toString() === req.params.tweetId.toString()
          )
          expect(doc.retweet).toBe(true)
        }
      } as Response

      await reTweet(Tweet)(req, res)
    })

    test('responds 404 if no tweet or reply was found.', async () => {
      expect.assertions(2)

      const req = {
        user: { _id: user._id },
        params: { tweetId: mongoose.Types.ObjectId().toHexString() }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        send(result: { message: string }) {
          expect(result.message).not.toBe('')
        }
      } as Response

      await reTweet(Tweet)(req, res)
    })
  })

  describe('undoRetweet', () => {
    let user: IUser
    let tweet: ITweet
    let reply: IReply
    beforeEach(async () => {
      user = await User.create({
        email: 'max2@aol.com',
        password: '123456',
        fullName: 'Max 2Ol',
        handle: '@max_o2'
      })
      tweet = await Tweet.create({
        createdBy: mongoose.Types.ObjectId(),
        fullText: 'This is my new tweet.',
        fullName: 'Dr Maxx',
        handle: '@Drmaxx',
        retweetCount: 1
      })
      reply = await Reply.create({
        createdBy: mongoose.Types.ObjectId(),
        fullText: 'This is my new reply.',
        fullName: 'Dr Maxx',
        handle: '@Drmaxx',
        tweetId: tweet._id,
        retweetCount: 1
      })
      user.tweets.push({ retweet: true, tweetId: tweet._id })
      user.replies.push({
        retweet: true,
        replyId: reply._id,
        tweetId: tweet._id
      })
      await user.save()
    })

    test('removes the tweet by id from the authenticated user.', async () => {
      expect.assertions(2)

      const req = {
        user: { _id: user._id },
        params: { tweetId: tweet._id }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { user: IUser }) {
          expect(result.user.tweets).toHaveLength(0)
        }
      } as Response

      await undoRetweet(Tweet)(req, res)
    })

    test('removes the reply by id from the authenticated user.', async () => {
      expect.assertions(2)

      const req = {
        user: { _id: user._id },
        params: {},
        query: { replyId: reply._id }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { user: IUser }) {
          expect(result.user.replies).toHaveLength(0)
        }
      } as Response

      await undoRetweet(Reply)(req, res)
    })

    test('decreases the retweet count by 1.', async () => {
      expect.assertions(2)

      const req = {
        user: { _id: user._id },
        params: { tweetId: tweet._id }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { doc: ITweet|IReply }) {
          expect(result.doc.retweetCount).toBe(0)
        }
      } as Response

      await undoRetweet(Tweet)(req, res)
    })

    test('responds 404 if no tweet was found.', async () => {
      expect.assertions(2)

      const req = {
        user: { _id: user._id },
        params: { tweetId: mongoose.Types.ObjectId().toHexString() }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        send(result: { message: string }) {
          expect(result.message).not.toBe('')
        }
      } as Response

      await undoRetweet(Tweet)(req, res)
    })
  })
})
