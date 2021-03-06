/*

    Curvy: A non-linear styling extension.
    
*/


// Creating Curvy object
var Curvy = {
    INFO: { VERSION: 0.03, STABLE: false, USABLE: true },
    private: { opts: {}, objs: {}, math: {}, size : {} }, //for methods that shouldn't be accessed outside of this js file.
    get: {}, //for getting things.
    set: {}, //for setting options
    manager: {} //for routine managing functions to be used outside the the Curvy.js file.
};


//OPTIONS 
//Sets logging
Curvy.private.opts.logging = true;


//BASIC FUNCTIONS: Basic setup methods. 

Curvy.private.init = function() {
    
    //Gets all elements containing Curvy Attributes
    Curvy.private.consoleOut("Finding Curvy things...");
    Curvy.private.objs.allCwidth = Curvy.get.allCElements("curvy-width");
    Curvy.private.objs.allCheight = Curvy.get.allCElements("curvy-height");
    Curvy.private.objs.allCtop = Curvy.get.allCElements("curvy-top");
    Curvy.private.objs.allCbottom = Curvy.get.allCElements("curvy-bottom");
    Curvy.private.objs.allCleft = Curvy.get.allCElements("curvy-left");
    Curvy.private.objs.allCright = Curvy.get.allCElements("curvy-right");
    
    
    //Init Curvy curves 
    Curvy.private.objs.curves = [];
    
};

//function for logging and errors
Curvy.private.consoleOut = function(mess) {
      if(Curvy.private.opts.logging)
          console.log("CURVY: " + mess);
};

//init load function
Curvy.private.load = function() {
    var i;
    
    Curvy.private.init(); 
    Curvy.private.consoleOut("Initialized Variables...");
    
    //Function to process Curves
    Curvy.private.process();
    
    Curvy.private.consoleOut("Adding event handlers...");
    
    //resizing call
    window.addEventListener('resize', Curvy.private.size.onResize);
    
    
    Curvy.private.consoleOut("Loaded...");
};

//Where all tags are processed, may be recalled 
Curvy.private.process = function() {
    
    Curvy.private.consoleOut("Processing Curves...");
    
    Curvy.private.processAllOfType(Curvy.private.objs.allCwidth);
    Curvy.private.processAllOfType(Curvy.private.objs.allCheight);
    Curvy.private.processAllOfType(Curvy.private.objs.allCtop);
    Curvy.private.processAllOfType(Curvy.private.objs.allCbottom);
    Curvy.private.processAllOfType(Curvy.private.objs.allCleft);
    Curvy.private.processAllOfType(Curvy.private.objs.allCright);
    
};


Curvy.private.processAllOfType = function(basicObj){
    var i;
    
    for(i=0; i<basicObj.length; i++)
        Curvy.private.objs.curves.push(
            Curvy.private.processCurvyTag(
            basicObj[i].element,
            basicObj[i].curvyAttr
        ));
};

//Used when a Curve Style is added or removed after the initial Load
Curvy.manager.reLoad = function() {
    Curvy.private.consoleOut("Reloading Curvy...");
    
    Curvy.private.init();
    Curvy.private.process();
    
    Curvy.private.consoleOut("Curvy Reloaded...");
};

//If browsing window has not changed then use this function to recalculate curves when needed
Curvy.manager.forceResize = function() {
    Curvy.private.size.onResize();
};


//Adds curve by class
Curvy.set.newCurve = function(value) {
    Curvy.private.parseCurve(value);
};

//takes a value of "class tag curvetype px % px %"
Curvy.private.parseCurve = function(value) {
    var vo = {};
    var cos = {};
    var htmlObjs = [];
    var atts = [];
    var clss = "";
    var tag = "";
    var crv = "";
    var i;
    
    atts = value.split(' ');
    
    clss = atts[0];
    tag = atts[1];
    
    i=2;
    while(i<atts.length) {
        crv += atts[i].replace(/ */g,"") + " ";
        i++;
    }
    
    vo = Curvy.private.processCurvyAttr(crv);
    
    htmlObjs = Curvy.get.allCElementsOfClass(clss);
    
    switch(vo.type) {
        case "default": cos = Curvy.get.defaultCos(vo.x1, vo.y1, vo.x2, vo.y2);
            break;
        case "linear": cos = Curvy.get.linearCos(vo.x1, vo.y1, vo.x2, vo.y2);
            break;
        case "tanh": cos = Curvy.get.tanhCos(vo.x1, vo.y1, vo.x2, vo.y2);
            break;
        default: Curvy.private.consoleOut("ERROR: " + vo.type + " is not a valid curve...");
    }
    
    
    i=0;
    while(i<htmlObjs.length) {
        Curvy.private.objs.curves.push(new CurvyObj(vo.type, tag, htmlObjs[i], cos, vo.mode));
        Curvy.private.consoleOut(vo.type + " curve added using class " + clss);
        i++
    }
    
    Curvy.private.size.onResize();
    
};

