function Tester(x, y, image) {
    this.x = x || 10;
    this.y = y || 10;
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.image = new Image();
    this.image.src = image;
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


Tester.prototype.testMark = function() {
    this.marked = true;        
}

Tester.prototype.testUnmark = function() {
    this.marked = false;        
}

Tester.prototype.update = function(dt) {};

Tester.prototype.render = function(context) {

    context = context || this.ctx;

    context.save();

    context.drawImage(this.image, (this.x - this.width/2) | 0, (this.y - this.height/2) | 0);    

    if (this.marked) {
        context.drawImage(this.imageHit, (this.x - this.width/2) | 0, (this.y - this.height/2) | 0);
    }
    context.restore();
};