
var canvas = document.querySelector("#game-canvas");    
var ctx = canvas.getContext("2d");
var cheight = canvas.height;
var cwidth = canvas.width;

var actors = [];

var marked = null;

var mcanvas = hitman.init( {
    canvas: canvas
});

var currentHitObject;

window.addEventListener("load", runTest);

canvas.addEventListener("mousemove", function(event) {
    var bboxes = getCollidingBoundingBoxes(actors, event.clientX, event.clientY);
    var object = hitman.getObjectByPos(event.clientX, event.clientY, bboxes);

    if (marked && object !== marked) {
        marked.testUnmark();
        marked = null;
    }

    if (object && object !== marked) {
        marked = object;
        object.testMark();
    }

    currentHitObject = {
        x: event.clientX,
        y: event.clientY
    }


}, false);

function runTest() {

    mcanvas.id = "hitmap-canvas";
    document.querySelector("#debug").appendChild(mcanvas);

    for (var i = 0; i < 100; i++) {
        var x = Math.random()*cwidth;
        var y = Math.random()*cheight;
        var color = '#'+Math.floor(Math.random()*16777215).toString(16);

        var tmp = new TesterPrimitive(x, y, color);
        hitman.hasher.mark(tmp, true);
        hitman.addObject(tmp);
        actors.push(tmp);

    }

    var gameloop = function() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < actors.length; i++) {
            actors[i].update();        
            actors[i].render(this.ctx);
        }

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
        if (x > el.x - el.width/2 && y > el.y - el.height/2 && 
            x < el.x + el.width/2 && y < el.y + el.height/2) {
            results.push(el);
        }
    }
    return results;
}