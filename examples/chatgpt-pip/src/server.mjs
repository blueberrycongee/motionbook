import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4317);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  let local=url.pathname==='/'?'public/index.html':url.pathname.startsWith('/src/')?url.pathname.slice(1):`public/${url.pathname.slice(1)}`;
  const target=path.resolve(root,local);
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(target);
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`PiP replica lab: http://127.0.0.1:${port}`));
process.on('SIGTERM',()=>server.close());
