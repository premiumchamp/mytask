angular.module('main')
.controller('ItemCtrl', function ($scope, $mdDialog, $translate, Item, Toast, Auth) {

    $scope.rowOptions = [5, 10, 25];
    $scope.items = [];
    $scope.query = {
        canonical: '',
        limit: 5,
        page: 1,
        total: 0,
    };

    $scope.onRefreshTable = function () {
        Auth.ensureLoggedIn().then(function () {
            $scope.promise = Item.all($scope.query).then(function (items) {
                $scope.items = items;
                $scope.$apply();
            });
        });
    };

    $scope.onCountTable = function () {
        Auth.ensureLoggedIn().then(function () {
            $scope.promise = Item.count($scope.query).then(function (total) {
                $scope.query.total = total;
                $scope.$apply();
            });
        });
    };

    $scope.onRefreshTable();
    $scope.onCountTable();

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
            controller: 'DialogItemController',
            scope: $scope.$new(),
            templateUrl: '/views/partials/item.html',
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

    $scope.onChangeStatus = function (item, status) {
        item.status = status;
        Item.save(item).then(function () {
            $translate('SAVED').then(function(str) {
                Toast.show(str);
            });
            $scope.onRefreshTable();
            $scope.onCountTable();
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

                Item.delete(obj).then(function () {
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

}).controller('DialogItemController', function ($scope, $mdDialog, $translate, Item, Category, SubCategory, File, Toast, obj) {

    $scope.obj = obj || Item.new();
    $scope.images = $scope.obj.images.map(function (image) {
        return {
            isUploading: false,
            file: image
        }
    })

    Category.all({
        orderBy: 'asc',
        orderByField: 'name'
    }).then(function (categories) {
        $scope.categories = categories;
        $scope.$apply();
    });

    function loadSubCategories () {
        SubCategory.all({
            category: $scope.obj.category,
            orderBy: 'asc',
            orderByField: 'name'
        })
        .then(function (subcategories) {
            $scope.subcategories = subcategories;
            $scope.$apply();
        });
    }

    $scope.onCategoryChanged = function () {
        loadSubCategories();
    }

    $scope.onClose = function () {
        if ($scope.obj.dirty()) $scope.obj.revert();
        $mdDialog.cancel();
    };

    $scope.onDeleteImage = function (image) {
        var index = $scope.images.indexOf(image);
        if (index !== -1) {
            $scope.images.splice(index, 1);
        }
    }

    $scope.onImageClicked = function (file) {
        var viewer = ImageViewer();
        viewer.show(file.url());
    }

    $scope.onUploadImage = function (file) {

        if (file) {

            var index = $scope.images.push({
                isUploading: true,
                file: null
            }) - 1;

            $scope.images[index].isUploading = true;

            File.upload(file).then(function (savedFile) {

                $scope.images[index].file = savedFile;
                $scope.images[index].isUploading = false;
                $scope.$apply();

            }, function (error) {
                Toast.show(error.message);
                $scope.images[index].isUploading = false;
                $scope.$apply();
            });
        }
    };

    $scope.onUploadFeaturedImage = function (file) {

        if (file) {

            $scope.isUploading = true;

            File.upload(file).then(function (savedFile) {
                $scope.obj.featuredImage = savedFile;
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
    };

    $scope.onSubmit = function () {

        $scope.isSaving = true;

        $scope.obj.images = $scope.images.map(function (image) {
            if (image.file) {
                return image.file;
            }
        });

        Item.save($scope.obj).then(function (obj) {
            $scope.isSaving = false;
            $mdDialog.hide(obj);
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