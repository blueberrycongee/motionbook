"""Offline render of the implementation's measured motion model; never a browser capture."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageOps,ImageChops
import re,math,json,subprocess
ROOT=Path(__file__).parent;OUT=ROOT/'preview';OUT.mkdir(exist_ok=True)
CFG=json.loads((ROOT/'motion-data.json').read_text());html=(ROOT/'index.html').read_text()
REG='/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf';MONO='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
def font(n,mono=False):return ImageFont.truetype(MONO if mono else REG,round(n))
rows=[]
for i,article in enumerate(re.findall(r'<article.*?</article>',html,re.S)):
 rows.append({'name':['Cronicle [B,P,E]','Memo [B,P,E]','Origami [B,P,E]','Apple [E]'][i], 'description':re.search(r'<span class="description">(.*?)</span>',article,re.S).group(1),'icon':re.search(r'<img class="icon" src="(.*?)"',article).group(1),'assets':re.findall(r'<div class="card[^\"]*" style="[^\"]+"><img src="([^\"]+)"',article)})
cache={}
def img(src):
 if src not in cache:cache[src]=Image.open(OUT/src.replace('.svg','.png')).convert('RGBA')
 return cache[src]
def wrapped(draw,text,maxw,f):
 lines=[];line=''
 for word in text.split():
  trial=(line+' '+word).strip()
  if draw.textlength(trial,font=f)>maxw and line:lines.append(line);line=word
  else:line=trial
 lines.append(line);return lines

def ease(t):
 t=max(0,min(1,t));k=9.32;return (1-(1+k*t)*math.exp(-k*t))/(1-(1+k)*math.exp(-k))
def interpolate(a,b,p):return a+(b-a)*p

def draw_row(i,p):
 row=rows[i];h=107.8+1+87*p
 layer=Image.new('RGBA',(520,310),'white');d=ImageDraw.Draw(layer)
 icon=img(row['icon']).resize((56,56),Image.Resampling.LANCZOS);layer.alpha_composite(icon,(0,26))
 name,tags=row['name'].split(' ',1);d.text((68,22),name,font=font(16),fill='#222222');tx=68+d.textlength(name,font=font(16))+5;d.text((tx,24),tags,font=font(12,True),fill='#777777')
 for j,line in enumerate(wrapped(d,row['description'],452,font(14))):d.text((68,47+j*17.5),line,font=font(14),fill='#8a8b87')
 if p>0:
  fan=Image.new('RGBA',(520,310));tile_y=19.8+95*p;tile_h=88-8*p
  # Preserve the measured z-order, not the HTML serialization order.
  order=sorted(range(len(row['assets'])),key=lambda j:CFG['rows'][i]['cards'][j]['shown']['z'])
  for j in order:
   src=row['assets'][j];a=CFG['rows'][i]['cards'][j]['hidden'];b=CFG['rows'][i]['cards'][j]['shown'];v={k:interpolate(a[k],b[k],p) for k in ['x','y','width','height','angle']}
   w,hh=max(1,round(v['width'])),max(1,round(v['height']));im=ImageOps.fit(img(src),(w,hh),centering=(.5,0));mask=Image.new('L',(w,hh));ImageDraw.Draw(mask).rounded_rectangle((0,0,w,hh),8,fill=255);im.putalpha(ImageChops.multiply(im.getchannel('A'),mask));im=im.rotate(-v['angle'],Image.Resampling.BICUBIC,expand=True)
   fan.alpha_composite(im,(round(v['x']+(w-im.width)/2),round(tile_y+v['y']+(hh-im.height)/2)))
  if i==0:
   clip=Image.new('L',fan.size);ImageDraw.Draw(clip).rectangle((0,round(tile_y),520,round(tile_y+tile_h)),fill=255);fan.putalpha(ImageChops.multiply(fan.getchannel('A'),clip))
  fade=Image.new('RGBA',fan.size);fd=ImageDraw.Draw(fade);fh=32+14*p;fy=tile_y+tile_h+1+p-fh
  for yy in range(max(0,round(fy)),min(310,round(fy+fh))):fd.line((0,yy,520,yy),fill=(255,255,255,round(255*max(0,min(1,(yy-fy)/fh)))))
  fan=Image.alpha_composite(fan,fade);fan.putalpha(fan.getchannel('A').point(lambda v:round(v*p)));layer=Image.alpha_composite(layer,fan)
 layer=layer.crop((0,0,520,round(h)))
 if i<3:
  d=ImageDraw.Draw(layer)
  for xx in range(0,520,5):d.point((xx,layer.height-1),fill='#dddddd')
 return layer,h

def draw_work(canvas,x,y,values,scale=1,header=True):
 d=ImageDraw.Draw(canvas)
 if header:
  d.text((x,y-80*scale),'Work',font=font(24*scale),fill='#222222');d.text((x,y-43*scale),'[BRAND],[PRODUCT],[ENGINEERING]',font=font(12*scale,True),fill='#737670')
 for xx in range(round(x),round(x+520*scale),max(1,round(5*scale))):d.point((xx,round(y)),fill='#dddddd')
 positions=[]
 for i,p in enumerate(values):
  positions.append(y);layer,h=draw_row(i,p);layer=layer.resize((round(520*scale),round(layer.height*scale)),Image.Resampling.LANCZOS);canvas.alpha_composite(layer,(round(x),round(y)));y+=h*scale
 return y,positions

def render(values,cursor=None):
 W,H=1160,992;scene=ImageOps.fit(img('assets/landscape.svg'),(W,H)).convert('RGBA');shade=Image.new('RGBA',(W,H));sd=ImageDraw.Draw(shade)
 for y in range(H):sd.line((0,y,W,y),fill=(15,37,25,round(35*y/H)))
 scene=Image.alpha_composite(scene,shade);shadow=Image.new('RGBA',(W,H));ImageDraw.Draw(shadow).rounded_rectangle((172,75,988,875),18,fill=(12,36,26,45));scene=Image.alpha_composite(scene,shadow.filter(ImageFilter.GaussianBlur(25)));d=ImageDraw.Draw(scene);d.rounded_rectangle((172,64,988,864),18,fill='white')
 y,positions=draw_work(scene,320,217,values)
 if cursor is not None:
  xx,yy=426,positions[cursor]+40;d.polygon([(xx,yy),(xx+1,yy+18),(xx+6,yy+13),(xx+10,yy+20),(xx+13,yy+18),(xx+9,yy+11),(xx+17,yy+10)],fill='#1c2623',outline='white',width=1)
 return scene.convert('RGB')

EVENTS=[(1.2962623,0),(3.9269069,1),(5.0942966,0),(6.3879907,1),(7.6890699,-1),(8.995,3),(10.765,-1)]
def state_at(t,events=EVENTS):
 current=-1;last=-1;elapsed=0
 for onset,idx in events:
  if onset<=t:last=current;current=idx;elapsed=t-onset
 p=ease(elapsed/.5) if current!=-1 or any(onset<=t for onset,_ in events) else 0;v=[0.0]*4
 if last>=0:v[last]=1-p
 if current>=0:v[current]=p
 return v,current

def build_standard():
 for i in range(4):render([int(j==i) for j in range(4)],i).save(OUT/f'state-{i+1}.png')
 render([0,0,0,0]).save(OUT/'idle.png');sheet=Image.new('RGB',(1160,992),'white')
 for i in range(4):sheet.paste(Image.open(OUT/f'state-{i+1}.png').resize((580,496),Image.Resampling.LANCZOS),((i%2)*580,(i//2)*496))
 sheet.save(OUT/'all-four-hovers.png')
 video=OUT/'hover-sequence.mp4'
 encoder=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','928x794','-r','24','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(video)],stdin=subprocess.PIPE)
 for f in range(250):
  t=f/24;v,cur=state_at(t,[(1,0),(3,1),(5,2),(7,3),(9,-1)]);im=render(v,cur if cur>=0 else None).resize((928,794),Image.Resampling.LANCZOS);encoder.stdin.write(im.tobytes())
 encoder.stdin.close();assert encoder.wait()==0
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(video),'-vf','split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',str(OUT/'hover-sequence.gif')],check=True)
 (OUT/'preview-note.json').write_text(json.dumps({'version':2,'preview_kind':'Offline render of the shared measured motion targets; not browser or native capture','fps':24,'frames':250,'duration_seconds':250/24,'comparison_media_included':False,'source':'https://x.com/spenceramarsh/status/2106075554264797619'},indent=2))

if __name__=='__main__':
 build_standard();print('Updated standard v2 preview.')
