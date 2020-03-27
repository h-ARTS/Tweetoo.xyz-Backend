import { Schema, model } from 'mongoose'

const cachedFilesSchema = new Schema(
  {
    path: {
      type: String,
      required: true
    },
    handle: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const CachedFiles = model('cached-files', cachedFilesSchema)