//END BASIC FUNCTIONS


//START CURVE PROCESSING FUNCTIONS 

//CurvyObj Def
function CurvyObj(type, attr, element, icos, mode) {
    this.type = type;
    this.attribute = attr;
    this.element = element;
    this.icos = icos;
    this.mode = mode;
}

//on htmlObj resize 
Curvy.private.size.Resize = function(curvyObj) { 
    
    switch(curvyObj.attribute) {
        case "data-curvy-width":
        case "curvy-width": Curvy.private.size.width(curvyObj);
            break;
        case "data-curvy-height":
        case "curvy-height": Curvy.private.size.height(curvyObj);
            break;
        case "data-curvy-top":
        case "curvy-top": Curvy.private.size.top(curvyObj);
            break;
        case "data-curvy-bottom":
        case "curvy-bottom": Curvy.private.size.bottom(curvyObj);
            break;
        case "data-curvy-left":
        case "curvy-left": Curvy.private.size.left(curvyObj);
            break;
        case "data-curvy-right":
        case "curvy-right": Curvy.private.size.right(curvyObj);
        default: 
    }
    
};

//loops through all known curvyObjs and resizes
Curvy.private.size.onResize = function() {
    var i;
    
    for(i=0; i<Curvy.private.objs.curves.length; i++)
        Curvy.private.size.Resize(Curvy.private.objs.curves[i]);
    
};

//process curvy tag
Curvy.private.processCurvyTag = function(htmlObj, attrName) {
    var vo = Curvy.private.processCurvyAttr(htmlObj.getAttribute(attrName));
    
    //new object to use for tag resize this will probaly be the standard obj
    var curvyObj = new CurvyObj(vo.type, attrName, htmlObj, {}, vo.mode);
    
    var cos = {};
    
    
    switch(vo.type) {
        case "default": cos = Curvy.get.defaultCos(vo.x1, vo.y1, vo.x2, vo.y2);
            break;
        case "linear": cos = Curvy.get.linearCos(vo.x1, vo.y1, vo.x2, vo.y2);
            break;
        case "tanh": cos = Curvy.get.tanhCos(vo.x1, vo.y1, vo.x2, vo.y2);
            break;
        default: Curvy.private.consoleOut("ERROR: " + vo.type + " is not a valid curve...");
            return null;
    }
    
    curvyObj.icos = cos;
    
    Curvy.private.size.Resize(curvyObj);
    
    Curvy.private.consoleOut(curvyObj.type + " curve added using " + curvyObj.attribute + " attribute");
    
    return curvyObj;
};


//process default curvy value
Curvy.private.processCurvyAttr = function(attrValue) {
    
    var temp;
    
    var valueObject = {
        type: "",
        mode: 0,
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0
    };
    
    var atts = [];
    
    
    atts = attrValue.split(' ');
    
    //error checking, if atts is not 5 then error NEEDS MORE ERROR CHECKING!!! 
    if(atts.length >= 5) {
        valueObject.type = atts[0];
        
        if(atts[1].search(/:/i) > 0 || atts[3].search(/:/i) > 0) {
            //if screen res 
            valueObject.y1 = Number(atts[2].replace(/%/i, ""));
            valueObject.y2 = Number(atts[4].replace(/%/i, ""));
            
            
            temp = atts[1].split(':');
            
            valueObject.x1 = Number(temp[0])/Number(temp[1]);
            
            temp = atts[3].split(':');
            
            valueObject.x2 = Number(temp[0])/Number(temp[1]);

            valueObject.mode = 1;
            
            
        } else {
            valueObject.x1 = Number(atts[1].replace(/px/i, ""));
            valueObject.y1 = Number(atts[2].replace(/%/i, ""));
            valueObject.x2 = Number(atts[3].replace(/px/i, ""));
            valueObject.y2 = Number(atts[4].replace(/%/i, ""));
        }
    } else 
        Curvy.private.consoleOut("ERROR: Invalid Curvy Value");
        
    
    return valueObject;
    
};


//END CURVE PROCESSING FUNCTIONS


//START DEFAULT SIZING TOOLS

