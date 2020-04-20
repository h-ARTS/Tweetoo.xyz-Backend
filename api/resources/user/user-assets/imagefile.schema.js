import { Schema } from 'mongoose'

export const ImageFileSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: 'no_cover.js'
  },
  type: {
    type: String,
    required: true,
    default: 'image/jpeg'
  },
  url: {
    type: String,
    required: true,
    default: 'media/standard/no_cover.js'
  }
})
