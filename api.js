const { buildSchema } = require('graphql')

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const schema = buildSchema(`
  type Query {
    greeting: String
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`)

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------
const rootValue = {
  greeting: function() {
    return "Hello World!"
  },
  rollDice: function ({numDice, numSides}) {
    const output = []
    for (var i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)))
    }
    return output
  }
};

module.exports = {
  schema,
  rootValue
}