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
    .controller('CratesCtrl', ['$scope', '$location','CratesAPI','CratesDataStore','CrateModel',
        function ($scope, $location, CratesAPI, CratesDataStore,CrateModel) {

            $scope.dataStores=CratesDataStore;
            $scope.model = CrateModel;
            $scope.iov = 'now';
            $scope.modelList = $scope.model.getList();
            $scope.descriptor = '';

    // needed for nested ng-repeats to pass the current model down to the nested bits
            $scope.thisModel = null;
            $scope.setThisModel = function(model) {
                console.log('setthisModel :'+model.name);
                $scope.thisModel = model;
            };

            // functions for buttons
            $scope.storeSnapshot = function() {
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
                console.log('compare clicked');
                $location.path('/diff');
            };

            $scope.viewStore = function() {
                console.log('view clicked');
                $location.path('/store');
            };
            //var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
            //var url = $scope.buildURL($scope.crateModel, $scope.iov);
            var apiurl = $scope.model.getAPIURL($scope.iov);


            CratesAPI.getByURL(apiurl).then( function(data) {
                $scope.model.crateModel.resetModel(true);
                $scope.model.crateModel.data = data.data;
                console.log('Grabbed data from: '+apiurl);
                console.log('Setting CratesAPI data = '+JSON.stringify(data.data));
                $scope.descriptor = $scope.model.descriptor();
            });

    // click handler
            $scope.click = function(index, values, model) {
                console.log(JSON.stringify($scope.modelList));
                console.log('click: '+index+' '+values[model.rowIndex]+' '+values[index]+' '+model.name);

                // was it a select or a deselect
                if(model.selectElement(index,values)) {
                    console.log('Select operation');
                    // a select operation - lets grab some new data
                    // if there is a child to give the data to...
                    if( model.child) {
                        var apiurl = $scope.model.getAPIURL($scope.iov);
    //   var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
                        // this will eventually be used with $location
                        //var url = $scope.buildURL($scope.crateModel, $scope.iov);
                        console.log(apiurl);
                        //console.log(url);
                        CratesAPI.getByURL(apiurl).then(function (data) {
                            model.child.resetModel(true);
                            console.log(JSON.stringify(data));
                            model.child.data = data.data;
                            $scope.descriptor = $scope.model.descriptor();
                            //$location.path = url;
                        });
                    } else {
                        $scope.descriptor = $scope.model.descriptor();
                    }
                } else {
                    console.log('Deselect operation');
                  // was a deselect - nothing to do at the moment
                }

            };


        }]);