/**
 * Created by hays on 02/05/14.
 */

var module = angular.module('snapshot');

module.factory('CratesHTTP', ['$http', function($http) {
    var api = {
        getByURL: function (url) {
            return $http.get(url).then(function (data, status, headers, config) {
                return data;
            }); // returns a promise
        }
    };
     return api;
}]);


