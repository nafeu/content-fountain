'use strict';

app.service('apiService', function($http) {
  this.greeting = function() {
    var query = `{ greeting }`;
    return $http.post('/api', {query: query});
  }
  this.rollDice = function(numDice, numSides) {
    var query = `query RollDice($dice: Int!, $sides: Int) {
      rollDice(numDice: $dice, numSides: $sides)
    }`;
    return $http.post('/api', {
      query: query,
      variables: {dice: numDice, sides: numSides}
    });
  }
});
