import { Router } from 'express'
import {
  myProfile,
  updateProfile,
  getUser,
  followHandler
} from './user.controllers'

const router = Router()

router.get('/', myProfile)
router.put('/', updateProfile)
router.get('/:handle', getUser)
router.put('/:handle', followHandler)

// TODO: Create router for image upload

export default router
