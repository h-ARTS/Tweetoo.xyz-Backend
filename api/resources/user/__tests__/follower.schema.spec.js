import { FollowerSchema } from '../follower.schema'
import { SchemaTypes } from 'mongoose'

describe('Follower Schema', () => {
  test('has userId.', () => {
    const userId = FollowerSchema.obj.userId
    expect(userId).toEqual({
      type: SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    })
  })
})
