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
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          const tweetIds = [tweet._id, result.tweet._id]
          const userIds = [user._id, result.tweet.createdBy]
          tweetIds.forEach(tweetId => {
            expect(tweetId.toString()).toBe(result.like.tweetId.toString())
          })
          userIds.forEach(userId => {
            expect(userId.toString()).toBe(result.like.createdBy.toString())
          })
        }
      }

      await likeDoc(req, res)
    })

    test('increased the likeCount by 1.', async () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: tweet._id
        },
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          expect(result.tweet.likeCount).toBe(1)
          expect(result.like).not.toEqual({})
        }
      }

      await likeDoc(req, res)
    })

    test('does not increase the likeCount and create a new doc again if already liked.', async () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: tweet._id
        },
        user: user
      }

      await Like.create({
        tweetId: Types.ObjectId(req.params.tweetId),
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

      await likeDoc(req, res)
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
        tweetId: tweet._id,
        createdBy: user._id,
        handle: user.handle
      })
    })

    test('removes a like doc with the associated tweet id and user id.', async () => {
      expect.assertions(3)

      const req = {
        params: { tweetId: tweet._id },
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.tweet._id.toString()).toBe(
            result.removedLike.tweetId.toString()
          )
          expect(result.tweet.createdBy.toString()).toBe(
            result.removedLike.createdBy.toString()
          )
        }
      }

      await unlikeDoc(req, res)
    })

    test('decreases the likeCount by 1.', async () => {
      expect.assertions(2)

      const req = {
        params: { tweetId: tweet._id },
        user: user
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        async json(result) {
          const updatedTweet = await Tweet.findById(result.tweet._id)
          expect(updatedTweet.likeCount).toBe(0)
        }
      }

      await unlikeDoc(req, res)
    })

    test('does not decrease the likeCount if is set to 0.', async () => {
      const like = await Like.findOne({
        tweetId: tweet._id,
        createdBy: user._id
      })
      await like.deleteOne()
      await tweet.updateOne({ $inc: { likeCount: -1 } })

      expect.assertions(3)

      const req = {
        params: { tweetId: tweet._id },
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

      await unlikeDoc(req, res)
    })
  })
})
