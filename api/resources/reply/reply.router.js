import { Router } from 'express'
import controllers from './reply.controllers'
import { handleReplyCount } from '../tweet/tweet.controllers'

const router = Router()

// /api/tweet/:tweetId/reply
router
  .route('/:tweetId/reply')
  .post(controllers.createOne, handleReplyCount)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

router.route('/:tweetId/reply/:replyId/like').put(controllers.likeDoc)
router.route('/:tweetId/reply/:replyId/unlike').put(controllers.unlikeDoc)

router.route('/:tweetId/replies').get(controllers.getAll)

export default router
