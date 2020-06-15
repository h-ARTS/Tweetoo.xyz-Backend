import { ChangeStream } from 'mongodb'
import { controllers } from '../../utils/crud'
import { Reply } from './reply.model'
import { Like } from '../like/like.model'
import { IChangeEventDelete } from '../tweet/tweet.controllers'

const watchReplies: ChangeStream = Reply.watch(null, {
  fullDocument: 'updateLookup'
})

watchReplies.on('change', async (change: IChangeEventDelete): Promise<void> => {
  const reply = change.documentKey

  if (change.operationType === 'delete') {
    try {
      await Like.find()
        .where('docId', reply._id)
        .findOneAndRemove()
    }
    catch (reason) {
      console.error(reason)
    }
  }
})

export default controllers(Reply)
