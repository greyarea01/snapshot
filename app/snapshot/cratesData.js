/**
 * Created by hays on 23/05/14.
 */

    // this factory provides a single method to return a model object
    // in response to a request parameterised by the model index
    // it is responsible for accessing the CratesAPI to fetch new data

var module = angular.module('snapshot-crates');

module.factory('CratesData', ['CratesAPI','CrateModel', function(CratesAPI,CrateModel) {
    var api = {
        getModelByIndex: function(cratesIndex) {
         var model = CrateModel;
         var currentModelIndex = model.getIndex();



        }

    };

    return api;
}]);