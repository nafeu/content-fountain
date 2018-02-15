const express = require('express'),
  app = express(),
  http = require('http'),
  server = require('http').Server(app),
  graphqlHTTP = require('express-graphql'),
  bodyParser = require('body-parser'),
  { schema, rootValue } = require('./api')

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

server.listen(process.env.PORT || 8000, function(){
  console.log('[ server.js ] Listening on port ' + server.address().port)
});

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/client'))
app.use('/api', graphqlHTTP({schema, rootValue, graphiql: true}))