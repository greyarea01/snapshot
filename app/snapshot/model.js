/**
 * Created by hays on 04/04/14.
 */

//
// this factory handles the current model state for the snapshot app
//

var module = angular.module('snapshot-crates');

module.factory('CrateModel', function() {


    var fullModel={};

    var makeModel = function (label, myChild) {
        var myModel;

        myModel = {
            child: null, // child object

            // modify so row index is the URL element
            // means we don't need both anymore
            // get rid of selectedRow and rowIndex
            //selectedRow: -1, // id of selected row
            selectedURLElement: -1, // index of selected element as it appears in the URL
            rowIndex: -1,

            //rowIndex: -1, // index in row values where row id is stored
            // removed this functionality - not needed I think
    //            elementIndices: [], // list of indices that can be used for urlElement selection
            data: null, // data
            processed: false, // flag used to avoid recursion in reset method
            folders: [], // list of folders and IOV information

            showRow: function (values) {
                if (this.selectedURLElement >= 0) { // only works for positive definite URL indices
                    return (values[this.rowIndex] === this.selectedURLElement);
                }
                return true;
            },

            resetModel: function (recurse) {
                this.data = null;
                //this.selectedRow = -1;
                this.selectedURLElement = -1;
                //this.selectedURLIndex = -1;
                this.processed = true; // protection against infinite recursion
                if (recurse && this.child != null && !this.child.processed) {
                    this.child.resetModel(true);
                }
                this.processed = false;

            },

            setChild: function (obj) {
                this.child = obj;
            },

            deselect: function () {
                //this.selectedRow = -1;
                this.selectedURLElement = -1;
                //   this.selectedURLIndex = -1;
                if (this.child) {
                    this.child.resetModel(true);
                }
            },
    //            select: function (row, element, index) {
            select: function(element) {
                //this.selectedRow = row;
                this.selectedURLElement = element;
                //this.selectedURLIndex = index;
            },

            descriptor: function(obj) {
                if( !this.data) {
                    return obj;
                }
                obj.str+=' '+this.name+': ';
                if( this.selectedURLElement >=0) {
                    obj[this.name] = this.selectedURLElement;
                    obj.str+=this.selectedURLElement;
                }  else {
                    obj[this.name] = 'all';
                    obj.str+='all';
                }
                if( this.child) {
                    this.child.descriptor(obj);
                }
                return obj;
            },

            selectElement: function(values) {
                // check for selection or deselection
                // three possiblities:
                //   i) click on same row - deselect row
                //   ii) click on different row - deselect row and select other row
                //  iii) click on row with no row selected - select row

                if( this.selectedURLElement>=0) {
                    // deselection
                    // clicked on selected row?
                    if( this.selectedURLElement === values[this.rowIndex]) {
                        this.deselect();
                        return false;
                    } else {
                        this.deselect();
                        this.select(values[this.rowIndex]);
                        return true;
                    }
                } else {
                    this.select(values[this.rowIndex]);
                   return true;
                }
            },
            copy: function () {

                if (this.processed) {
                    return null;
                }
                var mycopy = {};
    //                mycopy.selectedRow = this.selectedRow;
                mycopy.selectedURLElement = this.selectedURLElement;

      //          mycopy.rowIndex = this.rowIndex;
        //        mycopy.elementIndices = angular.copy(this.elementIndices);

                mycopy.data = angular.copy(this.data);
//            mycopy.lastSelected=this.lastSelected;
                mycopy.folders = null;
                // copy over functions
                mycopy.showRow = this.showRow;
                mycopy.select = this.select;
                mycopy.deselect = this.deselect;

                mycopy.copy = this.copy;
                mycopy.resetModel = this.resetModel;
                mycopy.setChild = this.setChild;
                mycopy.selectElement = this.selectElement;
                mycopy.descriptor = this.descriptor;
                mycopy.processed = false;
                mycopy.name = this.name;
                this.processed = true;
                if (this.child) {
                    mycopy.child = this.child.copy();
                } else {
                    mycopy.child = null;
                }
                this.processed = false;
                return mycopy;
            }


        };

        myModel.name = label;
        if (myChild) {
            myModel.child = myChild;
        }
        return myModel;
    };


    fullModel.chipModel = makeModel("chip",null);
    fullModel.modModel = makeModel("mod", fullModel.chipModel);
    fullModel.murModel = makeModel("mur", fullModel.modModel);
    fullModel.rodModel = makeModel("rod", fullModel.murModel);
    fullModel.crateModel = makeModel("crate", fullModel.rodModel);
    fullModel.crateModel.rowIndex = 0;
    fullModel.rodModel.rowIndex = 1;
    fullModel.murModel.rowIndex = 2;
    fullModel.modModel.rowIndex = 0;
    fullModel.modModel.rowIndex= 1;
    fullModel.chipModel.rowIndex = 0;
    fullModel.iov = 'now';

    fullModel.getList = function () {
        return [
            this.crateModel,
            this.rodModel,
            this.murModel,
            this.modModel,
            this.chipModel
        ];
    };

    fullModel.getAPIURL = function () {
        var url = 'api/crates/' + this.iov + '/';
        var model = this.crateModel;
        var finished = false;
        while (!finished) {
            if (model.selectedRow >= 0) {
                url += model.selectedURLElement + '/';
                model = model.child;
                if (model === null) {
                    finished = true;
                }
            } else {
                url += 'all';
                finished = true;
            }

        }
        return url;
    };

    fullModel.getIndexList = function() {
       var indexList = [this.iov];
       var model = topModel;
        var finished = false;
        while (!finished) {
            if (model.selected >= 0) {
                indexList.push(model.selectedURLElement);
                model = model.child;
                if (model === null) {
                    finished = true;
                }
            } else {
                indexList.push('all');
                finished = true;
            }

        }
        return indexList;
    };

    fullModel.getIndex = function() {
        var index = {
            iov: this.iov,
            crate: 'all',
            rod: null,
            mur: null,
            mod: null,
            chip: null
        };
        index.iov = iov;

        if( this.crateModel.selectedRow <0) {
            return index;
        }

        index.crate = this.crateModel.selectedRow;
        if( this.rodModel.selectedRow < 0) {
            index.rod = 'all';
            return index;
        }
        index.rod = this.rodModel.selectedRow;

        if( this.murModel.selectedRow < 0) {
            index.mur = 'all';
            return index;
        }

        index.mur = this.murmodel.selectedRow;
        if( this.modModel.selectedURLElement < 0) {
            index.mod = 'all';
            return index;
        }

        index.mod = this.modModel.selectedURLElement;

        if( this.chipModel.selectedRow < 0) {
            index.chip = 'all';
            return index;
        }

        index.chip = this.chipModel.selectedRow;
        return index;
    };

    fullModel.getURL = function (iov) {
        var url = '/crates/' + iov + '/';
        var model = topModel;
        var finished = false;
        while (!finished) {
            if (model.selected >= 0) {
                url += model.selectedURLElement + '/';
                model = model.child;
                if (model === null) {
                    finished = true;
                }
            } else {
                url += 'all';
                finished = true;
            }

        }
        return url;
    };

    fullModel.descriptor = function() {
        var obj = {
            str: ''
        };

        return this.crateModel.descriptor(obj);
    };
    return fullModel;

});