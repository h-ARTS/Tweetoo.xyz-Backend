import { Schema, SchemaTypes, model, Document } from 'mongoose'
import { replySchema as tweetSchema, IReply } from '../reply/reply.model'

export interface IBookmark extends Document {
  userId: Schema.Types.ObjectId
  tweetId: string
}

export const BookmarksSchema = new Schema(
  {
    userId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    },
    tweetId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export const Bookmarks = model<IBookmark>('bookmarks', BookmarksSchema)
