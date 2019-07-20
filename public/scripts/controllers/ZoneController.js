angular.module('main').controller('ZoneCtrl',
    function (Zone, $scope, $mdDialog, $translate, Toast, Auth) {

        $scope.rowOptions = [5, 10, 25];
        $scope.zones = [];
        $scope.query = {
            canonical: '',
            limit: 5,
            page: 1,
            total: 0,
            onlyParent: false,
        };

        $scope.onRefreshTable = function () {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Zone.all($scope.query).then(function (zones) {
                    $scope.zones = zones;
                    $scope.$apply();
                });
            });
        };

        $scope.onCountTable = function () {

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Zone.count($scope.query).then(function (total) {
                    $scope.query.total = total;
                    $scope.$apply();
                });

            });
        };

        $scope.onRefreshTable();
        $scope.onCountTable();

        Zone.all({ orderBy: 'asc', orderByField: 'name', parent: false })
        .then(function (zones) {
            $scope.parentZones = zones;
        });

        $scope.onReload = function () {
            $scope.query.page = 1;
            $scope.onRefreshTable();
            $scope.onCountTable();
        };

        $scope.onReorder = function (field) {

            var indexOf = field.indexOf('-');
            var field1 = indexOf === -1 ? field : field.slice(1, field.length);
            $scope.query.orderBy = indexOf === -1 ? 'asc' : 'desc';
            $scope.query.orderByField = field1;
            $scope.onRefreshTable();
        };

        $scope.onPaginationChange = function (page, limit) {
            $scope.query.page = page;
            $scope.query.limit = limit;
            $scope.onRefreshTable();
        };

        $scope.onEdit = function (event, obj) {
            $mdDialog.show({
                controller: 'DialogZoneController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/zone.html',
                parent: angular.element(document.body),
                locals: {
                    obj: angular.copy(obj)
                },
                clickOutsideToClose: false

            }).then(function (response) {
                if (response) {
                    $scope.onRefreshTable();
                    $scope.onCountTable();
                }
            });
        };

        $scope.onDelete = function (event, obj) {

            $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED'])
            .then(function(str) {
        
                var confirm = $mdDialog.confirm()
                  .title(str.DELETE)
                  .textContent(str.CONFIRM_DELETE)
                  .ariaLabel(str.DELETE)
                  .ok(str.CONFIRM)
                  .cancel(str.CANCEL);

                $mdDialog.show(confirm).then(function () {

                    Zone.delete(obj).then(function () {
                        $translate('DELETED').then(function(str) {
                            Toast.show(str);
                        });
                        $scope.onRefreshTable();
                        $scope.onCountTable();
                    });
                });
            });
        }

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };


    }).controller('DialogZoneController', function ($scope, $mdDialog, $translate, Zone, Toast, obj) {

    $scope.obj = obj || Zone.new();

    Zone.all({
        parent: false,
        orderBy: 'asc',
        orderByField: 'name'
    }).then(function (zones) {
        $scope.zones = zones;
        $scope.$apply();
    });

    $scope.onCancel = function () {
        if ($scope.obj.dirty()) $scope.obj.revert();
        $mdDialog.cancel();
    };

    $scope.onTypeSelected = function (type) {
        if (type === 'Parent') $scope.obj.unset('parent');
    };

    $scope.onSubmit = function () {

        $scope.isSaving = true;

        Zone.save($scope.obj).then(function (obj) {
            $scope.isSaving = false;
            $mdDialog.hide(obj);
            $scope.$apply();
            $translate('SAVED').then(function(str) {
                Toast.show(str);
            });
        }, function (error) {
            $scope.isSaving = false;
            $scope.$apply();
        });

    };

})