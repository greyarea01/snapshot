/**
 * Created by hays on 04/04/14.
 */

// an object to hold the whole model
//
//

var configModel;

configModel = function (label,mychild) {
    var mymodel;

    mymodel = {
        child: null, // child object

        selectedRow: -1, // id of selected row
        selectedURLElement: -1, // index of selected element as it appears in the URL
        selectedURLIndex: -1,

        rowIndex: -1, // index in row values where row id is stored
        elementIndices: [], // list of indices that can be used for urlElement selection
        data: null, // data
        processed: false, // flag used to avoid recursion in reset method
        folders: [], // list of folders and IOV information

        showRow: function(values) {
            if(this.selectedRow>=0) {
                return (values[this.rowIndex] === this.selectedRow);
            }
            return true;
        },

        resetModel: function (recurse) {
            this.data = null;
            this.selectedRow = -1;
            this.selectedURLElement = -1;
            this.selectedURLIndex = -1;
            this.processed = true; // protection against infinite recursion
            if (recurse && this.child != null && !this.child.processed) {
                this.child.resetModel(true);
            }
            this.processed = false;

        },

        setChild: function (obj) {
            this.child = obj;
        },

        deselect : function() {
            this.selectedRow = -1;
            this.selectedURLElement = -1;
            this.selectedURLIndex = -1;
            if( this.child) {
                this.child.resetModel(true);
            }
        },
        select: function(row, element, index) {
            this.selectedRow = row;
            this.selectedURLElement = element;
            this.selectedURLIndex = index;
        },

        selectElement : function(index, values) {
            // first check for selection or deselection
            if(this.elementIndices.length>0) {
                // then we can get values for the URL that aren't the row index
                if( index in this.elementIndices) {
                    // we clicked on one of the allowed boxes
                    if( values[index] === this.selectedURLElement) {
                        // then it's a deselect operation
                        this.deselect();
                        return false;
                    } else {
                        // it's a select operation
                        this.select(values[this.rowIndex],values[index],index);
                        return true;
                    }
                }
            } else {
                if(values[this.rowIndex] === this.selectedRow) {
                    this.deselect();
                    return false;
                } else {
                    this.select(values[this.rowIndex],values[this.rowIndex],this.rowIndex);
                    return true;
                }
            }
        },
        copy: function() {

            if( this.processed) {
                return null;
            }
            var mycopy = {};
            mycopy.selectedRow = this.selectedRow;
            mycopy.selectedURLElement = this.selectedURLElement;

            mycopy.rowIndex = this.rowIndex;
            mycopy.elementIndices = angular.copy(this.elementIndices);

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

            mycopy.processed=false;
            this.processed = true;
            if( this.child) {
                mycopy.child = this.child.copy();
            } else {
                mycopy.child = null;
            }
            this.processed=false;
            return mycopy;
        }


    };

    mymodel.name=label;
    if(mychild) {
        mymodel.child = mychild;
    }
    return mymodel;

};