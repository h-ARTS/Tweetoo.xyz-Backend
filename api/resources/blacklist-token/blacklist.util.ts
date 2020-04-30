import { Blacklist } from './blacklist.model'

export const checkBlacklisted = async (token: string): Promise<boolean> => {
  const blacklistedToken = await Blacklist.findOne({ token })
  if (blacklistedToken == null) return false
  if (blacklistedToken.exp * 1000 < Date.now()) {
    await Blacklist.findOneAndRemove({ token }).exec()
  }
  return true
}
