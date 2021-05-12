import React, { useEffect } from "react";
import classNames from 'classnames/bind';
import repeatStage from "./js/repeat.stage";

const RepeatStage = props => {
    const { width, height, src, imgHeight, className, mousedelay } = props;
    let container = null;
    let classes = classNames(className);
    var stage = null;
    let stageStyles = {
        position: "relative",
        width: width,
        height: height
    };

    useEffect(() => {
        stage = new repeatStage(container, src, imgHeight);  
    }, []);

    function onMouseEnter() {
        if(stage) {
            stage.startRender();
            setTimeout(function() {
                stage.startMovement();
            }, mousedelay);
        } 
    }

    return(
        <div style={stageStyles} ref={(div) => { container = div; }} className={classes} onMouseEnter={onMouseEnter} ></div>
    );
}

export default RepeatStage;