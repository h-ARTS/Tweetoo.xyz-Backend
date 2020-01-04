import controllers, { appendToTweet } from '../tweet.controllers'
import mongoose from 'mongoose'
import { Tweet } from '../tweet.model'

describe('tweet controllers:', () => {
  test('has crud and like/unlike controllers', () => {
    const crudMethods = [
      'getOne',
      'getAll',
      'createOne',
      'updateOne',
      'removeOne',
      'likeDoc',
      'unlikeDoc'
    ]

    crudMethods.forEach(method => {
      expect(typeof controllers[method]).toBe('function')
    })
  })

  describe('appendToTweet', () => {
    test('appends reply Id to the tweet replies object.', async () => {
      const tweet = await Tweet.create({
        createdBy: mongoose.Types.ObjectId(),
        fullText: 'This is my new tweet.',
        fullName: 'Dr Maxx',
        handle: '@Drmaxx'
      })

      const req = {
        body: {
          doc: {
            _id: mongoose.Types.ObjectId(),
            tweetId: tweet._id
          }
        }
      }
      const next = () => {}

      await appendToTweet(req, {}, next)

      req.body.tweet.replies.forEach(replyId => {
        expect(replyId.toString()).toEqual(req.body.doc._id.toString())
      })
    })
  })
})
