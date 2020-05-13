import { Response, Request } from 'express'
import { ChangeStream, ChangeEventDelete } from 'mongodb'
import { Types } from 'mongoose'
import { User, IUser } from './user.model'
import { Like } from '../like/like.model'
import { Reply, IReply } from '../reply/reply.model'
import { Tweet, ITweet } from '../tweet/tweet.model'
import { notify } from '../../utils/notificationEmitter'
import { IRequestUser } from '../../utils/auth'

const watchUsers: ChangeStream = User.watch()

watchUsers.on('change', async (result: ChangeEventDelete): Promise<void> => {
  if (result.operationType === 'delete') {
    const user = result.documentKey

    await Tweet.find()
      .where('createdBy')
      .and([user._id])
      .remove()

    await Like.find()
      .where('createdBy')
      .and([user._id])
      .remove()

    await Reply.find()
      .where('createdBy')
      .and([user._id])
      .remove()
  }
})

export const myProfile = (req: IRequestUser, res: Response): Response<any> => {
  return res.status(200).json(req.user)
}

export const getUser = async (req: Request, res: Response):
  Promise<Response<any> | void> => {
  try {
    const user = await User.findOne({ handle: req.params.handle }).select(
      '-password'
    )
    if (!user) return res.status(404).end()

    return res.status(200).json(user)
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}

export const getUsers = async (req: IRequestUser, res: Response):
  Promise<Response<any>> => {
  const arrHandles: string[] = req.query.handles.split(',')
  try {
    const users = await User.find({ handle: { $in: arrHandles } }).select(
      '-password'
    )

    return res.status(200).json(users)
  } catch (e) {
    return res.status(404).send('No users found.')
  }
}

export const updateProfile = async (req: IRequestUser, res: Response):
  Promise<Response<any> | void> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true
    })
      .select('-password')
      .lean()
      .exec()
    if (!updatedUser) return res.status(404).send({ message: 'User not found.' })

    return res.status(200).json(updatedUser)
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const followHandler = async (req: IRequestUser, res: Response):
  Promise<Response<any> | void> => {
  try {
    const targetUser = await User.findOne({ handle: req.params.handle }).select(
      '-password'
    )
    if (!targetUser) return res.status(400).end()

    const isAlreadyFollower =
      targetUser.followers.find(user => user.handle == req.user.handle)
    if (isAlreadyFollower) return res.status(400).end('Already follower')

    const me = await User.findById(req.user._id).select('-password')
    if (!me) return res.status(400).end()

    const isFollow = req.query.follow === 'true'
    if (isFollow) {
      targetUser.followers.push({ handle: req.user.handle })
      me.following.push({ handle: targetUser.handle })
      notify.emit('follow', me, targetUser)
    } else {
      const followerToRemove = targetUser.followers.find(
        f => f.handle === req.user.handle
      )
      targetUser.followers.pull({ _id: followerToRemove._id })

      const followingToRemove = me.following.find(
        f => f.handle === targetUser.handle
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

export const appendToUser = async (req: IRequestUser, res: Response):
  Promise<Response<any> | void> => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    let result: { reply?: IReply, tweet: ITweet, user: IUser }
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

export const removeFromUser = async (req: IRequestUser, res: Response):
  Promise<Response<any> | void> => {
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

export const deleteProfile = async (req: IRequestUser, res: Response):
  Promise<Response<any> | void> => {
  try {
    const removedProfile = await User.findByIdAndRemove(req.user._id).exec()
    if (!removedProfile) return res.status(404).send({ message: 'User not found.' })

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
  getUsers: getUsers,
  followHandler: followHandler,
  appendToUser: appendToUser,
  removeFromUser: removeFromUser,
  deleteProfile: deleteProfile
}
