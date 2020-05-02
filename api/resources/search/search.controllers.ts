import { Response } from 'express'
import { IRequestUser } from '../../utils/auth'
import { User, IUser } from '../user/user.model'
import { Tweet, ITweet } from '../tweet/tweet.model'

export const getEntries = async (
  req: IRequestUser,
  res: Response
): Promise<Response<{ users: IUser[]; tweets: ITweet[] }> | void> => {
  const { entry } = req.query
  try {
    const userEntries = await User.find(
      { $text: { $search: entry } },
      { score: { $meta: 'textScore' } }
    )
      .select('-password')
      .sort({ score: { $meta: 'textScore' } })
      .lean()
    const tweetEntries = await Tweet.find(
      { $text: { $search: entry } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .lean()

    if (!userEntries && !tweetEntries)
      return res.status(404).send('No entries found.')

    res.status(200).json({ users: userEntries, tweets: tweetEntries })
  } catch (error) {
    console.error(error)
    res.status(400).end()
  }
}
