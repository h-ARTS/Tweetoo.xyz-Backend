import { Router } from 'express'
import controllers from './reply.controllers'

const router = Router()

// /api/tweet/:tweetId/reply
router
  .route('/reply')
  .post(controllers.createOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

router.route('/reply/:replyId/like').put(controllers.likeDoc)
router.route('/reply/:replyId/unlike').put(controllers.unlikeDoc)

router.route('/replies').get(controllers.getAll)

export default router
