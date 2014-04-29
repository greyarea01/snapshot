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
            if (selectedElement >= 0) {
                return (element===selectedElement);
            }
            return true;
        },

        resetModel: function (recurse) {
            data = null;
            selectedElement = -1;
            selectedURLElement = -1;
            lastSelected = null;
            processed = true; // protection against infinite recursion
            if (recurse && child != null && !child.processed) {
                child.resetModel(true);
            }
            processed = false;

        },

        setChild: function (obj) {
            child = obj;
        },

        selectElement: function(obj,element,urlElement) {
            if( element === selectedElement) { // unselect
                selectedElement = -1;
                urlElement = -1;
                lastSelected=null;
                if( child != null ) {
                    child.resetModel(true);
                }
                return false;
            } else {
                selectedElement = element;
                selectedURLElement = urlElement;
                lastSelected = obj;
                return true;
            }
        }


    };

    mymodel.name=label;
    if(mychild) {
        mymodel.child = mychild;
    }
    return mymodel;

};