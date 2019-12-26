import { uploadImage } from '../upload.controller'
import { User } from '../../user.model'

describe('upload controllers:', () => {
  describe('uploadImage', () => {
    test('return authenticated user with dimension object', async () => {
      expect.assertions(2)

      const user = await User.create({
        email: 'max@mustard.com',
        password: '123456',
        fullName: 'Max Mustard',
        handle: '@maxmustard'
      })

      const req = {
        user: user,
        file: {
          fieldname: 'profileImage',
          originalname: 'example.png',
          encoding: '7bit',
          mimetype: 'image/png',
          destination: './uploads/',
          filename: '1577367080145optional.png',
          path: 'uploads/1577367080145optional.png',
          size: 17291
        },
        body: { dimension: 'coverImage' }
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
})
