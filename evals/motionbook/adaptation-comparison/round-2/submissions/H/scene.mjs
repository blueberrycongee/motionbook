/** An original vector study. All inputs are scripted; no live audio or DOM. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, p) => a + (b - a) * p;
const n = v => Number(v.toFixed(4));
const lerpTime = (t, start, end, a, b) => mix(a, b, clamp((t-start)/(end-start), 0, 1));

export function stateAt(time = 0, scenario = 'normal') {
  const t = clamp(Number.isFinite(time) ? time : 0, 0, 6);
  let value = 40, active = false, start = 0, end = 0, base = 40, handOrigin = 452, canceled = false;
  if (scenario === 'interrupted') {
    if (t >= .5 && t < 1.8) {
      start=.5; end=1.8; active=true;
      value=t <= 1.1 ? lerpTime(t,.5,2.1,40,70) : lerpTime(t,1.1,1.8,51.25,30);
    } else if (t >= 1.8 && t < 2.6) {
      value=40; start=.5; end=1.8; canceled=true;
    } else if (t >= 2.6) {
      start=2.6; end=4; base=40; active=t<4;
      value=lerpTime(t,2.6,4,40,55);
    }
  } else {
    if (t >= .5 && t < 3.4) {
      start=.5; end=2.1; active=t<2.1;
      value=lerpTime(t,.5,2.1,40,70);
    } else if (t >= 3.4) {
      start=3.4; end=4.5; base=70; handOrigin=332; active=t<4.5;
      value=lerpTime(t,3.4,4.5,70,25);
    }
  }
  const handValue = canceled ? 30 : value;
  const handX=handOrigin-(handValue-base)*3.8;
  const releaseAge=end && t>=end ? t-end : -1;
  const pressure=active ? 1-Math.exp(-24*(t-start)) : releaseAge>=0 && releaseAge<.32 ? Math.exp(-18*releaseAge)*Math.pow(1-releaseAge/.32,2) : 0;
  return {t,value,active,start,end,base,handX,releaseAge,pressure,canceled};
}

export function renderFrame(t = 0, options = {}) {
  const { width=800, height=600, scenario='normal', reducedMotion=false }=options;
  const s=stateAt(t,scenario), value=s.value, shown=Math.round(value);
  const blue='#3c60d8', ink='#26302e', muted='#747b75';
  const w=Number.isFinite(width)&&width>0?width:800, h=Number.isFinite(height)&&height>0?height:600;
  const pressure=reducedMotion?0:s.pressure;
  const status=s.canceled?'Restored to 40%':s.active?'Adjusting volume':'Drag to adjust';
  let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${n(w)}" height="${n(h)}" viewBox="0 0 800 600" role="img" aria-label="Sound check. Room volume ${shown} percent. ${status}. Range zero to one hundred." data-value="${n(value)}" data-state="${s.canceled?'canceled':s.active?'dragging':'idle'}" data-reduced-motion="${Boolean(reducedMotion)}">
  <title>Sound check</title><desc>Tune the room to your mood. Scripted room-volume ruler study. Current volume ${shown} percent, range 0 to 100.</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f5f5f0"/><stop offset="1" stop-color="#eeefe8"/></linearGradient>
    <linearGradient id="porcelain" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffffc"/><stop offset="1" stop-color="#f8f9f4"/></linearGradient>
    <linearGradient id="well" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ecede6"/><stop offset=".04" stop-color="#f3f4ee"/><stop offset="1" stop-color="#fafbf6"/></linearGradient>
    <linearGradient id="edges"><stop stop-color="white" stop-opacity="0"/><stop offset=".12" stop-color="white"/><stop offset=".88" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
    <mask id="edge-mask"><rect x="113" y="336" width="574" height="113" fill="url(#edges)"/></mask>
    <clipPath id="well-clip"><rect x="104" y="327" width="592" height="137" rx="19"/></clipPath>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="17"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#paper)"/>
  <g font-family="Arial, Helvetica, sans-serif">
  <text x="90" y="112" fill="${ink}" font-size="43" font-weight="600" letter-spacing="-1.6">Sound check</text>
  <text x="92" y="148" fill="${muted}" font-size="19">Tune the room to your mood.</text>
  <rect x="88" y="213" width="624" height="322" rx="31" fill="#405142" opacity=".085" filter="url(#shadow)"/>
  <rect x="80.5" y="192.5" width="639" height="334" rx="30" fill="url(#porcelain)" stroke="#dce0d6"/>
  <path d="M110 194H690" stroke="white" stroke-opacity=".9"/>
  <g fill="none" stroke="${muted}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(337 226)"><path d="M0 0H4L9-4V10L4 6H0Z"/><path d="M13 0Q17 3 13 6"/></g>
  <text x="365" y="233" fill="${muted}" font-size="11" font-weight="600" letter-spacing="2">ROOM VOLUME</text>
  <text x="400" y="303" text-anchor="middle" fill="${ink}" font-size="65" font-weight="500" letter-spacing="-2.8">${shown}<tspan font-size="29" letter-spacing="-.8" fill="#69746d">%</tspan></text>
  <rect x="104.5" y="327.5" width="591" height="136" rx="19" fill="url(#well)" stroke="#e5e8de"/>
  <path d="M124 463H676" stroke="white" stroke-opacity=".9"/>
  <g clip-path="url(#well-clip)"><g mask="url(#edge-mask)">`;
  // Normal mode translates a dense scale under a fixed index. Reduced mode
  // uses a stationary full scale: value is conveyed by changing ink, never tweened positions.
  for(let v=0;v<=100;v++) {
    const x=reducedMotion ? 132+v*5.36 : 400+(v-value)*8;
    if(x<99||x>701)continue;
    const major=v%10===0, half=v%5===0;
    const near=Math.exp(-Math.pow((x-400)/83,2));
    const len=(major?30:half?23:13)+pressure*near*5;
    const selected=v<=(reducedMotion?shown:value);
    const color=selected?blue:(major?'#939c91':'#b8beb3');
    out+=`<path d="M${n(x+.6)} ${n(412-len+.9)}V413" stroke="white" stroke-opacity=".9" stroke-width="2.1"/><path d="M${n(x)} ${n(412-len)}V412" stroke="${color}" stroke-width="${major?2.1:1.6}" stroke-linecap="round"/>`;
    if((reducedMotion&&major)||(!reducedMotion&&half))out+=`<text x="${n(x)}" y="367" text-anchor="middle" fill="${selected?'#384765':'#7b8478'}" font-size="${major?13:12}" font-weight="${major?600:400}">${v}</text>`;
  }
  out+='</g></g>';
  if(!reducedMotion) {
    out+=`<path d="M400 378V415" stroke="${blue}" stroke-width="3" stroke-linecap="round"/><path d="M396 425L400 420L404 425Z" fill="${blue}"/><circle cx="400" cy="433" r="2.6" fill="${blue}"/>`;
    if(s.active || (s.releaseAge>=0&&s.releaseAge<.26)) {
      const q=s.active?0:clamp(s.releaseAge/.26,0,1);
      const reveal=s.active?clamp((s.t-s.start)/.085,0,1):1;
      const radius=s.active?19+3*pressure:22+13*q;
      const alpha=(1-q)*reveal;
      out+=`<g opacity="${n(alpha)}"><circle cx="${n(s.handX)}" cy="438" r="${n(radius)}" fill="${blue}" fill-opacity=".04" stroke="${blue}" stroke-opacity=".32" stroke-width="1.6"/>
      <g transform="translate(${n(s.handX)} 438)" fill="none" stroke="${blue}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M-9 0H9M-5-4L-9 0L-5 4M5-4L9 0L5 4"/></g></g>`;
    }
  }
  out+=`<path d="M112 480H688" stroke="#e6e9df"/>
  <g transform="translate(123 501)" fill="none" stroke="${s.canceled?blue:muted}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${s.canceled?'<path d="M-5-1A6 6 0 1 1-3 5M-5-6V-1H0"/>':'<path d="M-7 0H7M-4-3L-7 0L-4 3M4-3L7 0L4 3"/>'}</g>
  <text x="141" y="505" fill="${s.canceled?blue:muted}" font-size="12">${status}</text>
  <text x="684" y="505" text-anchor="end" fill="#7b8378" font-size="12">Range 0–100</text>
  </g></svg>`;
  return out;
}
