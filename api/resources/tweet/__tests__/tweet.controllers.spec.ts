import { ObjectId } from 'mongodb'
import * as mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import { IRequestUser } from '../../../utils/auth'
import controllers, {
  appendReplyToTweet,
  removeReplyFromTweet,
  saveCachedTweetMedias,
  renameImagePaths
} from '../tweet.controllers'
import { Tweet, ITweet } from '../tweet.model'

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

  describe('saveCachedTweetMedias', () => {
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

  describe('renameImagePaths', () => {
    beforeEach(async () => {
      tweet = await Tweet.create({
        createdBy: mongoose.Types.ObjectId(),
        fullText: 'This is my new tweet.',
        fullName: 'Dr Maxx',
        handle: '@Drmaxx',
        tweetImages: [
          {
            name: "paki1591605619659NoEngPro-Grafik.jpg",
            type: "image/jpeg",
            url: "media/tweets/_cached/paki1591605619659NoEngPro-Grafik.jpg"
          },
          {
            name: "paki1591605619676photo-1522542550221-31fd19575a2d.jpeg",
            type: "image/jpeg",
            url: "media/tweets/_cached/paki1591605619676photo-1522542550221-31fd19575a2d.jpeg"
          }
        ]
      })
    })

    test('should push tweet image objects with new paths to the tweet doc', async () => {
      expect.assertions(3)

      const req = {
        body: {
          doc: tweet,
          tweetImages: [
            {
              originalname: "paki1591605619659NoEngPro-Grafik.jpg",
              mimetype: "image/jpeg",
              path: `media/tweets/${tweet._id}/paki1591605619659NoEngPro-Grafik.jpg`,
              mediaId: "5eddf974d5f8a4cd7a54c607"
            },
            {
              originalname: "paki1591605619676photo-1522542550221-31fd19575a2d.jpeg",
              mimetype: "image/jpeg",
              path: `media/tweets/${tweet._id}/paki1591605619676photo-1522542550221-31fd19575a2d.jpeg`,
              mediaId: "5eddf974d5f8a4cd7a54c608"
            }
          ]
        }
      } as IRequestUser
      const next = () => { }

      await renameImagePaths(req, {} as Response, next)

      expect(req.body.doc.tweetImages).not.toHaveLength(0)
      req.body.doc.tweetImages.forEach(image => {
        expect(image.url.includes(tweet._id)).toBe(true)
      })
    })

    test('should skip the middleware when no tweet images available', async () => {
      expect.assertions(1)

      const req = {
        body: {
          doc: tweet
        }
      } as IRequestUser

      const next = jest.fn() as NextFunction

      await renameImagePaths(req, {} as Response, next)

      expect(next).toBeCalledTimes(1)
    })

    test('should return 400 if no tweet found', async () => {
      expect.assertions(2)

      const req = {
        body: {
          doc: {
            _id: mongoose.Types.ObjectId(),
            tweetImages: [{
              name: "paki1591605619659NoEngPro-Grafik.jpg",
              type: "image/jpeg",
              url: "media/tweets/_cached/paki1591605619659NoEngPro-Grafik.jpg"
            }]
          },
          tweetImages: [{
            name: "paki1591605619659NoEngPro-Grafik.jpg",
            type: "image/jpeg",
            url: `media/tweets/${tweet._id}/paki1591605619659NoEngPro-Grafik.jpg`,
            _id: "5eddf974d5f8a4cd7a54c608"
          }]
        }
      } as IRequestUser
      const next = () => { }

      const res = {
        status(code: number) {
          expect(code).toBe(400)
          return this
        },
        send(message: string) {
          expect(message).toBe('Tweet not found.')
        }
      } as Response

      await renameImagePaths(req, res, next)
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
