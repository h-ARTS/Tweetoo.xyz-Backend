import { ConnectionOptions, Mongoose, connect as connectMongo, set } from 'mongoose'
import config from '../../config'
set('useUnifiedTopology', true)
set('useFindAndModify', false)
set('useCreateIndex', true)

export const connect = (url: string = config.dbUrl, opts: ConnectionOptions = {}): 
  Promise<Mongoose> => {
    return connectMongo(url, {
      ...opts,
      useNewUrlParser: true
    })
}
