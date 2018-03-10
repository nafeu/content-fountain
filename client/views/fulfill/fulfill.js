'use strict';

angular.module('myApp.fulfill', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/fulfill', {
    templateUrl: 'views/fulfill/fulfill.html',
    controller: 'FulfillCtrl'
  });
}])

.controller('FulfillCtrl', ['$scope',
                            '$window',
                            'apiService',
                            'storageService',
                            function($scope,
                                     $window,
                                     apiService,
                                     storageService) {

  $scope.queuedIdeas = [];
  $scope.finalizedIdeas = [];

  $scope.connections = {
    googleApiKey: storageService.get('googleApiKey'),
    trelloApiKey: storageService.get('trelloApiKey'),
    trelloOauthToken: storageService.get('trelloOauthToken'),
    sheetUrl: storageService.get('sheetUrl'),
    boardUrl: storageService.get('boardUrl'),
    listIds: {
      ideas: storageService.get('listId'),
      actions: "",
      finalized: "",
      completed: "",
    }
  }

  $scope.loadCards = function() {
    apiService.getCardsFromList($scope.authorizeTrelloRequest({
      "idList": $scope.connections.listIds.ideas
    }))
      .then(function(res){
        $scope.queuedIdeas = [];
        res.data.forEach(function(card){
          var decodedData = JSON.parse(card.desc);
          var queuedIdea = {
            "name": card.name,
            "url": card.url,
            "id": card.id,
          }
          if (decodedData.caption) {
            queuedIdea.caption = decodedData.caption;
          }
          if (decodedData.tags) {
            queuedIdea.tags = decodedData.tags;
          }
          $scope.queuedIdeas.push(queuedIdea)
        })
      })
    apiService.getCardsFromList($scope.authorizeTrelloRequest({
      "idList": $scope.connections.listIds.finalized
    }))
      .then(function(res){
        $scope.finalizedIdeas = [];
        res.data.forEach(function(card){
          var decodedData = JSON.parse(card.desc);
          var finalizedIdea = {
            "name": card.name,
            "url": card.url,
            "id": card.id,
          }
          if (decodedData.caption) {
            finalizedIdea.caption = decodedData.caption;
          }
          if (decodedData.tags) {
            finalizedIdea.tags = decodedData.tags;
          }
          $scope.finalizedIdeas.push(finalizedIdea);
        })
      })
  }

  $scope.authorizeTrelloRequest = function(obj) {
    return Object.assign({
      "key": $scope.connections.trelloApiKey,
      "token": $scope.connections.trelloOauthToken
    }, obj)
  }

  $scope.complete = function(card) {
    apiService.moveCard($scope.authorizeTrelloRequest({
      "idCard": card.id,
      "value": $scope.connections.listIds.completed
    })).then(function(res){
      var index = $scope.finalizedIdeas.indexOf(card);
      if (index > -1) {
        $scope.finalizedIdeas.splice(index, 1);
      }
    }, function(err){
      alert(JSON.stringify(err));
    });
  }

  $scope.finalize = function(card) {
    apiService.moveCard($scope.authorizeTrelloRequest({
      "idCard": card.id,
      "value": $scope.connections.listIds.finalized
    })).then(function(res){
      var index = $scope.queuedIdeas.indexOf(card);
      if (index > -1) {
        $scope.queuedIdeas.splice(index, 1);
      }
      $scope.finalizedIdeas.push(card);
    }, function(err){
      alert(JSON.stringify(err));
    });
  }

  $scope.copyCaption = function(item) {

  }

  $scope.copyTags = function(item) {

  }

  $scope.remove = function(card) {
    apiService.deleteCard($scope.authorizeTrelloRequest({
      "idCard": card.id
    })).then(function(res){
      if ($scope.queuedIdeas.indexOf(card) > -1) {
        $scope.queuedIdeas.splice($scope.queuedIdeas.indexOf(card), 1);
      }
      if ($scope.finalizedIdeas.indexOf(card) > -1) {
        $scope.finalizedIdeas.splice($scope.finalizedIdeas.indexOf(card), 1);
      }
    }, function(err){
      alert(JSON.stringify(err));
    });
  }

  $scope.loadData = function() {
    apiService.getBoardLists($scope.authorizeTrelloRequest({
      "boardUrl": $scope.connections.boardUrl,
    }))
      .then(function(res, err){
        res.data.forEach(function(list){
          var listName = list.name.toLowerCase()
          switch(listName) {
            case "actions":
              $scope.connections.listIds.actions = list.id;
              console.log(list.name);
              break;
            case "ideas":
              $scope.connections.listIds.ideas = list.id;
              console.log(list.name);
              break;
            case "finalized":
              $scope.connections.listIds.finalized = list.id;
              console.log(list.name);
              break;
            case "completed":
              $scope.connections.listIds.completed = list.id;
              console.log(list.name);
              break;
            default:
              break;
          }
        })
        $scope.loadCards();
      })
  }

  $scope.copyToClipboard = function(text) {
    var textarea = $window.document.createElement('textarea');
    textarea.setAttribute('style', 'opacity: 0');
    textarea.textContent = text;
    $window.document.body.appendChild(textarea);
    textarea.select();
    $window.document.execCommand('copy');
    textarea.remove();
    alert("Copied the following to clipboard:\n" + text);
  }

  $scope.loadData()

}]);