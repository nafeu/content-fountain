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

  apiService.getCardsFromList(authorizeTrelloRequest({
    "idList": $scope.connections.listId
  }))
    .then(function(res){
      console.log(res.data);
      $scope.contentQueue = [];
      res.data.forEach(function(item){
        $scope.contentQueue.push({
          "name": item.name,
          "url": item.url
        })
      })
    })

}]);