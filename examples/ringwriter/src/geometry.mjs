import {grid} from './grid.mjs';
export {grid};
export function slotPosition(ring, index, phase = ring.phase) {
  if (!Number.isFinite(index) || !Number.isFinite(phase)) throw new TypeError('Finite slot coordinates required');
  const angle=phase-index*2*Math.PI/ring.N;
  return {x:grid.center[0]+ring.radius*Math.cos(angle),y:grid.center[1]+ring.radius*Math.sin(angle),angle,rotation:angle-Math.PI/2};
}
export function visibleSlots(padding=50) {
  return grid.rings.flatMap(ring=>Array.from({length:ring.N},(_,index)=>({ring:ring.k,index,...slotPosition(ring,index)}))).filter(p=>p.x>=-padding&&p.y>=-padding&&p.x<=grid.width+padding&&p.y<=grid.height+padding);
}
export function scenePoint(clientX,clientY,bounds) {
  if (!(bounds.width>0&&bounds.height>0)) return null;
  return {x:(clientX-bounds.left)*grid.width/bounds.width,y:(clientY-bounds.top)*grid.height/bounds.height};
}
