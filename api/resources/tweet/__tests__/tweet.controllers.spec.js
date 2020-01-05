import controllers, {
  appendReplyToTweet,
  removeReplyFromTweet
} from '../tweet.controllers'
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

  let tweet
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
      }
      const next = () => {}

      await appendReplyToTweet(req, {}, next)

      req.body.tweet.replies.forEach(replyId => {
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
      }
      const next = () => {}

      await removeReplyFromTweet(req, {}, next)

      const expectedTweet = await Tweet.findById(tweet._id)
      expect(expectedTweet.replies).toHaveLength(0)
    })
  })
})
