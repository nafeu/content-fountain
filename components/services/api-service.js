'use strict';

app.service('apiService', function($http) {
  this.getTagData = function(token, sheetId) {
    var googleSheetsApi = "https://sheets.googleapis.com/v4/spreadsheets/";
    var cellValues = "/values/A2%3AC";
    var key = "?key=" + token;
    var requestUrl = googleSheetsApi + sheetId + cellValues + key;
    return $http.get(requestUrl);
  };

  this.getBoardLists = function(req) {
    var trelloApi = "https://api.trello.com/1/boards/";
    var boardId = req.boardUrl.match("\/b\/(.*)\/")[1];
    var option = "/lists";
    var auth = "?key=" + req.key + "&token=" + req.token;
    var requestUrl = trelloApi + boardId + option + auth;
    return $http.get(requestUrl);
  }

  this.getCardsFromList = function(req) {
    var trelloApi = "https://api.trello.com/1/lists/";
    var listId = req.idList;
    var auth = "?key=" + req.key + "&token=" + req.token;
    var option = "/cards";
    var requestUrl = trelloApi + listId + option + auth;
    return $http.get(requestUrl);
  }

  this.createCard = function(req) {
    var trelloApi = "https://api.trello.com/1/cards";
    return $http.post(trelloApi, req);
  }

  this.addCommentToCard = function(req) {
    var trelloApi = "https://api.trello.com/1/cards/";
    var action = "/actions/comments";
    var requestUrl = trelloApi + req.idCard + action;
    return $http.post(requestUrl, req);
  }
});
