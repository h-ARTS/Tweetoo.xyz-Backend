import { EventEmitter } from 'events'
import { Notification } from '../resources/notification/notification.model'
import { Tweet } from '../resources/tweet/tweet.model'

export let notify

const initNotificationEmitter = () => {
  notify = new EventEmitter()

  notify.on('reply', async (user, tweetId) => {
    const tweet = await Tweet.findById(tweetId).lean()
    if (user.handle !== tweet.handle) {
      await Notification.create({
        type: 'reply',
        tweetId,
        sender: user.handle,
        recipient: tweet.handle
      })
    }
  })

  notify.on('like', async (user, doc) => {
    const docType = doc.hasOwnProperty('replies') ? 'tweetId' : 'replyId'
    if (user.handle !== doc.handle) {
      await Notification.create({
        type: 'like',
        [docType]: doc._id,
        sender: user.handle,
        recipient: doc.handle
      })
    }
  })

  notify.on('retweet', async (user, doc) => {
    const docType = doc.hasOwnProperty('tweetId') ? 'replyId' : 'tweetId'
    if (user.handle !== doc.handle) {
      await Notification.create({
        type: 'retweet',
        [docType]: doc._id,
        sender: user.handle,
        recipient: doc.handle
      })
    }
  })

  notify.on('follow', async (me, targetUser) => {
    if (me.handle !== targetUser.handle) {
      await Notification.create({
        type: 'follow',
        sender: me.handle,
        recipient: targetUser.handle
      })
    }
  })
}

export const removeNotifyListeners = () => {
  notify.removeAllListeners()
}

export default initNotificationEmitter
