import { User, IUser } from '../../user/user.model'
import { Tweet, ITweet } from '../../tweet/tweet.model'
import { Like, ILike } from '../like.model'
import { likeDoc, unlikeDoc } from '../like.controller'
import { Types } from 'mongoose'
import { IRequestUser } from '../../../utils/auth'
import { Response } from 'express'

describe('Like controllers:', () => {
  describe('likeDoc', () => {
    let user: IUser
    let tweet: ITweet

    beforeEach(async () => {
      user = await User.create({
        email: 'max@mustard.com',
        password: '1234567',
        fullName: 'Max Mustard',
        handle: '@maxmustard'
      })
      tweet = await Tweet.create({
        fullText: 'Hey my example tweet',
        createdBy: user._id,
        fullName: user.fullName,
        handle: user.handle
      })
    })

    test('creates a like doc with the associated tweet id and user id.', async () => {
      expect.assertions(5)

      const req = {
        params: { tweetId: tweet._id },
        query: {},
        user: { _id: user._id, handle: user.handle }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { doc: ITweet, like: ILike }) {
          const tweetIds = [tweet._id, result.doc._id]
          const userIds = [user._id, result.doc.createdBy]
          tweetIds.forEach(tweetId => {
            expect(tweetId.toString()).toBe(result.like.docId.toString())
          })
          userIds.forEach(userId => {
            expect(userId.toString()).toBe(result.like.createdBy.toString())
          })
        }
      } as Response

      await likeDoc(Tweet)(req, res)
    })

    test('increases the likeCount by 1.', async () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: tweet._id
        },
        query: {},
        user: { _id: user._id, handle: user.handle }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { doc: ITweet, like: ILike }) {
          expect(result.doc.likeCount).toBe(1)
          expect(result.like).not.toEqual({})
        }
      } as Response

      await likeDoc(Tweet)(req, res)
    })

    test('should not increase the likeCount and create a new doc again if already liked.', 
      async () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: tweet._id
        },
        query: {},
        user: { _id: user._id, handle: user.handle }
      } as IRequestUser

      await Like.create({
        docId: Types.ObjectId(req.params.tweetId),
        createdBy: req.user._id,
        handle: req.user.handle
      })

      await tweet.updateOne({ $inc: { likeCount: 1 } })

      const res = {
        status(code: number) {
          expect(code).toBe(400)
          return this
        },
        async send(result: { message: string }) {
          const likes = await Like.find()
            .lean()
            .exec()
          expect(likes).toHaveLength(1)
          expect(typeof result.message).toBe('string')
        }
      } as any //TODO: Define exact type

      await likeDoc(Tweet)(req, res)
    })
  })

  describe('unlikeDoc', () => {
    let user: IUser
    let tweet: ITweet

    beforeEach(async () => {
      user = await User.create({
        email: 'max@mustard.com',
        password: '1234567',
        fullName: 'Max Mustard',
        handle: '@maxmustard'
      })

      tweet = await Tweet.create({
        fullText: 'Hey my example tweet',
        createdBy: user._id,
        fullName: user.fullName,
        handle: user.handle,
        likeCount: 1
      })

      await Like.create({
        docId: tweet._id,
        createdBy: user._id,
        handle: user.handle
      })
    })

    test('removes a like doc with the associated tweet id and user id.', async () => {
      expect.assertions(3)

      const req = {
        params: { tweetId: tweet._id },
        query: {},
        user: { _id: user._id, handle: user.handle }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { doc: ITweet, removedLike: ILike }) {
          expect(result.doc._id.toString()).toBe(
            result.removedLike.docId.toString()
          )
          expect(result.doc.createdBy.toString()).toBe(
            result.removedLike.createdBy.toString()
          )
        }
      } as Response

      await unlikeDoc(Tweet)(req, res)
    })

    test('decreases the likeCount by 1.', async () => {
      expect.assertions(2)

      const req = {
        params: { tweetId: tweet._id },
        query: {},
        user: { _id: user._id, handle: user.handle }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        async json(result: { doc: ITweet }) {
          const updatedTweet = await Tweet.findById(result.doc._id)
          expect(updatedTweet.likeCount).toBe(0)
        }
      } as any // TODO: Define exact type

      await unlikeDoc(Tweet)(req, res)
    })

    test('does not decrease the likeCount if is set to 0.', async () => {
      expect.assertions(3)

      await Like.findOneAndDelete({
        docId: tweet._id,
        createdBy: user._id
      })
      await tweet.updateOne({ $inc: { likeCount: -1 } })

      const req = {
        params: { tweetId: tweet._id },
        query: {},
        user: { _id: user._id, handle: user.handle }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(400)
          return this
        },
        send(result: { message: string }) {
          expect(typeof result.message).toBe('string')
          expect(tweet.likeCount).not.toBe(-1)
        }
      } as Response

      await unlikeDoc(Tweet)(req, res)
    })
  })
})
