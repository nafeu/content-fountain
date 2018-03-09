'use strict';

angular.module('myApp.generate', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/generate', {
    templateUrl: 'views/generate/generate.html',
    controller: 'GenerateCtrl'
  });
}])

.controller('GenerateCtrl', ['$scope',
                         '$window',
                         '$timeout',
                         'apiService',
                         'storageService',
                         function($scope,
                                  $window,
                                  $timeout,
                                  apiService,
                                  storageService) {

  new ClipboardJS('.btn');

  var MAX_TAGS = 30;

  $scope.caption = storageService.get('caption', '');
  $scope.tags = storageService.get('tags');
  $scope.selectedFocalpoint = storageService.get('selectedFocalpoint');
  $scope.selectedMediaType = storageService.get('selectedMediatype');
  $scope.topic = storageService.get('topic');
  $scope.idea = storageService.get('idea');
  $scope.selectedRoots = storageService.get('selectedRoots', []);

  $scope.tagData = [];
  $scope.showConnections = false;
  $scope.listName = "instagram";
  $scope.trelloSaveStatus = "Save to Trello";
  $scope.tagLoadStatus = "Refresh Data";
  $scope.showImport = false;
  $scope.connectionCode = "";
  $scope.copyTagsStatus = "Copy Tags";
  $scope.copyCaptionStatus = "Copy Caption";
  $scope.availableCategories = [];
  $scope.selectedCategory = "";

  $scope.focalpoints = ["question", "insight", "vanity", "throwback", "shoutout", "demonstration", "artwork", "scenery"]
  $scope.mediaTypes = ["photo", "story", "video", "selfie", "textpost"]

  $scope.selectFocalpoint = function(selection) {
    $scope.selectedFocalpoint = selection;
    $scope.save('selectedFocalpoint', selection);
  }

  $scope.selectMediaType = function(selection) {
    $scope.selectedMediaType = selection;
    $scope.save('selectedMediaType', selection);
  }

  $scope.connections = {
    googleApiKey: storageService.get('googleApiKey'),
    trelloApiKey: storageService.get('trelloApiKey'),
    trelloOauthToken: storageService.get('trelloOauthToken'),
    sheetUrl: storageService.get('sheetUrl'),
    boardUrl: storageService.get('boardUrl'),
    listId: storageService.get('listId')
  }

  $scope.open = function(url) {
    $window.open(url, "_blank");
  }

  $scope.toggleRootTag = function(rootTag) {
    var index = $scope.selectedRoots.indexOf(rootTag);
    if (index !== -1) {
      $scope.selectedRoots.splice(index, 1);
    } else {
      $scope.selectedRoots.push(rootTag);
    }
    $scope.updateTags();
    $scope.save("selectedRoots", $scope.selectedRoots);
  }

  $scope.save = function(key, value) {
    storageService.set(key, value);
  }

  $scope.loadTagData = function() {
    if ($scope.connections.googleApiKey.length > 0 && $scope.connections.sheetUrl.length > 0) {
      var sheetId = $scope.connections.sheetUrl.match("d\/(.*)\/edit")[1];
      $scope.tagLoadStatus = "Reloading...";
      apiService.getTagData($scope.connections.googleApiKey, sheetId).then(function(res){
        $scope.tagData = [];
        $scope.availableCategories = [];
        if (res.data.values.length > 0) {
          res.data.values.forEach(function(item){
            if (item.length > 0) {
              var tagList = ["MISSING-TAGS-FOR-" + item[1]];
              tagList = item[2].split(" ").map(function(tag){
                return tag.substr(1);
              });
              if ($scope.availableCategories.indexOf(item[0]) < 0) {
                $scope.availableCategories.push(item[0]);
              }
              $scope.tagData.push({
                category: item[0],
                rootTag: item[1],
                tags: tagList,
              });
            }
          });
        }
        $scope.tagLoadStatus = "Refresh Data";
      }, function(err){
        $scope.tagLoadStatus = "An error occured, try again";
        alert(JSON.stringify(err));
      });
    }
  }

  $scope.updateTags = function() {
    var numTags = Math.floor(MAX_TAGS / $scope.selectedRoots.length);
    var selectedTags = [];

    $scope.tags = "";
    $scope.selectedRoots.forEach(function(rootTag){
      $scope.tagData.forEach(function(collection){
        if (collection.rootTag === rootTag) {
          for (var i = 0; i < numTags; i++) {
            selectedTags.push(collection.tags[i]);
          }
        }
      });
      $scope.tags = "#" + selectedTags
        .filter(function(value, index){
          return selectedTags.indexOf(value) == index;
        }).join(" #");
      $scope.save('tags', $scope.tags);
    });
  }

  $scope.updateListId = function() {
    apiService.getBoardLists($scope.authorizeTrelloRequest({
      "boardUrl": $scope.connections.boardUrl,
    }))
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
    $scope.trelloSaveStatus = "Saving...";
    var encodedCaption = "";
    if ($scope.caption.length > 0) {
      encodedCaption = $scope.caption;
    }
    apiService.createCard($scope.authorizeTrelloRequest({
      "idList": $scope.connections.listId,
      "name": $scope.idea,
      "desc": JSON.stringify({
        caption: encodedCaption,
        tags: $scope.getFormattedTags()
      }),
      "pos": "top"
    }))
      .then(function(cardResponse){
        apiService.addCommentToCard($scope.authorizeTrelloRequest({
          "idCard": cardResponse.data.id,
          "text": $scope.getFormattedTags()
        }));
        if ($scope.caption.length > 0) {
          apiService.addCommentToCard($scope.authorizeTrelloRequest({
            "idCard": cardResponse.data.id,
            "text": $scope.caption
          }));
        }
        $scope.trelloSaveStatus = "Success";
        $timeout(function(){
          $scope.trelloSaveStatus = "Save to Trello";
        }, 2000)
      }, function(err){
        $scope.trelloSaveStatus = "An error occured, try again";
        alert(JSON.stringify(err));
      })
  }

  $scope.insertIdea = function() {
    $scope.idea = $scope.selectedFocalpoint + " in the form of a " + $scope.selectedMediaType + " about " + $scope.topic;
    $scope.save('idea', $scope.idea);
  }

  $scope.clearIdea = function() {
    $scope.caption = "";
    $scope.tags = "";
    $scope.selectedRoots = [];
    $scope.selectedFocalpoint = "";
    $scope.selectedMediaType = "";
    $scope.topic = "";
    $scope.idea = "";
    $scope.saveContentState();
  }

  $scope.saveContentState = function() {
    $scope.save('caption', $scope.caption);
    $scope.save('tags', $scope.tags);
    $scope.save('selectedRoots', $scope.selectedRoots);
    $scope.save('selectedFocalpoint', $scope.selectedFocalpoint);
    $scope.save('selectedMediaType', $scope.selectedMediaType);
    $scope.save('topic', $scope.topic);
  }

  $scope.authorizeTrelloRequest = function(obj) {
    return Object.assign({
      "key": $scope.connections.trelloApiKey,
      "token": $scope.connections.trelloOauthToken
    }, obj)
  }

  $scope.getFormattedTags = function() {
    return "•\x0A•\x0A•\x0A•\x0A•\x0A" + $scope.tags;
  }

  function getTrelloAuthStatus() {
    if ($scope.connections.trelloApiKey.length > 0 &&
        $scope.connections.trelloOauthToken.length > 0 &&
        $scope.connections.boardUrl.length > 0 &&
        $scope.connections.listId.length > 0) {
      return true;
    }
    return false;
  }

  $scope.saveToTrello = function() {
    if ($scope.idea.length < 1) {
      $window.document.getElementById('idea-output').focus();
      $scope.trelloSaveStatus = "Idea Text Required";
      $timeout(function(){
        $scope.trelloSaveStatus = "Save To Trello";
      }, 2000)
    } else {
      if (getTrelloAuthStatus()) {
        $scope.createCard();
      }
    }
  }

  $scope.updateCopyMessage = function(name) {
    var oldMessage = $scope[name];
    $scope[name] = "Copied to clipboard!";
    $timeout(function(){
      $scope[name] = oldMessage;
    }, 1000)
  }

  $scope.categoryFilter = function(collection) {
    if ($scope.selectedCategory.length == 0) {
      return true;
    }
    return collection.category === $scope.selectedCategory;
  };

  $scope.toggleCategory = function(option) {
    if ($scope.selectedCategory == option) {
      $scope.selectedCategory = "";
    } else {
      $scope.selectedCategory = option;
    }
    $scope.save("selectedCategory", option);
  }

  $scope.loadTagData();
  $scope.updateListId();

}]);