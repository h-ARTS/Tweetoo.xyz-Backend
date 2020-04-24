import { FollowerSchema } from '../follower.schema'

describe('Follower Schema', () => {
  test('has userId.', () => {
    const handle = FollowerSchema.obj.handle
    expect(handle).toEqual({
      type: String,
      ref: 'user',
      required: true
    })
  })
})
