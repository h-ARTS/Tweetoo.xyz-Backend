import { uploadImage } from '../upload.controller'
import { User } from '../../user.model'
import fs from 'fs'

describe('uploads:', () => {
  let user
  beforeEach(async () => {
    user = await User.create({
      email: 'max@mustard.com',
      password: '123456',
      fullName: 'Max Mustard',
      handle: 'maxmustard'
    })
  })

  describe('uploadImage', () => {
    test('returns authenticated user with dimension object', async () => {
      expect.assertions(2)

      const req = {
        user: user,
        file: {
          fieldname: 'profileImage',
          originalname: 'example.png',
          encoding: '7bit',
          mimetype: 'image/png',
          destination: './uploads/',
          filename: '1577367080145optional.png',
          path: 'media/maxmustard/1577367080145optional.png',
          size: 17291
        },
        body: {
          dimension: 'coverImage'
        }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          expect(result.data.hasOwnProperty(req.body.dimension)).toBe(true)
        }
      }

      await uploadImage(req, res)
    })
  })

  describe('removeFile', () => {
    test('removes the file when dimension is not specified during upload.', async () => {
      expect.assertions(3)

      const req = {
        user: user,
        file: {
          fieldname: 'image',
          originalname: 'example.png',
          encoding: '7bit',
          mimetype: 'image/png',
          destination: './uploads/',
          filename: '1577367080145optional.png',
          path: 'media/maxmustard/1577367080145optional.png',
          size: 17291
        },
        body: { dimension: '' }
      }

      fs.copyFileSync(`media/maxmustard/_${req.file.filename}`, req.file.path)

      const res = {
        status(code) {
          expect(code).toBe(500)
          return this
        },
        send(result) {
          expect(result.message).toEqual('Dimension not provided!')
        }
      }

      await uploadImage(req, res)

      expect(fs.existsSync(`media/maxmustard/${req.file.filename}`)).toBeFalsy()
    })
  })
})
