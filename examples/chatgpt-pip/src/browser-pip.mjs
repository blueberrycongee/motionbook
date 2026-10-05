/** Clean-room implementation of observable Browser Use PiP metadata lifecycle.
 * Evidence: 26.930.51102 main bundle Xre/Zre, browser-pip-raw.js.
 * This is deliberately not a copy of the vendor bundle.
 */
export const presentationID = (threadID, browserID, tabID) =>
  `browser:${JSON.stringify([threadID, browserID, tabID])}`;
const sessionID = (threadID, browserID) => JSON.stringify([threadID, browserID]);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const terminal = new Set(['turn/completed', 'thread/archived', 'thread/closed', 'thread/deleted']);

export const sourceServerAllowed = server => ['node_repl','cua_repl'].includes(server);
export function parseBrowserNotification(event, acceptServer = sourceServerAllowed) {
  const params = event?.params, item = params?.item;
  if (event?.method !== 'item/completed' || !nonempty(params?.threadId) ||
      item?.type !== 'mcpToolCall' || !nonempty(item.server) || !acceptServer(item.server)) return null;
  const surface = item.result?._meta?.['codex/toolSurface'];
  if (!surface || surface.kind !== 'browserUse' || !['iab','chrome','cdp','mcpapps'].includes(surface.backend) ||
      !nonempty(surface.browserId)) return null;
  if (surface.openTabIds !== undefined && (!Array.isArray(surface.openTabIds) || !surface.openTabIds.every(nonempty))) return null;
  if (surface.sessionEnded !== undefined && surface.sessionEnded !== true) return null;
  if (surface.extensionInstanceId !== undefined && !nonempty(surface.extensionInstanceId)) return null;
  if (surface.screenshot !== undefined && (!nonempty(surface.screenshot?.tabId) ||
      typeof surface.screenshot?.url !== 'string' || !surface.screenshot.url.startsWith('data:image/'))) return null;
  return {threadID: params.threadId, surface};
}

export class BrowserPIPController {
  constructor({onFrame = () => {}, onRemove = () => {}, onActivity = () => {}, onFocus = () => false,
    acceptServer = sourceServerAllowed} = {}) {
    this.sessions = new Map();
    this.frames = new Map();
    this.targets = new Map();
    this.activity = new Map();
    this.handlers = {onFrame,onRemove,onActivity,onFocus,acceptServer};
    this.disposed = false;
  }
  handle(event) {
    if (this.disposed) return false;
    const parsed = parseBrowserNotification(event, this.handlers.acceptServer);
    if (!parsed) {
      if (terminal.has(event?.method) && nonempty(event.params?.threadId)) {
        this.removeThread(event.params.threadId); return true;
      }
      return false;
    }
    const {threadID, surface} = parsed;
    const key = sessionID(threadID, surface.browserId);
    let session = this.sessions.get(key);
    const hasContent = surface.openTabIds === undefined
      ? session !== undefined || surface.screenshot !== undefined : surface.openTabIds.length > 0;
    if (surface.sessionEnded || !hasContent) { this.removeSession(key); return true; }
    if (!session) {
      session = {threadID, tabs: new Map()}; this.sessions.set(key, session);
      const count = this.activity.get(threadID) || 0;
      this.activity.set(threadID, count + 1);
      if (count === 0) this.handlers.onActivity(threadID, true);
    }
    if (surface.screenshot) {
      const {tabId, url} = surface.screenshot;
      const id = presentationID(threadID, surface.browserId, tabId);
      session.tabs.set(tabId, id);
      const frame = {presentationID:id, threadID, tabID:tabId, backend:surface.backend, imageDataURL:url};
      this.frames.set(id, frame);
      this.handlers.onFrame(frame);
      if (surface.backend === 'iab') this.targets.set(id, {backend:'iab',sessionID:threadID,tabID:tabId});
      if (surface.backend === 'chrome' && surface.extensionInstanceId)
        this.targets.set(id,{backend:'chrome',sessionID:threadID,tabID:tabId,extensionInstanceID:surface.extensionInstanceId});
    }
    if (surface.openTabIds) {
      const open = new Set(surface.openTabIds);
      for (const [tabId,id] of session.tabs) if (!open.has(tabId)) {
        this.removeFrame(id); session.tabs.delete(tabId);
      }
    }
    return true;
  }
  removeFrame(id) {
    this.handlers.onRemove(id); this.frames.delete(id); this.targets.delete(id);
  }
  removeSession(key) {
    const session = this.sessions.get(key); if (!session) return;
    for (const id of session.tabs.values()) this.removeFrame(id);
    this.sessions.delete(key);
    const count = this.activity.get(session.threadID) || 0;
    if (count <= 1) { this.activity.delete(session.threadID); this.handlers.onActivity(session.threadID,false); }
    else this.activity.set(session.threadID,count - 1);
  }
  removeThread(threadID) {
    for (const [key,session] of this.sessions) if (session.threadID === threadID) this.removeSession(key);
  }
  async click(id) {
    const target = this.targets.get(id);
    return target ? Boolean(await this.handlers.onFocus({...target})) : false;
  }
  dispose() {
    for (const key of this.sessions.keys()) this.removeSession(key);
    this.disposed = true;
  }
  snapshot() {
    return {frames:[...this.frames.values()], activeThreads:[...this.activity.keys()], sessionCount:this.sessions.size};
  }
}

export function fixtureNotification({threadID='fixture-thread',browserID='fixture-browser',tabID='fixture-tab',
  imageDataURL,backend='iab',openTabIds=[tabID],extensionInstanceId}={}) {
  const surface = {kind:'browserUse',backend,browserId:browserID,openTabIds};
  if (imageDataURL) surface.screenshot = {tabId:tabID,url:imageDataURL};
  if (extensionInstanceId) surface.extensionInstanceId = extensionInstanceId;
  return {method:'item/completed',params:{threadId:threadID,item:{type:'mcpToolCall',server:'cua_repl',result:{_meta:{'codex/toolSurface':surface}}}}};
}
