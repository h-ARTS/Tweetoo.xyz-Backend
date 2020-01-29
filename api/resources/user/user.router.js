import { Router } from 'express'
import {
  myProfile,
  updateProfile,
  getUser,
  followHandler,
  deleteProfile
} from './user.controllers'
import { uploadImage } from '../../utils/uploadImage'
import { assignImagePath } from './user-assets/upload.controller'
import { checkUserAssets } from './user-assets/assets.controller'

const router = Router()

router.get('/', myProfile)
router.put('/', updateProfile)
router.delete('/', checkUserAssets, deleteProfile)
router.get('/:handle', getUser)
router.put('/:handle', followHandler)
router.post('/:handle/image', uploadImage, assignImagePath)

export default router
