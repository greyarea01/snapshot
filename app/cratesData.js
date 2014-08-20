/**
 * Created by hays on 23/05/14.
 */

    // this factory provides a single method to return a model object
    // in response to a request parameterised by the model index
    // it is responsible for accessing the CratesAPI to fetch new data

var module = angular.module('snapshot');

module.factory('CratesData', ['CratesHTTP','CrateModel','$q', function(CratesHTTP,CrateModel,$q) {
    var api = {
        getModelByIndex: function (requestIndex) {
            var crateAPI = CratesHTTP;
            var model = CrateModel;
            var currentModelIndex = model.getIndex();
            var promises = [];
            var values;
            var i;
            var n;
            var base = 'api/crates/' + requestIndex.iov;
            var modbase ='api/modules/' + requestIndex.iov;
            var cr=requestIndex.crate;
            var rd=requestIndex.rod;
            var mr=requestIndex.mur;
            var md=requestIndex.mod;
            var mid=-1; // this will be set lower down
            var ch=requestIndex.chip;
            var loadCrate = false;
            var loadRod = false;
            var loadMur = false;
            var loadMod = false;
            var loadChip = false;

            var forceReload = false;
            if( requestIndex.iov != model.iov) {
                console.log('IOV='+requestIndex.iov+' '+model.iov);
                forceReload = true;
                model.iov = requestIndex.iov;
            }

            console.log('getModelByIndex: currentModel '+currentModelIndex.crate+' '+currentModelIndex.rod+' '+currentModelIndex.mur+' '+currentModelIndex.mod+' '+currentModelIndex.chip);
            console.log('getModelByIndex: requested    '+requestIndex.crate+' '+requestIndex.rod+' '+requestIndex.mur+' '+requestIndex.mod+' '+requestIndex.chip);
// force to integers if not null or 'all'
            if(requestIndex.crate!=null && requestIndex.crate!='all') { cr=parseInt(requestIndex.crate);}
            if(requestIndex.rod!=null && requestIndex.rod!='all') { rd=parseInt(requestIndex.rod);}
            if(requestIndex.mur!=null && requestIndex.mur!='all') { mr=parseInt(requestIndex.mur);}
            if(requestIndex.mod!=null && requestIndex.mod!='all') { md=parseInt(requestIndex.mod);}
            if(requestIndex.chip!=null && requestIndex.chip!='all') { ch=parseInt(requestIndex.chip);}

            console.log('CratesData: '+base);
            console.log('-=-=-= : '+cr+' '+currentModelIndex.crate)

            // we should load crate data if the force load flag is set or if the current model is null
            loadCrate = forceReload || currentModelIndex.crate===null;

            if( requestIndex.crate==='all' || requestIndex.crate===null) {
                loadRod = false;
                model.rodModel.resetModel(true);
            } else {
                loadRod = forceReload || loadCrate || requestIndex.crate != currentModelIndex.crate;
                if( requestIndex.rod==='all' || requestIndex.rod===null) {
                    loadMur = false;
                    model.murModel.resetModel(true);
                } else {
                    loadMur = forceReload || loadRod || requestIndex.rod != currentModelIndex.rod;
                    if( requestIndex.mur==='all' || requestIndex.mur===null) {
                        loadMod = false;
                        model.modModel.resetModel(true);
                    } else {
                        loadMod = forceReload || loadMur || requestIndex.mur != currentModelIndex.mur;
                        if( requestIndex.mod ==='all' || requestIndex.mod===null) {
                            loadChip = false;
                            model.chipModel.resetModel(true);
                        } else {
                            loadChip = forceReload || loadMod || requestIndex.mod != currentModelIndex.mod;
                        }
                    }
                }
            }

            console.log('getByURL:'+loadCrate+' '+loadRod+' '+loadMur+' '+loadMod+' '+loadChip);
            if(loadCrate) {
                promises.push(crateAPI.getByURL(base+'/all').then(
                    function(res) {
                        model.crateModel.setData(res.data, cr);
                    }
                ))
            } else {
                model.crateModel.select(cr);
            }

            if(loadRod) {
                promises.push(crateAPI.getByURL(base+'/'+cr+'/all'). then(
                    function(res) {
                        model.rodModel.setData(res.data,rd);
                    }
                ))
            } else {
                model.rodModel.select(rd);
            }

            if( loadMur) {
                promises.push(crateAPI.getByURL(base+'/'+cr+'/'+rd+'/all').then(
                    function(res) {
                        model.murModel.setData(res.data,mr);
                    }
                ))
            } else {
                model.murModel.select(mr);
            }

            if( loadMod) {
                if (!loadChip) {
                    promises.push(crateAPI.getByURL(base + '/' + cr + '/' + rd + '/' + mr + '/all').then(
                        function (res) {
                            model.modModel.setData(res.data, md);
                        }
                    ));
                    model.chipModel.select(ch);
                } else {
                    // chain the chip and module promises
                    promises.push(crateAPI.getByURL(base + '/' + cr + '/' + rd + '/' + mr + '/all').then(
                        function (res) {
                            model.modModel.setData(res.data, md);
                            return res.data.rows;
                        }).then(
                        function (rows) {
                            var n = rows.length;
                            // look for the module serial number (mid) for the module on the row given by md
                            for (var i = 0; i < n; ++i) {
                                var values = rows[i]["values"];
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
                }
            } else {
                model.modModel.select(md);
                if(loadChip) {
                    n = model.modModel.data.rows.length;
                    for(i=0;i<n;++i) {
                        values = model.modModel.data.rows[i]["values"];
                        if( values[0] === md) {
                            mid = values[1];
                        }
                    }
                    promises.push(crateAPI.getByURL(modbase+'/'+mid+'/all').then(
                        function(res) {
                            model.chipModel.setData(res.data,ch);
                        })
                    );
                } else {
                    model.chipModel.select(ch);
                }
            }

            return $q.all(promises); // sync on all requests
        }
    };

    return api;
}]);