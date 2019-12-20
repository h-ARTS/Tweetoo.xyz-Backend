import { SchemaTypes } from 'mongoose'
import { Reply } from '../reply.model'

describe('Reply model schema', () => {
  test('has fullText', () => {
    const fullText = Reply.schema.obj.fullText
    expect(fullText).toEqual({
      type: String,
      required: true,
      maxlength: 280
    })
  })
  test('has likeCount', () => {
    const likeCount = Reply.schema.obj.likeCount
    expect(likeCount).toEqual({
      type: Number,
      default: 0
    })
  })
  test('has retweetCount', () => {
    const retweetCount = Reply.schema.obj.retweetCount
    expect(retweetCount).toEqual({
      type: Number,
      default: 0
    })
  })
  test('has createdBy', () => {
    const createdBy = Reply.schema.obj.createdBy
    expect(createdBy).toEqual({
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    })
  })
  test('has handle', () => {
    const handle = Reply.schema.obj.handle
    expect(handle).toEqual({
      type: String,
      required: true,
      trim: true,
      ref: 'user'
    })
  })
})
