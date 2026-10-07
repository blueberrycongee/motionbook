'use strict';
// Register the bundled, licensed font for deterministic offline captures.
const {GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath(require('path').join(__dirname,'assets/LiberationSans-Regular.ttf'),'Motion Sans');
GlobalFonts.registerFromPath(require('path').join(__dirname,'assets/LiberationSans-Bold.ttf'),'Motion Sans');
module.exports=require('./scene.js');
