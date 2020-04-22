import { Schema, model, Document } from 'mongoose'

export interface IBlacklist extends Document {
  token?: string,
  exp?: number,
  iat?: number
}

export const blacklistSchema = new Schema({
  token: {
    type: String,
    trim: true,
    unique: true
  },
  exp: Number,
  iat: Number
})

export const Blacklist = model<IBlacklist>('blacklist', blacklistSchema)
