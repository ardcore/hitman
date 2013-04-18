
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var canvas = document.querySelector("#game-canvas");    
var ctx = canvas.getContext("2d");
var cheight = canvas.height;
var cwidth = canvas.width;

var actors = [];

var marked = null;

var mcanvas = hitman.init( {
    canvas: canvas, 
    continuous: true,
    fixalpha: true
});

var currentHitObject;

window.addEventListener("load", runTest);

var mousePos = {
    x: null,
    y: null
};

canvas.addEventListener("mousemove", function(event) {
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;
}, false);


(function animloop(){
  requestAnimFrame(animloop);
  preformCheck();
})();

function preformCheck() {

    if ( mousePos.x === null || mousePos.y === null) {
        return;
    }

    var bboxes = getCollidingBoundingBoxes(actors, mousePos.x, mousePos.y);

    var object = hitman.getObjectByPos(mousePos.x, mousePos.y, bboxes);
    
    if (marked && object !== marked) {
        marked.testUnmark();
        marked = null;
    }

    if (object && object !== marked) {
        marked = object;
        object.testMark();
    }

    currentHitObject = {
        x: mousePos.x,
        y: mousePos.y
    }
 
};

function runTest() {

    mcanvas.id = "hitmap-canvas";
    document.querySelector("#debug").appendChild(mcanvas);

    var tmp = new Tester(cwidth/2 - 200, cheight/2 - 100, "../_common/images/mario.png");
    var tmp2 = new Tester(cwidth/2 + 100, cheight/2 - 100, "../_common/images/luigi.png");
    var tmp3 = new TesterMove(cwidth/2 - 100, cheight/2 + 100, "../_common/images/xwing.gif");

    hitman.hasher.mark(tmp, true);
    hitman.hasher.mark(tmp2, true);
    hitman.hasher.mark(tmp3, true);

    hitman.addObject(tmp);
    hitman.addObject(tmp2);
    hitman.addObject(tmp3);

    actors.push(tmp);
    actors.push(tmp2);
    actors.push(tmp3);

    var gameloop = function() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < actors.length; i++) {
            actors[i].update();        
            actors[i].render(this.ctx);
        }
        hitman.render();

        if (currentHitObject) {
            ctx.strokeStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(currentHitObject.x, currentHitObject.y, 4, Math.PI*2, false);
            ctx.stroke();
        }

        setTimeout(gameloop, 1000 / 60);  
    }

    gameloop();
}


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