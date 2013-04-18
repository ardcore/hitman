function TesterMove(x, y, image) {
    this.x = x || 10;
    this.y = y || 10;
    this.rotx = this.x + 40;
    this.roty = this.y + 40;
    this.opacity = 1;
    this.angle = 1;
    this.rnd = Math.random()*50 + 30;
    this.image = new Image();
    this.image.src = image;
    this.speed = [Math.random()*5|0, Math.random()*5|0]
    this.width = this.image.width;
    this.height = this.image.height;

    var self = this;

    this.imageHit = (function() {
        var b = document.createElement('canvas');
        var bctx = b.getContext('2d');
        b.width = self.width;
        b.height = self.height;        
        bctx.drawImage(self.image, 0, 0);
        bctx.globalCompositeOperation = "source-in";
        bctx.fillStyle = "rgba(150, 50, 30, 0.6)";
        bctx.fillRect(0, 0, b.width, b.height);
        return b;
    })()

    return this;
}

TesterMove.prototype.testMark = function() {
    this.marked = true;        
}

TesterMove.prototype.testUnmark = function() {
    this.marked = false;        
}

TesterMove.prototype.update = function(dt) {
     this.angle++;
     this.x = this.rotx + Math.cos(this.angle/this.rnd) * 60;
     this.y = this.roty + Math.sin(this.angle/this.rnd) * 60;
}

TesterMove.prototype.render = function(context) {

    context = context || this.ctx;

    context.save();

    context.drawImage(this.image, this.x - this.width/2 | 0, this.y - this.height/2);    

    if (this.marked) {
        context.drawImage(this.imageHit, this.x - this.width/2, this.y - this.height/2);
    }
    context.restore();
};