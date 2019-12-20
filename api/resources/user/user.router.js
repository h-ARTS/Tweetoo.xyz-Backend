import { Router } from 'express'
import { myProfile, updateProfile } from './user.controllers'

const router = Router()

router.get('/', myProfile)
router.put('/', updateProfile)

// TODO: Create router for image upload

export default router
