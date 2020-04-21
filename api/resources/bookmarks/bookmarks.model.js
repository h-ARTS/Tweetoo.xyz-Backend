import { Schema, SchemaTypes, model } from 'mongoose'
import { replySchema as tweetSchema } from '../reply/reply.model'

export const BookmarksSchema = new Schema(
  {
    userId: {
      type: SchemaTypes.ObjectId,
      required: true
    },
    tweet: tweetSchema
  },
  {
    timestamps: true
  }
)

export const Bookmarks = model('bookmarks', BookmarksSchema)
