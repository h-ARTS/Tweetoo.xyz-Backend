import { Router } from 'express'
import controllers from './tweet.controllers'
import { likeDoc, unlikeDoc } from '../like/like.controller'

const router = Router()

// /api/tweet
router
  .route('/')
  .get(controllers.getOne)
  .post(controllers.createOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

// /api/tweet/:tweetId
router
  .route('/:tweetId')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)

// /api/tweet/:tweetId
router.route('/:tweetId/like').put(likeDoc)
router.route('/:tweetId/unlike').put(unlikeDoc)

// TODO: Add reply handler

export default router
