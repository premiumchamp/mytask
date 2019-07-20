angular.module('main')
    .controller('SlideImageCtrl', function (SliderImage, $scope, $mdDialog, $translate, Toast, Auth) {

        $scope.slides = [];
        $scope.query = {};

        $scope.onRefreshTable = function () {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = SliderImage.all($scope.query).then(function (slides) {
                    $scope.slides = slides;
                    $scope.$apply();
                });

            });
        };

        $scope.onRefreshTable();

        $scope.onReorder = function (field) {
            var indexOf = field.indexOf('-');
            var field1 = indexOf === -1 ? field : field.slice(1, field.length);
            $scope.query.orderBy = indexOf === -1 ? 'asc' : 'desc';
            $scope.query.orderByField = field1;
            $scope.onRefreshTable();
        };

        $scope.onReload = function () {
            $scope.query.page = 1;
            $scope.onRefreshTable();
        };

        $scope.onEdit = function (event, obj) {
            $mdDialog.show({
                    controller: 'DialogSliderController',
                    scope: $scope.$new(),
                    templateUrl: '/views/partials/slide-image.html',
                    parent: angular.element(document.body),
                    locals: {
                        obj: obj
                    },
                    clickOutsideToClose: false

                })
                .then(function (response) {
                    
                    if (response) {
                        $scope.onRefreshTable();
                    }
                });
        };

        $scope.onDelete = function (ev, obj) {

            $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED']).then(function (str) {

                var confirm = $mdDialog.confirm()
                .title(str.DELETE)
                .textContent(str.CONFIRM_DELETE)
                .ariaLabel(str.DELETE)
                .ok(str.CONFIRM)
                .cancel(str.CANCEL);

                $mdDialog.show(confirm).then(function () {

                    SliderImage.delete(obj).then(function () {
                        
                        $translate('DELETED').then(function (str) {
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

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

    }).controller('DialogSliderController', function (SliderImage, Item, File, $scope, $translate, $mdDialog, Toast, obj) {

        $scope.obj = obj || new SliderImage;

        $scope.onTypeChanged = function () {
            if ($scope.obj.type === 'url') {
                $scope.obj.item = null;
            } else if ($scope.obj.type === 'item') {
                $scope.obj.url = null;
            }
        }

        $scope.queryItems = function (query) {
            var query = query || '';
            return Item.all({ canonical: query.toLowerCase() }).then(function (items) {
                return items;
            });
        }

        $scope.onClose = function () {
            $mdDialog.cancel();
        };

        $scope.uploadImage = function (file) {

            if (file) {
           
                $scope.isUploading = true;

                File.upload(file).then(function (savedFile) {
                    $scope.obj.image = savedFile;
                    $scope.isUploading = false;

                    $translate('FILE_UPLOADED').then(function (str) {
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

        $scope.onSubmit = function () {

            $scope.isSaving = true;

            SliderImage.save($scope.obj).then(function () {
                $scope.isSaving = false;
                $mdDialog.hide($scope.obj);

                $translate('SAVED').then(function (str) {
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