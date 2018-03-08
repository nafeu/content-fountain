'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$window', 'apiService', 'storageService', function($scope, $window, apiService, storageService) {

  new ClipboardJS('.btn');

  var MAX_TAGS = 30;

  $scope.caption = "";
  $scope.tags = "";
  $scope.tagData = [];
  $scope.showConnections = false;
  $scope.selectedTopics = [];
  $scope.listName = "instagram";

  $scope.connections = {
    googleApiToken: storageService.get('googleApiToken'),
    trelloApiKey: storageService.get('trelloApiKey'),
    trelloOauthToken: storageService.get('trelloOauthToken'),
    sheetUrl: storageService.get('sheetUrl'),
    boardUrl: storageService.get('boardUrl'),
    listId: storageService.get('listId')
  }

  $scope.open = function(url) {
    $window.open(url, "_blank");
  }

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
    var sheetId = $scope.connections.sheetUrl.match("d\/(.*)\/edit")[1];
    apiService.getTagData($scope.connections.googleApiToken, sheetId).then(function(res, err){
      $scope.tagData = [];
      res.data.values.forEach(function(item){
        var tagList = ["MISSING-TAGS-FOR-" + item[1]];
        if (item.length > 1) {
          tagList = item[2].split(" ").map(function(tag){
            return tag.substr(1);
          });
        }
        $scope.tagData.push({
          topic: item[0],
          root: item[1],
          tags: tagList,
        })
      });
    });
  }

  $scope.updateTags = function() {
    var numTags = Math.floor(MAX_TAGS / $scope.selectedTopics.length);

    $scope.tags = "";
    $scope.selectedTopics.forEach(function(root){
      $scope.tagData.forEach(function(collection){
        if (collection.root === root) {
          for (var i = 0; i < numTags; i++) {
            $scope.tags += "#" + collection.tags[i] + " ";
          }
        }
      });
    });
  }

  $scope.updateListId = function() {
    apiService.getBoardLists($scope.connections.trelloApiKey,
                             $scope.connections.trelloOauthToken,
                             $scope.connections.boardUrl)
      .then(function(res, err){
        res.data.forEach(function(list){
          if (list.name.toLowerCase() === $scope.listName) {
            $scope.connections.listId = list.id;
            storageService.set('listId', list.id);
          }
        })
      })
  }

  $scope.createCard = function() {
    var data = {
      "name": $scope.caption,
      "desc": "•\x0A•\x0A•\x0A•\x0A•\x0A" + $scope.tags,
      "pos": "top",
    }
    apiService.createCard($scope.connections.trelloApiKey,
                          $scope.connections.trelloOauthToken,
                          $scope.connections.listId,
                          data)
    .then(function(res){
      alert(JSON.stringify(res));
    }, function(err){
      alert(JSON.stringify(err));
    })
  }


}]);