import { Router } from 'express'
import {
  myProfile,
  updateProfile,
  getUser,
  followHandler,
  deleteProfile
} from './user.controllers'
import { userImageUpload } from '../../utils/uploadImage'
import { assignImagePath } from './user-assets/upload.controller'
import { checkUserAssets } from './user-assets/assets.controller'

const router: Router = Router()

router
  .route('/')
  .get(myProfile)
  .put(updateProfile)
  .delete(checkUserAssets, deleteProfile)

router.get('/:handle', getUser)
router.put('/:handle', followHandler)
router.post('/:handle/image', userImageUpload, assignImagePath)

export default router
