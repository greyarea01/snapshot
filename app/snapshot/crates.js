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
                })
                .when('/crates/:iov', {
                    templateUrl: 'app/snapshot/snapshot.html',
                    controller: 'CratesCtrl'
                })
                .when('/crates/:iov/:crate', {
                    templateUrl: 'app/snapshot/snapshot.html',
                    controller: 'CratesCtrl'
                })
                .when('/crates/:iov/:crate/:rod', {
                    templateUrl: 'app/snapshot/snapshot.html',
                    controller: 'CratesCtrl'
                })
                .when('/crates/:iov/:crate/:rod/:mur', {
                    templateUrl: 'app/snapshot/snapshot.html',
                    controller: 'CratesCtrl'
                })
                .when('/crates/:iov/:crate/:rod/:mur/:mod', {
                    templateUrl: 'app/snapshot/snapshot.html',
                    controller: 'CratesCtrl'
                })
                .when('/crates/:iov/:crate/:rod/:mur/:mod/:chip', {
                    templateUrl: 'app/snapshot/snapshot.html',
                    controller: 'CratesCtrl'
                })
                .otherwise({redirectTo:'/crates'})

        }])
    .controller('CratesCtrl', ['$scope', '$location','$routeParams','CratesData','CratesDataStore','CrateModel',
        function ($scope, $location, $routeParams, CratesData, CratesDataStore,CrateModel) {

            // convert the $rootParams into an index for the data
            // set index to initial values
            $scope.dataIndex= {
                iov: null,
                crate: null,
                rod: null,
                mur: null,
                mod: null,
                chip: null
            };
            $scope.loaded=false;
            // now parse the URL to fill the index as appropriate
            // loop over the properties and stop after the first one that is undefined
            var propertyList=['crate','rod','mur','mod','chip'];
            var n = propertyList.length;

            if (! $routeParams.iov) {
                $scope.dataIndex.iov='now';
                $scope.dataIndex.crate='all';
              //  $location.path='/crates/now/all';
            } else {
                $scope.iov=$routeParams.iov;
                $scope.dataIndex.iov=$routeParams.iov;
            }
            var finished = false
            var i=0;
            var field;
            while( !finished) {
                field=propertyList[i];
                    if( ! $routeParams[field]) {
                        $scope.dataIndex[field] = 'all';
                        finished=true;
                    } else {
                        $scope.dataIndex[field] = $routeParams[field]
                        i++;
                    }
                if( i === n) {
                    finished = true;
                }
            }

    // for saving snapshots
            $scope.dataStores=CratesDataStore;
    // the currently model
            $scope.model = CrateModel;
    // interface for updating the current model
            $scope.data = CratesData;
    // model list used for the view - enables use of ng-repeat to generate a table for each level
            // of the nested model
            $scope.modelList=[];
    // a descriptor in the view for debugging
            $scope.descriptor = '';

          //  $scope.thisModel = null;
          //  $scope.setThisModel = function(model) {
          //      console.log('setthisModel :'+model.name);
          //      $scope.thisModel = model;
          //  };

            // functions for buttons
            $scope.storeSnapshot = function() {
                if(!$scope.loaded) {
                    return;
                }
                // append current data store plus a label to dataStores array
    // FIXME - move this over to dataStore and give it an "add" method?
                var obj = {
                    label: "S"+$scope.dataStores.length,
                    iov: $scope.iov,
                    model: $scope.model.crateModel.copy()
                };
                console.log('Snapshot stored:' + ($scope.model.descriptor()).str);
                $scope.dataStores.push(obj);
            };

            $scope.diff = function() {
                if(!$scope.loaded) {
                    return;
                }
                console.log('compare clicked');
                $location.path('/diff');
            };

            $scope.viewStore = function() {
                if(!$scope.loaded) {
                    return;
                }
                console.log('view clicked');
                $location.path('/store');
            };

    // click handler
            // index = column in the row that was clicked
            // values = values in the row
            // model = model providing the data for the table that was clicked
            // the model knows which column is used to index the row
            // and which column is used to generate the URL
            $scope.click = function(index, values, model) {
                if (!$scope.loaded) {
                    console.log("clicked before loading finished");
                    return;
                }
//                console.log('Model List is: '+JSON.stringify($scope.modelList));
                console.log('click: ' + index + ' ' + values[model.rowIndex] + ' ' + values[index] + ' ' + model.name);
// select or deselect now involve a URL change...
                model.selectElement(values);
                //var index = model.getIndex();
                var url = $scope.model.getURL();
                // this should cause a reload
                $location.path(url);
            }

            $scope.dropdownClick = function() {
                console.log("clicked!");
            }

            $scope.load = function(index) {
                $scope.loaded = false;
                $scope.data.getModelByIndex(index).then(function(){
                $scope.descriptor=$scope.model.descriptor;
                $scope.modelList = $scope.model.getList();
                $scope.crateIndices=$scope.model.crateModel.getIndices();
                $scope.rodIndices=$scope.model.rodModel.getIndices();
                $scope.murIndices=$scope.model.murModel.getIndices();
                $scope.modIndices=$scope.model.modModel.getIndices();
                $scope.chipIndices=$scope.model.chipModel.getIndices();
                // partial implementation for testing
                $scope.crateSelection = $scope.model.crateModel.selectedURLElement>=0 ? $scope.model.crateModel.selectedURLElement : ""
                    $scope.rodSelection = $scope.model.rodModel.selectedURLElement>=0 ? $scope.model.rodModel.selectedURLElement : ""
                    $scope.murSelection = $scope.model.murModel.selectedURLElement>=0 ? $scope.model.murModel.selectedURLElement : ""
                    $scope.modSelection = $scope.model.modModel.selectedURLElement>=0 ? $scope.model.modModel.selectedURLElement : ""
                    $scope.chipSelection = $scope.model.chipModel.selectedURLElement>=0 ? $scope.model.chipModel.selectedURLElement : ""

                $scope.loaded = true;
                });
            }

            $scope.load($scope.dataIndex);

        }]);