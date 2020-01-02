import { Like } from './like.model'
import { Types } from 'mongoose'

export const likeDoc = model => async (req, res) => {
  const docId = req.params.replyId || req.params.tweetId

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

    const like = await Like.create({
      docId: Types.ObjectId(docId),
      createdBy: req.user._id,
      handle: req.user.handle
    })

    res.status(201).json({ doc, like })
  } catch (e) {
    console.error(e)
    res.status(400).end(e)
  }
}

export const unlikeDoc = model => async (req, res) => {
  const docId = req.params.replyId || req.params.tweetId

  try {
    const doc = await model.findById(docId)
    if (doc.likeCount === 0) {
      return res
        .status(400)
        .send({ message: 'Cannot unlike this tweet when likeCount 0.' })
    }
    await doc
      .updateOne({ $inc: { likeCount: -1 } })
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
