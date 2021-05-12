import repeatObject from "./repeat.object";

var repeatStage = (function() {

    repeatStage = function(container, src, imgHeight, changeCallback) {
        var self = this;

        this.imageList = [
            src
        ];
        /*this.imageList = [
            "//ithk-pro-itmall-resources.oss-cn-hongkong.aliyuncs.com/2/2019/5/14/15578001148929530.png",
            "//ithk-pro-itmall-resources.oss-cn-hongkong.aliyuncs.com/2/2019/5/14/15578001150398606.png",
            "//ithk-pro-itmall-resources.oss-cn-hongkong.aliyuncs.com/2/2019/5/14/15578001151463533.png",
            "//ithk-pro-itmall-resources.oss-cn-hongkong.aliyuncs.com/2/2019/5/14/15578001152151563.png",
            "//ithk-pro-itmall-resources.oss-cn-hongkong.aliyuncs.com/2/2019/5/14/15578001152545003.png",
            "//ithk-pro-itmall-resources.oss-cn-hongkong.aliyuncs.com/2/2019/5/14/15578001153112567.png",
            "//ithk-pro-itmall-resources.oss-cn-hongkong.aliyuncs.com/2/2019/5/14/15578001153952642.png"
        ];*/
        
        this.currentIndex = 0;
        this.isInViewport = false;
        this.change = changeCallback;
        this.promptTimer = null;
        this.accelerometer = false;
        this.imgHeight = imgHeight;
        this.active = null;


        this.stage = container;

        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute("id", "repeat-stage-canvas");
        this.stage.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        this.resize();

        var tilt = document.getElementById("prompt-tilt");
        var tap = document.getElementById("prompt-tap");

        window.addEventListener("resize", this.resize.bind(this));
        //window.addEventListener("scroll", this.isStageInViewport.bind(this));
        
        /*
        var gn = new GyroNorm();
            gn.init().then(function(){
                var that = self;
                var vWidth = (window.innerWidth || document.documentElement.clientWidth);
                self.stage.addEventListener("click", self.stageClick.bind(self));
                tilt.style = "display: block;";
                tap.style = "display: none;";
                

                gn.start(function(data){
                    if(that.item && vWidth < 992) {
                        that.item.deviceMove(data);
                    }
                    
                });
            }).catch(function(e){
            // Catch if the DeviceOrientation or DeviceMotion is not supported by the browser or device
                if (!('ontouchstart' in window)) {
                    self.stage.addEventListener("click", self.stageClick.bind(self));
                } else {
                    tap.style = "display: block;";
                    tilt.style = "display: none;";
                    self.ctx.canvas.addEventListener("touchstart", self.stageTouch.bind(self));
                }
            });*/

        //this.isStageInViewport();
    }

    repeatStage.prototype.resize = function() {
        var cWidth = this.stage.offsetWidth;
        var cHeight = this.stage.offsetHeight;
        this.ctx.canvas.width = cWidth*2;
        this.ctx.canvas.height = cHeight*2;
        this.canvas.style.width = cWidth + "px";
        this.canvas.style.height = cHeight + "px";
        this.ctx.scale(2,2);

        if(cWidth > 414) {
            this.scaleMod = 0.2;
        } else {
            this.scaleMod = 0.5;
        }

        this.loadItem(this.currentIndex);
        this.isInViewport = false;
        //this.isStageInViewport();
    }

    repeatStage.prototype.loadItem = function(index) {
        this.item = null;
        this.ctx.clearRect(0,0, this.stage.offsetWidth * 2, this.stage.offsetHeight * 2);

        var imagesrc = this.imageList[index];
        if(imagesrc) {
            this.item = new repeatObject(this.ctx,imagesrc,this.imgHeight);
        }

        if(this.change) {
            this.change(index);
        }
    }

    repeatStage.prototype.appendItem = function(index,coords) {
        this.item = null;
        //this.ctx.clearRect(0,0, this.stage.offsetWidth * 2, this.stage.offsetHeight * 2);

        var imagesrc = this.imageList[index];
        if(imagesrc) {
            this.item = new repeatObject(this.ctx,imagesrc,this.imgHeight,coords);
        }

        if(this.change) {
            this.change(index);
        }        
    }

    repeatStage.prototype.startMovement = function() {
        if(this.item) {
            this.item.shouldMove = true;
        }
    }

    repeatStage.prototype.pauseMovement = function() {
        if(this.item) {
            this.item.shouldMove = false;
        }

    }

    repeatStage.prototype.startRender = function() {
        this.active = true;
        this.render();
    }

    repeatStage.prototype.destroyRender = function() {
        this.active = false;
    }

    repeatStage.prototype.render = function() {
        var self = this;
        setTimeout(function(){
            if(self.item) {
                self.item.render();
            }
            
            if(self.active) {
                window.requestAnimationFrame(self.render.bind(self));
            }
        }, 1000/60);
        
    }

    repeatStage.prototype.stageClick = function() {
        var nextIndex = this.currentIndex + 1;
        if(nextIndex < this.imageList.length) {
            this.currentIndex = nextIndex; 
        } else {
            this.currentIndex = 0;
        }
        this.loadItem(this.currentIndex);
    }

    repeatStage.prototype.stageTouch = function(event) {
        var nextIndex = this.currentIndex + 1;
        if(nextIndex < this.imageList.length) {
            this.currentIndex = nextIndex; 
        } else {
            this.currentIndex = 0;
        }
        this.appendItem(this.currentIndex,{x:event.touches[0].clientX, y:event.touches[0].clientY});
    }

    repeatStage.prototype.isStageInViewport = function() {
        var vWidth = (window.innerWidth || document.documentElement.clientWidth);
        var vHeight = (window.innerHeight || document.documentElement.clientHeight);
        var boundingBox = this.stage.getBoundingClientRect();
        var prompt = document.getElementById("repeat-stage-prompt");

        if(boundingBox.top < vHeight && boundingBox.bottom > 0 && !this.isInViewport) {
            // It is in the viewport
            this.isInViewport = true;
            prompt.classList.add("repeat-stage__prompt--active");

            if(this.promptTimer) {
                clearTimeout(this.promptTimer);
            }
            
            this.promptTimer = setTimeout(function(){
                prompt.classList.remove("repeat-stage__prompt--active");
            }, 3000);
        } else {
            this.isInViewport = false;
        }



    }

    return repeatStage;
})();

export default repeatStage;