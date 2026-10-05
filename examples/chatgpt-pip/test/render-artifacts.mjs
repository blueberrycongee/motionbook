/** Deterministic offline renderer. These outputs are NOT browser screenshots or app recordings.
 * Event states are produced by the same controller used by the browser preview.
 * Completion positions/scales are produced by the shared source-evidenced timeline.
 */
import {createRequire} from 'node:module';import fs from 'node:fs/promises';import path from 'node:path';
import {BrowserPIPController,fixtureNotification,presentationID} from '../src/browser-pip.mjs';
import {completionAt,nativeSpec,springProgress} from '../src/native-spec.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp');
const root=path.resolve(import.meta.dirname,'..');
await fs.mkdir(path.join(root,'public/fixtures'),{recursive:true});await fs.mkdir(path.join(root,'artifacts/frames'),{recursive:true});
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=14,fill='#25352c',extra='')=>`<text x="${x}" y="${y}" font-family="Arial,DejaVu Sans,sans-serif" font-size="${size}" fill="${fill}" ${extra}>${xml(s)}</text>`;
const pill=(x,y,w,label)=>`<rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="#edf4ef"/>${text(x+w/2,y+17,label,10,'#548267','text-anchor="middle"')}`;
const svg=(body,w=1280,h=800)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><filter id="shadow" x="-30%" y="-40%" width="160%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity=".16"/></filter><filter id="bigshadow" x="-30%" y="-40%" width="160%" height="200%"><feDropShadow dx="0" dy="15" stdDeviation="18" flood-color="#000" flood-opacity=".2"/></filter><filter id="badgeShadow"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#000" flood-opacity=".8"/></filter></defs>${body}</svg>`;
function fixture(step=1,second=false){let b='<rect width="960" height="600" fill="#f1f1f1"/>';
 for(let i=0;i<2;i++){const x=12+i*286,dark=i===1,fg=dark?'#d8d8db':'#83858a',card=dark?'#77787b':'white';b+=`<rect x="${x}" y="12" width="268" height="448" fill="${dark?'#656669':'#f7f7f9'}"/>`+text(x+38,180,`Actual RuntimeModelMenu · ${dark?'dark · 20px':'light · 14px'}`,9,fg);
 b+=`<rect x="${x+39}" y="211" width="186" height="96" rx="9" fill="${card}" stroke="${dark?'#848587':'#eeeff1'}"/><circle cx="${x+52}" cy="229" r="4" fill="#aaa"/>`+text(x+60,233,'Wuu / openai-codex ⌄',10,dark?'#ddd':'#999')+text(x+53,261,'GPT-6-Astra ›',11,dark?'#eee':'#666')+text(x+164,261,step===2?'High':'Medium',9,dark?'#ddd':'#888');
 b+=`<rect x="${x+50}" y="277" width="163" height="17" rx="8.5" fill="${dark?'#eee':'#626466'}"/>`;for(let j=0;j<7;j++)b+=`<circle cx="${x+59+j*24}" cy="285.5" r="1.5" fill="#a5a5a8"/>`;
 b+=`<circle cx="${x+(step===2?194:163)}" cy="285.5" r="7.5" fill="${dark?'#aaa':'white'}"/>`;
 b+=text(x+15,416,`{"theme":"${dark?'dark':'light'}","font":"${dark?'20':'14'}","gaps":`,8,fg)+text(x+15,427,'[10,10],"contained":true,"viewport":',8,fg)+text(x+15,438,'{"width":368,"height":600}}',8,fg);
 }
 if(step===2)b+=text(635,110,second?'Second tab':'Updated',28,'#68766e')+text(635,139,second?'Independent presentation':'Local fixture only',14,'#a0aaa4');
 return svg(b,960,600)
}
const urls={};for(const [name,step,second] of [['initial',1,false],['updated',2,false],['second',2,true]]){const out=await sharp(Buffer.from(fixture(step,second))).png().toBuffer();await fs.writeFile(path.join(root,`public/fixtures/${name}.png`),out);urls[name]=`data:image/png;base64,${out.toString('base64')}`;}
const mascotBuffer=await sharp(path.join(root,'public/mascot.svg')).png().toBuffer();await fs.writeFile(path.join(root,'public/mascot.png'),mascotBuffer);const mascot=`data:image/png;base64,${mascotBuffer.toString('base64')}`;
function frameTile({x,y,w=400,h=250,url=urls.initial,complete=-1,reference=false,opacity=1,scale=1}){
 let b=`<g opacity="${opacity}" transform="translate(${x+w/2} ${y+h/2}) scale(${scale}) translate(${-w/2} ${-h/2})"><rect width="${w}" height="${h}" rx="${reference?34:8}" fill="#f1f1f1" filter="url(#${reference?'bigshadow':'shadow'})"/><clipPath id="clip${x}${y}"><rect width="${w}" height="${h}" rx="${reference?34:8}"/></clipPath><g clip-path="url(#clip${x}${y})"><image href="${url}" width="${w}" height="${h}"/>`;
 if(complete>=0){const s=completionAt(complete);const cx=w/2,cy=h/2;if(reference){b+=`<image href="${mascot}" x="${cx-59}" y="${cy-59}" width="118" height="118"/><circle cx="${cx+49}" cy="${cy+49}" r="27.5" fill="#4bc48b" filter="url(#shadow)"/><path d="m${cx+37} ${cy+49} 8 8 17-18" fill="none" stroke="#185d40" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`}
 else{b+=`<rect width="${w}" height="${h}" fill="black" opacity="${s.scrim}"/><image href="${mascot}" x="${cx-25}" y="${cy-25}" width="50" height="50" opacity="${s.icon}"/><rect x="${cx-25}" y="${cy-25}" width="50" height="50" rx="12" fill="black" opacity="${s.dim}"/>`;if(s.badgeOpacity>0)b+=`<g transform="translate(${cx+s.offset} ${cy+s.offset}) scale(${s.badgeScale})" opacity="${s.badgeOpacity}"><circle r="8.75" fill="#00e62d" filter="url(#badgeShadow)"/></g>`;if(s.checkOpacity>0)b+=`<g transform="translate(${cx+s.offset} ${cy+s.offset}) scale(${s.checkScale})" opacity="${s.checkOpacity}"><path d="m-6 0 4 4 8-9" fill="none" stroke="${s.stage==='miniCheckmark'?'#00000080':'white'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;}}
 return b+'</g></g>';
}
let focusTarget=null;let controller=new BrowserPIPController({onFocus:target=>{focusTarget=target;return true}});const stateSnapshots=[];
function stateAt(t){controller=new BrowserPIPController({onFocus:target=>{focusTarget=target;return true}});focusTarget=null;
 if(t>=1.5)controller.handle(fixtureNotification({imageDataURL:urls.initial}));
 if(t>=3.5)controller.handle(fixtureNotification({imageDataURL:urls.updated}));
 if(t>=5.5)controller.handle(fixtureNotification({imageDataURL:urls.second,tabID:'second-tab',openTabIds:['fixture-tab','second-tab']}));
 if(t>=7.5)controller.click(presentationID('fixture-thread','fixture-browser','second-tab'));
 if(t>=9.3)controller.handle({method:'turn/completed',params:{threadId:'fixture-thread'}});
 return {...controller.snapshot(),focusTarget};}
function layout(t){const state=stateAt(t),native=t>=10.6;let title='Waiting for the first screenshot',event='LOCAL FIXTURE · NO ACCOUNT OR LIVE AGENT',note='PiP frames are snapshots delivered by tool metadata.';
 if(t>=1.5){title='The first screenshot arrives';event='item/completed → codex/toolSurface.screenshot → upsert';note='A presentation is keyed by thread, browser, and tab.'}
 if(t>=3.5){title='Replace the image, keep the presentation';event='same presentation ID → next imageDataURL';note='No new card. No continuous browser DOM stream.'}
 if(t>=5.5){title='A second tab becomes a second presentation';event='openTabIds: [fixture-tab, second-tab]';note='Each tab has its own screenshot and focus target.'}
 if(t>=7.5){title='Click hands focus back to the original tab';event='focusTab → iab / second-tab';note='The thumbnail does not forward clicks into its screenshot.'}
 if(t>=9.3){title='Browser turn completed: remove browser previews';event='turn/completed → invalidateBrowserUsePIPContent';note='The browser-image path does not retain a 30-second completion card.'}
 if(native){title='Separate native-computer completion effect';event=`t = ${(t-10.6).toFixed(1)}s  ·  ${completionAt(t-10.6).stage}`;note='Source timeline: icon → full check at 1.0s → mini badge at 2.5s.'}
 let b='<rect width="1280" height="800" fill="#f7f9f7"/><rect width="1280" height="82" fill="white"/><path d="M0 82H1280" stroke="#e2e8e3"/>'+text(38,48,'PiP Replica',23,'#243e2e','font-weight="bold"')+pill(205,28,50,'LAB')+text(1240,43,'OFFLINE RENDER · NOT AN APP RECORDING',10,'#a57248','text-anchor="end" letter-spacing="1.2"');
 b+=text(38,125,'SOURCE-EVIDENCED RECONSTRUCTION',10,'#8d9f91','letter-spacing="1.8"')+text(38,164,title,26,'#2f4b39')+text(38,191,note,13,'#8b998e');
 b+='<rect x="38" y="223" width="1204" height="433" rx="18" fill="#eef2ee" stroke="#dce5dd"/>';
 b+='<rect x="80" y="266" width="687" height="338" rx="12" fill="white" stroke="#dce5df"/>'+text(111,297,'RuntimeModelMenu · local fixture',11,'#8b9a90');
 b+='<path d="M80 313H767" stroke="#eef1ee"/><circle cx="725" cy="289" r="4" fill="#bbd8c2"/>';
 if(focusTarget&&!native){b+=`<image href="${urls.second}" x="96" y="321" width="655" height="270" preserveAspectRatio="xMinYMin meet"/><rect x="79" y="265" width="689" height="340" rx="13" fill="none" stroke="#67bf96" stroke-width="2"/>`+pill(450,278,221,'ORIGINAL LOCAL TAB FOCUSED')}
 else b+=text(424,418,native?'Native completion choreography':'Local browser fixture',25,'#97aa9c','text-anchor="middle"')+text(424,447,native?'AppKit / Core Animation target included':'Controlled, account-free screenshot input',12,'#b2bfb4','text-anchor="middle"');
 if(native)b+=frameTile({x:807,y:360,w:400,h:250,complete:t-10.6});
 else state.frames.forEach((frame,i)=>{let scale=1,opacity=1;if(t<2){scale=.72+.28*springProgress(t-1.5,nativeSpec.appearanceSpring);opacity=Math.min(1,(t-1.5)/.2)}b+=frameTile({x:807-(state.frames.length-1-i)*28,y:360-(state.frames.length-1-i)*22,url:frame.imageDataURL,scale,opacity})});
 b+=text(61,640,native?'NATIVE SOURCE CONSTANTS · 400PT MAXIMUM SIZE IN THIS RENDER':'BROWSER METADATA LIFECYCLE · ISOLATED LOCAL STATE',8,'#92a394','letter-spacing="1.2"');
 b+='<rect x="38" y="680" width="1204" height="66" rx="11" fill="white" stroke="#e0e7e0"/><circle cx="61" cy="704" r="3" fill="#72ba8d"/>'+text(75,708,'EVENT TRACE',8,'#8ca18f','letter-spacing="1.3"')+text(61,730,event,12,'#5d7865');
 b+=text(38,777,'ChatGPT 26.930.51102 · recovered contracts and native animation values',9,'#98a79c')+text(1242,777,'AppKit execution and pixel parity remain unverified',9,'#a89b88','text-anchor="end"');
 return svg(b);
}
const fps=12,duration=15;
for(let i=0;i<fps*duration;i++){const t=i/fps;await sharp(Buffer.from(layout(t))).png().toFile(path.join(root,`artifacts/frames/frame-${String(i).padStart(4,'0')}.png`));if(i%fps===0)stateSnapshots.push({time:t,...stateAt(t),frames:stateAt(t).frames.map(({imageDataURL,...rest})=>rest)});}
for(const [name,t]of[['01-browser-frame-render',2.8],['02-tab-stack-render',6.6],['03-focus-handoff-render',8.5],['04-native-completion-render',14]])await sharp(Buffer.from(layout(t))).png().toFile(path.join(root,`artifacts/${name}.png`));
const ref=svg('<rect width="690" height="460" fill="white"/>'+frameTile({x:68,y:44,w:596,h:372,complete:4,reference:true}),690,460);await sharp(Buffer.from(ref)).png().toFile(path.join(root,'artifacts/05-reference-calibrated-render.png'));
let comparison='<rect width="1280" height="640" fill="#f7f9f7"/>'+text(36,49,'Two evidence sources. Kept separate.',28,'#293f31')+text(36,78,'Independent offline rendering · not a native-app screenshot',12,'#9a886e');
comparison+=text(70,136,'SUPPLIED SCREENSHOT CALIBRATION',10,'#8c9c8e','letter-spacing="1.4"')+text(710,136,'INSPECTED BUILD: NATIVE CONSTANTS',10,'#8c9c8e','letter-spacing="1.4"');
comparison+=frameTile({x:60,y:175,w:556,h:347,complete:4,reference:true})+frameTile({x:742,y:228,w:400,h:250,complete:4});
comparison+=text(70,570,'Image-pixel measurements; original backing scale unknown.',12,'#88998b')+text(710,570,'50pt icon · 17.5pt badge · source color components',12,'#88998b')+text(70,602,'Source image content and mascot are independently drawn fixtures.',10,'#a8b0a8')+text(710,602,'Color-space output and native visual parity remain unverified.',10,'#a8b0a8');
await sharp(Buffer.from(svg(comparison,1280,640))).png().toFile(path.join(root,'artifacts/06-evidence-profile-comparison.png'));
await fs.writeFile(path.join(root,'artifacts/rendered-state-trace.json'),JSON.stringify(stateSnapshots,null,2));
console.log('Rendered 180 frames, 6 stills, 3 fixture images and mascot PNG. These are offline renders, not runtime UI captures.');
