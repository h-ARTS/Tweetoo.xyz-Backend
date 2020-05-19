import config from '../../config'
import * as jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { User, IUser } from '../resources/user/user.model'
import {
  Blacklist,
  IBlacklist
} from '../resources/blacklist-token/blacklist.model'
import { checkBlacklisted } from '../resources/blacklist-token/blacklist.util'
import { IMedia } from '../resources/media/media.model'

export type ResolveType<T> = (value?: T | PromiseLike<T>) => void
export type RejectType = (reason?: any) => void

export interface IRequestUser extends Request {
  user: Omit<IUser, 'password'>
  params: {
    tweetId?: string
    filename?: string
    handle?: string
  }
  query: {
    tweetId?: string
    replyId?: string
    handles?: string
    follow?: string
    entry?: string
  },
  medias?: IMedia[]
}

export const newToken = (user: Pick<IUser, 'id'>): string => {
  const options: jwt.SignOptions = {
    algorithm: 'RS256',
    expiresIn: config.secrets.jwtExp
  }
  return jwt.sign({ id: user.id }, config.secrets.privateKey, options)
}

export const verifyToken = (token: string): Promise<IUser> => {
  return new Promise(
    (resolve: ResolveType<IUser>, reject: RejectType): void => {
      jwt.verify(
        token,
        config.secrets.publicKey,
        { algorithms: ['RS256'] },
        (err: Error | null, payload: IUser): void | IUser => {
          if (err) return reject(err)
          return resolve(payload)
        }
      )
    }
  )
}

export const signup = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.fullName ||
    !req.body.handle
  ) {
    return res.status(400).send({
      message: 'Email, password, full name and user handle are required.'
    })
  }

  try {
    const user: IUser = await User.create(req.body)
    const token: string = newToken(user)
    return res.status(201).json(token)
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
}

export const login = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'Email and password required!' })
  }

  const invalid = { message: 'Wrong email and password combination.' }

  try {
    const user: IUser = await User.findOne({ email: req.body.email })
      .select('email password') // We only include email and password and exclude the rest
      .exec()

    if (!user) {
      return res.status(401).send(invalid)
    }

    const match: boolean = await user.verifyPassword(req.body.password)

    if (!match) {
      return res.status(401).send(invalid)
    }

    const token: string = newToken(user)
    return res.status(201).json(token)
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

export const logout = async (
  req: IRequestUser,
  res: Response
): Promise<void> => {
  const token: string = req.headers.authorization.split('Bearer ')[1]
  // TODO: Define exact types
  const { exp, iat }: any = jwt.decode(token)
  try {
    const blacklisted: IBlacklist = await Blacklist.create({ token, exp, iat })
    delete req.user
    delete req.headers.authorization
    res.status(200).send({ blacklisted })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

export const authGuard = async (
  req: IRequestUser,
  res: Response,
  next?: NextFunction
): Promise<object | void> => {
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end()
  }

  const token = bearer.split('Bearer ')[1].trim()

  let payload: IUser
  const isBlacklistedToken: boolean = await checkBlacklisted(token)

  try {
    if (!isBlacklistedToken) {
      payload = await verifyToken(token)
    } else {
      return res.status(401).end()
    }
  } catch (e) {
    console.error(e)
    return res.status(401).end()
  }

  const user: Omit<IUser, 'password'> = await User.findById(payload.id)
    .select('-password')
    .lean()

  if (!user) {
    return res.status(401).end()
  }

  req.user = user
  next()
}
