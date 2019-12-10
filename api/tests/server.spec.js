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
