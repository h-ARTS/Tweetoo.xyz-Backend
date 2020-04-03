import { Router } from 'express'
import { authGuard } from '../../utils/auth'
import { assignImagePath } from '../user/user-assets/upload.controller'
import controllers from './media.controllers'
import uploadImage from '../../utils/uploadImage'
import { moveCachedFileToUserDir } from '../../utils/moveCachedFileToUserDir'

const router = Router()

router.route('/cached').put(controllers.removeCachedMediaDoc, assignImagePath)

router
  .route('/cached/:type')
  .post(uploadImage, controllers.assignCachedImagePath)
  .put(moveCachedFileToUserDir, assignImagePath)

router.route('/user/:handle/:filename').get(authGuard, controllers.getMedia)
router.route('/tweet/:tweetId/:filename').get(authGuard, controllers.getMedia)

export default router
