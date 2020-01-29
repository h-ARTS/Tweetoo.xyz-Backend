import { getMedia } from '../media.controllers'

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
