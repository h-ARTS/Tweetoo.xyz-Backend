import { likeDoc, unlikeDoc } from '../resources/like/like.controller'
import { User } from '../resources/user/user.model'

export const getAll = model => async (req, res) => {
  try {
    const docs = await model
      .find()
      .limit(10)
      .lean()
      .exec()

    return res.status(200).json({ data: docs })
  } catch (e) {
    console.error(e)
    return res.status(404).end()
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
    handle: req.user.handle
  }

  let doc
  const tweetId = req.query.tweetId
  try {
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
    if (req.query) {
      ref.replyId = doc._id
      user.replies.push(ref)
    } else {
      ref.tweetId = doc._id
      user.tweets.push(ref)
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

export const undoRetweet = model => async (req, res) => {
  const docId = req.params.tweetId || req.query.replyId
  try {
    const user = await User.findById(req.user._id).select('-password')
    const doc = await model
      .findByIdAndUpdate(docId, { $inc: { retweetCount: -1 } }, { new: true })
      .lean()
      .exec()

    let ref
    if (req.query) {
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

export const controllers = model => {
  return {
    getAll: getAll(model),
    getOne: getOne(model),
    createOne: createOne(model),
    updateOne: updateOne(model),
    removeOne: removeOne(model),
    likeDoc: likeDoc(model),
    unlikeDoc: unlikeDoc(model),
    reTweet: reTweet(model),
    undoRetweet: undoRetweet(model)
  }
}
