import { FollowerSchema } from '../follower.schema'
import { SchemaTypes } from 'mongoose'

describe('Follower Schema', () => {
  test('has createdBy.', () => {
    const createdBy = FollowerSchema.obj.createdBy
    expect(createdBy).toEqual({
      type: SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    })
  })
})
