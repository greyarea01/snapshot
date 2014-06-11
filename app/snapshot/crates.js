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
                if( !$scope.loaded) {
                    console.log("clicked before loading finished");
                    return;
                }
//                console.log('Model List is: '+JSON.stringify($scope.modelList));
                console.log('click: '+index+' '+values[model.rowIndex]+' '+values[index]+' '+model.name);
// select or deselect now involve a URL change...
                model.selectElement(values);
                //var index = model.getIndex();
                var url = $scope.model.getURL();
                // this should cause a reload
                $location.path(url);

                // was it a select or a deselect
                //if(model.selectElement(values)) {
                  //  console.log('Select operation');
                    // a select operation - lets grab some new data
                    // if there is a child to give the data to...
                    // just set up the index and go call the crateData api
                    // in fact the selectElement should set up the index

                    // update the model with new data:

                   // if( model.child) {
                     //   var apiurl = $scope.model.getAPIURL($scope.iov);
                     //   console.log(apiurl);
                     //   CratesAPI.getByURL(apiurl).then(function (data) {
                     //       model.child.resetModel(true);
                     //       console.log(JSON.stringify(data));
                     //       model.child.data = data.data;
                     //       $scope.descriptor = $scope.model.descriptor();
                      //      //$location.path = url;
                     //   });
                    //} else {
                    //    $scope.descriptor = $scope.model.descriptor();
                   // }
                //} else {
                //    console.log('Deselect operation');
                  // was a deselect - nothing to do at the moment
                //}

            };

            //var apiurl = $scope.buildAPIURL($scope.crateModel, $scope.iov);
            //var url = $scope.buildURL($scope.crateModel, $scope.iov);
            //var apiurl = $scope.model.getAPIURL($scope.iov);
            $scope.data.getModelByIndex($scope.dataIndex).then(function(){
                $scope.descriptor=$scope.model.descriptor;
                $scope.modelList = $scope.model.getList();
                $scope.loaded = true;
            });
/*
            CratesAPI.getByURL(apiurl).then( function(data) {
                $scope.model.crateModel.resetModel(true);
                $scope.model.crateModel.data = data.data;
                console.log('Grabbed data from: '+apiurl);
                console.log('Setting CratesAPI data = '+JSON.stringify(data.data));
                $scope.descriptor = $scope.model.descriptor();
            });
*/
        }]);