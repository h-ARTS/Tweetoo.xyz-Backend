import { Schema, SchemaTypes, model } from 'mongoose'

const replySchema = new Schema(
  {
    fullText: {
      type: String,
      required: true,
      maxlength: 280
    },
    likeCount: {
      type: Number,
      default: 0
    },
    retweetCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    },
    handle: {
      type: String,
      required: true,
      trim: true,
      ref: 'user'
    }
  },
  { timestamps: true }
)

replySchema.index({ user: 1, handle: 1 }, { unique: true })

export const Reply = model('reply', replySchema)
