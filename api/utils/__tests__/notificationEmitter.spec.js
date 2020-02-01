import initNotificationEmitter, { notify } from '../notificationEmitter'

describe('Notification event emitter', () => {
  test('should have reply, like, retweet and follow events', () => {
    initNotificationEmitter()
    const events = notify.eventNames()

    expect(events).toEqual(['reply', 'like', 'retweet', 'follow'])
    expect(events).toHaveLength(4)
  })
})