//default linear styling 
//returns size in percentage based on positioning in css
Curvy.private.size.linear = function(curvyObj, fixedX, normalX) {
    var y = 0; 
    
    if(getComputedStyle(curvyObj.element).position == "fixed")
        y = curvyObj.icos.a*fixedX + curvyObj.icos.b;
    else
        y = curvyObj.icos.a*normalX + curvyObj.icos.b;
    
    return y + "%";
};

//default sizing for default
Curvy.private.size.default = function(curvyObj, fixedX, normalX) {
    var y = 0; 
    if(getComputedStyle(curvyObj.element).position == "fixed") 
        y = curvyObj.icos.a*Math.pow(fixedX, -1) + curvyObj.icos.b; 
    else  
        y = curvyObj.icos.a*Math.pow(normalX, -1) + curvyObj.icos.b;
        
    
    return "" + y + "%";
};

//default sizing for tan
Curvy.private.size.tanh = function(curvyObj, fixedX, normalX) {
    var y = 0;
    if(getComputedStyle(curvyObj.element).position == "fixed")
        y = curvyObj.icos.a*Math.tanh(
            curvyObj.icos.c*fixedX + curvyObj.icos.d
        ) + curvyObj.icos.b;
    else 
        y = curvyObj.icos.a*Math.tanh(
            curvyObj.icos.c*normalX + curvyObj.icos.d
        ) + curvyObj.icos.b;
    
    return y + "%";
};


//END DEFAULT SIZING TOOLS

//START CONTROLLER HELPERS

Curvy.get.parentElementRatio = function(element) {
    return (element.parentElement.offsetWidth/element.parentElement.offsetHeight);  
};

Curvy.get.windowRatio = function(element) {
    return (window.innerWidth/window.innerHeight);  
};

//fixedSize and otherSize are the sizes Curvy uses when element is in either fixed or other positioning
Curvy.private.size.computeStyle = function(curvyObj, fixedSize, otherSize) {
    var finalStyle;
    
    if(curvyObj.mode == 0)
        switch(curvyObj.type) {
            case "default": finalStyle = Curvy.private.size.default(
                curvyObj,
                fixedSize,
                otherSize
            );
                break;
            case "linear": finalStyle = Curvy.private.size.linear(
                curvyObj,
                fixedSize,
                otherSize
            );
                break;
            case "tanh": finalStyle = Curvy.private.size.tanh(
                curvyObj,
                fixedSize,
                otherSize
            ); 
                break;
            default: Curvy.private.consoleOut("ERROR: in private.size.computeStyle");
        }    
    else if(curvyObj.mode == 1) {
        switch(curvyObj.type) {
            case "default": finalStyle = Curvy.private.size.default(
                curvyObj,
                Curvy.get.windowRatio(),
                Curvy.get.parentElementRatio(curvyObj.element)
            );
                break;
            case "linear": finalStyle = Curvy.private.size.linear(
                curvyObj,
                Curvy.get.windowRatio(),
                Curvy.get.parentElementRatio(curvyObj.element)
            );
                break;
            case "tanh": finalStyle = Curvy.private.size.tanh(
                curvyObj,
                Curvy.get.windowRatio(),
                Curvy.get.parentElementRatio(curvyObj.element)
            ); 
                break;
            default: Curvy.private.consoleOut("ERROR: in private.size.computeStyle");
        }    
    }
    
    return finalStyle;
    
} ;


//END CONTROLLER HELPERS

//START CONTROLLERS

//WIDTH CONTROLLER: CONTROLS WHAT CURVES ARE SUPORTED BY EACH TAG.
Curvy.private.size.width = function(curvyObj) {    
    
    curvyObj.element.style.width = Curvy.private.size.computeStyle(
        curvyObj, 
        window.innerWidth, 
        curvyObj.element.parentElement.offsetWidth
    );
};

//HEIGHT CONTROLLER: SHOULD SUPPORT ALL TAGS
Curvy.private.size.height = function(curvyObj) {
     
    curvyObj.element.style.height = Curvy.private.size.computeStyle(
        curvyObj, 
        window.innerHeight, 
        curvyObj.element.parentElement.offsetHeight
    );
};

//TOP CONTROLLER
Curvy.private.size.top = function(curvyObj) {
    
    curvyObj.element.style.top = Curvy.private.size.computeStyle(
        curvyObj, 
        window.innerHeight, 
        curvyObj.element.parentElement.offsetHeight
    );
};

//BOTTOM CONTROLLER
Curvy.private.size.bottom = function(curvyObj) {
    
    curvyObj.element.style.bottom = Curvy.private.size.computeStyle(
        curvyObj, 
        window.innerHeight, 
        curvyObj.element.parentElement.offsetHeight
    );
};

