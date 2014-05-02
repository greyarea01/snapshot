/**
 * Created by hays on 02/05/14.
 */

var module = angular.module('snapshot');

module.factory('CratesAPI', ['$http', function() {
    var api;
    api = {
        getByURL: function (url) {
            return $http.get(url).success(function (data, status, headers, config) {
                return data;
            });
        }
    };
}]);


