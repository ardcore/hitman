var hitman = (function(window, undefined) {
    
    var map = {};
    var mcanvas;
    var mctx;
    var hashprop;
    var fixalpha;
    var continuous = false;

    /** 
     * Create buffer in `continuous` mode.
     * @param {Object} object for which the buffer is created
     * @return {Object} new buffer
     */

    function generateBufferContinuous(object) {

        var buff = document.createElement("canvas");
        var bctx, bwidth, bheight;

        bwidth = buff.width = object.width;
        bheight = buff.height = object.height;

        bctx = buff.getContext('2d');

        bctx.translate( object.width/2 - object.x, 
                        object.height/2 - object.y );

        object.render( bctx );

        bctx.translate( -(object.width/2 - object.x), 
                        -(object.height/2 - object.y) );

        if (fixalpha) fixSemiTransparency(buff, bctx, bwidth, bheight);

        bctx.globalCompositeOperation = 'source-in';
        bctx.fillStyle = "#" + object[hashprop];
        bctx.globalAlpha = 1;
        bctx.fillRect(0, 0, bwidth, bheight);

        return buff;
    };

    /** 
     * Create buffer in `rapid` (normal) mode.
     * @param {Array} list of objects for which the buffer is created
     * @param {Number} total width of buffer
     * @param {Number} total height of buffer
     * @param {Number} offsetX by which drawing should be translated
     * @param {Number} offsetY by which drawing should be translated
     * @return {Object} new buffer
     */

    function generateBufferRapid(objects, width, height, offsetX, offsetY) {

        var buff = mcanvas;
        var bctx = buff.getContext('2d');
        var bwidth, bheight, twidth, theight;

        bwidth = buff.width = width;
        bheight = buff.height = height;
        
        var tmpbuffer = document.createElement("canvas");
        var tmpctx = tmpbuffer.getContext('2d');

        for (var i = 0; i < objects.length; i++) {

            twidth = tmpbuffer.width = objects[i].width;
            theight = tmpbuffer.height = objects[i].height;

            tmpctx.translate( objects[i].width/2 - objects[i].x, 
                              objects[i].height/2 - objects[i].y );

            objects[i].render( tmpctx );

            tmpctx.translate( -(objects[i].width/2 - objects[i].x), 
                              -(objects[i].height/2 - objects[i].y) );
            
            if (fixalpha) {
                fixSemiTransparency(tmpbuffer, tmpctx, twidth, theight);
            };

            tmpctx.globalCompositeOperation = 'source-in';
            tmpctx.fillStyle = "#" + objects[i][hashprop];
            tmpctx.globalAlpha = 1;
            tmpctx.fillRect(0, 0, twidth, theight);

            bctx.drawImage( tmpbuffer, 
                            objects[i].x - objects[i].width/2 - offsetX, 
                            objects[i].y - objects[i].height/2 - offsetY );

            tmpctx.clearRect(0, 0, twidth, theight);  

        };
        return buff;
    };

     /** 
     * Add object to hitmap in `continuous` mode
     * @param {Object} object to be added
     */    

    function addObjectContinuous(object) {

        if (!interfaceIsCorrect(object)) {
            console.log(object);
            throw new Error("Tried to add invalid object.");
        };

        if (map[ object[hashprop] ]) {
            throw new Error("Hash already exists!");
        };

        var buffer = generateBufferContinuous(object);

        map[ object[hashprop] ] = {
            ref: object,
            buffer: buffer
        };
    };
     
     /** 
     * Add object to hitmap in `rapid` (normal) mode
     * @param {Object} object to be added
     */

    function addObjectRapid(object) {

        if (!interfaceIsCorrect(object)) {
            console.log(object);
            throw new Error("Tried to add invalid object.");
        };

        if (map[ object[hashprop] ]) {
            throw new Error("Hash already exists!");
        };

    };

     /** 
     * Get object from the map based on position in `continuous` mode
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     * @return {Object} object on given position
     */

    function getObjectByPosContinuous(x, y) {

        var p = mctx.getImageData(x, y, 1, 1).data;
        var hex = hitman.colorUtils.rgbToHex(p[0], p[1], p[2]);
    
        if (map[hex]) return map[hex].ref;
    
    };

     /** 
     * Get object from the map based on position in `rapid` (normal) mode
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     * @return {Object} object on given position
     */

    function getObjectByPosRapid(x, y, objects) {

        var map = {};
        var offset = [0,0];

        var minX, minY, maxX, maxY;

        minX = minY = Infinity;
        maxX = maxY = -Infinity;

        var tmpX, tmpY;

        for (var i = 0; i < objects.length; i++) {

            if (map[ objects[i][hashprop] ]) {
                throw new Error("Hash already exists!");
            };

            map[ objects[i][hashprop] ] = {
                ref: objects[i]
            };

            tmpX = objects[i].x - objects[i].width/2;
            tmpY = objects[i].y - objects[i].height/2;

            if (tmpX < minX) {
                minX = tmpX
            };

            if (tmpY < minY) {
                minY = tmpY
            };

            tmpX = objects[i].x + objects[i].width/2;
            tmpY = objects[i].y + objects[i].height/2;

            if (tmpX > maxX) {
                maxX = tmpX
            };

            if (tmpY > maxY) {
                maxY = tmpY
            };

        }

        if (!isFinite(minX) || !isFinite(minY)) return false;

        var buff = generateBufferRapid(objects, 
                                       maxX - minX, 
                                       maxY - minY, 
                                       minX, minY);

        var pixel = buff.getContext('2d').getImageData(x - minX, y - minY, 1, 1);
        var data = pixel.data;

        var hex = hitman.colorUtils.rgbToHex(data[0], data[1], data[2]);

        if (map[hex]) return map[hex].ref;
    }

     /** 
     * Render the whole buffer in continuous mode
     */

    function renderContinuous() {

        mctx.clearRect(0, 0, mcanvas.width, mcanvas.height );

        for (var el in map) {
            mctx.drawImage( map[el].buffer, 
                            map[el].ref.x - map[el].ref.width/2, 
                            map[el].ref.y - map[el].ref.height/2 );
        };
    };

     /** 
     * Render the whole buffer in continuous mode
     */

    function renderRapid() {};

    /*
     * Remove semi-transparency from canvas object.
     * @param {Object} canvas element
     * @param {Object} context related to canvas
     * @param {Number} width of canvas
     * @param {Number} height of canvas
     */

    function fixSemiTransparency(canvas, context, width, height) {

        width = width || canvas.width;
        height = height || canvas.height;

        var imageData = context.getImageData(0, 0, width, height);
        var data = imageData.data;

        for (var j = -1; j < data.length; j = j + 4) {
            if (data[j] > 0 && data[j] < 255) data[j] = 255;
        };

        imageData.data = data;
        context.putImageData(imageData, 0, 0);
    };

    /**
     * Checks if interface of object fulfills our needs.
     * @param {Object} object to be checked
     * @return {Boolean} result of a check
     */
     
    function interfaceIsCorrect(object) {
        return (object[hashprop] &&
                typeof object.x == "number" ||
                typeof object.y == "number" ||
                typeof object.width == "number" ||
                typeof object.height == "number" &&
                (!continuous || typeof object.render == "function"));
    };

    return {

        /** 
         * Initialization method
         * @param {Object} options with following properties:
         *  - canvas {HTMLCanvasElement} element to which hitman should attach
         *  - hashprop {String} name of a property in which unique hash 
         *    is stored (default: "hash")
         *  - continuous {Boolean} switch between `rapid` (normal) and 
         *    continuous modes (default: false)
         *  - fixalpha {Boolean} if you have to use semi-transparent graphics, 
         *    set it to true (default: false)
         *
         * @api public
         */

        init: function(options) {

            hashprop = options.hashprop || "hash";
            mcanvas = document.createElement("canvas");
            fixalpha = options.fixalpha || false;
            mctx = mcanvas.getContext('2d');

            if (options.continuous) {
                continuous = true;
                mcanvas.width = options.canvas.width;
                mcanvas.height = options.canvas.height;
                this.render = renderContinuous;
                this.getObjectByPos = getObjectByPosContinuous;
                this.addObject = addObjectContinuous;
                
            } else {
                this.render = renderRapid;
                this.getObjectByPos = getObjectByPosRapid;
                this.addObject = addObjectRapid;
                
            };

            return mcanvas;
        },
        
        /** 
         * Remove object from hitmap
         * @param {Object} object to be removed
         * @api public
         */

        removeObject: function(object) {

            if (!object[hashprop]) {
                throw new Error("Tried to remove invalid object")
            };

            delete map[ object[hashprop] ];
        },

        /** 
         * Get object from hitmap by hash property value
         * @param {String} hash property value
         * @return {Object} matching object
         * @api public
         */

        getObjectByHash: function(hash) {

            return map[hash];
        },

        /** 
         * Clear the hitmap
         * @api public
         */

        purge: function() {
            map = {};
        },

        /** 
         * Add object to hitmap
         * Overwritten during init by addObjectRapid or addObjectContinuous
         * @api public
         */

        addObject: function() {},

        /** 
         * Get object from hitmap by coordinates
         * @param {Number} x coordinate
         * @param {Number} y coordinate
         * @param {Array} objects collection to be used in rapid mode
         * Overwritten during init by getObjectByPosRapid or 
         * getObjectByPosContinuous
         * @api public
         */

        getObjectByPos: function(x, y, objects) {}, // mutated by init

        /**
         * Render the whole hitmap buffer. Used only in `continuous` mode.
         * Overwritten during init by renderContinuous or renderRapid functions
         * @api public
         */

        render: function() {} // mutated by init        

    }

}(this))
