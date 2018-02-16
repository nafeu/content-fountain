'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', 'apiService', function($scope, apiService) {
  apiService.greeting().success(function(res){
    $scope.greeting = res.data.greeting;
  });

  apiService.rollDice(4, 6).success(function(res){
    $scope.rollDice = res.data.rollDice;
  });
}]);