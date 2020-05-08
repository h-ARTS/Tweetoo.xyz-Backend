import { Router } from 'express'
import controllers from './tweet.controllers'
import { appendToUser, removeFromUser } from '../user/user.controllers'
import { assignImagePath } from '../user/user-assets/upload.controller'
import uploadImage from '../../utils/uploadImage'

const router: Router = Router()

// /api/tweet
router
  .route('/')
  .get(controllers.getOne)
  .post(controllers.createOne, appendToUser)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

// /api/tweet/liked
router.route('/liked').get(controllers.getAllLiked)

// /api/tweet/:tweetId
router
  .route('/:tweetId')
  .put(controllers.updateOne)
  .delete(controllers.removeOne, removeFromUser)

router
  .route('/next')
  .get(controllers.getPaginated)

// /api/tweet/:tweetId
router.route('/:tweetId/like').put(controllers.likeDoc)
router.route('/:tweetId/unlike').put(controllers.unlikeDoc)
router.route('/:tweetId/retweet').post(controllers.reTweet)
router.route('/:tweetId/undoretweet').delete(controllers.undoRetweet)

// /api/tweet/:tweetId/image
router.route('/:tweetId/image').post(uploadImage, assignImagePath)

export default router
