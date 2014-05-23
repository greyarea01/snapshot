/**
 * Created by hays on 23/05/14.
 */

    // this factory provides a single method to return a model object
    // in response to a request parameterised by the model index
    // it is responsible for accessing the CratesAPI to fetch new data

var module = angular.module('snapshot-crates');

module.factory('CratesData', ['CratesAPI','CrateModel', function(CratesAPI,CrateModel) {
    var api = {
        getModelByIndex: function (cratesIndex) {
            var crateAPI = CratesAPI;
            var model = CrateModel;
            var currentModelIndex = model.getIndex();

            var base = 'api/crates/' + iov;
            crateAPI.getByURL(base + '/all').then(
                function (data) {
                    model.crateModel.data = data;
                    model.crateModel.selectedURLElement = cratesIndex.crate;
                });

            base += '/' + cratesIndex.crate;
            crateAPI.getByURL(base + '/all').then(
                function (data) {
                    model.rodModel.data = data;
                    model.rodModel.selectedURLElement = cratesIndex.rod;
                });
            base += '/' + cratesIndex.rod;
            crateAPI.getByURL(base + '/all').then(
                function (data) {
                    model.murModel.data = data;
                    model.murModel.selectedURLElement = cratesIndex.mur;
                });
            base += '/' + cratesIndex.mur;
            crateAPI.getByURL(base + 'all').then(
                function (data) {
                    model.modModel.data = data;
                    model.modModel.selectedURLElement = cratesIndex.mod;
                });
            base += '/' + cratesIndex.mod;
            crateAPI.getByURL(base + 'all').then(
                function (data) {
                    model.chipModel.data = data;
                    model.chipModel.selectedURLElement = cratesIndex.chip;
                });
        }
    }
    //FIXME: need to modify original click methods to just work on rows instead of elements
    // overly complex and doesn't map onto the API properly
    // then should just call: model.crateModel.select(index)
    // to set that row as selected and it should figure out the correct row etc

    return api;
}]);