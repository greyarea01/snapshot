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
            // define the index object - its a simple object that can be initialized with the $routeParams
            // or return its contents as a URL
            $scope.dataIndex= {
                iov: null,
                crate: null,
                rod: null,
                mur: null,
                mod: null,
                chip: null,
                getURL: function() {
                    // add each value onto the end of the url until we hit a null or an all
                    var url = '/crates/' + this.iov;

                    // special case for crate since it is the first index - if this is null or all, add all to the URL
                    if( this.crate===null || this.cate==='all') {
                        url+='/all';
                        return url;
                    }

                    if( this.rod===null) {
                        return url;
                    }
                    url+='/'+this.rod;
                    if( this.rod==='all') {
                        return url;
                    }

                    if( this.mur===null) {
                        return url;
                    }
                    url+='/'+this.mur;
                    if( this.mur==='all') {
                        return url;
                    }

                    if( this.mod===null) {
                        return url;
                    }
                    url+='/'+this.mod;
                    if( this.mod==='all') {
                        return url;
                    }

                    if( this.chip===null) {
                        return url;
                    }
                    url+='/'+this.chip;
                    return url;
                },
                setFromURLParams: function(params)  {
                    var propertyList = ['crate', 'rod', 'mur', 'mod', 'chip'];
                    var n = propertyList.length;

                    if (!params.iov) {
                        this.iov = 'now';
                        this.crate = 'all';
                    } else {
                        this.iov = params.iov;
                        this.dataIndex.iov = params.iov;
                    }
                    var finished = false
                    var i = 0;
                    var field;
                    while (!finished) {
                        field = propertyList[i];
                        if (!params[field]) {
                            this[field] = 'all';
                            finished = true;
                        } else {
                            this[field] = $routeParams[field]
                            i++;
                        }
                        if (i === n) {
                            finished = true;
                        }
                    }
                }


            };
            // set up the scope variables
            // loaded is a flag to stop the click handlers and other navigational tools from working
            // until the model has been loaded
            $scope.loaded=false;

            // for saving snapshots
            $scope.dataStores=CratesDataStore;
            // the current model
            $scope.model = CrateModel;

            // CratesData is responsible for updating the model to reflect the URL
            // Events from the UI modify the index which triggers a reload with a new URL
            // on loading the new URL CratesData updates the model
            // by comparing the modified index with the model prior to an update
            // it can selectively reload only those bits which have changed.
            $scope.data = CratesData;

            // model list used for the view - enables use of ng-repeat to generate a table for each level
            // of the nested model - saves some typing in the html
            $scope.modelList=[];

            // a descriptor in the view for debugging
            $scope.descriptor = '';

            ///////////////////////////////////////////////////////////////////////////////////////////////
            // here are the handlers for the UI
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

                // this needs to be changed to reflect the new approach using a  watch on the index
//                console.log('Model List is: '+JSON.stringify($scope.modelList));
                console.log('click: ' + index + ' ' + values[model.rowIndex] + ' ' + values[index] + ' ' + model.name);
// select or deselect now involve a URL change...
                model.selectElementFromList(values);
                //var index = model.getIndex();
                var url = $scope.model.getURL();
                // this should cause a reload
                $location.path(url);
            }

            $scope.dropdownClick = function(model,element) {
                model.selectElement(element);
                var url = $scope.model.getURL();
                $location.path(url);
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

            $scope.$watch($scope.dataIndex, function() {
                var url = $scope.dataIndex.getURL();
                $location.path(url);
            })

        }]);