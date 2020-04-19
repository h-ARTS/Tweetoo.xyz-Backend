import { FollowerSchema } from '../follower.schema'
import { SchemaTypes } from 'mongoose'

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
