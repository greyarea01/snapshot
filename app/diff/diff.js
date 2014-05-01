/**
 * Created by hays on 01/05/14.
 */
angular.module('snapshot-diff', [])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/diff', {
                    templateUrl: 'app/diff/diff.html',
                    controller: 'DiffCtrl'
                });
        }])
    .controller('DiffCtrl', ['$scope','CratesDataStore',
        function ($scope,CratesDataStore) {
            $scope.dataStores = CratesDataStore;
            console.log('Initialising the diff controller');
            $scope.diffModel = {
                headers: [],
                rows: []
            };

            $scope.getLargestHeaders = function (dataStore) {
                var largestHeaders = [];
                var store;
                var headers;
                var model;
                var data;
                var header;
                var nMatched;
                var index;
                var element;

                for (store in dataStore) {
                    console.log('Processing '+store.label+' '+store.model.selectedElement);
                    headers = [];
                    model = store.model;
                    while (model && model.selectedElement>=0) {
                        nMatched = 0;
                        index = model.selectedElementIndex;
                        element = model.selectedElement;
                        data = store.model.data;
                        for (header in data.headers) {
                            headers.push(header);
                        }
                        model = model.child;
                        if (model) {
                            if (model.selectedElement < 0) {
                                model = null; // stop if there is a model but no element was selected
                            }
                        }
                    }
                    if (headers.length > largestHeaders.length) {
                        largestHeaders = headers;
                    }

                }
                return largestHeaders;
            };

            $scope.getColumns = function(size,dataStore) {
                var columns = [];
                var values;
                var counter;
                var model = {};
                var index = 0;
                var element = 0;
                var data = {};
                var matched = 0;
                var row;
                var store;
                var missing = 0;
                for(store in dataStore) {
                    values = [];
                    counter =0;
                    model = store.model;
                    while(model && model.selectedElement>=0) {
                        index = model.selectedElementIndex;
                        element = model.selectedElement;
                        data = model.data;
                        for(row in model.rows) {
                            if(row.values[index]===element) {
                                for( var value in row.values) {
                                    values.push(value);
                                    counter = counter + 1;
                                }
                            }
                        }
                    }
                    missing = size-counter;
                    for( var i =0; i<missing;++i) {
                        values.push(' - ');
                    }
                    columns.pop(angular.copy(values));
                }
                return columns;
            }

            $scope.diffModel.headers = $scope.getLargestHeaders($scope.dataStores);
            $scope.diffModel.columns = $scope.getColumns($scope.diffModel.headers.length,$scope.dataStores);

            console.log(JSON.stringify($scope.diffModel.headers));
            console.log(JSON.stringify($scope.diffModel.columns));
        }

    ]);