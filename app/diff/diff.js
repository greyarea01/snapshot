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

            $scope.dataVisible = (function(dataStore) {
                var n = dataStore.length;
                var list=[];
                for( var i =0;i<n;++i) {
                    list.push(true);
                }
                return list;
            }($scope.dataStores));

            $scope.showDiffsOnly=false;


            $scope.toggleDiffs = function() {
                if( $scope.showDiffsOnly) {
                    $scope.showDiffsOnly=false;
                } else {
                    $scope.showDiffsOnly=true;
                }
            }

            $scope.buttonClass = (function(dataStore) {
                var n=dataStore.length;
                var list=[];
                for(var i=0;i<n;++i) {
                    list.push('btn-warning');
                }
                return list;
            }($scope.dataStores));

            console.log('dataVisible length is '+$scope.dataVisible.length);

            $scope.toggleVisible = function(index,name) {
                if( index <0 || index>=$scope.dataVisible.length) {
                    console.log('toggleVisible: index out of range '+index);
                    return;
                }

                if( $scope.dataVisible[index]) {
                    $scope.dataVisible[index]=false;
                    $scope.buttonClass[index]='btn-default';
                } else {
                    $scope.dataVisible[index]=true;
                    $scope.buttonClass[index]='btn-warning';
                }
            }

            $scope.columnVisible = function(index) {
                if( index<0 || index>=$scope.dataVisible.length) {
                    //console.log('columnVisible: index out of range '+index);
                    return true;
                }
                return $scope.dataVisible[index];
            }

            $scope.diffModel = {
                variables: [],
                columns: [],

                headers: [],
                rows: [],
                process:  function() {
                    // turn variables + columns into headers + rows
                    // headers = "Variables" + lables from columns
                    headers = [];
                    rows = [];
                    var columns = this.columns;
                    var variables = this.variables;
                    headers.push("Vars");
                    var nCol = columns.length;
                    for(var i =0;i<nCol;++i){
                        var entry = {
                            label: columns[i].label,
                            show: true
                        }
    //                        var label = columns[i].label;
                        headers.push(entry);
                    }
//                    var size = headers.length;
                    var nVars = variables.length;

                    for(var j=0;j<nVars;++j) {
                        var row=[];
                        // loop over columns

                        for( var k=0;k<nCol;++k) {
                            var col = columns[k];
                            var val = col.values[j];


                            var entry = {
                                value: val,
                                show: true
                            }
                           row.push(entry);
                        }
                        var obj = {
                            name: variables[j],
                            values: row
                        }
                        rows.push(obj);

                    }
                    this.headers=headers;
                    this.rows=rows;

                    console.log('Found '+rows.length+' rows');
                    console.log('found '+headers.length+' headers');
                }
            };

            $scope.showRow = function(row) {
                var cl = $scope.highlightRow(row);
                if( cl === 'danger' || !$scope.showDiffsOnly) {
                    return true;
                } else {
                    return false;
                }
            }
            $scope.highlightRow = function(row) {
                console.log('Checking row: ');
                var highlight='default';
                var n = row.length;
                var firstVal = null;
                for( var i=0;i<n;++i) {
                    if( firstVal != null) {
                        console.log(firstVal+' '+row[i].value);
                        if( firstVal!=row[i].value) {
                            highlight='danger';
                        }
                    } else {
                        firstVal = row[i].value;
                    }
                }
                console.log(highlight);
                return highlight;
            }
            console.log(JSON.stringify($scope.dataStores));

            $scope.diffModel.variables = (function (dataStore) {
                var largestHeaders = [];
                var store;
                var headers;
                var model;
                var data;
                var header;
                var nMatched;
                var index;
                var element;
                var nstores = dataStore.length;
                for(var i = 0;i<nstores;++i) {
                    store = dataStore[i];
                    console.log('Processing '+store.label+' '+(i+1)+'/'+nstores);
                    headers = [];
                    model = store.model;
                    while (model && model.selectedURLElement>=0) {
                        console.log('     '+model.name+' '+model.selectedURLElement);
                        nMatched = 0;
                        index = model.rowIndex;
                        element = model.selectedURLElement;
                        data = model.data;
                        var nheaders = data.headers.length;
                        for(var j = 0;j<nheaders;++j) {
                            headers.push(data.headers[j]);
                        }
                        model = model.child;
                        if (model) {
                            if (model.selectedURLElement < 0) {
                                model = null; // stop if there is a model but no element was selected
                            }
                        }
                    }
                    console.log('   '+store.label+' '+headers.length);
                    if (headers.length > largestHeaders.length) {
                        largestHeaders = headers;
                    }

                }
                console.log('Found '+largestHeaders.length+' headers');
                return largestHeaders;
            })($scope.dataStores);

            $scope.diffModel.columns = (function(size,dataStore){
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
                var nstores = dataStore.length;
                for(var i =0;i<nstores;++i) {
                    store = dataStore[i];
                    values = [];
                    counter =0;
                    model = store.model;
                    console.log('Processing '+store.label+' '+(i+1)+'/'+nstores);
                    while(model && model.selectedURLElement>=0) {
                        console.log('   model='+model.name);
                        index = model.rowIndex;
                        element = model.selectedURLElement;
                        data = model.data;
                        var nrows = data.rows.length;
                        for(var j =0;j<nrows;++j) {
                            row = data.rows[j];
                            var nvalues = row.values.length;
                            console.log('    '+index+' '+row.values[index]+' '+element);
                            if (row.values[index] === element) {
                                for (var k = 0; k < nvalues; ++k) {
                                    values.push(row.values[k]);
                                    counter = counter + 1;
                                }
                            }
                        }
                        model = model.child;
                        if (model) {
                            if (model.selectedURLElement < 0) {
                                model = null; // stop if there is a model but no element was selected
                            }
                        }

                    }
                    missing = size-counter;
                    if( missing > 0) {
                        console.log('Adding '+missing+ ' elements to values');
                    }
                    for( var l =0; l<missing;++l) {
                        values.push(' - ');
                    }

                    var obj = {
                        label: store.label,
                        values: values
                    };

                    columns.push(obj);
                }
                console.log('Found '+columns.length+' columnes');
                return columns;
            })($scope.diffModel.headers.length,$scope.dataStores);

            console.log(JSON.stringify($scope.diffModel.headers));
            console.log(JSON.stringify($scope.diffModel.columns));
            $scope.diffModel.process();
        }

    ]);