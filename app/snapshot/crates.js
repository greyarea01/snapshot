/**
 * Created by hays on 02/04/14.
 */

angular.module('snapshot-crates',[])
    .config(['$routeProvider',
    function($routeProvider){
        $routeProvider
            .when('/crates', {
                templateUrl: 'app/snapshot/snapshot.html',
              controller: 'CratesCtrl'
           });
    }])
    .controller('CratesCtrl',['$scope','$http','$location',
    function($scope,$http,$location) {

        $scope.chipModel = configModel("chip");
        $scope.modModel = configModel("mod",$scope.chipModel);
        $scope.murModel = configModel("mur",$scope.modModel);
        $scope.rodModel = configModel("rod",$scope.murModel);
        $scope.crateModel = configModel("crate",$scope.rodModel);

        $scope.iov='now';

        $scope.buildAPIURL =function(topModel,iov) {
            var url='api/crates/'+iov+'/';
            var model=topModel;
            var finished=false;
            while(!finished) {
                if(model.selected>=0) {
                    url+=model.urlelement+'/';
                    model=model.child;
                    if(model===null) {
                        finished=true;
                    }
                } else {
                    url+='all';
                    finished=true;
                }

            }
            return url;

        };

        $scope.buildURL =function(topModel,iov) {
            var url='/crates/'+iov+'/';
            var model=topModel;
            var finished=false;
            while(!finished) {
                if(model.selected>=0) {
                    url+=model.urlelement+'/';
                    model=model.child;
                    if(model===null) {
                        finished=true;
                    }
                } else {
                    url+='all';
                    finished=true;
                }

            }
            return url;

        };


        var apiurl=$scope.buildAPIURL($scope.crateModel,$scope.iov);
        var url=$scope.buildURL($scope.crateModel,$scope.iov);

        $http.get(apiurl)
            .success(function(data,status,headers,config){
                console.log('CratesCtrl:'+JSON.stringify(data));
                $scope.resetModel($scope.crateModel);
                $scope.crateModel.data=data;
                $location.path=url;
            });
// click handlers - there are two - one for modules and one for everything else FIXME!
        $scope.modClick=function(box, index, module,moduleID,model){
            console.log(index+' '+module+' '+moduleID);

            if(index==1 || index==2) {
                var previousElement = model.lastSelected;
                if(model.selectElement(box,module,moduleID)) {
                    box.selected='bg-info';
                    var apiurl=$scope.buildAPIURL($scope.crateModel,$scope.iov);
                    var url=$scope.buildURL($scope.crateModel,$scope.iov);
                    console.log(apiurl);
                    console.log(url);
                    $http.get(apiurl).success(function(data,status,headers,config) {
                        $scope.resetModel(model.child);
                        console.log(JSON.stringify(data));
                        model.child.data=data;
                        $location.path=url;
                    });

                } else {
                    if(previousElement) {
                        previousElement.selected = '';
                        return;
                    }
                }

            }
        };

        $scope.click=function(element,row,model) {
            if(model.child===null) {
                console.log('No children. Just return');
                return;
            }

            if( model.selectElement(row,element,element)) {
                row.selected='bg-info';
            } else {
                row.selected='';
            }
                return;


            if(model.lastSelected) {
                model.lastSelected.selected='';
            }
            model.selected=element;
            model.urlelement=element;
            row.selected='bg-info';
            model.lastSelected=row;
            var apiurl = $scope.buildAPIURL($scope.crateModel,$scope.iov);
            var url=$scope.buildURL($scope.crateModel,$scope.iov);
            console.log(url);
            console.log(apiurl);
            $http.get(apiurl).success(function(data,status,headers,config) {
               $scope.resetModel(model.child);
               model.child.data=data;
               model.child.selected=-1;
               model.child.urlelement=-1;
               model.child.lastSelected=null;
                $location.path=url;
            });

        };

        $scope.resetModel = function(model) {
            if(model===null) {
                return;
            }
            model.data=null;
            model.selected=-1;
            model.urlelement=-1;
            model.lastSelected=null;
            $scope.resetModel(model.child);
        };
    }]);