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
    .controller('CratesCtrl', ['$scope', '$location','CratesAPI','CratesDataStore',
        function ($scope, $location, CratesAPI, CratesDataStore) {

            $scope.dataStores=CratesDataStore;


            $scope.chipModel = configModel("chip");
            $scope.modModel = configModel("mod", $scope.chipModel);
            $scope.murModel = configModel("mur", $scope.modModel);
            $scope.rodModel = configModel("rod", $scope.murModel);
            $scope.crateModel = configModel("crate", $scope.rodModel);

            $scope.crateModel.rowIndex = 0;
            $scope.rodModel.rowIndex=1;
            $scope.murModel.rowIndex=2;
            $scope.modModel.rowIndex=0;
            $scope.modModel.elementIndices = [1,2];
            $scope.chipModel.rowIndex=0;

            $scope.modelList = [
                $scope.crateModel,
                $scope.rodModel,
                $scope.murModel,
                $scope.modModel,
                $scope.chipModel
            ];

            var size = $scope.modelList.length;
            for( var i = 0;i<size;++i) {
                console.log($scope.modelList[i].name);
            }

            $scope.iov = 'now';
            $scope.diff = function() {
                console.log('compare clicked');
                $location.path('/diff');
            };
    // needed for nested ng-repeats to pass the current model down to the nested bits
            $scope.thisModel = null;
            $scope.setThisModel = function(model) {
                console.log('setthisModel :'+model.name);
                $scope.thisModel = model;
            };
            $scope.storeSnapshot = function() {
                // append current data store plus a label to dataStores array
    // FIXME - move this over to dataStore and give it an "add" method
                var obj = {
                    label: "S"+$scope.dataStores.length,
                    iov: $scope.iov,
                    model: $scope.crateModel.copy()
                };
                console.log('Snapshot stored:' + JSON.stringify(obj));
                $scope.dataStores.push(obj);
            };

            $scope.buildAPIURL = function (topModel, iov) {
                var url = 'api/crates/' + iov + '/';
                var model = topModel;
                var finished = false;
                while (!finished) {
                    if (model.selectedRow >= 0) {
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


            var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
            //var url = $scope.buildURL($scope.crateModel, $scope.iov);


            CratesAPI.getByURL(apiurl).then( function(data) {
                $scope.crateModel.resetModel(true);
                $scope.crateModel.data = data.data;
                console.log('CratesAPI data = '+JSON.stringify(data.data));
            });


//            $http.get(apiurl)
  //              .success(function (data, status, headers, config) {
    //                console.log('CratesCtrl:' + JSON.stringify(data));
      //              $scope.crateModel.resetModel(true);
        //            $scope.crateModel.data = data;
          //          //$location.path = url;
            //        console.log(JSON.stringify($scope.crateModel));
//
  //              });

            $scope.click = function(index, values, model) {
                console.log('click: '+index+' '+values[model.rowIndex]+' '+values[index]+' '+model.name);

                // was it a select or a deselect
                if(model.selectElement(index,values)) {
                    console.log('Select operation');
                    // a select operation - lets grab some new data
                    // if there is a child to give the data to...
                    if( model.child) {
                        var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
                        // this will eventually be used with $location
                        //var url = $scope.buildURL($scope.crateModel, $scope.iov);
                        console.log(apiurl);
                        //console.log(url);
                        CratesAPI.getByURL(apiurl).then(function (data) {
                            model.child.resetModel(true);
                            console.log(JSON.stringify(data));
                            model.child.data = data.data;
                            //$location.path = url;
                        });
                    }
                } else {
                    console.log('Deselect operation');
                  // was a deselect - nothing to do at the moment
                }
            }
        }]);