function TesterPrimitive(x, y, color) {
    this.x = x || 10;
    this.y = y || 10;
    this.color = color;
    this.width = 40;
    this.height = 40;
    return this;
}


TesterPrimitive.prototype.testMark = function() {
    this.marked = true;        
}

TesterPrimitive.prototype.testUnmark = function() {
    this.marked = false;        
}

TesterPrimitive.prototype.update = function(dt) {};

TesterPrimitive.prototype.render = function(context) {

    context = context || this.ctx;

    context.save();

    context.fillStyle = this.color;
    context.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height/2);
    context.beginPath();
    context.arc(this.x, this.y, 10, 0, Math.PI*2, false);
    context.fill();
    if (this.marked) {
        context.fillStyle = "red";
        context.beginPath();
        context.arc(this.x, this.y, 5, 0, Math.PI*2, false);
        context.fill();
    }
    context.restore();
};