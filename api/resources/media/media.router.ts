import { Router } from 'express'
import { authGuard } from '../../utils/auth'
import { assignImagePath } from '../user/user-assets/upload.controller'
import controllers from './media.controllers'
import getBody from '../../utils/getBody'
import { userImageUpload } from '../../utils/uploadImage'
import { moveCachedFileToUserDir } from '../../utils/moveCachedFileToUserDir'

const router: Router = Router()

router
  .route('/cached')
  .put(
    authGuard,
    controllers.removeCachedMediaDoc,
    moveCachedFileToUserDir,
    assignImagePath
  )
  .post(authGuard, controllers.removeCachedMediaDoc, getBody)

router
  .route('/cached/:type')
  .post(userImageUpload, controllers.assignCachedImagePath)

router.route('/user/:handle').get(authGuard, controllers.createUserFolder)
router.route('/user/:handle/:filename').get(authGuard, controllers.getMedia)
router.route('/tweet/:tweetId/:filename').get(authGuard, controllers.getMedia)

export default router
