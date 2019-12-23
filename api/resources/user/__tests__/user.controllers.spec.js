import {
  controllers,
  myProfile,
  updateProfile,
  followHandler
} from '../user.controllers'
import { User } from '../user.model'

describe('user controllers:', () => {
  test('has functions to display user profile and to update.', () => {
    const methods = ['myProfile', 'updateProfile', 'getUser', 'followHandler']

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

  describe('followHandler', () => {
    test('adds user to followers array to the target user.', async () => {
      expect.assertions(3)

      const userToFollow = await User.create({
        email: 'mike@gmail.com',
        password: 'asdfgh',
        fullName: 'Mike Mors',
        handle: '@mikeMors'
      })

      const loggedInUser = await User.create({
        email: 'maxi@aol.com',
        password: 1234567,
        fullName: 'Maximum Ben',
        handle: '@maxi_ben'
      })

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
          result.data.target.followers.forEach(f => {
            expect(f.userId.toString()).toBe(loggedInUser._id.toString())
          })
        }
      }

      await followHandler(req, res)
    })

    test('adds user to following array to the authenticated user.', async () => {
      expect.assertions(3)

      const userToFollow = await User.create({
        email: 'mike@gmail.com',
        password: 'asdfgh',
        fullName: 'Mike Mors',
        handle: '@mikeMors'
      })

      const loggedInUser = await User.create({
        email: 'maxi@aol.com',
        password: 1234567,
        fullName: 'Maximum Ben',
        handle: '@maxi_ben'
      })

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
          result.data.updated.following.forEach(f => {
            expect(f.userId.toString()).toBe(userToFollow._id.toString())
          })
        }
      }

      await followHandler(req, res)
    })
  })
})
