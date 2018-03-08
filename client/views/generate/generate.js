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

  $scope.caption = "";
  $scope.tags = "";
  $scope.tagData = [];
  $scope.showConnections = false;
  $scope.selectedRoots = [];
  $scope.listName = "instagram";
  $scope.trelloSaveStatus = "Save to Trello";
  $scope.tagLoadStatus = "Load Tag Data";
  $scope.idea = "";
  $scope.showImport = false;
  $scope.connectionCode = "";
  $scope.copyConnectionsStatus = "Copy Connections To Clipboard";
  $scope.copyTagsStatus = "Copy Tags";
  $scope.copyCaptionStatus = "Copy Caption";

  $scope.focalpoints = ["question", "insight", "vanity", "throwback", "shoutout", "demonstration", "artwork", "scenery"]
  $scope.mediaTypes = ["photo", "story", "video", "selfie", "textpost"]
  $scope.selectedFocalpoint = "";
  $scope.selectedMediaType = "";
  $scope.relation = "";

  $scope.selectFocalpoint = function(selection) {
    $scope.selectedFocalpoint = selection;
  }

  $scope.selectMediaType = function(selection) {
    $scope.selectedMediaType = selection;
  }

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
    var index = $scope.selectedRoots.indexOf(topic);
    if (index !== -1) {
      $scope.selectedRoots.splice(index, 1);
    } else {
      $scope.selectedRoots.push(topic);
    }
    $scope.updateTags();
  }

  $scope.save = function(key, value) {
    storageService.set(key, value);
  }

  $scope.loadTagData = function() {
    var sheetId = $scope.connections.sheetUrl.match("d\/(.*)\/edit")[1];
    $scope.tagLoadStatus = "Loading...";
    apiService.getTagData($scope.connections.googleApiToken, sheetId).then(function(res){
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
          rootTag: item[1],
          tags: tagList,
        })
      });
      $scope.tagLoadStatus = "Refresh Tag Data";
    }, function(err){
      $scope.tagLoadStatus = "An error occured, try again";
      alert(JSON.stringify(err));
    });
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
    });
  }

  $scope.updateListId = function() {
    apiService.getBoardLists(authorizeTrelloRequest({
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
    apiService.createCard(authorizeTrelloRequest({
      "idList": $scope.connections.listId,
      "name": $scope.idea,
      "pos": "top"
    }))
      .then(function(cardResponse){
        apiService.addCommentToCard(authorizeTrelloRequest({
          "idCard": cardResponse.data.id,
          "text": getFormattedTags()
        }));
        if ($scope.caption.length > 0) {
          apiService.addCommentToCard(authorizeTrelloRequest({
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
    $scope.idea = $scope.selectedFocalpoint + " in the form of a " + $scope.selectedMediaType + " about " + $scope.relation;
  }

  $scope.clearIdea = function() {
    $scope.caption = "";
    $scope.tags = "";
    $scope.selectedRoots = [];
    $scope.selectedFocalpoint = "";
    $scope.selectedMediaType = "";
    $scope.relation = "";
  }

  function authorizeTrelloRequest(obj) {
    return Object.assign({
      "key": $scope.connections.trelloApiKey,
      "token": $scope.connections.trelloOauthToken
    }, obj)
  }

  function getFormattedTags() {
    return "•\x0A•\x0A•\x0A•\x0A•\x0A" + $scope.tags;
  }

  $scope.saveToTrello = function() {
    if ($scope.idea.length < 1) {
      $window.document.getElementById('idea-output').focus();
      $scope.trelloSaveStatus = "Idea Text Required";
      $timeout(function(){
        $scope.trelloSaveStatus = "Save To Trello";
      }, 2000)
    } else {
      $scope.createCard();
    }
  }

  $scope.copyConnections = function() {
    var textarea = $window.document.createElement('textarea');
    textarea.setAttribute('style', 'opacity: 0');
    textarea.textContent = storageService.export();
    $window.document.body.appendChild(textarea);
    textarea.select();
    $window.document.execCommand('copy');
    textarea.remove();
    $scope.updateCopyMessage('copyConnectionsStatus');
  }

  $scope.importConnections = function() {
    storageService.load($scope.connectionCode, function(){
      $window.location.reload();
    });
  }

  $scope.updateCopyMessage = function(name) {
    var oldMessage = $scope[name];
    $scope[name] = "Copied!";
    $timeout(function(){
      $scope[name] = oldMessage;
    }, 1000)
  }

}]);