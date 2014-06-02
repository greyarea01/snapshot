/**
 * Created by hays on 23/05/14.
 */

    // this factory provides a single method to return a model object
    // in response to a request parameterised by the model index
    // it is responsible for accessing the CratesAPI to fetch new data

var module = angular.module('snapshot');

module.factory('CratesData', ['CratesAPI','CrateModel','$q', function(CratesAPI,CrateModel,$q) {
    var api = {
        getModelByIndex: function (cratesIndex) {
            var crateAPI = CratesAPI;
            var model = CrateModel;
            //var currentModelIndex = model.getIndex();
            var promises = [];
            var base = 'api/crates/' + cratesIndex.iov;
            var cr=-1;
            var rd=-1;
            var mr=-1;
            var md=-1;
            var ch=-1;
            if(cratesIndex.crate!=null && cratesIndex.crate!='all') { cr=parseInt(cratesIndex.crate);}
            if(cratesIndex.rod!=null && cratesIndex.rod!='all') { rd=parseInt(cratesIndex.rod);}
            if(cratesIndex.mur!=null && cratesIndex.mur!='all') { mr=parseInt(cratesIndex.mur);}
            if(cratesIndex.mod!=null && cratesIndex.mod!='all') { md=parseInt(cratesIndex.mod);}
            if(cratesIndex.chip!=null && cratesIndex.chip!='all') { ch=parseInt(cratesIndex.chip);}

            console.log('CratesData: '+base);
            promises.push(
            crateAPI.getByURL(base + '/all').then(
                function (res) {
                    model.crateModel.data = res.data;
                    model.crateModel.selectedURLElement = cr;
                    console.log('CratesData: got crates : '+cr);
                }));
            if( cr >= 0) {
                base += '/' + cratesIndex.crate;
                console.log('CratesData: ' + base);
                promises.push(crateAPI.getByURL(base + '/all').then(
                    function (res) {
                        model.rodModel.data = res.data;
                        model.rodModel.selectedURLElement = rd;
                        console.log('CratesData: got crates : '+cr+' '+rd);
                    }));
                if( rd >=0) {
                    base += '/' + cratesIndex.rod;
                    console.log('CratesData: ' + base);
                    promises.push(crateAPI.getByURL(base + '/all').then(
                        function (res) {
                            model.murModel.data = res.data;
                            model.murModel.selectedURLElement = mr;
                            console.log('CratesData: got crates : '+cr+' '+rd+' '+mr);
                        }));
                    if(mr>=0) {
                        base += '/' + cratesIndex.mur;
                        console.log('CratesData: ' + base);

                        promises.push(crateAPI.getByURL(base + '/all').then(
                            function (res) {
                                model.modModel.data = res.data;
                                model.modModel.selectedURLElement = md;
                                console.log('CratesData: got crates : '+cr+' '+rd+' '+mr+' '+md);

                            }));
                        if (md >= 0) {

                        base += '/' + cratesIndex.mod;
                        console.log('CratesData: ' + base);
                        promises.push(crateAPI.getByURL(base + '/all').then(
                            function (res) {
                                model.chipModel.data = res.data;
                                model.chipModel.selectedURLElement = ch;
                                console.log('CratesData: got crates : '+cr+' '+rd+' '+mr+' '+md+' '+ch);
                            }));
                        }
                    }
                }
            }
            return $q.all(promises);
        }
    };
    //FIXME: need to modify original click methods to just work on rows instead of elements
    // overly complex and doesn't map onto the API properly
    // then should just call: model.crateModel.select(index)
    // to set that row as selected and it should figure out the correct row etc

    return api;
}]);