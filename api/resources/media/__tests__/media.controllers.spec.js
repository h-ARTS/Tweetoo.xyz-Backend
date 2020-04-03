import {
  assignCachedImagePath,
  getMedia,
  removeCachedFileFromMedia
} from '../media.controllers'
import { Media } from '../media.model'

describe('Media:', () => {
  describe('getMedia:', () => {
    test('sends the requested file from user directory if exists.', () => {
      expect.assertions(3)

      const req = {
        params: {
          handle: 'paki',
          filename: '1579789034018favicon.png'
        }
      }
      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        sendFile(result) {
          expect(result).not.toBe('')
          expect(result).toBe(
            `/media/user/${req.params.handle}/${req.params.filename}`
          )
        }
      }

      getMedia(req, res)
    })

    test('sends the requested file from tweet directory if exists.', () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: 'example-tweetId',
          filename: '1579789034018favicon.png'
        }
      }
      const res = {
        status(code) {
          expect(code).toBe(200)
          return this
        },
        sendFile(result) {
          expect(result).not.toBe('')
          expect(result).toBe(
            `/media/tweet/${req.params.tweetId}/${req.params.filename}`
          )
        }
      }

      getMedia(req, res)
    })

    test('returns 404 if no media file found', () => {
      expect.assertions(2)

      const req = {
        params: {
          handle: 'Nimra',
          filename: '1580247926922options.png'
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

      getMedia(req, res)
    })
  })

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

  describe('removeCachedFileFromMedia:', () => {
    let cachedImage
    beforeEach(async () => {
      cachedImage = await Media.create({
        path: 'media/cached/1577311325591optional.png',
        mimetype: 'image/png',
        originalname: '1577311325591optional.png',
        handle: 'paki'
      })
    })

    test('should remove the cached file from the media collection', async () => {
      expect.assertions(2)

      const req = {
        body: {
          path: cachedImage.path
        }
      }
      const next = () => {}

      await removeCachedFileFromMedia(req, {}, next)

      expect(req.body).not.toBe(undefined)
      expect(typeof req.body.removed).toBe('object')
    })

    test('should respond 404 if no file found.', async () => {
      expect.assertions(2)

      const req = {
        body: {
          path: 'media/cached/unknownfile.png'
        }
      }
      const next = () => {}

      const res = {
        status(code) {
          expect(code).toBe(404)
        },
        send(result) {
          expect(result.message).toEqual('File not found.')
        }
      }

      await removeCachedFileFromMedia(req, res, next)
    })
  })
})
