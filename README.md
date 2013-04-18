# hitman

module providing API for pixel-perfect collision detection using hitmap/color map.

## Examples: 

http://dev.wildcard.pl/hitman/

## Structure

it comes in 3 parts: *hitman.js*, which is the module itself, *hasher.js*, which is a module used to assign unique colors to objects (and can be used separately or replaced by something else), and *colorutils.js* - set of helper function to convert colors between formats, required by both hitman and hasher. they all register to the hitman's namespace.

## API

1. hitman

* __hitman.init__ (options): initialization method. options are passed as an object with following properties:
	- *canvas*: object; reference to _HTMLCanvasElement_
	- *hashprop*: string; property in which your hash is stored (optional; default: *"hash"*)
	- *continuous*: boolean; should be true if you wan't to draw the whole hitmap during render phase, which may be more efficient in some edge cases. (optional; default: *false*)
	- *fixalpha*: boolean; if you're using semi-transparent images, hitmap won't work for these areas until you use this switch. this is, however, expensive operation, so you should avoid it.

	returns hitmap _HTMLCanvasElement_ which may be used for debugging.

* __hitman.addObject__ (object): adds object to hitmap and includes it in future collision checks. the object must fulfill following criteria:
	- must have *hashprop* property (defined during hitman.init)
	- must have *x* and *y* properties (it's assumed that these properties refer to __centre of an object__)
	- must have *width* and *height* properties
	- must have *render* method which accepts *drawing context* as a first parameter

* __hitman.getObjectByPos__ (x, y, objects): finds and returns object in *objects* array colliding with *x* and *y* coordinates.
	- *x*: number; x coordinate against which collision checks should be done
	- *y*: number; y coordinate against which collision checks should be done
	- *objects*: array; collection of objects against which collision checks should be done. the easiest way to provide such collision is to do a collision check agains objects' bounding boxes upfront. see usage and examples for more detail.

* __hitman.getObjectByHash__ (hash): returns object from color map based on it's *hashprop* value;
	- *hash*: string

* __hitman.purge__ (): purges the color map

* __hitman.render__ (): renders the hitmap if in *continuous* mode. does nothing in normal mode.

2. hasher

* __hitman.hasher.mark__ (object, hsl, hashprop): decorates object with *hashprop* property containing unique color in HEX format (ff0000, 00ab3f etc)
	- *object*: object; victim that should be decorated
	- *hsl*: boolean; if true, HSL will be used instead of RGB to generate unique colors (smaller pool, but bigger difference between colors = easier to debug). you should never mix HSL and RGB. (optional; default: false)
	- *hashprop*: string; property in which hash should be kept. (optional; default: "hash")

	returns modified *object*.

* __hitman.hasher.reset__ (): resets the color pool, starts color generation anew

## Usage

Sample usage:

	// create basic data structure for objects
	var actors = [];

	// init hitman with canvas element, in normal mode, with default hash property
	hitman.init( {
	    canvas: canvas
	});

	// create an object (fulfiling the interface: x, y, width, height, render
    var tmp = new Tester(x, y, img);

    // use hasher to assing unique color to this object. use HSL for bigger difference between colors
    hasher.mark(tmp, true);

    // add prepared object to hitmap, enabling future collision checks for it
    hitman.addObject(tmp);

    // add object to data structure
    actors.push(tmp);

    // get a list of objects' bounding boxes colliding with x and y from data structure
    var bboxes = getCollidingBoundingBoxes(actors, x, x);

    // get object colliding with x and y from list of bounding boxes
    var object = hitman.getObjectByPos(x, y, bboxes);

    // getCollidingBoundingBoxes is not a part of hitman, it's a helper function which I use in examples:
    function getCollidingBoundingBoxes(array, x, y) {
	    var results = [];
	    var el;
	    for (var i = 0; i < array.length; i++) {
	        el = array[i];
	        if (x > el.x - el.width/2 && y > el.y - el.height/2 && x < el.x + el.width/2 && y < el.y + el.height/2) {
	            results.push(el);
	        }
	    }
	    return results;
	}

Please see examples to find more info.

## Tips

 * while HSL mode is easier to debug, it provides only ~360 colors, so you won't be able to handle more than 360 objects at the same time, and you will need call *hasher.reset()* from time to time to avoid hash collisions.
RGB mode doesn't have this problems and it should be used for production.

 * keep your eye on memory usage. you should use *hitman.removeObject* or *hitman.purge* when possible.

 * remember that *x* and *y* properites should refer to the **centre of your object**!

