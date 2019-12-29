import { Like } from './like.model'
import { Tweet } from '../tweet/tweet.model'
import { Types } from 'mongoose'

export const likeDoc = async (req, res) => {
  try {
    const alreadyLiked = await Like.findOne({
      tweetId: req.params.tweetId,
      createdBy: req.user._id
    })
    if (alreadyLiked) {
      return res
        .status(400)
        .send({ message: 'Client already liked this tweet.' })
    }

    const tweet = await Tweet.findByIdAndUpdate(
      req.params.tweetId,
      { $inc: { likeCount: 1 } },
      { new: true }
    )
      .lean()
      .exec()

    const like = await Like.create({
      tweetId: Types.ObjectId(req.params.tweetId),
      createdBy: req.user._id,
      handle: req.user.handle
    })

    res.status(201).json({ tweet, like })
  } catch (e) {
    console.error(e)
    res.status(400).end(e)
  }
}

export const unlikeDoc = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId)
    if (tweet.likeCount === 0) {
      return res
        .status(400)
        .send({ message: 'Cannot unlike this tweet when likeCount 0.' })
    }

    tweet
      .updateOne({ $inc: { likeCount: -1 } })
      .lean()
      .exec()

    const removedLike = await Like.findOneAndRemove({
      tweetId: Types.ObjectId(req.params.tweetId),
      createdBy: req.user._id
    })

    res.status(201).json({ tweet, removedLike })
  } catch (e) {
    console.error(e)
    res.status(400).end(e)
  }
}
