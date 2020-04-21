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
  test('has tweet', () => {
    const tweet = Bookmarks.schema.obj.tweet
    expect(tweet).toEqual(tweetSchema)
  })
})
