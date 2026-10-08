#!/usr/bin/env python3
"""Create only the fictional downloadable PDF used by this local demo."""
import json,pathlib,subprocess
from reportlab.pdfgen import canvas
ROOT=pathlib.Path(__file__).resolve().parents[1]
doc=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {documents} from './src/documents.mjs'; console.log(JSON.stringify(documents.resume));"],cwd=ROOT,text=True))
c=canvas.Canvas(str(ROOT/'fixtures/alex-morgan-portfolio.pdf'),pagesize=(612,792))
c.setTitle('Alex Morgan - Portfolio');c.setAuthor('Fictional Motionbook example')
for page,lines in enumerate([doc['lines'],doc['pageTwo']]):
 y=733
 for kind,body in lines:
  if kind in ['section']:y-=16;c.setFillColorRGB(.35,.47,.4);c.setFont('Helvetica-Bold',9)
  elif kind=='name':c.setFillColorRGB(.15,.24,.2);c.setFont('Times-Bold',24)
  elif kind=='job':c.setFillColorRGB(.2,.27,.23);c.setFont('Times-Bold',12)
  else:c.setFillColorRGB(.37,.41,.38);c.setFont('Helvetica',8.5)
  c.drawString(47,y,body.replace('—','-').replace('·',' / '));y-=24 if kind in ['name','section'] else 18
 c.setFont('Helvetica',8);c.drawRightString(565,28,f'{page+1} / 2');c.showPage()
c.save()
