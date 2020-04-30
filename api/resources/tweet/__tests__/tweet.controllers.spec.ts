import controllers, {
  appendReplyToTweet,
  removeReplyFromTweet
} from '../tweet.controllers'
import * as mongoose from 'mongoose'
import { Tweet, ITweet } from '../tweet.model'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

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

    crudMethods.forEach((method: string) => {
      expect(typeof controllers[method]).toBe('function')
    })
  })

  let tweet: ITweet
  beforeEach(async () => {
    tweet = await Tweet.create({
      createdBy: mongoose.Types.ObjectId(),
      fullText: 'This is my new tweet.',
      fullName: 'Dr Maxx',
      handle: '@Drmaxx'
    })
  })

  describe('appendReplyToTweet', () => {
    test('appends reply Id to the tweet replies object.', async () => {
      const req = {
        body: {
          doc: {
            _id: mongoose.Types.ObjectId(),
            tweetId: tweet._id
          }
        }
      } as Request
      const next = () => {}

      await appendReplyToTweet(req, {} as Response, next)

      req.body.tweet.replies.forEach((replyId: ObjectId) => {
        expect(replyId.toString()).toEqual(req.body.doc._id.toString())
      })
    })
  })

  describe('removeReplyFromTweet', () => {
    test('removes a reply id from tweet document.', async () => {
      const replyId = mongoose.Types.ObjectId()
      tweet.replies.push(replyId)
      await tweet.save()

      const req = {
        body: {
          removed: { _id: replyId, tweetId: tweet._id }
        }
      } as Request
      const next = () => {}

      await removeReplyFromTweet(req, {} as Response, next)

      const expectedTweet = await Tweet.findById(tweet._id)
      expect(expectedTweet.replies).toHaveLength(0)
    })
  })
})
