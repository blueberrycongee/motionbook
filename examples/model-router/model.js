(function(root,factory){if(typeof module==='object')module.exports=factory();else root.RouterModel=factory();})(globalThis,function(){
  'use strict';
  const POLICIES=[{id:'cost',label:'COST',price:.0026,shares:[6,21,49,24],p95:.99,errors:.64},{id:'balanced',label:'BALANCED',price:.0046,shares:[17,42,27,14],p95:1.26,errors:.5},{id:'quality',label:'QUALITY',price:.0089,shares:[58,30,8,4],p95:1.75,errors:.42}];
  const MODELS=[{name:'Opus 5.5',vendor:'ANTHROPIC',color:'#4458ef',p50:.84,p95:2.16,price:.0126,errors:.42},{name:'GPT-6.1 Sol',vendor:'OPENAI',color:'#1fa387',p50:.51,p95:1.34,price:.0048,errors:.27},{name:'Haiku 4.5',vendor:'ANTHROPIC',color:'#8c40db',p50:.23,p95:.64,price:.0007,errors:.61},{name:'Qwen3.5 9B',vendor:'SELF-HOSTED',color:'#c22773',p50:.38,p95:1.09,price:.0019,errors:1.08}];
  class Router{
    constructor(){this.reset();}
    reset(){this.policy=1;this.fallback=true;this.source=0;this.destination=1;this.hover=-1;this.menu=false;this.menuHover=-1;this.live={policy:1,fallback:true,source:0,destination:1};}
    get dirty(){return ['policy','fallback','source','destination'].some(k=>this[k]!==this.live[k]);}
    selectPolicy(index){if(Number.isInteger(index)&&POLICIES[index])this.policy=index;}
    toggleFallback(){this.fallback=!this.fallback;if(!this.fallback)this.menu=false;}
    toggleMenu(){if(this.fallback)this.menu=!this.menu;}
    selectSource(index){if(!this.fallback||!Number.isInteger(index)||!MODELS[index])return;const old=this.source;this.source=index;if(this.destination===index)this.destination=old;this.menu=false;this.menuHover=-1;}
    hoverRoute(index){this.hover=Number.isInteger(index)&&MODELS[index]?index:-1;}
    deploy(){if(this.dirty)this.live={policy:this.policy,fallback:this.fallback,source:this.source,destination:this.destination};}
    snapshot(time=0){const p=POLICIES[this.policy];return{time,policy:this.policy,thumb:this.policy,fallback:this.fallback?1:0,source:this.source,destination:this.destination,menu:this.menu?1:0,menuHover:this.menuHover,hover:this.hover,routeAlpha:MODELS.map((_,i)=>this.hover<0||i===this.hover?1:.35),rowAlpha:MODELS.map((_,i)=>this.hover<0||i===this.hover?1:.45),shares:p.shares,price:p.price,p95:p.p95,errors:p.errors,requests:332,dirty:this.dirty?1:0,priceDelta:(p.price/this.livePrice()-1)*100,cursor:null};}
    livePrice(){return POLICIES[this.live.policy].price;}
  }
  return{Router,POLICIES,MODELS};
});
