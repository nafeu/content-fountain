'use strict';

angular.module('myApp.fulfill', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/fulfill', {
    templateUrl: 'views/fulfill/fulfill.html',
    controller: 'FulfillCtrl'
  });
}])

.controller('FulfillCtrl', ['$scope', 'apiService', 'storageService', function($scope, apiService, storageService) {

  $scope.contentQueue = [];

  $scope.connections = {
    googleApiKey: storageService.get('googleApiKey'),
    trelloApiKey: storageService.get('trelloApiKey'),
    trelloOauthToken: storageService.get('trelloOauthToken'),
    sheetUrl: storageService.get('sheetUrl'),
    boardUrl: storageService.get('boardUrl'),
    listId: storageService.get('listId')
  }

  $scope.loadCards = function() {
    apiService.getCardsFromList($scope.authorizeTrelloRequest({
      "idList": $scope.connections.listId
    }))
      .then(function(res){
        $scope.contentQueue = [];
        res.data.forEach(function(item){
          var decodedData = JSON.parse(item.desc);
          var queuedContent = {
            "name": item.name,
            "url": item.url
          }
          if (decodedData.caption) {
            queuedContent.caption = decodedData.caption;
          }
          if (decodedData.tags) {
            queuedContent.tags = decodedData.tags;
          }
          $scope.contentQueue.push(queuedContent)
        })
      })
  }

  $scope.authorizeTrelloRequest = function(obj) {
    return Object.assign({
      "key": $scope.connections.trelloApiKey,
      "token": $scope.connections.trelloOauthToken
    }, obj)
  }

  $scope.loadCards();

}]);