angular.module('main')
.controller('CategoryCtrl', function ($scope, $mdDialog, $translate, Category, Toast, Auth) {

    $scope.rowOptions = [5, 10, 25];
    $scope.categories = [];

    $scope.query = {
        canonical: '',
        limit: 5,
        page: 1,
        total: 0,
        isFeatured: false
    };

    $scope.onRefreshTable = function () {
        Auth.ensureLoggedIn().then(function () {
            $scope.promise = Category.all($scope.query)
                .then(function (categories) {
                    $scope.categories = categories; 
                    $scope.$apply();  
                });
        });
    };

    $scope.onCountTable = function () {
        Auth.ensureLoggedIn().then(function () {
            $scope.promise = Category.count($scope.query)
                .then(function (total) {
                    $scope.query.total = total;
                    $scope.$apply();
                });
        });
    };

    $scope.onRefreshTable();
    $scope.onCountTable();

    $scope.onRefresh = function () {
        $scope.onRefreshTable();
        $scope.onCountTable();
    };

    $scope.onPaginationChange = function (page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        $scope.onRefreshTable();
    };

    $scope.onReorder = function (field) {

        var indexOf = field.indexOf('-');
        var field1 = indexOf === -1 ? field : field.slice(1, field.length);
        $scope.query.orderBy = indexOf === -1 ? 'asc' : 'desc';
        $scope.query.orderByField = field1;
        $scope.onRefreshTable();
    };

    $scope.onChangeStatus = function (obj, status) {
        obj.status = status;
        Category.save(obj).then(function () {
            $translate('SAVED').then(function(str) {
                Toast.show(str);
            });
            $scope.onRefreshTable();
            $scope.onCountTable();
        });

    };

    $scope.onEdit = function (event, obj) {

        $mdDialog.show({
            controller: 'DialogCategoryController',
            scope: $scope.$new(),
            templateUrl: '/views/partials/category.html',
            parent: angular.element(document.body),
            locals: {
                obj: obj || null
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

                Category.delete(obj).then(function () {
                    $translate('DELETED').then(function(str) {
                        Toast.show(str);
                    });
                    $scope.onRefreshTable();
                    $scope.onCountTable();
                }, function (error) {
                    Toast.show(error.message)
                });
            });
        });
    }

}).controller('DialogCategoryController', function (Category, File, $scope, $translate, $mdDialog, Toast, obj) {

    $scope.obj = obj || Category.new();

    $scope.onClose = function () {
        if ($scope.obj.dirty()) $scope.obj.revert();
        $mdDialog.cancel();
    };

    $scope.uploadImage = function (file) {

        if (file) {

            $scope.isUploading = true;

            File.upload(file).then(function (savedFile) {
                $scope.obj.image = savedFile;
                $scope.isUploading = false;
                $translate('FILE_UPLOADED').then(function(str) {
                    Toast.show(str);
                });
                $scope.$apply();
            }, function (error) {
                Toast.show(error.message);
                $scope.isUploading = false;
                $scope.$apply();
            });
        }
    }

    $scope.onSubmit = function (isFormValid) {

        if (!isFormValid) {
            return $translate('FILL_FIELDS').then(function(str) {
                Toast.show(str);
            });
        }

        $scope.isSaving = true;

        Category.save($scope.obj).then(function () {
            $scope.isSaving = false;
            $mdDialog.hide($scope.obj);
            $translate('SAVED').then(function(str) {
                Toast.show(str);
            });
            $scope.$apply();
        }, function (error) {
            $scope.isSaving = false;
            Toast.show(error.message);
            $scope.$apply();
        });
    };

});