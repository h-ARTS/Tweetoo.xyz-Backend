import { controllers } from '../../utils/crud'
import { Tweet } from './tweet.model'
import { Like } from '../like/like.model'
import { Reply } from '../reply/reply.model'

// Watcher works only on mongodb replica sets
const watchTweets = Tweet.watch()

watchTweets.on('change', async result => {
  if (result.operationType === 'delete') {
    const tweet = result.documentKey

    await Like.find()
      .where('tweetId')
      .all([tweet._id])
      .remove()

    await Reply.find()
      .where('tweetId')
      .all([tweet._id])
      .remove()
  }
})

export const appendReplyToTweet = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.body.doc.tweetId)
    tweet.replies.push(req.body.doc._id)
    await tweet.save()

    req.body.tweet = tweet
    next()
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export default controllers(Tweet)
