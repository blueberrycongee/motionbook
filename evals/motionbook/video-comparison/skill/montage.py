import sys,glob
from PIL import Image, ImageDraw
files=sys.argv[2:]; out=sys.argv[1]
cols=3; w,h=640,360
rows=(len(files)+cols-1)//cols
M=Image.new('RGB',(cols*w,rows*h),'white')
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((w,h),Image.LANCZOS)
    d=ImageDraw.Draw(im); d.text((8,6),f.split('/')[-1],fill=(255,0,0))
    M.paste(im,((i%cols)*w,(i//cols)*h))
M.save(out)
