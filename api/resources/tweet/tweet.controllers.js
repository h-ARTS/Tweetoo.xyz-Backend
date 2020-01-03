import { controllers } from '../../utils/crud'
import { Tweet } from './tweet.model'
import { Like } from '../like/like.model'
import { Reply } from '../reply/reply.model'
import { Types } from 'mongoose'
import { User } from '../user/user.model'

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

export const handleReplyCount = async (req, res) => {
  try {
    const tweet = await Tweet.findOneAndUpdate(
      { _id: Types.ObjectId(req.query.tweetId) },
      {
        $inc: { replyCount: req.method === 'DELETE' ? -1 : 1 }
      },
      { new: true }
    )
      .lean()
      .exec()

    res.status(201).send({ reply: req.body.doc, tweet })
  } catch (e) {
    console.errror(e)
    res.status(500).end()
  }
}

export default controllers(Tweet)
