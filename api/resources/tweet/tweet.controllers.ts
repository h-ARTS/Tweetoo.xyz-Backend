import { controllers } from '../../utils/crud'
import { Tweet, ITweet } from './tweet.model'
import { Like } from '../like/like.model'
import { Reply, IReply } from '../reply/reply.model'
import { ChangeStream, ChangeEventDelete } from 'mongodb'
import { Request, Response, NextFunction } from 'express'


interface IChangeEventDelete extends ChangeEventDelete {
  fullDocument: ITweet
}

// Watcher works only on mongodb replica sets
const watchTweets: ChangeStream = Tweet.watch(null, {
  fullDocument: 'updateLookup'
})

watchTweets.on('change', async (result: IChangeEventDelete): Promise<void> => {
  if (result.operationType === 'delete') {
    const tweet = result.fullDocument

    await Like.find()
      .where('docId')
      .and([tweet._id])
      .remove()

    await Reply.find()
      .where('tweetId')
      .and([tweet._id])
      .remove()
  }
})

export const appendReplyToTweet = async (req: Request, res: Response, 
  next: NextFunction): Promise<void> => {
  try {
    const tweet: ITweet = await Tweet.findById(req.body.doc.tweetId)
    tweet.replies.push(req.body.doc._id)
    await tweet.save()

    req.body.tweet = tweet
    next()
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const removeReplyFromTweet = async (req: Request, res: Response, 
  next: NextFunction): Promise<void> => {
  const doc: IReply = req.body.removed
  try {
    const tweet: ITweet = await Tweet.findById(doc.tweetId)
    tweet.replies.pull(doc._id)
    await tweet.save()

    req.body.removed = doc
    next()
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export default controllers(Tweet)
