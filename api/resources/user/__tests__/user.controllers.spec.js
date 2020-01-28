import {
  controllers,
  myProfile,
  updateProfile,
  followHandler,
  appendToUser,
  removeFromUser,
  deleteProfile
} from '../user.controllers'
import { User } from '../user.model'
import mongoose from 'mongoose'

describe('user controllers:', () => {
  test('has functions to display user profile and to update.', () => {
    const methods = [
      'myProfile',
      'updateProfile',
      'getUser',
      'followHandler',
      'appendToUser',
      'removeFromUser'
    ]

    methods.forEach(method => {
      expect(typeof controllers[method]).toBe('function')
    })
  })

  describe('myProfile', () => {
    test('returns current authenticated user profile', async () => {
      expect.assertions(2)

      const user = await User.create({
        email: 'max@mustard.de',
        password: '1234567',
        fullName: 'Max Mustard',
        handle: '@maxm'
      })

      const req = {
        user
      }
      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data._id.toString()).toEqual(user._id.toString())
        }
      }

      await myProfile(req, res)
    })
  })

  describe('updateProfile', () => {
    test('finds a doc by authenticated user to update.', async () => {
      expect.assertions(2)

      const user = await User.create({
        email: 'bibo@gmail.com',
        password: 'bibo123',
        fullName: 'Bibo',
        handle: '@bibo'
      })

      const update = { bio: 'Passionate Front-End Dev.' }

      const req = {
        user: { _id: user._id },
        body: update
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data.bio).toBe(update.bio)
        }
      }

      await updateProfile(req, res)
    })
  })

  describe('deleteProfile', () => {
    let user

    beforeEach(async () => {
      user = await User.create({
        email: 'jane@doe-company.org',
        password: '1234567',
        fullName: 'Jane Doe',
        handle: 'daneDoe'
      })
    })

    test('removes the user from the database.', async () => {
      expect.assertions(3)

      const req = { user }
      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.removed).not.toBeFalsy()
          expect(result.removed._id.toString()).toBe(req.user._id.toString())
        }
      }
      await deleteProfile(req, res)
    })

    test('throws 404 if no user found.', async () => {
      expect.assertions(4)

      const req = { user: { _id: mongoose.Types.ObjectId() } }
      const res = {
        status(code) {
          expect(code).toBe(404)
          return this
        },
        send(result) {
          expect(result).not.toEqual({})
          expect(result.hasOwnProperty('message')).toBe(true)
          expect(result.message).toBe('User not found.')
        }
      }

      await deleteProfile(req, res)
    })
  })

  describe('followHandler', () => {
    let userToFollow
    let loggedInUser
    beforeEach(async () => {
      userToFollow = await User.create({
        email: 'mike@gmail.com',
        password: 'asdfgh',
        fullName: 'Mike Mors',
        handle: '@mikeMors'
      })

      loggedInUser = await User.create({
        email: 'maxi@aol.com',
        password: 1234567,
        fullName: 'Maximum Ben',
        handle: '@maxi_ben'
      })
    })
    test('adds user to followers array to the target user.', async () => {
      expect.assertions(3)

      const req = {
        params: { handle: userToFollow.handle },
        user: { _id: loggedInUser._id },
        body: { toFollow: true }
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data.target.followers).not.toHaveLength(0)
          const follower = result.data.target.followers.find(f => {
            return f.userId.toString() === loggedInUser._id.toString()
          })
          expect(follower).toBeTruthy()
        }
      }

      await followHandler(req, res)
    })

    test('adds user to following array to the authenticated user.', async () => {
      expect.assertions(3)

      const req = {
        params: { handle: userToFollow.handle },
        user: { _id: loggedInUser._id },
        body: { toFollow: true }
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data.updated.following).not.toHaveLength(0)
          const following = result.data.updated.following.find(f => {
            return f.userId.toString() === userToFollow._id.toString()
          })
          expect(following).toBeTruthy()
        }
      }

      await followHandler(req, res)
    })

    test('removes a follower from the target user and a following from the authenticated user.', async () => {
      expect.assertions(3)

      const objId = mongoose.Types.ObjectId()
      const objId2 = mongoose.Types.ObjectId()

      const userToUnfollow = await User.create({
        email: 'max2@aol.com',
        password: '123456',
        fullName: 'Max 2Ol',
        handle: '@max_o2'
      })
      const user = await User.create({
        email: 'max@aol.com',
        password: '123456',
        fullName: 'Max Ol',
        handle: '@max_o'
      })

      userToUnfollow.followers.push({ _id: objId2, userId: user._id })
      await userToUnfollow.save()

      user.following.push({ _id: objId, userId: userToUnfollow._id })
      await user.save()

      const req = {
        params: { handle: userToUnfollow.handle },
        user: { _id: user._id },
        body: { toFollow: false }
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.data.target.followers).not.toEqual(
            expect.arrayContaining([{ _id: objId2, userId: user._id }])
          )
          expect(result.data.updated.following).not.toEqual(
            expect.arrayContaining([{ _id: objId, userId: userToUnfollow._id }])
          )
        }
      }

      await followHandler(req, res)
    })
  })

  describe('appendToUser', () => {
    let user

    beforeEach(async () => {
      user = await User.create({
        email: 'max@aol.com',
        password: '123456',
        fullName: 'Max Ol',
        handle: '@max_o'
      })
    })

    test('if tweets, it appends to the authenticated users tweets object.', async () => {
      expect.assertions(2)

      const req = {
        user,
        body: {
          doc: { _id: mongoose.Types.ObjectId() }
        }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          result.user.tweets.forEach(tweet => {
            expect(tweet.tweetId.toString()).toEqual(
              req.body.doc._id.toString()
            )
          })
        }
      }

      await appendToUser(req, res)
    })

    test('if reply, it appends to the authenticated users replies object.', async () => {
      expect.assertions(2)

      const tweetId = mongoose.Types.ObjectId()
      const req = {
        user,
        body: {
          doc: { _id: mongoose.Types.ObjectId(), tweetId },
          tweet: { _id: tweetId }
        }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          result.user.replies.forEach(reply => {
            expect(reply.replyId.toString()).toEqual(
              req.body.doc._id.toString()
            )
          })
        }
      }

      await appendToUser(req, res)
    })
  })

  describe('removeFromUser', () => {
    let user
    const tweetId = mongoose.Types.ObjectId()
    const replyId = mongoose.Types.ObjectId()
    beforeEach(async () => {
      user = await User.create({
        email: 'max@aol.com',
        password: '123456',
        fullName: 'Max Ol',
        handle: '@max_o'
      })
      await user.replies.push({ replyId, tweetId })
      await user.tweets.push({ tweetId })
      await user.save()
    })

    test('removes a reply object from the user document.', async () => {
      expect.assertions(3)

      const req = {
        user,
        body: {
          removed: {
            _id: replyId,
            tweetId
          }
        }
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.removed._id.toString()).toEqual(
            req.body.removed._id.toString()
          )
          expect(result.user.replies).toHaveLength(0)
        }
      }

      await removeFromUser(req, res)
    })

    test('removes a tweet doc and the associated reply docs from the user document.', async () => {
      expect.assertions(4)

      const req = {
        user,
        body: {
          removed: {
            _id: tweetId,
            replies: []
          }
        }
      }

      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        json(result) {
          expect(result.removed._id.toString()).toEqual(
            req.body.removed._id.toString()
          )
          expect(result.user.tweets).toHaveLength(0)
          const replyDocs = user.replies.filter(
            r => r.tweetId.toString() === req.body.removed._id.toString()
          )
          expect(result.user.replies).toEqual(
            expect.not.objectContaining(...replyDocs)
          )
        }
      }

      await removeFromUser(req, res)
    })
  })
})
