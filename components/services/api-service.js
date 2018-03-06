'use strict';

app.service('apiService', function($http) {
  this.getTagData = function(token, sheetId) {
    var googleSheetsApi = "https://sheets.googleapis.com/v4/spreadsheets/";
    var cellValues = "/values/A2%3AB";
    var key = "?key=" + token;
    var requestUrl = googleSheetsApi + sheetId + cellValues + key;
    return $http.get(requestUrl);
  }
});
