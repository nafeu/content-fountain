'use strict';

app.service('apiService', function($http) {
  this.getTagData = function(token, sheetId) {
    var googleSheetsApi = "https://sheets.googleapis.com/v4/spreadsheets/";
    var cellValues = "/values/A2%3AC";
    var key = "?key=" + token;
    var requestUrl = googleSheetsApi + sheetId + cellValues + key;
    return $http.get(requestUrl);
  };

  this.getBoardLists = function(apiKey, oauthToken, boardUrl) {
    var trelloApi = "https://api.trello.com/1/boards/";
    var boardId = boardUrl.match("\/b\/(.*)\/")[1];
    var option = "/lists";
    var auth = "?key=" + apiKey + "&token=" + oauthToken;
    var requestUrl = trelloApi + boardId + option + auth;
    return $http.get(requestUrl);
  }

  this.createCard = function(apiKey, oauthToken, idList, data) {
    var trelloApi = "https://api.trello.com/1/cards";
    var params = data;
    params.key = apiKey;
    params.token = oauthToken;
    params.idList = idList;
    return $http.post(trelloApi, params);
  }
});
