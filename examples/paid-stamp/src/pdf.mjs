// Original minimal PDF writer. No service is contacted and no payment is made.
const escapePdf=s=>String(s).replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
export function invoicePdf({day=15,month=9,year=2026,status='Paid'}={}){
 const commands=[],text=(s,x,y,size=10,bold=false)=>commands.push(`BT /${bold?'B':'F'} ${size} Tf ${x} ${y} Td (${escapePdf(s)}) Tj ET`),line=(x1,y1,x2,y2)=>commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
 commands.push('0.12 0.12 0.12 rg 0.85 0.85 0.85 RG 0.5 w');
 text('Invoice',50,777,27,true);text('FeralUI Studio',50,758,12);text('Invoice to: Northwind Pty Ltd',343,720,9);text('Invoice ID: FUI-0067',343,705,9);text('Date of issue: 01/09/2026',343,690,9);text('Payment due: 15/09/2026',343,675,9);
 for(const [i,s] of ['ABN: 51 824 753 556','Email: hello@feralui.dev','Web: feralui.dev','Address: 12 Paper Lane, Fitzroy VIC 3065'].entries())text(s,50,720-i*15,9);
 line(50,647,545,647);text('Description of services',50,615,13,true);
 for(const [s,x] of [['Description',50],['Quantity',355],['Unit price',419],['Total',510]])text(s,x,587,8);
 const rows=[['Component design','12.00','$85/hour','$1,020.00'],['Motion prototypes','4.50','$85/hour','$382.50'],['Figma handoff','2.00','$85/hour','$170.00']];
 for(let i=0;i<rows.length;i++)for(let j=0;j<4;j++)text(rows[i][j],[50,364,420,504][j],562-i*27,10);
 text('Total amount due:',439,444,9,true);text('$1,572.50',452,417,19);line(50,388,545,388);
 text('Bank details for payment:',50,356,9,true);for(const [i,s] of ['Bank: Northbank','BSB: 000-000','Account number: 1234 5678','Name: FeralUI Studio'].entries())text(s,50,341-i*14,9);
 const date=`${day} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][month-1]} ${year}`;
 commands.push('q 0.9978 -0.0663 0.0663 0.9978 0 0 cm 0.77 0.29 0.31 RG 0.77 0.29 0.31 rg 1.8 w 270 248 233 90 re S 0.7 w 276 254 221 78 re S');text(status.toUpperCase(),371,317,8,true);text(date,290,278,25,true);commands.push('Q');
 text('Thank you for your business.',50,57,8);text('feralui.dev',500,57,8);text('Illustrative UI recreation. This file is not a payment request.',50,25,7);
 const stream=commands.join('\n'),objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F 4 0 R /B 5 0 R >> >> /Contents 6 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
 let pdf='%PDF-1.4\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(const off of offsets.slice(1))pdf+=`${String(off).padStart(10,'0')} 00000 n \n`;pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return new TextEncoder().encode(pdf);
}
