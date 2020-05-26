import controllers, {
  appendReplyToTweet,
  removeReplyFromTweet,
  saveCachedTweetMedias
} from '../tweet.controllers'
import * as mongoose from 'mongoose'
import { Tweet, ITweet } from '../tweet.model'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { IRequestUser } from '../../../utils/auth'

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
      const next = () => { }

      await appendReplyToTweet(req, {} as Response, next)

      req.body.tweet.replies.forEach((replyId: ObjectId) => {
        expect(replyId.toString()).toEqual(req.body.doc._id.toString())
      })
    })
  })

  describe('saveCachedTweetMedias:', () => {
    test('should create Media docs from request.files object', async () => {
      expect.assertions(5)

      const req = {
        files: [{
          path: 'media/_cached/something.jpg',
          filename: 'something.jpg',
          mimetype: 'image/jpeg'
        }],
        user: {
          handle: 'paki'
        }
      } as IRequestUser
      const next = () => { }

      await saveCachedTweetMedias(req, {} as Response, next)

      expect(req.medias).not.toHaveLength(0)
      req.medias.forEach(media => {
        expect(media.path).toBe(req.files[0].path)
        expect(media.originalname).toBe(req.files[0].filename)
        expect(media.mimetype).toBe(req.files[0].mimetype)
        expect(media.handle).toBe(req.user.handle)
      })
    })

    test('should not create media doc and return 400 if insufficient props provided', async () => {
      expect.assertions(2)

      const req = {
        files: [{
          path: 'media/_cached/something.jpg'
        }],
        user: {
          handle: 'paki'
        }
      } as IRequestUser
      const next = () => { }

      const res = {
        status(code: number) {
          expect(code).toBe(400)
          return this
        },
        send(message: string) {
          expect(message).toBe('Cached tweet images cant be created')
        }
      } as Response

      await saveCachedTweetMedias(req, res, next)
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
      const next = () => { }

      await removeReplyFromTweet(req, {} as Response, next)

      const expectedTweet = await Tweet.findById(tweet._id)
      expect(expectedTweet.replies).toHaveLength(0)
    })
  })
})
