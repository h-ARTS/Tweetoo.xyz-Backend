import { Blacklist } from '../blacklist.model'

describe('Blacklist Token model:', () => {
  test('has token, exp and iat', () => {
    const { token, exp, iat } = Blacklist.schema.obj
    expect(token).toEqual({
      type: String,
      trim: true,
      unique: true
    })
    expect(exp).toEqual(Number)
    expect(iat).toEqual(Number)
  })
})
