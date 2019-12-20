import { controllers } from '../user.controllers'

describe('user controllers:', () => {
  test('has functions to display your profile and to update it.', () => {
    const methods = ['myProfile', 'updateProfile']

    methods.forEach(method => {
      expect(typeof controllers[method]).toBe('function')
    })
  })
})
