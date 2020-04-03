import { Schema, model } from 'mongoose'

const mediaSchema = new Schema(
  {
    path: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    originalname: {
      type: String,
      required: true
    },
    handle: {
      type: String,
      required: true
    },
    dimension: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const Media = model('media', mediaSchema)
