import { User } from './user.model'
import { Like } from '../like/like.model'
import { Reply } from '../reply/reply.model'
import { Tweet } from '../tweet/tweet.model'
import { Types } from 'mongoose'
import { notify } from '../../utils/notificationEmitter'

const watchUsers = User.watch()

watchUsers.on('change', async result => {
  if (result.operationType === 'delete') {
    const user = result.documentKey

    await Tweet.find()
      .where('createdBy')
      .all([user._id])
      .remove()

    await Like.find()
      .where('createdBy')
      .all([user._id])
      .remove()

    await Reply.find()
      .where('createdBy')
      .all([user._id])
      .remove()
  }
})

export const myProfile = (req, res) => {
  return res.status(200).json({ data: req.user })
}

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle }).select(
      '-password'
    )

    if (!user) {
      return res.status(404).end()
    }

    return res.status(200).json(user)
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true
    })
      .select('-password')
      .lean()
      .exec()

    if (!updatedUser) {
      return res.status(404).send({ message: 'User not found.' })
    }

    return res.status(200).json(updatedUser)
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const followHandler = async (req, res) => {
  try {
    const targetUser = await User.findOne({ handle: req.params.handle }).select(
      '-password'
    )
    if (!targetUser) {
      return res.status(400).end()
    }

    const me = await User.findById(req.user._id).select('-password')
    if (!me) {
      return res.status(400).end()
    }

    const isFollowTrue = req.query.follow === 'true'
    if (isFollowTrue) {
      targetUser.followers.push({ userId: req.user._id })
      me.following.push({ userId: targetUser._id })
      notify.emit('follow', me, targetUser)
    } else {
      const followerToRemove = targetUser.followers.find(
        f => f.userId.toString() === req.user._id.toString()
      )
      targetUser.followers.pull({ _id: followerToRemove._id })

      const followingToRemove = me.following.find(
        f => f.userId.toString() === targetUser._id.toString()
      )
      me.following.pull({ _id: followingToRemove._id })
    }
    await targetUser.save()
    await me.save()

    res.status(200).json({ target: targetUser, updated: me })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const appendToUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    let result
    if (req.body.doc.tweetId) {
      user.replies.push({
        replyId: req.body.doc._id,
        tweetId: req.body.doc.tweetId
      })
      result = {
        reply: req.body.doc,
        tweet: req.body.tweet,
        user
      }
    } else {
      user.tweets.push({ tweetId: req.body.doc._id })
      result = {
        tweet: req.body.doc,
        user
      }
    }

    await user.save()

    return res.status(201).json(result)
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
}

export const removeFromUser = async (req, res) => {
  const doc = req.body.removed
  const itHasRepliesArray = doc.replies
  try {
    const user = await User.findById(req.user._id).select('-password')

    if (itHasRepliesArray) {
      const tweetObj = user.tweets.find(
        t => t.tweetId.toString() === doc._id.toString()
      )
      const replyDocs = user.replies
        .filter(r => r.tweetId.toString() === doc._id.toString())
        .map(r => Types.ObjectId(r._id))

      user.tweets.pull({ _id: tweetObj._id })
      user.replies.pull(...replyDocs)
    } else {
      const replyObj = user.replies.find(
        r => r.replyId.toString() === doc._id.toString()
      )
      user.replies.pull({ _id: replyObj._id })
    }
    await user.save()

    return res.status(200).json({ removed: doc, user })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const deleteProfile = async (req, res) => {
  try {
    const removedProfile = await User.findByIdAndRemove(req.user._id).exec()

    if (!removedProfile) {
      return res.status(404).send({ message: 'User not found.' })
    }

    res.status(200).json({ removed: removedProfile })
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
}

export const controllers = {
  myProfile: myProfile,
  updateProfile: updateProfile,
  getUser: getUser,
  followHandler: followHandler,
  appendToUser: appendToUser,
  removeFromUser: removeFromUser,
  deleteProfile: deleteProfile
}
