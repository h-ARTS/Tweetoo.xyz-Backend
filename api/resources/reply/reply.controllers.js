import { controllers } from '../../utils/crud'
import { Reply } from './reply.model'
import { Like } from '../like/like.model'

const watchReplies = Reply.watch()

watchReplies.on('change', async result => {
  if (result.operationType === 'delete') {
    const reply = result.documentKey

    await Like.find()
      .where('replyId')
      .all([reply._id])
      .remove()
  }
})

export default controllers(Reply)
