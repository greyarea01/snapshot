/**
 * Created by hays on 01/05/14.
 */

var module = angular.module('snapshot');

module.factory('CratesDataStore',['$localStorage', function($localStorage) {
    var dataStore = $localStorage;
    if( typeof dataStore.data === 'undefined') {
        dataStore.data=[];
    }
    return dataStore.data;
}]);