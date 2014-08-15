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
            $scope.getIOVNow = function() {
                // getTime returns miliseconds - convert to nanoseconds
                var nanoSeconds = parseInt((new Date).getTime()*1e6);
                return nanoSeconds;
            };

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
                    if( this.crate===null || this.crate==='all') {
                        url+='/all';
                        return url;
                    }
                    url+='/'+this.crate;

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
//                        this.iov = 'now';
                        this.iov = $scope.getIOVNow();
                        this.crate = 'all';
                    } else {
                        if( params.iov==='now') {
                            this.iov = $scope.getIOVNow();
                        } else {
                            this.iov = parseInt(params.iov);
                        }
                    }
                    var finished = false
                    var i = 0;
                    var field;
                    while (!finished) {
                        field = propertyList[i];
                        if (!params[field]) {
                            this[field] = 'all';
                        } else {
                            this[field] = $routeParams[field]
                            i++;
                        }
                        if (this[field]==='all' || i === n) {
                            finished = true;
                        }
                    }
                       console.log('setFromURLParams: '+this.crate+' '+this.rod+' '+this.mur+' '+this.mod+' '+this.chip);
                },
                modifyProperty: function(property,value) {
                    if( property=='iov') {
                        if( value != this.iov) {
                            this.iov = value;
                            this.crate = 'all';
                            this.rod = null;
                            this.mur = null;
                            this.mod = null;
                            this.chip = null;
                        }
                        return;
                    }
                    var propertyList = ['crate','rod','mur','mod','chip'];
                    var n = propertyList.length;
                    var makeRestNull=false;
                    for(var i = 0;i<n;++i) {
                        if( makeRestNull) {
                            this[propertyList[i]]=null;
                        } else {
                            if (property == propertyList[i]) {
                                if (value != this[property]) {
                                    this[property]=value;
                                    makeRestNull=true;
                                }
                            }
                        }
                    }

            }


            };
            // set up the scope variables
            // loaded is a flag to stop the click handlers and other navigational tools from working
            // until the model has been loaded
            $scope.loaded=false;

            $scope.dataIndex.setFromURLParams($routeParams);


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
                var str='';
                obj.model.description = $scope.model.descriptor(str);
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

            $scope.clickV2 = function(property, el) {
                var element=el;
                // update the index. this will trigger a reload to update the model
                // make sure it is an integer and not a string
                if( el != null && el != 'all') {
                    element = parseInt(el);
                } else {
                    element = el;
                }
                console.log('Changing the data index: '+property+' '+element);
                console.log($scope.dataIndex[property]);

                var oldElement = $scope.dataIndex[property];
                if( oldElement == element) {
                    // this is a deselect operation
                    element='all';
                }
    //                $scope.dataIndex[property]=element; // check this...
                $scope.dataIndex.modifyProperty(property,element);
                console.log($scope.dataIndex[property]);

            }


            $scope.update = function() {
                console.log('Updating');
                var url = $scope.dataIndex.getURL();
                console.log(url);
                $location.path(url);
            }

            $scope.load = function(index) {
                $scope.loaded = false;
                $scope.data.getModelByIndex(index).then(function(){

                    console.log('Watching the dataIndex');
                    $scope.$watch("dataIndex.crate",$scope.update);
                    $scope.$watch("dataIndex.rod",$scope.update);
                    $scope.$watch("dataIndex.mur",$scope.update);
                    $scope.$watch("dataIndex.mod",$scope.update);
                    $scope.$watch("dataIndex.chip",$scope.update);

                    $scope.loaded = true;
                });
            }

            $scope.load($scope.dataIndex);

        }]);