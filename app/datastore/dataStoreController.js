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
    .controller('DataStoreCtrl',['$scope', 'CratesDataStore', function($scope, CratesDataStore) {

            $scope.dataStore = CratesDataStore;
            $scope.dataList = [];

            var n = $scope.dataStore.length;
            var data;
        for( var i =0;i<n;++i) {
            data = $scope.dataStore[i];
            var obj = {
                label: data.label,
                iov: data.iov,
                descriptor: data.model.description
            }
            $scope.dataList.push(obj);
        }
            console.log('dataStore controller! : '+$scope.dataStore.length+' '+$scope.dataList.length);

    }]);
