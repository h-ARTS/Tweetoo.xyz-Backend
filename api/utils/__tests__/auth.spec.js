describe('Authentication:', () => {
  describe('newToken', () => {
    test('creates a new json web token from user id.', async () => {})
  })

  describe('verifyToken', () => {
    test('validates the token and returns payload.', async () => {})
  })

  describe('login', () => {
    test('requires email and password.', async () => {})

    test('user must exist.', async () => {})

    test('passwords must match.', async () => {})

    test('creates a new token.', async () => {})
  })

  describe('signup', () => {
    test('requires email and password.', async () => {})

    test('creates a new user and sends a token from user.', async () => {})
  })

  describe('authGuard', () => {
    test('looks for Bearer token in headers.', async () => {})

    test('looks for the token and must have correct prefix.', async () => {})

    test('checks for a real user.', async () => {})

    test('finds a user from token and passes on.', async () => {})
  })
})
