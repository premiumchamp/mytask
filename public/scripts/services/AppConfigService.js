angular.module('main').factory('AppConfig', function () {

  var AppConfig = Parse.Object.extend('AppConfig', {
    initialize: function () {
      this.stripe = {};
      this.about = {};
      this.email = {};
      this.admin = {};
      this.push = {};
    }
  }, {

    loadOne: function () {
      var query = new Parse.Query('AppConfig');
      return query.first()
    },

    save: function (obj) {
      return obj.save();
    }
  });

  Object.defineProperty(AppConfig.prototype, 'admin', {
    get: function () {
      return this.get('admin');
    },
    set: function (val) {
      this.set('admin', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'stripe', {
    get: function () {
      return this.get('stripe');
    },
    set: function (val) {
      this.set('stripe', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'about', {
    get: function () {
      return this.get('about');
    },
    set: function (val) {
      this.set('about', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'email', {
    get: function () {
      return this.get('email');
    },
    set: function (val) {
      this.set('email', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'push', {
    get: function () {
      return this.get('push');
    },
    set: function (val) {
      this.set('push', val);
    }
  });

  return AppConfig;

});