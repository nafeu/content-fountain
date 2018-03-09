'use strict';

angular.module('myApp.connect', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/connect', {
    templateUrl: 'views/connect/connect.html',
    controller: 'ConnectCtrl'
  });
}])

.controller('ConnectCtrl', ['$scope',
                            '$window',
                            '$timeout',
                            'apiService',
                            'modalService',
                            'storageService',
                            function($scope,
                                     $window,
                                     $timeout,
                                     apiService,
                                     modalService,
                                     storageService) {

  $scope.copyConnectionsStatus = "Copy Existing Connection Information To Clipboard";
  $scope.connectionCode = "";

  $scope.copyConnections = function() {
    var textarea = $window.document.createElement('textarea');
    textarea.setAttribute('style', 'opacity: 0');
    textarea.textContent = storageService.export([
      "googleApiKey",
      "sheetUrl",
      "sheetId",
      "trelloApiKey",
      "trelloOauthToken",
      "boardUrl",
      "listId"
    ]);
    $window.document.body.appendChild(textarea);
    textarea.select();
    $window.document.execCommand('copy');
    textarea.remove();
    $scope.updateCopyMessage('copyConnectionsStatus');
  }

  $scope.connections = {
    googleApiKey: storageService.get('googleApiKey'),
    trelloApiKey: storageService.get('trelloApiKey'),
    trelloOauthToken: storageService.get('trelloOauthToken'),
    sheetUrl: storageService.get('sheetUrl'),
    boardUrl: storageService.get('boardUrl'),
    listId: storageService.get('listId')
  }

  $scope.updateCopyMessage = function(name) {
    var oldMessage = $scope[name];
    $scope[name] = "Copied to clipboard!";
    $timeout(function(){
      $scope[name] = oldMessage;
    }, 1000)
  }

  $scope.save = function(key, value) {
    storageService.set(key, value);
  }

  $scope.importConnections = function() {
    if ($scope.connectionCode.length > 0) {
      storageService.load($scope.connectionCode, function(){
        $window.location.reload();
      });
    }
  }

  $scope.open = function(url) {
    $window.open(url, "_blank");
  }

  $scope.showAlert = function(header, body) {
    modalService
      .showModal(
        {
          templateUrl: 'views/partials/alert.html'
        },
        {
          headerText: header,
          bodyText: body
        }
      ).then(function(result){});
  }

}]);