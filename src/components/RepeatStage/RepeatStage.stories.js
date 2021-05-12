import React from 'react';
import RepeatStage from './RepeatStage';
import thumb from './assets/20201219_DevHynes_00136.jpg';

export default {
  title: 'RepeatStage',
  parameters: {
    layout: 'fullscreen'
  }
};

export const Default = () => {
  return (
    <>
       <RepeatStage mousedelay="1000" width="100%" height={"100vh"} imgHeight={400} src={thumb}/>
    </>
  );
}