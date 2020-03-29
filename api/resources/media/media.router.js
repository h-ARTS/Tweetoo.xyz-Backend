import { Router } from 'express'
import { authGuard } from '../../utils/auth'
import { assignImagePath } from '../user/user-assets/upload.controller'
import controllers from './media.controllers'
import uploadImage from '../../utils/uploadImage'

const router = Router()

router.route('/cached').delete(controllers.removeCachedFile, assignImagePath)

router
  .route('/cached/:type')
  .post(uploadImage, controllers.assignCachedImagePath)

router.route('/user/:handle/:filename').get(authGuard, controllers.getMedia)
router.route('/tweet/:tweetId/:filename').get(authGuard, controllers.getMedia)

export default router
