import { Tweet } from '../tweet.model'
import { SchemaTypes } from 'mongoose'

describe('Tweets model schema', () => {
  test('has fullText', () => {
    const fullText = Tweet.schema.obj.fullText
    expect(fullText).toEqual({
      type: String,
      required: true,
      maxlength: 280
    })
  })

  test('has likeCount', () => {
    const likeCount = Tweet.schema.obj.likeCount
    expect(likeCount).toEqual({
      type: Number,
      default: 0
    })
  })

  test('has retweetCount', () => {
    const retweetCount = Tweet.schema.obj.retweetCount
    expect(retweetCount).toEqual({
      type: Number,
      default: 0
    })
  })

  test('has replyCount', () => {
    const replyCount = Tweet.schema.obj.replyCount
    expect(replyCount).toEqual({
      type: Number,
      default: 0
    })
  })

  test('has createdBy', () => {
    const createdBy = Tweet.schema.obj.createdBy
    expect(createdBy).toEqual({
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    })
  })

  test('has handle', () => {
    const handle = Tweet.schema.obj.handle
    expect(handle).toEqual({
      type: String,
      required: true,
      trim: true,
      ref: 'user'
    })
  })
})
