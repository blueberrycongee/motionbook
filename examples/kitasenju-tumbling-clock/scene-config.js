(function (root, factory) {
  if (typeof module === 'object') module.exports = factory();
  else root.ClockSceneConfig = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return Object.freeze({
    width: 564, height: 342, duration: 33.429333,
    motion: Object.freeze({seed:137,startTime:'12:39:42',gravity:850,spawnY:1000,capHeight:220,preRoll:8,spawnPhase:-1.34,maxBodies:48,platformDepth:30,friction:0.65,restitution:0,rotationJitter:0.07,depthJitter:5,initialTiltX:0.15,initialTiltZ:-0.04,angularDamping:0.15}),
    render: Object.freeze({fov:40,cameraDistance:1175,target:Object.freeze([0,17.5,0]),antialias:2,ambient:0.76,diffuse:0.28,sideAlbedo:0.94,light:Object.freeze([-0.35,0.7,1])})
  });
});
