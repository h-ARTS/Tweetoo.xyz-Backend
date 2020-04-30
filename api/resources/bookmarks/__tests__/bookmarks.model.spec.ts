import { SchemaTypes } from 'mongoose'
import { Bookmarks } from '../bookmarks.model'
import { replySchema as tweetSchema } from '../../reply/reply.model'

describe('Bookmark model:', () => {
  test('has userId', () => {
    const userId = Bookmarks.schema.obj.userId
    expect(userId).toEqual({
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    })
  })
  test('has tweetId', () => {
    const tweetId = Bookmarks.schema.obj.tweetId
    expect(tweetId).toEqual({
      type: String,
      required: true
    })
  })
})
