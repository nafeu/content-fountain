const { buildSchema } = require('graphql')

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const schema = buildSchema(`
  type Query {
    hello: String
  }
`)

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------
const rootValue = {
  hello: () => {
    return 'Hello world!'
  },
}

module.exports = {
  schema,
  rootValue
}