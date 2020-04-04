import fs from 'fs'
import mongoose from 'mongoose'
import {
  assignCachedImagePath,
  getMedia,
  removeCachedMediaDoc,
  createUserFolder
} from '../media.controllers'
import { Media } from '../media.model'

describe('Media:', () => {
  describe('getMedia:', () => {
    test('sends the requested file from user directory if exists.', () => {
      expect.assertions(3)

      const req = {
        params: {
          handle: 'jawo',
          filename: '1586025776411logo_size.png'
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
          filename: '1577311325591optional.png'
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

  describe('createUserFolder', () => {
    test('should create a user directory for the assets', () => {
      const req = {
        params: {
          handle: 'mike'
        }
      }
      const res = {
        status(code) {
          expect(code).toBe(201)
        },
        send(result) {
          expect(result).toBe('User directory for mike created.')
        }
      }

      createUserFolder(req, res)
    })

    afterAll(() => {
      fs.rmdirSync('media/user/mike')
    })
  })

  describe('assignCachedImagePath', () => {
    const file = {
      fieldname: 'profileImage',
      originalname: 'logo_size.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './media/',
      filename: '1586025775346logo_size2.png',
      path: 'media/cached/1586025775346logo_size2.png',
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

  describe('removeCachedMediaDoc:', () => {
    let cachedImage
    beforeEach(async () => {
      cachedImage = await Media.create({
        path: 'media/cached/1586025775346logo_size2.png',
        mimetype: 'image/png',
        originalname: '1586025775346logo_size2.png',
        dimension: 'userImage',
        handle: 'paki'
      })
    })

    test('should remove the cached file from the media collection', async () => {
      expect.assertions(2)

      const req = {
        body: {
          uniqueImageId: cachedImage._id
        }
      }
      const next = () => {}

      await removeCachedMediaDoc(req, {}, next)

      expect(req.body).not.toBe(undefined)
      expect(typeof req.body).toBe('object')
    })

    test('should respond 404 if no file found.', async () => {
      expect.assertions(2)

      const req = {
        body: {
          uniqueImageId: mongoose.Types.ObjectId()
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

      await removeCachedMediaDoc(req, res, next)
    })
  })
})