//LEFT CONTROLLER
Curvy.private.size.left = function(curvyObj) {
    
    curvyObj.element.style.left = Curvy.private.size.computeStyle(
        curvyObj, 
        window.innerWidth, 
        curvyObj.element.parentElement.offsetWidth
    );
};

//RIGHT CONTROLLER
Curvy.private.size.right = function(curvyObj) {
  
    curvyObj.element.style.right = Curvy.private.size.computeStyle(
        curvyObj, 
        window.innerWidth, 
        curvyObj.element.parentElement.offsetWidth
    );
};

//END CONTROLLERS

//gets all elements with a specified Curvy attribute and returns an element/type structure/object. 
Curvy.get.allCElements = function(type) {
    var i = 0;
    
    var all = document.getElementsByTagName('*');
    var allCElements = [];
    
    
    var appendedType = "data-" + type;
    
    /* 
        If/else adds support for non html complient tags. While not recommended it makes
        prototypeing easier. Returns an object so that multiple curvy attributes of the same element can be processed 
    */
    
    for(i=0; i<all.length; i++) {
        if(all[i].getAttribute(type) != null) { 
            allCElements.push({
                element: all[i],
                curvyAttr: type
            });
        } else if(all[i].getAttribute(appendedType) != null) {
            allCElements.push({
                element: all[i],
                curvyAttr: appendedType
            });
        }
    }
            
    return allCElements;
};

//gets all elements of class type
Curvy.get.allCElementsOfClass = function(type) {
    return document.getElementsByClassName(type);
};

//MATH FUNCTIONS

//gets inverse of two by two matrix
Curvy.private.math.getMatrixInverse22 = function(matrix) {
    var i;
    var det;
    var invmatrix = [0,0,0,0];
    
    
    if(matrix.length == 4) {
        
        //checks to see if matrix is invertable
        det = Math.pow(matrix[0]*matrix[3]-matrix[1]*matrix[2], -1);
        
        if(det != 0) {
            
            invmatrix[0] = matrix[3];
            invmatrix[1] = -matrix[1];
            invmatrix[2] = -matrix[2];
            invmatrix[3] = matrix[0];
            
            for(i=0; i < matrix.length; i++)
                invmatrix[i] *= det; 
                
        }
    }
    
    //alert(invmatrix[0]);
    
    return  invmatrix;
};


//COS or coefficient Functions 

//gets default coefficients for default curve
Curvy.get.defaultCos = function(x1, y1, x2, y2) {
    //returned vector
    var vec = {
        a: 0,
        b: 0
    };
    
    var matrix = [(1/x1), 1, (1/x2), 1];
    
    matrix = Curvy.private.math.getMatrixInverse22(matrix);
    
    vec.a = y1*matrix[0] + y2*matrix[1];
    vec.b = y1*matrix[2] + y2*matrix[3];
    
    return vec;
};

//get defaule coefficients for linear curve 
Curvy.get.linearCos = function(x1, y1, x2, y2) {
    //returned vector
    var vec = {
        a: 0,
        b: 0
    };
    
    var matrix = [x1, 1, x2, 1];
    
    matrix = Curvy.private.math.getMatrixInverse22(matrix);
    
    vec.a = y1*matrix[0] + y2*matrix[1];
    vec.b = y1*matrix[2] + y2*matrix[3];
    
    return vec;
};

//get tanh coefficients
Curvy.get.tanhCos = function(x1, y1, x2, y2) {
 
    var vec = {
        a: 0,
        b: 0,
        c: 0,
        d: 0
    };
    
    //Values of the inverse matrix is already known for tahn as long as | x1 && x2 | > 2
    var tanhMatrix = [-1, 1, 1, 1];
    //HOWEVER there is a chance the values could be very small so...
    //X1 gets to be the approximate asymtope at the negitive end 
    
    //tanhMatrix = [-Math.tanh(x1), 1, Math.tanh(x2), 1];
    
    tanhMatrix = Curvy.private.math.getMatrixInverse22(tanhMatrix);
    
    vec.a = y1*tanhMatrix[0] + y2*tanhMatrix[1];
    vec.b = y1*tanhMatrix[2] + y2*tanhMatrix[3];
    
    //The first variables will find a tanh funciton that places approx assymtopes at 
    //y1 and y2 now a function is needed to map (x1, x2) to (-2, 2)
    var linVec = Curvy.get.linearCos(x1, -2, x2, 2);
    
    vec.c = linVec.a;
    vec.d = linVec.b;
    
    return vec;
};

//End Cos functions

window.addEventListener('load', Curvy.private.load);
