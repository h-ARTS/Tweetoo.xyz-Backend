import { User } from '../../user/user.model'
import { Tweet } from '../../tweet/tweet.model'
import { Like } from '../like.model'
import { likeDoc, unlikeDoc } from '../like.controller'
import { Types } from 'mongoose'

describe('Like controllers:', () => {
  describe('likeDoc', () => {
    let user
    let tweet

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
        body: {},
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          const tweetIds = [tweet._id, result.doc._id]
          const userIds = [user._id, result.doc.createdBy]
          tweetIds.forEach(tweetId => {
            expect(tweetId.toString()).toBe(result.like.docId.toString())
          })
          userIds.forEach(userId => {
            expect(userId.toString()).toBe(result.like.createdBy.toString())
          })
        }
      }

      await likeDoc(Tweet)(req, res)
    })

    test('increases the likeCount by 1.', async () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: tweet._id
        },
        body: {},
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          expect(result.doc.likeCount).toBe(1)
          expect(result.like).not.toEqual({})
        }
      }

      await likeDoc(Tweet)(req, res)
    })

    test('does not increase the likeCount and create a new doc again if already liked.', async () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: tweet._id
        },
        body: {},
        user: user
      }

      await Like.create({
        docId: Types.ObjectId(req.params.tweetId),
        createdBy: req.user._id,
        handle: req.user.handle
      })

      await tweet.updateOne({ $inc: { likeCount: 1 } })

      const res = {
        status(code) {
          expect(code).toBe(400)
          return this
        },
        async send(result) {
          const likes = await Like.find()
            .lean()
            .exec()
          expect(typeof result.message).toBe('string')
          expect(likes).toHaveLength(1)
        }
      }

      await likeDoc(Tweet)(req, res)
    })
  })

  describe('unlikeDoc', () => {
    let user
    let tweet

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
        body: {},
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          expect(result.doc._id.toString()).toBe(
            result.removedLike.docId.toString()
          )
          expect(result.doc.createdBy.toString()).toBe(
            result.removedLike.createdBy.toString()
          )
        }
      }

      await unlikeDoc(Tweet)(req, res)
    })

    test('decreases the likeCount by 1.', async () => {
      expect.assertions(2)

      const req = {
        params: { tweetId: tweet._id },
        body: {},
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        async json(result) {
          const updatedTweet = await Tweet.findById(result.doc._id)

          expect(updatedTweet.likeCount).toBe(0)
        }
      }

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
        body: {},
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
          expect(tweet.likeCount).not.toBe(-1)
        }
      }

      await unlikeDoc(Tweet)(req, res)
    })
  })
})
