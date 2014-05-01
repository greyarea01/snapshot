/**
 * Created by hays on 02/04/14.
 */

angular.module('snapshot-crates', [])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/crates', {
                    templateUrl: 'app/snapshot/snapshot.html',
                    controller: 'CratesCtrl'
                });
        }])
    .controller('CratesCtrl', ['$scope', '$http', '$location','CratesDataStore',
        function ($scope, $http, $location, CratesDataStore) {

            $scope.dataStores=CratesDataStore;


            $scope.chipModel = configModel("chip");
            $scope.modModel = configModel("mod", $scope.chipModel);
            $scope.murModel = configModel("mur", $scope.modModel);
            $scope.rodModel = configModel("rod", $scope.murModel);
            $scope.crateModel = configModel("crate", $scope.rodModel);
            console.log('Testing testing 1 2 3 : '+JSON.stringify($scope.crateModel));

            $scope.iov = 'now';
            $scope.diff = function() {
                console.log('compare clicked');
                $location.path('/diff');
            }
            $scope.storeSnapshot = function() {
                // append current data store plus a label to dataStores array
                var obj = {
                    label: "hello",
                    model: $scope.crateModel.copy()
                };
                $scope.dataStores.push(obj);
            };

            $scope.buildAPIURL = function (topModel, iov) {
                var url = 'api/crates/' + iov + '/';
                var model = topModel;
                var finished = false;
                while (!finished) {
                    if (model.selectedElement >= 0) {
                        url += model.selectedURLElement + '/';
                        model = model.child;
                        if (model === null) {
                            finished = true;
                        }
                    } else {
                        url += 'all';
                        finished = true;
                    }

                }
                return url;

            };

            $scope.buildURL = function (topModel, iov) {
                var url = '/crates/' + iov + '/';
                var model = topModel;
                var finished = false;
                while (!finished) {
                    if (model.selected >= 0) {
                        url += model.urlelement + '/';
                        model = model.child;
                        if (model === null) {
                            finished = true;
                        }
                    } else {
                        url += 'all';
                        finished = true;
                    }

                }
                return url;

            };


            var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
            var url = $scope.buildURL($scope.crateModel, $scope.iov);

            $http.get(apiurl)
                .success(function (data, status, headers, config) {
                    console.log('CratesCtrl:' + JSON.stringify(data));
                    $scope.crateModel.resetModel(true);
                    $scope.crateModel.data = data;
                    //$location.path = url;
                    console.log(JSON.stringify($scope.crateModel));

                });
// click handlers - there are two - one for modules and one for everything else FIXME!
            $scope.modClick = function (box, index, module, moduleID, model) {
                console.log(index + ' ' + module + ' ' + moduleID);

                if (index == 1 || index == 2) {
                    var previousElement = model.lastSelected;
                    if (model.selectElement(box, module, moduleID)) {
                        box.selected = 'bg-info';
                        var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
                        var url = $scope.buildURL($scope.crateModel, $scope.iov);
                        console.log(apiurl);
                        console.log(url);
                        $http.get(apiurl).success(function (data, status, headers, config) {
                            model.child.resetModel(true);
                            console.log(JSON.stringify(data));
                            model.child.data = data;
                            //$location.path = url;
                        });

                    } else {
                        if (previousElement) {
                            previousElement.selected = '';
                            return;
                        }
                    }

                }
            };

            $scope.click = function (element, row, model) {
                if (model.child === null) {
                    console.log('No children. Just return');
                    return;
                }
                var previousSelection = model.lastSelected;
                console.log('click: ' + model.name);
                if (model.selectElement(row, element, element)) {
                    // only one row can be selected
                    // so if there was a previous row selected
                    // set its "selected" field to ''
                    // then it won't be highlighted anymore
                    if (previousSelection) {
                        previousSelection.selected = '';
                    }
                    row.selected = 'bg-info';
                    var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
                    var url = $scope.buildURL($scope.crateModel, $scope.iov);
                    console.log(url);
                    console.log(apiurl);
                    $http.get(apiurl).success(function (data, status, headers, config) {
                        model.child.resetModel(true);
                        model.child.data = data;
                        model.child.selected = -1;
                        model.child.urlelement = -1;
                        model.child.lastSelected = null;
                        //$location.path = url;
                    });

                } else {
                    row.selected = '';
                }
                return;
            };

        }]);