import { controllers } from '../../utils/crud'
import { Tweet } from './tweet.model'

// TODO: Create Like Model first
// controllers(Tweet).likeTweet = async (req, res) => {
//   try {
//     const likedTweet = this.findOneAndUpdate({_id: req.params.tweetId}, {likeCount: req.body.likeCount+1})

//     if (!likedTweet)
//   }
// }

export default controllers(Tweet)
