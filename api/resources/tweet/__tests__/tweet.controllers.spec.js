import controllers from '../tweet.controllers'

describe('tweet controllers:', () => {
  test('has crud controllers', () => {
    const crudMethods = [
      'getOne',
      'getAll',
      'createOne',
      'updateOne',
      'removeOne',
      'likeDoc',
      'unlikeDoc'
    ]

    crudMethods.forEach(method => {
      expect(typeof controllers[method]).toBe('function')
    })
  })
})
