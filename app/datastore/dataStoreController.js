/**
 * Created by hays on 07/05/14.
 */
angular.module('snapshot-datastore',[])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/store', {
                    templateUrl: 'app/datastore/datastore.html',
                    controller: 'DataStoreCtrl'
                });
        }])
    .controller('DataStoreCtrl',['$scope', '$location', 'CratesDataStore', function($scope, $location, CratesDataStore) {

            $scope.dataStore = CratesDataStore;
            $scope.dataList = [];
            $scope.deleteEntry = function(index) {
                if( index >=0 && index < $scope.dataStore.length) {
                    $scope.dataStore.splice(index,1);
                }
                $scope.dataList = $scope.makeList($scope.dataStore);
            };

            $scope.makeList = function(dataStore) {
                var list=[];
                var n = dataStore.length;
                var data;
                for (var i = 0; i < n; ++i) {
                    data = dataStore[i];
                    var obj = {
                        label: data.label,
                        iov: data.iov,
                        descriptor: data.model.description
                    };
                    list.push(obj);
                }
                return list;
            };

        $scope.diff = function() {
            $location.path('/diff');
        };

            $scope.dataList = $scope.makeList($scope.dataStore);
            console.log('dataStore controller! : '+$scope.dataStore.length+' '+$scope.dataList.length);

    }]);
