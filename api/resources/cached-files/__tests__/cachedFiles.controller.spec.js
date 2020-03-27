import { assignCachedImagePath } from '../cachedFiles.controller'

describe('Cached files:', () => {
  describe('assignCachedImagePath', () => {
    const file = {
      fieldname: 'profileImage',
      originalname: 'example.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './media/',
      filename: '1577311325591optional.png',
      path: 'media/cached/1577311325591optional.png',
      size: 17291
    }

    test('should assign the image path correctly.', () => {
      expect.assertions(4)

      const req = {
        file,
        body: {
          dimension: 'userImage',
          handle: 'MrJohnson'
        }
      }

      const res = {
        status(code) {
          expect(code).toBe(201)
          return this
        },
        json(result) {
          expect(result.cached.path).not.toBe('')
          expect(result.cached.path).toBe(`media/cached/${req.file.filename}`)
          expect(result.cached.handle).toBe('MrJohnson')
        }
      }

      assignCachedImagePath(req, res)
    })

    test('should respond with an error if no dimension provided', () => {
      expect.assertions(2)

      const req = {
        file,
        body: {
          dimension: null,
          handle: 'MrJohnson'
        }
      }

      const res = {
        status(code) {
          expect(code).toBe(500)
          return this
        },
        send(result) {
          expect(result.message).toBe('Dimension not provided!')
        }
      }

      assignCachedImagePath(req, res)
    })
  })
})
