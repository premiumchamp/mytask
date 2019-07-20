'use strict';
angular.module('main').factory('File', function () {
  return {
    upload: function (file, name) {
      return new Parse.File(name || 'image.jpg', file).save();
    }
  };
});