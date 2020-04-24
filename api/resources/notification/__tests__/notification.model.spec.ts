import { SchemaTypes } from 'mongoose'
import { Notification } from '../notification.model'

describe('Notification model:', () => {
  test('has type', () => {
    const type = Notification.schema.obj.type
    expect(type).toEqual({
      type: String,
      required: true
    })
  })

  test('has sender', () => {
    const sender = Notification.schema.obj.sender
    expect(sender).toEqual({
      type: String,
      required: true
    })
  })

  test('has recipient', () => {
    const recipient = Notification.schema.obj.recipient
    expect(recipient).toEqual({
      type: String,
      required: true
    })
  })

  test('has read', () => {
    const read = Notification.schema.obj.read
    expect(read).toEqual({
      type: Boolean,
      default: false
    })
  })

  test('has tweetId', () => {
    const tweetId = Notification.schema.obj.tweetId
    expect(tweetId).toEqual(SchemaTypes.ObjectId)
  })

  test('has replyId', () => {
    const replyId = Notification.schema.obj.replyId
    expect(replyId).toEqual(SchemaTypes.ObjectId)
  })
})
