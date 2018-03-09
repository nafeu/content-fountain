'use strict';

app.service('storageService', ['STORAGE_ID', function(storageId) {
  var storageKey = storageId + '-appData';
  this.get = function(key, defaultOutput) {
    if (window.localStorage.getItem(storageKey)) {
      var retrievedItem = JSON.parse(window.localStorage.getItem(storageKey))[key]
      if (retrievedItem) {
        return retrievedItem;
      }
      return defaultOutput;
    }
    return defaultOutput;
  }
  this.set = function(key, value) {
    var appData = JSON.parse(window.localStorage.getItem(storageKey));
    if (!appData) {
      appData = {};
    }
    appData[key] = value;
    window.localStorage.setItem(storageKey, JSON.stringify(appData));
  }
  this.export = function(exclusive) {
    if (window.localStorage.getItem(storageKey)) {
      if (exclusive) {
        var rawStorage = JSON.parse(window.localStorage.getItem(storageKey));
        var out = {};
        Object.keys(rawStorage).forEach(function(key){
          if (exclusive.indexOf(key) > -1) {
            out[key] = rawStorage[key];
          }
        });
        return window.btoa(JSON.stringify(out));
      } else {
        return window.btoa(window.localStorage.getItem(storageKey));
      }
    }
  }
  this.load = function(dataString, callback) {
    window.localStorage.setItem(storageKey, window.atob(dataString));
    if (callback) {
      callback();
    }
  }
  this.read = function() {
    return window.localStorage.getItem(storageKey);
  }
}]);
