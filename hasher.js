hitman.hasher = (function(window, undefined) {

    var iterator = 1;
    var hashlength = 6;
    var prefix = "";
    
    var light = 0.5;

    /**
     * Generate next unique hash in RGB mode.
     * @return {String} hash in hex format
     */

    function genNextRGB() {
        var hashpart = (iterator += 10).toString(16);
        var hashrest = hashlength - hashpart.length;
        var dummy = "";
        for (var i = 0; i < hashrest; i++) {
            dummy = dummy + "0";
        };
        return (prefix + dummy + hashpart);
    };

    /**
     * Generate next unique hash in HSL mode.
     * @return {String} hash in hex format
     */

    function genNextHSL() {
        var step = 17;
        var hslFraction = hitman.colorUtils.angleToFraction(iterator += step);
        var sat = 0.3 + Math.random() * 0.3;
        var color = hitman.colorUtils.hslToRgb( hslFraction, sat, light );
        var hash = hitman.colorUtils.rgbToHex.apply( null, color );
        return hash;
    };

    return {

        /**
         * Decorate object with unique hash.
         * @param {Object} object to be decorated
         * @param {Boolean} switch between HSL and RGB modes (default: RGB)
         * @param {String} property which should keep hash value (default: "hash")
         */

        mark: function(object, hsl, prop) {
            prop = prop || "hash";
            object[prop] = (hsl == true) ? genNextHSL() : genNextRGB();
        },

        /**
         * Resets the color pool.
         */

        reset: function() {
            iterator = 1;
        }
    }
    
}(this));