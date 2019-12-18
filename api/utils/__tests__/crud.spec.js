// This is just a stupid example
//
// import { getAny } from '../server'
//
// describe('Basic GET request:', () => {
//   test('getAny should return 200 with a text', async () => {
//     expect.assertions(2)
//
//     const req = {}
//     const res = {
//       status(code) {
//         expect(code).toBe(200)
//         return this
//       },
//       send(result) {
//         expect(typeof result).toBe('string')
//       }
//     }
//
//     await getAny(req, res)
//   })
// })

describe('CRUD controllers for Tweets and Replies:', () => {
  describe('getAll', () => {
    test('finds an array of docs.', async () => {})

    test('responds 404 if no doc was found.', async () => {})
  })

  describe('getOne', () => {
    test('finds a doc by id.', async () => {})

    test('responds 404 if no doc was found.', async () => {})
  })

  describe('createOne', () => {
    test('creates a new doc.', async () => {})

    test('createdBy should be the authenticated user.', async () => {})
  })

  describe('updateOne', () => {
    test('finds a doc by authenticated user and id to update.', async () => {})

    test('responds 404 if no doc was found.', async () => {})
  })

  describe('removeOne', () => {
    test('removes one doc by authenticated user and id.', async () => {})

    test('responds 404 if no doc was found.', async () => {})
  })

  describe('likeTweet', () => {
    test('finds a doc by id and increases the like count by 1.', async () => {})

    test('responds 404 if no doc was found.', async () => {})
  })

  describe('unlikeTweet', () => {
    test('finds a doc by id and decreases the like count by 1.', async () => {})

    test('responds 404 if no doc was found.', async () => {})
  })

  describe('reTweet', () => {
    test('finds a doc by id and increases the retweet count by 1.', async () => {})

    test('copies the tweet and adds it to the user object.', async () => {})

    test('sets the retweet property to true.', async () => {})

    test('responds 404 if no tweet was found.', async () => {})
  })

  describe('undoRetweet', () => {
    test('finds the tweet by id and decreases the retweet count by 1.', async () => {})

    test('removes the tweet by id from the user object.', async () => {})

    test('sets the retweet property to false.', async () => {})

    test('responds 404 if no tweet was found.', async () => {})
  })
})

// PSEUDO tweet and user JSON objects
// tweet = {
//   fullText: 'dasfsadasd',
//   createdBy: 'babu',
//   createdAt: 1873894234
// }

// user = {
//   name: 'max',
//   bio: '',
//   followers: 1201,
//   following: 943,
//   tweets: [
//     {
//       fullText: 'dasfsadasd',
//       createdBy: 'max',
//       createdAt: 1873894234,
//       retweet: false,
//       likeCount: 112,
//       retweetCount: 21
//     },
//     {
//       fullText: 'dasfsadasd',
//       createdBy: 'babu',
//       createdAt: 1873891211,
//       retweet: true,
//       likeCount: 222,
//       retweetCount: 33
//     }
//   ]
// }
