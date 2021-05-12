import TweenMax from "gsap/TweenMax";
import { Power1 } from "gsap/EasePack";

var repeatObject = (function() {

    repeatObject = function(ctx,src,imgHeight,coords) {
        var self = this;
        this.cursorLatch = false;
        this.ctx = ctx;
        this.imgHeight = imgHeight;
        this.isLoaded = false;
        this.shouldMove = false;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;

        this.cursor = {
            x: null,
            y: null
        };

        // Take into account retina
        this.point = {
            x: (this.ctx.canvas.width / 2) / 2,
            y: (this.ctx.canvas.height / 2) / 2
        }

        this.lastDraw = {
            x: null,
            y: null
        };

        this.img = new Image();
        this.img.onload = function() {
            self.isLoaded = true;
        } 
        this.img.src = src;

        if(coords) {
            var bounding = this.ctx.canvas.getBoundingClientRect();
            coords.y = coords.y - bounding.top;
            this.touchMove(coords);
        } else {
            this.ctx.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        }
     
        var self = this;
    }

    repeatObject.prototype.deviceMove = function(data) {
        var gamma = data.do.gamma;
        var beta = data.do.beta;

        var maxGamma = 100;
        var maxBeta = 45;
        var midBeta = 45;
        beta = beta - midBeta;
       
        var x, y;
        
        var canvasHeight = window.innerHeight;
        var canvasMidHeight =  canvasHeight / 2;
        var canvasWidth =  window.innerWidth;
        var canvasMid =  canvasWidth / 2;

        if(gamma <= maxGamma && gamma >= -maxGamma) {
            x = canvasMid + (canvasMid * (gamma/maxGamma));
        } else if(gamma > maxGamma) {
            x = canvasWidth;
        } else if(gamma < -maxGamma) {
            x = 0;
        }

        if(beta <= maxBeta && beta >= -maxBeta) {
            y = canvasMidHeight + (canvasMidHeight * (beta/maxBeta));
        } else if(beta > maxBeta) {
            y = canvasHeight;
        } else if(beta < -maxBeta) {
            y = 0;
        }
        

        this.cursor = {
            x: x,
            y: y
        };

        TweenMax.to(this.point, 0.5, {x: this.cursor.x, y: this.cursor.y});
    }

    repeatObject.prototype.mouseMove = function(event) {

        if(this.shouldMove) {
            var bounding = this.ctx.canvas.getBoundingClientRect();

            this.cursor = {
                x: event.clientX - bounding.left,
                y: event.clientY - bounding.top
            };

            TweenMax.to(this.point, 0.5, {x: this.cursor.x, y: this.cursor.y});
        }

    }

    repeatObject.prototype.touchMove = function(coords) {
        this.cursor = {
            x: coords.x,
            y: coords.y
        };

        TweenMax.to(this.point, 1, {bezier:[{x:this.random(0,this.width), y:this.random(0,this.height)}, {x:this.random(0,this.width), y:this.random(0,this.height)}, {x: this.cursor.x, y: this.cursor.y}], ease:Power1.easeInOut});

    }

    repeatObject.prototype.random = function(min,max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    repeatObject.prototype.drawImage = function(x,y) {

        if(!this.isLoaded) {
            return;
        }
        var ratio = this.img.width / this.img.height;
        var newHeight = this.imgHeight;
        var newWidth = newHeight * ratio;
        var newDimensions = {
            width: newWidth,
            height: newHeight
        };
        
        var newPoint = {x: null, y: null};
        newPoint.x = x - (newWidth / 2);
        newPoint.y = y - (newHeight / 2);

        if(newPoint.x > 0 && (newPoint.x + newWidth) < this.ctx.canvas.width / 2 && newPoint.y > 0 && (newPoint.y + newHeight) < this.ctx.canvas.height / 2) {

            if(this.lastDraw.x && this.lastDraw.y) {
                var distanceBetweenLast = this.distanceBetweenTwoPoints(this.lastDraw, newPoint);
            
                for(var length = 0; length < distanceBetweenLast.dist; length++) {
                    var fraction = length / distanceBetweenLast.dist;
                    var p = {
                        x: this.lastDraw.x + distanceBetweenLast.xDist * fraction,
                        y: this.lastDraw.y + distanceBetweenLast.yDist * fraction
                    }

                   
                    
                    this.ctx.drawImage(this.img, p.x, p.y, newWidth, newHeight);
                }
            }
            //cache the position 
            this.lastDraw = newPoint;
    
            this.ctx.drawImage(this.img, newPoint.x, newPoint.y, newWidth, newHeight);
        } else {
            this.ctx.drawImage(this.img, this.lastDraw.x, this.lastDraw.y, newWidth, newHeight);
        }
    }

    repeatObject.prototype.setAlphaValue = function(point, dimensions) {
        let xEdge = 400;
        let yEdge = 200;
        let multiplier = null;
        let alpha = null;
        let xAlpha = null;
        let yAlpha = null;

        if(point.x < xEdge) {
            multiplier = (0 + point.x) / (xEdge);
            xAlpha = multiplier * 0.1;
            if(xAlpha < 0) {
                xAlpha = 0;
            }
        } else if((point.x + dimensions.width) > (this.ctx.canvas.width / 2) - xEdge){
            multiplier = ((this.ctx.canvas.width / 2) - (point.x + dimensions.width)) / (xEdge);
            
            xAlpha= multiplier * 0.1;
            if(xAlpha < 0) {
                xAlpha= 0;
            }
        } 


        if(point.y < yEdge) {
            multiplier = (point.y - 100) / (yEdge - 100);
            if(multiplier > 0) {
                yAlpha = multiplier * 0.1;
                if(yAlpha < 0) {
                    yAlpha = 0;
                }
            } else {
                yAlpha = 0;
            }
            
        } else if((point.y + dimensions.height) > ((this.ctx.canvas.height / 2) - 200) - yEdge){
            multiplier = ((this.ctx.canvas.height / 2) - (point.y + dimensions.height)) / (yEdge);

            yAlpha= multiplier * 0.1;
            if(yAlpha < 0) {
                yAlpha = 0;
            }
        } 

        if(xAlpha && yAlpha) {
            if(xAlpha < yAlpha) {
                alpha = xAlpha;
            } else {
                alpha = yAlpha;
            }
        } else if(typeof(yAlpha) !== "undefined") {
            alpha = yAlpha;
        } else if(typeof(xAlpha) !== "undefined") {
            alpha = xAlpha;
        } else {
            alpha = 1;
        }

        this.ctx.globalAlpha = alpha;
    }

    repeatObject.prototype.distanceBetweenTwoPoints = function(p1,p2) {
        var xDist = p2.x - p1.x;
        var yDist = p2.y - p1.y;
        var distance = Math.sqrt(xDist * xDist + yDist * yDist);
        return {
            xDist: xDist,
            yDist: yDist,
            dist: distance
        };
    }

    repeatObject.prototype.render = function() {
        if(!this.cursorLatch) {
            if((this.point.x > this.cursor.x - 10 && this.point.x < this.cursor.x + 10) && (this.point.y > this.cursor.y - 10 && this.point.y < this.cursor.y + 10)) {
                this.cursorLatch = true;
            }
            this.drawImage(this.point.x, this.point.y);
        } else {
            this.drawImage(this.cursor.x,this.cursor.y);
        }

    }

    return repeatObject;
})();

export default repeatObject;