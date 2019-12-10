import { getAny } from '../server'

describe('Basic GET request:', () => {
  test('getAny should return 200 with a text', async () => {
    expect.assertions(2)

    const req = {}
    const res = {
      status(code) {
        expect(code).toBe(200)
        return this
      },
      send(result) {
        expect(typeof result).toBe('string')
      }
    }

    await getAny(req, res)
  })
})

describe('Tweet controllers:', () => {
  test('getAllTweets', async () => {})

  test('getTweet', async () => {})

  test('createTweet', async () => {})

  test('updateTweet', async () => {})

  test('removeTweet', async () => {})

  test('likeTweet', async () => {})

  test('unlikeTweet', async () => {})

  test('getAllRepliesOfTweet', async () => {})

  test('replyOnTweet', async () => {})

  test('updateReply', async () => {})

  test('removeReply', async () => {})

  test('createRetweet', async () => {})

  test('removeRetweet', async () => {})
})
