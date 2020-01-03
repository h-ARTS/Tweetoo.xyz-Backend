import { Router } from 'express'
import controllers from './reply.controllers'
import { handleReplyCount } from '../tweet/tweet.controllers'

const router = Router()

// /api/reply
router
  .route('/')
  .post(controllers.createOne, handleReplyCount)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

router.route('/like').put(controllers.likeDoc)
router.route('/unlike').put(controllers.unlikeDoc)

export default router
