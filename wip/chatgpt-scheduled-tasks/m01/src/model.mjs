/** Independent local client model. No OpenAI connection or background service. */
export const SCHEMA_VERSION = 1;
export const FREQUENCIES = ['once', 'hourly', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly', 'custom'];
export const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const clone = value => structuredClone(value);
export function zoneValid(zone) { try { new Intl.DateTimeFormat('en',{timeZone:zone}); return true; } catch { return false; } }
export function zonedParts(date, zone) {
  const values = new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(date));
  return Object.fromEntries(values.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
}
export const isoDay = ({year,month,day}) => `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
function daysFrom(day, amount) { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+amount); return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),weekday:d.getUTCDay()}; }
export function wallInstants(parts, zone) {
  const nominal=Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute);
  const offsets=new Set();
  for(const probe of [nominal-86400000,nominal,nominal+86400000]) {
    const p=zonedParts(probe,zone); offsets.add(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)-probe);
  }
  return [...offsets].map(offset=>nominal-offset).filter(stamp=>{
    const p=zonedParts(stamp,zone); return ['year','month','day','hour','minute'].every(k=>p[k]===parts[k]);
  }).sort((a,b)=>a-b);
}
export function defaultSchedule(now=Date.now(), zone='UTC') {
  return {frequency:'daily',time:'09:00',timeZone:zone,days:[1,2,3,4,5],date:isoDay(zonedParts(now+86400000,zone)),dayOfMonth:1,month:1,interval:1,endDate:null};
}
export function validateTask(task, now=Date.now(), {allowPastOnce=false}={}) {
  const errors={}; const s=task.schedule||{};
  if(!task.title?.trim()) errors.title='Enter a name for this task';
  if((task.title||'').length>120) errors.title='Use 120 characters or fewer';
  if(!task.prompt?.trim()) errors.prompt='Describe what ChatGPT should do';
  if(!FREQUENCIES.includes(s.frequency)) errors.frequency='Choose a supported frequency';
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time||'')) errors.time='Choose a valid time';
  if(!zoneValid(s.timeZone)) errors.timeZone='Choose a valid time zone';
  if(['weekly','custom'].includes(s.frequency)&&(!Array.isArray(s.days)||!s.days.length||s.days.some(d=>!Number.isInteger(d)||d<0||d>6))) errors.days='Choose at least one day';
  if(['hourly','custom'].includes(s.frequency)&&(!Number.isInteger(s.interval)||s.interval<1||s.interval>24)) errors.interval='Choose an interval from 1 to 24';
  if(['monthly','yearly'].includes(s.frequency)&&(!Number.isInteger(s.dayOfMonth)||s.dayOfMonth<1||s.dayOfMonth>31)) errors.dayOfMonth='Choose a day from 1 to 31';
  if(s.frequency==='yearly'&&(!Number.isInteger(s.month)||s.month<1||s.month>12)) errors.month='Choose a month';
  const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&Number.isFinite(new Date(`${d}T12:00:00Z`).getTime())&&new Date(`${d}T12:00:00Z`).toISOString().slice(0,10)===d;
  if(s.frequency==='once'&&!validDate(s.date)) errors.date='Choose a valid date';
  if(s.endDate&&!validDate(s.endDate)) errors.endDate='Choose a valid end date';
  if(!errors.timeZone) {
    const today=isoDay(zonedParts(now,s.timeZone));
    if(s.endDate&&s.endDate<today) errors.endDate='Choose an end date today or later';
    if(s.frequency==='once'&&validDate(s.date)) {
      const max=new Date(now);max.setUTCFullYear(max.getUTCFullYear()+2);
      if(s.date>max.toISOString().slice(0,10))errors.date='Choose a date within the next two years';
      if(!Object.keys(errors).length&&!allowPastOnce&&nextRun({...task,status:'active'},now)===null)errors.date='Choose a date and time in the future';
    }
  }
  return errors;
}
export function nextRun(task, after=Date.now()) {
  if(task.status!=='active')return null;
  const s=task.schedule;if(!s||!zoneValid(s.timeZone)||!/^\d{2}:\d{2}$/.test(s.time||''))return null;
  const now=Number(new Date(after)); const today=isoDay(zonedParts(now,s.timeZone));
  const [hour,minute]=s.time.split(':').map(Number);
  for(let offset=0;offset<=732;offset++) {
    const p=daysFrom(today,offset); const day=isoDay(p);
    if(s.endDate&&day>s.endDate)return null;
    let eligible=s.frequency==='once'?day===s.date:s.frequency==='weekdays'?p.weekday>0&&p.weekday<6:['weekly','custom'].includes(s.frequency)?s.days.includes(p.weekday):s.frequency==='monthly'?p.day===s.dayOfMonth:s.frequency==='yearly'?p.day===s.dayOfMonth&&p.month===s.month:true;
    if(!eligible)continue;
    const hours=s.frequency==='hourly'?Array.from({length:24},(_,i)=>i).filter(i=>i%(s.interval||1)===hour%(s.interval||1)):[hour];
    for(const h of hours)for(const candidate of wallInstants({...p,hour:h,minute},s.timeZone))if(candidate>now)return new Date(candidate).toISOString();
    if(s.frequency==='once'&&day>=s.date)return null;
  }
  return null;
}
export function scheduleLabel(schedule) {
  const s=schedule; const [h,m]=(s.time||'09:00').split(':').map(Number);const time=`${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;
  const week=s.days?.map(d=>DAY_NAMES[d].slice(0,3)).join(', ');
  return s.frequency==='once'?`${s.date} at ${time}`:s.frequency==='hourly'?`Every ${s.interval===1?'hour':s.interval+' hours'} at :${String(m).padStart(2,'0')}`:s.frequency==='daily'?`Every day at ${time}`:s.frequency==='weekdays'?`Weekdays at ${time}`:s.frequency==='weekly'?`${week} at ${time}`:s.frequency==='monthly'?`Monthly on day ${s.dayOfMonth}, ${time}`:s.frequency==='yearly'?`Yearly on ${s.month}/${s.dayOfMonth}, ${time}`:`${week} at ${time}`;
}
export function filterTasks(tasks, filter='all', search='') {
  const q=search.trim().toLocaleLowerCase();return tasks.filter(t=>(filter==='all'||t.status===filter)&&(!q||`${t.title} ${t.prompt} ${scheduleLabel(t.schedule)}`.toLocaleLowerCase().includes(q)));
}
export class TaskStore {
  constructor({tasks=[],clock=()=>Date.now(),storage=null,id=()=>globalThis.crypto.randomUUID()}={}) {this.tasks=clone(tasks);this.clock=clock;this.storage=storage;this.id=id;this.listeners=new Set();this.storageError=null;}
  subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  notify(){this.persist();for(const fn of this.listeners)fn(this.tasks);}
  persist(){if(!this.storage)return;try{this.storage.setItem('scheduled-study-v1',JSON.stringify({version:SCHEMA_VERSION,tasks:this.tasks}));this.storageError=null;}catch{this.storageError='Changes could not be saved on this device';}}
  restore(){if(!this.storage)return false;try{const data=JSON.parse(this.storage.getItem('scheduled-study-v1'));if(data?.version!==SCHEMA_VERSION||!Array.isArray(data.tasks))return false;this.tasks=data.tasks.filter(t=>t&&typeof t.id==='string'&&['active','paused','completed'].includes(t.status)&&Array.isArray(t.runs)&&Object.keys(validateTask(t,this.clock(),{allowPastOnce:true})).filter(k=>k!=='endDate').length===0);return true;}catch{return false;}}
  get(id){return this.tasks.find(t=>t.id===id)||null;}
  save(draft){const errors=validateTask(draft,this.clock(),{allowPastOnce:!!this.get(draft.id)});if(Object.keys(errors).length)return{ok:false,errors};const existing=this.get(draft.id);const task={...clone(draft),id:existing?.id||this.id(),title:draft.title.trim(),prompt:draft.prompt.trim(),status:existing?.status||'active',runs:clone(existing?.runs||[]),createdAt:existing?.createdAt||new Date(this.clock()).toISOString(),revision:(existing?.revision||0)+1};if(existing)this.tasks=this.tasks.map(t=>t.id===existing.id?task:t);else this.tasks.unshift(task);this.notify();return{ok:true,task};}
  setStatus(id,status){const task=this.get(id);if(!task||!['active','paused'].includes(status)||task.status==='completed')return false;task.status=status;task.revision++;this.notify();return true;}
  delete(id){const task=this.get(id);if(!task)return false;this.tasks=this.tasks.filter(t=>t.id!==id);this.notify();return true;}
  startRun(id){const task=this.get(id);if(!task)return null;const current=task.runs.find(r=>r.status==='running');if(current)return current;const run={id:this.id(),status:'running',createdAt:new Date(this.clock()).toISOString(),title:task.title,content:'',unread:false};task.runs.unshift(run);this.notify();return run;}
  completeRun(id,runId,{failed=false}={}){const task=this.get(id);const run=task?.runs.find(r=>r.id===runId);if(!run||run.status!=='running')return false;run.status=failed?'failed':'completed';run.unread=true;run.content=failed?'The local preview could not finish. Try running this task again.':`Your scheduled update is ready.\n\nThis is a local example result for “${task.title}”. The interface saved your instructions and schedule. No AI request, connected app, or background job was executed.`;run.finishedAt=new Date(this.clock()).toISOString();if(task.schedule.frequency==='once'&&!failed)task.status='completed';this.notify();return true;}
  markRead(id,runId){const run=this.get(id)?.runs.find(r=>r.id===runId);if(run){run.unread=false;this.notify();}}
}
export function seedTasks(now=Date.parse('2026-10-06T08:00:00Z')) {
  const base=defaultSchedule(now);const make=(id,title,prompt,schedule,status='active')=>({id,title,prompt,schedule:{...base,...schedule},status,revision:1,createdAt:'2026-10-01T08:00:00Z',runs:[]});
  return [make('daily-brief','Daily brief','Summarize my day, the important news, and the priorities worth focusing on.',{frequency:'weekdays',time:'09:00'}),make('weekly-review','Weekly review','Help me reflect on this week and prepare a short plan for the next one.',{frequency:'weekly',days:[5],time:'16:00'}),make('reading','Evening reading','Remind me to set aside twenty minutes to read.',{time:'20:30'},'paused')];
}
