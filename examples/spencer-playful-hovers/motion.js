/* Independent, dependency-free motion model. No original site code is included. */
(function(root){
  'use strict';
  function ease(t){t=Math.max(0,Math.min(1,t));var k=9.32;return (1-(1+k*t)*Math.exp(-k*t))/(1-(1+k)*Math.exp(-k));}
  function interpolate(from,to,t){return from+(to-from)*ease(t);}
  function validateIndex(index,count){return Number.isInteger(index)&&index>=-1&&index<count;}
  function createModel(count){
    if(!Number.isInteger(count)||count<1)throw new RangeError('A positive row count is required.');
    var active=-1,pinned=-1;
    return {
      get active(){return active;},get pinned(){return pinned;},
      activate:function(index){if(!validateIndex(index,count))return false;active=index;return true;},
      hover:function(index){if(!validateIndex(index,count))return false;pinned=-1;active=index;return true;},
      leave:function(index){if(active===index&&pinned!==index)active=-1;},
      toggle:function(index){if(!validateIndex(index,count)||index<0)return false;if(pinned===index){pinned=-1;active=-1;}else{pinned=index;active=index;}return true;},
      reset:function(){active=-1;pinned=-1;},
      targets:function(){return Array.from({length:count},function(_,i){return i===active?1:0;});}
    };
  }
  var api={ease:ease,interpolate:interpolate,createModel:createModel};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.ProjectMotion=api;
})(typeof window!=='undefined'?window:globalThis);
