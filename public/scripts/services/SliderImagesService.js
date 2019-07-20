angular.module('main').factory('SliderImage', function () {

    var SlideImage = Parse.Object.extend('SlideImage', {

    }, {

        new() {
            return new SlideImage;
        },

        all: function (params) {

            var query = new Parse.Query(this);

            if (params && params.orderBy == 'asc') {
                query.ascending(params.orderByField);
            } else if (params && params.orderBy == 'desc') {
                query.descending(params.orderByField);
            } else {
                query.descending('createdAt');
            }

            query.include('item');

            return query.find();

        },

        save: function (obj) {
            return obj.save();
        },

        delete: function (obj) {
            return obj.destroy();
        }

    });

    Object.defineProperty(SlideImage.prototype, 'sort', {
        get: function () {
            return this.get('sort');
        },
        set: function (val) {
            this.set('sort', val);
        }
    });

    Object.defineProperty(SlideImage.prototype, 'image', {
        get: function () {
            return this.get('image');
        },
        set: function (val) {
            this.set('image', val);
        }
    });

    Object.defineProperty(SlideImage.prototype, 'imageThumb', {
        get: function () {
            return this.get('imageThumb');
        },
        set: function (val) {
            this.set('imageThumb', val);
        }
    });

    Object.defineProperty(SlideImage.prototype, 'isActive', {
        get: function () {
            return this.get('isActive');
        },
        set: function (val) {
            this.set('isActive', val);
        }
    });

    Object.defineProperty(SlideImage.prototype, 'type', {
        get: function () {
            return this.get('type');
        },
        set: function (val) {
            this.set('type', val);
        }
    });

    Object.defineProperty(SlideImage.prototype, 'item', {
        get: function () {
            return this.get('item');
        },
        set: function (val) {
            this.set('item', val);
        }
    });

    Object.defineProperty(SlideImage.prototype, 'url', {
        get: function () {
            return this.get('url');
        },
        set: function (val) {
            this.set('url', val);
        }
    });

    return SlideImage;

});