/**
 * Created by hays on 23/05/14.
 */

    // this factory provides a single method to return a model object
    // in response to a request parameterised by the model index
    // it is responsible for accessing the CratesAPI to fetch new data

var module = angular.module('snapshot');

module.factory('CratesData', ['CratesHTTP','CrateModel','$q', function(CratesHTTP,CrateModel,$q) {
    var api = {
        getModelByIndex: function (cratesIndex) {
            var crateAPI = CratesHTTP;
            var model = CrateModel;
            var currentModelIndex = model.getIndex();
            var promises = [];
            var base = 'api/crates/' + cratesIndex.iov;
            var modbase ='api/modules/' + cratesIndex.iov;
            var cr=-1;
            var rd=-1;
            var mr=-1;
            var md=-1;
            var mid=-1;
            var ch=-1;

            var forceReload = false;
            if( cratesIndex.iov != model.iov) {
                console.log('IOV='+cratesIndex.iov+' '+model.iov);
                forceReload = true;
                model.iov = cratesIndex.iov;
            }

            if(cratesIndex.crate!=null && cratesIndex.crate!='all') { cr=parseInt(cratesIndex.crate);}
            if(cratesIndex.rod!=null && cratesIndex.rod!='all') { rd=parseInt(cratesIndex.rod);}
            if(cratesIndex.mur!=null && cratesIndex.mur!='all') { mr=parseInt(cratesIndex.mur);}
            if(cratesIndex.mod!=null && cratesIndex.mod!='all') { md=parseInt(cratesIndex.mod);}
            if(cratesIndex.chip!=null && cratesIndex.chip!='all') { ch=parseInt(cratesIndex.chip);}

            console.log('CratesData: '+base);
            console.log('-=-=-= : '+cr+' '+currentModelIndex.crate)
            if(forceReload || cr != parseInt(currentModelIndex.crate)) {
                forceReload = true; // force the other bits of the model to reload
                if( currentModelIndex.crate==='all') {
                    model.rodModel.resetModel(true);
                    console.log('Dont need to reload crate data but do need to force reload of the rest');
                } else {
                    promises.push(
                        crateAPI.getByURL(base + '/all').then(
                            function (res) {
                                model.crateModel.setData(res.data, cr);
                                console.log('CratesData: got crates : ' + cr);
                            }));
                }
            } else {
                console.log("Don't need to reload crate");
            }

            if( cr >= 0) {
                base += '/' + cratesIndex.crate;
                console.log('CratesData: ' + base);
                // check to see if we already have this ROD
                if (forceReload || rd != currentModelIndex.rod) {
                    forceReload=true;
                    if( currentModelIndex.rod==='all') {
                        model.murModel.resetModel(true);
                    } else {
                        model.rodModel.resetModel(true);
                        promises.push(crateAPI.getByURL(base + '/all').then(
                            function (res) {
                                model.rodModel.setData(res.data, rd);
                                console.log('CratesData: got crates : ' + cr + ' ' + rd);
                            }));
                    }
                } else {
                    console.log("Don't need to reload rod");
                }

                if( rd >=0) {
                    base += '/' + cratesIndex.rod;
                    console.log('CratesData: ' + base);
                    if( forceReload || mr != currentModelIndex.mur)
                    {
                        forceReload=true;
                        if( currentModelIndex.mur==='all') {
                            model.modModel.resetModel(true);
                        } else {
                            model.murModel.resetModel(true);
                            promises.push(crateAPI.getByURL(base + '/all').then(
                                function (res) {
                                    model.murModel.setData(res.data, mr);
                                    console.log('CratesData: got crates : ' + cr + ' ' + rd + ' ' + mr);
                                    console.log('CratesData: *** ' + JSON.stringify(res.data));
                                }));
                        }
                    } else {
                        console.log("Don't need to reload MUR");
                    }
                    if(mr>=0) {
                        base += '/' + cratesIndex.mur;
                        console.log('CratesData: ' + base);
                        // does this need the same treatment for optimising reloading?
                        if( forceReload || md != currentModelIndex.mod) {
                            model.modModel.resetModel(true);
                            promises.push(crateAPI.getByURL(base + '/all').then(
                                function (res) {
                                    model.modModel.setData(res.data, md);
                                    console.log('CratesData: got crates : ' + cr + ' ' + rd + ' ' + mr + ' ' + md);
                                    return model.modModel.data['rows'];
                                }).then(
                                function (rows) { // chained to the module promise...
                                    // need to find the module id.
                                    // we know the row number
                                    var n = rows.length;
                                    for (var i = 0; i < n; ++i) {
                                        values = rows[i]["values"];
                                        console.log('row processing: ' + values[0] + ' ' + values[1]);
                                        if (values[0] === md) {
                                            mid = values[1];
                                        }
                                    }// could be optimised to not loop over the whole thing.... i suppose

                                    if (mid >= 0) {
                                        modbase += '/' + mid;
                                        console.log('CratesData: ' + modbase);
                                        return crateAPI.getByURL(modbase + '/all').then(
                                            function (res) {
                                                console.log(JSON.stringify(res.data));
                                                model.chipModel.setData(res.data, ch);
                                                console.log('CratesData: got crates : ' + mid + ' ' + ch);
                                            });
                                    }
                                }));
                        } else { // only do this if we didn't force load the module - since then we need to force load the chip anyway
                            console.log("Don't need to reload module");
                            // not reloading the module should we reload the chip?
                            if( forceReload || ch != currentModelIndex.chip) {
                                // then need to find the module ID... as we did above
                                model.chipModel.resetModel(true);
                                var mid=-1;
                                var rows = model.modModel.data['rows'];
                                var n = rows.length;
                                for (var i = 0; i < n; ++i) {
                                    values = rows[i]["values"];
                                    console.log('row processing: ' + values[0] + ' ' + values[1]);
                                    if (values[0] === md) {
                                        mid = values[1];
                                    }
                                }// could be optimised to not loop over the whole thing.... i suppose

                                if( mid >=0) {
                                    modbase += '/'+mid;
                                    promises.push(crateAPI.getByURL(modbase+'/all').then(
                                        function(res) {
                                            model.chipModel.setData(res.data,ch);
                                        }));
                                }
                            } else {
                                console.log("Don't need to reload chip");
                            }
                        }

                    }
                }
            }
            return $q.all(promises); // sync on all requests
        }
    };

    return api;
}]);