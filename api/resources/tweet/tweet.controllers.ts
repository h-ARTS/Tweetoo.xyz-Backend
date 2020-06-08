import { Request, Response, NextFunction } from 'express'
import { ChangeStream, ChangeEventDelete } from 'mongodb'
import { controllers } from '../../utils/crud'
import { Tweet, ITweet } from './tweet.model'
import { Like } from '../like/like.model'
import { Reply, IReply } from '../reply/reply.model'
import { IRequestUser } from '../../utils/auth'
import { Media } from '../media/media.model'
import { removeFileRecursive } from '../../utils/filesystem.utils'

export interface IChangeEventDelete extends ChangeEventDelete {
  fullDocument: ITweet
}

// Watcher works only on mongodb replica sets
const watchTweets: ChangeStream = Tweet.watch(undefined, {
  fullDocument: 'updateLookup'
})

watchTweets.on('change', async (result: IChangeEventDelete): Promise<void> => {
  if (result.operationType === 'delete') {
    const tweet = result.fullDocument
    console.log(tweet)

    await Like.find()
      .where('docId')
      .and([tweet._id])
      .remove()

    await Reply.find()
      .where('tweetId')
      .and([tweet._id])
      .remove()

    removeFileRecursive(`./media/tweets/${tweet._id}`,
      () => console.log(`Tweet ${tweet._id} deleted`))
  }
})

export const appendReplyToTweet = async (req: Request, res: Response,
  next: NextFunction): Promise<void> => {
  try {
    const tweet: ITweet = await Tweet.findById(req.body.doc.tweetId)

    if (!tweet) {
      res.status(404).end()
      return
    }

    tweet.replies.push(req.body.doc._id)
    await tweet.save()

    req.body.tweet = tweet
    next()
  } catch (reason) {
    console.error(reason)
    res.status(400).send('Error querying Tweet doc.')
  }
}

export const getCachedTweetImages = async (req: IRequestUser, res: Response) => {
  const images = req.medias
  return res.status(200).json(images)
}

export const saveCachedTweetMedias = async (req: IRequestUser, res: Response,
  next: NextFunction) => {
  const files = [].concat(req.files).map(file => ({
    path: file.path,
    originalname: file.filename,
    mimetype: file.mimetype,
    handle: req.user.handle
  }))

  try {
    const medias = await Media.create(files)

    req.medias = medias
    return next()
  } catch (reason) {
    console.error(reason)
    return res.status(400).send('Cached tweet images cant be created');
  }
}

export const renameImagePaths =
  async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = req.body.doc
    const userDirTweetImages = req.body.tweetImages
    if (!req.body.tweetImages) return next()

    let tweet: ITweet | any
    try {
      tweet = await Tweet.findById(_id)
      if (!tweet) return res.status(400).send('Tweet not found.')
      tweet.tweetImages = []
      await tweet.save()
    }
    catch (reason) {
      console.error(reason)
      return res.status(400).send('Tweet not found.')
    }

    userDirTweetImages.forEach(image => {
      tweet.tweetImages.push({
        name: image.originalname,
        type: image.mimetype,
        url: image.path,
        mediaId: image.mediaId
      })
    })
    await tweet.save()

    req.body.doc = tweet
    next()
  }

export const removeReplyFromTweet = async (req: Request, res: Response,
  next: NextFunction): Promise<void> => {
  const doc: IReply = req.body.removed
  try {
    const tweet: ITweet = await Tweet.findById(doc.tweetId)

    if (!tweet) {
      res.status(400).end()
      return
    }

    tweet.replies.pull(doc._id)
    await tweet.save()

    req.body.removed = doc
    next()
  } catch (reason) {
    console.error(reason)
    res.status(400).send('Cant remove reply from tweet!')
  }
}

export default controllers(Tweet)
