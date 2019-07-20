angular.module('main')
    .controller('OrderCtrl', function (Order, $scope, $mdDialog, $translate, Toast, Auth) {

        $scope.rowOptions = [5, 10, 25];
        $scope.orders = [];
        $scope.total = 0;

        $scope.query = {
            number: '',
            status: '',
            start: null,
            end: null,
            limit: 5,
            page: 1,
            total: 0,
        };

        $scope.onRefreshTable = function () {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Order.all($scope.query).then(function (orders) {
                    $scope.orders = orders;
                    $scope.calculateTotals();
                    Order.markAllAsSeen();
                    $scope.$apply();
                });
            });
        };

        $scope.onCountTable = function () {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Order.count($scope.query).then(function (total) {
                    $scope.query.total = total;
                    $scope.$apply();
                });
            });
        };

        $scope.onRefreshTable();
        $scope.onCountTable();

        $scope.onReorder = function (field) {
            var indexOf = field.indexOf('-');
            var field1 = indexOf === -1 ? field : field.slice(1, field.length);
            $scope.query.orderBy = indexOf === -1 ? 'asc' : 'desc';
            $scope.query.orderByField = field1;
            $scope.onRefreshTable();
        };

        $scope.calculateTotals = function () {
            $scope.total = 0;
            angular.forEach($scope.orders, function (order) {
                $scope.total += order.total;
            });
        }

        $scope.onReload = function () {
            $scope.query.page = 1;
            $scope.onRefreshTable();
            $scope.onCountTable();
        };

        $scope.onPaginationChange = function (page, limit) {
            $scope.query.page = page;
            $scope.query.limit = limit;
            $scope.onRefreshTable();
        };

        $scope.onView = function (event, order) {

            $mdDialog.show({
                controller: 'DialogOrderViewController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/order.html',
                parent: angular.element(document.body),
                locals: {
                    order: order
                },
                clickOutsideToClose: false

            }).then(function (response) {
                if (response) {
                    $scope.onRefreshTable();
                    $scope.onCountTable();
                }
            });;
        };

        $scope.onChangeStatus = function (order) {

            Order.save(order).then(function () {
                $translate('SAVED').then(function(str) {
                    Toast.show(str);
                });
                $scope.onRefreshTable();
                $scope.onCountTable();
            }, function (error) {
                Toast.show(error.message);
            });
        };

        $scope.onDelete = function (event, order) {

            $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED'])
            .then(function(str) {
        
                var confirm = $mdDialog.confirm()
                    .title(str.DELETE)
                    .textContent(str.CONFIRM_DELETE)
                    .ariaLabel(str.DELETE)
                    .ok(str.CONFIRM)
                    .cancel(str.CANCEL);
                $mdDialog.show(confirm).then(function () {

                    Order.delete(order).then(function () {
                        $translate('DELETED').then(function(str) {
                            Toast.show(str);
                        });
                        $scope.onRefreshTable();
                        $scope.onCountTable();
                    }, function (error) {
                        Toast.show(error.message);
                    });
                });
            });
        };

    }).controller('DialogOrderViewController', function ($scope, $mdDialog, order) {

        $scope.order = order;

        $scope.onCancel = function () {
            $mdDialog.cancel();
        };

        $scope.formatBrand = function () {

            if ($scope.order.card) {
              return $scope.order.card.brand.toLowerCase().replace(' ', '_')
            }
        
            return '';
            
          }

        $scope.onChargeClicked = function () {
            window.open('https://dashboard.stripe.com/payments/' + $scope.order.charge.id, '_blank');
        };

    });