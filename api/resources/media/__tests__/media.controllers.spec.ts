import * as fs from 'fs'
import * as mongoose from 'mongoose'
import {
  assignCachedImagePath,
  getMedia,
  removeCachedMediaDoc,
  createUserFolder
} from '../media.controllers'
import { Media, IMedia } from '../media.model'
import { IRequestUser } from '../../../utils/auth'
import { Response } from 'express'

describe('Media:', () => {
  describe('getMedia:', () => {
    test('sends the requested file from user directory if exists.', () => {
      expect.assertions(3)

      const req = {
        params: {
          handle: 'jawo',
          filename: '1586025776411logo_size.png'
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        sendFile(result: string) {
          expect(result).not.toBe('')
          expect(result).toBe(
            `/media/user/${req.params.handle}/${req.params.filename}`
          )
        }
      } as Response

      getMedia(req, res)
    })

    test('sends the requested file from tweet directory if exists.', () => {
      expect.assertions(3)

      const req = {
        params: {
          tweetId: 'example-tweetId',
          filename: '1577311325591optional.png'
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(200)
          return this
        },
        sendFile(result: string) {
          expect(result).not.toBe('')
          expect(result).toBe(
            `/media/tweet/${req.params.tweetId}/${req.params.filename}`
          )
        }
      } as Response

      getMedia(req, res)
    })

    test('returns 404 if no media file found', () => {
      expect.assertions(2)

      const req = {
        params: {
          handle: 'Nimra',
          filename: '1580247926922options.png'
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        end(): void {
          expect(true).toBe(true)
        }
      } as Response

      getMedia(req, res)
    })
  })

  describe('createUserFolder', () => {
    test('should create a user directory for the assets', () => {
      const req = {
        params: {
          handle: 'mike'
        }
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
        },
        send(result: string) {
          expect(result).toBe('User directory for mike created.')
        }
      } as Response

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
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(201)
          return this
        },
        json(result: { cached: IMedia }) {
          expect(result.cached.path).not.toBe('')
          expect(result.cached.path).toBe(`media/cached/${req.file.filename}`)
          expect(result.cached.handle).toBe('MrJohnson')
        }
      } as Response

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
      } as IRequestUser

      const res = {
        status(code: number) {
          expect(code).toBe(500)
          return this
        },
        send(result: { message: string }) {
          expect(result.message).toBe('Dimension not provided!')
        }
      } as Response

      assignCachedImagePath(req, res)
    })
  })

  describe('removeCachedMediaDoc:', () => {
    let cachedImage: IMedia
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
      } as IRequestUser
      const next = () => {}

      await removeCachedMediaDoc(req, {} as Response, next)

      expect(req.body).not.toBe(undefined)
      expect(typeof req.body).toBe('object')
    })

    test('should respond 404 if no file found.', async () => {
      expect.assertions(2)

      const req = {
        body: {
          uniqueImageId: mongoose.Types.ObjectId()
        }
      } as IRequestUser
      const next = () => {}

      const res = {
        status(code: number) {
          expect(code).toBe(404)
          return this
        },
        send(result: { message: string }) {
          expect(result.message).toEqual('File not found.')
        }
      } as Response

      await removeCachedMediaDoc(req, res, next)
    })
  })
})
