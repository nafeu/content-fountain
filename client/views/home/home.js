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

  var MAX_TAGS = 30;

  $scope.caption = "";
  $scope.tags = "";
  $scope.tagData = [];
  $scope.showConnections = false;
  $scope.selectedTopics = [];

  $scope.tokens = {
    google: storageService.get('googleToken'),
    trello: storageService.get('trelloToken')
  }
  $scope.sheetId = storageService.get('sheetId');

  $scope.toggleTopic = function(topic) {
    var index = $scope.selectedTopics.indexOf(topic);
    if (index !== -1) {
      $scope.selectedTopics.splice(index, 1);
    } else {
      $scope.selectedTopics.push(topic);
    }
    $scope.updateTags();
  }

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

  $scope.updateTags = function() {
    var numTags = Math.floor(MAX_TAGS / $scope.selectedTopics.length);

    $scope.tags = "";
    $scope.selectedTopics.forEach(function(topic){
      $scope.tagData.forEach(function(collection){
        if (collection.category === topic) {
          for (var i = 0; i < numTags; i++) {
            $scope.tags += "#" + collection.tags[i] + " ";
          }
        }
      });
    });
  }

}]);