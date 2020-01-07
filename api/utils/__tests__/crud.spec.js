import {
  getAll,
  getOne,
  createOne,
  updateOne,
  removeOne,
  reTweet
} from '../crud'
import { Tweet } from '../../resources/tweet/tweet.model'
import { User } from '../../resources/user/user.model'
import mongoose from 'mongoose'
import { Reply } from '../../resources/reply/reply.model'

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
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data).toHaveLength(3)
        }
      }

      await getAll(Tweet)(req, res)
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
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data._id.toString()).toBe(tweet._id.toString())
        }
      }

      await getOne(Tweet)(req, res)
    })

    test('responds 404 if no doc was found.', async () => {
      expect.assertions(2)

      const req = {
        params: {
          tweetId: mongoose.Types.ObjectId()
        }
      }
      const res = {
        status(code) {
          expect(code).toBe(404)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

      await getOne(Tweet)(req, res)
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
      }
      const next = () => {}

      await createOne(Tweet)(req, {}, next)

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
      }
      const next = () => {}

      await createOne(Tweet)(req, {}, next)

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
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data._id.toString()).toBe(tweet._id.toString())
          expect(result.data.fullText).toBe(update.fullText)
        }
      }

      await updateOne(Tweet)(req, res)
    })

    test('responds 404 if no doc was found.', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const update = { fullText: 'hello' }

      const req = {
        params: { tweetId: mongoose.Types.ObjectId() },
        user: { _id: user },
        body: update
      }

      const res = {
        status(code) {
          expect(code).toBe(404)
          return this
        },
        end() {
          expect(true).toBe(true)
        }
      }

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
      }
      const next = () => {}

      await removeOne(Tweet)(req, {}, next)

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
        params: { tweetId: mongoose.Types.ObjectId() },
        user: { _id: user }
      }
      const next = () => {}

      const res = {
        status(code) {
          expect(code).toBe(404)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await removeOne(Tweet)(req, res, next)
    })
  })

  describe('reTweet', () => {
    let user
    let tweet
    let reply
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
        user,
        params: {},
        query: { replyId: reply._id }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          result.user.replies.forEach(reply => {
            expect(reply.replyId.toString()).toEqual(
              req.query.replyId.toString()
            )
          })
          expect(result.user.replies).toHaveLength(1)
        }
      }

      await reTweet(Reply)(req, res)
    })

    test('adds a tweet reference doc to the authenticated user.', async () => {
      expect.assertions(3)

      const req = {
        user,
        params: { tweetId: tweet._id }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          result.user.tweets.forEach(tweet => {
            expect(tweet.tweetId.toString()).toEqual(
              req.params.tweetId.toString()
            )
          })
          expect(result.user.tweets).toHaveLength(1)
        }
      }

      await reTweet(Tweet)(req, res)
    })

    test('sets the retweet count by 1.', async () => {
      expect.assertions(3)

      const req = {
        user,
        params: { tweetId: tweet._id }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          expect(result.user.tweets).toHaveLength(1)
          expect(result.doc.retweetCount).toBe(1)
        }
      }

      await reTweet(Tweet)(req, res)
    })

    test('sets the retweet property to true.', async () => {
      expect.assertions(2)

      const req = {
        user,
        params: { tweetId: tweet._id }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          const doc = result.user.tweets.find(
            t => t.tweetId.toString() === req.params.tweetId.toString()
          )
          expect(doc.retweet).toBe(true)
        }
      }

      await reTweet(Tweet)(req, res)
    })

    test('responds 404 if no tweet or reply was found.', async () => {
      expect.assertions(2)

      const req = {
        user,
        params: { tweetId: mongoose.Types.ObjectId() }
      }

      const res = {
        status(code) {
          expect(code).toBe(404)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        }
      }

      await reTweet(Tweet)(req, res)
    })
  })

  // describe('undoRetweet', () => {
  //   test('finds the tweet by id and decreases the retweet count by 1.', async () => {})

  //   test('removes the tweet by id from the user object.', async () => {})

  //   test('sets the retweet property to false.', async () => {})

  //   test('responds 404 if no tweet was found.', async () => {})
  // })
})

// PSEUDO tweet and user JSON objects
// tweet = {
//   fullText: 'dasfsadasd',
//   createdBy: 'babu',
//   createdAt: 1873894234
// }

// user = {
//   name: 'max',
//   bio: '',
//   followers: 1201,
//   following: 943,
//   tweets: [
//     {
//       fullText: 'dasfsadasd',
//       createdBy: 'max',
//       createdAt: 1873894234,
//       retweet: false,
//       likeCount: 112,
//       retweetCount: 21
//     },
//     {
//       fullText: 'dasfsadasd',
//       createdBy: 'babu',
//       createdAt: 1873891211,
//       retweet: true,
//       likeCount: 222,
//       retweetCount: 33
//     }
//   ]
// }
