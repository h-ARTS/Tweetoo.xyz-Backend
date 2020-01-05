import { Router } from 'express'
import controllers from './tweet.controllers'
import { appendToUser, removeFromUser } from '../user/user.controllers'

const router = Router()

// /api/tweet
router
  .route('/')
  .get(controllers.getOne)
  .post(controllers.createOne, appendToUser)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

// /api/tweet/:tweetId
router
  .route('/:tweetId')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne, removeFromUser)

// /api/tweet/:tweetId
router.route('/:tweetId/like').put(controllers.likeDoc)
router.route('/:tweetId/unlike').put(controllers.unlikeDoc)

export default router
