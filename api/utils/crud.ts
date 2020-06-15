import { Request, Response, NextFunction } from 'express'
import { Model } from 'mongoose'
import { IRequestUser } from './auth'
import { likeDoc, unlikeDoc } from '../resources/like/like.controller'
import { User } from '../resources/user/user.model'
import { notify } from './notificationEmitter'
import { Like } from '../resources/like/like.model'
import { ITweet } from '../resources/tweet/tweet.model'
import { IReply } from '../resources/reply/reply.model'

type ICrudType<RequestT> = (model: Model<ITweet | IReply>)
  => (req: RequestT, res: Response, next?: NextFunction)
    => Promise<Response<any> | void> | NextFunction

export const getAll: ICrudType<Request> = model => async (req, res) => {
  try {
    const docs = await model
      .find()
      .select('_id createdAt handle createdBy tweetImages')
      .lean()
      .exec()

    return res.status(200).json(docs)
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}

export const getPaginated: ICrudType<IRequestUser> = model => async (req, res) => {
  let last_id: String
  try {
    last_id = req.query.tweetId
    const docs = last_id !== ''
      ? await model
        .find({ '_id': { $lt: last_id } })
        .sort('-createdAt')
        .select('_id createdAt handle createdBy tweetId')
        .limit(10)
        .lean()
        .exec()
      : await model
        .find()
        .sort('-createdAt')
        .select('_id createdAt handle createdBy tweetId')
        .limit(10)
        .lean()
        .exec()

    const lastId = docs[docs.length - 1]._id
    return res.status(200).json({ docs, lastId })
  } catch (error) {
    console.error(error)
    return res.status(404).end()
  }
}

export const getSpecific: ICrudType<Request> = model => async (req, res) => {
  try {
    const docs = await model
      .find({ tweetId: req.params.tweetId })
      .lean()
      .exec()

    return res.status(200).json(docs)
  } catch (e) {
    return res.status(404).send('No docs found')
  }
}

export const getOne: ICrudType<Request> = model => async (req, res) => {
  try {
    const doc = await model
      .findById(req.query.id)
      .lean()
      .exec()

    if (!doc) {
      return res.status(404).end()
    }

    return res.status(200).json(doc)
  } catch (reason) {
    console.error(reason)
    return res.status(404).end()
  }
}

export const createOne: ICrudType<IRequestUser> = model => async (req, res, next) => {
  const { _id, fullName, handle, userImage } = req.user
  const userBody = {
    createdBy: _id,
    fullName: fullName,
    handle: handle,
    userImageUrl: userImage ? userImage.url : ''
  }

  let doc: ITweet | IReply
  const tweetId = req.query.tweetId
  try {
    if (tweetId) {
      notify.emit('reply', userBody, tweetId)
    }
    doc = await model.create({ ...req.body, ...userBody, tweetId })
    req.body.doc = doc
    return next()
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const updateOne: ICrudType<IRequestUser> = model => async (req, res) => {
  try {
    const docId = req.params.tweetId || req.query.replyId
    const updatedDoc = await model
      .findOneAndUpdate(
        {
          createdBy: req.user._id,
          _id: docId
        },
        req.body,
        { new: true }
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      return res.status(404).end()
    }

    return res.status(200).json({ data: updatedDoc })
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}

export const removeOne: ICrudType<IRequestUser> = model => async (req, res, next) => {
  try {
    const docId = req.params.tweetId || req.query.replyId
    const removedDoc = await model.findOneAndRemove({
      createdBy: req.user._id,
      _id: docId
    })

    if (!removedDoc) {
      return res.status(404).send({ message: 'Not found for removal' })
    }

    req.body.removed = removedDoc
    return next()
  } catch (e) {
    console.error(e)
    return res.status(404).send({ message: 'Not found for removal' })
  }
}

export const reTweet: ICrudType<IRequestUser> = model => async (req, res) => {
  const docId = req.params.tweetId || req.query.replyId
  try {
    const user = await User.findById(req.user._id).select('-password')
    const doc: ITweet | IReply | null = await model
      .findByIdAndUpdate(
        docId,
        {
          $inc: { retweetCount: 1 }
        },
        { new: true }
      )
      .lean()

    // TODO: Define the exact type of ref constant
    const ref: any = { retweet: true, tweetId: null, replyId: null }
    const itIsReply = req.query.hasOwnProperty('replyId')
    if (itIsReply) {
      ref.replyId = doc._id
      ref.tweetId = doc.tweetId
      user.replies.push(ref)
    } else {
      ref.tweetId = doc._id
      user.tweets.push(ref)
    }
    notify.emit('retweet', req.user, doc)
    await user.save()

    return res.status(201).json({ user, doc })
  } catch (e) {
    console.error(e)
    return res
      .status(404)
      .send({ message: 'This doc does not exist in the database.' })
  }
}

export const undoRetweet: ICrudType<IRequestUser> = model => async (req, res) => {
  const docId = req.params.tweetId || req.query.replyId
  try {
    const user = await User.findById(req.user._id).select('-password')
    const doc = await model
      .findByIdAndUpdate(docId, { $inc: { retweetCount: -1 } }, { new: true })
      .lean()
      .exec()

    // TODO: Define exact type of ref
    let ref: any
    if (req.query.hasOwnProperty('replyId')) {
      ref = user.replies.find(r => r.replyId.toString() === doc._id.toString())
      user.replies.pull(ref._id)
    } else {
      ref = user.tweets.find(t => t.tweetId.toString() === doc._id.toString())
      user.tweets.pull(ref._id)
    }
    await user.save()

    return res.status(201).json({ user, doc })
  } catch (e) {
    console.error(e)
    return res
      .status(404)
      .send({ message: 'This doc does not exist in the database.' })
  }
}

export const getAllLiked: ICrudType<IRequestUser> = model => async (req, res) => {
  const createdBy = req.user._id

  try {
    const likes = await Like.find()
      .where('createdBy')
      .equals(createdBy)
      .select('docId')

    if (!likes) {
      return res
        .status(404)
        .send('No likes found associated with your account.')
    }

    const docIdOnly = likes.map(like => {
      return like.docId
    })

    const tweets = await model.find({ _id: { $in: docIdOnly } }).lean()

    if (!tweets) {
      return res.status(404).send('No liked tweets found.')
    }

    return res.status(200).json(tweets)
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

interface IControllers {
  // TODO: Define exact type
  [x: string]: any
}

export const controllers = (model: Model<ITweet | IReply>): IControllers => {
  return {
    getAll: getAll(model),
    getPaginated: getPaginated(model),
    getSpecific: getSpecific(model),
    getOne: getOne(model),
    getAllLiked: getAllLiked(model),
    createOne: createOne(model),
    updateOne: updateOne(model),
    removeOne: removeOne(model),
    likeDoc: likeDoc(model),
    unlikeDoc: unlikeDoc(model),
    reTweet: reTweet(model),
    undoRetweet: undoRetweet(model)
  }
}
