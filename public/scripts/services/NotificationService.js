angular.module('main').factory('Notification', function () {

   var Notification = Parse.Object.extend('Notification', {}, {

      all: function () {

         var query = new Parse.Query(this);
         query.descending('createdAt');

         return query.find()

      },

      save: function (obj) {
         return obj.save()
      }
   });

   Object.defineProperty(Notification.prototype, 'message', {
      get: function () {
         return this.get('message');
      },
      set: function (val) {
         this.set('message', val);
      }
   });

   return Notification;

});