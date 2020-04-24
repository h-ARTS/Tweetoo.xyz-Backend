import { Response } from 'express'
import { Model } from 'mongoose'
import { IRequestUser } from '../../utils/auth'
import { notify } from '../../utils/notificationEmitter'
import { Like } from './like.model'
import { ITweet } from '../tweet/tweet.model'
import { IReply } from '../reply/reply.model'

export const likeDoc = (model: Model<ITweet|IReply>) => 
  async (req: IRequestUser, res: Response): Promise<Response<any>|void> => {
  const docId = req.query.replyId || req.params.tweetId

  try {
    const alreadyLiked = await Like.findOne({
      docId: docId,
      createdBy: req.user._id
    })
    if (alreadyLiked) {
      return res
        .status(400)
        .send({ message: 'Client already liked this tweet.' })
    }

    const doc = await model
      .findByIdAndUpdate(docId, { $inc: { likeCount: 1 } }, { new: true })
      .lean()
      .exec()

    if (!doc) {
      return res.status(404).send({ message: 'Tweet or Reply not found!' })
    } else {
      notify.emit('like', req.user, doc)
    }

    const like = await Like.create({
      docId: docId,
      createdBy: req.user._id,
      handle: req.user.handle
    })

    return res.status(201).json({ doc, like })
  } catch (e) {
    console.error(e)
    return res.status(400).end(e)
  }
}

export const unlikeDoc = (model: Model<ITweet|IReply>) => 
  async (req: IRequestUser, res: Response): Promise<Response<any>|void> => {
  const docId = req.query.replyId || req.params.tweetId

  try {
    const docToCheck = await model.findById(docId)

    if (!docToCheck) {
      return res.status(404).send({
        message: 'Tweet or Reply not found!'
      })
    }

    if (docToCheck.likeCount === 0) {
      return res
        .status(400)
        .send({ message: 'Cannot unlike this tweet when likeCount 0.' })
    }

    const doc = await model
      .findByIdAndUpdate(docId, { $inc: { likeCount: -1 } }, { new: true })
      .lean()
      .exec()

    const removedLike = await Like.findOneAndRemove({
      docId: docId,
      createdBy: req.user._id
    })
      .lean()
      .exec()

    return res.status(201).json({ doc, removedLike })
  } catch (e) {
    console.error(e)
    res.status(400).end(e)
  }
}
