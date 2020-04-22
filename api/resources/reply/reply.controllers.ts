import { ChangeStream } from 'mongodb'
import { controllers } from '../../utils/crud'
import { Reply } from './reply.model'
import { Like } from '../like/like.model'
import { IChangeEventDelete } from '../tweet/tweet.controllers'

const watchReplies: ChangeStream = Reply.watch(undefined, {
  fullDocument: 'updateLookup'
})

watchReplies.on('change', async (change: IChangeEventDelete): Promise<void> => {
  const reply = change.fullDocument
  if (change.operationType === 'delete') {
    await Like.find()
      .where('docId')
      .and([reply._id])
      .remove()
  }
})

export default controllers(Reply)
