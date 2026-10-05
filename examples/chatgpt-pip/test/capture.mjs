// Runtime UI QA for environments that permit Chromium. NOT run successfully on the delivered Linux host.
import {createRequire} from 'node:module';import {spawn} from 'node:child_process';import path from 'node:path';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');const root=path.resolve(import.meta.dirname,'..');
const port=process.env.PIP_TEST_PORT||'4318';const server=spawn(process.execPath,['src/server.mjs'],{cwd:root,env:{...process.env,PORT:port},stdio:['ignore','pipe','inherit']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Test server exited: '+code)))});
let browser;
try {
 await fs.mkdir(path.join(root,'artifacts/runtime'),{recursive:true});
 browser=await chromium.launch({headless:true,...process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{},args:process.env.PIP_NO_SANDBOX==='1'?['--no-sandbox']:[]});
 const context=await browser.newContext({viewport:{width:1280,height:900},recordVideo:{dir:path.join(root,'artifacts/runtime'),size:{width:1280,height:900}}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${port}/?capture`);await page.waitForFunction(()=>window.replica?.ready);
 await page.getByRole('button',{name:/Start browser task/}).click();await page.waitForFunction(()=>document.querySelector('#frame-count').textContent==='1');
 await page.screenshot({path:path.join(root,'artifacts/runtime/01-initial.png')});
 const id=await page.evaluate(()=>replica.snapshot().frames[0].presentationID);
 await page.getByRole('button',{name:/Deliver next screenshot/}).click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Screenshot updated');
 assert.equal(await page.evaluate(()=>replica.snapshot().frames[0].presentationID),id);
 await page.getByRole('button',{name:/Add second browser tab/}).click();await page.waitForFunction(()=>document.querySelector('#frame-count').textContent==='2');
 await page.getByRole('button',{name:'Focus original tab second-tab'}).click();await page.waitForFunction(()=>document.querySelector('#workspace').classList.contains('focused'));
 await page.screenshot({path:path.join(root,'artifacts/runtime/02-focused.png')});
 await page.getByRole('button',{name:'Close focused fixture'}).click();assert.equal(await page.locator('.pip:not(.removed)').count(),2);
 await page.getByRole('button',{name:/End browser turn/}).click();await page.waitForFunction(()=>document.querySelectorAll('.pip').length===0);
 await page.getByLabel('Visual profile').selectOption('native');await page.getByRole('button',{name:/Start browser task/}).click();
 await page.getByRole('button',{name:/Show completion effect/}).click();await page.waitForSelector('[data-completion-stage="miniCheckmark"]');
 await page.screenshot({path:path.join(root,'artifacts/runtime/03-native-effect.png')});
 await page.locator('.pip.stack-front').hover();await page.waitForTimeout(160);await page.screenshot({path:path.join(root,'artifacts/runtime/04-hover.png')});
 await page.getByLabel('Presentation placement').selectOption('home');await page.locator('.pip.stack-front').hover();await page.getByRole('button',{name:'Hide Picture-in-Picture'}).filter({visible:true}).first().click();await page.getByRole('menuitem',{name:'Hide for this task',exact:true}).click();assert.equal(await page.locator('.pip.stack-front').isVisible(),false);
 await page.getByRole('button',{name:'Show again'}).click();await page.getByLabel('Presentation placement').selectOption('pet');await page.screenshot({path:path.join(root,'artifacts/runtime/05-pet-placement.png')});
 await page.getByRole('button',{name:'Reset fixture'}).click();await page.waitForFunction(()=>document.querySelectorAll('.pip').length===0);
 assert.deepEqual(errors,[]);await context.close();
 await fs.writeFile(path.join(root,'artifacts/runtime/result.json'),JSON.stringify({passed:true,checks:['initial screenshot','in-place update','multi-tab stack','click focus','dismissal preserves preview','turn cleanup','native completion stages','reset cleanup','no page errors']},null,2));
 console.log('Runtime UI QA passed. Actual browser screenshots/video are in artifacts/runtime/.');
} finally {await browser?.close();server.kill('SIGTERM');}
