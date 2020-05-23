import { Router } from 'express'
// Controllers
import { authGuard } from '../../utils/auth'
import { assignImagePath } from '../user/user-assets/upload.controller'
import controllers from './media.controllers'
// Utils
import { moveCachedFileToUserDir, removeFileAndReturnBody } from '../../utils/filesystem.utils'
import { userImageUpload } from '../../utils/uploadImage'

const router: Router = Router()

router
  .route('/cached')
  .put(
    authGuard,
    controllers.removeCachedMediaDoc,
    moveCachedFileToUserDir,
    assignImagePath
  )
  // This is actually a DELETE request but due to middleware code structure
  // I used post to pass the uniqueImageId (ObjectId) in the body
  .post(authGuard, controllers.removeCachedMediaDoc, removeFileAndReturnBody)

router
  .route('/cached/:type')
  .post(userImageUpload, controllers.assignCachedImagePath)

router.route('/user/:handle').get(authGuard, controllers.createUserFolder)
router.route('/user/:handle/:filename').get(authGuard, controllers.getMedia)
router.route('/tweet/:tweetId/:filename').get(authGuard, controllers.getMedia)

export default router
