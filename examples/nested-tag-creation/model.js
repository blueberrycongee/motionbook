(function(root,factory){const value=factory();if(typeof module==='object')module.exports=value;else root.TagModel=value;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const BASE=[['A','Accessibility','#317cf6',224],['C','Copy','#e6950a',136],['H','Handoff','#5c677e',170],['M','Motion','#8e35f5',156],['R','Research','#08c89f',184],['V','Visual QA','#f1364d',184]];
  const PALETTE=[['Coral','#f1364d'],['Amber','#e6950a'],['Mint','#15bf78'],['Azure','#317cf6'],['Lilac','#8e35f5'],['Rose','#e11483'],['Teal','#08c89f']];
  const label=(a)=>({id:a[0],name:a[1],color:a[2],width:a[3]});
  class Picker{
    constructor(){this.labels=BASE.map(label);this.selected=['H','M'];this.open=false;this.mode='list';this.query='';this.colorQuery='';this.draft='';this.color=0;this.highlight=0;this.revision=0;}
    touch(){this.revision++;return this;}
    filtered(){const q=this.query.toLocaleLowerCase();return this.labels.filter(x=>x.name.toLocaleLowerCase().includes(q));}
    colors(){const q=this.colorQuery.toLocaleLowerCase();return PALETTE.map((x,index)=>({name:x[0],color:x[1],index})).filter(x=>x.name.toLocaleLowerCase().includes(q));}
    canCreate(){return this.query.trim().length>0&&!this.labels.some(x=>x.name.toLocaleLowerCase()===this.query.trim().toLocaleLowerCase());}
    show(){this.open=true;this.mode='list';this.query='';this.highlight=0;return this.touch();}
    close(){this.open=false;this.mode='list';this.query='';this.colorQuery='';return this.touch();}
    search(value){this.query=String(value).slice(0,40);this.highlight=0;return this.touch();}
    searchColors(value){this.colorQuery=String(value).slice(0,40);this.highlight=0;return this.touch();}
    toggle(id){if(!this.labels.some(x=>x.id===id))return this;this.selected=this.selected.includes(id)?this.selected.filter(x=>x!==id):[...this.selected,id];return this.touch();}
    beginCreate(){if(!this.canCreate())return this;this.draft=this.query.trim();this.mode='create';this.colorQuery='';this.color=0;this.highlight=0;return this.touch();}
    commit(index){if(this.mode!=='create'||!Number.isInteger(index)||index<0||index>=PALETTE.length)return this;let x=this.labels.find(x=>x.name.toLocaleLowerCase()===this.draft.toLocaleLowerCase());if(!x){let n=0;while(this.labels.some(x=>x.id==='D'+(n||'')))n++;x={id:'D'+(n||''),name:this.draft,color:PALETTE[index][1],width:Math.max(100,82+this.draft.length*14.4)};this.labels.push(x);this.labels.sort((a,b)=>a.name.localeCompare(b.name));}if(!this.selected.includes(x.id))this.selected.push(x.id);this.mode='list';this.query='';this.colorQuery='';return this.touch();}
    move(delta){const n=this.mode==='create'?this.colors().length:this.filtered().length+(this.canCreate()?1:0);this.highlight=n?((this.highlight+delta)%n+n)%n:0;return this.touch();}
    enter(){if(!this.open)return this.show();if(this.mode==='create'){const c=this.colors()[this.highlight];return c?this.commit(c.index):this;}const item=this.filtered()[this.highlight];return item?this.toggle(item.id):this.beginCreate();}
    escape(){if(this.mode==='create'){this.mode='list';return this.touch();}return this.close();}
    adopt(row){this.labels=BASE.map(label);if(row.created)this.labels.splice(2,0,label(['D','design','#e11483',154]));this.selected=[...row.selected];this.open=row.open;this.mode=row.mode;this.query=row.query;this.draft='design';this.colorQuery='';this.color=row.color||0;this.highlight=0;return this.touch();}
    snapshot(){return{labels:this.labels.map(x=>({...x})),selected:[...this.selected],open:this.open,mode:this.mode,query:this.query,draft:this.draft,colorQuery:this.colorQuery,color:this.color,highlight:this.highlight,created:this.labels.some(x=>x.id==='D'),live:true};}
  }
  return{Picker,BASE,PALETTE};
});
