var Point = function(x, y)
{
    this.x = x;
    this.y = y;
};

var Polygon = function(x, y, radius, sides,color='black')
{
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.sides = sides;
    this.color = color;
    this.vertices = getPoints(x, y, radius, sides);    

    function getPoints(x, y, radius, sides){
        var points = [],
            angle = 0,
            centerAngle = 2 * Math.PI / sides;
        if (Array.isArray(radius)) {
            for(var i = 0;  i < sides;  i++){
                points.push(new Point( x + radius[i] * Math.sin(angle), y - radius[i] * Math.cos(angle) ));
                angle += centerAngle;
            }
        } else {
            for(var i = 0;  i < sides;  i++){
                points.push(new Point( x + radius * Math.sin(angle), y - radius * Math.cos(angle) ));
                angle += centerAngle;
            }
        }
        // console.log(points);
        return points;
    }

    this.strokeStyle = color;
    this.fillStyle = 'rgba(200, 200, 200, 1)';    
};

Polygon.prototype = {

    createPath: function(context){

        context.beginPath();
        context.moveTo(this.vertices[0].x, this.vertices[0].y);
        for(var i = 1;  i < this.sides;  i++){
            context.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        context.closePath();
    },

    stroke: function(context){

        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    },

    fill: function(context){

        context.save();
        this.createPath(context);
        context.fillStyle = this.fillStyle;
        context.fill();
        context.restore();
    }
}