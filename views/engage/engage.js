'use strict';

angular.module('myApp.engage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/engage', {
    templateUrl: 'views/engage/engage.html',
    controller: 'EngageCtrl'
  });
}])

.controller('EngageCtrl', ['$scope', 'apiService', 'storageService', function($scope, apiService, storageService) {

}]);