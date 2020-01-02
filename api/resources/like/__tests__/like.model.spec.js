import { Like } from '../like.model'
import { SchemaTypes } from 'mongoose'

describe('Like model:', () => {
  test('has docId', () => {
    const docId = Like.schema.obj.docId
    expect(docId).toEqual({
      type: SchemaTypes.ObjectId,
      required: true
    })
  })

  test('has createdBy', () => {
    const createdBy = Like.schema.obj.createdBy
    expect(createdBy).toEqual({
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    })
  })

  test('has handle', () => {
    const handle = Like.schema.obj.handle
    expect(handle).toEqual({
      type: String,
      required: true,
      trim: true
    })
  })
})
