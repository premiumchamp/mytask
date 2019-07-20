angular.module('main').factory('Zone', function () {

    var Zone = Parse.Object.extend('Zone', {

    }, {

        new() {
            return new Zone();
        },

        getInstance: function() {
            return this;
        },

        all: function (params) {

            var query = new Parse.Query(this);

            if (params && params.canonical) {
                query.contains('canonical', params.canonical);
            }

            if (params && params.parent === false) {
                query.doesNotExist('parent');
            } else if (params && params.parent) {
                query.equalTo('parent', params.parent)
            }

            if (params.onlyParent) {
                query.doesNotExist('parent');
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

            query.include('parent');
            query.doesNotExist('deletedAt');

            return query.find();

        },

        count: function (params) {

            var query = new Parse.Query(this);

            if (params && params.canonical) {
                query.contains('canonical', params.canonical);
            }

            if (params && params.parent === false) {
                query.doesNotExist('parent');
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

    Object.defineProperty(Zone.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
        }
    });

    Object.defineProperty(Zone.prototype, 'sort', {
        get: function () {
            return this.get('sort');
        },
        set: function (val) {
            this.set('sort', val);
        }
    });

    Object.defineProperty(Zone.prototype, 'fee', {
        get: function () {
            return this.get('fee');
        },
        set: function (val) {
            this.set('fee', val);
        }
    });

    Object.defineProperty(Zone.prototype, 'canonical', {
        get: function () {
            return this.get('canonical');
        },
        set: function (val) {
            this.set('canonical', val);
        }
    });

    Object.defineProperty(Zone.prototype, 'parent', {
        get: function () {
            return this.get('parent');
        },
        set: function (val) {
            this.set('parent', val);
        }
    });

    Object.defineProperty(Zone.prototype, 'type', {
        get: function () {
            return this.get('type');
        },
        set: function (val) {
            this.set('type', val);
        }
    });

    Object.defineProperty(Zone.prototype, 'deletedAt', {
        get: function () {
            return this.get('deletedAt');
        },
        set: function (val) {
            this.set('deletedAt', val);
        }
    });

    Object.defineProperty(Zone.prototype, 'isActive', {
        get: function () {
            return this.get('isActive');
        },
        set: function (val) {
            this.set('isActive', val);
        }
    });


    return Zone;

});