import { Bookmarks } from './bookmarks.model'

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmarks.find({ userId: req.user._id })

    res.status(200).json(bookmarks)
  } catch (e) {
    res.status(404).end(e)
  }
}

export const createBookmark = async (req, res) => {
  const { tweet, tweetId } = req.body
  try {
    const bookmark = await Bookmarks.create({
      tweet: { ...tweet, tweetId },
      userId: req.user._id
    })

    res.status(201).json(bookmark)
  } catch (e) {
    res.status(400).end(e)
  }
}

export default { getBookmarks, createBookmark }
