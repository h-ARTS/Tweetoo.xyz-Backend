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
        recipient: tweet.handle,
        read: false
      })
    }
  })

  notify.on('like', (like, doc) => {})

  notify.on('retweet', (doc, user) => {})

  notify.on('follow', follower => {})
}

export default initNotificationEmitter
