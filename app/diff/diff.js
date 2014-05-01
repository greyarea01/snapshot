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
        }
    ]);