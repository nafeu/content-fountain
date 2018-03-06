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
  $scope.tagData = [];
  $scope.showConnections = false;

  $scope.tokens = {
    google: storageService.get('googleToken'),
    trello: storageService.get('trelloToken')
  }
  $scope.sheetId = storageService.get('sheetId');

  $scope.save = function(key, value) {
    storageService.set(key, value);
  }

  $scope.loadTagData = function() {
    apiService.getTagData($scope.tokens.google, $scope.sheetId).then(function(res, err){
      $scope.tagData = [];
      res.data.values.forEach(function(item){
        var tagList = ["MISSING-TAGS-FOR-" + item[0]];
        if (item.length > 1) {
          tagList = item[1].split(" ").map(function(tag){
            return tag.substr(1);
          });
        }
        $scope.tagData.push({
          category: item[0],
          tags: tagList,
        })
      });
    });
  }

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