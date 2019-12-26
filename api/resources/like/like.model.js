import { Schema, SchemaTypes, model } from 'mongoose'

const likeSchema = new Schema(
  {
    tweetId: {
      type: SchemaTypes.ObjectId,
      required: true
    },
    userId: {
      type: SchemaTypes.ObjectId,
      required: true
    },
    handle: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
)

export const Like = model('like', likeSchema)
