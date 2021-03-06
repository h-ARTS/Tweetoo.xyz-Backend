import { Response } from 'express'
import { IRequestUser } from '../../utils/auth'
import { Bookmarks } from './bookmarks.model'

export const getBookmarks = async (
  req: IRequestUser,
  res: Response
): Promise<Response<any> | void> => {
  try {
    const bookmarks = await Bookmarks.find({ userId: req.user._id })

    res.status(200).json(bookmarks)
  } catch (e) {
    res.status(404).end(e)
  }
}

export const createBookmark = async (
  req: IRequestUser,
  res: Response
): Promise<Response<any> | void> => {
  const { tweetId } = req.body
  try {
    const bookmark = await Bookmarks.create({
      tweetId,
      userId: req.user._id
    })

    res.status(201).json(bookmark)
  } catch (error) {
    console.error(error)
    res.status(400).end()
  }
}

export const removeBookmark = async (
  req: IRequestUser,
  res: Response
): Promise<Response<any> | void> => {
  const { tweetId } = req.query
  try {
    const bookmark = await Bookmarks.findOneAndRemove({ tweetId })
      .lean()
      .exec()

    res.status(200).json(bookmark)
  } catch (error) {
    console.error(error)
    res.status(400).end()
  }
}

export default { getBookmarks, createBookmark, removeBookmark }
