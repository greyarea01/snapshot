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

        selectElement: function(obj,element,urlElement) {
            if( urlElement === this.selectedURLElement) { // unselect
                this.selectedElement = -1;
                this.selectedURLElement = -1;
                this.lastSelected=null;
                if( this.child != null ) {
                    this.child.resetModel(true);
                }
                return false;
            } else {
                this.selectedElement = element;
                this.selectedURLElement = urlElement;
                this.lastSelected = obj;
                return true;
            }
        },

        clone: function() {
            if( this.processed) {
                return null;
            }
            var myclone = Object.create(this.prototype);
            myclone.selectedElement = this.selectedElement;
            myclone.selectedURLElement = this.selectedURLElement;
            myclone.data = JSON.parse(JSON.stringify(this.data));
            myclone.lastSelected=this.lastSelected;
            myclone.folders = JSON.parse(JSON.stringify(this.folders));
            myclone.isShown = this.isShown;
            myclone.clone = this.clone;
            myclone.resetModel = this.resetModel;
            myclone.setChild = this.setChild;
            myclone.selectElement = this.selectElement;

            myclone.processed=true;
            myclone.child = this.child.clone();
            myclone.processed=false;
            return myclone;
        }


    };

    mymodel.name=label;
    if(mychild) {
        mymodel.child = mychild;
    }
    return mymodel;

};