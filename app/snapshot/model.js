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
        selectedElement: -1, // index of selected element
        selectedURLElement: -1, // index of selected element as it appears in the URL
        selectedElementIndex: -1,
        lastSelected: null, // object that was selected
        data: null, // data
        processed: false, // flag used to avoid recursion in reset method
        folders: [], // list of folders and IOV information

        isShown: function (element) {
            if (this.selectedElement >= 0) {
                return (element===this.selectedElement);
            }
            return true;
        },

        resetModel: function (recurse) {
            this.data = null;
            this.selectedElement = -1;
            this.selectedURLElement = -1;
            this.selectedElementIndex = -1;
            this.lastSelected = null;
            this.processed = true; // protection against infinite recursion
            if (recurse && this.child != null && !this.child.processed) {
                this.child.resetModel(true);
            }
            this.processed = false;

        },

        setChild: function (obj) {
            this.child = obj;
        },

        selectElement: function(obj,element,urlElement, index) {
            if( urlElement === this.selectedURLElement) { // unselect
                this.selectedElement = -1;
                this.selectedURLElement = -1;
                this.selectedElementIndex = -1;
                this.lastSelected=null;
                if( this.child != null ) {
                    this.child.resetModel(true);
                }
                return false;
            } else {
                this.selectedElement = element;
                this.selectedURLElement = urlElement;
                this.lastSelected = obj;
                this.selectedElementIndex = index;
                return true;
            }
        },

        copy: function() {

            if( this.processed) {
                return null;
            }
            var mycopy = {};
            mycopy.selectedElement = this.selectedElement;
            mycopy.selectedURLElement = this.selectedURLElement;
            mycopy.selectedElementIndex = this.selectedIndex;
            mycopy.data = angular.copy(this.data);
//            mycopy.lastSelected=this.lastSelected;
            mycopy.lastSelected=null;
            mycopy.folders = null;
            // copy over functions
            mycopy.isShown = this.isShown;
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