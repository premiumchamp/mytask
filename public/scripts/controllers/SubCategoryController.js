angular.module('main')
    .controller('SubCategoryCtrl', function ($scope, $mdDialog, $translate, Toast, Category, SubCategory, Auth) {

        $scope.rowOptions = [5, 10, 25];
        $scope.subcategories = [];

        $scope.query = {
            canonical: '',
            limit: 5,
            page: 1,
            total: 0,
        };

        $scope.onRefreshTable = function () {

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = SubCategory.all($scope.query).then(function (subcategories) {
                    $scope.subcategories = subcategories;
                    $scope.$apply();
                });

            });
        };

        $scope.onCountTable = function () {

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = SubCategory.count($scope.query).then(function (total) {
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

        Category.all({ orderBy: 'asc', orderByField: 'name' })
        .then(function (categories) {
            $scope.categories = categories;
        });

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
            SubCategory.save(obj).then(function (data) {
                $translate('SAVED').then(function(str) {
                    Toast.show(str);
                });
                $scope.onRefreshTable();
                $scope.onCountTable();
            });

        };

        $scope.onEdit = function (event, obj) {

            $mdDialog.show({
                controller: 'DialogSubCategoryController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/subcategory.html',
                parent: angular.element(document.body),
                locals: {
                    obj: obj || null
                },
                clickOutsideToClose: false

            })
            .then(function (response) {
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

                    SubCategory.delete(obj).then(function () {
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

    }).controller('DialogSubCategoryController', function (SubCategory, Category, File, $scope, $translate, $mdDialog,
        Toast, obj) {

        $scope.obj = obj || SubCategory.new();
        $scope.categories = [];

        $scope.onCancel = function () {
            if ($scope.obj.dirty()) $scope.obj.revert();
            $mdDialog.cancel();
        };

        Category.all({
            orderBy: 'asc',
            orderByField: 'name'
        }).then(function (categories) {
            $scope.categories = categories;
            $scope.$apply();
        });

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

            SubCategory.save($scope.obj).then(function () {
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