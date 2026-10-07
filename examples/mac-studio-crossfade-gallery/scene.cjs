'use strict';
const {GlobalFonts,loadImage}=require('@napi-rs/canvas'),path=require('path');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/LiberationSans-Regular.ttf'),'Motion Sans');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/LiberationSans-Bold.ttf'),'Motion Sans');
const scene=require('./scene.js');
scene.ready=Promise.all(scene.assetNames.map(file=>loadImage(path.join(__dirname,'assets',file)))).then(images=>{scene.setImages(images);return scene;});
module.exports=scene;
