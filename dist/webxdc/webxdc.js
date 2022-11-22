(()=>{"use strict";const e=["debug","log","info","warn","error"];function n(e,n,t){const o=console[e].bind(null,`%c${n}`,t);window.console[e]=o,console[e]=o}const t=`ws://${document.location.host}/webxdc`,o=new class{messageListener=null;constructor(e){this.socket=new WebSocket(e),this.promise=new Promise(((e,n)=>{this.resolveInfo=e}))}send(e){this.socket.send(JSON.stringify(e))}onMessage(e){null!=this.messageListener&&this.socket.removeEventListener("message",this.messageListener);const n=n=>{e(JSON.parse(n.data))};this.messageListener=n,this.socket.addEventListener("message",n)}onConnect(e){const n=this.socket.readyState;if(0===n)this.socket.addEventListener("open",e);else{if(1!==n)throw new Error(`SocketTransport: socket not ready: ${n}`);e()}}clear(){window.localStorage.clear(),window.sessionStorage.clear(),window.location.reload()}address(){return`instance@${document.location.port}`}name(){return`Instance ${document.location.port}`}setInfo(e){this.resolveInfo(e)}async getInfo(){return this.promise}}(t);window.webxdc=function(e,n=(()=>{})){let t=null;return{sendUpdate:(t,o)=>{e.send({type:"sendUpdate",update:t,descr:o}),n("send",{update:t,descr:o})},setUpdateListener:(o,s=0)=>(e.onMessage((s=>{if("updates"===s.type){n("recv",s.updates);for(const e of s.updates)o(e);null!=t&&(t(),t=null)}else"clear"!==s.type?function(e){return"info"===e.type}(s)?(n("info",s.info),e.setInfo(s.info)):function(e){return"delete"===e.type}(s)&&(n("delete"),window.top?.close()):(n("clear"),e.clear())})),e.onConnect((()=>{e.send({type:"requestInfo"}),e.send({type:"setUpdateListener",serial:s})})),new Promise((e=>{t=e}))),selfAddr:e.address(),selfName:e.name()}}(o,((...e)=>{console.info(...e)})),async function(t,o){const s=`color:white;font-weight:bold;border-radius:4px;padding:2px;background: ${(await o.getInfo()).color}`;for(const o of e)n(o,t,s)}(document.location.port,o),window.addEventListener("load",(()=>async function(e,n){const t=await n.getInfo();let o=document.getElementsByTagName("title")[0];null==o&&(o=document.createElement("title"),document.getElementsByTagName("head")[0].append(o)),o.innerText=`${e} - ${t.name}`}(window.webxdc.selfName,o))),window.addEventListener("message",(e=>{-1!==e.origin.indexOf("localhost:")&&"reload"===e.data&&window.location.reload()}))})();