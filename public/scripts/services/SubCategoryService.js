angular.module('main').factory('SubCategory', function () {

    var SubCategory = Parse.Object.extend('SubCategory', {

        isActive: function () {
            return this.status === 'Active';
        },

        isInactive: function () {
            return this.status === 'Inactive';
        }

    }, {

        new() {
            return new SubCategory();
        },

        getInstance: function () {
            return this;
        },

        all: function (params) {

            var query = new Parse.Query(this);

            if (params && params.canonical) {
                query.contains('canonical', params.canonical);
            }

            if (params && params.category) {
                query.equalTo('category', params.category);
            }

            if (params && params.limit && params.page) {
                query.limit(params.limit);
                query.skip((params.page * params.limit) - params.limit);
            }

            if (params && params.orderBy === 'asc') {
                query.ascending(params.orderByField);
            } else if (params && params.orderBy === 'desc') {
                query.descending(params.orderByField);
            } else {
                query.descending('createdAt');
            }

            query.include('category');
            query.doesNotExist('deletedAt');

            return query.find();

        },

        count: function (params) {

            var query = new Parse.Query(this);

            if (params && params.canonical) {
                query.contains('canonical', params.canonical);
            }

            if (params && params.category) {
                query.equalTo('category', params.category);
            }

            query.doesNotExist('deletedAt');

            return query.count();

        },

        save: function (obj) {
            return obj.save();
        },

        delete: function (obj) {
            obj.deletedAt = new Date;
            return obj.save();
        }

    });

    Object.defineProperty(SubCategory.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
        }
    });

    Object.defineProperty(SubCategory.prototype, 'category', {
        get: function () {
            return this.get('category');
        },
        set: function (val) {
            this.set('category', val);
        }
    });

    Object.defineProperty(SubCategory.prototype, 'status', {
        get: function () {
            return this.get('status');
        },
        set: function (val) {
            this.set('status', val);
        }
    });

    Object.defineProperty(SubCategory.prototype, 'canonical', {
        get: function () {
            return this.get('canonical');
        },
        set: function (val) {
            this.set('canonical', val);
        }
    });

    Object.defineProperty(SubCategory.prototype, 'deletedAt', {
        get: function () {
            return this.get('deletedAt');
        },
        set: function (val) {
            this.set('deletedAt', val);
        }
    });

    Object.defineProperty(SubCategory.prototype, 'image', {
        get: function () {
            return this.get('image');
        },
        set: function (val) {
            this.set('image', val);
        }
    });

    Object.defineProperty(SubCategory.prototype, 'imageThumb', {
        get: function () {
            return this.get('imageThumb');
        },
        set: function (val) {
            this.set('imageThumb', val);
        }
    });

    return SubCategory;

});