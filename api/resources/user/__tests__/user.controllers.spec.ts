import {
  controllers,
  myProfile,
  updateProfile,
  followHandler,
  appendToUser,
  removeFromUser,
  deleteProfile
} from '../user.controllers'
import { User, IUser } from '../user.model'
import * as mongoose from 'mongoose'
import { IRequestUser } from '../../../utils/auth'
import { Response } from 'express'
import { ITweet } from '../../tweet/tweet.model'
import { IUserReply, IReply } from '../../reply/reply.model'

describe('user-controllers:', () => {
  test('has functions to display user profile and to update.', () => {
    const methods = [
      'myProfile',
      'updateProfile',
      'getUsers',
      'getUser',
      'followHandler',
      'appendToUser',
      'removeFromUser',
      'deleteProfile'
    ]

    methods.forEach((method: string) => {
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
        user: { _id: user._id }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: IUser) {
          expect(result._id.toString()).toEqual(user._id.toString())
        }
      } as Response

      myProfile(req, res)
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
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { bio: string }) {
          expect(result.bio).toBe(update.bio)
        }
      } as Response

      await updateProfile(req, res)
    })

    test('returns 404 if no user found.', async () => {
      expect.assertions(4)

      const update = { location: 'Seattle, WA' }
      const req = { 
        user: { _id: mongoose.Types.ObjectId().toHexString() }, 
        body: update 
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        send(result: { message: string }) {
          expect(result).not.toBeFalsy()
          expect(result.hasOwnProperty('message')).toBe(true)
          expect(result.message).toBe('User not found.')
        }
      } as Response

      await updateProfile(req, res)
    })
  })

  describe('deleteProfile', () => {
    let user: IUser

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

      const req = { user: { _id: user._id } } as IRequestUser
      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { removed: IUser }) {
          expect(result.removed).not.toBeFalsy()
          expect(result.removed._id.toString()).toBe(req.user._id.toString())
        }
      } as Response

      await deleteProfile(req, res)
    })

    test('returns 404 if no user found.', async () => {
      expect.assertions(4)

      const req = { 
        user: { 
          _id: mongoose.Types.ObjectId().toHexString() 
        } 
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        send(result: { message: string }) {
          expect(result).not.toEqual({})
          expect(result.hasOwnProperty('message')).toBe(true)
          expect(result.message).toBe('User not found.')
        }
      } as Response

      await deleteProfile(req, res)
    })
  })

  describe('followHandler', () => {
    let userToFollow: IUser
    let loggedInUser: IUser
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
        user: { _id: loggedInUser._id, handle: loggedInUser.handle },
        query: { follow: 'true' }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { target: IUser, updated: IUser }) {
          expect(result.target.followers).not.toHaveLength(0)
          const follower = result.target.followers.find(f => {
            return f.handle.toString() === loggedInUser.handle.toString()
          })
          expect(follower).toBeTruthy()
        }
      } as Response

      await followHandler(req, res)
    })

    test('adds user to following array to the authenticated user.', async () => {
      expect.assertions(3)

      const req = {
        params: { handle: userToFollow.handle },
        user: { _id: loggedInUser._id, handle: loggedInUser.handle },
        query: { follow: 'true' }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { target: IUser, updated: IUser }) {
          expect(result.updated.following).not.toHaveLength(0)
          const following = result.updated.following.find(f => {
            return f.handle.toString() === userToFollow.handle.toString()
          })
          expect(following).toBeTruthy()
        }
      } as Response

      await followHandler(req, res)
    })

    test('removes a follower from the target user and a following from the authenticated user.', async () => {
      expect.assertions(5)

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

      userToUnfollow.followers.push({ _id: objId2, handle: user.handle })
      await userToUnfollow.save()

      user.following.push({ _id: objId, handle: userToUnfollow.handle })
      await user.save()

      const req = {
        params: { handle: userToUnfollow.handle },
        user: { _id: user._id, handle: user.handle },
        query: { follow: 'false' }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { target: IUser, updated: IUser }) {
          expect(result.target.followers).toEqual(
            expect.not.arrayContaining([{ _id: objId2, handle: user.handle }])
          )
          expect(result.target.followers).not.toEqual([])
          expect(result.updated.following).toEqual(
            expect.not.arrayContaining([
              { _id: objId, handle: userToUnfollow.handle }
            ])
          )
          expect(result.updated.following).not.toEqual([])
        }
      } as Response

      await followHandler(req, res)
    })
  })

  describe('appendToUser', () => {
    let user: IUser

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
        user: { _id: user._id },
        body: {
          doc: { _id: mongoose.Types.ObjectId() }
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { user: IUser }) {
          result.user.tweets.forEach((tweet: ITweet) => {
            expect(tweet.tweetId.toString()).toEqual(
              req.body.doc._id.toString()
            )
          })
        }
      } as Response

      await appendToUser(req, res)
    })

    test('if reply, it appends to the authenticated users replies object.', async () => {
      expect.assertions(2)

      const tweetId = mongoose.Types.ObjectId()
      const req = {
        user: { _id: user._id },
        body: {
          doc: { _id: mongoose.Types.ObjectId(), tweetId },
          tweet: { _id: tweetId }
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { user: IUser }) {
          result.user.replies.forEach((reply: IUserReply) => {
            expect(reply.replyId.toString()).toEqual(
              req.body.doc._id.toString()
            )
          })
        }
      } as Response

      await appendToUser(req, res)
    })
  })

  describe('removeFromUser', () => {
    let user: IUser
    const tweetId = mongoose.Types.ObjectId()
    const replyId = mongoose.Types.ObjectId()
    beforeEach(async () => {
      user = await User.create({
        email: 'max@aol.com',
        password: '123456',
        fullName: 'Max Ol',
        handle: '@max_o'
      })
      user.replies.push({ replyId, tweetId })
      user.tweets.push({ tweetId })
      await user.save()
    })

    test('removes a reply object from the user document.', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        body: {
          removed: {
            _id: replyId,
            tweetId
          }
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { removed: IReply, user: IUser }) {
          expect(result.removed._id.toString()).toEqual(
            req.body.removed._id.toString()
          )
          expect(result.user.replies).toHaveLength(0)
        }
      } as Response

      await removeFromUser(req, res)
    })

    test('removes a tweet doc and the associated reply docs from the user document.', async () => {
      expect.assertions(4)

      const req = {
        user: { _id: user._id },
        body: {
          removed: {
            _id: tweetId,
            replies: []
          }
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        json(result: { removed: ITweet, user: IUser }) {
          expect(result.removed._id.toString()).toEqual(
            req.body.removed._id.toString()
          )
          expect(result.user.tweets).toHaveLength(0)
          const replyDocs = user.replies.filter(
            r => r.tweetId.toString() === req.body.removed._id.toString()
          )
          expect(result.user.replies).toEqual(
            expect.not.objectContaining(replyDocs)
          )
        }
      } as Response

      await removeFromUser(req, res)
    })
  })
})
