'use strict';

angular.module('myApp.fulfill', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/fulfill', {
    templateUrl: 'views/fulfill/fulfill.html',
    controller: 'FulfillCtrl'
  });
}])

.controller('FulfillCtrl', ['$scope', 'apiService', 'storageService', function($scope, apiService, storageService) {

    apiService.getCardsFromList(authorizeTrelloRequest({
      "idList": storageService.get('listId')
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