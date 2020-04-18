import { likeDoc, unlikeDoc } from '../resources/like/like.controller'
import { User } from '../resources/user/user.model'
import { notify } from './notificationEmitter'
import { Like } from '../resources/like/like.model'

export const getAll = model => async (req, res) => {
  try {
    const docs = await model
      .find()
      .limit(10)
      .lean()
      .exec()

    return res.status(200).json(docs)
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}

export const getSpecific = model => async (req, res) => {
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

export const getOne = model => async (req, res) => {
  try {
    const doc = await model
      .findOne(req.body)
      .lean()
      .exec()

    if (!doc) {
      return res.status(404).end()
    }

    return res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}

export const createOne = model => async (req, res, next) => {
  const userBody = {
    createdBy: req.user._id,
    fullName: req.user.fullName,
    handle: req.user.handle,
    userImageUrl: req.user.userImage.url
  }

  let doc
  const tweetId = req.query.tweetId
  try {
    if (tweetId) {
      notify.emit('reply', userBody, tweetId)
    }
    doc = await model.create({ ...req.body, ...userBody, tweetId })
    req.body.doc = doc
    next()
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const updateOne = model => async (req, res) => {
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

export const removeOne = model => async (req, res, next) => {
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
    next()
  } catch (e) {
    console.error(e)
    return res.status(404).send({ message: 'Not found for removal' })
  }
}

export const reTweet = model => async (req, res) => {
  const docId = req.params.tweetId || req.query.replyId
  try {
    const user = await User.findById(req.user._id).select('-password')
    const doc = await model
      .findByIdAndUpdate(
        docId,
        {
          $inc: { retweetCount: 1 }
        },
        { new: true }
      )
      .lean()
      .exec()

    const ref = { retweet: true }
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

    res.status(201).json({ user, doc })
  } catch (e) {
    console.error(e)
    res
      .status(404)
      .send({ message: 'This doc does not exist in the database.' })
  }
}

export const undoRetweet = model => async (req, res) => {
  const docId = req.params.tweetId || req.query.replyId
  try {
    const user = await User.findById(req.user._id).select('-password')
    const doc = await model
      .findByIdAndUpdate(docId, { $inc: { retweetCount: -1 } }, { new: true })
      .lean()
      .exec()

    let ref
    if (req.query.hasOwnProperty('replyId')) {
      ref = user.replies.find(r => r.replyId.toString() === doc._id.toString())
      user.replies.pull(ref._id)
    } else {
      ref = user.tweets.find(t => t.tweetId.toString() === doc._id.toString())
      user.tweets.pull(ref._id)
    }
    await user.save()

    res.status(201).json({ user, doc })
  } catch (e) {
    console.error(e)
    res
      .status(404)
      .send({ message: 'This doc does not exist in the database.' })
  }
}

export const getAllLiked = model => async (req, res) => {
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

    res.status(200).json(tweets)
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const controllers = model => {
  return {
    getAll: getAll(model),
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
