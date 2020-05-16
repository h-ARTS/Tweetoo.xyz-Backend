import { Router } from 'express'
import { getEntries } from './search.controllers'

const router: Router = Router()

// /api/search?entry=*
router.route('/').get(getEntries)

export default router
