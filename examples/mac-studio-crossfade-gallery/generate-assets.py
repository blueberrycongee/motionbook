"""Generate original deterministic vector illustrations. No external assets."""
from pathlib import Path
import math
OUT=Path(__file__).parent/'assets'
def rect(x,y,w,h,fill,rx=0,extra=''):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" rx="{rx}" {extra}/>'
def line(x1,y1,x2,y2,c,w=1):return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{c}" stroke-width="{w}" fill="none"/>'
def circle(x,y,r,c):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
def text(x,y,t,c='#b8bdc7',size=14,weight=400):return f'<text x="{x}" y="{y}" fill="{c}" font-family="Motion Sans" font-size="{size}" font-weight="{weight}">{t}</text>'
def svg(name,w,h,parts):
 defs='''<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#5e7594"/><stop offset="1" stop-color="#f3d7b8"/></linearGradient><linearGradient id="violet" x2="1" y2="1"><stop stop-color="#1a1933"/><stop offset="1" stop-color="#403272"/></linearGradient><radialGradient id="orb"><stop stop-color="#ffecc2"/><stop offset=".65" stop-color="#cf9c66"/><stop offset="1" stop-color="#584747"/></radialGradient><linearGradient id="wall" x2="1" y2="1"><stop stop-color="#d9d9d1"/><stop offset="1" stop-color="#a5afad"/></linearGradient></defs>'''
 (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{defs}'+''.join(parts)+'</svg>')
def chrome(title):
 p=[rect(0,0,1200,660,'#15151b'),rect(0,0,1200,35,'#23232c'),text(55,23,title,'#c9c9d2',13,600)]
 for i,c in enumerate(['#ed7775','#e7c866','#82b78a']):p.append(circle(15+i*13,17,4,c))
 return p
# A creative suite with a completely original floating observatory illustration.
p=chrome('ATELIER  /  CONCEPT EXPLORER');p+=[rect(15,50,252,594,'#24242d',8),text(33,83,'STORYBOARD','#acbcb3',12,600)]
for i,t in enumerate(['A place above the clouds','Light, atmosphere, form','Six studies in stillness']):
 y=105+i*169;p+=[rect(30,y,219,149,['#b9cdbb','#b9bcb0','#9baca4'][i],5),text(45,y+27,f'0{i+1}  /  {t.split()[0].upper()}','#344138',12,600)]
 for j in range(5):p.append(rect(45,y+43+j*13,150-(j*23+i*17)%64,3,'#6e8775'))
p+=[rect(283,50,727,496,'url(#sky)',8)]
# distant mountains, sun, terraces
p += [circle(839,159,52,'#eddcb1'),'<path d="M283 391L382 272L477 343L592 199L727 337L851 253L1010 382V546H283Z" fill="#929e98"/>','<path d="M283 432L418 352L542 399L654 303L776 414L1010 358V546H283Z" fill="#738b82"/>']
for i in range(12):
 y=380+i*12;p.append(f'<ellipse cx="679" cy="{y}" rx="{224-i*8}" ry="{35-i*.8}" fill="{["#6d8071","#9fa98a","#c2b68e"][i%3]}"/>')
p += ['<ellipse cx="683" cy="300" rx="191" ry="62" fill="#4c565a"/>','<ellipse cx="683" cy="279" rx="191" ry="58" fill="#ded1ae"/>','<ellipse cx="683" cy="267" rx="165" ry="44" fill="#506468"/>',rect(659,297,40,99,'#b7b5a4'),'<path d="M520 263Q686 179 846 263" stroke="#e7debd" stroke-width="14" fill="none"/>']
for i in range(14):p+=[line(532+i*23,268,533+i*23,305,'#4e5b5b',3)]
for i in range(29):
 x=300+(i*127)%698;y=460+(i*31)%70;p+=[line(x,y,x,y-22,'#536858',3),circle(x,y-25,9,'#526d58')]
p+=[rect(283,560,727,84,'#23232d',8),text(304,587,'Describe a world worth building…','#9899a8',16),rect(869,606,120,25,'#b4c9b4',13),text(893,624,'Generate','#293c30',13,600),rect(1025,50,160,594,'#24242d',8),text(1040,80,'VARIATIONS','#aaaeba',12,600)]
for i in range(5):p+=[rect(1041,96+i*103,128,87,['#607878','#bda37f','#8f9889','#576574','#798b7b'][i],5),circle(1106,130+i*103,22,['#e1c9a3','#e3cfaf','#c6cbb5','#a3b6c9','#d0d7c0'][i])]
svg('ai-creative.svg',1200,660,p)
# Model playground / graph.
p=chrome('VECTOR  /  LOCAL MODEL LAB');p+=[rect(17,51,332,592,'#20222d',8),text(39,87,'Model playground','#e9e9ef',20,600),rect(39,112,287,41,'#333344',6),text(54,138,'Atlas · 32B · local','#bfc6df',15),rect(39,180,269,82,'#323044',12),text(54,205,'Explore a structure for a','#c9c8db',14),text(54,227,'more connected world.','#c9c8db',14)]
for i in range(14):p.append(rect(41,294+i*14,245-(i*37)%95,4,'#74798e'))
p+=[rect(39,556,287,62,'#2b2d39',9),text(56,593,'Ask a follow-up…','#959aac',15),rect(363,51,820,592,'url(#violet)',8),text(395,88,'EMBEDDING SPACE','#bab4da',12,600)]
nodes=[]
for ring in range(6):
 for j in range(11):
  a=j*2*math.pi/11+ring*.34;r=61+ring*34;nodes.append((773+math.cos(a)*r,333+math.sin(a)*r*.87,ring,j))
for x,y,ring,j in nodes:
 for x2,y2,r2,j2 in nodes:
  if r2==ring+1 and (j2==j or j2==(j+1)%11):p.append(line(round(x,2),round(y,2),round(x2,2),round(y2,2),'#777297',.8))
for x,y,r,j in nodes:p+=[circle(round(x,2),round(y,2),3+(j%3)*1.2,['#a1d2ce','#e4c6e6','#b8a3e0'][j%3])]
p+=[circle(773,333,29,'#e0d0e9'),text(753,338,'32B','#3e3358',15,600),rect(396,580,227,32,'#53506a',16),text(411,601,'Private · On device · In flow','#ded8e7',13)]
svg('ai-models.svg',1200,660,p)
# Developer environment / original cartographic poster.
p=chrome('FIELDWORK  /  BUILD WITH INTELLIGENCE');p+=[rect(16,50,243,594,'#242831',8),text(35,81,'PROJECT FILES','#afb7c5',12,600)]
for i,t in enumerate(['src','  components','  terrain.ts','  contours.ts','  palette.ts','  notes.md','assets','  elevation.svg','  marks.svg']):p+=[text(34,118+i*29,t,'#b4b9c5',15)]
p +=[rect(271,50,559,594,'#21242d',8),text(294,79,'terrain.ts','#d4bd92',13,600)]
for i in range(31):
 p.append(text(290,112+i*16,str(i+1),'#5e6578',10));x=320
 for j in range(3+(i%3)):
  width=20+(i*13+j*37)%80;p.append(rect(x,105+i*16,width,4,['#b88da6','#8baead','#b8b598','#777f97'][j%4]));x+=width+8
p += [rect(688,138,474,440,'#ede8dc',8),rect(688,138,474,27,'#dddbd2',8),text(706,157,'PREVIEW / TERRA ATLAS','#606462',10,600),rect(706,184,207,371,'#171e23'),text(931,213,'TERRA','#252a2b',39,600),text(932,244,'FIELD NOTES','#252a2b',18,600),text(932,276,'A study of contour,','#525c59',12),text(932,296,'distance and light.','#525c59',12),rect(930,325,213,230,'#dd744b')]
for i in range(24):
 rx=90-i*2.9;ry=150-i*4.7;pts=[]
 for j in range(81):
  a=j*2*math.pi/80;r=1+.12*math.sin(a*5+i*.11)+.07*math.cos(a*3);pts.append(f'{809+math.cos(a)*rx*r:.2f},{369+math.sin(a)*ry*r:.2f}')
 p.append('<polygon points="'+' '.join(pts)+'" fill="none" stroke="#bc7357" stroke-width=".9"/>')
for i,t in enumerate(['01  RIDGELINE','02  SEDIMENT','03  WATERSHED','04  HORIZON']):p.append(text(947,365+i*39,t,'#55342c',13,600))
svg('ai-features.svg',1200,660,p)
# Three purpose-built architectural workspace illustrations.
for n,(name,wall,accent,sky) in enumerate([('workspace-quiet.svg','#d5c8b6','#8e9b89','#a7bdc7'),('workspace-shared.svg','#c3b9aa','#b76c52','#bdd0d3'),('workspace-night.svg','#303647','#8794b1','#293a56')]):
 p=[rect(0,0,1400,820,wall),rect(0,0,850,620,sky),rect(872,0,528,620,wall),rect(0,620,1400,200,['#a99580','#968b7b','#313a43'][n])]
 for j in range(8):
  x=j*110;p+=[rect(x,250-(j*39)%130,100,370+(j*39)%130,['#9eafb5','#aebabb','#7c9aa6'][j%3],0, 'opacity=".65"')]
 for x in [0,275,550,825]:p += [rect(x,0,18,620,'#6f7778')]
 p +=[line(0,360,850,360,'#788386',16),rect(984,77,269,344,['#ebe4d9','#ebd9bd','#6c788e'][n],3)]
 for j in range(9):p +=[f'<ellipse cx="1118" cy="{174+j*19}" rx="{87-j*5}" ry="{40-j*1.7}" fill="none" stroke="{accent}" stroke-width="5"/>']
 # desk; underside diagonal supports
 p +=['<path d="M124 600L1161 524L1372 617L331 743Z" fill="#e5e1d6"/>','<path d="M331 743L1372 617V641L331 769Z" fill="#b1aca2"/>','<path d="M164 617L210 814H234L219 622M1250 640L1241 820H1265L1288 634" fill="#43484a"/>']
 # display pairs / empty quiet station
 for k in range(1 if n==0 else 2):
  x=355+k*430;y=270-k*26
  p += [rect(x,y,365,238,'#272d35',7),rect(x+11,y+11,343,214,'#182637',2)]
  for j in range(8):p += [f'<path d="M{x+11} {y+185-j*7}Q{x+150} {y+58+j*11} {x+354} {y+168+j*6}" fill="none" stroke="{["#91abb5","#d1b998","#ad91a8"][j%3]}" stroke-width="{15-j}" opacity=".8"/>']
  p += [rect(x+166,y+238,38,77,'#a7adae'),f'<path d="M{x+134} {y+315}L{x+251} {y+313}L{x+277} {y+327}L{x+109} {y+330}Z" fill="#b7bbbb"/>']
 # computer/keyboard/notebook original geometry
 p +=[rect(758,546,156,65,'#b8bcbb',12),rect(772,589,5,8,'#444b4d',2),rect(788,589,5,8,'#444b4d',2),rect(811,591,39,3,'#444b4d',1),'<path d="M460 632L648 616L709 648L519 666Z" fill="#c2c9c7"/>','<path d="M1004 640L1138 623L1190 646L1056 666Z" fill="#7e969b"/>']
 # sculptural plant
 p +=[rect(1240,465,73,105,['#7c8d7d','#a37f65','#6d8190'][n],14)]
 for j in range(9):
  a=j*.8;x=1278+math.cos(a)*(35+j*3);y=444-j*16;p +=[line(1278,475,x,y,'#536953',5),f'<ellipse cx="{x}" cy="{y}" rx="27" ry="11" transform="rotate({j*23} {x} {y})" fill="#6e8769"/>']
 # chair in foreground
 p +=['<path d="M52 800L22 641Q58 574 169 616L270 820Z" fill="'+accent+'"/>','<path d="M157 740L405 720L499 820H188Z" fill="'+accent+'"/>']
 svg(name,1400,820,p)
print('Generated six original SVG illustrations in',OUT)
