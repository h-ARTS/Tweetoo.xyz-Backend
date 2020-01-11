import { Schema, model } from 'mongoose'

export const blacklistSchema = new Schema({
  token: {
    type: String,
    trim: true,
    unique: true
  },
  exp: Number,
  iat: Number
})

export const Blacklist = model('blacklist', blacklistSchema)
