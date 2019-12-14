import { User } from '../../user/user.model'
import { Tweet } from '../tweet.model'
import { SchemaTypes } from 'mongoose'

describe('Tweets model', () => {
  describe('schema', () => {
    test('has full_text', () => {
      const fullText = Tweet.schema.obj.full_text
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

    test('has userId', () => {
      const userId = Tweet.schema.obj.userId
      expect(userId).toEqual({
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

    test('has replies as array', () => {
      const replies = Tweet.schema.obj.replies
      expect(replies).toEqual({
        type: [],
        default: undefined
      })
    })
  })
})
