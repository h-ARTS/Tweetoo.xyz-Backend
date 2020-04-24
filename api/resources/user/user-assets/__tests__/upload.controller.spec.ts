import { assignImagePath } from '../upload.controller'
import { User, IUser } from '../../user.model'
import * as fs from 'fs'
import { IRequestUser } from '../../../../utils/auth'
import { Response } from 'express'

describe('uploads:', () => {
  describe('assignImagePath', () => {
    let user: IUser
    beforeEach(async () => {
      user = await User.create({
        email: 'max@mustard.com',
        password: '123456',
        fullName: 'Max Mustard',
        handle: 'maxmustard'
      })
    })
    test('returns authenticated user with dimension object', async () => {
      expect.assertions(2)

      const req = {
        user: { _id: user._id },
        file: {
          fieldname: 'profileImage',
          originalname: 'example.png',
          encoding: '7bit',
          mimetype: 'image/png',
          destination: './media/',
          filename: '1577367080145optional.png',
          path: 'media/user/maxmustard/1577367080145optional.png',
          size: 17291
        },
        body: {
          dimension: 'coverImage'
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { data: IUser }) {
          expect(result.data.hasOwnProperty(req.body.dimension)).toBe(true)
        }
      } as Response

      await assignImagePath(req, res)
    })

    test('triggers to remove the file when dimension is not specified.', async () => {
      expect.assertions(3)

      const req = {
        user: { _id: user._id },
        file: {
          fieldname: 'image',
          originalname: 'example.png',
          encoding: '7bit',
          mimetype: 'image/png',
          destination: './media/',
          filename: '1577367080145optional.png',
          path: 'media/user/maxmustard/1577367080145optional.png',
          size: 17291
        },
        body: { dimension: '' }
      } as IRequestUser

      fs.copyFileSync(
        `media/user/maxmustard/_${req.file.filename}`,
        req.file.path
      )

      const res = {
        status(code: number) {
          expect(code).toBe(500)
          return this
        },
        send(result: { message: string }) {
          expect(result.message).toEqual('Dimension not provided!')
        }
      } as Response

      await assignImagePath(req, res)

      expect(fs.existsSync(`media/user/maxmustard/${req.file.filename}`)).toBe(
        false
      )
    })
  })
})
