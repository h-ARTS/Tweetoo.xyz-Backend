describe('Like controllers:', () => {
  describe('likeDoc', () => {
    test('creates a like doc with the associated tweet id and user id.', async () => {})

    test('increased the likeCount by 1.', async () => {})

    test('doesn not increase again by the same user id if already liked.', async () => {})

    test('does not create a new like doc again if already liked.', async () => {})
  })

  describe('unlikeDoc', () => {
    test('removes a like doc with the associated tweet id and user id.', async () => {})

    test('decreases the likeCount by 1.', async () => {})

    test('decreases the likeCount.', async () => {})

    test('does not decrease the likeCount if is set to 0.', async () => {})
  })
})
