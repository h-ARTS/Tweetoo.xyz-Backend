import { controllers } from '../../utils/crud'
import { Reply } from './reply.model'
import { Like } from '../like/like.model'

const watchReplies = Reply.watch({
  fullDocument: 'updateLookup'
})

watchReplies.on('change', async change => {
  const reply = change.fullDocument
  if (change.operationType === 'delete') {
    await Like.find()
      .where('docId')
      .all([reply._id])
      .remove()
  }
})

export default controllers(Reply)
