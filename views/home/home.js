'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', 'apiService', 'storageService', function($scope, apiService, storageService) {

  new ClipboardJS('.btn');

  $scope.caption = "";
  $scope.tags = "";

  $scope.tagData = [
    {
      category: "popular",
      tags: ["fun", "love", "life"]
    },
    {
      category: "music",
      tags: ["electronic", "EDM", "dance"],
    },
    {
      category: "photography",
      tags: ["landscape", "sunset", "scenic"]
    }
  ]

  $scope.insertTags = function(key) {
    $scope.tagData.forEach(function(collection){
      if (collection.category === key) {
        collection.tags.forEach(function(tag){
          $scope.tags += "#" + tag + " ";
        })
        return;
      }
    })
  }

  $scope.insertCaption = function() {
    $scope.caption = "Here is a test caption";
  }

  $scope.insertContact = function() {
    $scope.contact = "Check out more work by @person";
  }

}]);