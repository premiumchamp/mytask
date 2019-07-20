angular.module('main').factory('Order', function () {

    var Order = Parse.Object.extend('Order', {

        isUnpaid: function () {
            return this.status === 'Unpaid';
        },

        isPaid: function () {
            return this.status === 'Paid';
        },

        isPacked: function () {
            return this.status === 'Packed';
        },

        isShippedOut: function () {
            return this.status === 'Shipped Out';
        },

        isCancelled: function () {
            return this.status === 'Cancelled';
        }

    }, {

        new() {
            return new Order();
        },

        all: function (params) {

            var query = new Parse.Query(this);

            if (params && params.number) {
                query.equalTo('number', Number(params.number));
            }

            if (params && params.start) {
                var start = moment(params.start).startOf('day');
                query.greaterThanOrEqualTo('createdAt', start.toDate());
            }

            if (params && params.end) {
                var end = moment(params.end).endOf('day');
                query.lessThanOrEqualTo('createdAt', end.toDate());
            }

            if (params && params.limit && params.page) {
                query.limit(params.limit);
                query.skip((params.page * params.limit) - params.limit);
            }

            if (params && params.orderBy == 'asc') {
                query.ascending(params.orderByField);
            } else if (params && params.orderBy == 'desc') {
                query.descending(params.orderByField);
            } else {
                query.descending('createdAt');
            }

            query.include('customer');

            query.doesNotExist('deletedAt');

            return query.find();

        },

        count: function (params) {

            var query = new Parse.Query(this);

            if (params && params.number) {
                query.equalTo('number', Number(params.number));
            }

            if (params && params.start) {
                var start = moment(params.start).startOf('day');
                query.greaterThanOrEqualTo('createdAt', start.toDate());
            }

            if (params && params.end) {
                var end = moment(params.end).endOf('day');
                query.lessThanOrEqualTo('createdAt', end.toDate());
            }

            if (params && params.isMarkedAsSeen === false) {
                query.notEqualTo('views', Parse.User.current());
            }

            return query.count();

        },

        save: function (obj) {
            return obj.save();
        },

        delete: function (obj) {
            obj.deletedAt = new Date;
            return obj.save();
        },

        markAllAsSeen: function () {
            return Parse.Cloud.run('markOrdersAsSeen');
        }

    });

    Object.defineProperty(Order.prototype, 'number', {
        get: function () {
            return this.get('number');
        },
        set: function (val) {
            this.set('number', val);
        }
    });

    Object.defineProperty(Order.prototype, 'items', {
        get: function () {
            return this.get('items');
        },
        set: function (val) {
            this.set('items', val);
        }
    });

    Object.defineProperty(Order.prototype, 'subtotal', {
        get: function () {
            return this.get('subtotal');
        },
        set: function (val) {
            this.set('subtotal', val);
        }
    });

    Object.defineProperty(Order.prototype, 'total', {
        get: function () {
            return this.get('total');
        },
        set: function (val) {
            this.set('total', val);
        }
    });

    Object.defineProperty(Order.prototype, 'payment', {
        get: function () {
            return this.get('payment');
        },
        set: function (val) {
            this.set('payment', val);
        }
    });

    Object.defineProperty(Order.prototype, 'shipping', {
        get: function () {
            return this.get('shipping');
        },
        set: function (val) {
            this.set('shipping', val);
        }
    });

    Object.defineProperty(Order.prototype, 'customer', {
        get: function () {
            return this.get('customer');
        },
        set: function (val) {
            this.set('customer', val);
        }
    });

    Object.defineProperty(Order.prototype, 'contactNumber', {
        get: function () {
            return this.get('contactNumber');
        },
        set: function (val) {
            this.set('contactNumber', val);
        }
    });

    Object.defineProperty(Order.prototype, 'paymentMethod', {
        get: function () {
            return this.get('paymentMethod');
        },
        set: function (val) {
            this.set('paymentMethod', val);
        }
    });

    Object.defineProperty(Order.prototype, 'status', {
        get: function () {
            return this.get('status');
        },
        set: function (val) {
            this.set('status', val);
        }
    });

    Object.defineProperty(Order.prototype, 'card', {
        get: function () {
            return this.get('card');
        },
        set: function (val) {
            this.set('card', val);
        }
    });

    Object.defineProperty(Order.prototype, 'charge', {
        get: function () {
            return this.get('charge');
        },
        set: function (val) {
            this.set('charge', val);
        }
    });

    Object.defineProperty(Order.prototype, 'deletedAt', {
        get: function () {
            return this.get('deletedAt');
        },
        set: function (val) {
            this.set('deletedAt', val);
        }
    });

    return Order;

});