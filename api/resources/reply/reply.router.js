import { Router } from 'express'
import controllers from './reply.controllers'
import { appendToUser } from '../user/user.controllers'
import { appendToTweet } from '../tweet/tweet.controllers'

const router = Router()

// /api/reply
router
  .route('/')
  .post(controllers.createOne, appendToTweet, appendToUser)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

router.route('/like').put(controllers.likeDoc)
router.route('/unlike').put(controllers.unlikeDoc)

export default router
