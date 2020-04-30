import { SchemaTypes } from 'mongoose'
import { Reply } from '../reply.model'

describe('Reply model:', () => {
  test('has tweetId', () => {
    const tweetId = Reply.schema.obj.tweetId
    expect(tweetId).toEqual({
      type: SchemaTypes.ObjectId,
      ref: 'tweet'
    })
  })
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
      required: true
    })
  })
  test('has fullName', () => {
    const fullName = Reply.schema.obj.fullName
    expect(fullName).toEqual({
      type: String,
      required: true
    })
  })
  test('has userImageUrl', () => {
    const userImageUrl = Reply.schema.obj.userImageUrl
    expect(userImageUrl).toEqual({
      type: String,
      required: true
    })
  })
})
