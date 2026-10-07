// A deterministic, offline SVG study. Events are authored demonstration states.
const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
const mix = (a,b,q) => a+(b-a)*q;
const n = x => Number(x.toFixed(3));
const spring = age => age <= 0 ? 0 : 1-Math.exp(-12*age)*Math.cos(17*age);
export function stateAt(t=0, scenario='normal') {
  t=clamp(Number.isFinite(t)?t:0,0,6);
  const interrupted=scenario==='interrupted';
  const end=interrupted?3.8:3;
  let state='idle', start=.5, attempt=1;
  if(t>=.5) state='saving';
  if(interrupted && t>=1.4) state='canceled';
  if(interrupted && t>=2.1) {state='saving';start=2.1;attempt=2;}
  if(t>=end) state='success';
  const events=interrupted?[[.5,1],[1.4,-1],[2.1,1],[3.8,-1]]:[[.5,1],[3,-1]];
  const expansion=clamp(events.reduce((s,[time,d])=>s+d*spring(t-time),0),-.035,1.09);
  const progress=state==='saving'?clamp((t-start)/(end-start)):state==='success'?1:0;
  return {state,start,attempt,progress,expansion,end,t};
}
function contour(q) {
  const x=mix(282,244,q), b=mix(484,466,q);
  const p=(a,b)=>n(mix(a,b,q));
  return `M${n(x+34)} 286H${n(b)} C${p(489.968,487)} 286 ${p(495.83,495)} ${p(287.568,302)} ${p(501,503)} ${p(290.555,301)} C${p(506.17,511)} ${p(293.54,300)} ${p(510.46,522)} ${p(297.83,286)} ${p(513.445,541)} ${p(303,286)} C${p(516.431,560)} ${p(308.17,286)} ${p(518,575)} ${p(314.032,301)} ${p(518,575)} 320 C${p(518,575)} ${p(325.968,339)} ${p(516.431,560)} ${p(331.83,354)} ${p(513.445,541)} ${p(337,354)} C${p(510.46,522)} ${p(342.17,354)} ${p(506.17,511)} ${p(346.46,340)} ${p(501,503)} ${p(349.445,339)} C${p(495.83,495)} ${p(352.432,338)} ${p(489.968,487)} 354 ${n(b)} 354H${n(x+34)} C${n(x+15.222)} 354 ${n(x)} 338.778 ${n(x)} 320 C${n(x)} 301.222 ${n(x+15.222)} 286 ${n(x+34)} 286Z`;
}
export function renderFrame(t=0, options={}) {
  const {width=800,height=600,scenario='normal',reducedMotion=false}=options;
  const s=stateAt(t,scenario);
  const pending=s.state==='saving',success=s.state==='success',canceled=s.state==='canceled';
  const q=reducedMotion?(pending?1:0):s.expansion;
  const x=mix(282,244,q), ix=x+36+26*(1-q), tx=x+65+26*(1-q);
  const shape=contour(q), green='#24735e',blue='#0b578b',ink=success?green:blue;
  const label=success?'Draft saved':canceled?'Try again':pending?'Saving…':'Save draft';
  const status=success?'All changes saved. You can come back anytime.':canceled?'Save canceled. Your changes are still here.':pending?(s.attempt===2?'Trying again. Saving your latest changes.':'Saving your latest changes.'):'A small pause. Nothing lost.';
  // Reduced motion switches directly between meaningful states; no moving fill.
  const progress=reducedMotion?.38:s.progress;
  const visibleFill=pending?progress:success?1:0;
  const edge=x+25+230*visibleFill;
  const ring=success&&!reducedMotion?clamp(1-(s.t-s.end)/.55):0;
  const title=success?'Draft saved':canceled?'Save canceled. Try again.':pending?'Saving draft. Cancel available.':'Save draft';
  const tickProgress=reducedMotion?1:.35+.65*clamp((s.t-s.end)/.19);
  const cancelAlpha=reducedMotion?1:clamp((s.t-s.start)/.11);
  const outputWidth=Number.isFinite(width)&&width>0?width:800;
  const outputHeight=Number.isFinite(height)&&height>0?height:600;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 800 600" role="img" aria-labelledby="scene-title scene-desc" data-state="${s.state}" data-attempt="${s.attempt}" data-reduced-motion="${reducedMotion}">
<title id="scene-title">${title}</title><desc id="scene-desc">${status} Authored save-action animation study.</desc>
<defs>
<linearGradient id="surface" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f7f6f3"/><stop offset="1" stop-color="#eeede9"/></linearGradient>
<linearGradient id="button" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".55" stop-color="#fafbf9"/><stop offset="1" stop-color="#f4f5f2"/></linearGradient>
<linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#d9ddd7"/></linearGradient>
<linearGradient id="wash" x1="${n(x)}" y1="0" x2="${n(edge+35)}" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="${success?'#d5efe2':'#81d8f6'}"/><stop offset=".64" stop-color="${success?'#def2e7':'#a1e0f7'}"/><stop offset="1" stop-color="${success?'#f1faf4':'#e7f6fc'}" stop-opacity="0"/></linearGradient>
<filter id="shadow" x="-30%" y="-100%" width="160%" height="350%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="soft" x="-30%" y="-70%" width="160%" height="240%"><feGaussianBlur stdDeviation="8"/></filter>
<clipPath id="button-clip"><path d="${shape}"/></clipPath>
</defs>
<rect width="800" height="600" fill="url(#surface)"/>
<g font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
<path d="M306 155H334M466 155H494" stroke="#c9cdc5" stroke-width="1"/>
<text x="400" y="159" fill="#687362" font-size="10" font-weight="700" letter-spacing="2.2">YOUR DRAFT</text>
<text x="400" y="204" fill="#333f35" font-size="29" font-weight="500" letter-spacing="-.8">Keep your place.</text>
<text x="400" y="233" fill="#6b7664" font-size="13.5">Good ideas deserve a moment to settle.</text>
</g>
<path d="${shape}" fill="#425244" opacity=".11" filter="url(#shadow)" transform="translate(0 10)"/>
<path d="${shape}" fill="url(#button)" stroke="url(#edge)" stroke-width="1.25"/>
<g clip-path="url(#button-clip)">
${visibleFill>0?`<rect x="${n(x-12)}" y="280" width="${n(edge-x+60)}" height="80" fill="url(#wash)" filter="url(#soft)"/>`:''}
<path d="${shape}" fill="none" stroke="#fff" stroke-width="2" opacity=".82" transform="translate(0 1)"/>
</g>
${ring>0?`<circle cx="${n(ix)}" cy="320" r="${n(18+9*(1-ring))}" fill="none" stroke="#5d9d82" stroke-width="1.4" opacity="${n(ring*.5)}"/>`:''}
<circle cx="${n(ix)}" cy="320" r="17" fill="${ink}"/>
${success?`<path d="M${n(ix-7)} 320L${n(ix-1.5)} 325.4L${n(ix+8)} 315" fill="none" stroke="#fff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="23" stroke-dashoffset="${n(23*(1-tickProgress))}"/>`:canceled?`<path d="M${n(ix+6.5)} 317A7 7 0 1 0 ${n(ix+6.5)} 324M${n(ix+7)} 312V317H${n(ix+2)}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`:`<path d="M${n(ix)} 312V324M${n(ix-5)} 320L${n(ix)} 325L${n(ix+5)} 320" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`}
<text x="${n(tx)}" y="326.6" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" fill="${ink}" letter-spacing="-.35">${label}</text>
${pending?`<text x="${n(x+218)}" y="324.4" font-family="Arial, Helvetica, sans-serif" font-size="11.5" font-weight="600" text-anchor="middle" fill="${ink}" opacity="${n(cancelAlpha*.8)}">${reducedMotion?'···':Math.min(99,Math.floor(progress*100))+'%'}</text><g opacity="${n(cancelAlpha)}"><path d="M${n(mix(501,541,q)-6)} 314L${n(mix(501,541,q)+6)} 326M${n(mix(501,541,q)+6)} 314L${n(mix(501,541,q)-6)} 326" stroke="#515a51" stroke-width="3" stroke-linecap="round"/><text x="${n(mix(501,541,q))}" y="379" font-family="Arial, Helvetica, sans-serif" font-size="10.5" text-anchor="middle" fill="#63715f">Cancel</text></g>`:''}
<g font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
<text x="400" y="418" font-size="12.5" fill="${success?'#507b65':canceled?'#8a7153':'#687462'}">${status}</text>
<text x="400" y="453" fill="#727e6a" font-size="10.5" letter-spacing=".65">PERSONAL NOTES · 842 WORDS</text>
</g>
</svg>`;
}
