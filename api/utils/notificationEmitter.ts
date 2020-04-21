import { EventEmitter } from 'events'
import { Notification } from '../resources/notification/notification.model'
import { Tweet, ITweet } from '../resources/tweet/tweet.model'
import { IUser } from '../resources/user/user.model'
import { IReply } from '../resources/reply/reply.model'

export let notify: EventEmitter

const initNotificationEmitter = (): void => {
  notify = new EventEmitter()

  notify.on('reply', async (user: IUser, tweetId: string): Promise<void> => {
    const tweet: ITweet = await Tweet.findById(tweetId).lean()
    if (user.handle !== tweet.handle) {
      await Notification.create({
        type: 'reply',
        tweetId,
        sender: user.handle,
        recipient: tweet.handle
      })
    }
  })

  notify.on('like', async (user: IUser, doc: ITweet | IReply): Promise<void> => {
    const docType: string = doc.hasOwnProperty('replies') ? 'tweetId' : 'replyId'
    if (user.handle !== doc.handle) {
      await Notification.create({
        type: 'like',
        [docType]: doc._id,
        sender: user.handle,
        recipient: doc.handle
      })
    }
  })

  notify.on('retweet', async (user: IUser, doc: ITweet | IReply): Promise<void> => {
    const docType: string = doc.hasOwnProperty('tweetId') ? 'replyId' : 'tweetId'
    if (user.handle !== doc.handle) {
      await Notification.create({
        type: 'retweet',
        [docType]: doc._id,
        sender: user.handle,
        recipient: doc.handle
      })
    }
  })

  notify.on('follow', async (me: IUser, targetUser: IUser): Promise<void> => {
    if (me.handle !== targetUser.handle) {
      await Notification.create({
        type: 'follow',
        sender: me.handle,
        recipient: targetUser.handle
      })
    }
  })
}

export const removeNotifyListeners = (): void => {
  notify.removeAllListeners()
}

export default initNotificationEmitter
