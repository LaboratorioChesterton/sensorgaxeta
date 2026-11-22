// ---- 00-vendor-supabase.min.js ----
// VENDOR (não editar): trecho literal do pacote publicado em 11/2026.
// Contém @supabase/supabase-js, o núcleo do Capacitor usado pelos módulos web-*.js e os ícones Lucide.
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function r(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=r(n);fetch(n.href,i)}})();const Gr=(t,e,r=[])=>{const s=document.createElementNS("http://www.w3.org/2000/svg",t);return Object.keys(e).forEach(n=>{s.setAttribute(n,String(e[n]))}),r.length&&r.forEach(n=>{const i=Gr(...n);s.appendChild(i)}),s};var Is=([t,e,r])=>Gr(t,e,r);const xs=t=>Array.from(t.attributes).reduce((e,r)=>(e[r.name]=r.value,e),{}),js=t=>typeof t=="string"?t:!t||!t.class?"":t.class&&typeof t.class=="string"?t.class.split(" "):t.class&&Array.isArray(t.class)?t.class:"",Ls=t=>t.flatMap(js).map(r=>r.trim()).filter(Boolean).filter((r,s,n)=>n.indexOf(r)===s).join(" "),Ns=t=>t.replace(/(\w)(\w*)(_|-|\s*)/g,(e,r,s)=>r.toUpperCase()+s.toLowerCase()),hr=(t,{nameAttr:e,icons:r,attrs:s})=>{const n=t.getAttribute(e);if(n==null)return;const i=Ns(n),a=r[i];if(!a)return console.warn(`${t.outerHTML} icon name was not found in the provided icons object.`);const o=xs(t),[l,c,h]=a,p={...c,"data-lucide":n,...s,...o},f=Ls(["lucide",`lucide-${n}`,o,s]);f&&Object.assign(p,{class:f});const g=Is([l,p,h]);return t.parentNode?.replaceChild(g,t)};const H={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};const Ds=["svg",H,[["path",{d:"m7 7 10 10-5 5V2l5 5L7 17"}],["path",{d:"M20.83 14.83a4 4 0 0 0 0-5.66"}],["path",{d:"M18 12h.01"}]]];const Us=["svg",H,[["path",{d:"m7 7 10 10-5 5V2l5 5L7 17"}]]];const Bs=["svg",H,[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]]];const qs=["svg",H,[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"}],["path",{d:"M10 6h4"}],["path",{d:"M10 10h4"}],["path",{d:"M10 14h4"}],["path",{d:"M10 18h4"}]]];const Ms=["svg",H,[["path",{d:"M12 16v5"}],["path",{d:"M16 14v7"}],["path",{d:"M20 10v11"}],["path",{d:"m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"}],["path",{d:"M4 18v3"}],["path",{d:"M8 14v7"}]]];const Fs=["svg",H,[["path",{d:"m9 18 6-6-6-6"}]]];const Vs=["svg",H,[["path",{d:"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"}],["path",{d:"M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"}],["path",{d:"M12 2v2"}],["path",{d:"M12 22v-2"}],["path",{d:"m17 20.66-1-1.73"}],["path",{d:"M11 10.27 7 3.34"}],["path",{d:"m20.66 17-1.73-1"}],["path",{d:"m3.34 7 1.73 1"}],["path",{d:"M14 12h8"}],["path",{d:"M2 12h2"}],["path",{d:"m20.66 7-1.73 1"}],["path",{d:"m3.34 17 1.73-1"}],["path",{d:"m17 3.34-1 1.73"}],["path",{d:"m11 13.73-4 6.93"}]]];const Ws=["svg",H,[["path",{d:"M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M17 18h1"}],["path",{d:"M12 18h1"}],["path",{d:"M7 18h1"}]]];const Hs=["svg",H,[["path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"}]]];const Ks=["svg",H,[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1"}]]];const zs=["svg",H,[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]]];const Gs=["svg",H,[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"}],["path",{d:"M12 12V8"}]]];const Js=["svg",H,[["path",{d:"M5 12h14"}],["path",{d:"M12 5v14"}]]];const Ys=["svg",H,[["path",{d:"M4.9 19.1C1 15.2 1 8.8 4.9 4.9"}],["path",{d:"M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"}],["circle",{cx:"12",cy:"12",r:"2"}],["path",{d:"M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"}],["path",{d:"M19.1 4.9C23 8.8 23 15.1 19.1 19"}]]];const Xs=["svg",H,[["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2"}],["path",{d:"M6.01 18H6"}],["path",{d:"M10.01 18H10"}],["path",{d:"M15 10v4"}],["path",{d:"M17.84 7.17a4 4 0 0 0-5.66 0"}],["path",{d:"M20.66 4.34a8 8 0 0 0-11.31 0"}]]];const Qs=["svg",H,[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]]];const Zs=["svg",H,[["path",{d:"M12 20h.01"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0"}]]];const en=({icons:t={},nameAttr:e="data-lucide",attrs:r={}}={})=>{if(!Object.values(t).length)throw new Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(typeof document>"u")throw new Error("`createIcons()` only works in a browser environment.");const s=document.querySelectorAll(`[${e}]`);if(Array.from(s).forEach(n=>hr(n,{nameAttr:e,icons:t,attrs:r})),e==="data-lucide"){const n=document.querySelectorAll("[icon-name]");n.length>0&&(console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"),Array.from(n).forEach(i=>hr(i,{nameAttr:"icon-name",icons:t,attrs:r})))}};function tn(t,e,r,s){function n(i){return i instanceof r?i:new r(function(a){a(i)})}return new(r||(r=Promise))(function(i,a){function o(h){try{c(s.next(h))}catch(p){a(p)}}function l(h){try{c(s.throw(h))}catch(p){a(p)}}function c(h){h.done?i(h.value):n(h.value).then(o,l)}c((s=s.apply(t,e||[])).next())})}const rn=t=>t?(...e)=>t(...e):(...e)=>fetch(...e);class er extends Error{constructor(e,r="FunctionsError",s){super(e),this.name=r,this.context=s}}class sn extends er{constructor(e){super("Failed to send a request to the Edge Function","FunctionsFetchError",e)}}class fr extends er{constructor(e){super("Relay Error invoking the Edge Function","FunctionsRelayError",e)}}class pr extends er{constructor(e){super("Edge Function returned a non-2xx status code","FunctionsHttpError",e)}}var Ut;(function(t){t.Any="any",t.ApNortheast1="ap-northeast-1",t.ApNortheast2="ap-northeast-2",t.ApSouth1="ap-south-1",t.ApSoutheast1="ap-southeast-1",t.ApSoutheast2="ap-southeast-2",t.CaCentral1="ca-central-1",t.EuCentral1="eu-central-1",t.EuWest1="eu-west-1",t.EuWest2="eu-west-2",t.EuWest3="eu-west-3",t.SaEast1="sa-east-1",t.UsEast1="us-east-1",t.UsWest1="us-west-1",t.UsWest2="us-west-2"})(Ut||(Ut={}));class nn{constructor(e,{headers:r={},customFetch:s,region:n=Ut.Any}={}){this.url=e,this.headers=r,this.region=n,this.fetch=rn(s)}setAuth(e){this.headers.Authorization=`Bearer ${e}`}invoke(e){return tn(this,arguments,void 0,function*(r,s={}){var n;let i,a;try{const{headers:o,method:l,body:c,signal:h,timeout:p}=s;let f={},{region:g}=s;g||(g=this.region);const m=new URL(`${this.url}/${r}`);g&&g!=="any"&&(f["x-region"]=g,m.searchParams.set("forceFunctionRegion",g));let w;c&&(o&&!Object.prototype.hasOwnProperty.call(o,"Content-Type")||!o)?typeof Blob<"u"&&c instanceof Blob||c instanceof ArrayBuffer?(f["Content-Type"]="application/octet-stream",w=c):typeof c=="string"?(f["Content-Type"]="text/plain",w=c):typeof FormData<"u"&&c instanceof FormData?w=c:(f["Content-Type"]="application/json",w=JSON.stringify(c)):w=c;let v=h;p&&(a=new AbortController,i=setTimeout(()=>a.abort(),p),h?(v=a.signal,h.addEventListener("abort",()=>a.abort())):v=a.signal);const _=yield this.fetch(m.toString(),{method:l||"POST",headers:Object.assign(Object.assign(Object.assign({},f),this.headers),o),body:w,signal:v}).catch(N=>{throw new sn(N)}),E=_.headers.get("x-relay-error");if(E&&E==="true")throw new fr(_);if(!_.ok)throw new pr(_);let y=((n=_.headers.get("Content-Type"))!==null&&n!==void 0?n:"text/plain").split(";")[0].trim(),T;return y==="application/json"?T=yield _.json():y==="application/octet-stream"||y==="application/pdf"?T=yield _.blob():y==="text/event-stream"?T=_:y==="multipart/form-data"?T=yield _.formData():T=yield _.text(),{data:T,error:null,response:_}}catch(o){return{data:null,error:o,response:o instanceof pr||o instanceof fr?o.context:void 0}}finally{i&&clearTimeout(i)}})}}var an=class extends Error{constructor(t){super(t.message),this.name="PostgrestError",this.details=t.details,this.hint=t.hint,this.code=t.code}},on=class{constructor(t){var e,r;this.shouldThrowOnError=!1,this.method=t.method,this.url=t.url,this.headers=new Headers(t.headers),this.schema=t.schema,this.body=t.body,this.shouldThrowOnError=(e=t.shouldThrowOnError)!==null&&e!==void 0?e:!1,this.signal=t.signal,this.isMaybeSingle=(r=t.isMaybeSingle)!==null&&r!==void 0?r:!1,t.fetch?this.fetch=t.fetch:this.fetch=fetch}throwOnError(){return this.shouldThrowOnError=!0,this}setHeader(t,e){return this.headers=new Headers(this.headers),this.headers.set(t,e),this}then(t,e){var r=this;this.schema===void 0||(["GET","HEAD"].includes(this.method)?this.headers.set("Accept-Profile",this.schema):this.headers.set("Content-Profile",this.schema)),this.method!=="GET"&&this.method!=="HEAD"&&this.headers.set("Content-Type","application/json");const s=this.fetch;let n=s(this.url.toString(),{method:this.method,headers:this.headers,body:JSON.stringify(this.body),signal:this.signal}).then(async i=>{let a=null,o=null,l=null,c=i.status,h=i.statusText;if(i.ok){var p,f;if(r.method!=="HEAD"){var g;const _=await i.text();_===""||(r.headers.get("Accept")==="text/csv"||r.headers.get("Accept")&&(!((g=r.headers.get("Accept"))===null||g===void 0)&&g.includes("application/vnd.pgrst.plan+text"))?o=_:o=JSON.parse(_))}const w=(p=r.headers.get("Prefer"))===null||p===void 0?void 0:p.match(/count=(exact|planned|estimated)/),v=(f=i.headers.get("content-range"))===null||f===void 0?void 0:f.split("/");w&&v&&v.length>1&&(l=parseInt(v[1])),r.isMaybeSingle&&r.method==="GET"&&Array.isArray(o)&&(o.length>1?(a={code:"PGRST116",details:`Results contain ${o.length} rows, application/vnd.pgrst.object+json requires 1 row`,hint:null,message:"JSON object requested, multiple (or no) rows returned"},o=null,l=null,c=406,h="Not Acceptable"):o.length===1?o=o[0]:o=null)}else{var m;const w=await i.text();try{a=JSON.parse(w),Array.isArray(a)&&i.status===404&&(o=[],a=null,c=200,h="OK")}catch{i.status===404&&w===""?(c=204,h="No Content"):a={message:w}}if(a&&r.isMaybeSingle&&(!(a==null||(m=a.details)===null||m===void 0)&&m.includes("0 rows"))&&(a=null,c=200,h="OK"),a&&r.shouldThrowOnError)throw new an(a)}return{error:a,data:o,count:l,status:c,statusText:h}});return this.shouldThrowOnError||(n=n.catch(i=>{var a;let o="";const l=i?.cause;if(l){var c,h,p,f;const m=(c=l?.message)!==null&&c!==void 0?c:"",w=(h=l?.code)!==null&&h!==void 0?h:"";o=`${(p=i?.name)!==null&&p!==void 0?p:"FetchError"}: ${i?.message}`,o+=`

Caused by: ${(f=l?.name)!==null&&f!==void 0?f:"Error"}: ${m}`,w&&(o+=` (${w})`),l?.stack&&(o+=`
${l.stack}`)}else{var g;o=(g=i?.stack)!==null&&g!==void 0?g:""}return{error:{message:`${(a=i?.name)!==null&&a!==void 0?a:"FetchError"}: ${i?.message}`,details:o,hint:"",code:""},data:null,count:null,status:0,statusText:""}})),n.then(t,e)}returns(){return this}overrideTypes(){return this}},ln=class extends on{select(t){let e=!1;const r=(t??"*").split("").map(s=>/\s/.test(s)&&!e?"":(s==='"'&&(e=!e),s)).join("");return this.url.searchParams.set("select",r),this.headers.append("Prefer","return=representation"),this}order(t,{ascending:e=!0,nullsFirst:r,foreignTable:s,referencedTable:n=s}={}){const i=n?`${n}.order`:"order",a=this.url.searchParams.get(i);return this.url.searchParams.set(i,`${a?`${a},`:""}${t}.${e?"asc":"desc"}${r===void 0?"":r?".nullsfirst":".nullslast"}`),this}limit(t,{foreignTable:e,referencedTable:r=e}={}){const s=typeof r>"u"?"limit":`${r}.limit`;return this.url.searchParams.set(s,`${t}`),this}range(t,e,{foreignTable:r,referencedTable:s=r}={}){const n=typeof s>"u"?"offset":`${s}.offset`,i=typeof s>"u"?"limit":`${s}.limit`;return this.url.searchParams.set(n,`${t}`),this.url.searchParams.set(i,`${e-t+1}`),this}abortSignal(t){return this.signal=t,this}single(){return this.headers.set("Accept","application/vnd.pgrst.object+json"),this}maybeSingle(){return this.method==="GET"?this.headers.set("Accept","application/json"):this.headers.set("Accept","application/vnd.pgrst.object+json"),this.isMaybeSingle=!0,this}csv(){return this.headers.set("Accept","text/csv"),this}geojson(){return this.headers.set("Accept","application/geo+json"),this}explain({analyze:t=!1,verbose:e=!1,settings:r=!1,buffers:s=!1,wal:n=!1,format:i="text"}={}){var a;const o=[t?"analyze":null,e?"verbose":null,r?"settings":null,s?"buffers":null,n?"wal":null].filter(Boolean).join("|"),l=(a=this.headers.get("Accept"))!==null&&a!==void 0?a:"application/json";return this.headers.set("Accept",`application/vnd.pgrst.plan+${i}; for="${l}"; options=${o};`),i==="json"?this:this}rollback(){return this.headers.append("Prefer","tx=rollback"),this}returns(){return this}maxAffected(t){return this.headers.append("Prefer","handling=strict"),this.headers.append("Prefer",`max-affected=${t}`),this}};const gr=new RegExp("[,()]");var Le=class extends ln{eq(t,e){return this.url.searchParams.append(t,`eq.${e}`),this}neq(t,e){return this.url.searchParams.append(t,`neq.${e}`),this}gt(t,e){return this.url.searchParams.append(t,`gt.${e}`),this}gte(t,e){return this.url.searchParams.append(t,`gte.${e}`),this}lt(t,e){return this.url.searchParams.append(t,`lt.${e}`),this}lte(t,e){return this.url.searchParams.append(t,`lte.${e}`),this}like(t,e){return this.url.searchParams.append(t,`like.${e}`),this}likeAllOf(t,e){return this.url.searchParams.append(t,`like(all).{${e.join(",")}}`),this}likeAnyOf(t,e){return this.url.searchParams.append(t,`like(any).{${e.join(",")}}`),this}ilike(t,e){return this.url.searchParams.append(t,`ilike.${e}`),this}ilikeAllOf(t,e){return this.url.searchParams.append(t,`ilike(all).{${e.join(",")}}`),this}ilikeAnyOf(t,e){return this.url.searchParams.append(t,`ilike(any).{${e.join(",")}}`),this}regexMatch(t,e){return this.url.searchParams.append(t,`match.${e}`),this}regexIMatch(t,e){return this.url.searchParams.append(t,`imatch.${e}`),this}is(t,e){return this.url.searchParams.append(t,`is.${e}`),this}isDistinct(t,e){return this.url.searchParams.append(t,`isdistinct.${e}`),this}in(t,e){const r=Array.from(new Set(e)).map(s=>typeof s=="string"&&gr.test(s)?`"${s}"`:`${s}`).join(",");return this.url.searchParams.append(t,`in.(${r})`),this}notIn(t,e){const r=Array.from(new Set(e)).map(s=>typeof s=="string"&&gr.test(s)?`"${s}"`:`${s}`).join(",");return this.url.searchParams.append(t,`not.in.(${r})`),this}contains(t,e){return typeof e=="string"?this.url.searchParams.append(t,`cs.${e}`):Array.isArray(e)?this.url.searchParams.append(t,`cs.{${e.join(",")}}`):this.url.searchParams.append(t,`cs.${JSON.stringify(e)}`),this}containedBy(t,e){return typeof e=="string"?this.url.searchParams.append(t,`cd.${e}`):Array.isArray(e)?this.url.searchParams.append(t,`cd.{${e.join(",")}}`):this.url.searchParams.append(t,`cd.${JSON.stringify(e)}`),this}rangeGt(t,e){return this.url.searchParams.append(t,`sr.${e}`),this}rangeGte(t,e){return this.url.searchParams.append(t,`nxl.${e}`),this}rangeLt(t,e){return this.url.searchParams.append(t,`sl.${e}`),this}rangeLte(t,e){return this.url.searchParams.append(t,`nxr.${e}`),this}rangeAdjacent(t,e){return this.url.searchParams.append(t,`adj.${e}`),this}overlaps(t,e){return typeof e=="string"?this.url.searchParams.append(t,`ov.${e}`):this.url.searchParams.append(t,`ov.{${e.join(",")}}`),this}textSearch(t,e,{config:r,type:s}={}){let n="";s==="plain"?n="pl":s==="phrase"?n="ph":s==="websearch"&&(n="w");const i=r===void 0?"":`(${r})`;return this.url.searchParams.append(t,`${n}fts${i}.${e}`),this}match(t){return Object.entries(t).forEach(([e,r])=>{this.url.searchParams.append(e,`eq.${r}`)}),this}not(t,e,r){return this.url.searchParams.append(t,`not.${e}.${r}`),this}or(t,{foreignTable:e,referencedTable:r=e}={}){const s=r?`${r}.or`:"or";return this.url.searchParams.append(s,`(${t})`),this}filter(t,e,r){return this.url.searchParams.append(t,`${e}.${r}`),this}},cn=class{constructor(t,{headers:e={},schema:r,fetch:s}){this.url=t,this.headers=new Headers(e),this.schema=r,this.fetch=s}select(t,e){const{head:r=!1,count:s}=e??{},n=r?"HEAD":"GET";let i=!1;const a=(t??"*").split("").map(o=>/\s/.test(o)&&!i?"":(o==='"'&&(i=!i),o)).join("");return this.url.searchParams.set("select",a),s&&this.headers.append("Prefer",`count=${s}`),new Le({method:n,url:this.url,headers:this.headers,schema:this.schema,fetch:this.fetch})}insert(t,{count:e,defaultToNull:r=!0}={}){var s;const n="POST";if(e&&this.headers.append("Prefer",`count=${e}`),r||this.headers.append("Prefer","missing=default"),Array.isArray(t)){const i=t.reduce((a,o)=>a.concat(Object.keys(o)),[]);if(i.length>0){const a=[...new Set(i)].map(o=>`"${o}"`);this.url.searchParams.set("columns",a.join(","))}}return new Le({method:n,url:this.url,headers:this.headers,schema:this.schema,body:t,fetch:(s=this.fetch)!==null&&s!==void 0?s:fetch})}upsert(t,{onConflict:e,ignoreDuplicates:r=!1,count:s,defaultToNull:n=!0}={}){var i;const a="POST";if(this.headers.append("Prefer",`resolution=${r?"ignore":"merge"}-duplicates`),e!==void 0&&this.url.searchParams.set("on_conflict",e),s&&this.headers.append("Prefer",`count=${s}`),n||this.headers.append("Prefer","missing=default"),Array.isArray(t)){const o=t.reduce((l,c)=>l.concat(Object.keys(c)),[]);if(o.length>0){const l=[...new Set(o)].map(c=>`"${c}"`);this.url.searchParams.set("columns",l.join(","))}}return new Le({method:a,url:this.url,headers:this.headers,schema:this.schema,body:t,fetch:(i=this.fetch)!==null&&i!==void 0?i:fetch})}update(t,{count:e}={}){var r;const s="PATCH";return e&&this.headers.append("Prefer",`count=${e}`),new Le({method:s,url:this.url,headers:this.headers,schema:this.schema,body:t,fetch:(r=this.fetch)!==null&&r!==void 0?r:fetch})}delete({count:t}={}){var e;const r="DELETE";return t&&this.headers.append("Prefer",`count=${t}`),new Le({method:r,url:this.url,headers:this.headers,schema:this.schema,fetch:(e=this.fetch)!==null&&e!==void 0?e:fetch})}},un=class Jr{constructor(e,{headers:r={},schema:s,fetch:n}={}){this.url=e,this.headers=new Headers(r),this.schemaName=s,this.fetch=n}from(e){if(!e||typeof e!="string"||e.trim()==="")throw new Error("Invalid relation name: relation must be a non-empty string.");return new cn(new URL(`${this.url}/${e}`),{headers:new Headers(this.headers),schema:this.schemaName,fetch:this.fetch})}schema(e){return new Jr(this.url,{headers:this.headers,schema:e,fetch:this.fetch})}rpc(e,r={},{head:s=!1,get:n=!1,count:i}={}){var a;let o;const l=new URL(`${this.url}/rpc/${e}`);let c;s||n?(o=s?"HEAD":"GET",Object.entries(r).filter(([p,f])=>f!==void 0).map(([p,f])=>[p,Array.isArray(f)?`{${f.join(",")}}`:`${f}`]).forEach(([p,f])=>{l.searchParams.append(p,f)})):(o="POST",c=r);const h=new Headers(this.headers);return i&&h.set("Prefer",`count=${i}`),new Le({method:o,url:l,headers:h,schema:this.schemaName,body:c,fetch:(a=this.fetch)!==null&&a!==void 0?a:fetch})}};class dn{constructor(){}static detectEnvironment(){var e;if(typeof WebSocket<"u")return{type:"native",constructor:WebSocket};if(typeof globalThis<"u"&&typeof globalThis.WebSocket<"u")return{type:"native",constructor:globalThis.WebSocket};if(typeof global<"u"&&typeof global.WebSocket<"u")return{type:"native",constructor:global.WebSocket};if(typeof globalThis<"u"&&typeof globalThis.WebSocketPair<"u"&&typeof globalThis.WebSocket>"u")return{type:"cloudflare",error:"Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",workaround:"Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."};if(typeof globalThis<"u"&&globalThis.EdgeRuntime||typeof navigator<"u"&&(!((e=navigator.userAgent)===null||e===void 0)&&e.includes("Vercel-Edge")))return{type:"unsupported",error:"Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",workaround:"Use serverless functions or a different deployment target for WebSocket functionality."};if(typeof process<"u"){const r=process.versions;if(r&&r.node){const s=r.node,n=parseInt(s.replace(/^v/,"").split(".")[0]);return n>=22?typeof globalThis.WebSocket<"u"?{type:"native",constructor:globalThis.WebSocket}:{type:"unsupported",error:`Node.js ${n} detected but native WebSocket not found.`,workaround:"Provide a WebSocket implementation via the transport option."}:{type:"unsupported",error:`Node.js ${n} detected without native WebSocket support.`,workaround:`For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })`}}}return{type:"unsupported",error:"Unknown JavaScript runtime without WebSocket support.",workaround:"Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."}}static getWebSocketConstructor(){const e=this.detectEnvironment();if(e.constructor)return e.constructor;let r=e.error||"WebSocket not supported in this environment.";throw e.workaround&&(r+=`

Suggested solution: ${e.workaround}`),new Error(r)}static createWebSocket(e,r){const s=this.getWebSocketConstructor();return new s(e,r)}static isWebSocketSupported(){try{const e=this.detectEnvironment();return e.type==="native"||e.type==="ws"}catch{return!1}}}const hn="2.89.0",fn=`realtime-js/${hn}`,Yr="1.0.0",pn="2.0.0",mr=Yr,Bt=1e4,gn=1e3,mn=100;var ge;(function(t){t[t.connecting=0]="connecting",t[t.open=1]="open",t[t.closing=2]="closing",t[t.closed=3]="closed"})(ge||(ge={}));var q;(function(t){t.closed="closed",t.errored="errored",t.joined="joined",t.joining="joining",t.leaving="leaving"})(q||(q={}));var ne;(function(t){t.close="phx_close",t.error="phx_error",t.join="phx_join",t.reply="phx_reply",t.leave="phx_leave",t.access_token="access_token"})(ne||(ne={}));var qt;(function(t){t.websocket="websocket"})(qt||(qt={}));var Ee;(function(t){t.Connecting="connecting",t.Open="open",t.Closing="closing",t.Closed="closed"})(Ee||(Ee={}));class wn{constructor(e){this.HEADER_LENGTH=1,this.USER_BROADCAST_PUSH_META_LENGTH=6,this.KINDS={userBroadcastPush:3,userBroadcast:4},this.BINARY_ENCODING=0,this.JSON_ENCODING=1,this.BROADCAST_EVENT="broadcast",this.allowedMetadataKeys=[],this.allowedMetadataKeys=e??[]}encode(e,r){if(e.event===this.BROADCAST_EVENT&&!(e.payload instanceof ArrayBuffer)&&typeof e.payload.event=="string")return r(this._binaryEncodeUserBroadcastPush(e));let s=[e.join_ref,e.ref,e.topic,e.event,e.payload];return r(JSON.stringify(s))}_binaryEncodeUserBroadcastPush(e){var r;return this._isArrayBuffer((r=e.payload)===null||r===void 0?void 0:r.payload)?this._encodeBinaryUserBroadcastPush(e):this._encodeJsonUserBroadcastPush(e)}_encodeBinaryUserBroadcastPush(e){var r,s;const n=(s=(r=e.payload)===null||r===void 0?void 0:r.payload)!==null&&s!==void 0?s:new ArrayBuffer(0);return this._encodeUserBroadcastPush(e,this.BINARY_ENCODING,n)}_encodeJsonUserBroadcastPush(e){var r,s;const n=(s=(r=e.payload)===null||r===void 0?void 0:r.payload)!==null&&s!==void 0?s:{},a=new TextEncoder().encode(JSON.stringify(n)).buffer;return this._encodeUserBroadcastPush(e,this.JSON_ENCODING,a)}_encodeUserBroadcastPush(e,r,s){var n,i;const a=e.topic,o=(n=e.ref)!==null&&n!==void 0?n:"",l=(i=e.join_ref)!==null&&i!==void 0?i:"",c=e.payload.event,h=this.allowedMetadataKeys?this._pick(e.payload,this.allowedMetadataKeys):{},p=Object.keys(h).length===0?"":JSON.stringify(h);if(l.length>255)throw new Error(`joinRef length ${l.length} exceeds maximum of 255`);if(o.length>255)throw new Error(`ref length ${o.length} exceeds maximum of 255`);if(a.length>255)throw new Error(`topic length ${a.length} exceeds maximum of 255`);if(c.length>255)throw new Error(`userEvent length ${c.length} exceeds maximum of 255`);if(p.length>255)throw new Error(`metadata length ${p.length} exceeds maximum of 255`);const f=this.USER_BROADCAST_PUSH_META_LENGTH+l.length+o.length+a.length+c.length+p.length,g=new ArrayBuffer(this.HEADER_LENGTH+f);let m=new DataView(g),w=0;m.setUint8(w++,this.KINDS.userBroadcastPush),m.setUint8(w++,l.length),m.setUint8(w++,o.length),m.setUint8(w++,a.length),m.setUint8(w++,c.length),m.setUint8(w++,p.length),m.setUint8(w++,r),Array.from(l,_=>m.setUint8(w++,_.charCodeAt(0))),Array.from(o,_=>m.setUint8(w++,_.charCodeAt(0))),Array.from(a,_=>m.setUint8(w++,_.charCodeAt(0))),Array.from(c,_=>m.setUint8(w++,_.charCodeAt(0))),Array.from(p,_=>m.setUint8(w++,_.charCodeAt(0)));var v=new Uint8Array(g.byteLength+s.byteLength);return v.set(new Uint8Array(g),0),v.set(new Uint8Array(s),g.byteLength),v.buffer}decode(e,r){if(this._isArrayBuffer(e)){let s=this._binaryDecode(e);return r(s)}if(typeof e=="string"){const s=JSON.parse(e),[n,i,a,o,l]=s;return r({join_ref:n,ref:i,topic:a,event:o,payload:l})}return r({})}_binaryDecode(e){const r=new DataView(e),s=r.getUint8(0),n=new TextDecoder;if(s===this.KINDS.userBroadcast)return this._decodeUserBroadcast(e,r,n)}_decodeUserBroadcast(e,r,s){const n=r.getUint8(1),i=r.getUint8(2),a=r.getUint8(3),o=r.getUint8(4);let l=this.HEADER_LENGTH+4;const c=s.decode(e.slice(l,l+n));l=l+n;const h=s.decode(e.slice(l,l+i));l=l+i;const p=s.decode(e.slice(l,l+a));l=l+a;const f=e.slice(l,e.byteLength),g=o===this.JSON_ENCODING?JSON.parse(s.decode(f)):f,m={type:this.BROADCAST_EVENT,event:h,payload:g};return a>0&&(m.meta=JSON.parse(p)),{join_ref:null,ref:null,topic:c,event:this.BROADCAST_EVENT,payload:m}}_isArrayBuffer(e){var r;return e instanceof ArrayBuffer||((r=e?.constructor)===null||r===void 0?void 0:r.name)==="ArrayBuffer"}_pick(e,r){return!e||typeof e!="object"?{}:Object.fromEntries(Object.entries(e).filter(([s])=>r.includes(s)))}}class Xr{constructor(e,r){this.callback=e,this.timerCalc=r,this.timer=void 0,this.tries=0,this.callback=e,this.timerCalc=r}reset(){this.tries=0,clearTimeout(this.timer),this.timer=void 0}scheduleTimeout(){clearTimeout(this.timer),this.timer=setTimeout(()=>{this.tries=this.tries+1,this.callback()},this.timerCalc(this.tries+1))}}var $;(function(t){t.abstime="abstime",t.bool="bool",t.date="date",t.daterange="daterange",t.float4="float4",t.float8="float8",t.int2="int2",t.int4="int4",t.int4range="int4range",t.int8="int8",t.int8range="int8range",t.json="json",t.jsonb="jsonb",t.money="money",t.numeric="numeric",t.oid="oid",t.reltime="reltime",t.text="text",t.time="time",t.timestamp="timestamp",t.timestamptz="timestamptz",t.timetz="timetz",t.tsrange="tsrange",t.tstzrange="tstzrange"})($||($={}));const wr=(t,e,r={})=>{var s;const n=(s=r.skipTypes)!==null&&s!==void 0?s:[];return e?Object.keys(e).reduce((i,a)=>(i[a]=vn(a,t,e,n),i),{}):{}},vn=(t,e,r,s)=>{const n=e.find(o=>o.name===t),i=n?.type,a=r[t];return i&&!s.includes(i)?Qr(i,a):Mt(a)},Qr=(t,e)=>{if(t.charAt(0)==="_"){const r=t.slice(1,t.length);return En(e,r)}switch(t){case $.bool:return yn(e);case $.float4:case $.float8:case $.int2:case $.int4:case $.int8:case $.numeric:case $.oid:return _n(e);case $.json:case $.jsonb:return bn(e);case $.timestamp:return Sn(e);case $.abstime:case $.date:case $.daterange:case $.int4range:case $.int8range:case $.money:case $.reltime:case $.text:case $.time:case $.timestamptz:case $.timetz:case $.tsrange:case $.tstzrange:return Mt(e);default:return Mt(e)}},Mt=t=>t,yn=t=>{switch(t){case"t":return!0;case"f":return!1;default:return t}},_n=t=>{if(typeof t=="string"){const e=parseFloat(t);if(!Number.isNaN(e))return e}return t},bn=t=>{if(typeof t=="string")try{return JSON.parse(t)}catch{return t}return t},En=(t,e)=>{if(typeof t!="string")return t;const r=t.length-1,s=t[r];if(t[0]==="{"&&s==="}"){let i;const a=t.slice(1,r);try{i=JSON.parse("["+a+"]")}catch{i=a?a.split(","):[]}return i.map(o=>Qr(e,o))}return t},Sn=t=>typeof t=="string"?t.replace(" ","T"):t,Zr=t=>{const e=new URL(t);return e.protocol=e.protocol.replace(/^ws/i,"http"),e.pathname=e.pathname.replace(/\/+$/,"").replace(/\/socket\/websocket$/i,"").replace(/\/socket$/i,"").replace(/\/websocket$/i,""),e.pathname===""||e.pathname==="/"?e.pathname="/api/broadcast":e.pathname=e.pathname+"/api/broadcast",e.href};class Ot{constructor(e,r,s={},n=Bt){this.channel=e,this.event=r,this.payload=s,this.timeout=n,this.sent=!1,this.timeoutTimer=void 0,this.ref="",this.receivedResp=null,this.recHooks=[],this.refEvent=null}resend(e){this.timeout=e,this._cancelRefEvent(),this.ref="",this.refEvent=null,this.receivedResp=null,this.sent=!1,this.send()}send(){this._hasReceived("timeout")||(this.startTimeout(),this.sent=!0,this.channel.socket.push({topic:this.channel.topic,event:this.event,payload:this.payload,ref:this.ref,join_ref:this.channel._joinRef()}))}updatePayload(e){this.payload=Object.assign(Object.assign({},this.payload),e)}receive(e,r){var s;return this._hasReceived(e)&&r((s=this.receivedResp)===null||s===void 0?void 0:s.response),this.recHooks.push({status:e,callback:r}),this}startTimeout(){if(this.timeoutTimer)return;this.ref=this.channel.socket._makeRef(),this.refEvent=this.channel._replyEventName(this.ref);const e=r=>{this._cancelRefEvent(),this._cancelTimeout(),this.receivedResp=r,this._matchReceive(r)};this.channel._on(this.refEvent,{},e),this.timeoutTimer=setTimeout(()=>{this.trigger("timeout",{})},this.timeout)}trigger(e,r){this.refEvent&&this.channel._trigger(this.refEvent,{status:e,response:r})}destroy(){this._cancelRefEvent(),this._cancelTimeout()}_cancelRefEvent(){this.refEvent&&this.channel._off(this.refEvent,{})}_cancelTimeout(){clearTimeout(this.timeoutTimer),this.timeoutTimer=void 0}_matchReceive({status:e,response:r}){this.recHooks.filter(s=>s.status===e).forEach(s=>s.callback(r))}_hasReceived(e){return this.receivedResp&&this.receivedResp.status===e}}var vr;(function(t){t.SYNC="sync",t.JOIN="join",t.LEAVE="leave"})(vr||(vr={}));class Ye{constructor(e,r){this.channel=e,this.state={},this.pendingDiffs=[],this.joinRef=null,this.enabled=!1,this.caller={onJoin:()=>{},onLeave:()=>{},onSync:()=>{}};const s=r?.events||{state:"presence_state",diff:"presence_diff"};this.channel._on(s.state,{},n=>{const{onJoin:i,onLeave:a,onSync:o}=this.caller;this.joinRef=this.channel._joinRef(),this.state=Ye.syncState(this.state,n,i,a),this.pendingDiffs.forEach(l=>{this.state=Ye.syncDiff(this.state,l,i,a)}),this.pendingDiffs=[],o()}),this.channel._on(s.diff,{},n=>{const{onJoin:i,onLeave:a,onSync:o}=this.caller;this.inPendingSyncState()?this.pendingDiffs.push(n):(this.state=Ye.syncDiff(this.state,n,i,a),o())}),this.onJoin((n,i,a)=>{this.channel._trigger("presence",{event:"join",key:n,currentPresences:i,newPresences:a})}),this.onLeave((n,i,a)=>{this.channel._trigger("presence",{event:"leave",key:n,currentPresences:i,leftPresences:a})}),this.onSync(()=>{this.channel._trigger("presence",{event:"sync"})})}static syncState(e,r,s,n){const i=this.cloneDeep(e),a=this.transformState(r),o={},l={};return this.map(i,(c,h)=>{a[c]||(l[c]=h)}),this.map(a,(c,h)=>{const p=i[c];if(p){const f=h.map(v=>v.presence_ref),g=p.map(v=>v.presence_ref),m=h.filter(v=>g.indexOf(v.presence_ref)<0),w=p.filter(v=>f.indexOf(v.presence_ref)<0);m.length>0&&(o[c]=m),w.length>0&&(l[c]=w)}else o[c]=h}),this.syncDiff(i,{joins:o,leaves:l},s,n)}static syncDiff(e,r,s,n){const{joins:i,leaves:a}={joins:this.transformState(r.joins),leaves:this.transformState(r.leaves)};return s||(s=()=>{}),n||(n=()=>{}),this.map(i,(o,l)=>{var c;const h=(c=e[o])!==null&&c!==void 0?c:[];if(e[o]=this.cloneDeep(l),h.length>0){const p=e[o].map(g=>g.presence_ref),f=h.filter(g=>p.indexOf(g.presence_ref)<0);e[o].unshift(...f)}s(o,h,l)}),this.map(a,(o,l)=>{let c=e[o];if(!c)return;const h=l.map(p=>p.presence_ref);c=c.filter(p=>h.indexOf(p.presence_ref)<0),e[o]=c,n(o,c,l),c.length===0&&delete e[o]}),e}static map(e,r){return Object.getOwnPropertyNames(e).map(s=>r(s,e[s]))}static transformState(e){return e=this.cloneDeep(e),Object.getOwnPropertyNames(e).reduce((r,s)=>{const n=e[s];return"metas"in n?r[s]=n.metas.map(i=>(i.presence_ref=i.phx_ref,delete i.phx_ref,delete i.phx_ref_prev,i)):r[s]=n,r},{})}static cloneDeep(e){return JSON.parse(JSON.stringify(e))}onJoin(e){this.caller.onJoin=e}onLeave(e){this.caller.onLeave=e}onSync(e){this.caller.onSync=e}inPendingSyncState(){return!this.joinRef||this.joinRef!==this.channel._joinRef()}}var yr;(function(t){t.ALL="*",t.INSERT="INSERT",t.UPDATE="UPDATE",t.DELETE="DELETE"})(yr||(yr={}));var Xe;(function(t){t.BROADCAST="broadcast",t.PRESENCE="presence",t.POSTGRES_CHANGES="postgres_changes",t.SYSTEM="system"})(Xe||(Xe={}));var le;(function(t){t.SUBSCRIBED="SUBSCRIBED",t.TIMED_OUT="TIMED_OUT",t.CLOSED="CLOSED",t.CHANNEL_ERROR="CHANNEL_ERROR"})(le||(le={}));class Ue{constructor(e,r={config:{}},s){var n,i;if(this.topic=e,this.params=r,this.socket=s,this.bindings={},this.state=q.closed,this.joinedOnce=!1,this.pushBuffer=[],this.subTopic=e.replace(/^realtime:/i,""),this.params.config=Object.assign({broadcast:{ack:!1,self:!1},presence:{key:"",enabled:!1},private:!1},r.config),this.timeout=this.socket.timeout,this.joinPush=new Ot(this,ne.join,this.params,this.timeout),this.rejoinTimer=new Xr(()=>this._rejoinUntilConnected(),this.socket.reconnectAfterMs),this.joinPush.receive("ok",()=>{this.state=q.joined,this.rejoinTimer.reset(),this.pushBuffer.forEach(a=>a.send()),this.pushBuffer=[]}),this._onClose(()=>{this.rejoinTimer.reset(),this.socket.log("channel",`close ${this.topic} ${this._joinRef()}`),this.state=q.closed,this.socket._remove(this)}),this._onError(a=>{this._isLeaving()||this._isClosed()||(this.socket.log("channel",`error ${this.topic}`,a),this.state=q.errored,this.rejoinTimer.scheduleTimeout())}),this.joinPush.receive("timeout",()=>{this._isJoining()&&(this.socket.log("channel",`timeout ${this.topic}`,this.joinPush.timeout),this.state=q.errored,this.rejoinTimer.scheduleTimeout())}),this.joinPush.receive("error",a=>{this._isLeaving()||this._isClosed()||(this.socket.log("channel",`error ${this.topic}`,a),this.state=q.errored,this.rejoinTimer.scheduleTimeout())}),this._on(ne.reply,{},(a,o)=>{this._trigger(this._replyEventName(o),a)}),this.presence=new Ye(this),this.broadcastEndpointURL=Zr(this.socket.endPoint),this.private=this.params.config.private||!1,!this.private&&(!((i=(n=this.params.config)===null||n===void 0?void 0:n.broadcast)===null||i===void 0)&&i.replay))throw`tried to use replay on public channel '${this.topic}'. It must be a private channel.`}subscribe(e,r=this.timeout){var s,n,i;if(this.socket.isConnected()||this.socket.connect(),this.state==q.closed){const{config:{broadcast:a,presence:o,private:l}}=this.params,c=(n=(s=this.bindings.postgres_changes)===null||s===void 0?void 0:s.map(g=>g.filter))!==null&&n!==void 0?n:[],h=!!this.bindings[Xe.PRESENCE]&&this.bindings[Xe.PRESENCE].length>0||((i=this.params.config.presence)===null||i===void 0?void 0:i.enabled)===!0,p={},f={broadcast:a,presence:Object.assign(Object.assign({},o),{enabled:h}),postgres_changes:c,private:l};this.socket.accessTokenValue&&(p.access_token=this.socket.accessTokenValue),this._onError(g=>e?.(le.CHANNEL_ERROR,g)),this._onClose(()=>e?.(le.CLOSED)),this.updateJoinPayload(Object.assign({config:f},p)),this.joinedOnce=!0,this._rejoin(r),this.joinPush.receive("ok",async({postgres_changes:g})=>{var m;if(this.socket._isManualToken()||this.socket.setAuth(),g===void 0){e?.(le.SUBSCRIBED);return}else{const w=this.bindings.postgres_changes,v=(m=w?.length)!==null&&m!==void 0?m:0,_=[];for(let E=0;E<v;E++){const y=w[E],{filter:{event:T,schema:N,table:R,filter:x}}=y,P=g&&g[E];if(P&&P.event===T&&Ue.isFilterValueEqual(P.schema,N)&&Ue.isFilterValueEqual(P.table,R)&&Ue.isFilterValueEqual(P.filter,x))_.push(Object.assign(Object.assign({},y),{id:P.id}));else{this.unsubscribe(),this.state=q.errored,e?.(le.CHANNEL_ERROR,new Error("mismatch between server and client bindings for postgres changes"));return}}this.bindings.postgres_changes=_,e&&e(le.SUBSCRIBED);return}}).receive("error",g=>{this.state=q.errored,e?.(le.CHANNEL_ERROR,new Error(JSON.stringify(Object.values(g).join(", ")||"error")))}).receive("timeout",()=>{e?.(le.TIMED_OUT)})}return this}presenceState(){return this.presence.state}async track(e,r={}){return await this.send({type:"presence",event:"track",payload:e},r.timeout||this.timeout)}async untrack(e={}){return await this.send({type:"presence",event:"untrack"},e)}on(e,r,s){return this.state===q.joined&&e===Xe.PRESENCE&&(this.socket.log("channel",`resubscribe to ${this.topic} due to change in presence callbacks on joined channel`),this.unsubscribe().then(async()=>await this.subscribe())),this._on(e,r,s)}async httpSend(e,r,s={}){var n;if(r==null)return Promise.reject("Payload is required for httpSend()");const i={apikey:this.socket.apiKey?this.socket.apiKey:"","Content-Type":"application/json"};this.socket.accessTokenValue&&(i.Authorization=`Bearer ${this.socket.accessTokenValue}`);const a={method:"POST",headers:i,body:JSON.stringify({messages:[{topic:this.subTopic,event:e,payload:r,private:this.private}]})},o=await this._fetchWithTimeout(this.broadcastEndpointURL,a,(n=s.timeout)!==null&&n!==void 0?n:this.timeout);if(o.status===202)return{success:!0};let l=o.statusText;try{const c=await o.json();l=c.error||c.message||l}catch{}return Promise.reject(new Error(l))}async send(e,r={}){var s,n;if(!this._canPush()&&e.type==="broadcast"){console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");const{event:i,payload:a}=e,o={apikey:this.socket.apiKey?this.socket.apiKey:"","Content-Type":"application/json"};this.socket.accessTokenValue&&(o.Authorization=`Bearer ${this.socket.accessTokenValue}`);const l={method:"POST",headers:o,body:JSON.stringify({messages:[{topic:this.subTopic,event:i,payload:a,private:this.private}]})};try{const c=await this._fetchWithTimeout(this.broadcastEndpointURL,l,(s=r.timeout)!==null&&s!==void 0?s:this.timeout);return await((n=c.body)===null||n===void 0?void 0:n.cancel()),c.ok?"ok":"error"}catch(c){return c.name==="AbortError"?"timed out":"error"}}else return new Promise(i=>{var a,o,l;const c=this._push(e.type,e,r.timeout||this.timeout);e.type==="broadcast"&&!(!((l=(o=(a=this.params)===null||a===void 0?void 0:a.config)===null||o===void 0?void 0:o.broadcast)===null||l===void 0)&&l.ack)&&i("ok"),c.receive("ok",()=>i("ok")),c.receive("error",()=>i("error")),c.receive("timeout",()=>i("timed out"))})}updateJoinPayload(e){this.joinPush.updatePayload(e)}unsubscribe(e=this.timeout){this.state=q.leaving;const r=()=>{this.socket.log("channel",`leave ${this.topic}`),this._trigger(ne.close,"leave",this._joinRef())};this.joinPush.destroy();let s=null;return new Promise(n=>{s=new Ot(this,ne.leave,{},e),s.receive("ok",()=>{r(),n("ok")}).receive("timeout",()=>{r(),n("timed out")}).receive("error",()=>{n("error")}),s.send(),this._canPush()||s.trigger("ok",{})}).finally(()=>{s?.destroy()})}teardown(){this.pushBuffer.forEach(e=>e.destroy()),this.pushBuffer=[],this.rejoinTimer.reset(),this.joinPush.destroy(),this.state=q.closed,this.bindings={}}async _fetchWithTimeout(e,r,s){const n=new AbortController,i=setTimeout(()=>n.abort(),s),a=await this.socket.fetch(e,Object.assign(Object.assign({},r),{signal:n.signal}));return clearTimeout(i),a}_push(e,r,s=this.timeout){if(!this.joinedOnce)throw`tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;let n=new Ot(this,e,r,s);return this._canPush()?n.send():this._addToPushBuffer(n),n}_addToPushBuffer(e){if(e.startTimeout(),this.pushBuffer.push(e),this.pushBuffer.length>mn){const r=this.pushBuffer.shift();r&&(r.destroy(),this.socket.log("channel",`discarded push due to buffer overflow: ${r.event}`,r.payload))}}_onMessage(e,r,s){return r}_isMember(e){return this.topic===e}_joinRef(){return this.joinPush.ref}_trigger(e,r,s){var n,i;const a=e.toLocaleLowerCase(),{close:o,error:l,leave:c,join:h}=ne;if(s&&[o,l,c,h].indexOf(a)>=0&&s!==this._joinRef())return;let f=this._onMessage(a,r,s);if(r&&!f)throw"channel onMessage callbacks must return the payload, modified or unmodified";["insert","update","delete"].includes(a)?(n=this.bindings.postgres_changes)===null||n===void 0||n.filter(g=>{var m,w,v;return((m=g.filter)===null||m===void 0?void 0:m.event)==="*"||((v=(w=g.filter)===null||w===void 0?void 0:w.event)===null||v===void 0?void 0:v.toLocaleLowerCase())===a}).map(g=>g.callback(f,s)):(i=this.bindings[a])===null||i===void 0||i.filter(g=>{var m,w,v,_,E,y;if(["broadcast","presence","postgres_changes"].includes(a))if("id"in g){const T=g.id,N=(m=g.filter)===null||m===void 0?void 0:m.event;return T&&((w=r.ids)===null||w===void 0?void 0:w.includes(T))&&(N==="*"||N?.toLocaleLowerCase()===((v=r.data)===null||v===void 0?void 0:v.type.toLocaleLowerCase()))}else{const T=(E=(_=g?.filter)===null||_===void 0?void 0:_.event)===null||E===void 0?void 0:E.toLocaleLowerCase();return T==="*"||T===((y=r?.event)===null||y===void 0?void 0:y.toLocaleLowerCase())}else return g.type.toLocaleLowerCase()===a}).map(g=>{if(typeof f=="object"&&"ids"in f){const m=f.data,{schema:w,table:v,commit_timestamp:_,type:E,errors:y}=m;f=Object.assign(Object.assign({},{schema:w,table:v,commit_timestamp:_,eventType:E,new:{},old:{},errors:y}),this._getPayloadRecords(m))}g.callback(f,s)})}_isClosed(){return this.state===q.closed}_isJoined(){return this.state===q.joined}_isJoining(){return this.state===q.joining}_isLeaving(){return this.state===q.leaving}_replyEventName(e){return`chan_reply_${e}`}_on(e,r,s){const n=e.toLocaleLowerCase(),i={type:n,filter:r,callback:s};return this.bindings[n]?this.bindings[n].push(i):this.bindings[n]=[i],this}_off(e,r){const s=e.toLocaleLowerCase();return this.bindings[s]&&(this.bindings[s]=this.bindings[s].filter(n=>{var i;return!(((i=n.type)===null||i===void 0?void 0:i.toLocaleLowerCase())===s&&Ue.isEqual(n.filter,r))})),this}static isEqual(e,r){if(Object.keys(e).length!==Object.keys(r).length)return!1;for(const s in e)if(e[s]!==r[s])return!1;return!0}static isFilterValueEqual(e,r){return(e??void 0)===(r??void 0)}_rejoinUntilConnected(){this.rejoinTimer.scheduleTimeout(),this.socket.isConnected()&&this._rejoin()}_onClose(e){this._on(ne.close,{},e)}_onError(e){this._on(ne.error,{},r=>e(r))}_canPush(){return this.socket.isConnected()&&this._isJoined()}_rejoin(e=this.timeout){this._isLeaving()||(this.socket._leaveOpenTopic(this.topic),this.state=q.joining,this.joinPush.resend(e))}_getPayloadRecords(e){const r={new:{},old:{}};return(e.type==="INSERT"||e.type==="UPDATE")&&(r.new=wr(e.columns,e.record)),(e.type==="UPDATE"||e.type==="DELETE")&&(r.old=wr(e.columns,e.old_record)),r}}const At=()=>{},ut={HEARTBEAT_INTERVAL:25e3,RECONNECT_DELAY:10,HEARTBEAT_TIMEOUT_FALLBACK:100},kn=[1e3,2e3,5e3,1e4],Tn=1e4,On=`
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;class An{constructor(e,r){var s;if(this.accessTokenValue=null,this.apiKey=null,this._manuallySetToken=!1,this.channels=new Array,this.endPoint="",this.httpEndpoint="",this.headers={},this.params={},this.timeout=Bt,this.transport=null,this.heartbeatIntervalMs=ut.HEARTBEAT_INTERVAL,this.heartbeatTimer=void 0,this.pendingHeartbeatRef=null,this.heartbeatCallback=At,this.ref=0,this.reconnectTimer=null,this.vsn=mr,this.logger=At,this.conn=null,this.sendBuffer=[],this.serializer=new wn,this.stateChangeCallbacks={open:[],close:[],error:[],message:[]},this.accessToken=null,this._connectionState="disconnected",this._wasManualDisconnect=!1,this._authPromise=null,this._resolveFetch=n=>n?(...i)=>n(...i):(...i)=>fetch(...i),!(!((s=r?.params)===null||s===void 0)&&s.apikey))throw new Error("API key is required to connect to Realtime");this.apiKey=r.params.apikey,this.endPoint=`${e}/${qt.websocket}`,this.httpEndpoint=Zr(e),this._initializeOptions(r),this._setupReconnectionTimer(),this.fetch=this._resolveFetch(r?.fetch)}connect(){if(!(this.isConnecting()||this.isDisconnecting()||this.conn!==null&&this.isConnected())){if(this._setConnectionState("connecting"),this.accessToken&&!this._authPromise&&this._setAuthSafely("connect"),this.transport)this.conn=new this.transport(this.endpointURL());else try{this.conn=dn.createWebSocket(this.endpointURL())}catch(e){this._setConnectionState("disconnected");const r=e.message;throw r.includes("Node.js")?new Error(`${r}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`):new Error(`WebSocket not available: ${r}`)}this._setupConnectionHandlers()}}endpointURL(){return this._appendParams(this.endPoint,Object.assign({},this.params,{vsn:this.vsn}))}disconnect(e,r){if(!this.isDisconnecting())if(this._setConnectionState("disconnecting",!0),this.conn){const s=setTimeout(()=>{this._setConnectionState("disconnected")},100);this.conn.onclose=()=>{clearTimeout(s),this._setConnectionState("disconnected")},typeof this.conn.close=="function"&&(e?this.conn.close(e,r??""):this.conn.close()),this._teardownConnection()}else this._setConnectionState("disconnected")}getChannels(){return this.channels}async removeChannel(e){const r=await e.unsubscribe();return this.channels.length===0&&this.disconnect(),r}async removeAllChannels(){const e=await Promise.all(this.channels.map(r=>r.unsubscribe()));return this.channels=[],this.disconnect(),e}log(e,r,s){this.logger(e,r,s)}connectionState(){switch(this.conn&&this.conn.readyState){case ge.connecting:return Ee.Connecting;case ge.open:return Ee.Open;case ge.closing:return Ee.Closing;default:return Ee.Closed}}isConnected(){return this.connectionState()===Ee.Open}isConnecting(){return this._connectionState==="connecting"}isDisconnecting(){return this._connectionState==="disconnecting"}channel(e,r={config:{}}){const s=`realtime:${e}`,n=this.getChannels().find(i=>i.topic===s);if(n)return n;{const i=new Ue(`realtime:${e}`,r,this);return this.channels.push(i),i}}push(e){const{topic:r,event:s,payload:n,ref:i}=e,a=()=>{this.encode(e,o=>{var l;(l=this.conn)===null||l===void 0||l.send(o)})};this.log("push",`${r} ${s} (${i})`,n),this.isConnected()?a():this.sendBuffer.push(a)}async setAuth(e=null){this._authPromise=this._performAuth(e);try{await this._authPromise}finally{this._authPromise=null}}_isManualToken(){return this._manuallySetToken}async sendHeartbeat(){var e;if(!this.isConnected()){try{this.heartbeatCallback("disconnected")}catch(r){this.log("error","error in heartbeat callback",r)}return}if(this.pendingHeartbeatRef){this.pendingHeartbeatRef=null,this.log("transport","heartbeat timeout. Attempting to re-establish connection");try{this.heartbeatCallback("timeout")}catch(r){this.log("error","error in heartbeat callback",r)}this._wasManualDisconnect=!1,(e=this.conn)===null||e===void 0||e.close(gn,"heartbeat timeout"),setTimeout(()=>{var r;this.isConnected()||(r=this.reconnectTimer)===null||r===void 0||r.scheduleTimeout()},ut.HEARTBEAT_TIMEOUT_FALLBACK);return}this.pendingHeartbeatRef=this._makeRef(),this.push({topic:"phoenix",event:"heartbeat",payload:{},ref:this.pendingHeartbeatRef});try{this.heartbeatCallback("sent")}catch(r){this.log("error","error in heartbeat callback",r)}this._setAuthSafely("heartbeat")}onHeartbeat(e){this.heartbeatCallback=e}flushSendBuffer(){this.isConnected()&&this.sendBuffer.length>0&&(this.sendBuffer.forEach(e=>e()),this.sendBuffer=[])}_makeRef(){let e=this.ref+1;return e===this.ref?this.ref=0:this.ref=e,this.ref.toString()}_leaveOpenTopic(e){let r=this.channels.find(s=>s.topic===e&&(s._isJoined()||s._isJoining()));r&&(this.log("transport",`leaving duplicate topic "${e}"`),r.unsubscribe())}_remove(e){this.channels=this.channels.filter(r=>r.topic!==e.topic)}_onConnMessage(e){this.decode(e.data,r=>{if(r.topic==="phoenix"&&r.event==="phx_reply")try{this.heartbeatCallback(r.payload.status==="ok"?"ok":"error")}catch(c){this.log("error","error in heartbeat callback",c)}r.ref&&r.ref===this.pendingHeartbeatRef&&(this.pendingHeartbeatRef=null);const{topic:s,event:n,payload:i,ref:a}=r,o=a?`(${a})`:"",l=i.status||"";this.log("receive",`${l} ${s} ${n} ${o}`.trim(),i),this.channels.filter(c=>c._isMember(s)).forEach(c=>c._trigger(n,i,a)),this._triggerStateCallbacks("message",r)})}_clearTimer(e){var r;e==="heartbeat"&&this.heartbeatTimer?(clearInterval(this.heartbeatTimer),this.heartbeatTimer=void 0):e==="reconnect"&&((r=this.reconnectTimer)===null||r===void 0||r.reset())}_clearAllTimers(){this._clearTimer("heartbeat"),this._clearTimer("reconnect")}_setupConnectionHandlers(){this.conn&&("binaryType"in this.conn&&(this.conn.binaryType="arraybuffer"),this.conn.onopen=()=>this._onConnOpen(),this.conn.onerror=e=>this._onConnError(e),this.conn.onmessage=e=>this._onConnMessage(e),this.conn.onclose=e=>this._onConnClose(e),this.conn.readyState===ge.open&&this._onConnOpen())}_teardownConnection(){if(this.conn){if(this.conn.readyState===ge.open||this.conn.readyState===ge.connecting)try{this.conn.close()}catch(e){this.log("error","Error closing connection",e)}this.conn.onopen=null,this.conn.onerror=null,this.conn.onmessage=null,this.conn.onclose=null,this.conn=null}this._clearAllTimers(),this._terminateWorker(),this.channels.forEach(e=>e.teardown())}_onConnOpen(){this._setConnectionState("connected"),this.log("transport",`connected to ${this.endpointURL()}`),(this._authPromise||(this.accessToken&&!this.accessTokenValue?this.setAuth():Promise.resolve())).then(()=>{this.flushSendBuffer()}).catch(r=>{this.log("error","error waiting for auth on connect",r),this.flushSendBuffer()}),this._clearTimer("reconnect"),this.worker?this.workerRef||this._startWorkerHeartbeat():this._startHeartbeat(),this._triggerStateCallbacks("open")}_startHeartbeat(){this.heartbeatTimer&&clearInterval(this.heartbeatTimer),this.heartbeatTimer=setInterval(()=>this.sendHeartbeat(),this.heartbeatIntervalMs)}_startWorkerHeartbeat(){this.workerUrl?this.log("worker",`starting worker for from ${this.workerUrl}`):this.log("worker","starting default worker");const e=this._workerObjectUrl(this.workerUrl);this.workerRef=new Worker(e),this.workerRef.onerror=r=>{this.log("worker","worker error",r.message),this._terminateWorker()},this.workerRef.onmessage=r=>{r.data.event==="keepAlive"&&this.sendHeartbeat()},this.workerRef.postMessage({event:"start",interval:this.heartbeatIntervalMs})}_terminateWorker(){this.workerRef&&(this.log("worker","terminating worker"),this.workerRef.terminate(),this.workerRef=void 0)}_onConnClose(e){var r;this._setConnectionState("disconnected"),this.log("transport","close",e),this._triggerChanError(),this._clearTimer("heartbeat"),this._wasManualDisconnect||(r=this.reconnectTimer)===null||r===void 0||r.scheduleTimeout(),this._triggerStateCallbacks("close",e)}_onConnError(e){this._setConnectionState("disconnected"),this.log("transport",`${e}`),this._triggerChanError(),this._triggerStateCallbacks("error",e)}_triggerChanError(){this.channels.forEach(e=>e._trigger(ne.error))}_appendParams(e,r){if(Object.keys(r).length===0)return e;const s=e.match(/\?/)?"&":"?",n=new URLSearchParams(r);return`${e}${s}${n}`}_workerObjectUrl(e){let r;if(e)r=e;else{const s=new Blob([On],{type:"application/javascript"});r=URL.createObjectURL(s)}return r}_setConnectionState(e,r=!1){this._connectionState=e,e==="connecting"?this._wasManualDisconnect=!1:e==="disconnecting"&&(this._wasManualDisconnect=r)}async _performAuth(e=null){let r,s=!1;if(e)r=e,s=!0;else if(this.accessToken)try{r=await this.accessToken()}catch(n){this.log("error","Error fetching access token from callback",n),r=this.accessTokenValue}else r=this.accessTokenValue;s?this._manuallySetToken=!0:this.accessToken&&(this._manuallySetToken=!1),this.accessTokenValue!=r&&(this.accessTokenValue=r,this.channels.forEach(n=>{const i={access_token:r,version:fn};r&&n.updateJoinPayload(i),n.joinedOnce&&n._isJoined()&&n._push(ne.access_token,{access_token:r})}))}async _waitForAuthIfNeeded(){this._authPromise&&await this._authPromise}_setAuthSafely(e="general"){this._isManualToken()||this.setAuth().catch(r=>{this.log("error",`Error setting auth in ${e}`,r)})}_triggerStateCallbacks(e,r){try{this.stateChangeCallbacks[e].forEach(s=>{try{s(r)}catch(n){this.log("error",`error in ${e} callback`,n)}})}catch(s){this.log("error",`error triggering ${e} callbacks`,s)}}_setupReconnectionTimer(){this.reconnectTimer=new Xr(async()=>{setTimeout(async()=>{await this._waitForAuthIfNeeded(),this.isConnected()||this.connect()},ut.RECONNECT_DELAY)},this.reconnectAfterMs)}_initializeOptions(e){var r,s,n,i,a,o,l,c,h,p,f,g;switch(this.transport=(r=e?.transport)!==null&&r!==void 0?r:null,this.timeout=(s=e?.timeout)!==null&&s!==void 0?s:Bt,this.heartbeatIntervalMs=(n=e?.heartbeatIntervalMs)!==null&&n!==void 0?n:ut.HEARTBEAT_INTERVAL,this.worker=(i=e?.worker)!==null&&i!==void 0?i:!1,this.accessToken=(a=e?.accessToken)!==null&&a!==void 0?a:null,this.heartbeatCallback=(o=e?.heartbeatCallback)!==null&&o!==void 0?o:At,this.vsn=(l=e?.vsn)!==null&&l!==void 0?l:mr,e?.params&&(this.params=e.params),e?.logger&&(this.logger=e.logger),(e?.logLevel||e?.log_level)&&(this.logLevel=e.logLevel||e.log_level,this.params=Object.assign(Object.assign({},this.params),{log_level:this.logLevel})),this.reconnectAfterMs=(c=e?.reconnectAfterMs)!==null&&c!==void 0?c:(m=>kn[m-1]||Tn),this.vsn){case Yr:this.encode=(h=e?.encode)!==null&&h!==void 0?h:((m,w)=>w(JSON.stringify(m))),this.decode=(p=e?.decode)!==null&&p!==void 0?p:((m,w)=>w(JSON.parse(m)));break;case pn:this.encode=(f=e?.encode)!==null&&f!==void 0?f:this.serializer.encode.bind(this.serializer),this.decode=(g=e?.decode)!==null&&g!==void 0?g:this.serializer.decode.bind(this.serializer);break;default:throw new Error(`Unsupported serializer version: ${this.vsn}`)}if(this.worker){if(typeof window<"u"&&!window.Worker)throw new Error("Web Worker is not supported");this.workerUrl=e?.workerUrl}}}var et=class extends Error{constructor(t,e){super(t),this.name="IcebergError",this.status=e.status,this.icebergType=e.icebergType,this.icebergCode=e.icebergCode,this.details=e.details,this.isCommitStateUnknown=e.icebergType==="CommitStateUnknownException"||[500,502,504].includes(e.status)&&e.icebergType?.includes("CommitState")===!0}isNotFound(){return this.status===404}isConflict(){return this.status===409}isAuthenticationTimeout(){return this.status===419}};function Cn(t,e,r){const s=new URL(e,t);if(r)for(const[n,i]of Object.entries(r))i!==void 0&&s.searchParams.set(n,i);return s.toString()}async function Rn(t){return!t||t.type==="none"?{}:t.type==="bearer"?{Authorization:`Bearer ${t.token}`}:t.type==="header"?{[t.name]:t.value}:t.type==="custom"?await t.getHeaders():{}}function $n(t){const e=t.fetchImpl??globalThis.fetch;return{async request({method:r,path:s,query:n,body:i,headers:a}){const o=Cn(t.baseUrl,s,n),l=await Rn(t.auth),c=await e(o,{method:r,headers:{...i?{"Content-Type":"application/json"}:{},...l,...a},body:i?JSON.stringify(i):void 0}),h=await c.text(),p=(c.headers.get("content-type")||"").includes("application/json"),f=p&&h?JSON.parse(h):h;if(!c.ok){const g=p?f:void 0,m=g?.error;throw new et(m?.message??`Request failed with status ${c.status}`,{status:c.status,icebergType:m?.type,icebergCode:m?.code,details:g})}return{status:c.status,headers:c.headers,data:f}}}}function dt(t){return t.join("")}var Pn=class{constructor(t,e=""){this.client=t,this.prefix=e}async listNamespaces(t){const e=t?{parent:dt(t.namespace)}:void 0;return(await this.client.request({method:"GET",path:`${this.prefix}/namespaces`,query:e})).data.namespaces.map(s=>({namespace:s}))}async createNamespace(t,e){const r={namespace:t.namespace,properties:e?.properties};return(await this.client.request({method:"POST",path:`${this.prefix}/namespaces`,body:r})).data}async dropNamespace(t){await this.client.request({method:"DELETE",path:`${this.prefix}/namespaces/${dt(t.namespace)}`})}async loadNamespaceMetadata(t){return{properties:(await this.client.request({method:"GET",path:`${this.prefix}/namespaces/${dt(t.namespace)}`})).data.properties}}async namespaceExists(t){try{return await this.client.request({method:"HEAD",path:`${this.prefix}/namespaces/${dt(t.namespace)}`}),!0}catch(e){if(e instanceof et&&e.status===404)return!1;throw e}}async createNamespaceIfNotExists(t,e){try{return await this.createNamespace(t,e)}catch(r){if(r instanceof et&&r.status===409)return;throw r}}};function Re(t){return t.join("")}var In=class{constructor(t,e="",r){this.client=t,this.prefix=e,this.accessDelegation=r}async listTables(t){return(await this.client.request({method:"GET",path:`${this.prefix}/namespaces/${Re(t.namespace)}/tables`})).data.identifiers}async createTable(t,e){const r={};return this.accessDelegation&&(r["X-Iceberg-Access-Delegation"]=this.accessDelegation),(await this.client.request({method:"POST",path:`${this.prefix}/namespaces/${Re(t.namespace)}/tables`,body:e,headers:r})).data.metadata}async updateTable(t,e){const r=await this.client.request({method:"POST",path:`${this.prefix}/namespaces/${Re(t.namespace)}/tables/${t.name}`,body:e});return{"metadata-location":r.data["metadata-location"],metadata:r.data.metadata}}async dropTable(t,e){await this.client.request({method:"DELETE",path:`${this.prefix}/namespaces/${Re(t.namespace)}/tables/${t.name}`,query:{purgeRequested:String(e?.purge??!1)}})}async loadTable(t){const e={};return this.accessDelegation&&(e["X-Iceberg-Access-Delegation"]=this.accessDelegation),(await this.client.request({method:"GET",path:`${this.prefix}/namespaces/${Re(t.namespace)}/tables/${t.name}`,headers:e})).data.metadata}async tableExists(t){const e={};this.accessDelegation&&(e["X-Iceberg-Access-Delegation"]=this.accessDelegation);try{return await this.client.request({method:"HEAD",path:`${this.prefix}/namespaces/${Re(t.namespace)}/tables/${t.name}`,headers:e}),!0}catch(r){if(r instanceof et&&r.status===404)return!1;throw r}}async createTableIfNotExists(t,e){try{return await this.createTable(t,e)}catch(r){if(r instanceof et&&r.status===409)return await this.loadTable({namespace:t.namespace,name:e.name});throw r}}},xn=class{constructor(t){let e="v1";t.catalogName&&(e+=`/${t.catalogName}`);const r=t.baseUrl.endsWith("/")?t.baseUrl:`${t.baseUrl}/`;this.client=$n({baseUrl:r,auth:t.auth,fetchImpl:t.fetch}),this.accessDelegation=t.accessDelegation?.join(","),this.namespaceOps=new Pn(this.client,e),this.tableOps=new In(this.client,e,this.accessDelegation)}async listNamespaces(t){return this.namespaceOps.listNamespaces(t)}async createNamespace(t,e){return this.namespaceOps.createNamespace(t,e)}async dropNamespace(t){await this.namespaceOps.dropNamespace(t)}async loadNamespaceMetadata(t){return this.namespaceOps.loadNamespaceMetadata(t)}async listTables(t){return this.tableOps.listTables(t)}async createTable(t,e){return this.tableOps.createTable(t,e)}async updateTable(t,e){return this.tableOps.updateTable(t,e)}async dropTable(t,e){await this.tableOps.dropTable(t,e)}async loadTable(t){return this.tableOps.loadTable(t)}async namespaceExists(t){return this.namespaceOps.namespaceExists(t)}async tableExists(t){return this.tableOps.tableExists(t)}async createNamespaceIfNotExists(t,e){return this.namespaceOps.createNamespaceIfNotExists(t,e)}async createTableIfNotExists(t,e){return this.tableOps.createTableIfNotExists(t,e)}},bt=class extends Error{constructor(t){super(t),this.__isStorageError=!0,this.name="StorageError"}};function j(t){return typeof t=="object"&&t!==null&&"__isStorageError"in t}var jn=class extends bt{constructor(t,e,r){super(t),this.name="StorageApiError",this.status=e,this.statusCode=r}toJSON(){return{name:this.name,message:this.message,status:this.status,statusCode:this.statusCode}}},Ft=class extends bt{constructor(t,e){super(t),this.name="StorageUnknownError",this.originalError=e}};const tr=t=>t?(...e)=>t(...e):(...e)=>fetch(...e),Ln=()=>Response,Vt=t=>{if(Array.isArray(t))return t.map(r=>Vt(r));if(typeof t=="function"||t!==Object(t))return t;const e={};return Object.entries(t).forEach(([r,s])=>{const n=r.replace(/([-_][a-z])/gi,i=>i.toUpperCase().replace(/[-_]/g,""));e[n]=Vt(s)}),e},Nn=t=>{if(typeof t!="object"||t===null)return!1;const e=Object.getPrototypeOf(t);return(e===null||e===Object.prototype||Object.getPrototypeOf(e)===null)&&!(Symbol.toStringTag in t)&&!(Symbol.iterator in t)},Dn=t=>!t||typeof t!="string"||t.length===0||t.length>100||t.trim()!==t||t.includes("/")||t.includes("\\")?!1:/^[\w!.\*'() &$@=;:+,?-]+$/.test(t);function tt(t){"@babel/helpers - typeof";return tt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},tt(t)}function Un(t,e){if(tt(t)!="object"||!t)return t;var r=t[Symbol.toPrimitive];if(r!==void 0){var s=r.call(t,e);if(tt(s)!="object")return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}function Bn(t){var e=Un(t,"string");return tt(e)=="symbol"?e:e+""}function qn(t,e,r){return(e=Bn(e))in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function _r(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(t);e&&(s=s.filter(function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable})),r.push.apply(r,s)}return r}function k(t){for(var e=1;e<arguments.length;e++){var r=arguments[e]!=null?arguments[e]:{};e%2?_r(Object(r),!0).forEach(function(s){qn(t,s,r[s])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):_r(Object(r)).forEach(function(s){Object.defineProperty(t,s,Object.getOwnPropertyDescriptor(r,s))})}return t}const Ct=t=>{var e;return t.msg||t.message||t.error_description||(typeof t.error=="string"?t.error:(e=t.error)===null||e===void 0?void 0:e.message)||JSON.stringify(t)},Mn=async(t,e,r)=>{t instanceof await Ln()&&!r?.noResolveJson?t.json().then(s=>{const n=t.status||500,i=s?.statusCode||n+"";e(new jn(Ct(s),n,i))}).catch(s=>{e(new Ft(Ct(s),s))}):e(new Ft(Ct(t),t))},Fn=(t,e,r,s)=>{const n={method:t,headers:e?.headers||{}};return t==="GET"||!s?n:(Nn(s)?(n.headers=k({"Content-Type":"application/json"},e?.headers),n.body=JSON.stringify(s)):n.body=s,e?.duplex&&(n.duplex=e.duplex),k(k({},n),r))};async function at(t,e,r,s,n,i){return new Promise((a,o)=>{t(r,Fn(e,s,n,i)).then(l=>{if(!l.ok)throw l;return s?.noResolveJson?l:l.json()}).then(l=>a(l)).catch(l=>Mn(l,o,s))})}async function rt(t,e,r,s){return at(t,"GET",e,r,s)}async function se(t,e,r,s,n){return at(t,"POST",e,s,n,r)}async function Wt(t,e,r,s,n){return at(t,"PUT",e,s,n,r)}async function Vn(t,e,r,s){return at(t,"HEAD",e,k(k({},r),{},{noResolveJson:!0}),s)}async function rr(t,e,r,s,n){return at(t,"DELETE",e,s,n,r)}var Wn=class{constructor(t,e){this.downloadFn=t,this.shouldThrowOnError=e}then(t,e){return this.execute().then(t,e)}async execute(){var t=this;try{return{data:(await t.downloadFn()).body,error:null}}catch(e){if(t.shouldThrowOnError)throw e;if(j(e))return{data:null,error:e};throw e}}};let es;es=Symbol.toStringTag;var Hn=class{constructor(t,e){this.downloadFn=t,this.shouldThrowOnError=e,this[es]="BlobDownloadBuilder",this.promise=null}asStream(){return new Wn(this.downloadFn,this.shouldThrowOnError)}then(t,e){return this.getPromise().then(t,e)}catch(t){return this.getPromise().catch(t)}finally(t){return this.getPromise().finally(t)}getPromise(){return this.promise||(this.promise=this.execute()),this.promise}async execute(){var t=this;try{return{data:await(await t.downloadFn()).blob(),error:null}}catch(e){if(t.shouldThrowOnError)throw e;if(j(e))return{data:null,error:e};throw e}}};const Kn={limit:100,offset:0,sortBy:{column:"name",order:"asc"}},br={cacheControl:"3600",contentType:"text/plain;charset=UTF-8",upsert:!1};var zn=class{constructor(t,e={},r,s){this.shouldThrowOnError=!1,this.url=t,this.headers=e,this.bucketId=r,this.fetch=tr(s)}throwOnError(){return this.shouldThrowOnError=!0,this}async uploadOrUpdate(t,e,r,s){var n=this;try{let i;const a=k(k({},br),s);let o=k(k({},n.headers),t==="POST"&&{"x-upsert":String(a.upsert)});const l=a.metadata;typeof Blob<"u"&&r instanceof Blob?(i=new FormData,i.append("cacheControl",a.cacheControl),l&&i.append("metadata",n.encodeMetadata(l)),i.append("",r)):typeof FormData<"u"&&r instanceof FormData?(i=r,i.has("cacheControl")||i.append("cacheControl",a.cacheControl),l&&!i.has("metadata")&&i.append("metadata",n.encodeMetadata(l))):(i=r,o["cache-control"]=`max-age=${a.cacheControl}`,o["content-type"]=a.contentType,l&&(o["x-metadata"]=n.toBase64(n.encodeMetadata(l))),(typeof ReadableStream<"u"&&i instanceof ReadableStream||i&&typeof i=="object"&&"pipe"in i&&typeof i.pipe=="function")&&!a.duplex&&(a.duplex="half")),s?.headers&&(o=k(k({},o),s.headers));const c=n._removeEmptyFolders(e),h=n._getFinalPath(c),p=await(t=="PUT"?Wt:se)(n.fetch,`${n.url}/object/${h}`,i,k({headers:o},a?.duplex?{duplex:a.duplex}:{}));return{data:{path:c,id:p.Id,fullPath:p.Key},error:null}}catch(i){if(n.shouldThrowOnError)throw i;if(j(i))return{data:null,error:i};throw i}}async upload(t,e,r){return this.uploadOrUpdate("POST",t,e,r)}async uploadToSignedUrl(t,e,r,s){var n=this;const i=n._removeEmptyFolders(t),a=n._getFinalPath(i),o=new URL(n.url+`/object/upload/sign/${a}`);o.searchParams.set("token",e);try{let l;const c=k({upsert:br.upsert},s),h=k(k({},n.headers),{"x-upsert":String(c.upsert)});return typeof Blob<"u"&&r instanceof Blob?(l=new FormData,l.append("cacheControl",c.cacheControl),l.append("",r)):typeof FormData<"u"&&r instanceof FormData?(l=r,l.append("cacheControl",c.cacheControl)):(l=r,h["cache-control"]=`max-age=${c.cacheControl}`,h["content-type"]=c.contentType),{data:{path:i,fullPath:(await Wt(n.fetch,o.toString(),l,{headers:h})).Key},error:null}}catch(l){if(n.shouldThrowOnError)throw l;if(j(l))return{data:null,error:l};throw l}}async createSignedUploadUrl(t,e){var r=this;try{let s=r._getFinalPath(t);const n=k({},r.headers);e?.upsert&&(n["x-upsert"]="true");const i=await se(r.fetch,`${r.url}/object/upload/sign/${s}`,{},{headers:n}),a=new URL(r.url+i.url),o=a.searchParams.get("token");if(!o)throw new bt("No token returned by API");return{data:{signedUrl:a.toString(),path:t,token:o},error:null}}catch(s){if(r.shouldThrowOnError)throw s;if(j(s))return{data:null,error:s};throw s}}async update(t,e,r){return this.uploadOrUpdate("PUT",t,e,r)}async move(t,e,r){var s=this;try{return{data:await se(s.fetch,`${s.url}/object/move`,{bucketId:s.bucketId,sourceKey:t,destinationKey:e,destinationBucket:r?.destinationBucket},{headers:s.headers}),error:null}}catch(n){if(s.shouldThrowOnError)throw n;if(j(n))return{data:null,error:n};throw n}}async copy(t,e,r){var s=this;try{return{data:{path:(await se(s.fetch,`${s.url}/object/copy`,{bucketId:s.bucketId,sourceKey:t,destinationKey:e,destinationBucket:r?.destinationBucket},{headers:s.headers})).Key},error:null}}catch(n){if(s.shouldThrowOnError)throw n;if(j(n))return{data:null,error:n};throw n}}async createSignedUrl(t,e,r){var s=this;try{let n=s._getFinalPath(t),i=await se(s.fetch,`${s.url}/object/sign/${n}`,k({expiresIn:e},r?.transform?{transform:r.transform}:{}),{headers:s.headers});const a=r?.download?`&download=${r.download===!0?"":r.download}`:"";return i={signedUrl:encodeURI(`${s.url}${i.signedURL}${a}`)},{data:i,error:null}}catch(n){if(s.shouldThrowOnError)throw n;if(j(n))return{data:null,error:n};throw n}}async createSignedUrls(t,e,r){var s=this;try{const n=await se(s.fetch,`${s.url}/object/sign/${s.bucketId}`,{expiresIn:e,paths:t},{headers:s.headers}),i=r?.download?`&download=${r.download===!0?"":r.download}`:"";return{data:n.map(a=>k(k({},a),{},{signedUrl:a.signedURL?encodeURI(`${s.url}${a.signedURL}${i}`):null})),error:null}}catch(n){if(s.shouldThrowOnError)throw n;if(j(n))return{data:null,error:n};throw n}}download(t,e){const r=typeof e?.transform<"u"?"render/image/authenticated":"object",s=this.transformOptsToQueryString(e?.transform||{}),n=s?`?${s}`:"",i=this._getFinalPath(t),a=()=>rt(this.fetch,`${this.url}/${r}/${i}${n}`,{headers:this.headers,noResolveJson:!0});return new Hn(a,this.shouldThrowOnError)}async info(t){var e=this;const r=e._getFinalPath(t);try{return{data:Vt(await rt(e.fetch,`${e.url}/object/info/${r}`,{headers:e.headers})),error:null}}catch(s){if(e.shouldThrowOnError)throw s;if(j(s))return{data:null,error:s};throw s}}async exists(t){var e=this;const r=e._getFinalPath(t);try{return await Vn(e.fetch,`${e.url}/object/${r}`,{headers:e.headers}),{data:!0,error:null}}catch(s){if(e.shouldThrowOnError)throw s;if(j(s)&&s instanceof Ft){const n=s.originalError;if([400,404].includes(n?.status))return{data:!1,error:s}}throw s}}getPublicUrl(t,e){const r=this._getFinalPath(t),s=[],n=e?.download?`download=${e.download===!0?"":e.download}`:"";n!==""&&s.push(n);const i=typeof e?.transform<"u"?"render/image":"object",a=this.transformOptsToQueryString(e?.transform||{});a!==""&&s.push(a);let o=s.join("&");return o!==""&&(o=`?${o}`),{data:{publicUrl:encodeURI(`${this.url}/${i}/public/${r}${o}`)}}}async remove(t){var e=this;try{return{data:await rr(e.fetch,`${e.url}/object/${e.bucketId}`,{prefixes:t},{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}async list(t,e,r){var s=this;try{const n=k(k(k({},Kn),e),{},{prefix:t||""});return{data:await se(s.fetch,`${s.url}/object/list/${s.bucketId}`,n,{headers:s.headers},r),error:null}}catch(n){if(s.shouldThrowOnError)throw n;if(j(n))return{data:null,error:n};throw n}}async listV2(t,e){var r=this;try{const s=k({},t);return{data:await se(r.fetch,`${r.url}/object/list-v2/${r.bucketId}`,s,{headers:r.headers},e),error:null}}catch(s){if(r.shouldThrowOnError)throw s;if(j(s))return{data:null,error:s};throw s}}encodeMetadata(t){return JSON.stringify(t)}toBase64(t){return typeof Buffer<"u"?Buffer.from(t).toString("base64"):btoa(t)}_getFinalPath(t){return`${this.bucketId}/${t.replace(/^\/+/,"")}`}_removeEmptyFolders(t){return t.replace(/^\/|\/$/g,"").replace(/\/+/g,"/")}transformOptsToQueryString(t){const e=[];return t.width&&e.push(`width=${t.width}`),t.height&&e.push(`height=${t.height}`),t.resize&&e.push(`resize=${t.resize}`),t.format&&e.push(`format=${t.format}`),t.quality&&e.push(`quality=${t.quality}`),e.join("&")}};const ts="2.89.0",rs={"X-Client-Info":`storage-js/${ts}`};var Gn=class{constructor(t,e={},r,s){this.shouldThrowOnError=!1;const n=new URL(t);s?.useNewHostname&&/supabase\.(co|in|red)$/.test(n.hostname)&&!n.hostname.includes("storage.supabase.")&&(n.hostname=n.hostname.replace("supabase.","storage.supabase.")),this.url=n.href.replace(/\/$/,""),this.headers=k(k({},rs),e),this.fetch=tr(r)}throwOnError(){return this.shouldThrowOnError=!0,this}async listBuckets(t){var e=this;try{const r=e.listBucketOptionsToQueryString(t);return{data:await rt(e.fetch,`${e.url}/bucket${r}`,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}async getBucket(t){var e=this;try{return{data:await rt(e.fetch,`${e.url}/bucket/${t}`,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}async createBucket(t,e={public:!1}){var r=this;try{return{data:await se(r.fetch,`${r.url}/bucket`,{id:t,name:t,type:e.type,public:e.public,file_size_limit:e.fileSizeLimit,allowed_mime_types:e.allowedMimeTypes},{headers:r.headers}),error:null}}catch(s){if(r.shouldThrowOnError)throw s;if(j(s))return{data:null,error:s};throw s}}async updateBucket(t,e){var r=this;try{return{data:await Wt(r.fetch,`${r.url}/bucket/${t}`,{id:t,name:t,public:e.public,file_size_limit:e.fileSizeLimit,allowed_mime_types:e.allowedMimeTypes},{headers:r.headers}),error:null}}catch(s){if(r.shouldThrowOnError)throw s;if(j(s))return{data:null,error:s};throw s}}async emptyBucket(t){var e=this;try{return{data:await se(e.fetch,`${e.url}/bucket/${t}/empty`,{},{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}async deleteBucket(t){var e=this;try{return{data:await rr(e.fetch,`${e.url}/bucket/${t}`,{},{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}listBucketOptionsToQueryString(t){const e={};return t&&("limit"in t&&(e.limit=String(t.limit)),"offset"in t&&(e.offset=String(t.offset)),t.search&&(e.search=t.search),t.sortColumn&&(e.sortColumn=t.sortColumn),t.sortOrder&&(e.sortOrder=t.sortOrder)),Object.keys(e).length>0?"?"+new URLSearchParams(e).toString():""}},Jn=class{constructor(t,e={},r){this.shouldThrowOnError=!1,this.url=t.replace(/\/$/,""),this.headers=k(k({},rs),e),this.fetch=tr(r)}throwOnError(){return this.shouldThrowOnError=!0,this}async createBucket(t){var e=this;try{return{data:await se(e.fetch,`${e.url}/bucket`,{name:t},{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}async listBuckets(t){var e=this;try{const r=new URLSearchParams;t?.limit!==void 0&&r.set("limit",t.limit.toString()),t?.offset!==void 0&&r.set("offset",t.offset.toString()),t?.sortColumn&&r.set("sortColumn",t.sortColumn),t?.sortOrder&&r.set("sortOrder",t.sortOrder),t?.search&&r.set("search",t.search);const s=r.toString(),n=s?`${e.url}/bucket?${s}`:`${e.url}/bucket`;return{data:await rt(e.fetch,n,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}async deleteBucket(t){var e=this;try{return{data:await rr(e.fetch,`${e.url}/bucket/${t}`,{},{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(j(r))return{data:null,error:r};throw r}}from(t){var e=this;if(!Dn(t))throw new bt("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");const r=new xn({baseUrl:this.url,catalogName:t,auth:{type:"custom",getHeaders:async()=>e.headers},fetch:this.fetch}),s=this.shouldThrowOnError;return new Proxy(r,{get(n,i){const a=n[i];return typeof a!="function"?a:async(...o)=>{try{return{data:await a.apply(n,o),error:null}}catch(l){if(s)throw l;return{data:null,error:l}}}}})}};const sr={"X-Client-Info":`storage-js/${ts}`,"Content-Type":"application/json"};var ss=class extends Error{constructor(t){super(t),this.__isStorageVectorsError=!0,this.name="StorageVectorsError"}};function J(t){return typeof t=="object"&&t!==null&&"__isStorageVectorsError"in t}var Rt=class extends ss{constructor(t,e,r){super(t),this.name="StorageVectorsApiError",this.status=e,this.statusCode=r}toJSON(){return{name:this.name,message:this.message,status:this.status,statusCode:this.statusCode}}},Yn=class extends ss{constructor(t,e){super(t),this.name="StorageVectorsUnknownError",this.originalError=e}};const nr=t=>t?(...e)=>t(...e):(...e)=>fetch(...e),Xn=t=>{if(typeof t!="object"||t===null)return!1;const e=Object.getPrototypeOf(t);return(e===null||e===Object.prototype||Object.getPrototypeOf(e)===null)&&!(Symbol.toStringTag in t)&&!(Symbol.iterator in t)},Er=t=>t.msg||t.message||t.error_description||t.error||JSON.stringify(t),Qn=async(t,e,r)=>{if(t&&typeof t=="object"&&"status"in t&&"ok"in t&&typeof t.status=="number"&&!r?.noResolveJson){const s=t.status||500,n=t;if(typeof n.json=="function")n.json().then(i=>{const a=i?.statusCode||i?.code||s+"";e(new Rt(Er(i),s,a))}).catch(()=>{const i=s+"";e(new Rt(n.statusText||`HTTP ${s} error`,s,i))});else{const i=s+"";e(new Rt(n.statusText||`HTTP ${s} error`,s,i))}}else e(new Yn(Er(t),t))},Zn=(t,e,r,s)=>{const n={method:t,headers:e?.headers||{}};return s?(Xn(s)?(n.headers=k({"Content-Type":"application/json"},e?.headers),n.body=JSON.stringify(s)):n.body=s,k(k({},n),r)):n};async function ei(t,e,r,s,n,i){return new Promise((a,o)=>{t(r,Zn(e,s,n,i)).then(l=>{if(!l.ok)throw l;if(s?.noResolveJson)return l;const c=l.headers.get("content-type");return!c||!c.includes("application/json")?{}:l.json()}).then(l=>a(l)).catch(l=>Qn(l,o,s))})}async function Y(t,e,r,s,n){return ei(t,"POST",e,s,n,r)}var ti=class{constructor(t,e={},r){this.shouldThrowOnError=!1,this.url=t.replace(/\/$/,""),this.headers=k(k({},sr),e),this.fetch=nr(r)}throwOnError(){return this.shouldThrowOnError=!0,this}async createIndex(t){var e=this;try{return{data:await Y(e.fetch,`${e.url}/CreateIndex`,t,{headers:e.headers})||{},error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async getIndex(t,e){var r=this;try{return{data:await Y(r.fetch,`${r.url}/GetIndex`,{vectorBucketName:t,indexName:e},{headers:r.headers}),error:null}}catch(s){if(r.shouldThrowOnError)throw s;if(J(s))return{data:null,error:s};throw s}}async listIndexes(t){var e=this;try{return{data:await Y(e.fetch,`${e.url}/ListIndexes`,t,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async deleteIndex(t,e){var r=this;try{return{data:await Y(r.fetch,`${r.url}/DeleteIndex`,{vectorBucketName:t,indexName:e},{headers:r.headers})||{},error:null}}catch(s){if(r.shouldThrowOnError)throw s;if(J(s))return{data:null,error:s};throw s}}},ri=class{constructor(t,e={},r){this.shouldThrowOnError=!1,this.url=t.replace(/\/$/,""),this.headers=k(k({},sr),e),this.fetch=nr(r)}throwOnError(){return this.shouldThrowOnError=!0,this}async putVectors(t){var e=this;try{if(t.vectors.length<1||t.vectors.length>500)throw new Error("Vector batch size must be between 1 and 500 items");return{data:await Y(e.fetch,`${e.url}/PutVectors`,t,{headers:e.headers})||{},error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async getVectors(t){var e=this;try{return{data:await Y(e.fetch,`${e.url}/GetVectors`,t,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async listVectors(t){var e=this;try{if(t.segmentCount!==void 0){if(t.segmentCount<1||t.segmentCount>16)throw new Error("segmentCount must be between 1 and 16");if(t.segmentIndex!==void 0&&(t.segmentIndex<0||t.segmentIndex>=t.segmentCount))throw new Error(`segmentIndex must be between 0 and ${t.segmentCount-1}`)}return{data:await Y(e.fetch,`${e.url}/ListVectors`,t,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async queryVectors(t){var e=this;try{return{data:await Y(e.fetch,`${e.url}/QueryVectors`,t,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async deleteVectors(t){var e=this;try{if(t.keys.length<1||t.keys.length>500)throw new Error("Keys batch size must be between 1 and 500 items");return{data:await Y(e.fetch,`${e.url}/DeleteVectors`,t,{headers:e.headers})||{},error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}},si=class{constructor(t,e={},r){this.shouldThrowOnError=!1,this.url=t.replace(/\/$/,""),this.headers=k(k({},sr),e),this.fetch=nr(r)}throwOnError(){return this.shouldThrowOnError=!0,this}async createBucket(t){var e=this;try{return{data:await Y(e.fetch,`${e.url}/CreateVectorBucket`,{vectorBucketName:t},{headers:e.headers})||{},error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async getBucket(t){var e=this;try{return{data:await Y(e.fetch,`${e.url}/GetVectorBucket`,{vectorBucketName:t},{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async listBuckets(t={}){var e=this;try{return{data:await Y(e.fetch,`${e.url}/ListVectorBuckets`,t,{headers:e.headers}),error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}async deleteBucket(t){var e=this;try{return{data:await Y(e.fetch,`${e.url}/DeleteVectorBucket`,{vectorBucketName:t},{headers:e.headers})||{},error:null}}catch(r){if(e.shouldThrowOnError)throw r;if(J(r))return{data:null,error:r};throw r}}},ni=class extends si{constructor(t,e={}){super(t,e.headers||{},e.fetch)}from(t){return new ii(this.url,this.headers,t,this.fetch)}async createBucket(t){var e=()=>super.createBucket,r=this;return e().call(r,t)}async getBucket(t){var e=()=>super.getBucket,r=this;return e().call(r,t)}async listBuckets(t={}){var e=()=>super.listBuckets,r=this;return e().call(r,t)}async deleteBucket(t){var e=()=>super.deleteBucket,r=this;return e().call(r,t)}},ii=class extends ti{constructor(t,e,r,s){super(t,e,s),this.vectorBucketName=r}async createIndex(t){var e=()=>super.createIndex,r=this;return e().call(r,k(k({},t),{},{vectorBucketName:r.vectorBucketName}))}async listIndexes(t={}){var e=()=>super.listIndexes,r=this;return e().call(r,k(k({},t),{},{vectorBucketName:r.vectorBucketName}))}async getIndex(t){var e=()=>super.getIndex,r=this;return e().call(r,r.vectorBucketName,t)}async deleteIndex(t){var e=()=>super.deleteIndex,r=this;return e().call(r,r.vectorBucketName,t)}index(t){return new ai(this.url,this.headers,this.vectorBucketName,t,this.fetch)}},ai=class extends ri{constructor(t,e,r,s,n){super(t,e,n),this.vectorBucketName=r,this.indexName=s}async putVectors(t){var e=()=>super.putVectors,r=this;return e().call(r,k(k({},t),{},{vectorBucketName:r.vectorBucketName,indexName:r.indexName}))}async getVectors(t){var e=()=>super.getVectors,r=this;return e().call(r,k(k({},t),{},{vectorBucketName:r.vectorBucketName,indexName:r.indexName}))}async listVectors(t={}){var e=()=>super.listVectors,r=this;return e().call(r,k(k({},t),{},{vectorBucketName:r.vectorBucketName,indexName:r.indexName}))}async queryVectors(t){var e=()=>super.queryVectors,r=this;return e().call(r,k(k({},t),{},{vectorBucketName:r.vectorBucketName,indexName:r.indexName}))}async deleteVectors(t){var e=()=>super.deleteVectors,r=this;return e().call(r,k(k({},t),{},{vectorBucketName:r.vectorBucketName,indexName:r.indexName}))}},oi=class extends Gn{constructor(t,e={},r,s){super(t,e,r,s)}from(t){return new zn(this.url,this.headers,t,this.fetch)}get vectors(){return new ni(this.url+"/vector",{headers:this.headers,fetch:this.fetch})}get analytics(){return new Jn(this.url+"/iceberg",this.headers,this.fetch)}};function Et(t,e){var r={};for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&e.indexOf(s)<0&&(r[s]=t[s]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,s=Object.getOwnPropertySymbols(t);n<s.length;n++)e.indexOf(s[n])<0&&Object.prototype.propertyIsEnumerable.call(t,s[n])&&(r[s[n]]=t[s[n]]);return r}const ns="2.89.0",Ne=30*1e3,Ht=3,$t=Ht*Ne,li="http://localhost:9999",ci="supabase.auth.token",ui={"X-Client-Info":`gotrue-js/${ns}`},Kt="X-Supabase-Api-Version",is={"2024-01-01":{timestamp:Date.parse("2024-01-01T00:00:00.0Z"),name:"2024-01-01"}},di=/^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i,hi=600*1e3;class st extends Error{constructor(e,r,s){super(e),this.__isAuthError=!0,this.name="AuthError",this.status=r,this.code=s}}function b(t){return typeof t=="object"&&t!==null&&"__isAuthError"in t}class fi extends st{constructor(e,r,s){super(e,r,s),this.name="AuthApiError",this.status=r,this.code=s}}function pi(t){return b(t)&&t.name==="AuthApiError"}class Se extends st{constructor(e,r){super(e),this.name="AuthUnknownError",this.originalError=r}}class de extends st{constructor(e,r,s,n){super(e,s,n),this.name=r,this.status=s}}class G extends de{constructor(){super("Auth session missing!","AuthSessionMissingError",400,void 0)}}function gi(t){return b(t)&&t.name==="AuthSessionMissingError"}class $e extends de{constructor(){super("Auth session or user missing","AuthInvalidTokenResponseError",500,void 0)}}class ht extends de{constructor(e){super(e,"AuthInvalidCredentialsError",400,void 0)}}class ft extends de{constructor(e,r=null){super(e,"AuthImplicitGrantRedirectError",500,void 0),this.details=null,this.details=r}toJSON(){return{name:this.name,message:this.message,status:this.status,details:this.details}}}function mi(t){return b(t)&&t.name==="AuthImplicitGrantRedirectError"}class Sr extends de{constructor(e,r=null){super(e,"AuthPKCEGrantCodeExchangeError",500,void 0),this.details=null,this.details=r}toJSON(){return{name:this.name,message:this.message,status:this.status,details:this.details}}}class wi extends de{constructor(){super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.","AuthPKCECodeVerifierMissingError",400,"pkce_code_verifier_not_found")}}class zt extends de{constructor(e,r){super(e,"AuthRetryableFetchError",r,void 0)}}function Pt(t){return b(t)&&t.name==="AuthRetryableFetchError"}class kr extends de{constructor(e,r,s){super(e,"AuthWeakPasswordError",r,"weak_password"),this.reasons=s}}class Gt extends de{constructor(e){super(e,"AuthInvalidJwtError",400,"invalid_jwt")}}const mt="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""),Tr=` 	
\r=`.split(""),vi=(()=>{const t=new Array(128);for(let e=0;e<t.length;e+=1)t[e]=-1;for(let e=0;e<Tr.length;e+=1)t[Tr[e].charCodeAt(0)]=-2;for(let e=0;e<mt.length;e+=1)t[mt[e].charCodeAt(0)]=e;return t})();function Or(t,e,r){if(t!==null)for(e.queue=e.queue<<8|t,e.queuedBits+=8;e.queuedBits>=6;){const s=e.queue>>e.queuedBits-6&63;r(mt[s]),e.queuedBits-=6}else if(e.queuedBits>0)for(e.queue=e.queue<<6-e.queuedBits,e.queuedBits=6;e.queuedBits>=6;){const s=e.queue>>e.queuedBits-6&63;r(mt[s]),e.queuedBits-=6}}function as(t,e,r){const s=vi[t];if(s>-1)for(e.queue=e.queue<<6|s,e.queuedBits+=6;e.queuedBits>=8;)r(e.queue>>e.queuedBits-8&255),e.queuedBits-=8;else{if(s===-2)return;throw new Error(`Invalid Base64-URL character "${String.fromCharCode(t)}"`)}}function Ar(t){const e=[],r=a=>{e.push(String.fromCodePoint(a))},s={utf8seq:0,codepoint:0},n={queue:0,queuedBits:0},i=a=>{bi(a,s,r)};for(let a=0;a<t.length;a+=1)as(t.charCodeAt(a),n,i);return e.join("")}function yi(t,e){if(t<=127){e(t);return}else if(t<=2047){e(192|t>>6),e(128|t&63);return}else if(t<=65535){e(224|t>>12),e(128|t>>6&63),e(128|t&63);return}else if(t<=1114111){e(240|t>>18),e(128|t>>12&63),e(128|t>>6&63),e(128|t&63);return}throw new Error(`Unrecognized Unicode codepoint: ${t.toString(16)}`)}function _i(t,e){for(let r=0;r<t.length;r+=1){let s=t.charCodeAt(r);if(s>55295&&s<=56319){const n=(s-55296)*1024&65535;s=(t.charCodeAt(r+1)-56320&65535|n)+65536,r+=1}yi(s,e)}}function bi(t,e,r){if(e.utf8seq===0){if(t<=127){r(t);return}for(let s=1;s<6;s+=1)if((t>>7-s&1)===0){e.utf8seq=s;break}if(e.utf8seq===2)e.codepoint=t&31;else if(e.utf8seq===3)e.codepoint=t&15;else if(e.utf8seq===4)e.codepoint=t&7;else throw new Error("Invalid UTF-8 sequence");e.utf8seq-=1}else if(e.utf8seq>0){if(t<=127)throw new Error("Invalid UTF-8 sequence");e.codepoint=e.codepoint<<6|t&63,e.utf8seq-=1,e.utf8seq===0&&r(e.codepoint)}}function Be(t){const e=[],r={queue:0,queuedBits:0},s=n=>{e.push(n)};for(let n=0;n<t.length;n+=1)as(t.charCodeAt(n),r,s);return new Uint8Array(e)}function Ei(t){const e=[];return _i(t,r=>e.push(r)),new Uint8Array(e)}function ke(t){const e=[],r={queue:0,queuedBits:0},s=n=>{e.push(n)};return t.forEach(n=>Or(n,r,s)),Or(null,r,s),e.join("")}function Si(t){return Math.round(Date.now()/1e3)+t}function ki(){return Symbol("auth-callback")}const F=()=>typeof window<"u"&&typeof document<"u",ye={tested:!1,writable:!1},os=()=>{if(!F())return!1;try{if(typeof globalThis.localStorage!="object")return!1}catch{return!1}if(ye.tested)return ye.writable;const t=`lswt-${Math.random()}${Math.random()}`;try{globalThis.localStorage.setItem(t,t),globalThis.localStorage.removeItem(t),ye.tested=!0,ye.writable=!0}catch{ye.tested=!0,ye.writable=!1}return ye.writable};function Ti(t){const e={},r=new URL(t);if(r.hash&&r.hash[0]==="#")try{new URLSearchParams(r.hash.substring(1)).forEach((n,i)=>{e[i]=n})}catch{}return r.searchParams.forEach((s,n)=>{e[n]=s}),e}const ls=t=>t?(...e)=>t(...e):(...e)=>fetch(...e),Oi=t=>typeof t=="object"&&t!==null&&"status"in t&&"ok"in t&&"json"in t&&typeof t.json=="function",De=async(t,e,r)=>{await t.setItem(e,JSON.stringify(r))},_e=async(t,e)=>{const r=await t.getItem(e);if(!r)return null;try{return JSON.parse(r)}catch{return r}},M=async(t,e)=>{await t.removeItem(e)};class St{constructor(){this.promise=new St.promiseConstructor((e,r)=>{this.resolve=e,this.reject=r})}}St.promiseConstructor=Promise;function It(t){const e=t.split(".");if(e.length!==3)throw new Gt("Invalid JWT structure");for(let s=0;s<e.length;s++)if(!di.test(e[s]))throw new Gt("JWT not in base64url format");return{header:JSON.parse(Ar(e[0])),payload:JSON.parse(Ar(e[1])),signature:Be(e[2]),raw:{header:e[0],payload:e[1]}}}async function Ai(t){return await new Promise(e=>{setTimeout(()=>e(null),t)})}function Ci(t,e){return new Promise((s,n)=>{(async()=>{for(let i=0;i<1/0;i++)try{const a=await t(i);if(!e(i,null,a)){s(a);return}}catch(a){if(!e(i,a)){n(a);return}}})()})}function Ri(t){return("0"+t.toString(16)).substr(-2)}function $i(){const e=new Uint32Array(56);if(typeof crypto>"u"){const r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",s=r.length;let n="";for(let i=0;i<56;i++)n+=r.charAt(Math.floor(Math.random()*s));return n}return crypto.getRandomValues(e),Array.from(e,Ri).join("")}async function Pi(t){const r=new TextEncoder().encode(t),s=await crypto.subtle.digest("SHA-256",r),n=new Uint8Array(s);return Array.from(n).map(i=>String.fromCharCode(i)).join("")}async function Ii(t){if(!(typeof crypto<"u"&&typeof crypto.subtle<"u"&&typeof TextEncoder<"u"))return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."),t;const r=await Pi(t);return btoa(r).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}async function Pe(t,e,r=!1){const s=$i();let n=s;r&&(n+="/PASSWORD_RECOVERY"),await De(t,`${e}-code-verifier`,n);const i=await Ii(s);return[i,s===i?"plain":"s256"]}const xi=/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;function ji(t){const e=t.headers.get(Kt);if(!e||!e.match(xi))return null;try{return new Date(`${e}T00:00:00.0Z`)}catch{return null}}function Li(t){if(!t)throw new Error("Missing exp claim");const e=Math.floor(Date.now()/1e3);if(t<=e)throw new Error("JWT has expired")}function Ni(t){switch(t){case"RS256":return{name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}};case"ES256":return{name:"ECDSA",namedCurve:"P-256",hash:{name:"SHA-256"}};default:throw new Error("Invalid alg claim")}}const Di=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;function Ie(t){if(!Di.test(t))throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not")}function xt(){const t={};return new Proxy(t,{get:(e,r)=>{if(r==="__isUserNotAvailableProxy")return!0;if(typeof r=="symbol"){const s=r.toString();if(s==="Symbol(Symbol.toPrimitive)"||s==="Symbol(Symbol.toStringTag)"||s==="Symbol(util.inspect.custom)")return}throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${r}" property of the session object is not supported. Please use getUser() instead.`)},set:(e,r)=>{throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${r}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`)},deleteProperty:(e,r)=>{throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${r}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`)}})}function Ui(t,e){return new Proxy(t,{get:(r,s,n)=>{if(s==="__isInsecureUserWarningProxy")return!0;if(typeof s=="symbol"){const i=s.toString();if(i==="Symbol(Symbol.toPrimitive)"||i==="Symbol(Symbol.toStringTag)"||i==="Symbol(util.inspect.custom)"||i==="Symbol(nodejs.util.inspect.custom)")return Reflect.get(r,s,n)}return!e.value&&typeof s=="string"&&(console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."),e.value=!0),Reflect.get(r,s,n)}})}function Cr(t){return JSON.parse(JSON.stringify(t))}const be=t=>t.msg||t.message||t.error_description||t.error||JSON.stringify(t),Bi=[502,503,504];async function Rr(t){var e;if(!Oi(t))throw new zt(be(t),0);if(Bi.includes(t.status))throw new zt(be(t),t.status);let r;try{r=await t.json()}catch(i){throw new Se(be(i),i)}let s;const n=ji(t);if(n&&n.getTime()>=is["2024-01-01"].timestamp&&typeof r=="object"&&r&&typeof r.code=="string"?s=r.code:typeof r=="object"&&r&&typeof r.error_code=="string"&&(s=r.error_code),s){if(s==="weak_password")throw new kr(be(r),t.status,((e=r.weak_password)===null||e===void 0?void 0:e.reasons)||[]);if(s==="session_not_found")throw new G}else if(typeof r=="object"&&r&&typeof r.weak_password=="object"&&r.weak_password&&Array.isArray(r.weak_password.reasons)&&r.weak_password.reasons.length&&r.weak_password.reasons.reduce((i,a)=>i&&typeof a=="string",!0))throw new kr(be(r),t.status,r.weak_password.reasons);throw new fi(be(r),t.status||500,s)}const qi=(t,e,r,s)=>{const n={method:t,headers:e?.headers||{}};return t==="GET"?n:(n.headers=Object.assign({"Content-Type":"application/json;charset=UTF-8"},e?.headers),n.body=JSON.stringify(s),Object.assign(Object.assign({},n),r))};async function S(t,e,r,s){var n;const i=Object.assign({},s?.headers);i[Kt]||(i[Kt]=is["2024-01-01"].name),s?.jwt&&(i.Authorization=`Bearer ${s.jwt}`);const a=(n=s?.query)!==null&&n!==void 0?n:{};s?.redirectTo&&(a.redirect_to=s.redirectTo);const o=Object.keys(a).length?"?"+new URLSearchParams(a).toString():"",l=await Mi(t,e,r+o,{headers:i,noResolveJson:s?.noResolveJson},{},s?.body);return s?.xform?s?.xform(l):{data:Object.assign({},l),error:null}}async function Mi(t,e,r,s,n,i){const a=qi(e,s,n,i);let o;try{o=await t(r,Object.assign({},a))}catch(l){throw console.error(l),new zt(be(l),0)}if(o.ok||await Rr(o),s?.noResolveJson)return o;try{return await o.json()}catch(l){await Rr(l)}}function re(t){var e;let r=null;Wi(t)&&(r=Object.assign({},t),t.expires_at||(r.expires_at=Si(t.expires_in)));const s=(e=t.user)!==null&&e!==void 0?e:t;return{data:{session:r,user:s},error:null}}function $r(t){const e=re(t);return!e.error&&t.weak_password&&typeof t.weak_password=="object"&&Array.isArray(t.weak_password.reasons)&&t.weak_password.reasons.length&&t.weak_password.message&&typeof t.weak_password.message=="string"&&t.weak_password.reasons.reduce((r,s)=>r&&typeof s=="string",!0)&&(e.data.weak_password=t.weak_password),e}function me(t){var e;return{data:{user:(e=t.user)!==null&&e!==void 0?e:t},error:null}}function Fi(t){return{data:t,error:null}}function Vi(t){const{action_link:e,email_otp:r,hashed_token:s,redirect_to:n,verification_type:i}=t,a=Et(t,["action_link","email_otp","hashed_token","redirect_to","verification_type"]),o={action_link:e,email_otp:r,hashed_token:s,redirect_to:n,verification_type:i},l=Object.assign({},a);return{data:{properties:o,user:l},error:null}}function Pr(t){return t}function Wi(t){return t.access_token&&t.refresh_token&&t.expires_in}const jt=["global","local","others"];class Hi{constructor({url:e="",headers:r={},fetch:s}){this.url=e,this.headers=r,this.fetch=ls(s),this.mfa={listFactors:this._listFactors.bind(this),deleteFactor:this._deleteFactor.bind(this)},this.oauth={listClients:this._listOAuthClients.bind(this),createClient:this._createOAuthClient.bind(this),getClient:this._getOAuthClient.bind(this),updateClient:this._updateOAuthClient.bind(this),deleteClient:this._deleteOAuthClient.bind(this),regenerateClientSecret:this._regenerateOAuthClientSecret.bind(this)}}async signOut(e,r=jt[0]){if(jt.indexOf(r)<0)throw new Error(`@supabase/auth-js: Parameter scope must be one of ${jt.join(", ")}`);try{return await S(this.fetch,"POST",`${this.url}/logout?scope=${r}`,{headers:this.headers,jwt:e,noResolveJson:!0}),{data:null,error:null}}catch(s){if(b(s))return{data:null,error:s};throw s}}async inviteUserByEmail(e,r={}){try{return await S(this.fetch,"POST",`${this.url}/invite`,{body:{email:e,data:r.data},headers:this.headers,redirectTo:r.redirectTo,xform:me})}catch(s){if(b(s))return{data:{user:null},error:s};throw s}}async generateLink(e){try{const{options:r}=e,s=Et(e,["options"]),n=Object.assign(Object.assign({},s),r);return"newEmail"in s&&(n.new_email=s?.newEmail,delete n.newEmail),await S(this.fetch,"POST",`${this.url}/admin/generate_link`,{body:n,headers:this.headers,xform:Vi,redirectTo:r?.redirectTo})}catch(r){if(b(r))return{data:{properties:null,user:null},error:r};throw r}}async createUser(e){try{return await S(this.fetch,"POST",`${this.url}/admin/users`,{body:e,headers:this.headers,xform:me})}catch(r){if(b(r))return{data:{user:null},error:r};throw r}}async listUsers(e){var r,s,n,i,a,o,l;try{const c={nextPage:null,lastPage:0,total:0},h=await S(this.fetch,"GET",`${this.url}/admin/users`,{headers:this.headers,noResolveJson:!0,query:{page:(s=(r=e?.page)===null||r===void 0?void 0:r.toString())!==null&&s!==void 0?s:"",per_page:(i=(n=e?.perPage)===null||n===void 0?void 0:n.toString())!==null&&i!==void 0?i:""},xform:Pr});if(h.error)throw h.error;const p=await h.json(),f=(a=h.headers.get("x-total-count"))!==null&&a!==void 0?a:0,g=(l=(o=h.headers.get("link"))===null||o===void 0?void 0:o.split(","))!==null&&l!==void 0?l:[];return g.length>0&&(g.forEach(m=>{const w=parseInt(m.split(";")[0].split("=")[1].substring(0,1)),v=JSON.parse(m.split(";")[1].split("=")[1]);c[`${v}Page`]=w}),c.total=parseInt(f)),{data:Object.assign(Object.assign({},p),c),error:null}}catch(c){if(b(c))return{data:{users:[]},error:c};throw c}}async getUserById(e){Ie(e);try{return await S(this.fetch,"GET",`${this.url}/admin/users/${e}`,{headers:this.headers,xform:me})}catch(r){if(b(r))return{data:{user:null},error:r};throw r}}async updateUserById(e,r){Ie(e);try{return await S(this.fetch,"PUT",`${this.url}/admin/users/${e}`,{body:r,headers:this.headers,xform:me})}catch(s){if(b(s))return{data:{user:null},error:s};throw s}}async deleteUser(e,r=!1){Ie(e);try{return await S(this.fetch,"DELETE",`${this.url}/admin/users/${e}`,{headers:this.headers,body:{should_soft_delete:r},xform:me})}catch(s){if(b(s))return{data:{user:null},error:s};throw s}}async _listFactors(e){Ie(e.userId);try{const{data:r,error:s}=await S(this.fetch,"GET",`${this.url}/admin/users/${e.userId}/factors`,{headers:this.headers,xform:n=>({data:{factors:n},error:null})});return{data:r,error:s}}catch(r){if(b(r))return{data:null,error:r};throw r}}async _deleteFactor(e){Ie(e.userId),Ie(e.id);try{return{data:await S(this.fetch,"DELETE",`${this.url}/admin/users/${e.userId}/factors/${e.id}`,{headers:this.headers}),error:null}}catch(r){if(b(r))return{data:null,error:r};throw r}}async _listOAuthClients(e){var r,s,n,i,a,o,l;try{const c={nextPage:null,lastPage:0,total:0},h=await S(this.fetch,"GET",`${this.url}/admin/oauth/clients`,{headers:this.headers,noResolveJson:!0,query:{page:(s=(r=e?.page)===null||r===void 0?void 0:r.toString())!==null&&s!==void 0?s:"",per_page:(i=(n=e?.perPage)===null||n===void 0?void 0:n.toString())!==null&&i!==void 0?i:""},xform:Pr});if(h.error)throw h.error;const p=await h.json(),f=(a=h.headers.get("x-total-count"))!==null&&a!==void 0?a:0,g=(l=(o=h.headers.get("link"))===null||o===void 0?void 0:o.split(","))!==null&&l!==void 0?l:[];return g.length>0&&(g.forEach(m=>{const w=parseInt(m.split(";")[0].split("=")[1].substring(0,1)),v=JSON.parse(m.split(";")[1].split("=")[1]);c[`${v}Page`]=w}),c.total=parseInt(f)),{data:Object.assign(Object.assign({},p),c),error:null}}catch(c){if(b(c))return{data:{clients:[]},error:c};throw c}}async _createOAuthClient(e){try{return await S(this.fetch,"POST",`${this.url}/admin/oauth/clients`,{body:e,headers:this.headers,xform:r=>({data:r,error:null})})}catch(r){if(b(r))return{data:null,error:r};throw r}}async _getOAuthClient(e){try{return await S(this.fetch,"GET",`${this.url}/admin/oauth/clients/${e}`,{headers:this.headers,xform:r=>({data:r,error:null})})}catch(r){if(b(r))return{data:null,error:r};throw r}}async _updateOAuthClient(e,r){try{return await S(this.fetch,"PUT",`${this.url}/admin/oauth/clients/${e}`,{body:r,headers:this.headers,xform:s=>({data:s,error:null})})}catch(s){if(b(s))return{data:null,error:s};throw s}}async _deleteOAuthClient(e){try{return await S(this.fetch,"DELETE",`${this.url}/admin/oauth/clients/${e}`,{headers:this.headers,noResolveJson:!0}),{data:null,error:null}}catch(r){if(b(r))return{data:null,error:r};throw r}}async _regenerateOAuthClientSecret(e){try{return await S(this.fetch,"POST",`${this.url}/admin/oauth/clients/${e}/regenerate_secret`,{headers:this.headers,xform:r=>({data:r,error:null})})}catch(r){if(b(r))return{data:null,error:r};throw r}}}function Ir(t={}){return{getItem:e=>t[e]||null,setItem:(e,r)=>{t[e]=r},removeItem:e=>{delete t[e]}}}const xe={debug:!!(globalThis&&os()&&globalThis.localStorage&&globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug")==="true")};class cs extends Error{constructor(e){super(e),this.isAcquireTimeout=!0}}class Ki extends cs{}async function zi(t,e,r){xe.debug&&console.log("@supabase/gotrue-js: navigatorLock: acquire lock",t,e);const s=new globalThis.AbortController;return e>0&&setTimeout(()=>{s.abort(),xe.debug&&console.log("@supabase/gotrue-js: navigatorLock acquire timed out",t)},e),await Promise.resolve().then(()=>globalThis.navigator.locks.request(t,e===0?{mode:"exclusive",ifAvailable:!0}:{mode:"exclusive",signal:s.signal},async n=>{if(n){xe.debug&&console.log("@supabase/gotrue-js: navigatorLock: acquired",t,n.name);try{return await r()}finally{xe.debug&&console.log("@supabase/gotrue-js: navigatorLock: released",t,n.name)}}else{if(e===0)throw xe.debug&&console.log("@supabase/gotrue-js: navigatorLock: not immediately available",t),new Ki(`Acquiring an exclusive Navigator LockManager lock "${t}" immediately failed`);if(xe.debug)try{const i=await globalThis.navigator.locks.query();console.log("@supabase/gotrue-js: Navigator LockManager state",JSON.stringify(i,null,"  "))}catch(i){console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state",i)}return console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"),await r()}}))}function Gi(){if(typeof globalThis!="object")try{Object.defineProperty(Object.prototype,"__magic__",{get:function(){return this},configurable:!0}),__magic__.globalThis=__magic__,delete Object.prototype.__magic__}catch{typeof self<"u"&&(self.globalThis=self)}}function us(t){if(!/^0x[a-fA-F0-9]{40}$/.test(t))throw new Error(`@supabase/auth-js: Address "${t}" is invalid.`);return t.toLowerCase()}function Ji(t){return parseInt(t,16)}function Yi(t){const e=new TextEncoder().encode(t);return"0x"+Array.from(e,s=>s.toString(16).padStart(2,"0")).join("")}function Xi(t){var e;const{chainId:r,domain:s,expirationTime:n,issuedAt:i=new Date,nonce:a,notBefore:o,requestId:l,resources:c,scheme:h,uri:p,version:f}=t;{if(!Number.isInteger(r))throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${r}`);if(!s)throw new Error('@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.');if(a&&a.length<8)throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${a}`);if(!p)throw new Error('@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.');if(f!=="1")throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${f}`);if(!((e=t.statement)===null||e===void 0)&&e.includes(`
`))throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${t.statement}`)}const g=us(t.address),m=h?`${h}://${s}`:s,w=t.statement?`${t.statement}
`:"",v=`${m} wants you to sign in with your Ethereum account:
${g}

${w}`;let _=`URI: ${p}
Version: ${f}
Chain ID: ${r}${a?`
Nonce: ${a}`:""}
Issued At: ${i.toISOString()}`;if(n&&(_+=`
Expiration Time: ${n.toISOString()}`),o&&(_+=`
Not Before: ${o.toISOString()}`),l&&(_+=`
Request ID: ${l}`),c){let E=`
Resources:`;for(const y of c){if(!y||typeof y!="string")throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${y}`);E+=`
- ${y}`}_+=E}return`${v}
${_}`}class U extends Error{constructor({message:e,code:r,cause:s,name:n}){var i;super(e,{cause:s}),this.__isWebAuthnError=!0,this.name=(i=n??(s instanceof Error?s.name:void 0))!==null&&i!==void 0?i:"Unknown Error",this.code=r}}class wt extends U{constructor(e,r){super({code:"ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",cause:r,message:e}),this.name="WebAuthnUnknownError",this.originalError=r}}function Qi({error:t,options:e}){var r,s,n;const{publicKey:i}=e;if(!i)throw Error("options was missing required publicKey property");if(t.name==="AbortError"){if(e.signal instanceof AbortSignal)return new U({message:"Registration ceremony was sent an abort signal",code:"ERROR_CEREMONY_ABORTED",cause:t})}else if(t.name==="ConstraintError"){if(((r=i.authenticatorSelection)===null||r===void 0?void 0:r.requireResidentKey)===!0)return new U({message:"Discoverable credentials were required but no available authenticator supported it",code:"ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",cause:t});if(e.mediation==="conditional"&&((s=i.authenticatorSelection)===null||s===void 0?void 0:s.userVerification)==="required")return new U({message:"User verification was required during automatic registration but it could not be performed",code:"ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",cause:t});if(((n=i.authenticatorSelection)===null||n===void 0?void 0:n.userVerification)==="required")return new U({message:"User verification was required but no available authenticator supported it",code:"ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",cause:t})}else{if(t.name==="InvalidStateError")return new U({message:"The authenticator was previously registered",code:"ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",cause:t});if(t.name==="NotAllowedError")return new U({message:t.message,code:"ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",cause:t});if(t.name==="NotSupportedError")return i.pubKeyCredParams.filter(o=>o.type==="public-key").length===0?new U({message:'No entry in pubKeyCredParams was of type "public-key"',code:"ERROR_MALFORMED_PUBKEYCREDPARAMS",cause:t}):new U({message:"No available authenticator supported any of the specified pubKeyCredParams algorithms",code:"ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",cause:t});if(t.name==="SecurityError"){const a=window.location.hostname;if(ds(a)){if(i.rp.id!==a)return new U({message:`The RP ID "${i.rp.id}" is invalid for this domain`,code:"ERROR_INVALID_RP_ID",cause:t})}else return new U({message:`${window.location.hostname} is an invalid domain`,code:"ERROR_INVALID_DOMAIN",cause:t})}else if(t.name==="TypeError"){if(i.user.id.byteLength<1||i.user.id.byteLength>64)return new U({message:"User ID was not between 1 and 64 characters",code:"ERROR_INVALID_USER_ID_LENGTH",cause:t})}else if(t.name==="UnknownError")return new U({message:"The authenticator was unable to process the specified options, or could not create a new credential",code:"ERROR_AUTHENTICATOR_GENERAL_ERROR",cause:t})}return new U({message:"a Non-Webauthn related error has occurred",code:"ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",cause:t})}function Zi({error:t,options:e}){const{publicKey:r}=e;if(!r)throw Error("options was missing required publicKey property");if(t.name==="AbortError"){if(e.signal instanceof AbortSignal)return new U({message:"Authentication ceremony was sent an abort signal",code:"ERROR_CEREMONY_ABORTED",cause:t})}else{if(t.name==="NotAllowedError")return new U({message:t.message,code:"ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",cause:t});if(t.name==="SecurityError"){const s=window.location.hostname;if(ds(s)){if(r.rpId!==s)return new U({message:`The RP ID "${r.rpId}" is invalid for this domain`,code:"ERROR_INVALID_RP_ID",cause:t})}else return new U({message:`${window.location.hostname} is an invalid domain`,code:"ERROR_INVALID_DOMAIN",cause:t})}else if(t.name==="UnknownError")return new U({message:"The authenticator was unable to process the specified options, or could not create a new assertion signature",code:"ERROR_AUTHENTICATOR_GENERAL_ERROR",cause:t})}return new U({message:"a Non-Webauthn related error has occurred",code:"ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",cause:t})}class ea{createNewAbortSignal(){if(this.controller){const r=new Error("Cancelling existing WebAuthn API call for new one");r.name="AbortError",this.controller.abort(r)}const e=new AbortController;return this.controller=e,e.signal}cancelCeremony(){if(this.controller){const e=new Error("Manually cancelling existing WebAuthn API call");e.name="AbortError",this.controller.abort(e),this.controller=void 0}}}const ta=new ea;function ra(t){if(!t)throw new Error("Credential creation options are required");if(typeof PublicKeyCredential<"u"&&"parseCreationOptionsFromJSON"in PublicKeyCredential&&typeof PublicKeyCredential.parseCreationOptionsFromJSON=="function")return PublicKeyCredential.parseCreationOptionsFromJSON(t);const{challenge:e,user:r,excludeCredentials:s}=t,n=Et(t,["challenge","user","excludeCredentials"]),i=Be(e).buffer,a=Object.assign(Object.assign({},r),{id:Be(r.id).buffer}),o=Object.assign(Object.assign({},n),{challenge:i,user:a});if(s&&s.length>0){o.excludeCredentials=new Array(s.length);for(let l=0;l<s.length;l++){const c=s[l];o.excludeCredentials[l]=Object.assign(Object.assign({},c),{id:Be(c.id).buffer,type:c.type||"public-key",transports:c.transports})}}return o}function sa(t){if(!t)throw new Error("Credential request options are required");if(typeof PublicKeyCredential<"u"&&"parseRequestOptionsFromJSON"in PublicKeyCredential&&typeof PublicKeyCredential.parseRequestOptionsFromJSON=="function")return PublicKeyCredential.parseRequestOptionsFromJSON(t);const{challenge:e,allowCredentials:r}=t,s=Et(t,["challenge","allowCredentials"]),n=Be(e).buffer,i=Object.assign(Object.assign({},s),{challenge:n});if(r&&r.length>0){i.allowCredentials=new Array(r.length);for(let a=0;a<r.length;a++){const o=r[a];i.allowCredentials[a]=Object.assign(Object.assign({},o),{id:Be(o.id).buffer,type:o.type||"public-key",transports:o.transports})}}return i}function na(t){var e;if("toJSON"in t&&typeof t.toJSON=="function")return t.toJSON();const r=t;return{id:t.id,rawId:t.id,response:{attestationObject:ke(new Uint8Array(t.response.attestationObject)),clientDataJSON:ke(new Uint8Array(t.response.clientDataJSON))},type:"public-key",clientExtensionResults:t.getClientExtensionResults(),authenticatorAttachment:(e=r.authenticatorAttachment)!==null&&e!==void 0?e:void 0}}function ia(t){var e;if("toJSON"in t&&typeof t.toJSON=="function")return t.toJSON();const r=t,s=t.getClientExtensionResults(),n=t.response;return{id:t.id,rawId:t.id,response:{authenticatorData:ke(new Uint8Array(n.authenticatorData)),clientDataJSON:ke(new Uint8Array(n.clientDataJSON)),signature:ke(new Uint8Array(n.signature)),userHandle:n.userHandle?ke(new Uint8Array(n.userHandle)):void 0},type:"public-key",clientExtensionResults:s,authenticatorAttachment:(e=r.authenticatorAttachment)!==null&&e!==void 0?e:void 0}}function ds(t){return t==="localhost"||/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(t)}function xr(){var t,e;return!!(F()&&"PublicKeyCredential"in window&&window.PublicKeyCredential&&"credentials"in navigator&&typeof((t=navigator?.credentials)===null||t===void 0?void 0:t.create)=="function"&&typeof((e=navigator?.credentials)===null||e===void 0?void 0:e.get)=="function")}async function aa(t){try{const e=await navigator.credentials.create(t);return e?e instanceof PublicKeyCredential?{data:e,error:null}:{data:null,error:new wt("Browser returned unexpected credential type",e)}:{data:null,error:new wt("Empty credential response",e)}}catch(e){return{data:null,error:Qi({error:e,options:t})}}}async function oa(t){try{const e=await navigator.credentials.get(t);return e?e instanceof PublicKeyCredential?{data:e,error:null}:{data:null,error:new wt("Browser returned unexpected credential type",e)}:{data:null,error:new wt("Empty credential response",e)}}catch(e){return{data:null,error:Zi({error:e,options:t})}}}const la={hints:["security-key"],authenticatorSelection:{authenticatorAttachment:"cross-platform",requireResidentKey:!1,userVerification:"preferred",residentKey:"discouraged"},attestation:"direct"},ca={userVerification:"preferred",hints:["security-key"],attestation:"direct"};function vt(...t){const e=n=>n!==null&&typeof n=="object"&&!Array.isArray(n),r=n=>n instanceof ArrayBuffer||ArrayBuffer.isView(n),s={};for(const n of t)if(n)for(const i in n){const a=n[i];if(a!==void 0)if(Array.isArray(a))s[i]=a;else if(r(a))s[i]=a;else if(e(a)){const o=s[i];e(o)?s[i]=vt(o,a):s[i]=vt(a)}else s[i]=a}return s}function ua(t,e){return vt(la,t,e||{})}function da(t,e){return vt(ca,t,e||{})}class ha{constructor(e){this.client=e,this.enroll=this._enroll.bind(this),this.challenge=this._challenge.bind(this),this.verify=this._verify.bind(this),this.authenticate=this._authenticate.bind(this),this.register=this._register.bind(this)}async _enroll(e){return this.client.mfa.enroll(Object.assign(Object.assign({},e),{factorType:"webauthn"}))}async _challenge({factorId:e,webauthn:r,friendlyName:s,signal:n},i){try{const{data:a,error:o}=await this.client.mfa.challenge({factorId:e,webauthn:r});if(!a)return{data:null,error:o};const l=n??ta.createNewAbortSignal();if(a.webauthn.type==="create"){const{user:c}=a.webauthn.credential_options.publicKey;c.name||(c.name=`${c.id}:${s}`),c.displayName||(c.displayName=c.name)}switch(a.webauthn.type){case"create":{const c=ua(a.webauthn.credential_options.publicKey,i?.create),{data:h,error:p}=await aa({publicKey:c,signal:l});return h?{data:{factorId:e,challengeId:a.id,webauthn:{type:a.webauthn.type,credential_response:h}},error:null}:{data:null,error:p}}case"request":{const c=da(a.webauthn.credential_options.publicKey,i?.request),{data:h,error:p}=await oa(Object.assign(Object.assign({},a.webauthn.credential_options),{publicKey:c,signal:l}));return h?{data:{factorId:e,challengeId:a.id,webauthn:{type:a.webauthn.type,credential_response:h}},error:null}:{data:null,error:p}}}}catch(a){return b(a)?{data:null,error:a}:{data:null,error:new Se("Unexpected error in challenge",a)}}}async _verify({challengeId:e,factorId:r,webauthn:s}){return this.client.mfa.verify({factorId:r,challengeId:e,webauthn:s})}async _authenticate({factorId:e,webauthn:{rpId:r=typeof window<"u"?window.location.hostname:void 0,rpOrigins:s=typeof window<"u"?[window.location.origin]:void 0,signal:n}={}},i){if(!r)return{data:null,error:new st("rpId is required for WebAuthn authentication")};try{if(!xr())return{data:null,error:new Se("Browser does not support WebAuthn",null)};const{data:a,error:o}=await this.challenge({factorId:e,webauthn:{rpId:r,rpOrigins:s},signal:n},{request:i});if(!a)return{data:null,error:o};const{webauthn:l}=a;return this._verify({factorId:e,challengeId:a.challengeId,webauthn:{type:l.type,rpId:r,rpOrigins:s,credential_response:l.credential_response}})}catch(a){return b(a)?{data:null,error:a}:{data:null,error:new Se("Unexpected error in authenticate",a)}}}async _register({friendlyName:e,webauthn:{rpId:r=typeof window<"u"?window.location.hostname:void 0,rpOrigins:s=typeof window<"u"?[window.location.origin]:void 0,signal:n}={}},i){if(!r)return{data:null,error:new st("rpId is required for WebAuthn registration")};try{if(!xr())return{data:null,error:new Se("Browser does not support WebAuthn",null)};const{data:a,error:o}=await this._enroll({friendlyName:e});if(!a)return await this.client.mfa.listFactors().then(h=>{var p;return(p=h.data)===null||p===void 0?void 0:p.all.find(f=>f.factor_type==="webauthn"&&f.friendly_name===e&&f.status!=="unverified")}).then(h=>h?this.client.mfa.unenroll({factorId:h?.id}):void 0),{data:null,error:o};const{data:l,error:c}=await this._challenge({factorId:a.id,friendlyName:a.friendly_name,webauthn:{rpId:r,rpOrigins:s},signal:n},{create:i});return l?this._verify({factorId:a.id,challengeId:l.challengeId,webauthn:{rpId:r,rpOrigins:s,type:l.webauthn.type,credential_response:l.webauthn.credential_response}}):{data:null,error:c}}catch(a){return b(a)?{data:null,error:a}:{data:null,error:new Se("Unexpected error in register",a)}}}}Gi();const fa={url:li,storageKey:ci,autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0,headers:ui,flowType:"implicit",debug:!1,hasCustomAuthorizationHeader:!1,throwOnError:!1};async function jr(t,e,r){return await r()}const je={};class nt{get jwks(){var e,r;return(r=(e=je[this.storageKey])===null||e===void 0?void 0:e.jwks)!==null&&r!==void 0?r:{keys:[]}}set jwks(e){je[this.storageKey]=Object.assign(Object.assign({},je[this.storageKey]),{jwks:e})}get jwks_cached_at(){var e,r;return(r=(e=je[this.storageKey])===null||e===void 0?void 0:e.cachedAt)!==null&&r!==void 0?r:Number.MIN_SAFE_INTEGER}set jwks_cached_at(e){je[this.storageKey]=Object.assign(Object.assign({},je[this.storageKey]),{cachedAt:e})}constructor(e){var r,s,n;this.userStorage=null,this.memoryStorage=null,this.stateChangeEmitters=new Map,this.autoRefreshTicker=null,this.visibilityChangedCallback=null,this.refreshingDeferred=null,this.initializePromise=null,this.detectSessionInUrl=!0,this.hasCustomAuthorizationHeader=!1,this.suppressGetSessionWarning=!1,this.lockAcquired=!1,this.pendingInLock=[],this.broadcastChannel=null,this.logger=console.log;const i=Object.assign(Object.assign({},fa),e);if(this.storageKey=i.storageKey,this.instanceID=(r=nt.nextInstanceID[this.storageKey])!==null&&r!==void 0?r:0,nt.nextInstanceID[this.storageKey]=this.instanceID+1,this.logDebugMessages=!!i.debug,typeof i.debug=="function"&&(this.logger=i.debug),this.instanceID>0&&F()){const a=`${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;console.warn(a),this.logDebugMessages&&console.trace(a)}if(this.persistSession=i.persistSession,this.autoRefreshToken=i.autoRefreshToken,this.admin=new Hi({url:i.url,headers:i.headers,fetch:i.fetch}),this.url=i.url,this.headers=i.headers,this.fetch=ls(i.fetch),this.lock=i.lock||jr,this.detectSessionInUrl=i.detectSessionInUrl,this.flowType=i.flowType,this.hasCustomAuthorizationHeader=i.hasCustomAuthorizationHeader,this.throwOnError=i.throwOnError,i.lock?this.lock=i.lock:this.persistSession&&F()&&(!((s=globalThis?.navigator)===null||s===void 0)&&s.locks)?this.lock=zi:this.lock=jr,this.jwks||(this.jwks={keys:[]},this.jwks_cached_at=Number.MIN_SAFE_INTEGER),this.mfa={verify:this._verify.bind(this),enroll:this._enroll.bind(this),unenroll:this._unenroll.bind(this),challenge:this._challenge.bind(this),listFactors:this._listFactors.bind(this),challengeAndVerify:this._challengeAndVerify.bind(this),getAuthenticatorAssuranceLevel:this._getAuthenticatorAssuranceLevel.bind(this),webauthn:new ha(this)},this.oauth={getAuthorizationDetails:this._getAuthorizationDetails.bind(this),approveAuthorization:this._approveAuthorization.bind(this),denyAuthorization:this._denyAuthorization.bind(this),listGrants:this._listOAuthGrants.bind(this),revokeGrant:this._revokeOAuthGrant.bind(this)},this.persistSession?(i.storage?this.storage=i.storage:os()?this.storage=globalThis.localStorage:(this.memoryStorage={},this.storage=Ir(this.memoryStorage)),i.userStorage&&(this.userStorage=i.userStorage)):(this.memoryStorage={},this.storage=Ir(this.memoryStorage)),F()&&globalThis.BroadcastChannel&&this.persistSession&&this.storageKey){try{this.broadcastChannel=new globalThis.BroadcastChannel(this.storageKey)}catch(a){console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available",a)}(n=this.broadcastChannel)===null||n===void 0||n.addEventListener("message",async a=>{this._debug("received broadcast notification from other tab or client",a),await this._notifyAllSubscribers(a.data.event,a.data.session,!1)})}this.initialize()}isThrowOnErrorEnabled(){return this.throwOnError}_returnResult(e){if(this.throwOnError&&e&&e.error)throw e.error;return e}_logPrefix(){return`GoTrueClient@${this.storageKey}:${this.instanceID} (${ns}) ${new Date().toISOString()}`}_debug(...e){return this.logDebugMessages&&this.logger(this._logPrefix(),...e),this}async initialize(){return this.initializePromise?await this.initializePromise:(this.initializePromise=(async()=>await this._acquireLock(-1,async()=>await this._initialize()))(),await this.initializePromise)}async _initialize(){var e;try{let r={},s="none";if(F()&&(r=Ti(window.location.href),this._isImplicitGrantCallback(r)?s="implicit":await this._isPKCECallback(r)&&(s="pkce")),F()&&this.detectSessionInUrl&&s!=="none"){const{data:n,error:i}=await this._getSessionFromURL(r,s);if(i){if(this._debug("#_initialize()","error detecting session from URL",i),mi(i)){const l=(e=i.details)===null||e===void 0?void 0:e.code;if(l==="identity_already_exists"||l==="identity_not_found"||l==="single_identity_not_deletable")return{error:i}}return await this._removeSession(),{error:i}}const{session:a,redirectType:o}=n;return this._debug("#_initialize()","detected session in URL",a,"redirect type",o),await this._saveSession(a),setTimeout(async()=>{o==="recovery"?await this._notifyAllSubscribers("PASSWORD_RECOVERY",a):await this._notifyAllSubscribers("SIGNED_IN",a)},0),{error:null}}return await this._recoverAndRefresh(),{error:null}}catch(r){return b(r)?this._returnResult({error:r}):this._returnResult({error:new Se("Unexpected error during initialization",r)})}finally{await this._handleVisibilityChange(),this._debug("#_initialize()","end")}}async signInAnonymously(e){var r,s,n;try{const i=await S(this.fetch,"POST",`${this.url}/signup`,{headers:this.headers,body:{data:(s=(r=e?.options)===null||r===void 0?void 0:r.data)!==null&&s!==void 0?s:{},gotrue_meta_security:{captcha_token:(n=e?.options)===null||n===void 0?void 0:n.captchaToken}},xform:re}),{data:a,error:o}=i;if(o||!a)return this._returnResult({data:{user:null,session:null},error:o});const l=a.session,c=a.user;return a.session&&(await this._saveSession(a.session),await this._notifyAllSubscribers("SIGNED_IN",l)),this._returnResult({data:{user:c,session:l},error:null})}catch(i){if(b(i))return this._returnResult({data:{user:null,session:null},error:i});throw i}}async signUp(e){var r,s,n;try{let i;if("email"in e){const{email:h,password:p,options:f}=e;let g=null,m=null;this.flowType==="pkce"&&([g,m]=await Pe(this.storage,this.storageKey)),i=await S(this.fetch,"POST",`${this.url}/signup`,{headers:this.headers,redirectTo:f?.emailRedirectTo,body:{email:h,password:p,data:(r=f?.data)!==null&&r!==void 0?r:{},gotrue_meta_security:{captcha_token:f?.captchaToken},code_challenge:g,code_challenge_method:m},xform:re})}else if("phone"in e){const{phone:h,password:p,options:f}=e;i=await S(this.fetch,"POST",`${this.url}/signup`,{headers:this.headers,body:{phone:h,password:p,data:(s=f?.data)!==null&&s!==void 0?s:{},channel:(n=f?.channel)!==null&&n!==void 0?n:"sms",gotrue_meta_security:{captcha_token:f?.captchaToken}},xform:re})}else throw new ht("You must provide either an email or phone number and a password");const{data:a,error:o}=i;if(o||!a)return await M(this.storage,`${this.storageKey}-code-verifier`),this._returnResult({data:{user:null,session:null},error:o});const l=a.session,c=a.user;return a.session&&(await this._saveSession(a.session),await this._notifyAllSubscribers("SIGNED_IN",l)),this._returnResult({data:{user:c,session:l},error:null})}catch(i){if(await M(this.storage,`${this.storageKey}-code-verifier`),b(i))return this._returnResult({data:{user:null,session:null},error:i});throw i}}async signInWithPassword(e){try{let r;if("email"in e){const{email:i,password:a,options:o}=e;r=await S(this.fetch,"POST",`${this.url}/token?grant_type=password`,{headers:this.headers,body:{email:i,password:a,gotrue_meta_security:{captcha_token:o?.captchaToken}},xform:$r})}else if("phone"in e){const{phone:i,password:a,options:o}=e;r=await S(this.fetch,"POST",`${this.url}/token?grant_type=password`,{headers:this.headers,body:{phone:i,password:a,gotrue_meta_security:{captcha_token:o?.captchaToken}},xform:$r})}else throw new ht("You must provide either an email or phone number and a password");const{data:s,error:n}=r;if(n)return this._returnResult({data:{user:null,session:null},error:n});if(!s||!s.session||!s.user){const i=new $e;return this._returnResult({data:{user:null,session:null},error:i})}return s.session&&(await this._saveSession(s.session),await this._notifyAllSubscribers("SIGNED_IN",s.session)),this._returnResult({data:Object.assign({user:s.user,session:s.session},s.weak_password?{weakPassword:s.weak_password}:null),error:n})}catch(r){if(b(r))return this._returnResult({data:{user:null,session:null},error:r});throw r}}async signInWithOAuth(e){var r,s,n,i;return await this._handleProviderSignIn(e.provider,{redirectTo:(r=e.options)===null||r===void 0?void 0:r.redirectTo,scopes:(s=e.options)===null||s===void 0?void 0:s.scopes,queryParams:(n=e.options)===null||n===void 0?void 0:n.queryParams,skipBrowserRedirect:(i=e.options)===null||i===void 0?void 0:i.skipBrowserRedirect})}async exchangeCodeForSession(e){return await this.initializePromise,this._acquireLock(-1,async()=>this._exchangeCodeForSession(e))}async signInWithWeb3(e){const{chain:r}=e;switch(r){case"ethereum":return await this.signInWithEthereum(e);case"solana":return await this.signInWithSolana(e);default:throw new Error(`@supabase/auth-js: Unsupported chain "${r}"`)}}async signInWithEthereum(e){var r,s,n,i,a,o,l,c,h,p,f;let g,m;if("message"in e)g=e.message,m=e.signature;else{const{chain:w,wallet:v,statement:_,options:E}=e;let y;if(F())if(typeof v=="object")y=v;else{const I=window;if("ethereum"in I&&typeof I.ethereum=="object"&&"request"in I.ethereum&&typeof I.ethereum.request=="function")y=I.ethereum;else throw new Error("@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.")}else{if(typeof v!="object"||!E?.url)throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");y=v}const T=new URL((r=E?.url)!==null&&r!==void 0?r:window.location.href),N=await y.request({method:"eth_requestAccounts"}).then(I=>I).catch(()=>{throw new Error("@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid")});if(!N||N.length===0)throw new Error("@supabase/auth-js: No accounts available. Please ensure the wallet is connected.");const R=us(N[0]);let x=(s=E?.signInWithEthereum)===null||s===void 0?void 0:s.chainId;if(!x){const I=await y.request({method:"eth_chainId"});x=Ji(I)}const P={domain:T.host,address:R,statement:_,uri:T.href,version:"1",chainId:x,nonce:(n=E?.signInWithEthereum)===null||n===void 0?void 0:n.nonce,issuedAt:(a=(i=E?.signInWithEthereum)===null||i===void 0?void 0:i.issuedAt)!==null&&a!==void 0?a:new Date,expirationTime:(o=E?.signInWithEthereum)===null||o===void 0?void 0:o.expirationTime,notBefore:(l=E?.signInWithEthereum)===null||l===void 0?void 0:l.notBefore,requestId:(c=E?.signInWithEthereum)===null||c===void 0?void 0:c.requestId,resources:(h=E?.signInWithEthereum)===null||h===void 0?void 0:h.resources};g=Xi(P),m=await y.request({method:"personal_sign",params:[Yi(g),R]})}try{const{data:w,error:v}=await S(this.fetch,"POST",`${this.url}/token?grant_type=web3`,{headers:this.headers,body:Object.assign({chain:"ethereum",message:g,signature:m},!((p=e.options)===null||p===void 0)&&p.captchaToken?{gotrue_meta_security:{captcha_token:(f=e.options)===null||f===void 0?void 0:f.captchaToken}}:null),xform:re});if(v)throw v;if(!w||!w.session||!w.user){const _=new $e;return this._returnResult({data:{user:null,session:null},error:_})}return w.session&&(await this._saveSession(w.session),await this._notifyAllSubscribers("SIGNED_IN",w.session)),this._returnResult({data:Object.assign({},w),error:v})}catch(w){if(b(w))return this._returnResult({data:{user:null,session:null},error:w});throw w}}async signInWithSolana(e){var r,s,n,i,a,o,l,c,h,p,f,g;let m,w;if("message"in e)m=e.message,w=e.signature;else{const{chain:v,wallet:_,statement:E,options:y}=e;let T;if(F())if(typeof _=="object")T=_;else{const R=window;if("solana"in R&&typeof R.solana=="object"&&("signIn"in R.solana&&typeof R.solana.signIn=="function"||"signMessage"in R.solana&&typeof R.solana.signMessage=="function"))T=R.solana;else throw new Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.")}else{if(typeof _!="object"||!y?.url)throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");T=_}const N=new URL((r=y?.url)!==null&&r!==void 0?r:window.location.href);if("signIn"in T&&T.signIn){const R=await T.signIn(Object.assign(Object.assign(Object.assign({issuedAt:new Date().toISOString()},y?.signInWithSolana),{version:"1",domain:N.host,uri:N.href}),E?{statement:E}:null));let x;if(Array.isArray(R)&&R[0]&&typeof R[0]=="object")x=R[0];else if(R&&typeof R=="object"&&"signedMessage"in R&&"signature"in R)x=R;else throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");if("signedMessage"in x&&"signature"in x&&(typeof x.signedMessage=="string"||x.signedMessage instanceof Uint8Array)&&x.signature instanceof Uint8Array)m=typeof x.signedMessage=="string"?x.signedMessage:new TextDecoder().decode(x.signedMessage),w=x.signature;else throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields")}else{if(!("signMessage"in T)||typeof T.signMessage!="function"||!("publicKey"in T)||typeof T!="object"||!T.publicKey||!("toBase58"in T.publicKey)||typeof T.publicKey.toBase58!="function")throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");m=[`${N.host} wants you to sign in with your Solana account:`,T.publicKey.toBase58(),...E?["",E,""]:[""],"Version: 1",`URI: ${N.href}`,`Issued At: ${(n=(s=y?.signInWithSolana)===null||s===void 0?void 0:s.issuedAt)!==null&&n!==void 0?n:new Date().toISOString()}`,...!((i=y?.signInWithSolana)===null||i===void 0)&&i.notBefore?[`Not Before: ${y.signInWithSolana.notBefore}`]:[],...!((a=y?.signInWithSolana)===null||a===void 0)&&a.expirationTime?[`Expiration Time: ${y.signInWithSolana.expirationTime}`]:[],...!((o=y?.signInWithSolana)===null||o===void 0)&&o.chainId?[`Chain ID: ${y.signInWithSolana.chainId}`]:[],...!((l=y?.signInWithSolana)===null||l===void 0)&&l.nonce?[`Nonce: ${y.signInWithSolana.nonce}`]:[],...!((c=y?.signInWithSolana)===null||c===void 0)&&c.requestId?[`Request ID: ${y.signInWithSolana.requestId}`]:[],...!((p=(h=y?.signInWithSolana)===null||h===void 0?void 0:h.resources)===null||p===void 0)&&p.length?["Resources",...y.signInWithSolana.resources.map(x=>`- ${x}`)]:[]].join(`
`);const R=await T.signMessage(new TextEncoder().encode(m),"utf8");if(!R||!(R instanceof Uint8Array))throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");w=R}}try{const{data:v,error:_}=await S(this.fetch,"POST",`${this.url}/token?grant_type=web3`,{headers:this.headers,body:Object.assign({chain:"solana",message:m,signature:ke(w)},!((f=e.options)===null||f===void 0)&&f.captchaToken?{gotrue_meta_security:{captcha_token:(g=e.options)===null||g===void 0?void 0:g.captchaToken}}:null),xform:re});if(_)throw _;if(!v||!v.session||!v.user){const E=new $e;return this._returnResult({data:{user:null,session:null},error:E})}return v.session&&(await this._saveSession(v.session),await this._notifyAllSubscribers("SIGNED_IN",v.session)),this._returnResult({data:Object.assign({},v),error:_})}catch(v){if(b(v))return this._returnResult({data:{user:null,session:null},error:v});throw v}}async _exchangeCodeForSession(e){const r=await _e(this.storage,`${this.storageKey}-code-verifier`),[s,n]=(r??"").split("/");try{if(!s&&this.flowType==="pkce")throw new wi;const{data:i,error:a}=await S(this.fetch,"POST",`${this.url}/token?grant_type=pkce`,{headers:this.headers,body:{auth_code:e,code_verifier:s},xform:re});if(await M(this.storage,`${this.storageKey}-code-verifier`),a)throw a;if(!i||!i.session||!i.user){const o=new $e;return this._returnResult({data:{user:null,session:null,redirectType:null},error:o})}return i.session&&(await this._saveSession(i.session),await this._notifyAllSubscribers("SIGNED_IN",i.session)),this._returnResult({data:Object.assign(Object.assign({},i),{redirectType:n??null}),error:a})}catch(i){if(await M(this.storage,`${this.storageKey}-code-verifier`),b(i))return this._returnResult({data:{user:null,session:null,redirectType:null},error:i});throw i}}async signInWithIdToken(e){try{const{options:r,provider:s,token:n,access_token:i,nonce:a}=e,o=await S(this.fetch,"POST",`${this.url}/token?grant_type=id_token`,{headers:this.headers,body:{provider:s,id_token:n,access_token:i,nonce:a,gotrue_meta_security:{captcha_token:r?.captchaToken}},xform:re}),{data:l,error:c}=o;if(c)return this._returnResult({data:{user:null,session:null},error:c});if(!l||!l.session||!l.user){const h=new $e;return this._returnResult({data:{user:null,session:null},error:h})}return l.session&&(await this._saveSession(l.session),await this._notifyAllSubscribers("SIGNED_IN",l.session)),this._returnResult({data:l,error:c})}catch(r){if(b(r))return this._returnResult({data:{user:null,session:null},error:r});throw r}}async signInWithOtp(e){var r,s,n,i,a;try{if("email"in e){const{email:o,options:l}=e;let c=null,h=null;this.flowType==="pkce"&&([c,h]=await Pe(this.storage,this.storageKey));const{error:p}=await S(this.fetch,"POST",`${this.url}/otp`,{headers:this.headers,body:{email:o,data:(r=l?.data)!==null&&r!==void 0?r:{},create_user:(s=l?.shouldCreateUser)!==null&&s!==void 0?s:!0,gotrue_meta_security:{captcha_token:l?.captchaToken},code_challenge:c,code_challenge_method:h},redirectTo:l?.emailRedirectTo});return this._returnResult({data:{user:null,session:null},error:p})}if("phone"in e){const{phone:o,options:l}=e,{data:c,error:h}=await S(this.fetch,"POST",`${this.url}/otp`,{headers:this.headers,body:{phone:o,data:(n=l?.data)!==null&&n!==void 0?n:{},create_user:(i=l?.shouldCreateUser)!==null&&i!==void 0?i:!0,gotrue_meta_security:{captcha_token:l?.captchaToken},channel:(a=l?.channel)!==null&&a!==void 0?a:"sms"}});return this._returnResult({data:{user:null,session:null,messageId:c?.message_id},error:h})}throw new ht("You must provide either an email or phone number.")}catch(o){if(await M(this.storage,`${this.storageKey}-code-verifier`),b(o))return this._returnResult({data:{user:null,session:null},error:o});throw o}}async verifyOtp(e){var r,s;try{let n,i;"options"in e&&(n=(r=e.options)===null||r===void 0?void 0:r.redirectTo,i=(s=e.options)===null||s===void 0?void 0:s.captchaToken);const{data:a,error:o}=await S(this.fetch,"POST",`${this.url}/verify`,{headers:this.headers,body:Object.assign(Object.assign({},e),{gotrue_meta_security:{captcha_token:i}}),redirectTo:n,xform:re});if(o)throw o;if(!a)throw new Error("An error occurred on token verification.");const l=a.session,c=a.user;return l?.access_token&&(await this._saveSession(l),await this._notifyAllSubscribers(e.type=="recovery"?"PASSWORD_RECOVERY":"SIGNED_IN",l)),this._returnResult({data:{user:c,session:l},error:null})}catch(n){if(b(n))return this._returnResult({data:{user:null,session:null},error:n});throw n}}async signInWithSSO(e){var r,s,n,i,a;try{let o=null,l=null;this.flowType==="pkce"&&([o,l]=await Pe(this.storage,this.storageKey));const c=await S(this.fetch,"POST",`${this.url}/sso`,{body:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},"providerId"in e?{provider_id:e.providerId}:null),"domain"in e?{domain:e.domain}:null),{redirect_to:(s=(r=e.options)===null||r===void 0?void 0:r.redirectTo)!==null&&s!==void 0?s:void 0}),!((n=e?.options)===null||n===void 0)&&n.captchaToken?{gotrue_meta_security:{captcha_token:e.options.captchaToken}}:null),{skip_http_redirect:!0,code_challenge:o,code_challenge_method:l}),headers:this.headers,xform:Fi});return!((i=c.data)===null||i===void 0)&&i.url&&F()&&!(!((a=e.options)===null||a===void 0)&&a.skipBrowserRedirect)&&window.location.assign(c.data.url),this._returnResult(c)}catch(o){if(await M(this.storage,`${this.storageKey}-code-verifier`),b(o))return this._returnResult({data:null,error:o});throw o}}async reauthenticate(){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._reauthenticate())}async _reauthenticate(){try{return await this._useSession(async e=>{const{data:{session:r},error:s}=e;if(s)throw s;if(!r)throw new G;const{error:n}=await S(this.fetch,"GET",`${this.url}/reauthenticate`,{headers:this.headers,jwt:r.access_token});return this._returnResult({data:{user:null,session:null},error:n})})}catch(e){if(b(e))return this._returnResult({data:{user:null,session:null},error:e});throw e}}async resend(e){try{const r=`${this.url}/resend`;if("email"in e){const{email:s,type:n,options:i}=e,{error:a}=await S(this.fetch,"POST",r,{headers:this.headers,body:{email:s,type:n,gotrue_meta_security:{captcha_token:i?.captchaToken}},redirectTo:i?.emailRedirectTo});return this._returnResult({data:{user:null,session:null},error:a})}else if("phone"in e){const{phone:s,type:n,options:i}=e,{data:a,error:o}=await S(this.fetch,"POST",r,{headers:this.headers,body:{phone:s,type:n,gotrue_meta_security:{captcha_token:i?.captchaToken}}});return this._returnResult({data:{user:null,session:null,messageId:a?.message_id},error:o})}throw new ht("You must provide either an email or phone number and a type")}catch(r){if(b(r))return this._returnResult({data:{user:null,session:null},error:r});throw r}}async getSession(){return await this.initializePromise,await this._acquireLock(-1,async()=>this._useSession(async r=>r))}async _acquireLock(e,r){this._debug("#_acquireLock","begin",e);try{if(this.lockAcquired){const s=this.pendingInLock.length?this.pendingInLock[this.pendingInLock.length-1]:Promise.resolve(),n=(async()=>(await s,await r()))();return this.pendingInLock.push((async()=>{try{await n}catch{}})()),n}return await this.lock(`lock:${this.storageKey}`,e,async()=>{this._debug("#_acquireLock","lock acquired for storage key",this.storageKey);try{this.lockAcquired=!0;const s=r();for(this.pendingInLock.push((async()=>{try{await s}catch{}})()),await s;this.pendingInLock.length;){const n=[...this.pendingInLock];await Promise.all(n),this.pendingInLock.splice(0,n.length)}return await s}finally{this._debug("#_acquireLock","lock released for storage key",this.storageKey),this.lockAcquired=!1}})}finally{this._debug("#_acquireLock","end")}}async _useSession(e){this._debug("#_useSession","begin");try{const r=await this.__loadSession();return await e(r)}finally{this._debug("#_useSession","end")}}async __loadSession(){this._debug("#__loadSession()","begin"),this.lockAcquired||this._debug("#__loadSession()","used outside of an acquired lock!",new Error().stack);try{let e=null;const r=await _e(this.storage,this.storageKey);if(this._debug("#getSession()","session from storage",r),r!==null&&(this._isValidSession(r)?e=r:(this._debug("#getSession()","session from storage is not valid"),await this._removeSession())),!e)return{data:{session:null},error:null};const s=e.expires_at?e.expires_at*1e3-Date.now()<$t:!1;if(this._debug("#__loadSession()",`session has${s?"":" not"} expired`,"expires_at",e.expires_at),!s){if(this.userStorage){const a=await _e(this.userStorage,this.storageKey+"-user");a?.user?e.user=a.user:e.user=xt()}if(this.storage.isServer&&e.user&&!e.user.__isUserNotAvailableProxy){const a={value:this.suppressGetSessionWarning};e.user=Ui(e.user,a),a.value&&(this.suppressGetSessionWarning=!0)}return{data:{session:e},error:null}}const{data:n,error:i}=await this._callRefreshToken(e.refresh_token);return i?this._returnResult({data:{session:null},error:i}):this._returnResult({data:{session:n},error:null})}finally{this._debug("#__loadSession()","end")}}async getUser(e){if(e)return await this._getUser(e);await this.initializePromise;const r=await this._acquireLock(-1,async()=>await this._getUser());return r.data.user&&(this.suppressGetSessionWarning=!0),r}async _getUser(e){try{return e?await S(this.fetch,"GET",`${this.url}/user`,{headers:this.headers,jwt:e,xform:me}):await this._useSession(async r=>{var s,n,i;const{data:a,error:o}=r;if(o)throw o;return!(!((s=a.session)===null||s===void 0)&&s.access_token)&&!this.hasCustomAuthorizationHeader?{data:{user:null},error:new G}:await S(this.fetch,"GET",`${this.url}/user`,{headers:this.headers,jwt:(i=(n=a.session)===null||n===void 0?void 0:n.access_token)!==null&&i!==void 0?i:void 0,xform:me})})}catch(r){if(b(r))return gi(r)&&(await this._removeSession(),await M(this.storage,`${this.storageKey}-code-verifier`)),this._returnResult({data:{user:null},error:r});throw r}}async updateUser(e,r={}){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._updateUser(e,r))}async _updateUser(e,r={}){try{return await this._useSession(async s=>{const{data:n,error:i}=s;if(i)throw i;if(!n.session)throw new G;const a=n.session;let o=null,l=null;this.flowType==="pkce"&&e.email!=null&&([o,l]=await Pe(this.storage,this.storageKey));const{data:c,error:h}=await S(this.fetch,"PUT",`${this.url}/user`,{headers:this.headers,redirectTo:r?.emailRedirectTo,body:Object.assign(Object.assign({},e),{code_challenge:o,code_challenge_method:l}),jwt:a.access_token,xform:me});if(h)throw h;return a.user=c.user,await this._saveSession(a),await this._notifyAllSubscribers("USER_UPDATED",a),this._returnResult({data:{user:a.user},error:null})})}catch(s){if(await M(this.storage,`${this.storageKey}-code-verifier`),b(s))return this._returnResult({data:{user:null},error:s});throw s}}async setSession(e){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._setSession(e))}async _setSession(e){try{if(!e.access_token||!e.refresh_token)throw new G;const r=Date.now()/1e3;let s=r,n=!0,i=null;const{payload:a}=It(e.access_token);if(a.exp&&(s=a.exp,n=s<=r),n){const{data:o,error:l}=await this._callRefreshToken(e.refresh_token);if(l)return this._returnResult({data:{user:null,session:null},error:l});if(!o)return{data:{user:null,session:null},error:null};i=o}else{const{data:o,error:l}=await this._getUser(e.access_token);if(l)throw l;i={access_token:e.access_token,refresh_token:e.refresh_token,user:o.user,token_type:"bearer",expires_in:s-r,expires_at:s},await this._saveSession(i),await this._notifyAllSubscribers("SIGNED_IN",i)}return this._returnResult({data:{user:i.user,session:i},error:null})}catch(r){if(b(r))return this._returnResult({data:{session:null,user:null},error:r});throw r}}async refreshSession(e){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._refreshSession(e))}async _refreshSession(e){try{return await this._useSession(async r=>{var s;if(!e){const{data:a,error:o}=r;if(o)throw o;e=(s=a.session)!==null&&s!==void 0?s:void 0}if(!e?.refresh_token)throw new G;const{data:n,error:i}=await this._callRefreshToken(e.refresh_token);return i?this._returnResult({data:{user:null,session:null},error:i}):n?this._returnResult({data:{user:n.user,session:n},error:null}):this._returnResult({data:{user:null,session:null},error:null})})}catch(r){if(b(r))return this._returnResult({data:{user:null,session:null},error:r});throw r}}async _getSessionFromURL(e,r){try{if(!F())throw new ft("No browser detected.");if(e.error||e.error_description||e.error_code)throw new ft(e.error_description||"Error in URL with unspecified error_description",{error:e.error||"unspecified_error",code:e.error_code||"unspecified_code"});switch(r){case"implicit":if(this.flowType==="pkce")throw new Sr("Not a valid PKCE flow url.");break;case"pkce":if(this.flowType==="implicit")throw new ft("Not a valid implicit grant flow url.");break;default:}if(r==="pkce"){if(this._debug("#_initialize()","begin","is PKCE flow",!0),!e.code)throw new Sr("No code detected.");const{data:E,error:y}=await this._exchangeCodeForSession(e.code);if(y)throw y;const T=new URL(window.location.href);return T.searchParams.delete("code"),window.history.replaceState(window.history.state,"",T.toString()),{data:{session:E.session,redirectType:null},error:null}}const{provider_token:s,provider_refresh_token:n,access_token:i,refresh_token:a,expires_in:o,expires_at:l,token_type:c}=e;if(!i||!o||!a||!c)throw new ft("No session defined in URL");const h=Math.round(Date.now()/1e3),p=parseInt(o);let f=h+p;l&&(f=parseInt(l));const g=f-h;g*1e3<=Ne&&console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${g}s, should have been closer to ${p}s`);const m=f-p;h-m>=120?console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale",m,f,h):h-m<0&&console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew",m,f,h);const{data:w,error:v}=await this._getUser(i);if(v)throw v;const _={provider_token:s,provider_refresh_token:n,access_token:i,expires_in:p,expires_at:f,refresh_token:a,token_type:c,user:w.user};return window.location.hash="",this._debug("#_getSessionFromURL()","clearing window.location.hash"),this._returnResult({data:{session:_,redirectType:e.type},error:null})}catch(s){if(b(s))return this._returnResult({data:{session:null,redirectType:null},error:s});throw s}}_isImplicitGrantCallback(e){return typeof this.detectSessionInUrl=="function"?this.detectSessionInUrl(new URL(window.location.href),e):!!(e.access_token||e.error_description)}async _isPKCECallback(e){const r=await _e(this.storage,`${this.storageKey}-code-verifier`);return!!(e.code&&r)}async signOut(e={scope:"global"}){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._signOut(e))}async _signOut({scope:e}={scope:"global"}){return await this._useSession(async r=>{var s;const{data:n,error:i}=r;if(i)return this._returnResult({error:i});const a=(s=n.session)===null||s===void 0?void 0:s.access_token;if(a){const{error:o}=await this.admin.signOut(a,e);if(o&&!(pi(o)&&(o.status===404||o.status===401||o.status===403)))return this._returnResult({error:o})}return e!=="others"&&(await this._removeSession(),await M(this.storage,`${this.storageKey}-code-verifier`)),this._returnResult({error:null})})}onAuthStateChange(e){const r=ki(),s={id:r,callback:e,unsubscribe:()=>{this._debug("#unsubscribe()","state change callback with id removed",r),this.stateChangeEmitters.delete(r)}};return this._debug("#onAuthStateChange()","registered callback with id",r),this.stateChangeEmitters.set(r,s),(async()=>(await this.initializePromise,await this._acquireLock(-1,async()=>{this._emitInitialSession(r)})))(),{data:{subscription:s}}}async _emitInitialSession(e){return await this._useSession(async r=>{var s,n;try{const{data:{session:i},error:a}=r;if(a)throw a;await((s=this.stateChangeEmitters.get(e))===null||s===void 0?void 0:s.callback("INITIAL_SESSION",i)),this._debug("INITIAL_SESSION","callback id",e,"session",i)}catch(i){await((n=this.stateChangeEmitters.get(e))===null||n===void 0?void 0:n.callback("INITIAL_SESSION",null)),this._debug("INITIAL_SESSION","callback id",e,"error",i),console.error(i)}})}async resetPasswordForEmail(e,r={}){let s=null,n=null;this.flowType==="pkce"&&([s,n]=await Pe(this.storage,this.storageKey,!0));try{return await S(this.fetch,"POST",`${this.url}/recover`,{body:{email:e,code_challenge:s,code_challenge_method:n,gotrue_meta_security:{captcha_token:r.captchaToken}},headers:this.headers,redirectTo:r.redirectTo})}catch(i){if(await M(this.storage,`${this.storageKey}-code-verifier`),b(i))return this._returnResult({data:null,error:i});throw i}}async getUserIdentities(){var e;try{const{data:r,error:s}=await this.getUser();if(s)throw s;return this._returnResult({data:{identities:(e=r.user.identities)!==null&&e!==void 0?e:[]},error:null})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}}async linkIdentity(e){return"token"in e?this.linkIdentityIdToken(e):this.linkIdentityOAuth(e)}async linkIdentityOAuth(e){var r;try{const{data:s,error:n}=await this._useSession(async i=>{var a,o,l,c,h;const{data:p,error:f}=i;if(f)throw f;const g=await this._getUrlForProvider(`${this.url}/user/identities/authorize`,e.provider,{redirectTo:(a=e.options)===null||a===void 0?void 0:a.redirectTo,scopes:(o=e.options)===null||o===void 0?void 0:o.scopes,queryParams:(l=e.options)===null||l===void 0?void 0:l.queryParams,skipBrowserRedirect:!0});return await S(this.fetch,"GET",g,{headers:this.headers,jwt:(h=(c=p.session)===null||c===void 0?void 0:c.access_token)!==null&&h!==void 0?h:void 0})});if(n)throw n;return F()&&!(!((r=e.options)===null||r===void 0)&&r.skipBrowserRedirect)&&window.location.assign(s?.url),this._returnResult({data:{provider:e.provider,url:s?.url},error:null})}catch(s){if(b(s))return this._returnResult({data:{provider:e.provider,url:null},error:s});throw s}}async linkIdentityIdToken(e){return await this._useSession(async r=>{var s;try{const{error:n,data:{session:i}}=r;if(n)throw n;const{options:a,provider:o,token:l,access_token:c,nonce:h}=e,p=await S(this.fetch,"POST",`${this.url}/token?grant_type=id_token`,{headers:this.headers,jwt:(s=i?.access_token)!==null&&s!==void 0?s:void 0,body:{provider:o,id_token:l,access_token:c,nonce:h,link_identity:!0,gotrue_meta_security:{captcha_token:a?.captchaToken}},xform:re}),{data:f,error:g}=p;return g?this._returnResult({data:{user:null,session:null},error:g}):!f||!f.session||!f.user?this._returnResult({data:{user:null,session:null},error:new $e}):(f.session&&(await this._saveSession(f.session),await this._notifyAllSubscribers("USER_UPDATED",f.session)),this._returnResult({data:f,error:g}))}catch(n){if(await M(this.storage,`${this.storageKey}-code-verifier`),b(n))return this._returnResult({data:{user:null,session:null},error:n});throw n}})}async unlinkIdentity(e){try{return await this._useSession(async r=>{var s,n;const{data:i,error:a}=r;if(a)throw a;return await S(this.fetch,"DELETE",`${this.url}/user/identities/${e.identity_id}`,{headers:this.headers,jwt:(n=(s=i.session)===null||s===void 0?void 0:s.access_token)!==null&&n!==void 0?n:void 0})})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}}async _refreshAccessToken(e){const r=`#_refreshAccessToken(${e.substring(0,5)}...)`;this._debug(r,"begin");try{const s=Date.now();return await Ci(async n=>(n>0&&await Ai(200*Math.pow(2,n-1)),this._debug(r,"refreshing attempt",n),await S(this.fetch,"POST",`${this.url}/token?grant_type=refresh_token`,{body:{refresh_token:e},headers:this.headers,xform:re})),(n,i)=>{const a=200*Math.pow(2,n);return i&&Pt(i)&&Date.now()+a-s<Ne})}catch(s){if(this._debug(r,"error",s),b(s))return this._returnResult({data:{session:null,user:null},error:s});throw s}finally{this._debug(r,"end")}}_isValidSession(e){return typeof e=="object"&&e!==null&&"access_token"in e&&"refresh_token"in e&&"expires_at"in e}async _handleProviderSignIn(e,r){const s=await this._getUrlForProvider(`${this.url}/authorize`,e,{redirectTo:r.redirectTo,scopes:r.scopes,queryParams:r.queryParams});return this._debug("#_handleProviderSignIn()","provider",e,"options",r,"url",s),F()&&!r.skipBrowserRedirect&&window.location.assign(s),{data:{provider:e,url:s},error:null}}async _recoverAndRefresh(){var e,r;const s="#_recoverAndRefresh()";this._debug(s,"begin");try{const n=await _e(this.storage,this.storageKey);if(n&&this.userStorage){let a=await _e(this.userStorage,this.storageKey+"-user");!this.storage.isServer&&Object.is(this.storage,this.userStorage)&&!a&&(a={user:n.user},await De(this.userStorage,this.storageKey+"-user",a)),n.user=(e=a?.user)!==null&&e!==void 0?e:xt()}else if(n&&!n.user&&!n.user){const a=await _e(this.storage,this.storageKey+"-user");a&&a?.user?(n.user=a.user,await M(this.storage,this.storageKey+"-user"),await De(this.storage,this.storageKey,n)):n.user=xt()}if(this._debug(s,"session from storage",n),!this._isValidSession(n)){this._debug(s,"session is not valid"),n!==null&&await this._removeSession();return}const i=((r=n.expires_at)!==null&&r!==void 0?r:1/0)*1e3-Date.now()<$t;if(this._debug(s,`session has${i?"":" not"} expired with margin of ${$t}s`),i){if(this.autoRefreshToken&&n.refresh_token){const{error:a}=await this._callRefreshToken(n.refresh_token);a&&(console.error(a),Pt(a)||(this._debug(s,"refresh failed with a non-retryable error, removing the session",a),await this._removeSession()))}}else if(n.user&&n.user.__isUserNotAvailableProxy===!0)try{const{data:a,error:o}=await this._getUser(n.access_token);!o&&a?.user?(n.user=a.user,await this._saveSession(n),await this._notifyAllSubscribers("SIGNED_IN",n)):this._debug(s,"could not get user data, skipping SIGNED_IN notification")}catch(a){console.error("Error getting user data:",a),this._debug(s,"error getting user data, skipping SIGNED_IN notification",a)}else await this._notifyAllSubscribers("SIGNED_IN",n)}catch(n){this._debug(s,"error",n),console.error(n);return}finally{this._debug(s,"end")}}async _callRefreshToken(e){var r,s;if(!e)throw new G;if(this.refreshingDeferred)return this.refreshingDeferred.promise;const n=`#_callRefreshToken(${e.substring(0,5)}...)`;this._debug(n,"begin");try{this.refreshingDeferred=new St;const{data:i,error:a}=await this._refreshAccessToken(e);if(a)throw a;if(!i.session)throw new G;await this._saveSession(i.session),await this._notifyAllSubscribers("TOKEN_REFRESHED",i.session);const o={data:i.session,error:null};return this.refreshingDeferred.resolve(o),o}catch(i){if(this._debug(n,"error",i),b(i)){const a={data:null,error:i};return Pt(i)||await this._removeSession(),(r=this.refreshingDeferred)===null||r===void 0||r.resolve(a),a}throw(s=this.refreshingDeferred)===null||s===void 0||s.reject(i),i}finally{this.refreshingDeferred=null,this._debug(n,"end")}}async _notifyAllSubscribers(e,r,s=!0){const n=`#_notifyAllSubscribers(${e})`;this._debug(n,"begin",r,`broadcast = ${s}`);try{this.broadcastChannel&&s&&this.broadcastChannel.postMessage({event:e,session:r});const i=[],a=Array.from(this.stateChangeEmitters.values()).map(async o=>{try{await o.callback(e,r)}catch(l){i.push(l)}});if(await Promise.all(a),i.length>0){for(let o=0;o<i.length;o+=1)console.error(i[o]);throw i[0]}}finally{this._debug(n,"end")}}async _saveSession(e){this._debug("#_saveSession()",e),this.suppressGetSessionWarning=!0,await M(this.storage,`${this.storageKey}-code-verifier`);const r=Object.assign({},e),s=r.user&&r.user.__isUserNotAvailableProxy===!0;if(this.userStorage){!s&&r.user&&await De(this.userStorage,this.storageKey+"-user",{user:r.user});const n=Object.assign({},r);delete n.user;const i=Cr(n);await De(this.storage,this.storageKey,i)}else{const n=Cr(r);await De(this.storage,this.storageKey,n)}}async _removeSession(){this._debug("#_removeSession()"),this.suppressGetSessionWarning=!1,await M(this.storage,this.storageKey),await M(this.storage,this.storageKey+"-code-verifier"),await M(this.storage,this.storageKey+"-user"),this.userStorage&&await M(this.userStorage,this.storageKey+"-user"),await this._notifyAllSubscribers("SIGNED_OUT",null)}_removeVisibilityChangedCallback(){this._debug("#_removeVisibilityChangedCallback()");const e=this.visibilityChangedCallback;this.visibilityChangedCallback=null;try{e&&F()&&window?.removeEventListener&&window.removeEventListener("visibilitychange",e)}catch(r){console.error("removing visibilitychange callback failed",r)}}async _startAutoRefresh(){await this._stopAutoRefresh(),this._debug("#_startAutoRefresh()");const e=setInterval(()=>this._autoRefreshTokenTick(),Ne);this.autoRefreshTicker=e,e&&typeof e=="object"&&typeof e.unref=="function"?e.unref():typeof Deno<"u"&&typeof Deno.unrefTimer=="function"&&Deno.unrefTimer(e),setTimeout(async()=>{await this.initializePromise,await this._autoRefreshTokenTick()},0)}async _stopAutoRefresh(){this._debug("#_stopAutoRefresh()");const e=this.autoRefreshTicker;this.autoRefreshTicker=null,e&&clearInterval(e)}async startAutoRefresh(){this._removeVisibilityChangedCallback(),await this._startAutoRefresh()}async stopAutoRefresh(){this._removeVisibilityChangedCallback(),await this._stopAutoRefresh()}async _autoRefreshTokenTick(){this._debug("#_autoRefreshTokenTick()","begin");try{await this._acquireLock(0,async()=>{try{const e=Date.now();try{return await this._useSession(async r=>{const{data:{session:s}}=r;if(!s||!s.refresh_token||!s.expires_at){this._debug("#_autoRefreshTokenTick()","no session");return}const n=Math.floor((s.expires_at*1e3-e)/Ne);this._debug("#_autoRefreshTokenTick()",`access token expires in ${n} ticks, a tick lasts ${Ne}ms, refresh threshold is ${Ht} ticks`),n<=Ht&&await this._callRefreshToken(s.refresh_token)})}catch(r){console.error("Auto refresh tick failed with error. This is likely a transient error.",r)}}finally{this._debug("#_autoRefreshTokenTick()","end")}})}catch(e){if(e.isAcquireTimeout||e instanceof cs)this._debug("auto refresh token tick lock not available");else throw e}}async _handleVisibilityChange(){if(this._debug("#_handleVisibilityChange()"),!F()||!window?.addEventListener)return this.autoRefreshToken&&this.startAutoRefresh(),!1;try{this.visibilityChangedCallback=async()=>await this._onVisibilityChanged(!1),window?.addEventListener("visibilitychange",this.visibilityChangedCallback),await this._onVisibilityChanged(!0)}catch(e){console.error("_handleVisibilityChange",e)}}async _onVisibilityChanged(e){const r=`#_onVisibilityChanged(${e})`;this._debug(r,"visibilityState",document.visibilityState),document.visibilityState==="visible"?(this.autoRefreshToken&&this._startAutoRefresh(),e||(await this.initializePromise,await this._acquireLock(-1,async()=>{if(document.visibilityState!=="visible"){this._debug(r,"acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");return}await this._recoverAndRefresh()}))):document.visibilityState==="hidden"&&this.autoRefreshToken&&this._stopAutoRefresh()}async _getUrlForProvider(e,r,s){const n=[`provider=${encodeURIComponent(r)}`];if(s?.redirectTo&&n.push(`redirect_to=${encodeURIComponent(s.redirectTo)}`),s?.scopes&&n.push(`scopes=${encodeURIComponent(s.scopes)}`),this.flowType==="pkce"){const[i,a]=await Pe(this.storage,this.storageKey),o=new URLSearchParams({code_challenge:`${encodeURIComponent(i)}`,code_challenge_method:`${encodeURIComponent(a)}`});n.push(o.toString())}if(s?.queryParams){const i=new URLSearchParams(s.queryParams);n.push(i.toString())}return s?.skipBrowserRedirect&&n.push(`skip_http_redirect=${s.skipBrowserRedirect}`),`${e}?${n.join("&")}`}async _unenroll(e){try{return await this._useSession(async r=>{var s;const{data:n,error:i}=r;return i?this._returnResult({data:null,error:i}):await S(this.fetch,"DELETE",`${this.url}/factors/${e.factorId}`,{headers:this.headers,jwt:(s=n?.session)===null||s===void 0?void 0:s.access_token})})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}}async _enroll(e){try{return await this._useSession(async r=>{var s,n;const{data:i,error:a}=r;if(a)return this._returnResult({data:null,error:a});const o=Object.assign({friendly_name:e.friendlyName,factor_type:e.factorType},e.factorType==="phone"?{phone:e.phone}:e.factorType==="totp"?{issuer:e.issuer}:{}),{data:l,error:c}=await S(this.fetch,"POST",`${this.url}/factors`,{body:o,headers:this.headers,jwt:(s=i?.session)===null||s===void 0?void 0:s.access_token});return c?this._returnResult({data:null,error:c}):(e.factorType==="totp"&&l.type==="totp"&&(!((n=l?.totp)===null||n===void 0)&&n.qr_code)&&(l.totp.qr_code=`data:image/svg+xml;utf-8,${l.totp.qr_code}`),this._returnResult({data:l,error:null}))})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}}async _verify(e){return this._acquireLock(-1,async()=>{try{return await this._useSession(async r=>{var s;const{data:n,error:i}=r;if(i)return this._returnResult({data:null,error:i});const a=Object.assign({challenge_id:e.challengeId},"webauthn"in e?{webauthn:Object.assign(Object.assign({},e.webauthn),{credential_response:e.webauthn.type==="create"?na(e.webauthn.credential_response):ia(e.webauthn.credential_response)})}:{code:e.code}),{data:o,error:l}=await S(this.fetch,"POST",`${this.url}/factors/${e.factorId}/verify`,{body:a,headers:this.headers,jwt:(s=n?.session)===null||s===void 0?void 0:s.access_token});return l?this._returnResult({data:null,error:l}):(await this._saveSession(Object.assign({expires_at:Math.round(Date.now()/1e3)+o.expires_in},o)),await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED",o),this._returnResult({data:o,error:l}))})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}})}async _challenge(e){return this._acquireLock(-1,async()=>{try{return await this._useSession(async r=>{var s;const{data:n,error:i}=r;if(i)return this._returnResult({data:null,error:i});const a=await S(this.fetch,"POST",`${this.url}/factors/${e.factorId}/challenge`,{body:e,headers:this.headers,jwt:(s=n?.session)===null||s===void 0?void 0:s.access_token});if(a.error)return a;const{data:o}=a;if(o.type!=="webauthn")return{data:o,error:null};switch(o.webauthn.type){case"create":return{data:Object.assign(Object.assign({},o),{webauthn:Object.assign(Object.assign({},o.webauthn),{credential_options:Object.assign(Object.assign({},o.webauthn.credential_options),{publicKey:ra(o.webauthn.credential_options.publicKey)})})}),error:null};case"request":return{data:Object.assign(Object.assign({},o),{webauthn:Object.assign(Object.assign({},o.webauthn),{credential_options:Object.assign(Object.assign({},o.webauthn.credential_options),{publicKey:sa(o.webauthn.credential_options.publicKey)})})}),error:null}}})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}})}async _challengeAndVerify(e){const{data:r,error:s}=await this._challenge({factorId:e.factorId});return s?this._returnResult({data:null,error:s}):await this._verify({factorId:e.factorId,challengeId:r.id,code:e.code})}async _listFactors(){var e;const{data:{user:r},error:s}=await this.getUser();if(s)return{data:null,error:s};const n={all:[],phone:[],totp:[],webauthn:[]};for(const i of(e=r?.factors)!==null&&e!==void 0?e:[])n.all.push(i),i.status==="verified"&&n[i.factor_type].push(i);return{data:n,error:null}}async _getAuthenticatorAssuranceLevel(){var e,r;const{data:{session:s},error:n}=await this.getSession();if(n)return this._returnResult({data:null,error:n});if(!s)return{data:{currentLevel:null,nextLevel:null,currentAuthenticationMethods:[]},error:null};const{payload:i}=It(s.access_token);let a=null;i.aal&&(a=i.aal);let o=a;((r=(e=s.user.factors)===null||e===void 0?void 0:e.filter(h=>h.status==="verified"))!==null&&r!==void 0?r:[]).length>0&&(o="aal2");const c=i.amr||[];return{data:{currentLevel:a,nextLevel:o,currentAuthenticationMethods:c},error:null}}async _getAuthorizationDetails(e){try{return await this._useSession(async r=>{const{data:{session:s},error:n}=r;return n?this._returnResult({data:null,error:n}):s?await S(this.fetch,"GET",`${this.url}/oauth/authorizations/${e}`,{headers:this.headers,jwt:s.access_token,xform:i=>({data:i,error:null})}):this._returnResult({data:null,error:new G})})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}}async _approveAuthorization(e,r){try{return await this._useSession(async s=>{const{data:{session:n},error:i}=s;if(i)return this._returnResult({data:null,error:i});if(!n)return this._returnResult({data:null,error:new G});const a=await S(this.fetch,"POST",`${this.url}/oauth/authorizations/${e}/consent`,{headers:this.headers,jwt:n.access_token,body:{action:"approve"},xform:o=>({data:o,error:null})});return a.data&&a.data.redirect_url&&F()&&!r?.skipBrowserRedirect&&window.location.assign(a.data.redirect_url),a})}catch(s){if(b(s))return this._returnResult({data:null,error:s});throw s}}async _denyAuthorization(e,r){try{return await this._useSession(async s=>{const{data:{session:n},error:i}=s;if(i)return this._returnResult({data:null,error:i});if(!n)return this._returnResult({data:null,error:new G});const a=await S(this.fetch,"POST",`${this.url}/oauth/authorizations/${e}/consent`,{headers:this.headers,jwt:n.access_token,body:{action:"deny"},xform:o=>({data:o,error:null})});return a.data&&a.data.redirect_url&&F()&&!r?.skipBrowserRedirect&&window.location.assign(a.data.redirect_url),a})}catch(s){if(b(s))return this._returnResult({data:null,error:s});throw s}}async _listOAuthGrants(){try{return await this._useSession(async e=>{const{data:{session:r},error:s}=e;return s?this._returnResult({data:null,error:s}):r?await S(this.fetch,"GET",`${this.url}/user/oauth/grants`,{headers:this.headers,jwt:r.access_token,xform:n=>({data:n,error:null})}):this._returnResult({data:null,error:new G})})}catch(e){if(b(e))return this._returnResult({data:null,error:e});throw e}}async _revokeOAuthGrant(e){try{return await this._useSession(async r=>{const{data:{session:s},error:n}=r;return n?this._returnResult({data:null,error:n}):s?(await S(this.fetch,"DELETE",`${this.url}/user/oauth/grants`,{headers:this.headers,jwt:s.access_token,query:{client_id:e.clientId},noResolveJson:!0}),{data:{},error:null}):this._returnResult({data:null,error:new G})})}catch(r){if(b(r))return this._returnResult({data:null,error:r});throw r}}async fetchJwk(e,r={keys:[]}){let s=r.keys.find(o=>o.kid===e);if(s)return s;const n=Date.now();if(s=this.jwks.keys.find(o=>o.kid===e),s&&this.jwks_cached_at+hi>n)return s;const{data:i,error:a}=await S(this.fetch,"GET",`${this.url}/.well-known/jwks.json`,{headers:this.headers});if(a)throw a;return!i.keys||i.keys.length===0||(this.jwks=i,this.jwks_cached_at=n,s=i.keys.find(o=>o.kid===e),!s)?null:s}async getClaims(e,r={}){try{let s=e;if(!s){const{data:g,error:m}=await this.getSession();if(m||!g.session)return this._returnResult({data:null,error:m});s=g.session.access_token}const{header:n,payload:i,signature:a,raw:{header:o,payload:l}}=It(s);r?.allowExpired||Li(i.exp);const c=!n.alg||n.alg.startsWith("HS")||!n.kid||!("crypto"in globalThis&&"subtle"in globalThis.crypto)?null:await this.fetchJwk(n.kid,r?.keys?{keys:r.keys}:r?.jwks);if(!c){const{error:g}=await this.getUser(s);if(g)throw g;return{data:{claims:i,header:n,signature:a},error:null}}const h=Ni(n.alg),p=await crypto.subtle.importKey("jwk",c,h,!0,["verify"]);if(!await crypto.subtle.verify(h,p,a,Ei(`${o}.${l}`)))throw new Gt("Invalid JWT signature");return{data:{claims:i,header:n,signature:a},error:null}}catch(s){if(b(s))return this._returnResult({data:null,error:s});throw s}}}nt.nextInstanceID={};const pa=nt,ga="2.89.0";let Je="";typeof Deno<"u"?Je="deno":typeof document<"u"?Je="web":typeof navigator<"u"&&navigator.product==="ReactNative"?Je="react-native":Je="node";const ma={"X-Client-Info":`supabase-js-${Je}/${ga}`},wa={headers:ma},va={schema:"public"},ya={autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0,flowType:"implicit"},_a={};function it(t){"@babel/helpers - typeof";return it=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},it(t)}function ba(t,e){if(it(t)!="object"||!t)return t;var r=t[Symbol.toPrimitive];if(r!==void 0){var s=r.call(t,e);if(it(s)!="object")return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}function Ea(t){var e=ba(t,"string");return it(e)=="symbol"?e:e+""}function Sa(t,e,r){return(e=Ea(e))in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function Lr(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(t);e&&(s=s.filter(function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable})),r.push.apply(r,s)}return r}function L(t){for(var e=1;e<arguments.length;e++){var r=arguments[e]!=null?arguments[e]:{};e%2?Lr(Object(r),!0).forEach(function(s){Sa(t,s,r[s])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):Lr(Object(r)).forEach(function(s){Object.defineProperty(t,s,Object.getOwnPropertyDescriptor(r,s))})}return t}const ka=t=>t?(...e)=>t(...e):(...e)=>fetch(...e),Ta=()=>Headers,Oa=(t,e,r)=>{const s=ka(r),n=Ta();return async(i,a)=>{var o;const l=(o=await e())!==null&&o!==void 0?o:t;let c=new n(a?.headers);return c.has("apikey")||c.set("apikey",t),c.has("Authorization")||c.set("Authorization",`Bearer ${l}`),s(i,L(L({},a),{},{headers:c}))}};function Aa(t){return t.endsWith("/")?t:t+"/"}function Ca(t,e){var r,s;const{db:n,auth:i,realtime:a,global:o}=t,{db:l,auth:c,realtime:h,global:p}=e,f={db:L(L({},l),n),auth:L(L({},c),i),realtime:L(L({},h),a),storage:{},global:L(L(L({},p),o),{},{headers:L(L({},(r=p?.headers)!==null&&r!==void 0?r:{}),(s=o?.headers)!==null&&s!==void 0?s:{})}),accessToken:async()=>""};return t.accessToken?f.accessToken=t.accessToken:delete f.accessToken,f}function Ra(t){const e=t?.trim();if(!e)throw new Error("supabaseUrl is required.");if(!e.match(/^https?:\/\//i))throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");try{return new URL(Aa(e))}catch{throw Error("Invalid supabaseUrl: Provided URL is malformed.")}}var $a=class extends pa{constructor(t){super(t)}},Pa=class{constructor(t,e,r){var s,n;this.supabaseUrl=t,this.supabaseKey=e;const i=Ra(t);if(!e)throw new Error("supabaseKey is required.");this.realtimeUrl=new URL("realtime/v1",i),this.realtimeUrl.protocol=this.realtimeUrl.protocol.replace("http","ws"),this.authUrl=new URL("auth/v1",i),this.storageUrl=new URL("storage/v1",i),this.functionsUrl=new URL("functions/v1",i);const a=`sb-${i.hostname.split(".")[0]}-auth-token`,o={db:va,realtime:_a,auth:L(L({},ya),{},{storageKey:a}),global:wa},l=Ca(r??{},o);if(this.storageKey=(s=l.auth.storageKey)!==null&&s!==void 0?s:"",this.headers=(n=l.global.headers)!==null&&n!==void 0?n:{},l.accessToken)this.accessToken=l.accessToken,this.auth=new Proxy({},{get:(h,p)=>{throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(p)} is not possible`)}});else{var c;this.auth=this._initSupabaseAuthClient((c=l.auth)!==null&&c!==void 0?c:{},this.headers,l.global.fetch)}this.fetch=Oa(e,this._getAccessToken.bind(this),l.global.fetch),this.realtime=this._initRealtimeClient(L({headers:this.headers,accessToken:this._getAccessToken.bind(this)},l.realtime)),this.accessToken&&this.accessToken().then(h=>this.realtime.setAuth(h)).catch(h=>console.warn("Failed to set initial Realtime auth token:",h)),this.rest=new un(new URL("rest/v1",i).href,{headers:this.headers,schema:l.db.schema,fetch:this.fetch}),this.storage=new oi(this.storageUrl.href,this.headers,this.fetch,r?.storage),l.accessToken||this._listenForAuthEvents()}get functions(){return new nn(this.functionsUrl.href,{headers:this.headers,customFetch:this.fetch})}from(t){return this.rest.from(t)}schema(t){return this.rest.schema(t)}rpc(t,e={},r={head:!1,get:!1,count:void 0}){return this.rest.rpc(t,e,r)}channel(t,e={config:{}}){return this.realtime.channel(t,e)}getChannels(){return this.realtime.getChannels()}removeChannel(t){return this.realtime.removeChannel(t)}removeAllChannels(){return this.realtime.removeAllChannels()}async _getAccessToken(){var t=this,e,r;if(t.accessToken)return await t.accessToken();const{data:s}=await t.auth.getSession();return(e=(r=s.session)===null||r===void 0?void 0:r.access_token)!==null&&e!==void 0?e:t.supabaseKey}_initSupabaseAuthClient({autoRefreshToken:t,persistSession:e,detectSessionInUrl:r,storage:s,userStorage:n,storageKey:i,flowType:a,lock:o,debug:l,throwOnError:c},h,p){const f={Authorization:`Bearer ${this.supabaseKey}`,apikey:`${this.supabaseKey}`};return new $a({url:this.authUrl.href,headers:L(L({},f),h),storageKey:i,autoRefreshToken:t,persistSession:e,detectSessionInUrl:r,storage:s,userStorage:n,flowType:a,lock:o,debug:l,throwOnError:c,fetch:p,hasCustomAuthorizationHeader:Object.keys(this.headers).some(g=>g.toLowerCase()==="authorization")})}_initRealtimeClient(t){return new An(this.realtimeUrl.href,L(L({},t),{},{params:L(L({},{apikey:this.supabaseKey}),t?.params)}))}_listenForAuthEvents(){return this.auth.onAuthStateChange((t,e)=>{this._handleTokenChanged(t,"CLIENT",e?.access_token)})}_handleTokenChanged(t,e,r){(t==="TOKEN_REFRESHED"||t==="SIGNED_IN")&&this.changedAccessToken!==r?(this.changedAccessToken=r,this.realtime.setAuth(r)):t==="SIGNED_OUT"&&(this.realtime.setAuth(),e=="STORAGE"&&this.auth.signOut(),this.changedAccessToken=void 0)}};const Ia=(t,e,r)=>new Pa(t,e,r);function xa(){if(typeof window<"u"||typeof process>"u")return!1;const t=process.version;if(t==null)return!1;const e=t.match(/^v(\d+)\./);return e?parseInt(e[1],10)<=18:!1}xa()&&console.warn("⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");

// ---- 05-vendor-capacitor.js ----
// VENDOR (não editar): núcleo do Capacitor e cliente Bluetooth LE, extraídos do pacote publicado e reformatados.
var Dr;
(function (t) {
  ((t[(t.SCAN_MODE_LOW_POWER = 0)] = "SCAN_MODE_LOW_POWER"),
    (t[(t.SCAN_MODE_BALANCED = 1)] = "SCAN_MODE_BALANCED"),
    (t[(t.SCAN_MODE_LOW_LATENCY = 2)] = "SCAN_MODE_LOW_LATENCY"));
})(Dr || (Dr = {}));
var Ur;
(function (t) {
  ((t[(t.CONNECTION_PRIORITY_BALANCED = 0)] = "CONNECTION_PRIORITY_BALANCED"),
    (t[(t.CONNECTION_PRIORITY_HIGH = 1)] = "CONNECTION_PRIORITY_HIGH"),
    (t[(t.CONNECTION_PRIORITY_LOW_POWER = 2)] = "CONNECTION_PRIORITY_LOW_POWER"));
})(Ur || (Ur = {}));
var Me;
(function (t) {
  ((t.Unimplemented = "UNIMPLEMENTED"), (t.Unavailable = "UNAVAILABLE"));
})(Me || (Me = {}));
class Lt extends Error {
  constructor(e, r, s) {
    (super(e), (this.message = e), (this.code = r), (this.data = s));
  }
}
const Na = (t) => {
    var e, r;
    return t?.androidBridge
      ? "android"
      : !((r = (e = t?.webkit) === null || e === void 0 ? void 0 : e.messageHandlers) === null || r === void 0) && r.bridge
        ? "ios"
        : "web";
  },
  Da = (t) => {
    const e = t.CapacitorCustomPlatform || null,
      r = t.Capacitor || {},
      s = (r.Plugins = r.Plugins || {}),
      n = () => (e !== null ? e.name : Na(t)),
      i = () => n() !== "web",
      a = (p) => {
        const f = c.get(p);
        return !!(f?.platforms.has(n()) || o(p));
      },
      o = (p) => {
        var f;
        return (f = r.PluginHeaders) === null || f === void 0 ? void 0 : f.find((g) => g.name === p);
      },
      l = (p) => t.console.error(p),
      c = new Map(),
      h = (p, f = {}) => {
        const g = c.get(p);
        if (g) return (console.warn(`Capacitor plugin "${p}" already registered. Cannot register plugins twice.`), g.proxy);
        const m = n(),
          w = o(p);
        let v;
        const _ = async () => (
            !v && m in f
              ? (v = typeof f[m] == "function" ? (v = await f[m]()) : (v = f[m]))
              : e !== null && !v && "web" in f && (v = typeof f.web == "function" ? (v = await f.web()) : (v = f.web)),
            v
          ),
          E = (P, I) => {
            var ie, fe;
            if (w) {
              const pe = w?.methods.find((te) => I === te.name);
              if (pe)
                return pe.rtype === "promise"
                  ? (te) => r.nativePromise(p, I.toString(), te)
                  : (te, lt) => r.nativeCallback(p, I.toString(), te, lt);
              if (P) return (ie = P[I]) === null || ie === void 0 ? void 0 : ie.bind(P);
            } else {
              if (P) return (fe = P[I]) === null || fe === void 0 ? void 0 : fe.bind(P);
              throw new Lt(`"${p}" plugin is not implemented on ${m}`, Me.Unimplemented);
            }
          },
          y = (P) => {
            let I;
            const ie = (...fe) => {
              const pe = _().then((te) => {
                const lt = E(te, P);
                if (lt) {
                  const ct = lt(...fe);
                  return ((I = ct?.remove), ct);
                } else throw new Lt(`"${p}.${P}()" is not implemented on ${m}`, Me.Unimplemented);
              });
              return (P === "addListener" && (pe.remove = async () => I()), pe);
            };
            return (
              (ie.toString = () => `${P.toString()}() { [capacitor code] }`),
              Object.defineProperty(ie, "name", {
                value: P,
                writable: !1,
                configurable: !1,
              }),
              ie
            );
          },
          T = y("addListener"),
          N = y("removeListener"),
          R = (P, I) => {
            const ie = T(
                {
                  eventName: P,
                },
                I,
              ),
              fe = async () => {
                const te = await ie;
                N(
                  {
                    eventName: P,
                    callbackId: te,
                  },
                  I,
                );
              },
              pe = new Promise((te) =>
                ie.then(() =>
                  te({
                    remove: fe,
                  }),
                ),
              );
            return (
              (pe.remove = async () => {
                (console.warn("Using addListener() without 'await' is deprecated."), await fe());
              }),
              pe
            );
          },
          x = new Proxy(
            {},
            {
              get(P, I) {
                switch (I) {
                  case "$$typeof":
                    return;
                  case "toJSON":
                    return () => ({});
                  case "addListener":
                    return w ? R : T;
                  case "removeListener":
                    return N;
                  default:
                    return y(I);
                }
              },
            },
          );
        return (
          (s[p] = x),
          c.set(p, {
            name: p,
            proxy: x,
            platforms: new Set([...Object.keys(f), ...(w ? [m] : [])]),
          }),
          x
        );
      };
    return (
      r.convertFileSrc || (r.convertFileSrc = (p) => p),
      (r.getPlatform = n),
      (r.handleError = l),
      (r.isNativePlatform = i),
      (r.isPluginAvailable = a),
      (r.registerPlugin = h),
      (r.Exception = Lt),
      (r.DEBUG = !!r.DEBUG),
      (r.isLoggingEnabled = !!r.isLoggingEnabled),
      r
    );
  },
  Ua = (t) => (t.Capacitor = Da(t)),
  Z = Ua(
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
        ? self
        : typeof window < "u"
          ? window
          : typeof global < "u"
            ? global
            : {},
  ),
  Ge = Z.registerPlugin;
class ir {
  constructor() {
    ((this.listeners = {}), (this.retainedEventArguments = {}), (this.windowListeners = {}));
  }
  addListener(e, r) {
    let s = !1;
    (this.listeners[e] || ((this.listeners[e] = []), (s = !0)), this.listeners[e].push(r));
    const i = this.windowListeners[e];
    (i && !i.registered && this.addWindowListener(i), s && this.sendRetainedArgumentsForEvent(e));
    const a = async () => this.removeListener(e, r);
    return Promise.resolve({
      remove: a,
    });
  }
  async removeAllListeners() {
    this.listeners = {};
    for (const e in this.windowListeners) this.removeWindowListener(this.windowListeners[e]);
    this.windowListeners = {};
  }
  notifyListeners(e, r, s) {
    const n = this.listeners[e];
    if (!n) {
      if (s) {
        let i = this.retainedEventArguments[e];
        (i || (i = []), i.push(r), (this.retainedEventArguments[e] = i));
      }
      return;
    }
    n.forEach((i) => i(r));
  }
  hasListeners(e) {
    var r;
    return !!(!((r = this.listeners[e]) === null || r === void 0) && r.length);
  }
  registerWindowListener(e, r) {
    this.windowListeners[r] = {
      registered: !1,
      windowEventName: e,
      pluginEventName: r,
      handler: (s) => {
        this.notifyListeners(r, s);
      },
    };
  }
  unimplemented(e = "not implemented") {
    return new Z.Exception(e, Me.Unimplemented);
  }
  unavailable(e = "not available") {
    return new Z.Exception(e, Me.Unavailable);
  }
  async removeListener(e, r) {
    const s = this.listeners[e];
    if (!s) return;
    const n = s.indexOf(r);
    (this.listeners[e].splice(n, 1), this.listeners[e].length || this.removeWindowListener(this.windowListeners[e]));
  }
  addWindowListener(e) {
    (window.addEventListener(e.windowEventName, e.handler), (e.registered = !0));
  }
  removeWindowListener(e) {
    e && (window.removeEventListener(e.windowEventName, e.handler), (e.registered = !1));
  }
  sendRetainedArgumentsForEvent(e) {
    const r = this.retainedEventArguments[e];
    r &&
      (delete this.retainedEventArguments[e],
      r.forEach((s) => {
        this.notifyListeners(e, s);
      }));
  }
}
const Br = (t) =>
    encodeURIComponent(t)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape),
  qr = (t) => t.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
class Ba extends ir {
  async getCookies() {
    const e = document.cookie,
      r = {};
    return (
      e.split(";").forEach((s) => {
        if (s.length <= 0) return;
        let [n, i] = s.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
        ((n = qr(n).trim()), (i = qr(i).trim()), (r[n] = i));
      }),
      r
    );
  }
  async setCookie(e) {
    try {
      const r = Br(e.key),
        s = Br(e.value),
        n = `; expires=${(e.expires || "").replace("expires=", "")}`,
        i = (e.path || "/").replace("path=", ""),
        a = e.url != null && e.url.length > 0 ? `domain=${e.url}` : "";
      document.cookie = `${r}=${s || ""}${n}; path=${i}; ${a};`;
    } catch (r) {
      return Promise.reject(r);
    }
  }
  async deleteCookie(e) {
    try {
      document.cookie = `${e.key}=; Max-Age=0`;
    } catch (r) {
      return Promise.reject(r);
    }
  }
  async clearCookies() {
    try {
      const e = document.cookie.split(";") || [];
      for (const r of e) document.cookie = r.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async clearAllCookies() {
    try {
      await this.clearCookies();
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
Ge("CapacitorCookies", {
  web: () => new Ba(),
});
const qa = async (t) =>
    new Promise((e, r) => {
      const s = new FileReader();
      ((s.onload = () => {
        const n = s.result;
        e(n.indexOf(",") >= 0 ? n.split(",")[1] : n);
      }),
        (s.onerror = (n) => r(n)),
        s.readAsDataURL(t));
    }),
  Ma = (t = {}) => {
    const e = Object.keys(t);
    return Object.keys(t)
      .map((n) => n.toLocaleLowerCase())
      .reduce((n, i, a) => ((n[i] = t[e[a]]), n), {});
  },
  Fa = (t, e = !0) =>
    t
      ? Object.entries(t)
          .reduce((s, n) => {
            const [i, a] = n;
            let o, l;
            return (
              Array.isArray(a)
                ? ((l = ""),
                  a.forEach((c) => {
                    ((o = e ? encodeURIComponent(c) : c), (l += `${i}=${o}&`));
                  }),
                  l.slice(0, -1))
                : ((o = e ? encodeURIComponent(a) : a), (l = `${i}=${o}`)),
              `${s}&${l}`
            );
          }, "")
          .substr(1)
      : null,
  Va = (t, e = {}) => {
    const r = Object.assign(
        {
          method: t.method || "GET",
          headers: t.headers,
        },
        e,
      ),
      n = Ma(t.headers)["content-type"] || "";
    if (typeof t.data == "string") r.body = t.data;
    else if (n.includes("application/x-www-form-urlencoded")) {
      const i = new URLSearchParams();
      for (const [a, o] of Object.entries(t.data || {})) i.set(a, o);
      r.body = i.toString();
    } else if (n.includes("multipart/form-data") || t.data instanceof FormData) {
      const i = new FormData();
      if (t.data instanceof FormData)
        t.data.forEach((o, l) => {
          i.append(l, o);
        });
      else for (const o of Object.keys(t.data)) i.append(o, t.data[o]);
      r.body = i;
      const a = new Headers(r.headers);
      (a.delete("content-type"), (r.headers = a));
    } else (n.includes("application/json") || typeof t.data == "object") && (r.body = JSON.stringify(t.data));
    return r;
  };
class Wa extends ir {
  async request(e) {
    const r = Va(e, e.webFetchExtra),
      s = Fa(e.params, e.shouldEncodeUrlParams),
      n = s ? `${e.url}?${s}` : e.url,
      i = await fetch(n, r),
      a = i.headers.get("content-type") || "";
    let { responseType: o = "text" } = i.ok ? e : {};
    a.includes("application/json") && (o = "json");
    let l, c;
    switch (o) {
      case "arraybuffer":
      case "blob":
        ((c = await i.blob()), (l = await qa(c)));
        break;
      case "json":
        l = await i.json();
        break;
      default:
        l = await i.text();
    }
    const h = {};
    return (
      i.headers.forEach((p, f) => {
        h[f] = p;
      }),
      {
        data: l,
        headers: h,
        status: i.status,
        url: i.url,
      }
    );
  }
  async get(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "GET",
      }),
    );
  }
  async post(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "POST",
      }),
    );
  }
  async put(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "PUT",
      }),
    );
  }
  async patch(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "PATCH",
      }),
    );
  }
  async delete(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "DELETE",
      }),
    );
  }
}
Ge("CapacitorHttp", {
  web: () => new Wa(),
});
var Mr;
(function (t) {
  ((t.Dark = "DARK"), (t.Light = "LIGHT"), (t.Default = "DEFAULT"));
})(Mr || (Mr = {}));
var Fr;
(function (t) {
  ((t.StatusBar = "StatusBar"), (t.NavigationBar = "NavigationBar"));
})(Fr || (Fr = {}));
class Ha extends ir {
  async setStyle() {
    this.unavailable("not available for web");
  }
  async setAnimation() {
    this.unavailable("not available for web");
  }
  async show() {
    this.unavailable("not available for web");
  }
  async hide() {
    this.unavailable("not available for web");
  }
}
Ge("SystemBars", {
  web: () => new Ha(),
});
function Ka(t) {
  return new DataView(Uint8Array.from(t).buffer);
}
function za(t) {
  return Array.from(new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
}
function Ga(t) {
  return `0000${t.toString(16).padStart(4, "0")}-0000-1000-8000-00805f9b34fb`;
}
function hs(t) {
  const e = [];
  let r,
    s,
    n = 1,
    i = 0;
  for (r = 0; r < t.length; r++)
    ((s = t.charCodeAt(r)),
      ((s > 47 && s < 58) || (s > 64 && s < 71) || (s > 96 && s < 103)) &&
        ((i = (i << 4) ^ ((s > 64 ? s + 9 : s) & 15)), (n ^= 1) && e.push(i & 255)));
  return Ka(e);
}
function Qe(t) {
  return za(t)
    .map((e) => {
      let r = e.toString(16);
      return (r.length == 1 && (r = "0" + r), r);
    })
    .join("");
}
function _o(t) {
  if (typeof t == "string") return t;
  if (typeof t == "number") return Ga(t);
  throw new Error("Invalid UUID");
}
function bo(t) {
  const e = {};
  if (t)
    return (
      t.forEach((r, s) => {
        e[s.toString()] = r;
      }),
      e
    );
}
function Vr(t) {
  if (t !== void 0) {
    if (typeof t == "string") {
      const e = hs(t);
      return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
    }
    return t instanceof DataView ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : t;
  }
}
function pt(t) {
  if (t !== void 0) return t instanceof DataView ? Qe(t) : Qe(new DataView(t.buffer, t.byteOffset, t.byteLength));
}
function Eo(t) {
  if (t.buffer instanceof SharedArrayBuffer) {
    const r = new Uint8Array(t.buffer, t.byteOffset, t.byteLength).slice().buffer;
    return new DataView(r);
  }
  return t;
}
const Ja = "modulepreload",
  Ya = function (t, e) {
    return new URL(t, e).href;
  },
  Wr = {},
  ar = function (e, r, s) {
    let n = Promise.resolve();
    if (r && r.length > 0) {
      let c = function (h) {
        return Promise.all(
          h.map((p) =>
            Promise.resolve(p).then(
              (f) => ({
                status: "fulfilled",
                value: f,
              }),
              (f) => ({
                status: "rejected",
                reason: f,
              }),
            ),
          ),
        );
      };
      const a = document.getElementsByTagName("link"),
        o = document.querySelector("meta[property=csp-nonce]"),
        l = o?.nonce || o?.getAttribute("nonce");
      n = c(
        r.map((h) => {
          if (((h = Ya(h, s)), h in Wr)) return;
          Wr[h] = !0;
          const p = h.endsWith(".css"),
            f = p ? '[rel="stylesheet"]' : "";
          if (s)
            for (let m = a.length - 1; m >= 0; m--) {
              const w = a[m];
              if (w.href === h && (!p || w.rel === "stylesheet")) return;
            }
          else if (document.querySelector(`link[href="${h}"]${f}`)) return;
          const g = document.createElement("link");
          if (
            ((g.rel = p ? "stylesheet" : Ja),
            p || (g.as = "script"),
            (g.crossOrigin = ""),
            (g.href = h),
            l && g.setAttribute("nonce", l),
            document.head.appendChild(g),
            p)
          )
            return new Promise((m, w) => {
              (g.addEventListener("load", m), g.addEventListener("error", () => w(new Error(`Unable to preload CSS for ${h}`))));
            });
        }),
      );
    }
    function i(a) {
      const o = new Event("vite:preloadError", {
        cancelable: !0,
      });
      if (((o.payload = a), window.dispatchEvent(o), !o.defaultPrevented)) throw a;
    }
    return n.then((a) => {
      for (const o of a || []) o.status === "rejected" && i(o.reason);
      return e().catch(i);
    });
  },
  O = Ge("BluetoothLe", {
    web: () => ar(() => import("./web-DEeSqGRi.js"), [], import.meta.url).then((t) => new t.BluetoothLeWeb()),
  }),
  Xa = () => {
    let t = Promise.resolve();
    return (e) =>
      new Promise((r, s) => {
        t = t
          .then(() => e())
          .then(r)
          .catch(s);
      });
  };
function Nt(t) {
  return t ? Xa() : (e) => e();
}
function D(t) {
  if (typeof t != "string") throw new Error(`Invalid UUID type ${typeof t}. Expected string.`);
  if (((t = t.toLowerCase()), !(t.search(/^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/) >= 0)))
    throw new Error(`Invalid UUID format ${t}. Expected 128 bit string (e.g. "0000180d-0000-1000-8000-00805f9b34fb").`);
  return t;
}
class Qa {
  constructor() {
    ((this.scanListener = null), (this.eventListeners = new Map()), (this.queue = Nt(!0)));
  }
  enableQueue() {
    this.queue = Nt(!0);
  }
  disableQueue() {
    this.queue = Nt(!1);
  }
  async initialize(e) {
    await this.queue(async () => {
      await O.initialize(e);
    });
  }
  async isEnabled() {
    return await this.queue(async () => (await O.isEnabled()).value);
  }
  async requestEnable() {
    await this.queue(async () => {
      await O.requestEnable();
    });
  }
  async enable() {
    await this.queue(async () => {
      await O.enable();
    });
  }
  async disable() {
    await this.queue(async () => {
      await O.disable();
    });
  }
  async startEnabledNotifications(e) {
    await this.queue(async () => {
      var r;
      const s = "onEnabledChanged";
      await ((r = this.eventListeners.get(s)) === null || r === void 0 ? void 0 : r.remove());
      const n = await O.addListener(s, (i) => {
        e(i.value);
      });
      (this.eventListeners.set(s, n), await O.startEnabledNotifications());
    });
  }
  async stopEnabledNotifications() {
    await this.queue(async () => {
      var e;
      const r = "onEnabledChanged";
      (await ((e = this.eventListeners.get(r)) === null || e === void 0 ? void 0 : e.remove()),
        this.eventListeners.delete(r),
        await O.stopEnabledNotifications());
    });
  }
  async isLocationEnabled() {
    return await this.queue(async () => (await O.isLocationEnabled()).value);
  }
  async openLocationSettings() {
    await this.queue(async () => {
      await O.openLocationSettings();
    });
  }
  async openBluetoothSettings() {
    await this.queue(async () => {
      await O.openBluetoothSettings();
    });
  }
  async openAppSettings() {
    await this.queue(async () => {
      await O.openAppSettings();
    });
  }
  async setDisplayStrings(e) {
    await this.queue(async () => {
      await O.setDisplayStrings(e);
    });
  }
  async requestDevice(e) {
    return ((e = e ? this.validateRequestBleDeviceOptions(e) : void 0), await this.queue(async () => await O.requestDevice(e)));
  }
  async requestLEScan(e, r) {
    ((e = this.validateRequestBleDeviceOptions(e)),
      await this.queue(async () => {
        var s;
        (await ((s = this.scanListener) === null || s === void 0 ? void 0 : s.remove()),
          (this.scanListener = await O.addListener("onScanResult", (n) => {
            const i = Object.assign(Object.assign({}, n), {
              manufacturerData: this.convertObject(n.manufacturerData),
              serviceData: this.convertObject(n.serviceData),
              rawAdvertisement: n.rawAdvertisement ? this.convertValue(n.rawAdvertisement) : void 0,
            });
            r(i);
          })),
          await O.requestLEScan(e));
      }));
  }
  async stopLEScan() {
    await this.queue(async () => {
      var e;
      (await ((e = this.scanListener) === null || e === void 0 ? void 0 : e.remove()),
        (this.scanListener = null),
        await O.stopLEScan());
    });
  }
  async getDevices(e) {
    if (!Array.isArray(e)) throw new Error("deviceIds must be an array");
    return this.queue(
      async () =>
        (
          await O.getDevices({
            deviceIds: e,
          })
        ).devices,
    );
  }
  async getConnectedDevices(e) {
    if (!Array.isArray(e)) throw new Error("services must be an array");
    return (
      (e = e.map(D)),
      this.queue(
        async () =>
          (
            await O.getConnectedDevices({
              services: e,
            })
          ).devices,
      )
    );
  }
  async getBondedDevices() {
    return this.queue(async () => (await O.getBondedDevices()).devices);
  }
  async connect(e, r, s) {
    await this.queue(async () => {
      var n;
      if (r) {
        const i = `disconnected|${e}`;
        await ((n = this.eventListeners.get(i)) === null || n === void 0 ? void 0 : n.remove());
        const a = await O.addListener(i, () => {
          r(e);
        });
        this.eventListeners.set(i, a);
      }
      await O.connect(
        Object.assign(
          {
            deviceId: e,
          },
          s,
        ),
      );
    });
  }
  async createBond(e, r) {
    await this.queue(async () => {
      await O.createBond(
        Object.assign(
          {
            deviceId: e,
          },
          r,
        ),
      );
    });
  }
  async isBonded(e) {
    return await this.queue(
      async () =>
        (
          await O.isBonded({
            deviceId: e,
          })
        ).value,
    );
  }
  async disconnect(e) {
    await this.queue(async () => {
      await O.disconnect({
        deviceId: e,
      });
    });
  }
  async getServices(e) {
    return await this.queue(
      async () =>
        (
          await O.getServices({
            deviceId: e,
          })
        ).services,
    );
  }
  async discoverServices(e) {
    await this.queue(async () => {
      await O.discoverServices({
        deviceId: e,
      });
    });
  }
  async getMtu(e) {
    return await this.queue(
      async () =>
        (
          await O.getMtu({
            deviceId: e,
          })
        ).value,
    );
  }
  async requestConnectionPriority(e, r) {
    await this.queue(async () => {
      await O.requestConnectionPriority({
        deviceId: e,
        connectionPriority: r,
      });
    });
  }
  async readRssi(e) {
    return await this.queue(async () => {
      const s = await O.readRssi({
        deviceId: e,
      });
      return parseFloat(s.value);
    });
  }
  async read(e, r, s, n) {
    return (
      (r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        const a = await O.read(
          Object.assign(
            {
              deviceId: e,
              service: r,
              characteristic: s,
            },
            n,
          ),
        );
        return this.convertValue(a.value);
      })
    );
  }
  async write(e, r, s, n, i) {
    return (
      (r = D(r)),
      (s = D(s)),
      this.queue(async () => {
        if (!n?.buffer) throw new Error("Invalid data.");
        let a = n;
        (Z.getPlatform() !== "web" && (a = Qe(n)),
          await O.write(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
                value: a,
              },
              i,
            ),
          ));
      })
    );
  }
  async writeWithoutResponse(e, r, s, n, i) {
    ((r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        if (!n?.buffer) throw new Error("Invalid data.");
        let a = n;
        (Z.getPlatform() !== "web" && (a = Qe(n)),
          await O.writeWithoutResponse(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
                value: a,
              },
              i,
            ),
          ));
      }));
  }
  async readDescriptor(e, r, s, n, i) {
    return (
      (r = D(r)),
      (s = D(s)),
      (n = D(n)),
      await this.queue(async () => {
        const o = await O.readDescriptor(
          Object.assign(
            {
              deviceId: e,
              service: r,
              characteristic: s,
              descriptor: n,
            },
            i,
          ),
        );
        return this.convertValue(o.value);
      })
    );
  }
  async writeDescriptor(e, r, s, n, i, a) {
    return (
      (r = D(r)),
      (s = D(s)),
      (n = D(n)),
      this.queue(async () => {
        if (!i?.buffer) throw new Error("Invalid data.");
        let o = i;
        (Z.getPlatform() !== "web" && (o = Qe(i)),
          await O.writeDescriptor(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
                descriptor: n,
                value: o,
              },
              a,
            ),
          ));
      })
    );
  }
  async startNotifications(e, r, s, n, i) {
    ((r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        var a;
        const o = `notification|${e}|${r}|${s}`;
        await ((a = this.eventListeners.get(o)) === null || a === void 0 ? void 0 : a.remove());
        const l = await O.addListener(o, (c) => {
          n(this.convertValue(c?.value));
        });
        (this.eventListeners.set(o, l),
          await O.startNotifications(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
              },
              i,
            ),
          ));
      }));
  }
  async stopNotifications(e, r, s) {
    ((r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        var n;
        const i = `notification|${e}|${r}|${s}`;
        (await ((n = this.eventListeners.get(i)) === null || n === void 0 ? void 0 : n.remove()),
          this.eventListeners.delete(i),
          await O.stopNotifications({
            deviceId: e,
            service: r,
            characteristic: s,
          }));
      }));
  }
  validateRequestBleDeviceOptions(e) {
    return (
      e.services && (e.services = e.services.map(D)),
      e.optionalServices && (e.optionalServices = e.optionalServices.map(D)),
      e.serviceData &&
        Z.getPlatform() !== "web" &&
        (e.serviceData = e.serviceData.map((r) =>
          Object.assign(Object.assign({}, r), {
            serviceUuid: D(r.serviceUuid),
            dataPrefix: pt(r.dataPrefix),
            mask: pt(r.mask),
          }),
        )),
      e.manufacturerData &&
        (Z.getPlatform() !== "web"
          ? (e.manufacturerData = e.manufacturerData.map((r) =>
              Object.assign(Object.assign({}, r), {
                dataPrefix: pt(r.dataPrefix),
                mask: pt(r.mask),
              }),
            ))
          : (e.manufacturerData = e.manufacturerData.map((r) =>
              Object.assign(Object.assign({}, r), {
                dataPrefix: Vr(r.dataPrefix),
                mask: Vr(r.mask),
              }),
            ))),
      e
    );
  }
  convertValue(e) {
    return typeof e == "string" ? hs(e) : e === void 0 ? new DataView(new ArrayBuffer(0)) : e;
  }
  convertObject(e) {
    if (e === void 0) return;
    const r = {};
    for (const s of Object.keys(e)) r[s] = this.convertValue(e[s]);
    return r;
  }
}
const BleClient = new Qa();

// ---- 06-vendor-capacitor-plugins.js ----
// VENDOR (não editar): registro dos plugins Filesystem e Share do Capacitor.
function ao(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, r) {
        return new Proxy(
          {},
          {
            get(s, n) {
              return (i, a, o) => {
                const l = t.Capacitor.Plugins[r];
                if (l === void 0) {
                  o(new Error(`Capacitor plugin ${r} not found`));
                  return;
                }
                if (typeof l[n] != "function") {
                  o(new Error(`Method ${n} not found in Capacitor plugin ${r}`));
                  return;
                }
                (async () => {
                  try {
                    const c = await l[n](i);
                    a(c);
                  } catch (c) {
                    o(c);
                  }
                })();
              };
            },
          },
        );
      },
    },
  );
}
function oo(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, r) {
        return t.cordova.plugins[r];
      },
    },
  );
}
function lo(t = !1) {
  typeof window > "u" ||
    ((window.CapacitorUtils = window.CapacitorUtils || {}),
    window.Capacitor !== void 0 && !t ? ao(window) : window.cordova !== void 0 && oo(window));
}
var FsDirectory;
(function (t) {
  ((t.Documents = "DOCUMENTS"),
    (t.Data = "DATA"),
    (t.Library = "LIBRARY"),
    (t.Cache = "CACHE"),
    (t.External = "EXTERNAL"),
    (t.ExternalStorage = "EXTERNAL_STORAGE"),
    (t.ExternalCache = "EXTERNAL_CACHE"),
    (t.LibraryNoCloud = "LIBRARY_NO_CLOUD"),
    (t.Temporary = "TEMPORARY"));
})(FsDirectory || (FsDirectory = {}));
var Zt;
(function (t) {
  ((t.UTF8 = "utf8"), (t.ASCII = "ascii"), (t.UTF16 = "utf16"));
})(Zt || (Zt = {}));
const FilesystemPlugin = Ge("Filesystem", {
  web: () => ar(() => import("./web-8iTD2sZM.js"), [], import.meta.url).then((t) => new t.FilesystemWeb()),
});
lo();
const SharePlugin = Ge("Share", {
  web: () => ar(() => import("./web-BfBGDy75.js"), [], import.meta.url).then((t) => new t.ShareWeb()),
});

// ---- 10-core.js ----
// =============================================================================
// Núcleo: configuração, cliente Supabase e utilitários de formatação e domínio.
// Tudo neste diretório é concatenado em ordem pelo build (escopo único de módulo).
// Nomes novos usam 4+ caracteres para não colidir com os nomes curtos do vendor.
// =============================================================================
const CONFIG = Object.freeze({
  supabaseUrl: "https://dejxzipydlnjhrjivgjp.supabase.co",
  publishableKey: "sb_publishable_XkutzQ-1BaHXHuBDaD1eLw_xEukysyF",
  // Endereço público do site: usado nos links de convite e recuperação, inclusive pelo app Android.
  publicBaseUrl: "https://laboratoriochesterton.github.io/sensorgaxeta/",
  callbackPage: "acesso.html",
  inviteFunction: "gaxeta-invite",
  pollMs: 5000,
  contextCheckMs: 60000,
  pageSize: 24,
});

// A URL de entrada é lida antes de o SDK consumir os parâmetros de convite/recuperação.
const ENTRY_URL = Object.freeze({ hash: location.hash, search: location.search });

async function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  init.signal?.aborted ? controller.abort() : init.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}

// `Ia` é o createClient do supabase-js no vendor.
const sb = Ia(CONFIG.supabaseUrl, CONFIG.publishableKey, {
  global: { fetch: fetchWithTimeout },
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

async function unwrap(request) {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}
const callRpc = (name, params = {}) => unwrap(sb.rpc(name, params));

const KIND_ORDER = ["corporation", "company", "area", "subarea", "equipment", "point"];
const KIND_LABEL = {
  corporation: "Corporação",
  company: "Empresa",
  area: "Área",
  subarea: "Subárea",
  equipment: "TAG",
  point: "Spot",
};
// Filhos válidos por nível (a subárea é opcional: o TAG pode ficar direto na área).
const KIND_CHILDREN = {
  corporation: ["company"],
  company: ["area"],
  area: ["equipment", "subarea"],
  subarea: ["equipment"],
  equipment: ["point"],
  point: [],
};
const KIND_ICON = { corporation: "building-2", company: "factory", area: "folder", subarea: "folder", equipment: "cog", point: "map-pin" };

// Spot: o nome é uma de três opções (o servidor valida a mesma lista).
const SPOT_NAMES = ["LOA", "LA", "UNICO"];
const spotCanonical = (name) => {
  const key = String(name ?? "").replace(/\s+/g, "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return SPOT_NAMES.includes(key) ? key : null;
};

// Tipos de equipamento. A lista vem do servidor (gaxeta_equipment_types); esta cópia
// é o catálogo inicial e só vale enquanto a leitura não chega.
const equipCatalog = new Map([
  ["bomba_centrifuga", "Bomba centrífuga"], ["bomba_biapoiada", "Bomba biapoiada"], ["agitador", "Agitador"],
  ["misturador", "Misturador"], ["refinador", "Refinador"], ["digestor", "Digestor"], ["depurador", "Depurador"],
  ["vaso_pressao", "Vaso de pressão"], ["bomba_magnetica", "Bomba magnética"], ["bomba_hermetica", "Bomba hermética"],
  ["bomba_vacuo", "Bomba de vácuo"], ["compressor", "Compressor"], ["bomba_alta_pressao", "Bomba de alta pressão"],
  ["bomba_baixa_pressao", "Bomba de baixa pressão"],
]);
const TYPE_UNKNOWN = "Tipo não informado";
// Ficha técnica do TAG: [chave no servidor, rótulo, formato]. "count" = inteiro não negativo; "long" = texto livre.
const EQUIP_GROUPS = [
  { title: "Processo", fields: [["fluid", "Produto / fluido"], ["fluid_temperature", "Temperatura do fluido"], ["density", "Densidade"], ["characteristics", "Características", "long"]] },
  {
    title: "Equipamento e montagem",
    fields: [["manufacturer", "Fabricante"], ["model", "Modelo"], ["shaft_size", "Tamanho do eixo"], ["sleeve_size", "Tamanho da luva"], ["stud_size", "Tamanho do prisioneiro"], ["stud_diameter", "Diâmetro do prisioneiro"], ["gland_bolt_count", "Parafusos do preme-gaxeta (qtd.)", "count"]],
  },
  { title: "Gaxeta", fields: [["ring_count", "Quantidade de anéis", "count"], ["packing_type", "Tipo"], ["packing_model", "Modelo"], ["assembly_rule", "Regra de montagem", "long"]] },
];
const ROLE_LABEL = { adm1: "ADM nível 1", adm2: "ADM nível 2", adm3: "ADM nível 3", corp: "Usuário de corporação" };

const fmtNum = (value, digits = 1) =>
  value == null || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" }) : "—");
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const $id = (id) => document.getElementById(id);
// Plataforma: só o runtime nativo do Capacitor conta como aplicativo. Uma janela
// estreita de navegador (inclusive Chrome ou Safari no celular) continua sendo web.
const isNativeApp = () => Z.isNativePlatform();
// Bluetooth existe apenas no aplicativo nativo com o plugin disponível.
const bleAvailable = () => isNativeApp() && Z.isPluginAvailable("BluetoothLe");
// Layout de telefone: tela estreita ou telefone deitado (pouca altura). A mesma condição do CSS.
const isNarrow = () => window.matchMedia("(max-width: 760px), (max-height: 480px) and (orientation: landscape)").matches;

// Ícones Lucide incluídos no vendor (nomes minificados à direita).
const renderIcons = () =>
  en({
    icons: {
      LayoutGrid: Ks, Network: Gs, ChartNoAxesCombined: Ms, Router: Xs, Bluetooth: Us, BluetoothSearching: Ds, BookOpen: Bs,
      Plus: Js, Search: Qs, Radio: Ys, Wifi: Zs, Building2: qs, Factory: Ws, Folder: Hs, Cog: Vs, MapPin: zs, ChevronRight: Fs,
    },
  });
const icon = (name) => `<i data-lucide="${name}"></i>`;
// Ícones adicionais desenhados aqui (traço simples), para não depender de novos pacotes.
const GLYPHS = {
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.5c1.8.9 3 2.9 3 5.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  shield: '<path d="M12 3.5l7 2.5v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-2.5z"/>',
  "chevron-down": '<path d="M6 9.5l6 6 6-6"/>',
  "chevron-right": '<path d="M9.5 6l6 6-6 6"/>',
  back: '<path d="M10 6l-6 6 6 6M4 12h16"/>',
  subfolder: '<path d="M3.5 6.5h6l2 2h9v10h-17z"/><path d="M8 13.5h8"/>',
  list: '<path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/>',
  ruler: '<path d="M3.5 15.5l12-12 5 5-12 12z"/><path d="M7 12l1.5 1.5M10 9l1.5 1.5M13 6l1.5 1.5"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.2 5.2L4 17l3 3 5.3-5.3a4 4 0 0 0 5.2-5.2l-2.5 2.5-2-2z"/>',
};
// Ícone do nível: os do pacote, mais um próprio para distinguir subárea de área.
const kindIcon = (kind) => (kind === "subarea" ? glyph("subfolder") : icon(KIND_ICON[kind]));
const glyph = (name) =>
  `<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPHS[name] || ""}</svg>`;

// ----- Regras de domínio herdadas do pacote publicado (sem alteração de comportamento) -----
// Cadência observada de cada sensor (gaxeta_telemetry_summary → interval_s). Até 12 s vale a
// regra original (25 s / 65 s). Placa que hiberna entre envios é avaliada pelo próprio
// intervalo: transmitindo até 1,5 intervalo + 15 s; atraso até 3 intervalos + 15 s.
const fmtInterval = (seconds) =>
  seconds < 90 ? `${Math.round(seconds)} s` : seconds < 5400 ? `${Math.round(seconds / 60)} min` : `${fmtNum(seconds / 3600, 1)} h`;
function connectionStatus(t, e = Date.now(), intervalS = null) {
  const r = e - new Date(t.last_received_at || 0).getTime();
  const slow = Number(intervalS) > 12;
  const onlineMs = slow ? intervalS * 1500 + 15e3 : 25e3;
  const lateMs = slow ? intervalS * 3000 + 15e3 : 65e3;
  return r < onlineMs
    ? {
        online: !0,
        label: slow ? "Transmitindo · a cada " + fmtInterval(intervalS) : "Transmitindo",
        className: "green",
      }
    : r < lateMs
      ? {
          online: !1,
          label: "Atraso na transmissão",
          className: "gray",
        }
      : {
          online: !1,
          label: "Sem atualização",
          className: "gray",
        };
}
function assetPath(t, e) {
  const r = [],
    s = new Set();
  for (; t && !s.has(t);) {
    s.add(t);
    const n = e.find((i) => i.id === t);
    if (!n) break;
    (r.unshift(n), (t = n.parent_id));
  }
  return r;
}
function isUnderAsset(t, e, r) {
  return !e || assetPath(t, r).some((s) => s.id === e);
}
function companyOf(t, e) {
  return assetPath(t, e).find((r) => r.kind === "company")?.id || null;
}
function presetRange(t, e = new Date()) {
  const r = new Date(e),
    s = new Date(e);
  if (t === "month" || t === "3months") {
    const n = s.getDate();
    (s.setDate(1), s.setMonth(s.getMonth() - (t === "month" ? 1 : 3)));
    const i = new Date(s.getFullYear(), s.getMonth() + 1, 0).getDate();
    s.setDate(Math.min(n, i));
  } else s.setTime(r.getTime() - Number(t));
  return {
    from: s,
    to: r,
  };
}
function validateRange(t, e) {
  const r = new Date(t).getTime(),
    s = new Date(e).getTime();
  if (!Number.isFinite(r) || !Number.isFinite(s) || s - r < 1e3 || s - r > 366 * 864e5)
    throw Error("Selecione um intervalo entre 1 segundo e 366 dias.");
  return {
    from: new Date(r),
    to: new Date(s),
  };
}
function isValidSensorName(t) {
  return /^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$/.test(t);
}
function csvCell(t) {
  const e = String(t ?? "");
  return '"' + (/^[=+\-@\t\r]/.test(e) ? "'" : "") + e.replaceAll('"', '""') + '"';
}
// ----- Leitura elétrica do potenciômetro -----
// A plataforma mostra uma única grandeza de posição: a posição ELÉTRICA do potenciômetro, em %
// da escala elétrica da placa (0 % no mínimo útil, 100 % no máximo útil), e a tensão no pino,
// em volts. Vale com ou sem vínculo a spot. Não há medida em mm, ciclo ou calibração mecânica.
// Tensão em volts a partir de milivolts.
const fmtVolt = (millivolts, digits = 3) => (millivolts == null || !Number.isFinite(Number(millivolts)) ? "—" : fmtNum(Number(millivolts) / 1000, digits) + " V");
// Tensão atual de um sensor, sempre com a origem: calibrada pelo ADC da placa (firmware
// 4.3.0 em diante) ou estimada pela conta ADC × 3,3 ÷ 4095 das versões anteriores.
function voltageInfo(device, live) {
  const calibrated = device?.last_voltage_mv ?? (live?.voltage_source === "calibrated" ? live.voltage_mv : null);
  if (calibrated != null && Number.isFinite(Number(calibrated)))
    return { text: fmtVolt(calibrated), source: "calibrada", short: "calibrada", calibrated: true, title: "Tensão no pino, calibrada pelo ADC da placa: média das mesmas amostras da leitura bruta" };
  if (device?.last_voltage_v == null) return { text: "—", source: "", short: "", calibrated: false, title: "" };
  return { text: fmtNum(device.last_voltage_v, 3) + " V", source: "estimada", short: "estimada", calibrated: false, title: "Estimativa ADC × 3,3 ÷ 4095 (firmware anterior ao 4.3.0, sem a calibração do ADC)" };
}
// Diagnóstico do bloco de amostras da leitura atual (mesma regra de gaxeta_private.adc_block,
// migração 12). O servidor envia `block`; sem o resumo, a tela chega ao mesmo resultado pelos
// campos da leitura. Separa três situações diferentes:
//   ceiling    bloco inteiro em 4095: limite do ADC (100 % da escala elétrica);
//   mixed_high amostras em 4095 junto com amostras muito diferentes: contato, movimento ou circuito;
//   unstable   disperso sem tocar os limites.
function blockOf(adc, noise, min, max) {
  const value = adc == null ? NaN : Number(adc);
  const spread = noise == null ? null : Number(noise);
  const low = min == null ? null : Number(min);
  const high = max == null ? null : Number(max);
  if (!Number.isFinite(value)) return "missing";
  if ((low ?? (value >= 4095 ? 4095 : -1)) >= 4095) return "ceiling";
  if ((high ?? (value <= 0 ? 0 : 1)) <= 0) return "floor";
  const wide = high != null && low != null && (high - low > 400 || (spread ?? 0) > 25);
  if (high != null && high >= 4095 && wide) return "mixed_high";
  if (low != null && low <= 0 && wide) return "mixed_low";
  if ((high != null && high >= 4095) || value >= 4095) return "touch_high";
  if ((low != null && low <= 0) || value <= 0) return "touch_low";
  if (spread == null && low == null) return "unknown";
  if ((spread ?? 0) > 25 || (high != null && low != null && high - low > 400)) return "unstable";
  return "ok";
}
const BLOCK_TEXT = {
  ok: "boa",
  ceiling: "limite do ADC (bloco inteiro em 4095)",
  touch_high: "encosta no limite superior do ADC",
  mixed_high: "bloco misto: amostras em 4095 junto com amostras muito diferentes",
  floor: "limite inferior do ADC (bloco inteiro em zero)",
  touch_low: "encosta no limite inferior do ADC",
  mixed_low: "bloco misto: zeros junto com amostras muito diferentes",
  unstable: "instável (dispersão alta no bloco)",
  unknown: "sem diagnóstico do bloco (firmware anterior ao 4.3.0)",
  missing: "sem leitura",
};
// O que cada condição permite concluir, e só isso.
const BLOCK_HINT = {
  ceiling:
    "O ADC chegou ao teto: acima dele toda tensão vira 4095 e deixa de ser distinguida. A posição aparece como 100 % da escala elétrica; nessa região a resolução é limitada.",
  touch_high: "Parte do bloco chegou a 4095: a posição está na borda superior da faixa que o ADC mede.",
  mixed_high:
    "No mesmo bloco (60 ms) há amostras em 4095 e amostras muito diferentes. Com o eixo parado, confira borne, fio do cursor, alimentação, GND e contato interno do potenciômetro; giro durante a aquisição produz o mesmo efeito. O dado sozinho não prova a causa.",
  floor: "Bloco inteiro em zero: abaixo de cerca de 0,15 V o ADC não distingue a tensão. Confira o extremo baixo e o cursor.",
  touch_low: "Parte do bloco chegou a zero: a posição está na borda inferior da faixa que o ADC mede.",
  mixed_low: "No mesmo bloco há zeros e amostras muito diferentes: confira a ligação do cursor e o GND.",
  unstable:
    "Dispersão alta sem tocar os limites: cursor solto, entrada sem potenciômetro ligado ou giro durante a leitura. Enquanto durar, o percentual não representa uma posição.",
};
const BLOCK_SHORT = {
  ok: "bloco bom", ceiling: "limite do ADC", touch_high: "na borda do limite do ADC", mixed_high: "bloco misto", floor: "limite inferior do ADC",
  touch_low: "na borda inferior do ADC", mixed_low: "bloco misto", unstable: "bloco instável", unknown: "sem diagnóstico do bloco", missing: "sem leitura",
};
// Condição elétrica da leitura atual, como aparece nos cartões, na árvore e em Detalhes.
// key escolhe a cor: electric (leitura boa), limit (saturação: limite do ADC), warn (bloco que
// não representa posição) e unknown (sem leitura).
const BLOCK_QUALITY = {
  ok: { key: "electric", label: "Sinal estável", note: "Leitura atual do potenciômetro" },
  unknown: { key: "electric", label: "Posição elétrica", note: "Firmware sem diagnóstico do bloco" },
  ceiling: { key: "limit", label: "Limite do ADC", note: "100 % da escala elétrica · região saturada, resolução limitada" },
  touch_high: { key: "limit", label: "Na borda do limite do ADC", note: "Parte das amostras chegou a 4095" },
  floor: { key: "limit", label: "Limite inferior do ADC", note: "0 % da escala elétrica · confira o extremo baixo e o cursor" },
  touch_low: { key: "limit", label: "Na borda inferior do ADC", note: "Parte das amostras chegou a zero" },
  mixed_high: { key: "warn", label: "Bloco misto", note: "Amostras no limite junto com outras muito diferentes: confira o cursor e o GND" },
  mixed_low: { key: "warn", label: "Bloco misto", note: "Zeros junto com amostras muito diferentes: confira o cursor e o GND" },
  unstable: { key: "warn", label: "Sinal instável", note: "Cursor solto, sem potenciômetro ou giro durante a leitura: não é posição" },
};
// Escala elétrica do percentual informada pela placa (percent_scale). Sem ela: ADC bruto.
function scaleText(scale) {
  const fixed = /^(mv|adc)-(\d+)-(\d+)$/.exec(scale || "");
  if (!fixed) return scale ? "escala " + scale : "escala do ADC (0 a 4095)";
  return fixed[1] === "mv"
    ? `limites fixos da placa: ${fmtNum(Number(fixed[2]) / 1000, 3)} V = 0 % e ${fmtNum(Number(fixed[3]) / 1000, 3)} V = 100 %`
    : `limites fixos da placa: ${fixed[2]} contagens = 0 % e ${fixed[3]} contagens = 100 %`;
}
// Posição elétrica do sensor: a leitura atual, em % da escala elétrica da placa. `live` é o item
// do resumo de telemetria (opcional). Bloco estável no teto aparece como 100 %, "Limite do ADC".
function electricInfo(device, live) {
  const block = live?.block || (device?.last_adc_raw != null ? blockOf(device.last_adc_raw, device.adc_noise, device.last_adc_min, device.last_adc_max) : device?.last_percent != null ? "unknown" : null);
  const raw = device?.last_percent ?? live?.percent;
  const scale = device?.last_percent_scale ?? live?.percent_scale ?? null;
  if (raw == null || !Number.isFinite(Number(raw))) return { percent: null, text: "—", label: "", block, ceiling: false, scale };
  const ceiling = block === "ceiling";
  const percent = ceiling ? 100 : Math.max(0, Math.min(100, Number(raw)));
  return { percent, text: fmtNum(percent) + " %", label: ceiling ? "Limite do ADC" : block === "floor" ? "Limite inferior do ADC" : "", block, ceiling, scale };
}
// Como apresentar um sensor em qualquer tela: o número é sempre a posição elétrica (%), com a
// condição elétrica da leitura. Não há classificação mecânica nem recomendação de intervenção.
function electricView(device, live) {
  const electric = electricInfo(device, live);
  if (!device || electric.percent == null)
    return { key: "unknown", label: "Sem leitura", note: "Aguardando a primeira leitura da placa", value: "—", unit: "", scale: null, electric };
  const quality = BLOCK_QUALITY[electric.block] || BLOCK_QUALITY.ok;
  return { key: quality.key, label: quality.label, note: quality.note, value: fmtNum(electric.percent), unit: "%", scale: electric.percent, electric };
}
// ----- Modalidade magnética (AS5600 por I²C) -----
// Três grandezas que não se misturam: o ÂNGULO absoluto do ímã (medido, 0 a 4095 = 0° a 359,9°),
// o AVANÇO do preme-gaxeta desde o engaxetamento (calculado, mm) e o CURSO DE AJUSTE RESTANTE
// (calculado, % e mm). Nada aqui usa percentual do ADC, tensão ou milímetro nominal.
const isMagnetic = (device, live) => (live?.modality || device?.last_modality) === "as5600_i2c";
const magDegrees = (raw) => (raw == null || !Number.isFinite(Number(raw)) ? null : (Number(raw) * 360) / 4096);
const fmtDeg = (degrees, digits = 1) => (degrees == null || !Number.isFinite(Number(degrees)) ? "—" : fmtNum(degrees, digits) + "°");
const fmtMm = (value, digits = 1) => (value == null || !Number.isFinite(Number(value)) ? "—" : fmtNum(value, digits) + " mm");
const clampPercent = (value) => Math.max(0, Math.min(100, Number(value)));
// Por que não há curso restante agora, e o que fazer. key escolhe a cor (como na série elétrica).
const MAG_REASON = {
  no_reading: { key: "unknown", label: "Sem leitura", note: "Aguardando a primeira leitura da placa." },
  bus_no_ack: { key: "warn", label: "Sensor sem resposta", note: "O AS5600 não respondeu no I²C. Confira alimentação de 3,3 V, GND e os fios SDA e SCL." },
  bus_read_error: { key: "warn", label: "Falha de leitura I²C", note: "O sensor responde, mas a leitura veio incompleta. Confira solda, cabo e contatos." },
  bus_timeout: { key: "warn", label: "I²C sem resposta a tempo", note: "Barramento travado ou cabo longo demais. Confira o cabo e os pull-ups." },
  no_magnet: { key: "warn", label: "Ímã ausente", note: "O sensor não detecta o ímã. Confira o ímã no eixo e a distância até o chip." },
  field_weak: { key: "warn", label: "Campo fraco", note: "Ímã longe ou descentrado. Aproxime e centralize o ímã." },
  field_strong: { key: "warn", label: "Campo forte", note: "Ímã perto demais do chip. Afaste o ímã." },
  no_link: { key: "electric", label: "Sem vínculo", note: "Ângulo absoluto do sensor. Vincule a um spot para acompanhar o curso." },
  no_geometry: { key: "limit", label: "Sem geometria", note: "O spot ainda não tem montagem caracterizada. Peça à engenharia para vincular a geometria." },
  no_reference: { key: "limit", label: "Sem referência", note: "Informe o curso disponível e toque em Engaxetamento realizado, em Detalhes." },
  awaiting_reference: { key: "limit", label: "Aguardando leitura", note: "Engaxetamento solicitado. Mantenha a haste parada até a confirmação." },
  not_computed: { key: "electric", label: "Ângulo do sensor", note: "Aguardando a próxima leitura para calcular o curso." },
  out_of_range: { key: "warn", label: "Fora da faixa validada", note: "O giro passou do arco ou da tolerância validados. Confira a montagem e registre novo engaxetamento." },
  // Modo bancada (demonstração em mesa). Nunca é curso de campo, e sem posição conhecida não há número.
  bench: { key: "bench", label: "Posição de bancada", note: "Posição de bancada: demonstração em mesa, não é curso de campo." },
  bench_awaiting_start: { key: "bench", label: "Confirme o início", note: "Modo bancada ligado. Ponha o eixo dentro da faixa e toque em Confirmar início, em Detalhes." },
  bench_reposition: { key: "warn", label: "Reposicionar para retomar", note: "A placa perdeu a continuidade do giro. Volte o eixo para dentro da faixa e confirme a referência, em Detalhes." },
  bench_no_continuity: { key: "limit", label: "Sem contagem contínua", note: "Esta placa não envia a contagem contínua (firmware anterior ao 4.5.0). O Modo bancada precisa dela." },
};
// Faixas do curso de ajuste restante. Quem decide é o servidor (service.band), sobre o valor
// estabilizado com duas casas: o mesmo número que a tela mostra. Aqui ficam só o rótulo e a cor.
const MAG_BAND = {
  high: { key: "band-high", label: "Alto ajuste", range: "73 % ou mais" },
  medium: { key: "band-medium", label: "Médio ajuste", range: "de 50 % até abaixo de 73 %" },
  low: { key: "band-low", label: "Baixo ajuste", range: "de 30 % até abaixo de 50 %" },
  none: { key: "band-none", label: "Sem ajuste", range: "abaixo de 30 %" },
};
// Mesma regra de gaxeta_private.mag_band, só para a legenda da SIMULAÇÃO das faixas na bancada.
const magBandOf = (percent) => {
  const shown = Math.round(Number(percent) * 100) / 100;
  return !Number.isFinite(shown) ? null : shown >= 73 ? "high" : shown >= 50 ? "medium" : shown >= 30 ? "low" : "none";
};
// ----- Faixas SIMULADAS da bancada (apresentação da demonstração) -----
// O percentual é o que o servidor entrega (bench.percent). O que a tela mostra é esse valor com
// duas casas, e a faixa é decidida sobre o MESMO número mostrado (regra de magBandOf): o texto
// "29,99 %" nunca aparece com a faixa de 30 %. As cores são próprias da simulação: o médio
// amarelo vale só aqui, e o curso de ajuste restante de campo continua com as cores dele.
const BENCH_SIM = {
  none: { band: "none", key: "sim-none", label: "Sem ajuste", range: "0,00 % a 29,99 %", short: "até 29,99 %", color: "vermelho" },
  low: { band: "low", key: "sim-low", label: "Baixo ajuste", range: "30,00 % a 49,99 %", short: "30 a 49,99 %", color: "laranja" },
  medium: { band: "medium", key: "sim-medium", label: "Médio ajuste", range: "50,00 % a 72,99 %", short: "50 a 72,99 %", color: "amarelo" },
  high: { band: "high", key: "sim-high", label: "Alto ajuste", range: "73,00 % a 100,00 %", short: "73 a 100 %", color: "verde" },
};
const BENCH_SIM_ORDER = ["none", "low", "medium", "high"];
// Onde a faixa muda no valor SEM arredondar (o que arredonda para 30,00 já é "Baixo ajuste").
// Usado só para dividir graficamente um trecho da curva que cruza um limite.
const BENCH_SIM_EDGES = [29.995, 49.995, 72.995];
// Percentual de bancada como a tela mostra: número com duas casas, ou null quando não há dado.
// A validade é conferida ANTES da conversão: Number(null) e Number("") valem 0, e um dado
// ausente apareceria como "0,00 % · Sem ajuste". Zero de verdade é valor válido.
function benchShown(percent) {
  if (percent == null || percent === "" || typeof percent === "boolean" || typeof percent === "object") return null;
  const value = Number(percent);
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  return Math.round(value * 100) / 100;
}
// Faixa simulada de um percentual de bancada (uma só por valor), ou null sem dado.
function benchSimOf(percent) {
  const shown = benchShown(percent);
  return shown == null ? null : BENCH_SIM[magBandOf(shown)] || null;
}
// A preferência "Mostrar faixas simuladas da bancada" é do vínculo sensor–spot e vem do servidor
// (gaxeta_mag_summary → bench_bands; padrão: ligadas). `benchBandsLocal` guarda a escolha enquanto
// o envio está em andamento; num banco ainda sem a migração 16, ela fica só neste aparelho.
const benchBandsLocal = new Map();
const benchBandsStored = (sensorId) => {
  try {
    const saved = localStorage.getItem("gaxeta.benchBands." + sensorId);
    return saved == null ? null : saved === "1";
  } catch {
    return null;
  }
};
function benchBandsOn(sensorId, mag) {
  if (benchBandsLocal.has(sensorId)) return benchBandsLocal.get(sensorId);
  if (mag && typeof mag.bench_bands === "boolean") return mag.bench_bands;
  return benchBandsStored(sensorId) ?? true;
}
// Selo da faixa simulada (cor + nome: a cor nunca é o único sinal).
const benchSimChip = (sim, extra = "") =>
  sim ? `<span class="sim-chip health-${sim.key}${extra}" title="Faixa simulada da bancada (${esc(sim.range)}). Não é curso de ajuste restante.">${esc(sim.label)}</span>` : "";
// Hora curta para leitura rápida: só a hora quando é de hoje; com o dia quando não é.
function fmtClock(value) {
  if (!value) return "—";
  const date = new Date(value);
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return date.toDateString() === new Date().toDateString() ? time : `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${time}`;
}
// Por que a placa recomeçou a contagem contínua (ct_loss) ou a bancada perdeu a posição.
const CT_LOSS_TEXT = {
  boot: "reinício da placa ou retorno de energia", no_magnet: "ímã ausente", field: "campo magnético fora da faixa", bus: "falha do barramento I²C",
  gap: "lacuna na aquisição acima do limite", speed: "giro mais rápido que a velocidade garantida", ambiguous: "meia volta entre duas amostras (ambíguo)",
  incoherent: "pacote com contagem incoerente", session_changed: "a sessão da placa mudou",
  bus_no_ack: "sensor sem resposta no I²C", bus_read_error: "falha de leitura no I²C", bus_timeout: "I²C sem resposta a tempo", field_weak: "campo fraco", field_strong: "campo forte",
};
const ctLossText = (code) => CT_LOSS_TEXT[code] || code || "motivo não informado";
// Motivo de a confirmação do início ainda estar aguardando (bench.anchor_note).
const BENCH_NOTE_TEXT = {
  outside_range: "O eixo está FORA da faixa. Gire até um ponto entre o 0 % e o 100 % e aguarde a próxima leitura.",
  moving: "O eixo estava em movimento na última leitura. Deixe-o parado.",
  invalid_sample: "A última leitura veio sem ângulo válido (ímã ou barramento). Confira o sensor.",
  no_continuity: "Esta placa não envia a contagem contínua (firmware anterior ao 4.5.0).",
  no_session: "A placa ainda não abriu a contagem. Aguarde a próxima leitura.",
  waiting_new_sample: "Aguardando uma leitura colhida depois do toque.",
  expired: "A confirmação anterior venceu sem uma leitura válida. Toque de novo.",
};
// Milímetros digitados com vírgula ou ponto. Devolve número, ou null quando vazio, ou NaN quando inválido.
function parseMm(text) {
  const raw = String(text ?? "").trim().replace(",", ".");
  if (!raw) return null;
  return /^\d+(\.\d+)?$/.test(raw) ? Number(raw) : NaN;
}
const fmtMmInput = (value) => (value == null ? "" : Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 3, useGrouping: false }));
const SIZE_CLASS_LABEL = { small: "Pequeno", medium: "Médio", large: "Grande" };
const COURSE_SOURCE_TEXT = { point: "definido neste spot", equipment: "herdado do TAG" };
// Sem o resumo magnético (banco antigo ou sem permissão), a saúde sai dos campos do próprio sensor.
function magReasonFromDevice(device) {
  if (!device || device.last_bus_status == null) return "no_reading";
  if (device.last_bus_status !== "ok") return "bus_" + device.last_bus_status;
  if (device.last_mag_status === "no_magnet") return "no_magnet";
  if (device.last_mag_status === "weak") return "field_weak";
  if (device.last_mag_status === "strong") return "field_strong";
  return device.measurement_point_id ? "no_reference" : "no_link";
}
// Como apresentar um sensor magnético em cartões, árvore, Detalhes e Telemetria. `mag` é o item
// de gaxeta_mag_summary. O número principal é o Curso de ajuste restante (%), quando existe e é
// válido; sem ele, o ângulo absoluto. Amostra inválida não mostra número: mostra o motivo.
// A barra fica limitada a 0–100 %; o valor com sinal segue em `computed`.
function magView(device, mag) {
  const reading = mag?.reading || null;
  const raw = reading ? reading.raw_angle : (device?.last_raw_angle ?? null);
  const degrees = magDegrees(raw);
  const reason = mag ? mag.reason || null : magReasonFromDevice(device);
  const computed = mag?.computed || null;
  const service = mag?.service || null;
  const electric = { percent: null, text: "—", label: "", block: null, ceiling: false, scale: null };
  const base = { magnetic: true, mag: mag || null, reason, degrees, raw, electric, computed, service, origin: "medido" };
  const info = MAG_REASON[reason] || null;
  const sampleBad = reason && /^(bus_|no_magnet|field_|no_reading)/.test(reason);
  const bench = mag?.bench || null;
  // Modo bancada: série própria, sempre identificada. Sem posição conhecida não há número
  // (nunca 0 % nem "Sem ajuste" no lugar da leitura).
  if (bench) {
    const bands = benchBandsOn(device?.sensor_id, mag);
    const shared = { ...base, bench, benchBands: bands, sim: null, series: "bancada", kicker: "Posição de bancada", origin: "bancada" };
    const shown = bench.state === "ok" && !sampleBad ? benchShown(bench.percent) : null;
    if (shown != null) {
      const over = Number(bench.over_deg) || 0;
      const sim = bands ? benchSimOf(shown) : null;
      const where = over > 0 ? `No teto: ${fmtDeg(over)} além do 100 %` : over < 0 ? `No piso: ${fmtDeg(-over)} abaixo do 0 %` : "Dentro da faixa";
      return {
        ...shared, origin: "calculado · bancada", sim, where, key: sim ? sim.key : "bench", label: sim ? sim.label : "Posição de bancada",
        note: (sim ? `Faixa simulada (${sim.range}) · ` : "") + where + ` · posição contínua ${fmtDeg(bench.continuous_deg)}`,
        value: fmtNum(shown, 2), unit: "%", scale: shown,
      };
    }
    // Amostra inválida, início não confirmado ou reposicionamento: estado próprio, sem número.
    // O motivo do servidor manda; sem ele, vale o estado da própria bancada.
    const state = (reason !== "bench" && info) || MAG_REASON["bench_" + bench.state] || MAG_REASON.bench_awaiting_start;
    return { ...shared, key: state.key, label: state.label, note: state.note, value: "—", unit: "", scale: null };
  }
  if (computed && computed.remaining_percent != null && (!reason || reason === "out_of_range")) {
    // Campo: o número em destaque é o curso restante ESTABILIZADO, com duas casas, e a faixa é a
    // que o servidor decidiu sobre esse mesmo número. O valor instantâneo fica em Detalhes.
    const estimated = service?.course_origin === "estimated";
    const band = reason === "out_of_range" ? null : MAG_BAND[service?.band] || null;
    const shown = service?.stable_shown ?? service?.stable_remaining ?? computed.remaining_percent;
    const percent = clampPercent(shown);
    const tags = [estimated ? "curso estimado" : "", service?.provisional ? "geometria em caracterização" : ""].filter(Boolean);
    // Fora da faixa validada: a classificação fica suspensa e nenhum número ocupa o destaque.
    // O instantâneo e o último estabilizado continuam em Detalhes, com esses nomes.
    if (reason === "out_of_range")
      return {
        ...base, origin: "calculado", key: info.key, kicker: "Curso de ajuste restante", series: estimated ? "campo, curso estimado" : "campo, curso medido", estimated, band: null,
        instant: computed.remaining_percent, label: info.label, note: `${info.note} Último valor estabilizado: ${fmtNum(shown, 2)} %.`, value: "—", unit: "", scale: null,
      };
    return {
      ...base, origin: "calculado", key: info ? info.key : band ? band.key : "electric", kicker: "Curso de ajuste restante",
      series: estimated ? "campo, curso estimado" : "campo, curso medido", estimated, band: band ? service.band : null, instant: computed.remaining_percent,
      label: info ? info.label : band ? band.label : service?.provisional ? "Provisório" : "Calculado",
      note: info ? info.note : `${fmtMm(computed.remaining_mm)} de ${fmtMm(service?.course_mm)} · avanço ${fmtMm(computed.advance_mm)}` + (tags.length ? " · " + tags.join(" · ") : ""),
      value: fmtNum(percent, 2), unit: "%", scale: percent,
    };
  }
  return {
    ...base, key: info?.key || "electric", kicker: "Ângulo do sensor", label: info?.label || "Ângulo do sensor", note: info?.note || "Ângulo absoluto do ímã.",
    value: sampleBad || degrees == null ? "—" : fmtNum(degrees), unit: sampleBad || degrees == null ? "" : "°", scale: null,
  };
}
// Identificador da solicitação de engaxetamento: o mesmo em cada nova tentativa do mesmo clique.
const newRequestId = () =>
  globalThis.crypto?.randomUUID?.() ||
  "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (Number(c) ^ ((Math.random() * 16) >> (Number(c) / 4))).toString(16));
// Cadência declarada pelo firmware no sufixo da versão: -hib180 (hibernação, um envio a cada
// 180 s) ou -cont30 (contínuo, sem hibernação, um envio a cada 30 s). Versão sem sufixo: contínuo, 10 s.
function firmwareCadence(version) {
  const match = /-(hib|cont)(\d+)$/.exec(version || "");
  if (match) {
    const seconds = Number(match[2]);
    return { seconds, sleeps: match[1] === "hib", text: `${match[1] === "hib" ? "hibernação" : "contínuo, sem hibernação"} · um envio a cada ${fmtInterval(seconds)}` };
  }
  return /^4\.\d+\.\d+$/.test(version || "") ? { seconds: 10, sleeps: false, text: "contínuo, sem hibernação · um envio a cada 10 s" } : null;
}
// A linha estabilizada do gráfico é montada em 70-telemetry.js (buildStableSegments), por condição.
async function exportCsvFile(t, e) {
  if (Z.isNativePlatform()) {
    const n = await FilesystemPlugin.writeFile({
      path: e,
      data: "\uFEFF" + t,
      directory: FsDirectory.Cache,
      encoding: Zt.UTF8,
    });
    await SharePlugin.share({
      title: "Telemetria de gaxeta",
      files: [n.uri],
      dialogTitle: "Salvar ou compartilhar CSV",
    });
    return;
  }
  const r = URL.createObjectURL(
      new Blob(["\uFEFF", t], {
        type: "text/csv;charset=utf-8",
      }),
    ),
    s = document.createElement("a");
  ((s.href = r), (s.download = e), s.click(), setTimeout(() => URL.revokeObjectURL(r), 1e3));
}

// ---- 20-ble.js ----
// Bluetooth local (herdado do pacote publicado; nenhum comando é enviado sem ação do operador).
const BLE_SERVICE = "7a1e0001-9b3c-4d2e-8f10-123456789001",
  BLE_CHAR_READING = "7a1e0002-9b3c-4d2e-8f10-123456789001",
  BLE_CHAR_NAME = "7a1e0003-9b3c-4d2e-8f10-123456789001",
  bleDecode = (t) => new TextDecoder().decode(new Uint8Array(t.buffer, t.byteOffset, t.byteLength)),
  bleEncode = (t) => {
    const e = new TextEncoder().encode(t);
    return new DataView(e.buffer, e.byteOffset, e.byteLength);
  };
let bleInitialized = !1,
  bleDevice = null,
  bleTimer = null,
  bleOnReading = () => {},
  bleOnStatus = () => {},
  bleScanTimer = null,
  bleReading = !1;
async function bleInit() {
  bleInitialized ||
    (await BleClient.initialize({
      androidNeverForLocation: !0,
    }),
    (bleInitialized = !0));
}
const bleCurrent = () => bleDevice;
async function bleStopScan() {
  (clearTimeout(bleScanTimer), await BleClient.stopLEScan().catch(() => {}));
}
// O que impede a busca agora, se algo impede: permissão negada, Bluetooth desligado ou, no
// Android 11 e anteriores, a localização desligada (nessas versões a busca depende dela).
// Não inicia busca nem conexão.
async function blePrepare() {
  try {
    await bleInit();
  } catch (error) {
    const text = String(error?.message || error || "");
    return { ok: false, kind: /denied|permission|permiss/i.test(text) ? "denied" : "unavailable", message: text };
  }
  try {
    if (!(await BleClient.isEnabled())) return { ok: false, kind: "off" };
  } catch {}
  const android = /Android (\d+)/.exec(navigator.userAgent);
  if (Z.getPlatform() === "android" && android && Number(android[1]) <= 11) {
    try {
      if (!(await BleClient.isLocationEnabled())) return { ok: false, kind: "location" };
    } catch {}
  }
  return { ok: true };
}
async function bleScan(t, e, done = () => {}) {
  if ((await bleInit(), await bleStopScan(), !Z.isNativePlatform())) {
    const r = await BleClient.requestDevice({
      services: [BLE_SERVICE],
    });
    (t(r), e("Sensor selecionado. Toque em Conectar."));
    return;
  }
  (await BleClient.requestLEScan(
    {
      services: [BLE_SERVICE],
      allowDuplicates: !1,
    },
    (r) =>
      t({
        ...r.device,
        rssi: r.rssi,
      }),
  ),
    e("Buscando sensores próximos…"),
    (bleScanTimer = setTimeout(async () => {
      (await bleStopScan(), e("Busca concluída. Selecione um sensor ou busque novamente."), done());
    }, 8e3)));
}
function bleDropped() {
  (clearInterval(bleTimer),
    (bleTimer = null),
    (bleDevice = null),
    bleOnStatus("Bluetooth desconectado. A última leitura local foi preservada."));
}
async function bleDisconnect() {
  const t = bleDevice;
  (bleDropped(), t && (await BleClient.disconnect(t.deviceId).catch(() => {})));
}
async function bleConnect(t, e, r) {
  (await bleInit(),
    await bleStopScan(),
    await bleDisconnect(),
    (bleOnReading = e),
    (bleOnStatus = r),
    r("Conectando ao sensor…"),
    await BleClient.connect(t.deviceId, bleDropped, {
      timeout: 2e4,
    }),
    (bleDevice = t));
  try {
    (await bleReadOnce(),
      await BleClient.startNotifications(t.deviceId, BLE_SERVICE, BLE_CHAR_READING, (s) => {
        try {
          bleParse(s);
        } catch {
          // Pacote maior que o MTU acordado chega cortado: a leitura da característica vem inteira.
          bleReadOnce().catch(() => {});
        }
      }).catch(() => {}),
      (bleTimer = setInterval(() => bleReadOnce().catch(() => bleOnStatus("Falha na leitura local; tentando novamente.")), 5e3)),
      r("Bluetooth conectado. Leitura local a cada 5 segundos."));
  } catch (s) {
    throw (await bleDisconnect(), s);
  }
}
function bleParse(t) {
  const e = JSON.parse(bleDecode(t));
  if (typeof e != "object" || e === null) throw Error("Resposta BLE inválida.");
  bleOnReading(e, bleDevice);
}
async function bleReadOnce() {
  if (!(!bleDevice || bleReading)) {
    bleReading = !0;
    try {
      const t = bleDevice.deviceId,
        e = await BleClient.read(t, BLE_SERVICE, BLE_CHAR_READING);
      bleDevice?.deviceId === t && bleParse(e);
    } finally {
      bleReading = !1;
    }
  }
}
async function bleWriteName(t, e, r) {
  if (!bleDevice) throw Error("Conecte o sensor por Bluetooth.");
  if (!e || r !== e) throw Error("O sensor Bluetooth não corresponde ao sensor selecionado. Confira o ID.");
  if (!isValidSensorName(t)) throw Error("Nome inválido. Use de 3 a 24 caracteres sem acentos.");
  const s = bleDevice.deviceId;
  (Z.getPlatform() === "android" &&
    !(await BleClient.isBonded(s)) &&
    (await BleClient.createBond(s, {
      timeout: 3e4,
    })),
    await BleClient.read(s, BLE_SERVICE, BLE_CHAR_NAME, {
      timeout: 3e4,
    }),
    await BleClient.write(s, BLE_SERVICE, BLE_CHAR_NAME, bleEncode(t), {
      timeout: 1e4,
    }));
  for (let n = 0; n < 8; n++) {
    await new Promise((a) => setTimeout(a, 300));
    const i = bleDecode(await BleClient.read(s, BLE_SERVICE, BLE_CHAR_NAME));
    if (i === t) return i;
  }
  throw Error("A placa ainda não confirmou o nome. Confira o PIN e tente novamente.");
}
async function bleIdentify() {
  if (!bleDevice) throw Error("Conecte um sensor.");
  (Z.getPlatform() === "android" &&
    !(await BleClient.isBonded(bleDevice.deviceId)) &&
    (await BleClient.createBond(bleDevice.deviceId, {
      timeout: 3e4,
    })),
    await BleClient.read(bleDevice.deviceId, BLE_SERVICE, BLE_CHAR_NAME, {
      timeout: 3e4,
    }),
    await BleClient.write(bleDevice.deviceId, BLE_SERVICE, BLE_CHAR_NAME, bleEncode("identify")));
}

// ---- 40-shell.js ----
// =============================================================================
// Casca da aplicação: estado, mensagens, permissões, navegação e atualização.
// =============================================================================
const state = {
  clockOffset: 0,
  devices: [], // sensores conhecidos nesta sessão (página atual e sensor selecionado)
  assets: [], // cache dos ativos já carregados (a árvore é lida por ramo, sob demanda)
  sensorId: "",
  assetId: "",
  page: "sensors",
  manualReturn: "sensors", // tela de origem do Manual aberto dentro da aplicação
  authorized: false,
  loading: false,
  timer: null,
  authRequest: 0,
  bleReading: null,
  bleDevice: null,
  ctx: null, // resposta de gaxeta_my_context()
  userId: null,
  lastContextCheck: 0,
  sensors: { search: "", filter: "all", offset: 0, total: 0, ids: [], request: 0 },
  drawer: { open: false, mode: "detail", sensorId: "", opener: null },
  live: new Map(), // leitura elétrica atual e cadência por sensor (gaxeta_telemetry_summary)
  liveMissing: false, // o banco ainda não tem o resumo de telemetria (migração 12 não aplicada)
  mag: new Map(), // estado magnético por sensor (gaxeta_mag_summary): ângulo, saúde, referência e curso restante
  magMissing: false, // o banco ainda não tem o contrato magnético (migração 14 não aplicada)
  magRequests: new Map(), // sensor → solicitação de engaxetamento em envio (mesmo identificador nas novas tentativas)
};
const assetIndex = new Map();
// Tipo de equipamento por TAG (id do ativo → chave do catálogo; null = não informado).
const equipTypeIndex = new Map();
let equipTypesMissing = false; // a tabela da ficha ainda não existe no banco (migração não aplicada)

// Cadência de cada sensor: a medida nos últimos envios (resumo de telemetria) ou, sem ela, a
// declarada pelo firmware no sufixo da versão (-cont30, -hib180). É ela que decide o indicador
// de conexão, de modo que placa de 180 s não aparece como atrasada entre dois envios.
const deviceInterval = (device) => {
  const measured = Number(state.live.get(device.sensor_id)?.interval_s);
  return Number.isFinite(measured) && measured > 0 ? measured : firmwareCadence(device.firmware_version)?.seconds ?? null;
};
const deviceStatus = (device) => connectionStatus(device, Date.now() + state.clockOffset, deviceInterval(device));
const deviceLive = (device) => state.live.get(device?.sensor_id) || null;
const deviceMag = (device) => state.mag.get(device?.sensor_id) || null;
// Um único ponto decide o que cada tela mostra: sensor magnético nunca passa pela leitura elétrica.
const deviceView = (device) => (isMagnetic(device, deviceLive(device)) ? magView(device, deviceMag(device)) : electricView(device, deviceLive(device)));
const currentDevice = () => state.devices.find((device) => device.sensor_id === state.sensorId);
const findDevice = (sensorId) => state.devices.find((device) => device.sensor_id === sensorId);
// O TAG é o identificador do equipamento: o código gravado em `tag`, ou o nome nos registros antigos.
const equipTag = (asset) => asset?.tag || asset?.name || "—";
const assetLabel = (asset) =>
  !asset ? "—" : asset.kind === "equipment" ? equipTag(asset) : asset.tag && asset.tag !== asset.name ? `${asset.name} · ${asset.tag}` : asset.name;
const assetName = (id) => assetIndex.get(id)?.name || "—";
const assetPathLabel = (id) => assetPath(id, state.assets).map(assetLabel).join(" / ");
const equipTypeLabel = (id) => equipCatalog.get(equipTypeIndex.get(id)) || "";
const deviceLabel = (device) =>
  device.desired_label || device.applied_label || (device.label === "Sensor de gaxeta" ? device.sensor_id : device.label) || device.sensor_id;

// Identidade de um sensor para leitura rápida: TAG · tipo na frente, sensor e spot como contexto.
// O caminho completo continua disponível (dica do título e painel de Detalhes).
function deviceIdentity(device) {
  const chain = device ? assetPath(device.measurement_point_id, state.assets) : [];
  const pick = (kind) => chain.find((asset) => asset.kind === kind);
  const equip = pick("equipment");
  const point = pick("point");
  const sensor = device ? deviceLabel(device) : "";
  if (!equip || !point) return { linked: false, sensor, tag: "", type: "", spot: "", title: sensor || "Sensor", context: "", path: "" };
  const tag = equipTag(equip);
  const type = equipTypeLabel(equip.id);
  return {
    linked: true,
    sensor,
    tag,
    type,
    spot: point.name,
    title: `${tag} · ${type || TYPE_UNKNOWN}`,
    context: [pick("company")?.name, pick("area")?.name].filter(Boolean).join(" / "),
    path: chain.map(assetLabel).join(" / "),
  };
}

const myRole = () => state.ctx?.role || null;
const hasCap = (name) => !!state.ctx?.capabilities?.[name];
const isAdminWriter = () => myRole() === "adm1" || myRole() === "adm2";

// ----- Mensagens -----
let messageTimer = null;
function showMessage(text, kind = "info") {
  const box = $id("globalMessage");
  clearTimeout(messageTimer);
  box.textContent = text || "";
  box.className = "message " + kind;
  box.hidden = !text;
  if (text && kind !== "error") messageTimer = setTimeout(() => (box.hidden = true), 7000);
}
// Falha de transporte (sem rede, tempo esgotado no aparelho): só ela muda o indicador de conexão.
const isNetworkError = (error) =>
  error?.name === "AbortError" || /Failed to fetch|NetworkError|Load failed|network request failed/i.test(error?.message || String(error || ""));
function errorText(error) {
  const message = error?.message || String(error || "");
  if (isNetworkError(error)) return "Não foi possível conectar. Verifique sua conexão e tente de novo.";
  if (error?.code === "42501") return "Sua conta não tem permissão para esta operação.";
  if (error?.code === "23505") {
    if (/gateway|identifier/i.test(message + (error.details || ""))) return "Já existe um gateway com esta identificação.";
    if (/e-mail|email/i.test(message)) return message;
    return "Este spot já tem um sensor, ou o sensor já está em outro spot. Desfaça o vínculo atual antes.";
  }
  if (error?.code === "23503") return message || "Este cadastro possui dependências e não pode ser alterado.";
  if (error?.code === "57014") return "A consulta demorou demais. Reduza o período e tente de novo.";
  return message;
}
async function withBusy(button, task) {
  if (button?.disabled) return;
  if (button) button.disabled = true;
  try {
    await task();
  } catch (error) {
    showMessage(errorText(error), "error");
  } finally {
    if (button) button.disabled = false;
  }
}
function fillSelect(select, options, placeholder, value = "") {
  select.replaceChildren();
  if (placeholder !== null) select.add(new Option(placeholder, ""));
  for (const option of options) select.add(new Option(option.label, option.value));
  select.value = value;
  if (select.value !== value) select.value = "";
}
const debounce = (task, wait = 300) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => task(...args), wait);
  };
};

// Confirmação na própria página (sem caixas nativas do navegador).
function askConfirm({ title, html, okLabel = "Confirmar", allowOk = true, danger = true }) {
  const dialog = $id("confirmDialog");
  $id("confirmTitle").textContent = title;
  $id("confirmBody").innerHTML = html;
  const ok = $id("confirmOk");
  ok.textContent = okLabel;
  ok.hidden = !allowOk;
  ok.className = danger ? "danger" : "primary";
  dialog.returnValue = "cancel";
  dialog.showModal();
  return new Promise((resolve) => dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true }));
}

// ----- Cache de ativos e sensores -----
function rememberAssets(rows) {
  for (const row of rows || []) assetIndex.set(row.id, { ...assetIndex.get(row.id), ...row });
  state.assets = [...assetIndex.values()];
}
function forgetAsset(id) {
  assetIndex.delete(id);
  state.assets = [...assetIndex.values()];
}
// Garante no cache os ativos indicados e seus ancestrais (duas consultas no máximo) e,
// para os TAGs envolvidos, o tipo de equipamento (uma consulta, só para os ainda não lidos).
async function ensureAssets(ids) {
  const fetchRows = async (wanted) => {
    const rows = [];
    for (let i = 0; i < wanted.length; i += 80)
      rows.push(
        ...(await unwrap(
          sb.from("gaxeta_assets").select("id,parent_id,kind,name,tag,position,path,corporation_id").in("id", wanted.slice(i, i + 80)),
        )),
      );
    rememberAssets(rows);
    return rows;
  };
  const wantedIds = [...new Set(ids.filter(Boolean))];
  const missing = wantedIds.filter((id) => !assetIndex.get(id)?.path);
  if (missing.length) {
    const rows = await fetchRows(missing);
    const ancestors = [...new Set(rows.flatMap((row) => row.path || []))].filter((id) => !assetIndex.has(id));
    if (ancestors.length) await fetchRows(ancestors);
  }
  await ensureEquipTypes(
    wantedIds.flatMap((id) => assetIndex.get(id)?.path || []).filter((id) => assetIndex.get(id)?.kind === "equipment"),
  );
}
async function ensureEquipTypes(ids) {
  const wanted = [...new Set(ids)].filter((id) => id && !equipTypeIndex.has(id));
  if (!wanted.length || equipTypesMissing) return;
  try {
    const rows = [];
    for (let i = 0; i < wanted.length; i += 80)
      rows.push(...(await unwrap(sb.from("gaxeta_equipment_details").select("asset_id,equipment_type").in("asset_id", wanted.slice(i, i + 80)))));
    for (const id of wanted) equipTypeIndex.set(id, null);
    for (const row of rows) equipTypeIndex.set(row.asset_id, row.equipment_type || null);
  } catch (error) {
    // O tipo é complemento da tela: sem ele, o TAG aparece com "Tipo não informado".
    if (error?.code === "42P01" || error?.code === "PGRST205") equipTypesMissing = true;
  }
}
async function loadEquipCatalog() {
  const rows = await unwrap(sb.from("gaxeta_equipment_types").select("key,label").order("sort_order"));
  if (!rows.length) return;
  equipCatalog.clear();
  for (const row of rows) equipCatalog.set(row.key, row.label);
}
function mergeDevices(rows) {
  const byId = new Map(state.devices.map((device) => [device.sensor_id, device]));
  for (const row of rows || []) {
    // Guarda a leitura anterior quando chega um envio novo: a tela mostra a variação bruta entre
    // dois envios (o movimento pequeno que a linha estabilizada de 5 p.p. não mostra).
    const before = byId.get(row.sensor_id);
    row.prev =
      before && (before.last_sequence !== row.last_sequence || before.last_received_at !== row.last_received_at)
        ? { percent: before.last_percent, voltage_mv: before.last_voltage_mv, adc: before.last_adc_raw, received_at: before.last_received_at }
        : before?.prev || null;
    byId.set(row.sensor_id, row);
  }
  state.devices = [...byId.values()];
}
// Variação bruta entre o envio anterior e o atual (posição elétrica, tensão calibrada e ADC).
function rawDeltaText(device) {
  const prev = device?.prev;
  if (!prev || device.last_percent == null || prev.percent == null) return "";
  const signed = (value, digits, unit) => (value > 0 ? "+" : value < 0 ? "−" : "") + fmtNum(Math.abs(value), digits) + unit;
  const parts = [signed(Number(device.last_percent) - Number(prev.percent), 2, " p.p.")];
  if (device.last_voltage_mv != null && prev.voltage_mv != null) parts.push(signed(Number(device.last_voltage_mv) - Number(prev.voltage_mv), 0, " mV"));
  if (device.last_adc_raw != null && prev.adc != null) parts.push(signed(Number(device.last_adc_raw) - Number(prev.adc), 1, " contagens"));
  return parts.join(" · ");
}
function setServerTime(serverTime, observedAt) {
  if (serverTime) state.clockOffset = new Date(serverTime).getTime() - observedAt;
}
// Leitura elétrica atual e cadência dos sensores indicados (uma chamada para todos). É só
// telemetria: não consulta nem cria ciclo, referência ou perfil de gaxeta.
async function loadTelemetrySummary(ids) {
  const wanted = [...new Set((ids || []).filter(Boolean))];
  if (!wanted.length || state.liveMissing) return;
  try {
    const result = await callRpc("gaxeta_telemetry_summary", { p_sensor_ids: wanted });
    for (const id of wanted) state.live.delete(id);
    for (const item of result.items || []) state.live.set(item.sensor_id, item);
  } catch (error) {
    // Banco sem a migração 12: a tela segue só com os campos do sensor e a cadência do firmware.
    if (isMissingFeature(error)) state.liveMissing = true;
    else throw error;
  }
  await loadMagSummary(wanted);
}
// Estado magnético dos sensores AS5600 entre os indicados (uma chamada para todos, só quando há algum).
async function loadMagSummary(ids) {
  const magnetic = ids.filter((id) => isMagnetic(findDevice(id), state.live.get(id)));
  for (const id of ids) if (!magnetic.includes(id)) state.mag.delete(id);
  if (!magnetic.length || state.magMissing) return;
  try {
    const result = await callRpc("gaxeta_mag_summary", { p_sensor_ids: magnetic });
    for (const id of magnetic) state.mag.delete(id);
    for (const item of result.items || []) state.mag.set(item.sensor_id, item);
  } catch (error) {
    // Banco sem a migração 14: o cartão segue com ângulo e saúde dos campos do sensor.
    if (isMissingFeature(error)) state.magMissing = true;
    else throw error;
  }
}
// Atualiza só os sensores em uso (selecionado e painel aberto): uma chamada por ciclo.
async function refreshKnownDevices() {
  const ids = [...new Set([state.sensorId, state.drawer.open ? state.drawer.sensorId : ""].filter(Boolean))];
  if (!ids.length) return;
  const startedAt = Date.now();
  const [result] = await Promise.all([callRpc("gaxeta_devices_status", { p_sensor_ids: ids }), loadTelemetrySummary(ids)]);
  setServerTime(result.server_time, startedAt);
  mergeDevices(result.devices);
  if (state.sensorId && !result.devices.some((device) => device.sensor_id === state.sensorId) && state.page === "telemetry") {
    // O sensor saiu do escopo de quem está logado (vínculo ou acesso alterado).
    state.devices = state.devices.filter((device) => device.sensor_id !== state.sensorId);
    state.sensorId = "";
    resetTelemetryData();
  }
}

// ----- Permissões na interface (o servidor decide; aqui só se evita oferecer o que será negado) -----
function applyPermissions() {
  const users = hasCap("manage_users");
  document.querySelectorAll(".needs-users").forEach((element) => (element.hidden = !users));
  $id("userName").textContent = state.ctx?.display_name || "";
  $id("userRole").textContent = ROLE_LABEL[myRole()] || "";
  $id("statusFilter").querySelector('[value="unassigned"]').hidden = !(myRole() || "").startsWith("adm");
}
async function checkContext() {
  const context = await callRpc("gaxeta_my_context");
  state.lastContextCheck = Date.now();
  if (!context?.role) {
    await leaveApp("Seu acesso foi alterado ou removido. Fale com o responsável pela operação.");
    return false;
  }
  state.ctx = context;
  applyPermissions();
  return true;
}

// ----- Voltar (botão do Android e do navegador) -----
// Cada camada aberta por cima da tela (árvore em tela cheia, painel do sensor, diálogo) deixa
// uma entrada no histórico. Voltar fecha a camada de cima em vez de sair da tela ou do aplicativo.
// O código nunca chama history.back() por conta própria fora de um Voltar de quem está usando:
// uma camada fechada pelo próprio botão deixa a entrada "morta" no topo (backStale), que é
// reaproveitada pela próxima camada ou pulada no próximo Voltar.
const backLayers = [];
let backStale = false;
function pushBackLayer(name, close) {
  if (backLayers.some((layer) => layer.name === name)) return;
  backLayers.push({ name, close });
  history[backStale ? "replaceState" : "pushState"]({ layer: name }, "");
  backStale = false;
}
function dropBackLayer(name) {
  const index = backLayers.findIndex((layer) => layer.name === name);
  if (index < 0) return;
  if (index === backLayers.length - 1) backStale = true;
  backLayers.splice(index, 1);
}
window.addEventListener("popstate", (event) => {
  // Saiu de uma entrada morta: este Voltar ainda não fez nada visível. Repete-o na entrada viva.
  if (backStale) {
    backStale = false;
    return void history.back();
  }
  const layer = backLayers.pop();
  if (layer) layer.close();
  const landed = event.state?.layer;
  backStale = !!landed && !backLayers.some((item) => item.name === landed);
});
// Diálogos: qualquer um que abra entra na pilha, e sai dela ao fechar.
new MutationObserver((changes) => {
  for (const change of changes) {
    const dialog = change.target;
    if (dialog.tagName !== "DIALOG") continue;
    if (dialog.open) pushBackLayer("dialog:" + dialog.id, () => dialog.close());
    else dropBackLayer("dialog:" + dialog.id);
  }
}).observe(document.body, { attributes: true, attributeFilter: ["open"], subtree: true });

// ----- Navegação -----
const PAGE_TITLES = { sensors: "Sensores", assets: "Árvore de ativos", telemetry: "Telemetria", gateways: "Gateways", users: "Usuários", manual: "Manual de operação" };
function renderPageActions() {
  const actions = [];
  // Bluetooth: só no aplicativo nativo e só por toque. Na web, a busca da lista encontra por nome, TAG, ID ou MAC.
  if (state.page === "sensors" && bleAvailable())
    actions.push('<button class="primary compact" data-action="find-sensor" title="Procura as placas próximas pelo Bluetooth do celular">' + icon("bluetooth-searching") + "Buscar sensor por Bluetooth</button>");
  // A estrutura de ativos é administrada na web (qualquer largura de janela).
  if (state.page === "assets" && hasCap("manage_corporations") && !isNativeApp())
    actions.push('<button class="primary compact" data-action="new-corporation">' + icon("plus") + "Nova corporação</button>");
  if (state.page === "gateways" && hasCap("manage_gateways"))
    actions.push('<button class="primary compact" data-action="new-gateway">' + icon("plus") + "Cadastrar gateway</button>");
  if (state.page === "users" && hasCap("manage_users"))
    actions.push('<button class="primary compact" data-action="new-user">' + icon("plus") + "Novo usuário</button>");
  if (state.page === "manual")
    actions.push(`<button class="secondary compact" data-action="manual-back">${glyph("back")}Voltar para ${esc(PAGE_TITLES[state.manualReturn] || "Sensores")}</button>`);
  $id("pageActions").innerHTML = actions.join("");
}
function showPage(page) {
  if (!PAGE_TITLES[page] || (page === "users" && !hasCap("manage_users"))) page = "sensors";
  // O Manual abre dentro da aplicação: guarda a tela de origem para o Voltar (sessão e seleção intactas).
  if (page === "manual" && state.page !== "manual") state.manualReturn = state.page;
  // Bluetooth nunca fica aberto de uma tela para outra, nem abre sozinho.
  closeBleDialog();
  const changed = state.page !== page;
  state.page = page;
  // No aplicativo, cada troca de tela fica no histórico: o botão Voltar do Android volta à tela
  // anterior em vez de sair. No navegador o endereço é só atualizado, como antes.
  if (location.hash.slice(1) !== page) {
    history[isNativeApp() && changed && state.authorized && !backStale ? "pushState" : "replaceState"](null, "", "#" + page);
    backStale = false;
  }
  document.body.dataset.page = page;
  $id("workspace").hidden = !["sensors", "assets"].includes(page);
  $id("sensorPane").hidden = page !== "sensors";
  $id("assetInspector").hidden = page !== "assets";
  $id("telemetryPage").hidden = page !== "telemetry";
  $id("gatewayPage").hidden = page !== "gateways";
  $id("usersPage").hidden = page !== "users";
  $id("manualPage").hidden = page !== "manual";
  $id("summary").hidden = page !== "sensors";
  $id("pageTitle").textContent = PAGE_TITLES[page];
  $id("userMenu").open = false;
  setTreeDrawer(false);
  for (const button of document.querySelectorAll("[data-page]")) {
    button.classList.toggle("active", button.dataset.page === page);
    button.setAttribute("aria-current", button.dataset.page === page ? "page" : "false");
  }
  renderPageActions();
  const fail = (error) => showMessage(errorText(error), "error");
  if (page === "sensors") loadSensors().catch(fail);
  if (page === "assets") renderInspector().catch(fail);
  if (page === "telemetry") openTelemetry().catch(fail);
  if (page === "gateways") loadGateways().catch(fail);
  if (page === "users") loadUsers().catch(fail);
  if (page === "manual") openManual().catch(fail);
  if (page === "sensors" || page === "assets") ensureTreeRoot().catch(fail);
  renderIcons();
}
function setConnection(ok) {
  $id("connection").textContent = ok ? "Conectado" : "Sem conexão";
  $id("connection").className = "connection " + (ok ? "ok" : "error");
}

// Atualização periódica. Não reabre painéis, não apaga edição e não mexe em filtros.
async function refreshData(manual = false) {
  if (!state.authorized || document.hidden) return;
  if (state.loading) {
    state.refreshPending = true;
    return;
  }
  state.loading = true;
  state.refreshPending = false;
  clearTimeout(state.timer);
  const session = state.authRequest;
  try {
    if (Date.now() - state.lastContextCheck > CONFIG.contextCheckMs && !(await checkContext())) return;
    if (session !== state.authRequest) return;
    if (state.page === "sensors") await loadSensors({ quiet: true });
    else if (state.page === "telemetry") {
      // Leitura atual: leve, a cada ciclo. Histórico: consulta separada, no ritmo do período
      // exibido, sem competir com um pedido feito por quem está usando (ver 70-telemetry).
      await refreshKnownDevices();
      renderTelemetryLive();
      refreshHistoryIfDue();
    }
    if (state.drawer.open) {
      if (state.page !== "telemetry") await refreshKnownDevices();
      updateDrawerLive();
    }
    setConnection(true);
    $id("lastSync").textContent = `Última consulta ${fmtDateTime(new Date())}`;
  } catch (error) {
    if (error?.code === "42501") await checkContext().catch(() => {});
    else {
      // Só falha de transporte vira "Sem conexão"; erro de consulta é mostrado onde aconteceu.
      if (isNetworkError(error)) setConnection(false);
      if (manual || !isNetworkError(error)) showMessage(errorText(error), "error");
    }
  } finally {
    state.loading = false;
    if (state.authorized) state.timer = setTimeout(refreshData, state.refreshPending ? 0 : CONFIG.pollMs);
  }
}
const openSensorEditor = (sensorId) => openDrawer(sensorId, "detail");

// Limpa da tela e da memória tudo o que pertence à sessão encerrada.
function clearSessionData() {
  clearTimeout(state.timer);
  state.authorized = false;
  state.authRequest++;
  Object.assign(state, { devices: [], assets: [], sensorId: "", assetId: "", ctx: null, userId: null, manualReturn: "sensors" });
  resetTelemetryData();
  Object.assign(telem, { matchIds: null, listed: false, period: 36e5, custom: false, range: presetRange(36e5) });
  equipTypeIndex.clear();
  state.sensors = { search: "", filter: "all", offset: 0, total: 0, ids: [], request: 0 };
  state.live.clear();
  state.liveMissing = false;
  state.mag.clear();
  state.magMissing = false;
  state.magRequests.clear();
  assetIndex.clear();
  resetTree();
  closeDrawer(false);
  for (const id of ["sensorGrid", "tree", "assetInspector", "gatewayGrid", "userRows", "auditRows", "movementRows", "historyRows", "historyChart"])
    $id(id).replaceChildren();
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
}

// ---- 50-tree.js ----
// =============================================================================
// Árvore de ativos: carregada por ramo (gaxeta_assets_children), com paginação
// e busca no servidor (gaxeta_assets_search). Nunca baixa a árvore inteira.
// =============================================================================
const tree = { kids: new Map(), open: new Set(), searchRun: 0 };
const kidsKey = (parentId) => parentId || "root";
function resetTree() {
  tree.kids.clear();
  tree.open.clear();
  tree.searchRun++;
  if ($id("treeSearch")) $id("treeSearch").value = "";
  if ($id("treeResults")) $id("treeResults").hidden = true;
}
async function loadKids(parentId, { more = false, force = false } = {}) {
  const key = kidsKey(parentId);
  const known = tree.kids.get(key);
  if (known && !more && !force) return known;
  const offset = more && known ? known.ids.length : 0;
  const result = await callRpc("gaxeta_assets_children", { p_parent_id: parentId || null, p_limit: 100, p_offset: offset });
  rememberAssets(result.items);
  const ids = result.items.map((asset) => asset.id);
  const entry = { ids: more && known ? [...known.ids, ...ids.filter((id) => !known.ids.includes(id))] : ids, total: result.total };
  tree.kids.set(key, entry);
  if (parentId && assetIndex.has(parentId)) assetIndex.get(parentId).has_children = entry.total > 0;
  return entry;
}
async function ensureTreeRoot() {
  await loadKids(null);
  renderTree();
  renderIcons();
}
// Próxima criação por nível selecionado (a mesma regra vale no gatilho do servidor):
//   raiz → Corporação · Corporação → Empresa · Empresa → Área · Área → TAG ou Subárea ·
//   Subárea → TAG · TAG → Spot · Spot → vínculo de sensor existente.
// A estrutura é administrada na web: no aplicativo nativo a árvore serve para navegar e
// escolher o destino, sem criar nem editar níveis (o vínculo sensor → spot continua lá).
function allowedChildKinds(asset) {
  if (isNativeApp()) return [];
  const kinds = asset ? KIND_CHILDREN[asset.kind] || [] : ["corporation"];
  const role = myRole();
  return kinds.filter((kind) => {
    if (kind === "corporation") return role === "adm1";
    if (role === "adm1" || role === "adm2") return true;
    return role === "corp" && state.ctx.can_write && kind !== "company" && asset.access === "full";
  });
}
function canEditAsset(asset) {
  if (isNativeApp()) return false;
  const role = myRole();
  if (role === "adm1") return true;
  if (role === "adm2") return asset.kind !== "corporation";
  return role === "corp" && state.ctx.can_write && ["area", "subarea", "equipment", "point"].includes(asset.kind) && asset.access === "full";
}
// Valor ao lado do sensor na árvore: a posição elétrica do potenciômetro (leitura atual, em %).
function treeSensorValue(sensor) {
  const view = deviceView(sensor);
  // Modo bancada: "L2-956 · 67,83 % · Médio ajuste", com a origem simulada identificada. Leitura
  // atrasada aparece como última leitura válida, com o horário, e não como atual.
  if (view.bench) {
    const face = benchFace(sensor, view);
    return (
      `<span class="tree-sep">·</span><strong class="tree-electric tree-bench${face.stale ? " is-stale" : ""}" title="Posição de bancada: ${esc(view.label)} · ${esc(view.note)}">${face.has ? esc(view.value) + " %" : "—"}</strong>` +
      (face.has && view.sim ? `<span class="tree-sep">·</span>` + benchSimChip(view.sim) : !face.has ? `<span class="tree-sep">·</span><small class="tree-state">${esc(view.label)}</small>` : "") +
      `<small class="tree-bench-tag" title="Série de bancada: demonstração em mesa, não é curso de campo">${face.stale ? "bancada · última válida " + esc(fmtClock(face.at)) : "bancada"}</small>`
    );
  }
  // Sensor magnético: a árvore diz a série (bancada, curso estimado) e a faixa, além do número.
  const tag = view.bench ? " · bancada" : view.estimated ? " · estimado" : "";
  const band = view.magnetic && !view.bench && view.computed && MAG_BAND[view.band] ? ` ${MAG_BAND[view.band].label}` : view.magnetic && view.value === "—" ? ` ${view.label}` : "";
  return `<strong class="tree-electric health-${esc(view.key)}" title="${esc(view.kicker || "Posição elétrica")}: ${esc(view.label)} · ${esc(view.note)}">${esc(view.value)}${esc(view.unit || "")}<small>${esc(band + tag)}</small></strong>`;
}
function treeBranch(parentId) {
  const entry = tree.kids.get(kidsKey(parentId));
  if (!entry) return "";
  let html = '<ul role="group">';
  for (const id of entry.ids) {
    const asset = assetIndex.get(id);
    if (!asset) continue;
    const open = tree.open.has(id);
    const selected = state.assetId === id;
    const label = assetLabel(asset);
    const sensor = asset.kind === "point" ? state.devices.find((device) => device.measurement_point_id === id) : null;
    const addKinds = allowedChildKinds(asset).map((kind) => KIND_LABEL[kind]).join(" ou ");
    html +=
      `<li role="treeitem" class="kind-${asset.kind}" aria-selected="${selected}"${asset.has_children ? ` aria-expanded="${open}"` : ""}>` +
      `<div class="tree-row${selected ? " selected" : ""}${asset.access === "path" ? " path-only" : ""}">` +
      // Expandir e selecionar são ações separadas: a seta abre o ramo, o nome seleciona.
      `<button class="tree-toggle" data-toggle="${id}" aria-label="${open ? "Recolher" : "Expandir"} ${esc(label)}"${asset.has_children ? "" : " disabled"}>${asset.has_children ? glyph(open ? "chevron-down" : "chevron-right") : ""}</button>` +
      `<button class="tree-node" data-asset="${id}" title="${esc(KIND_LABEL[asset.kind] + ": " + label)}">${kindIcon(asset.kind)}<span><small>${KIND_LABEL[asset.kind]}</small>${esc(label)}</span></button>` +
      (addKinds
        ? `<button class="tree-action" data-add-child="${id}" aria-label="Adicionar ${esc(addKinds)} em ${esc(label)}" title="Adicionar ${esc(addKinds)}">+</button>`
        : "") +
      "</div>" +
      (sensor
        ? `<button class="tree-sensor" data-tree-sensor="${esc(sensor.sensor_id)}">${icon("radio")}<span class="tree-sensor-name">${esc(deviceLabel(sensor))}</span> ${treeSensorValue(sensor)}</button>`
        : "") +
      (open ? treeBranch(id) : "") +
      "</li>";
  }
  if (entry.total > entry.ids.length)
    html += `<li><button class="tree-more" data-more="${parentId || ""}">Carregar mais (${entry.total - entry.ids.length} restantes)</button></li>`;
  return html + "</ul>";
}
// Telefone: caminho resumido do que está selecionado, ao lado do seletor "Árvore de ativos".
function renderTreePick() {
  const box = $id("treePickPath");
  if (!box) return;
  const asset = assetIndex.get(state.assetId);
  const names = asset ? assetPath(state.assetId, state.assets).map(assetLabel) : [];
  box.querySelector("small").textContent = asset ? KIND_LABEL[asset.kind] + " selecionado" : state.page === "assets" ? "Nenhum nível selecionado" : "Mostrando";
  box.querySelector("b").textContent = asset ? (names.length > 3 ? "… / " + names.slice(-3).join(" / ") : names.join(" / ") || assetLabel(asset)) : state.page === "assets" ? "Toque para escolher na árvore" : "Todos os ativos";
  box.title = names.join(" / ");
  $id("treeDone").textContent = asset ? `Ver ${KIND_LABEL[asset.kind]}: ${assetLabel(asset)}` : "Fechar a árvore";
}
function renderTree() {
  renderTreePick();
  const root = tree.kids.get("root");
  const box = $id("tree");
  if (!root) {
    box.innerHTML = '<div class="tree-empty">Carregando…</div>';
    return;
  }
  if (!root.ids.length) {
    box.innerHTML =
      myRole() === "adm1"
        ? '<div class="tree-empty"><strong>Nenhuma corporação cadastrada.</strong><p>Comece pela corporação; depois empresa, área, TAG e spot. A subárea é opcional.</p>' +
          (isNativeApp() ? "<p>A estrutura de ativos é criada na versão web.</p>" : '<button class="secondary compact" data-add-child="">Criar corporação</button>') +
          "</div>"
        : '<div class="tree-empty"><strong>Nenhum ativo disponível.</strong><p>Sua conta ainda não tem ramos concedidos, ou a estrutura não foi cadastrada.</p></div>';
    return;
  }
  box.innerHTML = treeBranch(null);
}
async function selectAsset(id) {
  state.assetId = id || "";
  renderTree();
  if (state.page === "sensors") {
    state.sensors.offset = 0;
    await loadSensors();
    setTreeDrawer(false);
  } else if (state.page === "assets") {
    const asset = assetIndex.get(state.assetId);
    if (isNarrow() && asset && !["equipment", "point"].includes(asset.kind)) {
      // Telefone, nível acima do TAG: a árvore continua aberta e o ramo se abre, para seguir descendo.
      if (asset.has_children && !tree.open.has(asset.id)) {
        tree.open.add(asset.id);
        await loadKids(asset.id).catch(() => {});
        renderTree();
      }
    } else if (isNarrow()) setTreeDrawer(false); // TAG ou spot: volta para a ficha, com o caminho resumido
    await renderInspector();
  }
  renderIcons();
}
// Abre os ancestrais de um ativo e o deixa visível na árvore.
async function revealAsset(id) {
  await ensureAssets([id]);
  const asset = assetIndex.get(id);
  if (!asset) return;
  await loadKids(null);
  for (const ancestorId of (asset.path || []).slice(0, -1)) {
    await loadKids(ancestorId);
    tree.open.add(ancestorId);
  }
  const entry = tree.kids.get(kidsKey(asset.parent_id));
  if (entry && !entry.ids.includes(id)) entry.ids.push(id);
}
// Árvore por cima do conteúdo (telefone). Ramos abertos, seleção e busca ficam como estavam.
function setTreeDrawer(open) {
  const was = document.body.classList.contains("tree-open");
  document.body.classList.toggle("tree-open", !!open);
  $id("treePickOpen")?.setAttribute("aria-expanded", String(!!open));
  if (open && !was && isNarrow()) pushBackLayer("tree", () => setTreeDrawer(false));
  if (!open && was) dropBackLayer("tree");
}

$id("tree").onclick = async (event) => {
  const pick = (name) => event.target.closest(`[data-${name}]`);
  try {
    if (pick("tree-sensor")) {
      openHistoryFor(pick("tree-sensor").dataset.treeSensor);
    } else if (pick("add-child")) {
      await openAssetForm({ parentId: pick("add-child").dataset.addChild || null });
    } else if (pick("more")) {
      await loadKids(pick("more").dataset.more || null, { more: true });
      renderTree();
      renderIcons();
    } else if (pick("toggle")) {
      const id = pick("toggle").dataset.toggle;
      if (tree.open.has(id)) tree.open.delete(id);
      else {
        tree.open.add(id);
        await loadKids(id);
      }
      renderTree();
      renderIcons();
      $id("tree").querySelector(`[data-toggle="${id}"]`)?.focus();
    } else if (pick("asset")) {
      await selectAsset(pick("asset").dataset.asset);
    }
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
$id("clearAsset").onclick = () => selectAsset("").catch((error) => showMessage(errorText(error), "error"));
// Recolhe e reabre a árvore sem tocar em seleção, ramos abertos, busca ou filtro da lista.
$id("toggleTree").onclick = () => {
  if (isNarrow()) {
    const open = !document.body.classList.contains("tree-open");
    setTreeDrawer(open);
    $id("toggleTree").setAttribute("aria-expanded", String(open));
  } else {
    const collapsed = document.body.classList.toggle("tree-collapsed");
    $id("toggleTree").setAttribute("aria-expanded", String(!collapsed));
  }
};
$id("closeTree").onclick = () => setTreeDrawer(false);
$id("treeDone").onclick = () => setTreeDrawer(false);
$id("treePickOpen").onclick = $id("treePickPath").onclick = () => {
  setTreeDrawer(true);
  ensureTreeRoot().catch((error) => showMessage(errorText(error), "error"));
};

// Busca por nome ou TAG, no servidor, dentro do que a conta pode ver.
$id("treeSearch").oninput = debounce(async () => {
  const query = $id("treeSearch").value.trim();
  const box = $id("treeResults");
  const run = ++tree.searchRun;
  if (query.length < 2) {
    box.hidden = true;
    return;
  }
  try {
    const rows = await callRpc("gaxeta_assets_search", { p_query: query, p_limit: 30 });
    if (run !== tree.searchRun) return;
    box.hidden = false;
    box.innerHTML = rows.length
      ? rows
          .map(
            (row) =>
              `<button data-result="${row.id}"><small>${KIND_LABEL[row.kind]}</small><strong>${esc(assetLabel(row))}</strong><span>${esc((row.path_names || []).slice(0, -1).join(" / "))}</span></button>`,
          )
          .join("")
      : '<p class="tree-empty">Nenhum ativo encontrado.</p>';
  } catch (error) {
    showMessage(errorText(error), "error");
  }
}, 300);
$id("treeResults").onclick = async (event) => {
  const button = event.target.closest("[data-result]");
  if (!button) return;
  try {
    await revealAsset(button.dataset.result);
    $id("treeResults").hidden = true;
    $id("treeSearch").value = "";
    await selectAsset(button.dataset.result);
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};

// ---- 60-sensors.js ----
// =============================================================================
// Sensores: lista paginada por ramo (gaxeta_devices_page) e painel lateral, que
// só abre por Detalhes ou Editar e não é redesenhado pela atualização periódica.
// =============================================================================
function canEditDevice(device) {
  if (isAdminWriter()) return true;
  return myRole() === "corp" && state.ctx.can_write && !!device.measurement_point_id;
}
async function loadSensors({ quiet = false } = {}) {
  const view = state.sensors;
  const run = ++view.request;
  const startedAt = Date.now();
  if (!quiet && !view.ids.length) $id("sensorGrid").innerHTML = '<div class="empty-state"><p>Carregando sensores…</p></div>';
  const onlineSince = new Date(startedAt + state.clockOffset - 25000).toISOString();
  const [page, online] = await Promise.all([
    callRpc("gaxeta_devices_page", {
      p_asset_id: state.assetId || null,
      p_search: view.search || null,
      p_unlinked: view.filter === "unassigned",
      p_limit: CONFIG.pageSize,
      p_offset: view.offset,
    }),
    // Contagem geral de quem está transmitindo, respeitando o escopo da conta (sem baixar linhas).
    sb.from("gaxeta_devices").select("sensor_id", { count: "exact", head: true }).gte("last_received_at", onlineSince),
  ]);
  if (run !== view.request || !state.authorized) return;
  setServerTime(page.server_time, startedAt);
  mergeDevices(page.items);
  view.ids = page.items.map((device) => device.sensor_id);
  view.total = page.total;
  if (!view.ids.length && view.offset > 0) {
    view.offset = Math.max(0, view.offset - CONFIG.pageSize);
    return loadSensors({ quiet });
  }
  await Promise.all([ensureAssets(page.items.map((device) => device.measurement_point_id)), loadTelemetrySummary(view.ids)]);
  if (run !== view.request) return;
  if (!state.assetId && !view.search && view.filter === "all") {
    // Com todos os sensores na página, a contagem usa a cadência de cada um (placa que
    // hiberna conta como transmitindo dentro do próprio intervalo). Acima disso, vale a
    // contagem do servidor para os últimos 25 s.
    const onlineNow = page.total <= page.items.length ? page.items.filter((device) => deviceStatus(device).online).length : online.count;
    $id("sensorCount").textContent = page.total;
    $id("onlineCount").textContent = onlineNow ?? "—";
    $id("offlineCount").textContent = onlineNow == null ? "—" : Math.max(0, page.total - onlineNow);
    view.allTotal = page.total;
    view.allOnPage = page.total <= page.items.length;
  } else if (online.count != null && view.allTotal != null && !view.allOnPage) {
    $id("onlineCount").textContent = online.count;
    $id("offlineCount").textContent = Math.max(0, view.allTotal - online.count);
  }
  renderSensorGrid();
  if (quiet) renderTree();
  renderIcons();
}
function renderSensorGrid() {
  const view = state.sensors;
  const grid = $id("sensorGrid");
  // Preserva o foco de teclado através do redesenho periódico.
  const focusCard = document.activeElement?.closest?.("[data-card]")?.dataset.card;
  const focusAct = document.activeElement?.dataset?.act;
  let devices = view.ids.map(findDevice).filter(Boolean);
  if (view.filter === "online") devices = devices.filter((device) => deviceStatus(device).online);
  if (view.filter === "offline") devices = devices.filter((device) => !deviceStatus(device).online);
  $id("scopeTitle").textContent = state.assetId ? assetPathLabel(state.assetId) || assetName(state.assetId) : view.filter === "unassigned" ? "Fila de associação" : "Todos os sensores";
  const first = view.total ? view.offset + 1 : 0;
  const last = Math.min(view.offset + CONFIG.pageSize, view.total);
  $id("visibleCount").textContent = view.total ? `${first}–${last} de ${view.total}` : "";
  // Com um ramo da árvore selecionado, o caminho de volta para "todos" fica sempre à vista.
  $id("scopeClear").hidden = !state.assetId;
  grid.innerHTML =
    devices
      .map((device) => {
        const status = deviceStatus(device);
        // Um único número: a posição elétrica do potenciômetro (%), com a condição do sinal.
        const view = deviceView(device);
        // Identidade curta: TAG · tipo · spot. O caminho completo fica na dica e em Detalhes.
        const identity = deviceIdentity(device);
        const place = identity.linked ? `${identity.title} · ${identity.spot}` : "";
        // Tensão sempre com a origem: calibrada pelo ADC (firmware 4.3.0+) ou estimada.
        const volt = voltageInfo(device, deviceLive(device));
        const name = deviceLabel(device);
        // Sensor magnético: cartão próprio (curso restante ou ângulo; nunca tensão nem % do ADC).
        if (view.magnetic) return magCardHtml(device, view, status, identity, place, name);
        return (
          `<article class="sensor-card health-${view.key}" data-card="${esc(device.sensor_id)}">` +
          `<header><strong title="${esc(name)}">${esc(name)}</strong><span class="conn"><i class="dot ${status.className}"></i><span>${esc(status.label)}</span></span></header>` +
          `<p class="card-path${place ? "" : " unlinked"}" title="${esc(identity.path || "Sensor ainda não associado a um spot")}">${esc(place || "Sem vínculo · fila de associação")}</p>` +
          `<div class="card-main"><div class="card-value" title="Posição elétrica do potenciômetro: leitura atual, em % da ${esc(scaleText(view.electric.scale))}">${view.value}<small>${view.unit}</small></div>` +
          `<div class="card-side"><span class="card-kicker">Posição elétrica</span><span class="adjustment-badge">${esc(view.label)}</span><small title="${esc(view.note)}">${esc(view.note)}</small></div></div>` +
          `<div class="mini-scale${view.scale == null ? " idle" : ""}" role="img" aria-label="Posição elétrica: ${esc(view.value)} ${view.unit}"><i style="width:${view.scale ?? 0}%"></i></div>` +
          `<div class="card-meta"><span class="volt" title="${esc(volt.title)}">Tensão ${esc(volt.text)}${volt.short ? `<small>${esc(volt.short)}</small>` : ""}</span>` +
          `<span title="Linha estabilizada: só muda com variação de 5 pontos percentuais ou mais">Estável ${fmtNum(device.stable_percent)} %</span>` +
          `<span title="Última leitura recebida">${fmtDateTime(device.last_received_at)}</span></div>` +
          `<footer><button data-act="history">Histórico</button><button data-act="detail">Detalhes</button>` +
          (canEditDevice(device) ? `<button data-act="edit">Editar</button>` : "") +
          `</footer></article>`
        );
      })
      .join("") ||
    `<div class="empty-state"><h3>Nenhum sensor nesta seleção</h3><p>${
      view.filter === "online" || view.filter === "offline"
        ? "O filtro de conexão vale para os sensores desta página."
        : state.assetId
          ? "Este ramo ainda não tem sensor vinculado a um spot."
          : "Nenhum sensor disponível para a sua conta."
    }</p>${state.assetId || view.search || view.filter !== "all" ? '<button class="secondary compact" id="showAllSensors">Mostrar todos</button>' : ""}</div>`;
  $id("sensorPager").innerHTML =
    view.total > CONFIG.pageSize
      ? `<button class="secondary compact" data-page-move="-1"${view.offset ? "" : " disabled"}>Anterior</button><span>${first}–${last} de ${view.total}</span><button class="secondary compact" data-page-move="1"${last < view.total ? "" : " disabled"}>Próxima</button>`
      : "";
  if (focusCard) grid.querySelector(`[data-card="${CSS.escape(focusCard)}"] [data-act="${focusAct || "detail"}"]`)?.focus({ preventScroll: true });
}
$id("sensorGrid").onclick = (event) => {
  if (event.target.closest("#showAllSensors")) {
    state.assetId = "";
    state.sensors.search = $id("sensorSearch").value = "";
    state.sensors.filter = $id("statusFilter").value = "all";
    state.sensors.offset = 0;
    renderTree();
    loadSensors().catch((error) => showMessage(errorText(error), "error"));
    return;
  }
  const button = event.target.closest("[data-act]");
  const sensorId = event.target.closest("[data-card]")?.dataset.card;
  if (!button || !sensorId) return;
  if (button.dataset.act === "history") openHistoryFor(sensorId);
  else if (button.dataset.act === "setup") openMagSetup(sensorId).catch((error) => showMessage(errorText(error), "error"));
  else openDrawer(sensorId, button.dataset.act, button);
};
$id("sensorPager").onclick = (event) => {
  const move = event.target.closest("[data-page-move]");
  if (!move) return;
  state.sensors.offset = Math.max(0, state.sensors.offset + Number(move.dataset.pageMove) * CONFIG.pageSize);
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
};
$id("sensorSearch").oninput = debounce(() => {
  state.sensors.search = $id("sensorSearch").value.trim();
  state.sensors.offset = 0;
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
}, 350);
// Sai do recorte da árvore: todos os sensores do escopo da conta, inclusive os sem spot.
function clearSensorScope() {
  state.assetId = "";
  state.sensors.offset = 0;
  renderTree();
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
}
$id("statusFilter").onchange = () => {
  state.sensors.filter = $id("statusFilter").value;
  state.sensors.offset = 0;
  // "Todos" é todos mesmo: escolher essa opção com um ramo selecionado desfaz o recorte.
  if (state.sensors.filter === "all" && state.assetId) return clearSensorScope();
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
};
$id("scopeClear").onclick = () => clearSensorScope();

// ----- Seletor de localização em cascata (lê cada nível sob demanda) -----
const PICK_LEVELS = ["corporation", "company", "area", "subarea", "equipment", "point"];
const PICK_PLACEHOLDER = {
  corporation: "Selecione a corporação",
  company: "Selecione a empresa",
  area: "Selecione a área",
  subarea: "Sem subárea · TAGs da área",
  equipment: "Selecione o TAG",
  point: "Selecione o spot",
};
function pickParent(level, values) {
  if (level === "corporation") return null;
  if (level === "company") return values.corporation;
  if (level === "area") return values.company;
  if (level === "subarea") return values.area;
  if (level === "equipment") return values.subarea || values.area;
  return values.equipment;
}
async function refillPicker(prefix, fromIndex, values, levels = PICK_LEVELS) {
  for (let index = fromIndex; index < levels.length; index++) {
    const level = levels[index];
    const select = $id(prefix + level);
    const parent = pickParent(level, values);
    let options = [];
    if (level === "corporation" || parent) {
      const entry = await loadKids(parent);
      options = entry.ids.map((id) => assetIndex.get(id)).filter((asset) => asset && asset.kind === level);
      // O item atual pode estar além da primeira página do ramo: mantém-no selecionável.
      if (values[level] && !options.some((asset) => asset.id === values[level]) && assetIndex.get(values[level])?.parent_id === (parent || null))
        options.push(assetIndex.get(values[level]));
    }
    fillSelect(
      select,
      options.map((asset) => ({ value: asset.id, label: assetLabel(asset) })),
      // Área sem subáreas: a opção vazia continua sendo o caminho normal (TAG direto na área).
      level === "subarea" && parent && !options.length ? "Sem subárea" : PICK_PLACEHOLDER[level],
      values[level] || "",
    );
    values[level] = select.value;
    select.disabled = level !== "corporation" && !parent;
  }
}

// Depois de salvar, vincular ou desvincular: a tela em uso relê o que depende do vínculo.
async function afterSensorChange() {
  if (state.page === "sensors") await loadSensors({ quiet: true });
  else if (state.page === "assets") {
    renderTree();
    await renderInspector();
  } else if (state.page === "telemetry") {
    renderHistorySelect();
    renderTelemetryLive();
  }
  renderIcons();
}

// Desvincular do spot (ADM nível 1 e 2), a partir de Detalhes ou de Editar. A confirmação mostra
// TAG, equipamento e spot. O vínculo e a sua referência são encerrados; as leituras ficam.
async function unlinkSensorFlow(sensorId, button) {
  const device = findDevice(sensorId);
  if (!device?.measurement_point_id) return;
  await ensureAssets([device.measurement_point_id]);
  const point = assetIndex.get(device.measurement_point_id);
  const equip = point ? assetIndex.get(point.parent_id) : null;
  const magnetic = isMagnetic(device, deviceLive(device));
  const ok = await askConfirm({
    title: "Desvincular sensor do spot",
    okLabel: "Desvincular",
    html:
      `<dl class="detail-fields"><dt>Sensor</dt><dd>${esc(deviceLabel(device))} · ${esc(device.sensor_id)}</dd>` +
      `<dt>TAG</dt><dd>${esc(equip ? equipTag(equip) : "—")}</dd><dt>Equipamento</dt><dd>${esc((equip && equipTypeLabel(equip.id)) || TYPE_UNKNOWN)}</dd>` +
      `<dt>Spot</dt><dd>${esc(point ? point.name + (point.position ? " · " + point.position : "") : "—")}</dd>` +
      `<dt>Caminho</dt><dd>${esc(assetPathLabel(device.measurement_point_id))}</dd></dl>` +
      `<p>O vínculo é encerrado e o sensor volta à fila de associação, livre para outro spot. As leituras continuam chegando e todo o histórico é preservado.</p>` +
      (magnetic ? `<p>A referência de engaxetamento deste vínculo (e o Modo bancada, se estiver ativo) é encerrada: no novo spot será preciso registrar o engaxetamento de novo.</p>` : "") +
      `<p>Nada é apagado da nuvem.</p>`,
  });
  if (!ok) return;
  await withBusy(button, async () => {
    const saved = await callRpc("gaxeta_unlink_sensor", { p_sensor_id: sensorId, p_reason: "desvínculo pela interface" });
    mergeDevices([saved]);
    await loadMagSummary([sensorId]).catch(() => {});
    showMessage("Sensor desvinculado. Ele está na fila de associação (Sensores → filtro Sem vínculo).", "success");
    openDrawer(sensorId, "detail");
    await afterSensorChange();
  });
}

// ----- Painel lateral -----
function openDrawer(sensorId, mode = "detail", opener = null) {
  const device = findDevice(sensorId);
  if (!device) return;
  if (mode === "edit" && !canEditDevice(device)) mode = "detail";
  Object.assign(state.drawer, { open: true, mode, sensorId, opener: opener || state.drawer.opener });
  $id("detailPane").hidden = false;
  $id("scrim").hidden = false;
  document.body.classList.add("drawer-open");
  pushBackLayer("drawer", () => closeDrawer());
  renderDrawer().catch((error) => showMessage(errorText(error), "error"));
}
function closeDrawer(restoreFocus = true) {
  const opener = state.drawer.opener;
  Object.assign(state.drawer, { open: false, sensorId: "", opener: null });
  $id("detailPane").hidden = true;
  $id("scrim").hidden = true;
  document.body.classList.remove("drawer-open");
  dropBackLayer("drawer");
  if (restoreFocus) {
    const card = opener?.closest?.("[data-card]")?.dataset.card;
    (card ? $id("sensorGrid").querySelector(`[data-card="${CSS.escape(card)}"] [data-act="${opener.dataset.act}"]`) : opener)?.focus?.();
  }
}
$id("scrim").onclick = () => closeDrawer();
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.drawer.open && !document.querySelector("dialog[open]")) closeDrawer();
});
function updateDrawerLive() {
  if (!state.drawer.open || !$id("detailStatus")) return;
  const device = findDevice(state.drawer.sensorId);
  if (!device) return;
  const status = deviceStatus(device);
  const live = deviceLive(device);
  const view = deviceView(device);
  // A placa trocou de modalidade com o painel aberto: redesenha o painel inteiro.
  if ($id("detailLive") && ($id("detailLive").dataset.mode === "mag") !== !!view.magnetic) return void renderDrawer().catch(() => {});
  if (view.magnetic) return updateDrawerLiveMag(device, view, status);
  const electric = view.electric;
  const volt = voltageInfo(device, live);
  $id("detailStatus").innerHTML = `<i class="dot ${status.className}"></i>${esc(status.label)} · ${fmtDateTime(device.last_received_at)}`;
  // Bloco fixo, igual para sensor com ou sem vínculo: posição elétrica e tensão da mesma leitura,
  // a linha estabilizada (5 p.p.) e a condição do sinal.
  const tile = (id, value, note) => ($id(id).innerHTML = `${esc(value)}<small>${esc(note)}</small>`);
  tile("detailElectric", electric.text, electric.label || "leitura atual");
  tile("detailVolt", volt.text, volt.source || "sem leitura");
  $id("detailVolt").title = volt.title;
  tile("detailStableLine", device.stable_percent == null ? "—" : fmtNum(device.stable_percent) + " %", "muda com 5 p.p. ou mais");
  tile("detailSignal", view.label, BLOCK_SHORT[electric.block] && electric.block !== "ok" ? BLOCK_SHORT[electric.block] : "bloco de amostras bom");
  const delta = rawDeltaText(device);
  const cadence = firmwareCadence(device.firmware_version);
  $id("detailReading").textContent =
    `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"}` +
    (delta ? ` · variação desde o envio anterior: ${delta}` : "") +
    (cadence ? ` · ${cadence.text}` : "");
  $id("detailHealth").textContent = view.label + " · " + view.note;
  $id("detailHealth").className = "health-banner health-" + view.key;
  if ($id("detailDiag")) {
    const block = device.last_adc_min != null && device.last_adc_max != null ? ` (bloco de ${fmtNum(device.last_adc_min, 0)} a ${fmtNum(device.last_adc_max, 0)})` : "";
    const measured = Number(live?.interval_s);
    const rows = [
      ["Posição elétrica (leitura atual)", electric.text + (electric.label ? " · " + electric.label : "")],
      ["Escala do percentual", scaleText(electric.scale)],
      ["Posição elétrica (linha estabilizada)", `${fmtNum(device.stable_percent)} % · muda só com variação de 5 p.p. ou mais` + (device.stable_since ? ` · desde ${fmtDateTime(device.stable_since)}` : "")],
      ["Variação desde o envio anterior", delta || "aguardando o próximo envio"],
      ["Tensão calibrada", device.last_voltage_mv != null ? fmtVolt(device.last_voltage_mv) : "não enviada por este firmware"],
      ["Tensão estimada", device.last_voltage_v != null ? fmtNum(device.last_voltage_v, 3) + " V (ADC × 3,3 ÷ 4095)" : "—"],
      ["ADC bruto", device.last_adc_raw != null || live?.adc != null ? fmtNum(device.last_adc_raw ?? live.adc, 1) + " contagens" + block : "—"],
      ["Dispersão do bloco", device.adc_noise != null ? fmtNum(device.adc_noise, 1) + " contagens" : "—"],
      ["Condição do bloco", BLOCK_TEXT[electric.block] || "—"],
      ...(BLOCK_HINT[electric.block] ? [["O que os dados indicam", BLOCK_HINT[electric.block]]] : []),
      ["Cadência", [cadence ? "declarada pelo firmware: " + cadence.text : "", Number.isFinite(measured) && measured > 0 ? "medida nos últimos envios: " + fmtInterval(measured) : ""].filter(Boolean).join(" · ") || "—"],
      ["Método de aquisição", device.last_acq_method || "anterior ao 4.3.0"],
      ["Amostra colhida", fmtDateTime(device.last_sampled_at)],
      ["Recebida no servidor", fmtDateTime(device.last_received_at)],
    ];
    $id("detailDiag").innerHTML = rows.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("");
  }
  if ($id("detailSequence")) $id("detailSequence").textContent = device.last_sequence ?? "—";
  if ($id("detailRssi")) $id("detailRssi").textContent = `${device.last_rssi ?? "—"} dBm`;
}
async function renderDrawer() {
  const { sensorId, mode } = state.drawer;
  const device = findDevice(sensorId);
  if (!device) return closeDrawer(false);
  await ensureAssets([device.measurement_point_id]);
  if (state.drawer.sensorId !== sensorId) return;
  const pane = $id("detailPane");
  const point = assetIndex.get(device.measurement_point_id);
  const path = assetPathLabel(device.measurement_point_id);
  const identity = deviceIdentity(device);
  const head =
    `<div class="drawer-head"><div><small>${mode === "edit" ? "Editar sensor" : "Sensor"}${identity.linked ? " · " + esc(identity.title) : ""}</small><h2>${esc(deviceLabel(device))}</h2></div>` +
    `<button id="drawerClose" class="icon-button" aria-label="Fechar painel">×</button></div>` +
    `<div class="drawer-body"><div class="live-line" id="detailStatus"></div>` +
    (isMagnetic(device, deviceLive(device))
      ? `<div class="drawer-values four" id="detailLive" data-mode="mag"><div><span id="detailElectricLabel">Curso de ajuste restante</span><strong id="detailElectric" class="volt-value"></strong></div><div><span id="detailVoltLabel">Avanço desde engaxetamento</span><strong id="detailVolt" class="volt-value"></strong></div><div><span>Ângulo do sensor</span><strong id="detailStableLine" class="volt-value"></strong></div><div><span>Sinal</span><strong id="detailSignal" class="volt-value"></strong></div></div>`
      : `<div class="drawer-values four" id="detailLive" data-mode="adc"><div><span>Posição elétrica (%)</span><strong id="detailElectric" class="volt-value"></strong></div><div><span>Tensão (V)</span><strong id="detailVolt" class="volt-value"></strong></div><div><span>Linha estabilizada (%)</span><strong id="detailStableLine" class="volt-value"></strong></div><div><span>Sinal</span><strong id="detailSignal" class="volt-value"></strong></div></div>`) +
    `<p id="detailReading" class="live-reading"></p>` +
    `<div id="detailHealth" class="health-banner"></div>` +
    `<p class="drawer-path">${icon("map-pin")}${esc(path || "Sem vínculo com spot (fila de associação)")}</p>`;
  if (mode === "edit") {
    pane.innerHTML =
      head +
      `<form id="sensorForm" novalidate><label>Nome do sensor na plataforma<input id="sensorName" required minlength="3" maxlength="24" value="${esc(deviceLabel(device))}" autocomplete="off"></label>` +
      `<fieldset class="location-selects"><legend>Spot de instalação</legend>` +
      PICK_LEVELS.map((level) => `<label>${level === "subarea" ? "Subárea (opcional)" : KIND_LABEL[level]}<select id="pick-${level}"></select></label>`).join("") +
      `</fieldset><label>Gateway (opcional)<select id="sensorGateway"></select></label>` +
      `<p id="sensorFormMessage" class="form-message" role="status"></p>` +
      `<div class="drawer-actions"><button class="primary" type="submit">Salvar</button><button class="secondary" type="button" id="drawerCancel">Cancelar</button></div>` +
      (isAdminWriter() && device.measurement_point_id ? `<button type="button" id="unlinkSensor" class="text-button danger-text">Desvincular do spot (volta à fila)</button>` : "") +
      `</form></div>`;
    const values = Object.fromEntries(PICK_LEVELS.map((level) => [level, ""]));
    for (const asset of assetPath(device.measurement_point_id, state.assets)) values[asset.kind] = asset.id;
    const fillGateways = async (keep) => {
      const rows = values.company ? await unwrap(sb.from("gaxeta_gateways").select("id,name,identifier").eq("company_id", values.company).order("name").limit(200)) : [];
      fillSelect($id("sensorGateway"), rows.map((row) => ({ value: row.id, label: `${row.name} · ${row.identifier}` })), values.company ? "Sem gateway" : "Escolha a empresa primeiro", keep || "");
    };
    await refillPicker("pick-", 0, values);
    await fillGateways(device.gateway_id);
    PICK_LEVELS.forEach((level, index) => {
      $id("pick-" + level).onchange = () =>
        withBusy(null, async () => {
          values[level] = $id("pick-" + level).value;
          for (const lower of PICK_LEVELS.slice(index + 1)) values[lower] = "";
          await refillPicker("pick-", index + 1, values);
          if (index <= 1) await fillGateways("");
        });
    });
    $id("drawerCancel").onclick = () => openDrawer(sensorId, "detail");
    $id("sensorForm").onsubmit = async (event) => {
      event.preventDefault();
      const name = $id("sensorName").value.trim();
      const message = $id("sensorFormMessage");
      if (!isValidSensorName(name)) return void (message.textContent = "Nome: 3 a 24 caracteres, letras sem acento, números, espaço, ponto, hífen ou sublinhado.");
      if (!values.point && !isAdminWriter()) return void (message.textContent = "Selecione o spot de instalação.");
      message.textContent = "Salvando…";
      await withBusy(event.submitter, async () => {
        try {
          const saved = await callRpc("gaxeta_configure_sensor", { p_sensor_id: sensorId, p_label: name, p_point_id: values.point || null, p_gateway_id: $id("sensorGateway").value || null });
          mergeDevices([saved]);
          await ensureAssets([saved.measurement_point_id]);
          showMessage(`Sensor ${name} salvo${saved.measurement_point_id ? " em " + assetPathLabel(saved.measurement_point_id) : ", sem vínculo"}.`, "success");
          openDrawer(sensorId, "detail");
          await afterSensorChange();
        } catch (error) {
          message.textContent = errorText(error);
        }
      });
    };
    if ($id("unlinkSensor")) $id("unlinkSensor").onclick = (event) => unlinkSensorFlow(sensorId, event.currentTarget);
  } else {
    const gateway = device.gateway_id ? (await unwrap(sb.from("gaxeta_gateways").select("name,identifier").eq("id", device.gateway_id).limit(1)))[0] : null;
    if (state.drawer.sensorId !== sensorId) return;
    const fields = [
      ["ID", device.sensor_id],
      ["MAC Wi-Fi", device.wifi_mac || "—"],
      ["MAC BLE", device.ble_mac || "—"],
      ["TAG", identity.linked ? identity.title : "—"],
      ["Spot", point ? point.name + (point.position ? " · " + point.position : "") : "Sem vínculo"],
      ["Transporte", "Wi-Fi direto"],
      ["Gateway", gateway ? `${gateway.name} · cadastrado` : "Sem gateway"],
      ["Firmware", device.firmware_version || "Anterior à v4"],
      ["Nome na placa", device.applied_label || "não informado"],
    ];
    pane.innerHTML =
      head +
      `<div class="drawer-actions"><button class="primary" id="detailHistory">Ver histórico</button>` +
      (canEditDevice(device) ? `<button class="secondary" id="detailEdit">Editar nome e spot</button>` : "") +
      (isAdminWriter() && device.measurement_point_id ? `<button class="text-button danger-text" id="detailUnlink">Desvincular do spot…</button>` : "") +
      `</div>` +
      (isMagnetic(device, deviceLive(device)) ? magServiceSection() : "") +
      `<dl class="detail-fields">${fields.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("")}` +
      `<dt>Sequência</dt><dd id="detailSequence"></dd><dt>Sinal Wi-Fi</dt><dd id="detailRssi"></dd></dl>` +
      (isMagnetic(device, deviceLive(device)) ? magDrawerSections() :
      // Dados elétricos da leitura atual: servem para diagnosticar ligação, ruído e saturação.
      `<details class="technical-detail"><summary>Leitura elétrica (diagnóstico)</summary><p class="form-help">A posição elétrica é a leitura do potenciômetro em % da escala elétrica da placa: 0 % no mínimo e 100 % no máximo. A tensão é a do pino do ADC. Os avisos de limite indicam saturação do ADC; bloco instável ou misto indica cursor solto, falta de potenciômetro ou giro durante a leitura.</p><dl class="detail-fields" id="detailDiag"></dl></details>`) +
      // Gravar o nome na placa é um comando local por Bluetooth: só existe no aplicativo nativo.
      (canEditDevice(device) && bleAvailable()
        ? `<details class="technical-detail"><summary>Nome anunciado por Bluetooth (opcional)</summary><p class="form-help">O nome da plataforma não depende do Bluetooth. Para gravar o nome na placa, conecte o sensor pelo Bluetooth e use o PIN de 6 dígitos. Nada é enviado à placa sem esta ação.</p><button id="applyBleName" class="secondary compact">Gravar nome na placa</button></details>`
        : "") +
      (isMagnetic(device, deviceLive(device))
        ? `<small class="drawer-note">Sensor magnético AS5600: mede o ângulo absoluto do ímã (medido). O avanço e o curso de ajuste restante são calculados a partir do engaxetamento registrado e da geometria da montagem. O curso restante não indica força de aperto, pressão, qualidade de vedação nem vida útil da gaxeta.</small></div>`
        : `<small class="drawer-note">Sensor: potenciômetro rotativo de uma volta. A plataforma mostra a posição elétrica (%) e a tensão (V) da leitura atual, com ou sem vínculo a spot. A tensão traz a origem: calibrada pelo ADC da placa ou estimada. O histórico de mudanças registra variações de 5 pontos percentuais ou mais.</small></div>`);
    if (isMagnetic(device, deviceLive(device))) bindMagDrawer(sensorId);
    $id("detailHistory").onclick = () => {
      closeDrawer(false);
      openHistoryFor(sensorId);
    };
    if ($id("detailEdit")) $id("detailEdit").onclick = () => openDrawer(sensorId, "edit");
    if ($id("detailUnlink")) $id("detailUnlink").onclick = (event) => unlinkSensorFlow(sensorId, event.currentTarget);
    if ($id("applyBleName"))
      $id("applyBleName").onclick = (event) =>
        withBusy(event.currentTarget, async () => {
          if (!bleCurrent() || state.bleReading?.sensor_id !== sensorId) {
            openBleDialog();
            setBlePhase(bleUi.phase === "connected" ? "connected" : "idle", "Conecte o sensor com ID " + sensorId + " para gravar o nome: toque em Buscar sensores.");
            return;
          }
          if (!device.desired_label) throw Error("Salve primeiro o nome do sensor na plataforma.");
          const written = await bleWriteName(device.desired_label, device.sensor_id, state.bleReading?.sensor_id);
          showMessage(`Nome “${written}” gravado e lido na placa. A confirmação na nuvem aparece na próxima transmissão.`, "success");
        });
  }
  $id("drawerClose").onclick = () => closeDrawer();
  updateDrawerLive();
  renderIcons();
  (mode === "edit" ? $id("sensorName") : $id("drawerClose")).focus({ preventScroll: true });
}

// ---- 63-magnetic.js ----
// =============================================================================
// Sensor magnético (AS5600): cartão, painel de Detalhes e "Engaxetamento realizado".
//   * Modo bancada (64-bench.js): série própria, sempre identificada; não se mistura com o campo.
//   * Campo: o número em destaque é o curso restante estabilizado, com a faixa de ajuste decidida
//     no servidor; "curso estimado" aparece sempre que D veio do valor típico do cadastro.
//   * Sem vínculo: ângulo absoluto e saúde.
//   * Com vínculo e referência: Curso de ajuste restante (% e mm) em destaque; Avanço desde
//     engaxetamento e Ângulo do sensor em Detalhes.
//   * Medido (ângulo, campo, barramento), calculado (avanço, curso restante) e estimado (curso
//     sugerido pela ficha) aparecem com esses nomes, nunca misturados.
//   * O técnico informa uma medida (quanto curso ainda resta até o limite de ajuste) e toca em
//     um botão. A referência é capturada pelo servidor na primeira leitura válida depois do
//     clique; aqui só se mostra o estado: aguardando, confirmada, expirada.
//   * O curso restante não é força de aperto, pressão, qualidade de vedação nem vida útil.
// =============================================================================
const MAG_BUS_TEXT = { ok: "barramento I²C bom", no_ack: "módulo sem resposta (I²C)", read_error: "leitura I²C incompleta", timeout: "I²C sem resposta a tempo" };
const MAG_FIELD_TEXT = { ok: "campo magnético bom", no_magnet: "ímã ausente", weak: "campo fraco", strong: "campo forte" };

// Sinal em uma linha: barramento e campo da leitura atual.
function magSignalText(device, mag) {
  const bus = mag?.reading?.bus_status ?? device?.last_bus_status;
  const field = mag?.reading?.mag_status ?? device?.last_mag_status;
  if (!bus) return "sem leitura";
  return bus !== "ok" ? MAG_BUS_TEXT[bus] || bus : MAG_FIELD_TEXT[field] || "—";
}
// O que falta no cadastro deste spot para o cálculo de campo, e se esta conta pode resolver.
function magConfigState(mag) {
  const config = mag?.config || null;
  const missing = config?.missing || [];
  // No cartão, o botão Configurar aparece quando o que falta impede o próximo passo e esta conta
  // resolve: geometria ou validação (engenharia), ou o curso típico enquanto não há referência.
  const blocksGeometry = missing.includes("geometry") || missing.includes("validation");
  return {
    missing,
    canFix: !!config && ((blocksGeometry && config.can_geometry) || (missing.includes("course") && config.can_course && !mag.service)),
    can: !!config && (config.can_course || config.can_geometry),
    pointId: config?.point_id || null,
  };
}
// Idade de uma leitura, em texto curto ("12 s", "4 min").
const agoText = (value) => fmtInterval(Math.max(0, Math.round((Date.now() + state.clockOffset - new Date(value).getTime()) / 1000)));
// Uma linha para leitura rápida do sensor em bancada: "67,83 % · Médio ajuste" (ou o estado, sem
// número). Usada na árvore e em Ativos, sempre a partir do mesmo `view` do cartão.
function benchFace(device, view) {
  const status = deviceStatus(device);
  const has = view.scale != null;
  return {
    has, status, stale: has && !status.online, lastOk: has ? null : view.bench?.last_ok || null,
    text: has ? `${view.value} %` + (view.sim ? ` · ${view.sim.label}` : "") : view.label,
    at: device.last_received_at,
  };
}
// Cartão do sensor em Modo bancada: percentual, faixa simulada e barra em destaque, uma única
// identificação lilás de bancada e o horário da leitura. O ponto de transmissão (cabeçalho) é
// independente: um sensor pode estar transmitindo e mostrar "Sem ajuste" simulado.
function benchCardHtml(device, view, status, identity, place, name, config) {
  const bench = view.bench;
  const sim = view.sim;
  const face = benchFace(device, view);
  const side = face.has
    ? sim
      ? benchSimChip(sim, " is-large") + `<small>faixa simulada · ${esc(sim.range)}</small>`
      : `<span class="adjustment-badge">Posição de bancada</span><small>faixas simuladas desligadas</small>`
    : `<span class="adjustment-badge">${esc(view.label)}</span><small title="${esc(view.note)}">${esc(view.note)}</small>`;
  const time = face.stale
    ? `Última leitura válida às <b>${esc(fmtClock(face.at))}</b> · sem atualização há ${esc(agoText(face.at))}`
    : face.has
      ? `Atualizado às <b>${esc(fmtClock(face.at))}</b>` + (device.last_sampled_at ? ` · amostra das ${esc(fmtClock(device.last_sampled_at))}` : "")
      : face.lastOk
        ? `Última leitura válida: <b>${esc(fmtNum(benchShown(face.lastOk.percent), 2))} %</b> às ${esc(fmtClock(face.lastOk.at))} (não é a atual)`
        : `Atualizado às <b>${esc(fmtClock(face.at))}</b>`;
  return (
    `<article class="sensor-card health-${view.key} is-magnetic is-bench${face.stale ? " is-stale" : ""}" data-card="${esc(device.sensor_id)}">` +
    `<header><strong title="${esc(name)}">${esc(name)}</strong><span class="conn"><i class="dot ${status.className}"></i><span>${esc(status.label)}</span></span></header>` +
    `<p class="card-path${place ? "" : " unlinked"}" title="${esc(identity.path || "Sensor ainda não associado a um spot")}">${esc(place || "Sem vínculo · fila de associação")}</p>` +
    `<p class="bench-flag"><span class="series-tag is-bench" title="Série de bancada: demonstração em mesa. Não é curso de campo e não gera evento de manutenção.">Modo bancada</span>` +
    `<span>${face.stale ? "Última leitura válida (não é a atual)" : "Posição de bancada"}</span></p>` +
    `<div class="card-main"><div class="card-value" title="Posição de bancada (${esc(view.origin)})">${esc(view.value)}<small>${esc(view.unit)}</small></div>` +
    `<div class="card-side">${side}</div></div>` +
    `<div class="mini-scale bench-scale${face.has ? "" : " idle"}" role="img" aria-label="Posição de bancada: ${esc(face.text)}"><i style="width:${view.scale ?? 0}%"></i>` +
    (view.benchBands ? `<b style="left:30%"></b><b style="left:50%"></b><b style="left:73%"></b>` : "") + `</div>` +
    `<p class="card-time${face.stale ? " is-late" : ""}">${time}</p>` +
    `<div class="card-meta"><span title="Ângulo absoluto do ímã (medido). Não é avanço nem curso.">Ângulo ${esc(fmtDeg(view.degrees))}</span>` +
    (face.has ? `<span title="Fora da faixa a barra fica em 0 % ou em 100 % e o quanto passou é guardado">${esc(view.where)}</span>` : `<span title="Sinal do sensor magnético">${esc(magSignalText(device, view.mag))}</span>`) +
    `</div>` +
    `<footer><button data-act="history">Histórico</button><button data-act="detail">Detalhes</button>` +
    (config.canFix ? `<button data-act="setup" title="Falta cadastro para calcular o curso de ajuste restante">Configurar</button>` : "") +
    (canEditDevice(device) ? `<button data-act="edit">Editar</button>` : "") +
    `</footer></article>`
  );
}
function magCardHtml(device, view, status, identity, place, name) {
  const mag = view.mag;
  const config = magConfigState(mag);
  if (view.bench) return benchCardHtml(device, view, status, identity, place, name, config);
  // Selo da série de campo: curso estimado quando D veio do valor típico. A cor não é o único sinal.
  const tag = view.estimated
    ? `<span class="series-tag is-estimated" title="O curso disponível deste engaxetamento veio do valor típico do cadastro, não de uma medida.">Curso estimado</span>`
    : "";
  return (
    `<article class="sensor-card health-${view.key} is-magnetic" data-card="${esc(device.sensor_id)}">` +
    `<header><strong title="${esc(name)}">${esc(name)}</strong><span class="conn"><i class="dot ${status.className}"></i><span>${esc(status.label)}</span></span></header>` +
    `<p class="card-path${place ? "" : " unlinked"}" title="${esc(identity.path || "Sensor ainda não associado a um spot")}">${esc(place || "Sem vínculo · fila de associação")}</p>` +
    `<div class="card-main"><div class="card-value" title="${esc(view.kicker)} (${esc(view.origin)})">${esc(view.value)}<small>${esc(view.unit)}</small></div>` +
    `<div class="card-side"><span class="card-kicker">${esc(view.kicker)}</span>${tag}<span class="adjustment-badge">${esc(view.label)}</span><small title="${esc(view.note)}">${esc(view.note)}</small></div></div>` +
    `<div class="mini-scale${view.scale == null ? " idle" : ""}" role="img" aria-label="${esc(view.kicker)}: ${esc(view.value)} ${esc(view.unit)}"><i style="width:${view.scale ?? 0}%"></i></div>` +
    `<div class="card-meta"><span title="Ângulo absoluto do ímã (medido). Não é avanço nem curso.">Ângulo ${esc(fmtDeg(view.degrees))}</span>` +
    (view.computed
      ? `<span title="Valor da leitura atual, sem a estabilização de 5 pontos percentuais">Instantâneo ${fmtNum(view.instant, 2)} %</span>`
      : `<span title="Sinal do sensor magnético">${esc(magSignalText(device, mag))}</span>`) +
    `<span title="Última atualização recebida da placa">Atualizado ${fmtDateTime(device.last_received_at)}</span></div>` +
    `<footer><button data-act="history">Histórico</button><button data-act="detail">Detalhes</button>` +
    (config.canFix ? `<button data-act="setup" title="Falta cadastro para calcular o curso de ajuste restante">Configurar</button>` : "") +
    (canEditDevice(device) ? `<button data-act="edit">Editar</button>` : "") +
    `</footer></article>`
  );
}

// ----- Painel de Detalhes -----
// O bloco do engaxetamento fica logo abaixo das ações, antes da ficha do sensor: no celular o
// técnico chega ao campo e ao botão sem percorrer a lista de identificação.
const magServiceSection = () => `<section class="mag-bench" id="magBench" aria-live="polite"></section><section class="mag-service" id="magService" aria-live="polite"></section>`;
function magDrawerSections() {
  return (
    `<details class="technical-detail"><summary>Leitura magnética (diagnóstico)</summary><p class="form-help">O ângulo é a posição absoluta do ímã, de 0° a 359,9° (12 bits). O avanço e o curso restante só existem depois de um engaxetamento registrado e dentro da geometria validada da montagem. Campo fraco, campo forte, ímã ausente e falha do barramento deixam a leitura sem posição: a placa segue online e o motivo aparece aqui.</p><dl class="detail-fields" id="detailDiag"></dl></details>`
  );
}
function updateDrawerLiveMag(device, view, status) {
  const mag = view.mag;
  const reading = mag?.reading || null;
  const computed = view.computed;
  const service = view.service;
  const bench = view.bench || null;
  const ct = reading?.ct || null;
  $id("detailStatus").innerHTML = `<i class="dot ${status.className}"></i>${esc(status.label)} · atualizado ${fmtDateTime(device.last_received_at)}`;
  const tile = (id, value, note) => ($id(id).innerHTML = `${esc(value)}<small>${esc(note)}</small>`);
  const label = (id, text) => $id(id) && ($id(id).textContent = text);
  const outside = view.reason === "out_of_range";
  if (bench) {
    // Bancada: o número é a Posição de bancada (%); graus e bruto ficam ao lado.
    label("detailElectricLabel", "Posição de bancada (%)");
    label("detailVoltLabel", "Posição contínua");
    tile("detailElectric", view.value === "—" ? "—" : view.value + " %", view.value === "—" ? view.label : view.sim ? `${view.sim.label} · faixa simulada` : "calculado · bancada");
    tile("detailVolt", bench.continuous_deg == null ? "—" : fmtDeg(bench.continuous_deg, 2), bench.continuous_deg == null ? "sem posição conhecida" : `${bench.turns > 0 ? "+" : ""}${bench.turns} volta(s) · medido`);
  } else {
    label("detailElectricLabel", "Curso de ajuste restante");
    label("detailVoltLabel", "Avanço desde engaxetamento");
    tile("detailElectric", computed && view.value !== "—" ? view.value + " %" : "—",
      computed ? `${outside ? "fora da faixa" : MAG_BAND[view.band]?.label || "estabilizado"} · ${view.estimated ? "curso estimado" : "curso medido"}` : "sem referência válida");
    tile("detailVolt", computed ? fmtMm(computed.advance_mm, 2) : "—", computed ? `calculado · instantâneo ${fmtNum(computed.remaining_percent, 2)} %` : "sem referência válida");
  }
  // A cor do quadro do percentual é a mesma do cartão (faixa simulada, ou neutra de bancada).
  $id("detailElectric").parentElement.className = bench ? `health-${view.key} is-sim-tile` : "";
  tile("detailStableLine", view.raw == null ? "—" : fmtDeg(view.degrees, 2), view.raw == null ? "sem ângulo" : `medido · bruto ${view.raw}`);
  tile("detailSignal", (MAG_REASON[view.reason]?.key === "warn" && view.reason !== "out_of_range" && !/^bench_/.test(view.reason) ? view.label : "Sinal válido"), magSignalText(device, mag));
  const cadence = firmwareCadence(device.firmware_version);
  $id("detailReading").textContent =
    `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"}` + (cadence ? ` · ${cadence.text}` : "");
  $id("detailHealth").textContent =
    (bench && view.scale != null
      ? "Modo bancada · " + (view.sim ? `faixa simulada: ${view.sim.label}` : "posição de bancada") + (status.online ? "" : ` · última leitura válida às ${fmtClock(device.last_received_at)}, não é a atual`)
      : computed && !view.reason ? `Curso de ajuste restante · ${view.label}` : view.label) + " · " + (bench && view.scale != null ? view.where + " · não é curso de campo" : view.note);
  $id("detailHealth").className = "health-banner health-" + view.key;
  renderMagBench(device, view);
  renderMagService(device, view);
  if ($id("detailUnlink")) $id("detailUnlink").hidden = !(isAdminWriter() && device.measurement_point_id);
  if ($id("detailDiag")) {
    const lastValid = mag?.last_valid;
    const rows = [
      ["Série exibida", bench ? "bancada (demonstração em mesa)" + (view.benchBands ? " · faixas simuladas ligadas" : " · faixas simuladas desligadas") : computed ? view.series : "ângulo do sensor (sem curso calculado)"],
      ["Ângulo do sensor (medido)", view.raw == null ? "sem ângulo nesta leitura" : `${fmtDeg(view.degrees, 3)} · bruto ${view.raw} de 4095`],
      ["Estabilidade do bloco", reading?.angle_pp == null && device.last_angle_pp == null ? "—" : `${reading?.angle_pp ?? device.last_angle_pp} contagens entre amostras (até 6 = estável)`],
      ["Barramento I²C", MAG_BUS_TEXT[reading?.bus_status ?? device.last_bus_status] || "—"],
      ["Campo magnético", MAG_FIELD_TEXT[reading?.mag_status ?? device.last_mag_status] || "—"],
      ["AGC / magnitude", `${reading?.agc ?? device.last_agc ?? "—"} / ${reading?.magnitude ?? device.last_magnitude ?? "—"}`],
      ["Contagem contínua (placa)", !ct ? "não enviada por este firmware (anterior ao 4.5.0)" : ct.session ? `sessão ${ct.session} · ${ct.count} contagens · ${fmtDeg(ct.continuous_deg, 3)} contínuos · iniciada por: ${ctLossText(ct.loss)}` : `sem contagem agora: ${ctLossText(ct.loss)}`],
      ...(ct && ct.step != null ? [["Margem desde o envio anterior", `maior passo entre amostras: ${ct.step} contagens (${fmtDeg((ct.step * 360) / 4096, 2)}; o limite é 90°) · maior lacuna: ${ct.gap_ms} ms`]] : []),
      ...(view.reason && MAG_REASON[view.reason] ? [["O que fazer", MAG_REASON[view.reason].note]] : []),
      ...(lastValid && (view.raw == null || /^(bus_|no_magnet|field_)/.test(view.reason || ""))
        ? [["Último ângulo válido", `${fmtDeg(lastValid.angle_deg, 3)} em ${fmtDateTime(lastValid.at)} (não é a leitura atual)`]]
        : []),
      ...(bench
        ? [
            ["Bancada: faixa configurada", `${fmtDeg(bench.zero_deg, 1)} = 0 % · ${fmtDeg(bench.full_deg, 1)} = 100 % · sentido ${bench.direction > 0 ? "crescente" : "decrescente"} · ${fmtDeg(bench.span_deg, 1)} de faixa`],
            ["Bancada: posição contínua", bench.u_deg == null ? "—" : `${fmtDeg(bench.u_deg, 2)} a partir do 0 %` + (Number(bench.over_deg) ? ` · ${fmtDeg(Math.abs(bench.over_deg), 2)} ${bench.over_deg > 0 ? "além do 100 %" : "abaixo do 0 %"}` : "")],
            ["Bancada: início confirmado", bench.anchor_at ? fmtDateTime(bench.anchor_at) : "ainda não"],
          ]
        : [
            ["Avanço desde engaxetamento (calculado)", computed ? fmtMm(computed.advance_mm, 3) + (Number(computed.advance_mm) < 0 ? " · recuo" : "") : "—"],
            ["Curso de ajuste restante (instantâneo)", computed ? `${fmtNum(computed.remaining_percent, 2)} % · ${fmtMm(computed.remaining_mm, 3)}` + (outside ? " · fora da faixa validada" : "") : "—"],
            ["Curso de ajuste restante (estabilizado)", service?.stable_remaining == null ? "—" : `${fmtNum(service.stable_shown ?? service.stable_remaining, 2)} % · ${MAG_BAND[service.band]?.label || "—"} · muda só com variação de 5 p.p. ou mais` + (service.stable_since ? ` · desde ${fmtDateTime(service.stable_since)}` : "")],
            ["Curso disponível no engaxetamento", service ? `${fmtMm(service.course_mm, 3)} · ${service.course_origin === "estimated" ? "estimado (valor típico do cadastro)" : "medido"}` : "—"],
            ["Geometria da referência", service ? service.geometry + (service.provisional ? " · em caracterização (resultado provisório)" : " · validada") + (service.geometry_current === false ? " · o spot já usa outra revisão" : "") : "—"],
            ["Ângulo de referência", service ? `${fmtDeg(service.ref_angle_deg, 3)} · bruto ${service.ref_raw_angle} · ${fmtDateTime(service.ref_sampled_at || service.captured_at)}` : "—"],
          ]),
      ["Montagem do spot", mag?.setup?.key ? `${mag.setup.label} (${mag.setup.key} r${mag.setup.revision}) · ${mag.setup.status === "validated" ? "validada" : mag.setup.status === "draft" ? "em caracterização" : "retirada"}` + (mag.setup.geometry_source ? ` · ${mag.setup.geometry_source === "point" ? "vinculada a este spot" : "sugerida no TAG"}` : "") : "não definida"],
      ["Curso disponível típico", mag?.setup?.suggested_course_mm != null ? `${fmtMm(mag.setup.suggested_course_mm, 2)} · ${COURSE_SOURCE_TEXT[mag.setup.course_source] || "do cadastro"} · estimativa` : "não cadastrado"],
      ["Cadência", [cadence ? "declarada pelo firmware: " + cadence.text : "", mag?.interval_s ? "anunciada pela placa: " + fmtInterval(mag.interval_s) : ""].filter(Boolean).join(" · ") || "—"],
      ["Método de aquisição", device.last_acq_method || "—"],
      ["Amostra colhida", fmtDateTime(device.last_sampled_at)],
      ["Recebida no servidor", fmtDateTime(device.last_received_at)],
    ];
    $id("detailDiag").innerHTML = rows.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("");
  }
  if ($id("detailSequence")) $id("detailSequence").textContent = device.last_sequence ?? "—";
  if ($id("detailRssi")) $id("detailRssi").textContent = `${device.last_rssi ?? "—"} dBm`;
}

// ----- Engaxetamento realizado -----
// O bloco só é redesenhado quando o estado muda, para não apagar o que a pessoa está digitando.
function renderMagService(device, view) {
  const box = $id("magService");
  if (!box) return;
  const mag = view.mag;
  const pending = mag?.pending || null;
  const service = view.service;
  const setup = mag?.setup || null;
  const config = magConfigState(mag);
  const maintenance = mag?.maintenance || null;
  const sending = state.magRequests.get(device.sensor_id) || null;
  const sampleBad = /^(bus_|no_magnet|field_|no_reading)/.test(view.reason || "");
  const mode = !mag
    ? "unavailable"
    : !mag.linked
      ? "no_link"
      : mag.bench
        ? "bench"
        : pending && !pending.expired
          ? "pending"
          : !setup?.key
            ? "no_geometry"
            : !mag.can_operate
              ? "readonly"
              : "form";
  const signature = [mode, pending?.id, pending?.expired, service?.id, setup?.geometry_id, setup?.status, setup?.suggested_course_mm, setup?.course_source, sampleBad, mag?.can_operate,
    config.missing.join(","), config.can, maintenance?.id, sending?.error || "", sending ? "s" : "", sending?.manual ? "m" : ""].join("|");
  const current = service
    ? `<p class="mag-current">Referência atual: ${esc(fmtDateTime(service.captured_at))} · ${esc(fmtMm(service.course_mm))} ${service.course_origin === "estimated" ? "estimados" : "medidos"} · ângulo de referência ${esc(fmtDeg(service.ref_angle_deg))}${service.provisional ? " · provisório" : ""}</p>`
    : "";
  if (box.dataset.signature === signature) {
    // Mesmo estado: só a contagem da espera muda.
    if (mode === "pending" && $id("magWait")) $id("magWait").textContent = magWaitText(device, pending);
    return;
  }
  box.dataset.signature = signature;
  // Quem pode configurar e o que falta, dito com todas as letras.
  const missingText = { course: "o curso disponível típico (mm)", geometry: "a revisão da montagem (geometria ensaiada)", validation: "a validação da montagem pelo ensaio" };
  const whoText = (item) => (item === "course" ? "quem edita o TAG ou o spot em Ativos (ADM nível 1 ou 2, ou usuário da corporação com permissão de edição neste ramo)" : "a engenharia (ADM nível 1 ou 2)");
  const gaps = config.missing.length
    ? `<ul class="mag-gaps">${config.missing.map((item) => `<li><b>Falta ${esc(missingText[item])}.</b> Quem cadastra: ${esc(whoText(item))}.</li>`).join("")}</ul>`
    : "";
  const setupButton = config.can ? `<button class="secondary" type="button" id="magSetupOpen">Configurar montagem</button>` : "";
  const maintenanceLine = maintenance
    ? `<p class="mag-current">Último registro de manutenção (sem referência): ${esc(fmtDateTime(maintenance.noted_at))}${maintenance.mine ? " · por você" : ""}${maintenance.note ? " · " + esc(maintenance.note) : ""}</p>`
    : "";
  if (mode === "unavailable") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">Estado do engaxetamento indisponível no momento. O ângulo e a saúde do sensor seguem acima.</p>`;
  } else if (mode === "no_link") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">Sensor sem vínculo com spot. Associe o sensor a um spot para registrar o engaxetamento e acompanhar o curso restante.</p>`;
  } else if (mode === "bench") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">O Modo bancada está ativo: a série exibida é de bancada. Para registrar um engaxetamento de campo, saia do Modo bancada.</p>` + maintenanceLine;
  } else if (mode === "pending") {
    box.innerHTML =
      `<h3>Aguardando leitura</h3>` +
      `<p class="mag-wait"><strong>Mantenha a haste parada.</strong> <span id="magWait">${esc(magWaitText(device, pending))}</span></p>` +
      `<p class="form-help">Solicitado ${pending.mine ? "por você" : "por outro operador"} às ${esc(fmtDateTime(pending.requested_at))}, com ${esc(fmtMm(pending.course_mm))} ${pending.course_origin === "estimated" ? "estimados" : "medidos"}. A referência é a primeira leitura válida e estável colhida depois do toque. Se a haste foi movida, cancele e repita.</p>` +
      current +
      (mag.can_operate ? `<div class="drawer-actions"><button class="secondary" type="button" id="magCancel">Cancelar solicitação</button></div>` : "") +
      `<p id="magMessage" class="form-message" role="status"></p>`;
  } else if (mode === "no_geometry") {
    // Sem montagem caracterizada não há escala física: só o fato da manutenção pode ser registrado.
    box.innerHTML =
      `<h3>Engaxetamento</h3><p class="form-help">Configuração pendente: sem a montagem ensaiada a plataforma mostra só o ângulo e a saúde do sensor. O curso de ajuste restante não é calculado, e nenhum número é posto no lugar.</p>` +
      gaps +
      (setup?.suggested_course_mm ? `<p class="form-help">Curso disponível típico: ${esc(fmtMm(setup.suggested_course_mm, 2))} (${esc(COURSE_SOURCE_TEXT[setup.course_source] || "do cadastro")}; estimativa, não é medida).</p>` : "") +
      (setupButton || mag.can_operate
        ? `<div class="drawer-actions">${setupButton}${mag.can_operate ? `<button class="secondary" type="button" id="magNote">Registrar engaxetamento (sem referência)</button>` : ""}</div>`
        : "") +
      (mag.can_operate ? `<p class="form-help">O registro guarda quem fez e a hora. Ele não vira zero do curso nem inicia a contagem do curso restante.</p>` : "") +
      maintenanceLine +
      `<p id="magMessage" class="form-message" role="status"></p>`;
  } else if (mode === "readonly") {
    box.innerHTML = `<h3>Engaxetamento</h3>${current || '<p class="form-help">Nenhum engaxetamento registrado neste vínculo.</p>'}<p class="form-help">Sua conta consulta este sensor, sem permissão para registrar engaxetamento.</p>` + gaps;
  } else {
    // Um toque: o curso vem do cadastro (estimado). Quem tem a medida real pode informá-la.
    const typical = setup.suggested_course_mm;
    const draft = setup.status !== "validated";
    const manual = !!sending?.manual || typical == null;
    const typed = sending?.course == null ? "" : fmtMmInput(sending.course);
    box.innerHTML =
      `<h3>Engaxetamento realizado</h3>` +
      (pending?.expired ? `<p class="form-message is-error">A solicitação anterior venceu sem uma leitura válida. Confira o sensor e repita.</p>` : "") +
      (draft ? `<p class="form-message">Montagem ainda em caracterização: o resultado sai como provisório e só a engenharia registra.</p>` : "") +
      `<form id="magForm" novalidate>` +
      (typical != null
        ? `<p class="mag-course" id="magCourseLine"><span>Curso disponível</span><strong>${esc(fmtMm(typical, 2))}</strong><small>valor típico do cadastro · ${esc(COURSE_SOURCE_TEXT[setup.course_source] || "do cadastro")} · entra como <b>estimado</b></small></p>` +
          `<label class="mag-estimate"><input id="magManual" type="checkbox"${manual ? " checked" : ""}> Tenho a medida real deste engaxetamento</label>`
        : `<p class="form-message">Curso disponível típico não cadastrado para este spot. Informe a medida real, ou peça o cadastro em Ativos.</p>`) +
      `<label id="magCourseRow"${manual ? "" : " hidden"}>Curso medido agora até o limite de ajuste (mm)` +
      `<input id="magCourse" type="text" inputmode="decimal" pattern="[0-9]+([.,][0-9]{1,3})?" maxlength="9" autocomplete="off" value="${esc(typed)}" aria-describedby="magCourseHelp"></label>` +
      `<p id="magCourseHelp" class="form-help">Faixa desta montagem: ${esc(fmtNum(setup.min_course_mm))} a ${esc(fmtNum(setup.max_course_mm))} mm. A medida real substitui a estimativa só neste engaxetamento.</p>` +
      `<p id="magMessage" class="form-message${sending?.error ? " is-error" : ""}" role="status">${esc(sending?.error || (sampleBad ? MAG_REASON[view.reason]?.note || "" : ""))}</p>` +
      `<div class="drawer-actions"><button class="primary" type="submit" id="magSubmit">${sending?.error ? "Tentar de novo" : "Engaxetamento realizado"}</button>${setupButton}</div></form>` +
      current +
      `<p class="form-help">Toque uma vez, com a haste parada. A primeira leitura nova, válida e estável vira a referência: avanço zero e 100 % de curso restante, seja qual for o ângulo.</p>` +
      maintenanceLine;
  }
  bindMagDrawer(device.sensor_id);
}
// Espera estimada pela cadência anunciada: quanto falta para a próxima leitura da placa.
function magWaitText(device, pending) {
  const period = Number(deviceInterval(device)) || 30;
  const now = Date.now() + state.clockOffset;
  const sinceLast = (now - new Date(device.last_received_at).getTime()) / 1000;
  const next = Math.max(0, Math.round(period - (sinceLast % period)));
  const left = Math.max(0, Math.round((new Date(pending.expires_at).getTime() - now) / 1000));
  return `Próxima leitura em cerca de ${fmtInterval(next)} (um envio a cada ${fmtInterval(period)}). A solicitação vale por mais ${fmtInterval(left)}.`;
}
function bindMagDrawer(sensorId) {
  const manual = $id("magManual");
  if (manual)
    manual.onchange = () => {
      $id("magCourseRow").hidden = !manual.checked;
      if (manual.checked) $id("magCourse").focus();
    };
  if ($id("magSetupOpen")) $id("magSetupOpen").onclick = () => openMagSetup(sensorId).catch((error) => showMessage(errorText(error), "error"));
  if ($id("magNote"))
    $id("magNote").onclick = (event) =>
      withBusy(event.currentTarget, async () => {
        const device = findDevice(sensorId);
        if (!(await askConfirm({ title: "Registrar engaxetamento sem referência", danger: false, okLabel: "Registrar",
          html: `<p>Registra que o engaxetamento de <b>${esc(deviceIdentity(device).title)}</b> foi feito agora, por você.</p><p>Este registro <b>não</b> é a referência do curso: o cálculo do curso de ajuste restante continua indisponível até a montagem ser configurada e validada.</p>` }))) return;
        const request = state.magRequests.get("note:" + sensorId) || { id: newRequestId() };
        state.magRequests.set("note:" + sensorId, request);
        try {
          await callRpc("gaxeta_mag_record_maintenance", { p_sensor_id: sensorId, p_request_id: request.id, p_note: null });
          state.magRequests.delete("note:" + sensorId);
          showMessage("Engaxetamento registrado, sem referência de curso.", "success");
        } catch (error) {
          if (!isNetworkError(error)) state.magRequests.delete("note:" + sensorId);
          if ($id("magMessage")) $id("magMessage").textContent = isNetworkError(error) ? "Sem resposta do servidor. Toque de novo: o mesmo registro é reenviado, sem duplicar." : isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error);
        }
        await loadMagSummary([sensorId]).catch(() => {});
        updateDrawerLive();
      });
  if ($id("magForm"))
    $id("magForm").onsubmit = (event) => {
      event.preventDefault();
      submitMagService(sensorId, event.submitter).catch((error) => showMessage(errorText(error), "error"));
    };
  if ($id("magCancel"))
    $id("magCancel").onclick = (event) =>
      withBusy(event.currentTarget, async () => {
        const device = findDevice(sensorId);
        const pending = deviceMag(device)?.pending;
        if (!pending) return;
        try {
          await callRpc("gaxeta_mag_cancel_service", { p_sensor_id: sensorId, p_service_id: pending.id });
          showMessage("Solicitação cancelada. A referência anterior continua valendo.", "success");
        } catch (error) {
          if ($id("magMessage")) $id("magMessage").textContent = errorText(error);
        }
        await loadMagSummary([sensorId]).catch(() => {});
        updateDrawerLive();
      });
}
async function submitMagService(sensorId, button) {
  const device = findDevice(sensorId);
  const setup = deviceMag(device)?.setup;
  const message = $id("magMessage");
  // Com a medida real marcada vale o que foi digitado (medido); senão, o valor típico (estimado).
  const useManual = !$id("magManual") || $id("magManual").checked;
  const estimated = !useManual;
  const raw = useManual ? String($id("magCourse").value).replace(",", ".").trim() : String(setup?.suggested_course_mm ?? "");
  const course = Number(raw);
  // Validação local só para a mensagem imediata; quem decide é o servidor.
  if (!raw || !/^\d+(\.\d+)?$/.test(raw) || !Number.isFinite(course) || course <= 0) return void ((message.textContent = "Informe o curso disponível em mm (maior que zero)."), message.classList.add("is-error"));
  if (Math.round(course * 1000) !== course * 1000 && Math.abs(Math.round(course * 1000) - course * 1000) > 1e-6)
    return void ((message.textContent = "Use até três casas decimais."), message.classList.add("is-error"));
  if (setup && (course < Number(setup.min_course_mm) || course > Number(setup.max_course_mm)))
    return void ((message.textContent = `Curso fora da faixa desta montagem (${fmtNum(setup.min_course_mm)} a ${fmtNum(setup.max_course_mm)} mm).`), message.classList.add("is-error"));
  // O mesmo identificador vale para as novas tentativas do mesmo toque (resposta perdida, toque duplo).
  const previous = state.magRequests.get(sensorId);
  const origin = estimated ? "estimated" : "measured";
  const request = previous && previous.course === course && previous.origin === origin ? previous : { id: newRequestId(), course, origin };
  request.error = "";
  request.manual = useManual;
  state.magRequests.set(sensorId, request);
  message.classList.remove("is-error");
  message.textContent = "Registrando…";
  await withBusy(button, async () => {
    try {
      await callRpc("gaxeta_mag_request_service", { p_sensor_id: sensorId, p_request_id: request.id, p_course_mm: course, p_course_origin: origin });
      state.magRequests.delete(sensorId);
      showMessage(`Engaxetamento registrado com ${fmtMm(course, 2)} ${estimated ? "estimados" : "medidos"}. Aguardando a próxima leitura: mantenha a haste parada.`, "success");
    } catch (error) {
      // Falha de transporte: guarda a solicitação para repetir com o mesmo identificador.
      if (isNetworkError(error)) request.error = "Sem resposta do servidor. Toque de novo: a mesma solicitação é reenviada, sem duplicar.";
      else {
        // Recusa do servidor: a mensagem fica no formulário; a próxima tentativa é uma solicitação nova.
        request.error = errorText(error);
        request.id = newRequestId();
      }
    }
    await loadMagSummary([sensorId]).catch(() => {});
    if ($id("magService")) $id("magService").dataset.signature = "";
    updateDrawerLive();
  });
}

// ---- 64-bench.js ----
// =============================================================================
// Modo bancada do sensor magnético (demonstração em mesa).
//   * Ativação explícita, com prévia antes de aplicar. Enquanto está ativo, cartão, árvore,
//     Detalhes, gráfico e CSV dizem "bancada": o número é a Posição de bancada (%), nunca o
//     curso de ajuste restante, e nada vai para a série de campo.
//   * O percentual é calculado no servidor pela contagem contínua que a placa mantém (firmware
//     4.5.0): limitado a 0–100 %, com o quanto passou do extremo guardado ao lado.
//   * Faixas simuladas (Sem ajuste, Baixo, Médio, Alto): preferência do vínculo, guardada no
//     servidor e ligada por padrão. Muda só a apresentação: não abre sessão, não pede referência
//     e não cria registro. A regra e as cores estão em 10-core.js (benchSimOf).
//   * Alterar a faixa: a prévia é calculada sozinha depois que a pessoa para de digitar; só
//     "Aplicar nova faixa" grava. A atualização periódica não toca no formulário aberto.
//   * A nuvem atualiza a cada envio da placa (30 s na bancada). A tela mostra sempre a hora da
//     última atualização, e leitura atrasada aparece como última leitura válida, não como atual.
//   * Sessão da placa diferente da confirmada = "Reposicionar para retomar": a última leitura boa
//     fica à vista, com horário, e nenhum número é inventado.
// =============================================================================
const BENCH_DEFAULT = { zero: 80, full: 180, direction: 1 };
const MAG15_MISSING_TEXT = "Esta função depende da atualização do banco desta revisão (migração 15), que ainda não foi aplicada.";
const benchForms = new Map(); // sensor → formulário da faixa (valores digitados, prévia, fase)
const benchRequests = new Map(); // sensor → identificador da operação em envio (o mesmo nas novas tentativas)
const benchBusy = new Set(); // sensores com a preferência de faixas em envio
const benchFormOf = (sensorId) => {
  if (!benchForms.has(sensorId)) benchForms.set(sensorId, { open: false, zero: "", full: "", direction: "1", preview: null, previewKey: "", phase: "empty", error: "", token: 0, timer: null, note: "" });
  return benchForms.get(sensorId);
};
const benchDirWord = (direction) => (Number(direction) > 0 ? "crescente" : "decrescente");
const benchDirText = (direction) => (Number(direction) > 0 ? "crescente (o percentual sobe quando o ângulo sobe)" : "decrescente (o percentual sobe quando o ângulo desce)");
const benchRangeText = (zero, full, direction) => `${fmtDeg(zero, 1)} = 0 % · ${fmtDeg(full, 1)} = 100 % · ${benchDirWord(direction)}`;
// Graus entre os dois extremos, no sentido escolhido (mesma conta de gaxeta_private.mag_bench_u).
const benchSpanOf = (zero, full, direction) => ((((full - zero) * direction) % 360) + 360) % 360;
// Ângulo do chip em que a faixa vale a fração indicada (0 a 1).
const benchAngleAt = (zero, span, direction, fraction) => (((zero + direction * span * fraction) % 360) + 360) % 360;
// Graus digitados com vírgula ou ponto: 0 a 359,999.
function parseBenchDeg(text) {
  const raw = String(text ?? "").trim().replace(",", ".").replace("°", "");
  if (!/^\d+(\.\d{1,3})?$/.test(raw)) return NaN;
  const value = Number(raw);
  return value >= 0 && value < 360 ? value : NaN;
}
// Conferência local do que está digitado, antes de pedir a prévia ao servidor.
//   empty    falta preencher          invalid  não forma uma faixa (com o motivo)
//   same     igual à faixa em uso     ready    pode pedir a prévia
function benchFormCheck(form, bench) {
  if (!String(form.zero).trim() || !String(form.full).trim()) return { phase: "empty", message: "" };
  const zero = parseBenchDeg(form.zero);
  const full = parseBenchDeg(form.full);
  const direction = Number(form.direction) < 0 ? -1 : 1;
  if (Number.isNaN(zero) || Number.isNaN(full)) return { phase: "invalid", message: "Informe os dois ângulos em graus, de 0 a 359,999 (vírgula ou ponto, até três casas)." };
  if (zero === full) return { phase: "invalid", message: "Os dois ângulos são iguais: a faixa ficaria com 0°. Escolha ângulos diferentes para 0 % e para 100 %." };
  const span = benchSpanOf(zero, full, direction);
  if (span < 5 || span > 355)
    return { phase: "invalid", message: `No sentido ${benchDirWord(direction)}, esta faixa teria ${fmtDeg(span, 1)}. Ela precisa ter de 5° a 355°: troque o sentido ou os ângulos.` };
  const values = { zero, full, direction, span, key: `${zero}|${full}|${direction}` };
  if (bench && Number(bench.zero_deg) === zero && Number(bench.full_deg) === full && Number(bench.direction) === direction) return { phase: "same", values, message: "" };
  return { phase: "ready", values, message: "" };
}
// Prévia: a faixa em uso ao lado da proposta, com 0 %, 50 %, 100 % e a posição atual.
function benchPreviewHtml(preview, bench, currentShown) {
  if (!preview) return "";
  const current = preview.current;
  const mark = (percent) => preview.marks.find((item) => Number(item.percent) === percent)?.angle_deg;
  const old = bench ? { zero: Number(bench.zero_deg), span: Number(bench.span_deg), direction: Number(bench.direction) } : null;
  const row = (label, before, after) => `<tr><th scope="row">${label}</th>${old ? `<td>${before}</td>` : ""}<td>${after}</td></tr>`;
  const oldAt = (fraction) => esc(fmtDeg(benchAngleAt(old.zero, old.span, old.direction, fraction), 1));
  return (
    `<div class="bench-preview" id="benchPreview"><h4>Prévia ${bench ? "da nova faixa" : "da faixa"} (nada foi aplicado ainda)</h4>` +
    `<table><thead><tr><th></th>${old ? "<th>Faixa em uso</th>" : ""}<th>${bench ? "Nova faixa" : "Faixa proposta"}</th></tr></thead><tbody>` +
    row("0 %", old ? oldAt(0) : "", esc(fmtDeg(mark(0), 1))) +
    row("50 %", old ? oldAt(0.5) : "", esc(fmtDeg(mark(50), 1))) +
    row("100 %", old ? oldAt(1) : "", esc(fmtDeg(mark(100), 1))) +
    row("Sentido", old ? benchDirWord(old.direction) : "", benchDirWord(preview.direction)) +
    row("Tamanho da faixa", old ? esc(fmtDeg(old.span, 1)) : "", esc(fmtDeg(preview.span_deg, 1))) +
    (current
      ? row(`Posição atual (${esc(fmtDeg(current.angle_deg, 2))})`, currentShown == null ? "—" : esc(fmtNum(currentShown, 2)) + " %", current.inside ? `<b>${esc(fmtNum(current.percent, 2))} %</b>` : "<b>fora da faixa</b>")
      : "") +
    `</tbody></table>` +
    `<p>Fora da faixa a barra fica em 0 % ou em 100 % e o quanto passou é guardado.</p>` +
    (current
      ? current.inside
        ? `<p class="bench-ok">O eixo está dentro da ${bench ? "nova " : ""}faixa: depois de aplicar, basta tocar em Confirmar início com ele parado.</p>`
        : `<p class="bench-warn">A leitura atual (${esc(fmtDeg(current.angle_deg, 2))}) está <b>fora da ${bench ? "nova " : ""}faixa</b>. Depois de aplicar, gire o eixo para um ponto entre os dois extremos antes de confirmar o início.</p>`
      : `<p class="bench-warn">Sem ângulo válido na leitura atual: confira o ímã e o sensor antes de confirmar o início.</p>`) +
    (preview.continuity ? "" : `<p class="bench-warn">A última leitura desta placa veio sem contagem contínua (firmware ${esc(preview.firmware_version || "desconhecido")}). O Modo bancada precisa do firmware 4.5.0 ou mais novo: sem ele a tela mostra "Sem contagem contínua", sem percentual.</p>`) +
    (preview.ends_reference ? `<p class="bench-warn">Este vínculo tem um engaxetamento de campo em andamento. Ativar o Modo bancada <b>encerra essa referência</b>; ao sair será preciso registrar o engaxetamento de novo.</p>` : "") +
    `</div>`
  );
}
// Formulário da faixa (ativar ou alterar). O conteúdo que muda sozinho (prévia, mensagem, botão
// Aplicar) é pintado por benchPreviewPaint, sem refazer os campos.
function benchFormHtml(form, bench) {
  return (
    `<form id="benchForm" novalidate>` +
    (bench ? `<p class="bench-inuse"><span>Faixa em uso</span><strong>${esc(benchRangeText(bench.zero_deg, bench.full_deg, bench.direction))}</strong></p>` : "") +
    `<p class="form-help">Escolha qual ângulo do sensor vale <b>0 %</b> e qual vale <b>100 %</b>. Use os ângulos que aparecem em "Ângulo do sensor" com o eixo em cada extremo. O sentido diz para que lado o percentual sobe.` +
    (bench ? " A faixa em uso continua valendo enquanto você digita, e também se cancelar." : " Proposta inicial do ensaio: 80° = 0 % e 180° = 100 %, crescente.") + `</p>` +
    `<div class="bench-fields"><label>Ângulo que vale 0 % (graus)<input id="benchZero" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(form.zero)}"></label>` +
    `<label>Ângulo que vale 100 % (graus)<input id="benchFull" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(form.full)}"></label>` +
    `<label>Sentido<select id="benchDirection"><option value="1"${form.direction === "1" ? " selected" : ""}>Crescente: sobe com o ângulo</option><option value="-1"${form.direction === "-1" ? " selected" : ""}>Decrescente: sobe quando o ângulo desce</option></select></label></div>` +
    `<p class="bench-invert"><button class="text-button" type="button" id="benchInvert" title="Troca os dois ângulos entre si e muda o sentido: o que valia 0 % passa a valer 100 %.">Inverter a faixa: trocar os ângulos de 0 % e de 100 %</button><span id="benchInvertNote">${esc(form.note)}</span></p>` +
    `<p id="benchMessage" class="form-message" role="status"></p>` +
    `<div id="benchPreviewBox" aria-live="polite"></div>` +
    `<p id="benchApplyHelp" class="form-help"></p>` +
    `<div class="drawer-actions"><button class="primary" type="submit" id="benchApply" disabled>${bench ? "Aplicar nova faixa" : "Ativar Modo bancada"}</button>` +
    `<button class="secondary" type="button" id="benchPreviewBtn">Calcular prévia</button>` +
    `<button class="secondary" type="button" id="benchFormCancel">Cancelar</button></div></form>`
  );
}
// Pinta o que depende da fase da prévia, sem tocar nos campos digitados.
function benchPreviewPaint(sensorId) {
  const form = benchFormOf(sensorId);
  if (!form.open || !$id("benchForm")) return;
  const mag = deviceMag(findDevice(sensorId));
  const bench = mag?.bench || null;
  const shown = bench && bench.state === "ok" ? benchShown(bench.percent) : null;
  const ready = form.phase === "shown" && !!form.preview;
  $id("benchPreviewBox").innerHTML = form.phase === "loading" ? `<p class="bench-loading">Calculando a prévia destes valores…</p>` : ready ? benchPreviewHtml(form.preview, bench, shown) : "";
  const message = $id("benchMessage");
  message.textContent = form.error || "";
  message.classList.toggle("is-error", !!form.error);
  $id("benchApply").disabled = !ready;
  $id("benchPreviewBtn").hidden = form.phase !== "error";
  $id("benchInvertNote").textContent = form.note || "";
  $id("benchApplyHelp").textContent =
    form.phase === "shown"
      ? bench
        ? "Só Aplicar nova faixa altera a configuração. Ao aplicar, a faixa em uso é encerrada (fica no histórico) e será preciso tocar em Confirmar início com o eixo parado dentro da nova faixa."
        : "Ao ativar, ponha o eixo parado dentro da faixa e toque em Confirmar início."
      : form.phase === "same"
        ? "Esta já é a faixa em uso: não há o que aplicar. A referência atual continua valendo."
        : form.phase === "loading"
          ? "Aplicar fica disponível assim que a prévia destes valores aparecer: só se aplica o que foi visto."
          : form.phase === "error"
            ? "Aplicar aguarda a prévia, para que só seja aplicado o que foi visto. Toque em Calcular prévia para tentar de novo."
            : "A prévia aparece sozinha quando os dois ângulos formam uma faixa válida. Aplicar aguarda a prévia.";
}
// Pede a prévia depois de uma pausa na digitação. Cada edição invalida a resposta de uma edição
// anterior que ainda esteja a caminho (token).
function benchSchedulePreview(sensorId, immediate = false) {
  const form = benchFormOf(sensorId);
  const bench = deviceMag(findDevice(sensorId))?.bench || null;
  clearTimeout(form.timer);
  const token = ++form.token;
  const check = benchFormCheck(form, bench);
  if (check.phase !== "ready") {
    Object.assign(form, { phase: check.phase, preview: null, previewKey: "", error: check.message });
    return benchPreviewPaint(sensorId);
  }
  if (form.preview && form.previewKey === check.values.key) {
    Object.assign(form, { phase: "shown", error: "" });
    return benchPreviewPaint(sensorId);
  }
  Object.assign(form, { phase: "loading", preview: null, previewKey: "", error: "" });
  benchPreviewPaint(sensorId);
  form.timer = setTimeout(async () => {
    try {
      const preview = await callRpc("gaxeta_mag_bench_preview", { p_sensor_id: sensorId, p_zero_deg: check.values.zero, p_full_deg: check.values.full, p_direction: check.values.direction });
      if (token !== form.token || !form.open) return; // resposta de uma edição anterior
      Object.assign(form, { phase: "shown", preview, previewKey: check.values.key, error: "" });
    } catch (error) {
      if (token !== form.token || !form.open) return;
      Object.assign(form, { phase: "error", preview: null, previewKey: "", error: isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error) });
    }
    benchPreviewPaint(sensorId);
  }, immediate ? 0 : 450);
}
// Espera pela leitura que confirma o início.
function benchWaitText(device, pending) {
  const period = Number(deviceInterval(device)) || 30;
  const now = Date.now() + state.clockOffset;
  const sinceLast = (now - new Date(device.last_received_at).getTime()) / 1000;
  const next = Math.max(0, Math.round(period - (sinceLast % period)));
  const left = Math.max(0, Math.round((new Date(pending.expires_at).getTime() - now) / 1000));
  return `Próxima leitura em cerca de ${fmtInterval(next)} (um envio a cada ${fmtInterval(period)}). A confirmação vale por mais ${fmtInterval(left)}.`;
}
function benchUpdatedText(device) {
  const period = Number(deviceInterval(device)) || 30;
  const age = Math.max(0, Math.round((Date.now() + state.clockOffset - new Date(device.last_received_at).getTime()) / 1000));
  return `${fmtDateTime(device.last_received_at)} · há ${fmtInterval(age)} · um envio a cada ${fmtInterval(period)}`;
}
// Andamento depois de aplicar uma faixa: aplicada → confirmação pedida → início confirmado, com a hora.
function benchStepsHtml(device, bench, pending, state2) {
  const anchored = state2 === "ok" && bench.anchor_status === "set";
  const recent = anchored && bench.anchor_at && Date.now() + state.clockOffset - new Date(bench.anchor_at).getTime() < 5 * 60e3;
  if (anchored && !recent) return "";
  const step = (kind, html) => `<li class="${kind}">${html}</li>`;
  return (
    `<ol class="bench-steps" aria-label="Andamento da confirmação do início">` +
    step("done", `Faixa aplicada às ${esc(fmtClock(bench.started_at))}`) +
    step(
      anchored ? "done" : "current",
      anchored
        ? "Início pedido com o eixo parado dentro da faixa"
        : pending
          ? `Confirmação pedida às ${esc(fmtClock(pending.requested_at))}. Deixe o eixo parado: o resultado aparece após uma leitura válida da placa. <span id="benchWait">${esc(benchWaitText(device, pending))}</span>`
          : state2 === "reposition"
            ? "Leve o eixo a um ponto conhecido dentro da faixa, deixe-o parado e toque em Confirmar referência"
            : "Posicione o eixo dentro da faixa, deixe-o parado e toque em Confirmar início",
    ) +
    step(anchored ? "done" : "todo", anchored ? `Início confirmado às ${esc(fmtClock(bench.anchor_at))}` : "Início confirmado (a hora aparece aqui)") +
    `</ol>`
  );
}
// Parte que acompanha a leitura: barra de 0 a 100 %, número, faixa simulada, estado e fatos.
function benchLiveHtml(device, view, bench, pending, state2) {
  const sim = view.sim;
  const has = view.scale != null;
  const over = Number(bench.over_deg) || 0;
  const stale = has && !deviceStatus(device).online;
  const lastOk = bench.last_ok;
  const reading = view.mag?.reading || null;
  const sampleBad = /^(bus_|no_magnet|field_|no_reading)/.test(view.reason || "");
  const stateHtml =
    state2 === "ok" || state2 === "pending"
      ? state2 === "pending" && bench.anchor_note && BENCH_NOTE_TEXT[bench.anchor_note]
        ? `<p class="bench-warn">${esc(BENCH_NOTE_TEXT[bench.anchor_note])}</p>`
        : ""
      : state2 === "reposition"
        ? `<p class="bench-warn"><strong>Reposicionar para retomar.</strong> A placa deixou de garantir a continuidade do giro (${esc(ctLossText(bench.lost_reason))}${bench.lost_at ? ", " + esc(fmtDateTime(bench.lost_at)) : ""}): a posição atual pode estar em outra volta. Leve o eixo a um ponto conhecido dentro da faixa e confirme a referência.</p>`
        : state2 === "no_continuity"
          ? `<p class="bench-warn">${esc(MAG_REASON.bench_no_continuity.note)}</p>`
          : `<p class="bench-warn"><strong>Início não confirmado.</strong> Ponha o eixo parado em um ponto dentro da faixa (entre ${esc(fmtDeg(bench.zero_deg, 1))} e ${esc(fmtDeg(bench.full_deg, 1))}) e toque em Confirmar início. Um ângulo fora da faixa poderia pertencer a várias voltas.</p>` +
            (bench.anchor_note && BENCH_NOTE_TEXT[bench.anchor_note] ? `<p class="bench-warn">${esc(BENCH_NOTE_TEXT[bench.anchor_note])}</p>` : "");
  return (
    `<div class="bench-bar${has ? "" : " idle"}${sim ? " health-" + sim.key : ""}" role="img" aria-label="Posição de bancada: ${has ? view.value + " por cento" + (sim ? ", faixa simulada " + sim.label : "") : "sem posição"}">` +
    `<i style="width:${view.scale ?? 0}%"></i>` + (view.benchBands ? `<b style="left:30%"></b><b style="left:50%"></b><b style="left:73%"></b>` : "") +
    `<span class="bench-mark" style="left:0">0 %</span><span class="bench-mark" style="left:50%">50</span><span class="bench-mark" style="left:100%">100 %</span></div>` +
    `<p class="bench-number${sim ? " health-" + sim.key : ""}${stale ? " is-stale" : ""}"><strong id="benchPercent">${has ? esc(view.value) + " %" : "—"}</strong>${benchSimChip(sim, " is-large")}` +
    `<span id="benchLimit">${has ? (over > 0 ? `no teto · ${esc(fmtDeg(over, 1))} além do 100 %` : over < 0 ? `no piso · ${esc(fmtDeg(-over, 1))} abaixo do 0 %` : "dentro da faixa") : ""}</span></p>` +
    // Sem posição não há faixa: a régua das faixas só aparece junto de um percentual válido.
    (view.benchBands && has
      ? `<ul class="sim-scale" aria-label="Faixas simuladas da bancada">${BENCH_SIM_ORDER.map((name) => `<li class="health-${BENCH_SIM[name].key}${sim?.band === name ? " is-current" : ""}"><b>${esc(BENCH_SIM[name].label)}</b><small title="${esc(BENCH_SIM[name].range)}">${esc(BENCH_SIM[name].short)}</small></li>`).join("")}</ul>` +
        `<p class="bench-sim">Faixa simulada: na bancada este percentual é a fração de um arco entre dois ângulos, não o curso de ajuste restante.</p>`
      : "") +
    (stale ? `<p class="bench-warn"><strong>Última leitura válida às ${esc(fmtClock(device.last_received_at))}.</strong> A placa está sem atualização há ${esc(agoText(device.last_received_at))}: o número acima não é a posição atual.</p>` : "") +
    (sampleBad ? `<p class="bench-warn"><strong>${esc(view.label)}.</strong> ${esc(view.note)}</p>` : "") +
    stateHtml +
    (!has && lastOk ? `<p class="mag-current">Última leitura válida: ${esc(fmtNum(benchShown(lastOk.percent), 2))} % em ${esc(fmtDateTime(lastOk.at))} (não é a leitura atual).</p>` : "") +
    benchStepsHtml(device, bench, pending, state2) +
    `<dl class="bench-facts">` +
    `<dt>Ângulo / bruto</dt><dd>${view.raw == null ? "sem ângulo" : esc(fmtDeg(view.degrees, 2)) + " · " + view.raw}</dd>` +
    `<dt>Posição contínua</dt><dd>${bench.continuous_deg == null ? "—" : esc(fmtDeg(bench.continuous_deg, 2)) + ` · ${bench.turns > 0 ? "+" : ""}${bench.turns} volta(s)`}</dd>` +
    `<dt>Sessão da placa</dt><dd>${esc(reading?.ct?.session || "sem contagem")}${bench.anchor_at ? " · início confirmado " + esc(fmtDateTime(bench.anchor_at)) : ""}</dd>` +
    `<dt>Última atualização</dt><dd id="benchUpdated">${esc(benchUpdatedText(device))}</dd></dl>` +
    `<p class="form-help">A nuvem atualiza a cada envio da placa. Para acompanhar o giro em tempo real, use o monitor serial pela USB: ele mostra a mesma conta, linha a linha.</p>`
  );
}
// Faixa em uso, ações e a preferência das faixas simuladas (ou o formulário, quando aberto).
function benchControlsHtml(view, bench, state2, form, canOperate, sensorId) {
  if (form.open) return benchFormHtml(form, bench);
  if (!bench)
    return canOperate
      ? `<div class="drawer-actions"><button class="secondary" type="button" id="benchOpen">Configurar e ativar…</button></div>`
      : `<p class="form-help">Sua conta consulta este sensor, sem permissão para ativar o Modo bancada.</p>`;
  const inUse =
    `<p class="bench-inuse"><span>Faixa em uso</span><strong>${esc(benchRangeText(bench.zero_deg, bench.full_deg, bench.direction))}</strong></p>` +
    `<p class="form-help">O operador escolhe qual ângulo vale 0 % e qual vale 100 %.${canOperate ? " Para mudar, toque em Alterar faixa da bancada: os valores em uso aparecem para edição." : ""}</p>`;
  if (!canOperate)
    return inUse + `<p class="form-help">Faixas simuladas da bancada: <b>${view.benchBands ? "ligadas" : "desligadas"}</b> (escolha de quem opera o sensor). Sua conta consulta este sensor, sem permissão para operar o Modo bancada.</p>`;
  return (
    inUse +
    `<div class="drawer-actions">` +
    (state2 === "pending" ? "" : `<button class="${state2 === "ok" ? "secondary" : "primary"}" type="button" id="benchConfirm">${state2 === "reposition" ? "Confirmar referência (reposicionado)" : state2 === "ok" ? "Confirmar referência de novo" : "Confirmar início"}</button>`) +
    `<button class="secondary" type="button" id="benchOpen">Alterar faixa da bancada…</button><button class="secondary" type="button" id="benchStop">Sair do Modo bancada</button></div>` +
    `<label class="check bench-sim-toggle"><input id="benchBands" type="checkbox"${view.benchBands ? " checked" : ""}${benchBusy.has(sensorId) ? " disabled" : ""}> Mostrar faixas simuladas da bancada</label>` +
    `<p class="form-help">Mostra o nome e a cor da faixa (Sem ajuste, Baixo, Médio, Alto) junto do percentual em Sensores, Ativos e Telemetria, no site e no aplicativo. Muda só a apresentação: a referência e o histórico ficam como estão.</p>`
  );
}
function benchForceRedraw() {
  const box = $id("magBench");
  if (box) box.dataset.live = box.dataset.controls = "";
}
function renderMagBench(device, view) {
  const box = $id("magBench");
  if (!box) return;
  const mag = view.mag;
  const bench = mag?.bench || null;
  const sensorId = device.sensor_id;
  const form = benchFormOf(sensorId);
  const reading = mag?.reading || null;
  if (!mag || !mag.linked) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  if (!$id("benchLive")) {
    box.innerHTML = `<h3 id="benchTitle"></h3><div id="benchLive" class="bench-live"></div><div id="benchControls" class="bench-controls"></div><p id="benchMessage2" class="form-message" role="status"></p>`;
    box.dataset.live = box.dataset.controls = "";
  }
  const pending = bench?.pending && !bench.pending.expired ? bench.pending : null;
  const state2 = !bench ? "off" : pending ? "pending" : bench.state;
  box.className = "mag-bench" + (bench ? " is-active" : "");
  // Leitura: só é redesenhada quando muda, e nunca toca no formulário.
  const online = deviceStatus(device).online;
  const anchoredRecently = !!bench?.anchor_at && Date.now() + state.clockOffset - new Date(bench.anchor_at).getTime() < 5 * 60e3;
  const liveSignature = [state2, bench?.id, bench?.anchor_status, bench?.anchor_note, bench?.lost_reason, bench?.anchor_at, anchoredRecently, view.benchBands, view.key, view.value, bench?.over_deg, reading?.id, view.reason, online, form.open && !bench].join("|");
  if (box.dataset.live !== liveSignature) {
    box.dataset.live = liveSignature;
    $id("benchTitle").innerHTML = bench ? `<span class="series-tag is-bench">Modo bancada</span> Posição de bancada (%)` : "Modo bancada";
    $id("benchLive").innerHTML = bench
      ? benchLiveHtml(device, view, bench, pending, state2)
      : form.open
        ? `<p class="form-help">Para demonstração em mesa: gire o ímã com a mão e acompanhe uma barra de 0 a 100 %. A série fica identificada como bancada em todas as telas e não entra no histórico de campo.</p>`
        : `<p class="form-help">Desligado. Serve para demonstrar o sensor na mesa, com uma barra de 0 a 100 % entre dois ângulos escolhidos.</p>`;
  } else {
    if (pending && $id("benchWait")) $id("benchWait").textContent = benchWaitText(device, pending);
    if ($id("benchUpdated")) $id("benchUpdated").textContent = benchUpdatedText(device);
  }
  // Ações e formulário: com o formulário aberto, a atualização periódica não redesenha nada aqui.
  const controlSignature = form.open
    ? ["form", bench?.id || "novo", mag.can_operate].join("|")
    : [state2, bench?.id, bench?.zero_deg, bench?.full_deg, bench?.direction, mag.can_operate, view.benchBands, benchBusy.has(sensorId)].join("|");
  if (box.dataset.controls !== controlSignature) {
    box.dataset.controls = controlSignature;
    $id("benchControls").innerHTML = benchControlsHtml(view, bench, state2, form, !!mag.can_operate, sensorId);
    bindMagBench(sensorId);
    if (form.open) benchPreviewPaint(sensorId);
  }
}
// Redesenha todas as telas que mostram a bancada deste sensor (cartão, árvore, Ativos, gráfico).
function benchRepaint() {
  benchForceRedraw();
  updateDrawerLive();
  if (state.page === "sensors") renderSensorGrid();
  renderTree();
  if (state.page === "assets") renderInspector().catch(() => {});
  if (state.page === "telemetry") renderHistory();
  renderIcons();
}
function bindMagBench(sensorId) {
  const form = benchFormOf(sensorId);
  const refresh = async () => {
    await loadMagSummary([sensorId]).catch(() => {});
    if ($id("magService")) $id("magService").dataset.signature = "";
    benchRepaint();
  };
  const redraw = () => {
    benchForceRedraw();
    updateDrawerLive();
  };
  const closeForm = () => {
    clearTimeout(form.timer);
    form.token++;
    Object.assign(form, { open: false, preview: null, previewKey: "", phase: "empty", error: "", note: "" });
  };
  if ($id("benchOpen"))
    $id("benchOpen").onclick = () => {
      // Ao abrir, os campos trazem a faixa em uso. Nada é enviado até Aplicar.
      const bench = deviceMag(findDevice(sensorId))?.bench;
      Object.assign(form, {
        open: true, preview: null, previewKey: "", error: "", note: "",
        zero: fmtMmInput(bench?.zero_deg ?? BENCH_DEFAULT.zero), full: fmtMmInput(bench?.full_deg ?? BENCH_DEFAULT.full), direction: String(bench?.direction ?? BENCH_DEFAULT.direction),
      });
      redraw();
      benchSchedulePreview(sensorId, true);
      $id("benchZero")?.focus();
    };
  if ($id("benchFormCancel"))
    $id("benchFormCancel").onclick = () => {
      closeForm();
      redraw();
    };
  // O que é digitado fica guardado a cada tecla: um redesenho nunca devolve um valor antigo.
  const typed = () => {
    Object.assign(form, { zero: $id("benchZero").value, full: $id("benchFull").value, direction: $id("benchDirection").value, note: "" });
    benchSchedulePreview(sensorId);
  };
  for (const id of ["benchZero", "benchFull"]) if ($id(id)) $id(id).oninput = typed;
  if ($id("benchDirection")) $id("benchDirection").onchange = typed;
  if ($id("benchInvert"))
    $id("benchInvert").onclick = () => {
      const zero = $id("benchZero").value;
      const direction = $id("benchDirection").value === "1" ? "-1" : "1";
      $id("benchZero").value = $id("benchFull").value;
      $id("benchFull").value = zero;
      $id("benchDirection").value = direction;
      Object.assign(form, { zero: $id("benchZero").value, full: $id("benchFull").value, direction });
      const check = benchFormCheck(form, null);
      form.note = check.values ? `Invertida: ${benchRangeText(check.values.zero, check.values.full, check.values.direction)}.` : "";
      benchSchedulePreview(sensorId, true);
    };
  if ($id("benchPreviewBtn")) $id("benchPreviewBtn").onclick = () => benchSchedulePreview(sensorId, true);
  if ($id("benchForm"))
    $id("benchForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        const bench = deviceMag(findDevice(sensorId))?.bench || null;
        Object.assign(form, { zero: $id("benchZero").value, full: $id("benchFull").value, direction: $id("benchDirection").value });
        const check = benchFormCheck(form, bench);
        // Só se aplica o que a prévia mostrou: valores iguais aos da prévia em tela.
        if (check.phase !== "ready" || !form.preview || form.previewKey !== check.values.key) return benchSchedulePreview(sensorId, true);
        const values = check.values;
        const key = `start:${values.key}`;
        const previous = benchRequests.get(sensorId);
        const request = previous?.key === key ? previous : { key, id: newRequestId() };
        benchRequests.set(sensorId, request);
        try {
          const result = await callRpc("gaxeta_mag_bench_start", { p_sensor_id: sensorId, p_request_id: request.id, p_zero_deg: values.zero, p_full_deg: values.full, p_direction: values.direction });
          benchRequests.delete(sensorId);
          closeForm();
          showMessage(
            result?.unchanged
              ? "A faixa informada já era a faixa em uso. Nada foi alterado: a referência atual continua valendo."
              : "Posicione o eixo dentro da nova faixa, deixe-o parado e toque em Confirmar início. O resultado aparece após uma leitura válida da placa, normalmente no próximo envio.",
            "success",
          );
        } catch (error) {
          if (!isNetworkError(error)) benchRequests.delete(sensorId);
          Object.assign(form, { phase: "error", error: isNetworkError(error) ? "Sem resposta do servidor. Toque de novo em Aplicar: a mesma solicitação é reenviada, sem duplicar." : isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error) });
          if (isNetworkError(error)) form.phase = "shown";
          return benchPreviewPaint(sensorId);
        }
        await refresh();
      });
    };
  if ($id("benchConfirm"))
    $id("benchConfirm").onclick = (event) =>
      withBusy(event.currentTarget, async () => {
        const previous = benchRequests.get(sensorId);
        const request = previous?.key === "confirm" ? previous : { key: "confirm", id: newRequestId() };
        benchRequests.set(sensorId, request);
        try {
          await callRpc("gaxeta_mag_bench_confirm", { p_sensor_id: sensorId, p_request_id: request.id });
          benchRequests.delete(sensorId);
          showMessage("Confirmação registrada. Deixe o eixo parado: o resultado aparece após uma leitura válida da placa, normalmente no próximo envio.", "success");
        } catch (error) {
          if (!isNetworkError(error)) benchRequests.delete(sensorId);
          if ($id("benchMessage2")) $id("benchMessage2").textContent = isNetworkError(error) ? "Sem resposta do servidor. Toque de novo: a mesma confirmação é reenviada." : errorText(error);
          return;
        }
        if ($id("benchMessage2")) $id("benchMessage2").textContent = "";
        await refresh();
      });
  if ($id("benchStop"))
    $id("benchStop").onclick = async (event) => {
      const button = event.currentTarget;
      if (!(await askConfirm({ title: "Sair do Modo bancada", okLabel: "Sair do Modo bancada", danger: false,
        html: `<p>O sensor volta à série de campo. As leituras de bancada ficam no histórico, identificadas como bancada.</p><p>Para acompanhar o curso de ajuste restante será preciso registrar o engaxetamento de novo.</p>` }))) return;
      await withBusy(button, async () => {
        try {
          await callRpc("gaxeta_mag_bench_stop", { p_sensor_id: sensorId });
          closeForm();
          showMessage("Modo bancada desligado.", "success");
        } catch (error) {
          showMessage(errorText(error), "error");
        }
        await refresh();
      });
    };
  // Faixas simuladas: muda só a apresentação. A tela troca na hora e a escolha vai para o
  // servidor, para o outro cliente (site ou aplicativo) abrir igual.
  if ($id("benchBands"))
    $id("benchBands").onchange = async () => {
      const want = $id("benchBands").checked;
      benchBandsLocal.set(sensorId, want);
      benchBusy.add(sensorId);
      benchRepaint();
      let note = "";
      try {
        await callRpc("gaxeta_mag_bench_set_bands", { p_sensor_id: sensorId, p_show: want });
        await loadMagSummary([sensorId]).catch(() => {});
        benchBandsLocal.delete(sensorId);
      } catch (error) {
        if (isMissingFeature(error)) {
          // Banco ainda sem a migração 16: a escolha vale neste aparelho até a atualização.
          try {
            localStorage.setItem("gaxeta.benchBands." + sensorId, want ? "1" : "0");
          } catch {}
          benchBandsLocal.delete(sensorId);
          note = "Escolha guardada só neste aparelho: o banco ainda não recebeu a atualização que a compartilha (migração 16).";
        } else {
          benchBandsLocal.delete(sensorId);
          note = isNetworkError(error) ? "Sem resposta do servidor: a escolha não foi gravada. Tente de novo." : errorText(error);
        }
      }
      benchBusy.delete(sensorId);
      benchRepaint();
      if ($id("benchMessage2")) $id("benchMessage2").textContent = note;
    };
}

// ---- 65-assets.js ----
// =============================================================================
// Ativos: ficha do nível selecionado, formulários persistentes (RPCs com
// autorização no servidor), exclusão com dependências e vínculo sensor–spot.
//   * TAG: um campo obrigatório (o identificador do equipamento), tipo de
//     equipamento e ficha técnica gravados numa operação (gaxeta_save_equipment).
//   * Ao selecionar um TAG: TAG · tipo, contagem e lista de spots com sensor,
//     condição e transmissão, lidos do banco numa chamada (gaxeta_equipment_overview).
//   * Spot: nome por seleção (LOA, LA, UNICO); posição de montagem em texto livre.
//   * Excluir equipamento: nome e TAG na confirmação; bloqueio explicado quando há
//     spots, sensores ou histórico (o servidor valida permissão e dependências).
// =============================================================================
const HIERARCHY_GUIDE =
  '<ol class="hierarchy-guide"><li>Corporação</li><li>Empresa</li><li>Área</li><li>Subárea <em>(opcional)</em></li><li>TAG (equipamento)</li><li>Spot → sensor</li></ol>' +
  '<div class="table-wrap rule-table"><table><thead><tr><th>Nível selecionado</th><th>Próxima criação</th></tr></thead><tbody>' +
  "<tr><td>Corporação</td><td>Empresa</td></tr><tr><td>Empresa</td><td>Área</td></tr><tr><td>Área</td><td>TAG ou Subárea</td></tr>" +
  "<tr><td>Subárea</td><td>TAG</td></tr><tr><td>TAG</td><td>Spot</td></tr><tr><td>Spot</td><td>Vínculo de um sensor existente</td></tr></tbody></table></div>" +
  "<p>A área é obrigatória e a subárea é opcional: o TAG fica direto na área ou dentro de uma subárea, nunca sob a empresa. O gateway é cadastrado na empresa, pela tela Gateways.</p>";

// A ficha e o resumo do TAG dependem da migração 07. Sem ela, a tela diz o que falta em vez de falhar calada.
const isMissingFeature = (error) => error?.code === "PGRST202" || error?.code === "42883" || error?.code === "PGRST205" || error?.code === "42P01";
const MISSING_FEATURE_TEXT = "Esta função depende da atualização do banco desta revisão (migração 07), que ainda não foi aplicada.";

// "Corporação gravada", "TAG gravado": concordância com o nível.
const kindDone = (kind, verb) => verb + (["corporation", "company", "area", "subarea"].includes(kind) ? "a" : "o");
const canLinkAt = (access) => isAdminWriter() || (myRole() === "corp" && state.ctx.can_write && access === "full");
// Leitura do sensor no spot: posição elétrica (%) e condição do sinal.
const spotReading = (device) => {
  const view = deviceView(device);
  // Modo bancada: percentual, faixa simulada e horário na própria linha do spot e na ficha.
  if (view.bench) {
    const face = benchFace(device, view);
    return (
      `<span class="spot-reading${face.stale ? " is-stale" : ""}" title="Posição de bancada · ${esc(view.note)}">${face.has ? esc(view.value) + " %" : "—"}</span>` +
      (face.has && view.sim ? benchSimChip(view.sim) : face.has ? "" : `<span class="adjustment-badge health-${view.key}" title="${esc(view.note)}">${esc(view.label)}</span>`) +
      `<span class="series-tag is-bench" title="Série de bancada: demonstração em mesa. Não é curso de campo.">Modo bancada</span>` +
      `<small class="spot-time${face.stale ? " is-late" : ""}">${face.stale ? "última leitura válida " : "atualizado "}${esc(fmtClock(face.at))}</small>`
    );
  }
  return `<span class="spot-reading" title="${esc(view.magnetic ? view.kicker + " (sensor magnético)" : "Posição elétrica do potenciômetro (leitura atual)")}">${esc(view.value)}${view.unit ? (view.unit === "%" ? " %" : view.unit) : ""}</span><span class="adjustment-badge health-${view.key}" title="${esc(view.note)}">${esc(view.label)}</span>`;
};
const connBadge = (device) => {
  const status = deviceStatus(device);
  return `<span class="conn"><i class="dot ${status.className}"></i>${status.label}</span>`;
};

function inspectorActions(asset, childKinds) {
  return (
    `<div class="inspector-actions">` +
    childKinds.map((kind) => `<button class="primary compact" data-act="add" data-kind="${kind}">${icon("plus")}${KIND_LABEL[kind]}</button>`).join("") +
    (canEditAsset(asset) ? `<button class="secondary compact" data-act="edit">Editar</button>` : "") +
    (asset.kind === "company" ? `<button class="secondary compact" data-act="gateways">Gateways da empresa</button>` : "") +
    (hasCap("delete_records") && !isNativeApp()
      ? asset.kind === "equipment"
        ? `<button class="secondary compact danger-outline" data-act="delete">${glyph("trash")}Excluir equipamento</button>`
        : `<button class="text-button danger-text" data-act="delete">Excluir…</button>`
      : "") +
    `</div>`
  );
}
// Caminho até o nível acima, em uma linha discreta (o nome do próprio nível já é o título).
function parentPathLine(asset) {
  const parents = assetPath(asset.parent_id, state.assets).map(assetLabel);
  return parents.length ? `<p class="inspector-path" title="${esc(parents.join(" / "))}">${esc(parents.join(" / "))}</p>` : "";
}

function equipmentInspector(asset, overview, problem, magInfo = null) {
  const details = overview?.details || null;
  const type = equipCatalog.get(details?.equipment_type) || details?.equipment_type_label || "";
  const access = overview?.asset?.access || asset.access;
  const spots = overview?.spots || [];
  const tag = equipTag(asset);
  const linkable = canLinkAt(access);
  const spotRows = spots
    .map((spot) => {
      const sensor = spot.sensor;
      return (
        `<li class="spot-row${sensor ? "" : " empty"}">` +
        `<button class="spot-name" data-act="open-spot" data-spot="${spot.id}" title="Abrir o spot na árvore">${icon("map-pin")}<b>${esc(spot.name)}</b>${spot.standard_name ? "" : '<em class="legacy-flag" title="Nome anterior à padronização (LOA, LA, UNICO)">nome anterior</em>'}</button>` +
        `<span class="spot-position">${esc(spot.position || "Posição não informada")}</span>` +
        (sensor
          ? `<span class="spot-sensor"><b>${esc(deviceLabel(sensor))}</b>${spotReading(sensor)}${connBadge(sensor)}</span>` +
            `<span class="row-actions"><button class="secondary compact" data-act="sensor-detail" data-sensor="${esc(sensor.sensor_id)}">Detalhes</button><button class="secondary compact" data-act="sensor-history" data-sensor="${esc(sensor.sensor_id)}">Histórico</button></span>`
          : `<span class="spot-sensor none">Sem sensor vinculado</span>` +
            `<span class="row-actions">${linkable ? `<button class="primary compact" data-act="spot-link" data-spot="${spot.id}">Vincular sensor</button>` : ""}</span>`) +
        `</li>`
      );
    })
    .join("");
  const sheet = EQUIP_GROUPS.map(
    (group) =>
      `<section><h4>${group.title}</h4><dl class="detail-fields">` +
      group.fields.map(([key, label]) => `<dt>${esc(label)}</dt><dd${details?.[key] == null ? ' class="absent"' : ""}>${details?.[key] == null ? "—" : esc(details[key])}</dd>`).join("") +
      `</dl></section>`,
  ).join("") +
    // Sensor magnético: curso disponível típico do TAG (estimativa), editado em Editar.
    (magInfo
      ? `<section><h4>Sensor magnético</h4><dl class="detail-fields"><dt>Curso disponível típico</dt><dd${magInfo.suggested_course_mm == null ? ' class="absent"' : ""}>${esc(magAssetSummaryText(magInfo))}</dd>` +
        `<dt>Revisão sugerida</dt><dd${magInfo.geometry ? "" : ' class="absent"'}>${magInfo.geometry ? esc(geomText(magInfo.geometry)) : "—"}</dd></dl></section>`
      : "");
  const childKinds = allowedChildKinds({ ...asset, access });
  return (
    `<div class="inspector-card equip-card">` +
    `<header class="inspector-head"><div class="inspector-title"><span class="kind-chip">TAG</span>` +
    `<h2>${esc(tag)} <span class="equip-type${type ? "" : " unknown"}">· ${esc(type || TYPE_UNKNOWN)}</span></h2>${parentPathLine(asset)}</div>` +
    (overview ? `<div class="inspector-counts"><span><b>${overview.spot_count}</b> ${overview.spot_count === 1 ? "spot" : "spots"}</span><span><b>${overview.sensor_count}</b> ${overview.sensor_count === 1 ? "sensor vinculado" : "sensores vinculados"}</span></div>` : "") +
    `</header>` +
    (asset.tag && asset.name !== asset.tag ? `<p class="form-help">Nome cadastrado anteriormente: <b>${esc(asset.name)}</b>.</p>` : "") +
    (access === "path" ? '<p class="path-note">Este TAG aparece só como caminho até os spots concedidos à sua conta. A ficha técnica e os demais spots não fazem parte do seu acesso.</p>' : "") +
    (problem ? `<p class="path-note">${esc(problem)}</p>` : "") +
    inspectorActions(asset, childKinds) +
    (overview
      ? `<section class="spot-section"><h3>Spots</h3>` +
        (spotRows
          ? `<ul class="spot-list">${spotRows}</ul>`
          : `<p class="form-help">Nenhum spot neste TAG.${childKinds.includes("point") ? " Use <b>+ Spot</b> para criar o primeiro." : ""}</p>`) +
        `</section>`
      : "") +
    (access === "path" || !overview ? "" : `<section class="equip-sheet"><h3>Ficha técnica</h3><div class="sheet-groups">${sheet}</div></section>`) +
    `</div>`
  );
}

async function renderInspector() {
  const box = $id("assetInspector");
  const assetId = state.assetId;
  const asset = assetIndex.get(assetId);
  if (!asset) {
    box.innerHTML = `<div class="inspector-card"><h2>Estrutura de ativos</h2><p>Selecione um nível na árvore para ver os dados${isNativeApp() ? "" : ", editar ou criar o próximo nível"}.</p>${HIERARCHY_GUIDE}</div>`;
    return;
  }
  await ensureAssets([assetId]);
  let sensor = null;
  let overview = null;
  let problem = "";
  if (asset.kind === "point") {
    sensor = (await unwrap(sb.from("gaxeta_devices").select("*").eq("measurement_point_id", assetId).limit(1)))[0] || null;
    if (sensor) {
      mergeDevices([sensor]);
      await loadTelemetrySummary([sensor.sensor_id]).catch(() => {});
    }
  } else if (asset.kind === "equipment") {
    // Spots, sensores e ficha vêm do banco numa chamada: a contagem não depende do que a grade já carregou.
    const startedAt = Date.now();
    try {
      overview = await callRpc("gaxeta_equipment_overview", { p_id: assetId });
      setServerTime(overview.server_time, startedAt);
      mergeDevices(overview.spots.map((spot) => spot.sensor).filter(Boolean));
      rememberAssets(overview.spots.map((spot) => ({ id: spot.id, parent_id: assetId, kind: "point", name: spot.name, position: spot.position })));
      equipTypeIndex.set(assetId, overview.details?.equipment_type || null);
      await loadTelemetrySummary(overview.spots.map((spot) => spot.sensor?.sensor_id)).catch(() => {});
    } catch (error) {
      problem = isMissingFeature(error) ? MISSING_FEATURE_TEXT : "Não foi possível carregar spots e ficha deste TAG: " + errorText(error);
    }
  }
  if (state.assetId !== assetId || state.page !== "assets") return;
  if (asset.kind === "equipment") {
    const equipMag = await magAssetInfo(assetId);
    if (state.assetId !== assetId || state.page !== "assets") return;
    box.innerHTML = equipmentInspector(asset, overview, problem, equipMag);
    renderTree();
    renderIcons();
    return;
  }
  const childKinds = allowedChildKinds(asset);
  const sensorBlock =
    asset.kind !== "point"
      ? ""
      : sensor
        ? `<div class="inspector-sensor"><div><small>Sensor vinculado</small><strong>${esc(deviceLabel(sensor))}</strong><span>${spotReading(sensor)} ${connBadge(sensor)}</span></div>` +
          `<div class="row-actions"><button class="secondary compact" data-act="sensor-detail" data-sensor="${esc(sensor.sensor_id)}">Detalhes</button><button class="secondary compact" data-act="sensor-history" data-sensor="${esc(sensor.sensor_id)}">Histórico</button></div></div>`
        : `<div class="inspector-sensor empty"><div><small>Sensor</small><strong>Aguardando instalação</strong><span>Nenhum sensor vinculado a este spot.</span></div>` +
          (canLinkAt(asset.access) ? `<div class="row-actions"><button class="primary compact" data-act="link">Vincular sensor</button></div>` : "") +
          `</div>`;
  const fields = [];
  let magInfo = null;
  if (asset.kind === "point") {
    const equip = assetIndex.get(asset.parent_id);
    if (equip) fields.push(["TAG", `${equipTag(equip)} · ${equipTypeLabel(equip.id) || TYPE_UNKNOWN}`]);
    fields.push(["Posição de montagem", asset.position || "Não informada"]);
    // Sensor magnético: curso típico com a origem (spot ou TAG) e a revisão da montagem.
    magInfo = await magAssetInfo(assetId);
    if (state.assetId !== assetId || state.page !== "assets") return;
    if (magInfo) {
      fields.push(["Curso disponível típico", magAssetSummaryText(magInfo)]);
      fields.push(["Revisão da montagem", magInfo.effective?.geometry ? geomText(magInfo.effective.geometry) + (magInfo.effective.geometry_source === "equipment" ? " · sugerida no TAG" : "") : "Não vinculada"]);
    }
  } else if (asset.tag && asset.tag !== asset.name) fields.push(["Código", asset.tag]);
  box.innerHTML =
    `<div class="inspector-card"><header class="inspector-head"><div class="inspector-title"><span class="kind-chip">${KIND_LABEL[asset.kind]}</span><h2>${esc(asset.name)}</h2>${parentPathLine(asset)}</div></header>` +
    (asset.kind === "point" && !spotCanonical(asset.name)
      ? '<p class="form-help">Nome anterior à padronização. Ele é mantido como está; ao trocar o nome, as opções são LOA, LA ou UNICO.</p>'
      : "") +
    (asset.access === "path" ? '<p class="path-note">Este nível aparece só como caminho de navegação até os ramos concedidos à sua conta.</p>' : "") +
    (fields.length ? `<dl class="detail-fields">${fields.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("")}</dl>` : "") +
    sensorBlock +
    (magInfo ? `<div class="inspector-actions"><button class="secondary compact" data-act="mag-setup">${magInfo.can_edit_course || magInfo.can_edit_geometry ? "Configurar montagem do sensor" : "Ver montagem do sensor"}</button></div>` : "") +
    inspectorActions(asset, childKinds) +
    (childKinds.length ? `<p class="form-help">Próxima criação: ${childKinds.map((kind) => KIND_LABEL[kind]).join(" ou ")}.</p>` : "") +
    `</div>`;
  renderIcons();
}
$id("assetInspector").onclick = async (event) => {
  const button = event.target.closest("[data-act]");
  if (!button) return;
  const act = button.dataset.act;
  const asset = assetIndex.get(state.assetId);
  const fail = (error) => showMessage(errorText(error), "error");
  if (act === "sensor-detail") return openDrawer(button.dataset.sensor, "detail", button);
  if (act === "mag-setup") return openMagSetupForPoint(state.assetId, state.devices.find((device) => device.measurement_point_id === state.assetId)?.sensor_id || null).catch(fail);
  if (act === "sensor-history") return openHistoryFor(button.dataset.sensor);
  if (act === "spot-link") return openLinkDialog(button.dataset.spot);
  if (act === "open-spot") {
    tree.open.add(state.assetId);
    return loadKids(state.assetId)
      .then(() => selectAsset(button.dataset.spot))
      .catch(fail);
  }
  if (!asset) return;
  if (act === "add") return openAssetForm({ parentId: asset.id, kind: button.dataset.kind }).catch(fail);
  if (act === "edit") return withBusy(button, () => openAssetForm({ editId: asset.id }));
  if (act === "link") return openLinkDialog(asset.id);
  if (act === "gateways") return showPage("gateways");
  if (act === "delete") return withBusy(button, () => deleteAsset(asset));
};

// ----- Formulário de ativo -----
const assetFormState = { editId: null, parentId: null, hadType: false };
function buildEquipFields() {
  if ($id("equipGroups").childElementCount) return;
  $id("equipGroups").innerHTML = EQUIP_GROUPS.map(
    (group) =>
      `<fieldset class="equip-group"><legend>${group.title}</legend>` +
      group.fields
        .map(([key, label, format]) =>
          format === "long"
            ? `<label class="span-all">${label}<textarea id="eq-${key}" rows="2" maxlength="1000"></textarea></label>`
            : `<label>${label}<input id="eq-${key}" maxlength="${format === "count" ? 4 : 60}"${format === "count" ? ' inputmode="numeric" placeholder="Número inteiro"' : ""} autocomplete="off"></label>`,
        )
        .join("") +
      `</fieldset>`,
  ).join("");
  // Fabricante, modelo, fluido, tipo e modelo de gaxeta aceitam textos mais longos.
  for (const key of ["fluid", "manufacturer", "model", "packing_type", "packing_model"]) $id("eq-" + key).maxLength = 120;
}
async function openAssetForm({ parentId = null, kind = null, editId = null }) {
  const editing = editId ? assetIndex.get(editId) : null;
  const parent = editing ? assetIndex.get(editing.parent_id) : assetIndex.get(parentId);
  const kinds = editing ? [editing.kind] : allowedChildKinds(parent || null);
  if (!kinds.length || (editing && !canEditAsset(editing))) return showMessage("Sua conta não pode criar ou editar níveis aqui.", "error");
  buildEquipFields();
  // Edição de TAG: a ficha gravada vem do servidor antes de abrir o formulário.
  let details = null;
  if (editing?.kind === "equipment") {
    try {
      details = (await callRpc("gaxeta_equipment_overview", { p_id: editing.id })).details;
    } catch (error) {
      return showMessage(isMissingFeature(error) ? MISSING_FEATURE_TEXT : errorText(error), "error");
    }
  }
  Object.assign(assetFormState, { editId: editing?.id || null, parentId: editing ? editing.parent_id : parentId, hadType: !!details?.equipment_type });
  // Curso disponível típico do sensor magnético: campos do TAG e do spot (66-mag-setup.js).
  await magAssetFormPrepare(editing, parent);
  fillSelect($id("assetKind"), kinds.map((value) => ({ value, label: KIND_LABEL[value] })), null, kind && kinds.includes(kind) ? kind : kinds[0]);
  $id("assetKindRow").hidden = kinds.length < 2;
  $id("assetContext").textContent = parent ? "Dentro de: " + assetPathLabel(parent.id) : "Raiz da estrutura";
  $id("assetName").value = editing?.name || "";
  $id("assetTag").value = editing ? (editing.kind === "equipment" ? equipTag(editing) : editing.tag || "") : "";
  $id("assetPosition").value = editing?.position || "";
  // Spot: uma das três opções. Um nome anterior fora do padrão aparece como está e só muda se trocado.
  const legacySpot = editing?.kind === "point" && !spotCanonical(editing.name) ? editing.name : "";
  fillSelect(
    $id("assetSpotName"),
    [...(legacySpot ? [{ value: legacySpot, label: `${legacySpot} (nome anterior, manter)` }] : []), ...SPOT_NAMES.map((value) => ({ value, label: value }))],
    editing ? null : "Selecione: LOA, LA ou UNICO",
    editing?.kind === "point" ? legacySpot || spotCanonical(editing.name) : "",
  );
  fillSelect($id("equipType"), [...equipCatalog].map(([value, label]) => ({ value, label })), details?.equipment_type ? null : editing ? TYPE_UNKNOWN : "Selecione o tipo", details?.equipment_type || "");
  for (const group of EQUIP_GROUPS) for (const [key] of group.fields) $id("eq-" + key).value = details?.[key] ?? "";
  $id("assetLegacyName").hidden = !(editing?.kind === "equipment" && editing.tag && editing.name !== editing.tag);
  $id("assetLegacyName").textContent = editing ? `Nome cadastrado anteriormente (mantido): ${editing.name}` : "";
  for (const id of ["corpEmail", "corpResponsible", "corpPhone"]) $id(id).value = "";
  $id("assetFormMessage").textContent = "";
  syncAssetForm();
  $id("assetDialog").showModal();
  ($id("assetKindRow").hidden ? [$id("assetTag"), $id("assetSpotName"), $id("assetName")].find((field) => !field.closest("label").hidden) : $id("assetKind")).focus();
}
function syncAssetForm() {
  const kind = $id("assetKind").value;
  const editing = !!assetFormState.editId;
  const isEquip = kind === "equipment";
  const isPoint = kind === "point";
  $id("assetDialogTitle").textContent = (editing ? "Editar " : "Novo nível: ") + KIND_LABEL[kind];
  $id("assetDialog").classList.toggle("wide-dialog", isEquip);
  $id("assetNameRow").hidden = isEquip || isPoint;
  $id("assetTagRow").hidden = kind === "corporation" || isPoint;
  $id("assetTagLabel").textContent = isEquip ? "TAG (identificador do equipamento)" : "Código (opcional)";
  $id("assetSpotRow").hidden = !isPoint;
  $id("assetPositionRow").hidden = !isPoint;
  $id("equipFields").hidden = !isEquip;
  if (!isEquip) $id("assetLegacyName").hidden = true;
  $id("corpFields").hidden = kind !== "corporation";
  $id("corpFields").querySelector(".form-help").textContent = editing
    ? "Para atualizar o contato, preencha e-mail e responsável. Em branco, só o nome é alterado."
    : "Contato e responsável podem ser preenchidos depois: a corporação pode nascer como rascunho.";
  magAssetFormSync(kind);
}
$id("assetKind").onchange = syncAssetForm;
// Lê a ficha do formulário. Campo vazio é ausência de informação; quantidade é inteiro não negativo.
function readEquipDetails() {
  const details = { equipment_type: $id("equipType").value || null };
  for (const group of EQUIP_GROUPS)
    for (const [key, label, format] of group.fields) {
      const value = $id("eq-" + key).value.trim();
      if (format === "count" && value && !/^\d{1,4}$/.test(value)) throw Error(`${label}: informe um número inteiro, sem sinal.`);
      details[key] = value || null;
    }
  return details;
}
$id("assetForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("assetFormMessage");
  const kind = $id("assetKind").value;
  const { editId, parentId } = assetFormState;
  const tag = $id("assetTag").value.trim();
  const name = kind === "equipment" ? tag : kind === "point" ? $id("assetSpotName").value : $id("assetName").value.trim();
  if (kind === "equipment" && !tag) return void (message.textContent = "Informe o TAG do equipamento.");
  if (kind === "point" && !name) return void (message.textContent = "Selecione o nome do spot: LOA, LA ou UNICO.");
  if (!name) return void (message.textContent = "Informe o nome.");
  const email = $id("corpEmail").value.trim();
  if (kind === "corporation" && email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return void (message.textContent = "E-mail de contato inválido.");
  let details = null;
  if (kind === "equipment") {
    try {
      details = readEquipDetails();
    } catch (error) {
      return void (message.textContent = error.message);
    }
    if (!details.equipment_type && (!editId || assetFormState.hadType)) return void (message.textContent = "Selecione o tipo de equipamento.");
  }
  // Curso do sensor magnético: validado antes de gravar o ativo, aplicado logo depois.
  let magWanted = null;
  try {
    magWanted = magAssetFormRead(kind);
  } catch (error) {
    return void (message.textContent = error.message);
  }
  message.textContent = "Salvando…";
  const button = event.submitter || $id("assetForm").querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const withContact = kind === "corporation" && (!editId || email || $id("corpResponsible").value.trim());
    const saved =
      kind === "equipment"
        ? // TAG e ficha numa única transação: ou grava tudo, ou nada.
          await callRpc("gaxeta_save_equipment", { p_id: editId, p_parent_id: parentId || null, p_tag: tag, p_details: details })
        : withContact
          ? await callRpc("gaxeta_save_corporation", {
              p_id: editId,
              p_name: name,
              p_contact_email: email || null,
              p_responsible_name: $id("corpResponsible").value.trim() || null,
              p_phone: $id("corpPhone").value.trim() || null,
              p_slug: null,
            })
          : await callRpc("gaxeta_save_asset", {
              p_id: editId,
              p_parent_id: parentId || null,
              p_kind: kind,
              p_name: name,
              p_tag: kind === "corporation" || kind === "point" ? "" : tag,
              p_position: kind === "point" ? $id("assetPosition").value.trim() : "",
              p_sensor_id: null,
              p_sensor_label: null,
            });
    if (kind === "equipment") equipTypeIndex.set(saved.id, saved.details?.equipment_type || null);
    let magProblem = "";
    try {
      await magAssetFormApply(saved, magWanted);
    } catch (error) {
      magProblem = " O curso do sensor magnético NÃO foi gravado: " + errorText(error);
    }
    // Relê o ramo no servidor: o que aparece na árvore é o que ficou gravado.
    await loadKids(parentId || null, { force: true });
    await ensureAssets([saved.id]);
    if (parentId) tree.open.add(parentId);
    $id("assetDialog").close();
    await revealAsset(saved.id);
    // Um spot novo aparece dentro da ficha do TAG, que continua selecionado; os demais níveis passam a ser a seleção.
    const stayOnEquip = kind === "point" && state.page === "assets" && state.assetId === parentId;
    if (stayOnEquip) tree.open.add(parentId);
    else state.assetId = saved.id;
    renderTree();
    if (state.page === "assets") await renderInspector();
    renderIcons();
    const next = allowedChildKinds(assetIndex.get(saved.id)).map((value) => KIND_LABEL[value]);
    showMessage(`${KIND_LABEL[kind]} “${assetLabel(assetIndex.get(saved.id) || saved)}” ${kindDone(kind, editId ? "atualizad" : "gravad")}.${!editId && next.length ? " Próxima criação: " + next.join(" ou ") + "." : ""}${magProblem}`, magProblem ? "error" : "success");
  } catch (error) {
    message.textContent = isMissingFeature(error) ? MISSING_FEATURE_TEXT : errorText(error);
  } finally {
    button.disabled = false;
  }
};

// ----- Exclusão definitiva (nível 1), sempre com as dependências à vista -----
// O servidor decide (gaxeta_delete_asset): só nível 1, e nunca com filhos, sensores,
// gateways, histórico de instalação ou usuários. A tela explica o motivo do bloqueio.
const DELETE_BLOCKERS = [
  ["children", "níveis diretamente abaixo", "spots cadastrados neste equipamento"],
  ["linked_sensors", "sensores vinculados", "sensores vinculados aos spots"],
  ["gateways", "gateways", "gateways"],
  ["link_history", "registros de instalação (histórico de vínculos)", "registros de instalação de sensor: o histórico de vínculos e a telemetria desses spots são preservados"],
  ["users", "usuários vinculados à corporação", "usuários vinculados"],
];
// Identificação do equipamento no diálogo: nome e TAG sempre à vista.
function equipmentSummaryHtml(asset) {
  const rows = [
    ["TAG", equipTag(asset)],
    ["Nome", asset.name || "—"],
    ["Tipo", equipTypeLabel(asset.id) || TYPE_UNKNOWN],
    ["Local", assetPathLabel(asset.parent_id) || "—"],
  ];
  return `<dl class="detail-fields">${rows.map(([name, value]) => `<dt>${name}</dt><dd>${esc(value)}</dd>`).join("")}</dl>`;
}
async function showDeleteBlocked(asset, deps) {
  const equip = asset.kind === "equipment";
  const lines = DELETE_BLOCKERS.filter(([key]) => deps[key] > 0).map(([key, label, equipLabel]) => `<li><b>${deps[key]}</b> ${equip ? equipLabel : label}</li>`);
  let spots = "";
  if (equip && deps.children > 0) {
    // Nomeia os spots e o que há em cada um, para a pessoa saber por onde começar.
    const overview = await callRpc("gaxeta_equipment_overview", { p_id: asset.id }).catch(() => null);
    if (overview?.spots?.length)
      spots = `<p>Spots deste equipamento:</p><ul>${overview.spots.map((spot) => `<li><b>${esc(spot.name)}</b>${spot.position ? " · " + esc(spot.position) : ""}: ${spot.sensor ? "sensor " + esc(deviceLabel(spot.sensor)) + " vinculado" : "sem sensor vinculado"}</li>`).join("")}</ul>`;
  }
  await askConfirm({
    title: equip ? "Não é possível excluir o equipamento" : "Não é possível excluir",
    html:
      (equip ? equipmentSummaryHtml(asset) : `<p><b>${esc(assetLabel(asset))}</b></p>`) +
      `<p>A exclusão foi bloqueada porque existem dependências:</p><ul>${lines.join("")}</ul>${spots}` +
      (equip
        ? "<p>Para excluir, desvincule os sensores e exclua os spots vazios. Um spot que já teve sensor instalado guarda o histórico e não pode ser excluído; nesse caso o equipamento permanece cadastrado. Nada foi alterado.</p>"
        : "<p>Remova ou mova as dependências primeiro. Itens com histórico de instalação ficam preservados. Nada foi alterado.</p>"),
    allowOk: false,
  });
}
async function deleteAsset(asset) {
  const equip = asset.kind === "equipment";
  if (equip) await ensureEquipTypes([asset.id]);
  const deps = await callRpc("gaxeta_asset_dependencies", { p_id: asset.id });
  if (DELETE_BLOCKERS.some(([key]) => deps[key] > 0)) return showDeleteBlocked(asset, deps);
  const grants = deps.access_grants > 0 ? `<p>${deps.access_grants} concessão(ões) de acesso apontam para este nível e serão removidas.</p>` : "";
  const confirmed = await askConfirm({
    title: equip ? "Excluir equipamento" : "Excluir " + KIND_LABEL[asset.kind].toLowerCase(),
    html: equip
      ? `<p>Excluir definitivamente este equipamento?</p>${equipmentSummaryHtml(asset)}${grants}<p>A ficha técnica do TAG é excluída junto. Não há spots, sensores nem histórico de instalação neste equipamento. A exclusão fica registrada na auditoria e não pode ser desfeita.</p>`
      : `<p>Excluir definitivamente <b>${esc(assetPathLabel(asset.id))}</b>?</p>${grants}<p>A exclusão fica registrada na auditoria.</p>`,
    okLabel: equip ? "Excluir equipamento" : "Excluir",
  });
  if (!confirmed) return;
  try {
    await callRpc("gaxeta_delete_asset", { p_id: asset.id, p_reason: "exclusão pela interface" });
  } catch (error) {
    // Alguém criou uma dependência entre a conferência e a confirmação: o servidor recusa e devolve o motivo.
    if (error?.code === "23503") {
      let fresh = null;
      try {
        fresh = JSON.parse(error.details);
      } catch {}
      return showDeleteBlocked(asset, fresh || (await callRpc("gaxeta_asset_dependencies", { p_id: asset.id })));
    }
    throw error;
  }
  forgetAsset(asset.id);
  equipTypeIndex.delete(asset.id);
  tree.kids.delete(kidsKey(asset.id));
  await loadKids(asset.parent_id || null, { force: true });
  state.assetId = asset.parent_id || "";
  renderTree();
  await renderInspector();
  renderIcons();
  showMessage(`${KIND_LABEL[asset.kind]} “${assetLabel(asset)}” ${kindDone(asset.kind, "excluíd")}.`, "success");
}

// ----- Vínculo do sensor ao spot (operação atômica no servidor) -----
const linkState = { pointId: null, run: 0 };
function openLinkDialog(pointId) {
  linkState.pointId = pointId;
  $id("linkContext").textContent = "Spot: " + assetPathLabel(pointId);
  $id("linkSearch").value = "";
  $id("linkMessage").textContent = "";
  $id("linkUnlinked").checked = hasCap("association_queue");
  $id("linkUnlinked").closest("label").hidden = !hasCap("association_queue");
  $id("linkDialog").showModal();
  searchLinkable();
}
async function searchLinkable() {
  const run = ++linkState.run;
  const box = $id("linkResults");
  box.innerHTML = '<p class="form-help">Buscando…</p>';
  try {
    const result = await callRpc("gaxeta_devices_page", { p_asset_id: null, p_search: $id("linkSearch").value.trim() || null, p_unlinked: $id("linkUnlinked").checked, p_limit: 20, p_offset: 0 });
    if (run !== linkState.run) return;
    mergeDevices(result.items);
    await ensureAssets(result.items.map((device) => device.measurement_point_id));
    box.innerHTML =
      result.items
        .map(
          (device) =>
            `<div class="pick-row"><div><strong>${esc(deviceLabel(device))}</strong><small>${esc(device.sensor_id)} · ${device.measurement_point_id ? "em " + esc(assetPathLabel(device.measurement_point_id)) : "sem vínculo"} · ${deviceStatus(device).label}</small></div>` +
            `<button class="primary compact" data-link="${esc(device.sensor_id)}">${device.measurement_point_id ? "Mover para cá" : "Vincular"}</button></div>`,
        )
        .join("") +
        (result.total > result.items.length ? `<p class="form-help">Mostrando 20 de ${result.total}. Refine a busca.</p>` : "") ||
      `<p class="form-help">${hasCap("association_queue") ? "Nenhum sensor encontrado. O sensor aparece aqui depois da primeira transmissão." : "Nenhum sensor do seu escopo encontrado. A primeira associação de um sensor novo é feita por um administrador."}</p>`;
  } catch (error) {
    box.innerHTML = "";
    $id("linkMessage").textContent = errorText(error);
  }
}
$id("linkSearch").oninput = debounce(searchLinkable, 350);
$id("linkUnlinked").onchange = searchLinkable;
$id("linkResults").onclick = async (event) => {
  const button = event.target.closest("[data-link]");
  if (!button) return;
  button.disabled = true;
  $id("linkMessage").textContent = "Vinculando…";
  try {
    const saved = await callRpc("gaxeta_link_sensor", { p_sensor_id: button.dataset.link, p_point_id: linkState.pointId, p_reason: "vínculo pela interface" });
    mergeDevices([saved]);
    $id("linkDialog").close();
    renderTree();
    // Relê o resumo do TAG (ou a ficha do spot) com o vínculo novo.
    if (state.page === "assets") await renderInspector();
    showMessage(`Sensor ${deviceLabel(saved)} vinculado a ${assetPathLabel(linkState.pointId)}.`, "success");
  } catch (error) {
    $id("linkMessage").textContent = errorText(error);
    button.disabled = false;
  }
};

// ---- 66-mag-setup.js ----
// =============================================================================
// Configurar montagem do sensor magnético: curso disponível típico (TAG e exceção por spot) e
// revisão da montagem (geometria ensaiada). Usa o cadastro que já existe no servidor
// (gaxeta_mag_*); nenhuma tabela paralela.
//   * Curso típico: quem edita o TAG ou o spot. É estimativa: o engaxetamento que o usa sai como
//     "curso estimado". O cadastro do curso não depende de a mecânica estar validada.
//   * Revisão da montagem: engenharia (ADM nível 1 ou 2), a partir de ensaio com paquímetro.
//   * O servidor decide a permissão; a tela só mostra o que cada conta pode fazer e o que falta.
// Chega-se aqui por Sensores → Detalhes → Configurar montagem, pelo botão Configurar do cartão,
// por Ativos → spot → Montagem do sensor, e pelos campos do formulário Editar do TAG e do spot.
// =============================================================================
const magSetup = { pointId: null, sensorId: null, point: null, tag: null, geoms: [], validating: null, message: "", error: false };
const GEOM_STATUS_TEXT = { draft: "em caracterização", validated: "validada", retired: "retirada" };
// Curso típico digitado: número positivo até 1000 mm, com até duas casas. Vazio = sem valor.
function readCourseField(text, label) {
  const value = parseMm(text);
  if (value === null) return null;
  if (Number.isNaN(value) || value <= 0 || value > 1000) throw Error(`${label}: informe um número maior que zero, até 1000 mm (vírgula ou ponto).`);
  if (Math.abs(Math.round(value * 100) - value * 100) > 1e-6) throw Error(`${label}: use até duas casas decimais.`);
  return value;
}
const geomText = (geom) =>
  !geom
    ? "nenhuma"
    : `${geom.label} (${geom.key} r${geom.revision}) · ${geom.model_kind === "linear" ? `reta de ${fmtNum(geom.mm_per_deg, 4)} mm por grau` : `curva de ${geom.curve?.length || 0} pontos`} · aperto ${Number(geom.direction) > 0 ? "aumenta" : "diminui"} o ângulo · arco de ${fmtNum(geom.unique_arc_deg, 0)}° · ${GEOM_STATUS_TEXT[geom.status] || geom.status}`;

function magSetupDialog() {
  let dialog = $id("magSetupDialog");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = "magSetupDialog";
  dialog.className = "wide-dialog";
  dialog.innerHTML =
    `<div class="dialog-heading"><h2>Configurar montagem</h2><button type="button" id="magSetupClose" class="icon-button" aria-label="Fechar">×</button></div>` +
    `<div id="magSetupBody" class="setup-body"></div>`;
  document.body.appendChild(dialog);
  dialog.querySelector("#magSetupClose").onclick = () => dialog.close();
  return dialog;
}
async function openMagSetup(sensorId) {
  const device = findDevice(sensorId);
  if (!device?.measurement_point_id) return showMessage("Vincule o sensor a um spot antes de configurar a montagem.", "error");
  return openMagSetupForPoint(device.measurement_point_id, sensorId);
}
async function openMagSetupForPoint(pointId, sensorId = null) {
  Object.assign(magSetup, { pointId, sensorId, point: null, tag: null, geoms: [], validating: null, message: "", error: false });
  const dialog = magSetupDialog();
  $id("magSetupBody").innerHTML = `<p class="form-help">Carregando o cadastro…</p>`;
  if (!dialog.open) dialog.showModal();
  await loadMagSetup();
}
async function loadMagSetup() {
  try {
    magSetup.point = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: magSetup.pointId });
    const tagId = magSetup.point.tag?.asset_id;
    [magSetup.tag, magSetup.geoms] = await Promise.all([
      tagId ? callRpc("gaxeta_mag_asset_setup", { p_asset_id: tagId }).catch(() => null) : null,
      callRpc("gaxeta_mag_geometries").catch(() => []),
    ]);
    await ensureAssets([magSetup.pointId]);
  } catch (error) {
    $id("magSetupBody").innerHTML = `<p class="form-message is-error">${esc(isMissingFeature(error) ? "Esta tela depende da atualização do banco desta revisão (migração 15), que ainda não foi aplicada." : errorText(error))}</p>`;
    return;
  }
  renderMagSetup();
}
// Depois de gravar: relê o cadastro e o estado do sensor, e atualiza o que estiver aberto.
async function afterMagSetupChange(text) {
  magSetup.message = text;
  magSetup.error = false;
  magAssetInfoCache.clear();
  await loadMagSetup();
  if (magSetup.sensorId) {
    await loadMagSummary([magSetup.sensorId]).catch(() => {});
    if ($id("magService")) $id("magService").dataset.signature = "";
    updateDrawerLive();
  }
  if (state.page === "sensors") renderSensorGrid();
  else if (state.page === "assets") await renderInspector().catch(() => {});
}
function renderMagSetup() {
  const { point, tag, geoms } = magSetup;
  const eff = point.effective || {};
  const usable = geoms.filter((geom) => geom.status !== "retired");
  const tagName = point.tag?.tag || "TAG";
  const own = point.own?.suggested_course_mm;
  const ownGeom = point.own?.geometry_id || "";
  const validating = magSetup.validating ? geoms.find((geom) => String(geom.id) === String(magSetup.validating)) : null;
  $id("magSetupBody").innerHTML =
    `<p class="form-context">${esc(assetPathLabel(magSetup.pointId) || "Spot")}</p>` +
    (magSetup.message ? `<p class="form-message${magSetup.error ? " is-error" : " is-success"}" role="status">${esc(magSetup.message)}</p>` : "") +
    // 1. Curso disponível típico
    `<section class="setup-block"><h3>1. Curso disponível típico (mm)</h3>` +
    `<p class="form-help">Quanto o preme-gaxeta costuma poder avançar logo depois de um engaxetamento novo, até o limite de ajuste. É uma estimativa do equipamento: vira o valor proposto no botão <b>Engaxetamento realizado</b> e o resultado aparece como <b>curso estimado</b>. Quem tiver a medida real informa na hora do engaxetamento.</p>` +
    `<p class="setup-current">Em uso neste spot: <b>${eff.suggested_course_mm != null ? esc(fmtMm(eff.suggested_course_mm, 2)) : "não cadastrado"}</b>${eff.course_source ? " · " + esc(COURSE_SOURCE_TEXT[eff.course_source]) : ""}</p>` +
    (tag?.can_edit_course
      ? `<form id="setupTagForm" class="setup-row" novalidate><label>No TAG ${esc(tagName)} (vale para os spots sem valor próprio)<input id="setupTagCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" placeholder="Ex.: 20 ou 2,5" value="${esc(fmtMmInput(tag.suggested_course_mm))}"></label>` +
        `<label>Porte (opcional)<select id="setupTagSize"><option value="">Não informado</option>${Object.entries(SIZE_CLASS_LABEL).map(([value, text]) => `<option value="${value}"${tag.size_class === value ? " selected" : ""}>${text}</option>`).join("")}</select></label>` +
        `<button class="secondary" type="submit">Salvar no TAG</button></form>`
      : `<p class="form-help">No TAG ${esc(tagName)}: ${point.tag?.suggested_course_mm != null ? esc(fmtMm(point.tag.suggested_course_mm, 2)) : "não cadastrado"}. Quem cadastra: quem edita o TAG em Ativos (ADM nível 1 ou 2, ou usuário da corporação com permissão de edição neste ramo).</p>`) +
    (point.can_edit_course
      ? `<form id="setupSpotForm" class="setup-row" novalidate><fieldset><legend>Neste spot</legend>` +
        `<label class="check"><input type="radio" name="setupSpotMode" value="inherit"${own == null ? " checked" : ""}> Herdar do TAG${point.tag?.suggested_course_mm != null ? " (" + esc(fmtMm(point.tag.suggested_course_mm, 2)) + ")" : " (TAG sem valor cadastrado)"}</label>` +
        `<label class="check"><input type="radio" name="setupSpotMode" value="own"${own != null ? " checked" : ""}> Valor específico deste spot</label>` +
        `<label>Curso deste spot (mm)<input id="setupSpotCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(fmtMmInput(own))}"${own == null ? " disabled" : ""}></label></fieldset>` +
        `<button class="secondary" type="submit">Salvar no spot</button></form>`
      : `<p class="form-help">Sua conta não edita o curso deste spot.</p>`) +
    `</section>` +
    // 2. Revisão da montagem
    `<section class="setup-block"><h3>2. Revisão da montagem (ensaio)</h3>` +
    `<p class="form-help">A revisão diz quantos milímetros o preme-gaxeta avança por grau de giro do eixo do sensor, em que sentido e em que arco isso foi comprovado. Vem de um ensaio com paquímetro: a medida do espaço na bomba, sozinha, não diz quantos milímetros valem um grau. Suportes da mesma família, intercambiáveis, podem usar a mesma revisão já comprovada.</p>` +
    `<p class="setup-current">Em uso neste spot: <b>${esc(geomText(eff.geometry))}</b>${eff.geometry_source ? " · " + (eff.geometry_source === "point" ? "vinculada a este spot" : "sugerida no TAG") : ""}</p>` +
    (eff.geometry && eff.geometry.status !== "validated" ? `<p class="bench-warn">Esta revisão ainda não foi validada: o curso de ajuste restante só aparece para a engenharia, como provisório.</p>` : "") +
    (!eff.geometry ? `<p class="bench-warn">Sem revisão vinculada, o curso de ajuste restante fica indisponível, com o motivo à vista. O curso típico acima pode ser cadastrado antes: uma coisa não depende da outra.</p>` : "") +
    (point.can_edit_geometry
      ? `<form id="setupGeomForm" class="setup-row" novalidate><label>Revisão vinculada a este spot<select id="setupGeom"><option value="">Nenhuma própria (usar a sugerida no TAG, se houver)</option>` +
        usable.map((geom) => `<option value="${esc(geom.id)}"${String(geom.id) === String(ownGeom) ? " selected" : ""}>${esc(geom.key)} r${geom.revision} · ${esc(geom.label)} · ${esc(GEOM_STATUS_TEXT[geom.status])}</option>`).join("") +
        `</select></label>` +
        `<label>Ângulo bruto no datum mecânico (só para curva)<input id="setupDatum" type="text" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="0 a 4095" value="${esc(point.own?.datum_raw ?? "")}"></label>` +
        (point.active_reference ? `<p class="bench-warn">Há um engaxetamento em andamento neste spot. Trocar a revisão <b>encerra essa referência</b>: será preciso registrar o engaxetamento de novo.</p>` : "") +
        `<button class="secondary" type="submit">Vincular ao spot</button></form>`
      : `<p class="form-help">Quem vincula e valida a revisão: a engenharia (ADM nível 1 ou 2).</p>`) +
    `</section>` +
    // 3. Engenharia: revisões e ensaio
    (point.can_edit_geometry
      ? `<section class="setup-block"><h3>3. Revisões cadastradas (engenharia)</h3>` +
        (geoms.length
          ? `<ul class="setup-geoms">${geoms
              .map(
                (geom) =>
                  `<li><span>${esc(geomText(geom))} · curso de ${esc(fmtNum(geom.min_course_mm))} a ${esc(fmtNum(geom.max_course_mm))} mm` +
                  (geom.status === "validated" && geom.evidence?.max_error_pp != null ? ` · erro máximo ${esc(fmtNum(geom.evidence.max_error_pp, 2))} p.p., folga ${esc(fmtNum(geom.evidence.backlash_mm, 2))} mm` : "") +
                  `</span><span class="row-actions">` +
                  (geom.status === "draft" ? `<button class="secondary compact" type="button" data-geom-validate="${esc(geom.id)}">Validar…</button>` : "") +
                  (geom.status !== "retired" ? `<button class="text-button danger-text" type="button" data-geom-retire="${esc(geom.id)}">Retirar</button>` : "") +
                  `</span></li>`,
              )
              .join("")}</ul>`
          : `<p class="form-help">Nenhuma revisão cadastrada ainda.</p>`) +
        (validating
          ? `<form id="setupValidateForm" class="setup-row setup-validate" novalidate><h4>Validar ${esc(validating.key)} r${validating.revision}</h4>` +
            `<p class="form-help">Só valide com o ensaio aprovado em posições independentes das usadas para ajustar a reta ou a curva. A folga que depende do sentido entra no erro.</p>` +
            `<label>Erro máximo no curso (mm)<input id="valErrMm" type="text" inputmode="decimal" maxlength="8" autocomplete="off"></label>` +
            `<label>Erro máximo (pontos percentuais do curso)<input id="valErrPp" type="text" inputmode="decimal" maxlength="8" autocomplete="off"></label>` +
            `<label>Folga na reversão (mm)<input id="valBacklash" type="text" inputmode="decimal" maxlength="8" autocomplete="off"></label>` +
            `<label class="span-all">Relatório do ensaio (onde está e o que mediu)<textarea id="valReport" rows="2" maxlength="600"></textarea></label>` +
            `<div class="row-actions"><button class="primary" type="submit">Validar revisão</button><button class="secondary" type="button" id="valCancel">Cancelar</button></div></form>`
          : "") +
        `<details class="technical-detail" id="setupNewGeom"><summary>Nova revisão a partir de um ensaio</summary>` +
        `<form id="setupNewForm" class="setup-grid" novalidate>` +
        `<label>Família do suporte (identificador)<input id="ngKey" maxlength="40" autocomplete="off" placeholder="ex.: haste-cremalheira-20"></label>` +
        `<label>Descrição<input id="ngLabel" maxlength="80" autocomplete="off" placeholder="ex.: Cremalheira, pinhão 12,7 mm"></label>` +
        `<label>Modelo<select id="ngKind"><option value="linear">Reta: mm por grau constante</option><option value="table">Curva: tabela de pontos medidos</option></select></label>` +
        `<label>Ao apertar o preme-gaxeta, o ângulo do sensor<select id="ngDir"><option value="1">aumenta</option><option value="-1">diminui</option></select></label>` +
        `<label id="ngSlopeRow">Avanço por grau de giro (mm por grau)<input id="ngSlope" type="text" inputmode="decimal" maxlength="10" autocomplete="off" placeholder="ex.: 0,111"></label>` +
        `<label id="ngCurveRow" class="span-all" hidden>Pontos do ensaio, um por linha: graus desde o datum mecânico; mm<textarea id="ngCurve" rows="5" placeholder="0; 0&#10;45; 5,1&#10;90; 10,0"></textarea></label>` +
        `<label id="ngDatumRow" hidden>Ângulo bruto no datum mecânico (0 a 4095, se o porta-ímã for indexado)<input id="ngDatum" type="text" inputmode="numeric" maxlength="4" autocomplete="off"></label>` +
        `<label>Arco útil comprovado no ensaio (graus)<input id="ngArc" type="text" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="ex.: 240"></label>` +
        `<label>Recuo tolerado atrás da referência (graus)<input id="ngBack" type="text" inputmode="decimal" maxlength="5" autocomplete="off" value="15"></label>` +
        `<label>Tolerância aceita além dos extremos (mm)<input id="ngTol" type="text" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="ex.: 0,5"></label>` +
        `<label>Menor curso atendido (mm)<input id="ngMin" type="text" inputmode="decimal" maxlength="7" autocomplete="off"></label>` +
        `<label>Maior curso atendido (mm)<input id="ngMax" type="text" inputmode="decimal" maxlength="7" autocomplete="off"></label>` +
        `<p class="form-help span-all">A revisão nasce como rascunho (em caracterização). O arco útil tem de ser menor que uma volta e conter o maior curso: fora dele a plataforma suspende o cálculo em vez de extrapolar. Depois de trocar a haste ou o suporte, cadastre uma revisão nova: a curva anterior não vale para a peça nova.</p>` +
        `<div class="row-actions span-all"><button class="primary" type="submit">Salvar como rascunho</button></div></form></details></section>`
      : "");
  bindMagSetup();
}
function bindMagSetup() {
  const fail = (error) => {
    magSetup.message = errorText(error);
    magSetup.error = true;
    renderMagSetup();
  };
  const num = (id, label, { required = true } = {}) => {
    const value = parseMm($id(id).value);
    if (value === null && !required) return null;
    if (value === null || Number.isNaN(value)) throw Error(`${label}: informe um número (vírgula ou ponto).`);
    return value;
  };
  if ($id("setupTagForm"))
    $id("setupTagForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const course = readCourseField($id("setupTagCourse").value, "Curso do TAG");
          await callRpc("gaxeta_mag_set_equipment_defaults", {
            p_asset_id: magSetup.point.tag.asset_id, p_size_class: $id("setupTagSize").value || null, p_suggested_course_mm: course,
            // Preserva a revisão sugerida no TAG (para a engenharia o servidor grava o que vier aqui).
            p_geometry_id: magSetup.tag?.can_edit_geometry ? (magSetup.tag?.geometry?.id ?? null) : null,
          });
          await afterMagSetupChange(course == null ? "Curso típico removido do TAG." : `Curso típico de ${fmtMm(course, 2)} gravado no TAG. Os ciclos já registrados não mudam.`);
        } catch (error) {
          fail(error);
        }
      });
    };
  if ($id("setupSpotForm")) {
    for (const radio of document.querySelectorAll('input[name="setupSpotMode"]'))
      radio.onchange = () => {
        $id("setupSpotCourse").disabled = radio.value !== "own" || !radio.checked;
        if (radio.value === "own" && radio.checked) $id("setupSpotCourse").focus();
      };
    $id("setupSpotForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const ownMode = document.querySelector('input[name="setupSpotMode"]:checked')?.value === "own";
          const course = ownMode ? readCourseField($id("setupSpotCourse").value, "Curso do spot") : null;
          if (ownMode && course == null) throw Error("Informe o curso deste spot, ou escolha Herdar do TAG.");
          await callRpc("gaxeta_mag_set_point_course", { p_point_id: magSetup.pointId, p_course_mm: course });
          await afterMagSetupChange(course == null ? "Este spot voltou a herdar o curso do TAG." : `Curso de ${fmtMm(course, 2)} gravado só para este spot.`);
        } catch (error) {
          fail(error);
        }
      });
    };
  }
  if ($id("setupGeomForm"))
    $id("setupGeomForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const datumText = $id("setupDatum").value.trim();
          if (datumText && !/^\d{1,4}$/.test(datumText)) throw Error("Datum mecânico: ângulo bruto inteiro, de 0 a 4095.");
          await callRpc("gaxeta_mag_set_point_geometry", { p_point_id: magSetup.pointId, p_geometry_id: $id("setupGeom").value ? Number($id("setupGeom").value) : null, p_datum_raw: datumText ? Number(datumText) : null, p_note: null });
          await afterMagSetupChange($id("setupGeom").value ? "Revisão vinculada a este spot." : "Este spot voltou a usar a revisão sugerida no TAG, se houver.");
        } catch (error) {
          fail(error);
        }
      });
    };
  for (const button of document.querySelectorAll("[data-geom-validate]"))
    button.onclick = () => {
      magSetup.validating = button.dataset.geomValidate;
      magSetup.message = "";
      renderMagSetup();
      $id("valErrMm")?.focus();
    };
  for (const button of document.querySelectorAll("[data-geom-retire]"))
    button.onclick = async () => {
      if (!(await askConfirm({ title: "Retirar revisão", okLabel: "Retirar", html: `<p>A revisão deixa de poder ser vinculada. Os engaxetamentos já registrados com ela continuam no histórico.</p>` }))) return;
      await withBusy(button, async () => {
        try {
          await callRpc("gaxeta_mag_set_geometry_status", { p_geometry_id: Number(button.dataset.geomRetire), p_status: "retired", p_evidence: null });
          await afterMagSetupChange("Revisão retirada.");
        } catch (error) {
          fail(error);
        }
      });
    };
  if ($id("valCancel"))
    $id("valCancel").onclick = () => {
      magSetup.validating = null;
      renderMagSetup();
    };
  if ($id("setupValidateForm"))
    $id("setupValidateForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const report = $id("valReport").value.trim();
          if (!report) throw Error("Informe onde está o relatório do ensaio e o que ele mediu.");
          const evidence = { max_error_mm: num("valErrMm", "Erro máximo (mm)"), max_error_pp: num("valErrPp", "Erro máximo (p.p.)"), backlash_mm: num("valBacklash", "Folga na reversão (mm)"), report };
          await callRpc("gaxeta_mag_set_geometry_status", { p_geometry_id: Number(magSetup.validating), p_status: "validated", p_evidence: evidence });
          magSetup.validating = null;
          await afterMagSetupChange("Revisão validada com a evidência do ensaio.");
        } catch (error) {
          fail(error);
        }
      });
    };
  if ($id("ngKind"))
    $id("ngKind").onchange = () => {
      const table = $id("ngKind").value === "table";
      $id("ngSlopeRow").hidden = table;
      $id("ngCurveRow").hidden = !table;
      $id("ngDatumRow").hidden = !table;
    };
  if ($id("setupNewForm"))
    $id("setupNewForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const key = $id("ngKey").value.trim().toLowerCase();
          if (!/^[a-z][a-z0-9_-]{1,39}$/.test(key)) throw Error("Família do suporte: comece por letra e use só letras minúsculas, números, hífen ou sublinhado (2 a 40 caracteres).");
          const label = $id("ngLabel").value.trim();
          if (!label) throw Error("Informe a descrição da revisão.");
          const table = $id("ngKind").value === "table";
          const geometry = {
            key, label, model_kind: table ? "table" : "linear", direction: Number($id("ngDir").value),
            unique_arc_deg: num("ngArc", "Arco útil"), back_margin_deg: num("ngBack", "Recuo tolerado"), tolerance_mm: num("ngTol", "Tolerância"),
            min_course_mm: num("ngMin", "Menor curso"), max_course_mm: num("ngMax", "Maior curso"),
          };
          if (table) {
            const points = $id("ngCurve").value.split(/\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split(/[;\t]/).map((cell) => parseMm(cell)));
            if (points.length < 2 || points.some((pair) => pair.length !== 2 || pair.some((cell) => cell === null || Number.isNaN(cell))))
              throw Error("Pontos do ensaio: uma linha por ponto, no formato graus; mm (pelo menos dois pontos).");
            geometry.curve = points;
            const datum = $id("ngDatum").value.trim();
            if (datum && !/^\d{1,4}$/.test(datum)) throw Error("Datum mecânico: ângulo bruto inteiro, de 0 a 4095.");
            if (datum) geometry.datum_raw = Number(datum);
          } else geometry.mm_per_deg = num("ngSlope", "Avanço por grau");
          const saved = await callRpc("gaxeta_mag_save_geometry", { p_geometry: geometry });
          await afterMagSetupChange(`Revisão ${saved.key} r${saved.revision} gravada como rascunho. Vincule-a ao spot e valide depois do ensaio.`);
        } catch (error) {
          fail(error);
        }
      });
    };
}

// ----- Ativos: campos no formulário Editar do TAG e do spot, e a linha da ficha -----
const magAssetInfoCache = new Map(); // ativo → resposta de gaxeta_mag_asset_setup (ou null se indisponível)
async function magAssetInfo(assetId) {
  if (!assetId) return null;
  if (magAssetInfoCache.has(assetId)) return magAssetInfoCache.get(assetId);
  let info = null;
  try {
    info = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: assetId });
  } catch (error) {
    info = null;
  }
  magAssetInfoCache.set(assetId, info);
  return info;
}
// Linha da ficha do spot e do TAG: o valor e de onde ele veio.
function magAssetSummaryText(info) {
  if (!info) return null;
  if (info.kind === "equipment") return info.suggested_course_mm != null ? `${fmtMm(info.suggested_course_mm, 2)}${info.size_class ? " · porte " + SIZE_CLASS_LABEL[info.size_class].toLowerCase() : ""} · estimativa` : "Não cadastrado";
  const eff = info.effective || {};
  return eff.suggested_course_mm != null ? `${fmtMm(eff.suggested_course_mm, 2)} · ${COURSE_SOURCE_TEXT[eff.course_source] || ""} · estimativa` : "Não cadastrado";
}
const magAssetForm = { info: null, parentInfo: null, available: true };
function magAssetFormBox() {
  let box = $id("magAssetBox");
  if (box) return box;
  box = document.createElement("div");
  box.id = "magAssetBox";
  $id("assetFormMessage").before(box);
  return box;
}
// Prepara os campos ao abrir o formulário (edição ou criação).
async function magAssetFormPrepare(editing, parent) {
  const box = magAssetFormBox();
  Object.assign(magAssetForm, { info: null, parentInfo: null, available: true });
  if (state.magMissing) magAssetForm.available = false;
  else
    try {
      if (editing && ["equipment", "point"].includes(editing.kind)) magAssetForm.info = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: editing.id });
      const tagId = editing?.kind === "point" ? editing.parent_id : !editing && parent?.kind === "equipment" ? parent.id : null;
      if (tagId) magAssetForm.parentInfo = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: tagId }).catch(() => null);
    } catch (error) {
      // Banco sem a migração 15 (ou ativo fora do escopo): o formulário segue sem estes campos.
      magAssetForm.available = false;
    }
  const info = magAssetForm.info;
  const tagCourse = info?.kind === "point" ? info.tag?.suggested_course_mm : magAssetForm.parentInfo?.suggested_course_mm;
  const own = info?.kind === "point" ? info.own?.suggested_course_mm : null;
  const canCourse = info ? info.can_edit_course : true;
  box.innerHTML =
    `<fieldset class="equip-group mag-asset" id="magAssetEquip" hidden><legend>Sensor magnético: curso do preme-gaxeta</legend>` +
    `<label>Curso disponível típico (mm)<input id="magTagCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" placeholder="Ex.: 20 ou 2,5" value="${esc(info?.kind === "equipment" ? fmtMmInput(info.suggested_course_mm) : "")}"${canCourse ? "" : " disabled"}></label>` +
    `<label>Porte (opcional)<select id="magTagSize"${canCourse ? "" : " disabled"}><option value="">Não informado</option>${Object.entries(SIZE_CLASS_LABEL).map(([value, text]) => `<option value="${value}"${info?.kind === "equipment" && info.size_class === value ? " selected" : ""}>${text}</option>`).join("")}</select></label>` +
    `<p class="form-help span-all">Quanto o preme-gaxeta costuma poder avançar depois de um engaxetamento novo. Vale para todos os spots deste TAG sem valor próprio e entra como <b>curso estimado</b>. Em branco = não cadastrado. Mudar este valor não altera os ciclos já registrados.</p></fieldset>` +
    `<fieldset class="equip-group mag-asset" id="magAssetPoint" hidden><legend>Sensor magnético: curso do preme-gaxeta</legend>` +
    `<label class="check span-all"><input type="radio" name="magSpotMode" value="inherit"${own == null ? " checked" : ""}${canCourse ? "" : " disabled"}> Herdar do TAG${tagCourse != null ? " (" + esc(fmtMm(tagCourse, 2)) + ")" : " (TAG sem valor cadastrado)"}</label>` +
    `<label class="check span-all"><input type="radio" name="magSpotMode" value="own"${own != null ? " checked" : ""}${canCourse ? "" : " disabled"}> Valor específico deste spot</label>` +
    `<label>Curso deste spot (mm)<input id="magSpotCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" placeholder="Ex.: 15" value="${esc(fmtMmInput(own))}"${own == null || !canCourse ? " disabled" : ""}></label>` +
    (info?.kind === "point"
      ? `<p class="form-help span-all">Em uso: <b>${esc(magAssetSummaryText(info))}</b>. Revisão da montagem: ${esc(geomText(info.effective?.geometry))}.</p>` +
        `<p class="span-all"><button class="secondary compact" type="button" id="magAssetSetup">${info.can_edit_geometry ? "Revisão da montagem e ensaio…" : "Ver a montagem deste spot…"}</button></p>`
      : `<p class="form-help span-all">A revisão da montagem (geometria ensaiada) é vinculada pela engenharia depois de o spot existir.</p>`) +
    `</fieldset>`;
  for (const radio of box.querySelectorAll('input[name="magSpotMode"]'))
    radio.onchange = () => {
      $id("magSpotCourse").disabled = radio.value !== "own" || !radio.checked;
      if (radio.value === "own" && radio.checked) $id("magSpotCourse").focus();
    };
  if ($id("magAssetSetup"))
    $id("magAssetSetup").onclick = () => {
      const pointId = magAssetForm.info.asset_id;
      $id("assetDialog").close();
      openMagSetupForPoint(pointId).catch((error) => showMessage(errorText(error), "error"));
    };
}
function magAssetFormSync(kind) {
  if (!$id("magAssetBox")) return;
  $id("magAssetEquip").hidden = !(magAssetForm.available && kind === "equipment");
  $id("magAssetPoint").hidden = !(magAssetForm.available && kind === "point");
}
// Lê e valida o que foi digitado, antes de gravar o ativo. Devolve null quando não há o que gravar.
function magAssetFormRead(kind) {
  if (!magAssetForm.available || !$id("magAssetBox")) return null;
  const info = magAssetForm.info;
  if (kind === "equipment") {
    if (info && !info.can_edit_course) return null;
    const course = readCourseField($id("magTagCourse").value, "Curso disponível típico");
    const size = $id("magTagSize").value || null;
    const changed = !info ? course != null || size != null : Number(info.suggested_course_mm ?? NaN) !== Number(course ?? NaN) || (info.size_class || null) !== size;
    return changed ? { kind, course, size, geometryId: info?.can_edit_geometry ? (info?.geometry?.id ?? null) : null } : null;
  }
  if (kind === "point") {
    if (info && !info.can_edit_course) return null;
    const ownMode = document.querySelector('input[name="magSpotMode"]:checked')?.value === "own";
    const course = ownMode ? readCourseField($id("magSpotCourse").value, "Curso deste spot") : null;
    if (ownMode && course == null) throw Error("Informe o curso deste spot, ou escolha Herdar do TAG.");
    const before = info?.own?.suggested_course_mm ?? null;
    return Number(before ?? NaN) !== Number(course ?? NaN) && !(before == null && course == null) ? { kind, course } : null;
  }
  return null;
}
async function magAssetFormApply(saved, wanted) {
  if (!wanted) return;
  if (wanted.kind === "equipment")
    await callRpc("gaxeta_mag_set_equipment_defaults", { p_asset_id: saved.id, p_size_class: wanted.size, p_suggested_course_mm: wanted.course, p_geometry_id: wanted.geometryId });
  else await callRpc("gaxeta_mag_set_point_course", { p_point_id: saved.id, p_course_mm: wanted.course });
  magAssetInfoCache.clear();
}

// ---- 70-telemetry.js ----
// =============================================================================
// Telemetria.
//   * Identidade primeiro: TAG · tipo de equipamento, depois sensor e spot.
//   * Um único contexto (sensor + período) alimenta gráfico, métricas, mudanças e
//     CSV: o que está em tela é sempre de `telem.loaded`.
//   * Leitura atual (leve, a cada ciclo) separada da consulta de histórico (pesada,
//     só quando o período pede). Uma solicitação por combinação; respostas e erros
//     de pedidos substituídos são descartados e a requisição é cancelada.
//   * O gráfico é a série ELÉTRICA do sensor (posição em % da escala elétrica da placa):
//     leitura atual (média bruta de cada intervalo) e linha estabilizada em degraus, que só
//     muda com variação de 5 p.p. Não há classificação mecânica, milímetros nem ciclo.
//   * Os CSV trazem só telemetria elétrica: posição (%), tensão (V), ADC e escala.
// =============================================================================
const telem = {
  matchIds: null, // resultado da busca do seletor (null = sem filtro)
  listed: false, // o seletor já recebeu a lista de sensores da conta nesta sessão
  searchRun: 0,
  period: 36e5, // preset escolhido (ms, "month" ou "3months")
  custom: false, // true = intervalo fixo (manual ou ampliado)
  range: presetRange(36e5),
  request: 0,
  controller: null,
  pending: null, // { key, label, auto }
  loaded: null, // { sensorId, range, label, history, movements, seed, stats, truncated, bucketSeconds }
  error: "",
  zoomStack: [], // seleções anteriores, para "Voltar" restaurar inclusive um intervalo manual
  lastLoadAt: 0,
  pin: null, // horário do intervalo tocado no gráfico (a dica fica fixa até outro toque)
};
const PERIOD_LABELS = { 300000: "5 min", 3600000: "1 hora", 21600000: "6 horas", 86400000: "1 dia", 604800000: "7 dias", month: "1 mês", "3months": "3 meses" };
const selectionLabel = () => (telem.custom ? "intervalo personalizado" : PERIOD_LABELS[telem.period] || "período");
const shortDateTime = (value) => new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function resetTelemetryData() {
  telem.controller?.abort();
  telem.request++;
  Object.assign(telem, { controller: null, pending: null, loaded: null, error: "", zoomStack: [], lastLoadAt: 0, pin: null });
}

// ----- Seletor de sensor -----
// Opção curta: "TAG · tipo · spot". Só quando duas opções coincidem entram, nesta ordem,
// empresa/área, nome do sensor e identificador.
function sensorOptions(devices) {
  const entries = devices.map((device) => {
    const identity = deviceIdentity(device);
    return { device, identity, label: identity.linked ? [identity.tag, identity.type, identity.spot].filter(Boolean).join(" · ") : `${identity.sensor} · sem vínculo` };
  });
  for (const extra of [(entry) => entry.identity.context, (entry) => (entry.identity.linked ? "sensor " + entry.identity.sensor : ""), (entry) => entry.device.sensor_id]) {
    const seen = new Map();
    for (const entry of entries) seen.set(entry.label, (seen.get(entry.label) || 0) + 1);
    for (const entry of entries) if (seen.get(entry.label) > 1 && extra(entry)) entry.label += " — " + extra(entry);
  }
  return entries.sort((left, right) => left.label.localeCompare(right.label, "pt-BR", { numeric: true }));
}
function renderHistorySelect() {
  const known = telem.matchIds ? telem.matchIds.map(findDevice).filter(Boolean) : state.devices.filter((device) => device.origin !== "integration_test");
  const current = currentDevice();
  if (current && !known.includes(current)) known.unshift(current);
  fillSelect(
    $id("historySensor"),
    sensorOptions(known.slice(0, 100)).map((entry) => ({ value: entry.device.sensor_id, label: entry.label })),
    known.length ? null : telem.matchIds ? "Nenhum sensor encontrado" : "Nenhum sensor",
    state.sensorId,
  );
}
// Busca no servidor por TAG, nome do sensor, ID ou MAC, dentro do que a conta pode ver.
async function searchHistorySensors() {
  const run = ++telem.searchRun;
  const query = $id("historySearch").value.trim();
  const result = await callRpc("gaxeta_devices_page", { p_asset_id: null, p_search: query || null, p_unlinked: false, p_limit: 50, p_offset: 0 });
  if (run !== telem.searchRun) return;
  mergeDevices(result.items);
  await ensureAssets(result.items.map((device) => device.measurement_point_id));
  if (run !== telem.searchRun) return;
  telem.matchIds = query ? result.items.map((device) => device.sensor_id) : null;
  if (!query) telem.listed = true;
  renderHistorySelect();
}
$id("historySearch").oninput = debounce(() => searchHistorySensors().catch((error) => showMessage(errorText(error), "error")), 350);

// Histórico aberto a partir de Sensores, TAG ou Spot: o sensor exato escolhido fica selecionado.
function openHistoryFor(sensorId) {
  if (!sensorId) return;
  if (state.sensorId !== sensorId) {
    state.sensorId = sensorId;
    resetTelemetryData();
  }
  telem.matchIds = null;
  telem.searchRun++;
  $id("historySearch").value = "";
  if (state.page === "telemetry") openTelemetry().catch((error) => showMessage(errorText(error), "error"));
  else showPage("telemetry");
}
async function openTelemetry() {
  renderTelemetryLive();
  renderHistory();
  if (state.sensorId && !currentDevice()) await refreshKnownDevices();
  if (!currentDevice()) {
    await searchHistorySensors();
    if (!currentDevice()) {
      state.sensorId = state.devices.find((device) => device.origin !== "integration_test")?.sensor_id || "";
      resetTelemetryData();
    }
  } else if (!telem.listed && !telem.matchIds) {
    // Entrou direto com um sensor escolhido: preenche o seletor em segundo plano.
    searchHistorySensors().catch(() => {});
  }
  await ensureAssets([currentDevice()?.measurement_point_id]);
  // Leitura atual e preferências do sensor (faixas simuladas) antes do primeiro desenho do gráfico.
  if (currentDevice() && !state.live.has(state.sensorId)) await loadTelemetrySummary([state.sensorId]).catch(() => {});
  if (state.page !== "telemetry") return;
  renderHistorySelect();
  renderTelemetryLive();
  // A leitura atual é relida ao abrir a tela, sem esperar o próximo ciclo: quem chega de Sensores
  // ou de Ativos vê o mesmo número, a mesma faixa e o mesmo horário do último envio.
  refreshKnownDevices().then(() => state.page === "telemetry" && renderTelemetryLive()).catch(() => {});
  await loadHistory();
}
$id("historySensor").onchange = () => {
  state.sensorId = $id("historySensor").value;
  // Troca de sensor: os dados do anterior saem da tela na hora, antes da resposta nova.
  resetTelemetryData();
  renderTelemetryLive();
  renderHistory();
  ensureAssets([currentDevice()?.measurement_point_id])
    .then(() => (state.live.has(state.sensorId) ? null : loadTelemetrySummary([state.sensorId])))
    .then(() => {
      renderHistorySelect();
      renderTelemetryLive();
    })
    .catch(() => {});
  loadHistory();
};

// ----- Consulta do histórico -----
function toLocalInput(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
}
function historyErrorText(error) {
  if (isNetworkError(error)) return "Sem resposta do servidor. A leitura atual e o histórico serão tentados de novo.";
  if (error?.code === "57014") return "A consulta deste período demorou demais. Reduza o período e tente de novo.";
  if (error?.code === "42501") return "Sua conta não tem acesso ao histórico deste sensor.";
  return "Não foi possível carregar o histórico: " + errorText(error);
}
// Uma solicitação por combinação de sensor e período. `auto` = atualização periódica de um preset.
async function loadHistory({ auto = false } = {}) {
  const sensorId = state.sensorId;
  if (!sensorId) {
    resetTelemetryData();
    renderHistory();
    return;
  }
  // A atualização automática nunca compete com um pedido de quem está usando.
  if (auto && telem.pending) return;
  // Preset = janela móvel, calculada só quando há carga. Intervalo manual ou ampliado = fixo.
  const range = telem.custom ? { from: telem.range.from, to: telem.range.to } : presetRange(telem.period, new Date(Date.now() + state.clockOffset));
  const key = sensorId + "|" + telemetrySeries(currentDevice()) + "|" + (telem.custom ? range.from.toISOString() + "|" + range.to.toISOString() : "preset:" + telem.period);
  if (!auto && telem.pending && !telem.pending.auto && telem.pending.key === key) return; // mesmo pedido já em andamento
  telem.controller?.abort();
  const controller = new AbortController();
  const token = ++telem.request;
  const label = selectionLabel();
  Object.assign(telem, { controller, pending: { key, label, auto }, error: auto ? telem.error : "" });
  renderHistoryState();
  try {
    // Fuso local só na tela: a consulta vai em ISO UTC, com os limites e a inclusividade da RPC.
    // Uma série por modalidade: a magnética tem consulta, gráfico e CSV próprios.
    const series = telemetrySeries(currentDevice());
    const data = await unwrap(sb.rpc(series === "as5600_i2c" ? "gaxeta_mag_history" : "gaxeta_history", { p_sensor_id: sensorId, p_from: range.from.toISOString(), p_to: range.to.toISOString() }).abortSignal(controller.signal));
    if (token !== telem.request || sensorId !== state.sensorId || !state.authorized) return;
    telem.loaded = series === "as5600_i2c" ? magLoaded({ sensorId, range, label, custom: telem.custom }, data) : {
      sensorId,
      range,
      label,
      custom: telem.custom,
      history: data.history || [],
      movements: data.movements || [],
      seed: data.seed || null,
      stats: data.stats || {},
      truncated: !!data.movements_truncated,
      bucketSeconds: data.bucket_seconds,
    };
    telem.error = "";
    telem.lastLoadAt = Date.now();
  } catch (error) {
    if (token !== telem.request) return; // pedido substituído: o erro dele não interessa mais
    telem.error = historyErrorText(error);
    telem.lastLoadAt = Date.now();
    if (error?.code === "42501") checkContext().catch(() => {});
    // Erro da consulta de histórico não é "sem conexão": só falha de transporte muda o indicador global.
    if (isNetworkError(error)) setConnection(false);
  } finally {
    if (token === telem.request) {
      telem.pending = null;
      telem.controller = null;
      renderHistory();
    }
  }
}
// Ritmo da atualização automática conforme a janela: períodos longos não são refeitos a cada ciclo.
function autoIntervalMs() {
  const span = typeof telem.period === "number" || /^\d+$/.test(telem.period) ? Number(telem.period) : Infinity;
  if (span <= 3e5) return CONFIG.pollMs;
  if (span <= 36e5) return 15e3;
  if (span <= 216e5) return 6e4;
  if (span <= 864e5) return 12e4;
  if (span <= 6048e5) return 3e5;
  return 6e5;
}
function refreshHistoryIfDue() {
  if (state.page !== "telemetry" || !state.sensorId || telem.custom || telem.pending) return;
  if (Date.now() - telem.lastLoadAt < autoIntervalMs()) return;
  loadHistory({ auto: true });
}

// ----- Desenho -----
// Linha estabilizada em degraus, um trecho por referência em vigor: começa na semente
// autorizada (referência anterior ao período) ou na primeira mudança, troca de valor no
// instante da mudança e termina na última leitura elegível, nunca além dela.
// Os patamares têm uma cor só (série elétrica, sem condição mecânica). O degrau vertical
// (o instante da mudança) é neutro: não representa um valor mantido.
function buildStableSegments(movements, seed, fromValue, toValue, lastValue) {
  const from = +new Date(fromValue);
  const to = +new Date(toValue);
  const end = Math.min(to, +new Date(lastValue));
  const levels = [];
  let risers = "";
  if (!(to > from) || !(end >= from)) return { levels, risers };
  const px = (time) => Math.max(0, Math.min(1e3, ((time - from) / (to - from)) * 1e3)).toFixed(2);
  const py = (percent) => (280 - Math.max(0, Math.min(100, Number(percent))) * 2.8).toFixed(2);
  let value = seed?.stable_percent ?? null;
  let startX = value == null ? null : px(from);
  const close = (endX) => {
    if (value != null && endX !== startX) levels.push({ key: "electric", d: `M${startX} ${py(value)}H${endX}` });
  };
  for (const move of movements) {
    const time = +new Date(move.received_at);
    if (time < from || time > end) continue;
    const at = px(time);
    close(at);
    if (value != null) risers += `M${at} ${py(value)}V${py(move.stable_percent)}`;
    value = move.stable_percent;
    startX = at;
  }
  close(px(end));
  return { levels, risers };
}
// Leitura atual do sensor selecionado (barata; roda a cada ciclo sem refazer o histórico).
function renderTelemetryLive() {
  const device = currentDevice();
  const identity = deviceIdentity(device);
  // Os mesmos números de Sensores → Detalhes: os dois saem de state.devices e state.live.
  const live = device ? deviceLive(device) : null;
  if ($id("historySeries")) $id("historySeries").hidden = !device;
  if (device && isMagnetic(device, live)) return renderTelemetryLiveMag(device);
  applySummaryLabels("electric");
  const view = electricView(device, live);
  const electric = view.electric;
  $id("historyTitle").textContent = device ? identity.title : "Telemetria";
  $id("historyTitle").title = identity.path || "";
  $id("historyContext").textContent = !device
    ? "Nenhum sensor selecionado."
    : identity.linked
      ? `Sensor: ${identity.sensor} · Spot: ${identity.spot}`
      : `Sensor sem vínculo com spot (fila de associação) · ${deviceStatus(device).label}`;
  $id("historyContext").title = identity.path || "";
  $id("historyCurrentLabel").textContent = "Posição elétrica" + (electric.label ? " · " + electric.label : "");
  $id("historyCurrent").textContent = electric.text;
  $id("historyHealthBox").className = "summary-main health-" + view.key;
  $id("historyHealth").textContent = view.label;
  $id("historyAction").textContent = view.note;
  // Posição elétrica, tensão e linha estabilizada lado a lado, da mesma leitura.
  const volt = voltageInfo(device, live);
  $id("historyVoltLabel").textContent = volt.source ? `Tensão ${volt.source} (V)` : "Tensão (V)";
  $id("historyVolt").textContent = volt.text + (electric.block && electric.block !== "ok" && electric.block !== "unknown" && BLOCK_SHORT[electric.block] ? " *" : "");
  $id("historyVolt").title = [volt.title, electric.block ? "Condição do bloco: " + (BLOCK_TEXT[electric.block] || "—") : ""].filter(Boolean).join(". ");
  $id("historyRawNow").textContent = electric.text;
  $id("historyRawNow").title = (electric.label ? electric.label + ": " + (BLOCK_HINT[electric.block] || "") + " " : "Leitura atual, sem a estabilização de 5 p.p. ") + "Em % da " + scaleText(electric.scale) + ".";
  $id("historyStableNow").textContent = device?.stable_percent == null ? "—" : fmtNum(device.stable_percent) + " %";
  $id("historyDelta").textContent = rawDeltaText(device).split(" · ").slice(0, 2).join(" · ") || "—";
  const cadence = firmwareCadence(device?.firmware_version);
  $id("historyReading").textContent = !device
    ? ""
    : `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"}` +
      (electric.label ? ` · ${electric.label}` : electric.block && electric.block !== "ok" && electric.block !== "unknown" ? ` · ${BLOCK_SHORT[electric.block]}` : "") +
      (cadence ? ` · ${cadence.text}` : "") +
      (electric.scale ? ` · ${scaleText(electric.scale)}` : "");
  $id("historySince").textContent = device?.stable_since ? "Linha estabilizada desde " + fmtDateTime(device.stable_since) : "";
  $id("historyEdit").disabled = !device;
}
// O que está em tela e o que está sendo carregado, sempre explícito.
function renderHistoryState() {
  const { loaded, pending, error } = telem;
  const userLoading = !!pending && !pending.auto;
  const shown = loaded ? `Em tela: ${loaded.label} · ${shortDateTime(loaded.range.from)} a ${shortDateTime(loaded.range.to)}` : "";
  $id("historyShown").textContent = userLoading
    ? (shown ? shown + " · " : "") + `carregando ${pending.label}…`
    : error
      ? (shown ? shown + " · " : "") + error
      : shown;
  $id("historyShown").classList.toggle("is-error", !userLoading && !!error);
  document.querySelector(".chart-panel").classList.toggle("is-loading", userLoading);
  // Enquanto outro intervalo carrega, os CSV ficam desabilitados: exportam sempre o que está em tela.
  $id("exportCsv").disabled = userLoading || !loaded?.history.length;
  $id("exportMovements").disabled = userLoading || !loaded?.movements.length || !!loaded?.truncated;
  $id("resetZoom").hidden = !telem.zoomStack.length;
  document.querySelectorAll("[data-range]").forEach((button) => button.classList.toggle("selected", !telem.custom && String(telem.period) === button.dataset.range));
  $id("customToggle").classList.toggle("selected", telem.custom);
  if (telem.custom) {
    $id("customRange").hidden = false;
    $id("customToggle").setAttribute("aria-expanded", "true");
  }
  const range = loaded?.range || (telem.custom ? telem.range : null);
  if (range && !$id("customRange").contains(document.activeElement)) {
    $id("fromTime").value = toLocalInput(range.from);
    $id("toTime").value = toLocalInput(range.to);
  }
}
function renderHistory() {
  renderTelemetryLive();
  renderHistoryState();
  if (telem.loaded?.modality === "as5600_i2c") return renderHistoryMag();
  // Série elétrica em tela (ou nada carregado num sensor elétrico): rótulos elétricos no gráfico e nas tabelas.
  if (telem.loaded || !isMagnetic(currentDevice(), currentDevice() ? deviceLive(currentDevice()) : null)) applyChartLabels("electric");
  const loaded = telem.loaded;
  const rows = loaded?.history || [];
  const movements = loaded?.movements || [];
  const stats = loaded?.stats || {};
  const range = loaded?.range || null;
  $id("historyMin").textContent = `${fmtNum(stats.min)} %`;
  $id("historyMax").textContent = `${fmtNum(stats.max)} %`;
  $id("historyCount").textContent = loaded ? fmtNum(stats.count || 0, 0) : "—";
  $id("chartEmpty").hidden = rows.length > 0;
  $id("chartEmpty").textContent = !state.sensorId
    ? "Selecione um sensor."
    : telem.pending && !loaded
      ? "Carregando…"
      : telem.error && !loaded
        ? telem.error
        : "Nenhuma leitura neste período.";
  $id("chartFrom").textContent = range ? fmtDateTime(range.from) : "—";
  $id("chartTo").textContent = range ? fmtDateTime(range.to) : "—";
  $id("aggregationNote").textContent = !loaded
    ? ""
    : loaded.truncated
      ? "Muitas mudanças neste intervalo. Reduza o período para exibir a linha completa."
      : "Linha estabilizada: mudanças de 5 p.p. ou mais · leitura atual: média de " + fmtNum(loaded.bucketSeconds || 1, 0) + " s por intervalo · faixa: mín./máx. brutos";
  $id("movementCount").textContent = !loaded
    ? ""
    : loaded.truncated
      ? "Mais de 5.000 registros — reduza o período"
      : movements.filter((move) => move.previous_percent != null).length + " mudanças de 5 p.p. no período";
  $id("movementRows").innerHTML =
    movements
      .slice(-30)
      .reverse()
      .map(
        (move) =>
          `<tr><td>${fmtDateTime(move.received_at)}</td><td>${move.previous_percent == null ? "Primeira leitura" : fmtNum(move.previous_percent) + " %"}</td><td>${fmtNum(move.stable_percent)} %</td><td>${move.previous_percent == null ? "—" : fmtNum(move.stable_percent - move.previous_percent) + " p.p."}</td></tr>`,
      )
      .join("") ||
    `<tr><td colspan="4">${loaded ? "Nenhuma mudança de 5 pontos na posição elétrica neste período. Movimentos menores aparecem na leitura atual do gráfico e na tabela de leituras brutas." : telem.error || "Aguardando o histórico…"}</td></tr>`;
  const point = (row, field) => {
    const x = Math.max(0, Math.min(1e3, ((new Date(row.received_at) - range.from) / (range.to - range.from)) * 1e3));
    const y = 280 - Math.max(0, Math.min(100, Number(row[field]))) * 2.8;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  // Patamares da linha estabilizada: um traço só, na cor da série elétrica.
  const byHealth = new Map();
  let risers = "";
  if (loaded && !loaded.truncated) {
    const stable = buildStableSegments(movements, loaded.seed, range.from, range.to, stats.last_received_at || rows.at(-1)?.received_at);
    risers = stable.risers;
    for (const level of stable.levels) byHealth.set(level.key, (byHealth.get(level.key) || "") + level.d);
  }
  const band = rows.length
    ? rows.map((row, index) => `${index ? "L" : "M"}${point(row, "min_percent")}`).join(" ") +
      [...rows]
        .reverse()
        .map((row) => `L${point(row, "max_percent")}`)
        .join(" ") +
      " Z"
    : "";
  // Leitura atual: a média bruta de cada intervalo, sem filtro. É ela que mostra o giro pequeno
  // que a linha estabilizada (5 p.p.) não mostra. A linha quebra em lacunas longas.
  const gapDevice = currentDevice();
  const gapMs = Math.max(3 * (Number(loaded?.bucketSeconds) || 1) * 1000, 90e3, 2.5 * (Number(gapDevice ? deviceInterval(gapDevice) : 0) || 0) * 1000);
  let rawPath = "";
  rows.forEach((row, index) => {
    const previous = rows[index - 1];
    rawPath += `${!previous || new Date(row.received_at) - new Date(previous.received_at) > gapMs ? "M" : "L"}${point(row, "travel_percent")} `;
  });
  $id("historyChart").innerHTML = rows.length
    ? `<path class="chart-band" d="${$id("showRawBand").checked ? band : ""}"/>` +
      `<path class="chart-riser" d="${risers}"/>` +
      [...byHealth].map(([key, d]) => `<path class="chart-line chart-${key}" d="${d}"/>`).join("") +
      `<path class="chart-raw" d="${rawPath.trim()}"/>` +
      (rows.length === 1 ? `<circle class="chart-dot chart-raw-dot" cx="${point(rows[0], "travel_percent").split(" ")[0]}" cy="${point(rows[0], "travel_percent").split(" ")[1]}" r="4"/>` : "")
    : "";
  paintChartPin();
  $id("historyChart").setAttribute(
    "aria-label",
    `Posição elétrica do sensor. ${rows.length} intervalos. ${fmtNum(stats.count || 0, 0)} leituras. Mínimo ${fmtNum(stats.min)}%, máximo ${fmtNum(stats.max)}%. Leitura atual e linha estabilizada de 5 pontos, sem classificação mecânica. Arraste para ampliar.`,
  );
  $id("historyRows").innerHTML =
    rows
      .slice(-30)
      .reverse()
      .map(
        (row) =>
          `<tr><td>${fmtDateTime(row.received_at)}</td><td>${fmtNum(row.stable_percent)} %<small class="raw-average">Leitura: ${fmtNum(row.travel_percent, 2)}%</small></td><td>${fmtNum(row.min_percent)} / ${fmtNum(row.max_percent)} %</td><td>${fmtNum(row.voltage_v, 3)} V</td><td>${row.voltage_mv == null ? "—" : fmtVolt(row.voltage_mv)}</td><td>${fmtNum(row.samples, 0)}</td></tr>`,
      )
      .join("") || '<tr><td colspan="6">Nenhuma leitura neste período.</td></tr>';
}

// ----- Período -----
document.querySelectorAll("[data-range]").forEach((button) => {
  button.onclick = () => {
    // Preset: janela móvel. Sai de qualquer intervalo fixo e esquece ampliações anteriores.
    Object.assign(telem, { period: /^\d+$/.test(button.dataset.range) ? Number(button.dataset.range) : button.dataset.range, custom: false, zoomStack: [] });
    $id("customRange").hidden = true;
    $id("customToggle").setAttribute("aria-expanded", "false");
    loadHistory();
  };
});
// "Personalizado" abre os campos De/Até. Com um intervalo fixo em uso, eles ficam à vista.
$id("customToggle").onclick = () => {
  const show = telem.custom || $id("customRange").hidden;
  $id("customRange").hidden = !show;
  $id("customToggle").setAttribute("aria-expanded", String(show));
  if (show) $id("fromTime").focus();
};
$id("customRange").onsubmit = (event) => {
  event.preventDefault();
  try {
    // Intervalo manual: fica fixo depois de aplicado (a atualização periódica não o desloca).
    const range = validateRange($id("fromTime").value, $id("toTime").value);
    Object.assign(telem, { range, custom: true, zoomStack: [] });
    $id("fromTime").blur();
    $id("toTime").blur();
    loadHistory();
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
// Voltar da ampliação restaura a seleção anterior, inclusive quando ela era um intervalo manual.
$id("resetZoom").onclick = () => {
  const previous = telem.zoomStack.pop();
  if (!previous) return;
  Object.assign(telem, { custom: previous.custom, period: previous.period, range: previous.range });
  if (!telem.custom) {
    $id("customRange").hidden = true;
    $id("customToggle").setAttribute("aria-expanded", "false");
  }
  loadHistory();
};

// ----- Ampliação por arraste, dica e leitura por toque -----
// Mouse: a dica acompanha o ponteiro. Toque (ou clique sem arrastar): o intervalo mais próximo
// fica marcado e a dica fixa mostra hora, valor e, na bancada, a faixa simulada. Arrastar amplia.
let chartDragStart = null;
const chartFraction = (event) => {
  const box = $id("historyChart").getBoundingClientRect();
  return Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
};
const chartRowValue = (loaded, row) => (loaded.modality === "as5600_i2c" ? magRowValue(loaded.series, row) : row.travel_percent == null ? null : Number(row.travel_percent));
const chartTooltipText = (loaded, row) =>
  loaded.modality === "as5600_i2c"
    ? magTooltipText(row, loaded)
    : `${fmtDateTime(row.received_at)}
Posição elétrica: leitura ${fmtNum(row.travel_percent, 2)}% · linha estabilizada ${fmtNum(row.stable_percent)}% · mín. ${fmtNum(row.min_percent)}% · máx. ${fmtNum(row.max_percent)}%${row.voltage_mv == null ? "" : " · " + fmtVolt(row.voltage_mv) + " calibrada"}
${fmtNum(row.samples, 0)} leituras`;
const chartNearestRow = (loaded, fraction) => {
  const at = loaded.range.from.getTime() + fraction * (loaded.range.to - loaded.range.from);
  return loaded.history.reduce((best, row) => (!best || Math.abs(new Date(row.received_at) - at) < Math.abs(new Date(best.received_at) - at) ? row : best), null);
};
function showChartTooltip(loaded, row, fraction) {
  const tip = $id("chartTooltip");
  tip.textContent = chartTooltipText(loaded, row);
  // A dica fica do lado oposto ao ponto, para não o cobrir.
  tip.style.left = fraction < 0.5 ? "auto" : "6px";
  tip.style.right = fraction < 0.5 ? "6px" : "auto";
  tip.hidden = false;
}
// Marca do intervalo tocado: linha vertical e ponto, redesenhados a cada atualização do gráfico.
function paintChartPin() {
  const chart = $id("historyChart");
  chart.querySelector(".chart-pin")?.remove();
  const loaded = telem.loaded;
  const row = loaded && telem.pin ? loaded.history.find((item) => item.received_at === telem.pin) : null;
  if (!row) {
    if (telem.pin) $id("chartTooltip").hidden = true;
    telem.pin = null;
    return;
  }
  const fraction = Math.max(0, Math.min(1, (new Date(row.received_at) - loaded.range.from) / (loaded.range.to - loaded.range.from)));
  const value = chartRowValue(loaded, row);
  const x = (fraction * 1e3).toFixed(2);
  chart.insertAdjacentHTML(
    "beforeend",
    `<g class="chart-pin"><path class="chart-pin-line" d="M${x} 0V280"/>` +
      (value == null ? "" : `<path class="chart-pin-halo" d="M${x} ${(280 - Math.max(0, Math.min(100, value)) * 2.8).toFixed(2)}h0.01"/><path class="chart-pin-dot" d="M${x} ${(280 - Math.max(0, Math.min(100, value)) * 2.8).toFixed(2)}h0.01"/>`) +
      `</g>`,
  );
  showChartTooltip(loaded, row, fraction);
}
$id("historyChart").onpointerdown = (event) => {
  if (!telem.loaded?.history.length || telem.pending?.auto === false) return;
  chartDragStart = chartFraction(event);
  $id("historyChart").setPointerCapture(event.pointerId);
};
$id("historyChart").onpointermove = (event) => {
  const loaded = telem.loaded;
  if (!loaded) return;
  const fraction = chartFraction(event);
  if (chartDragStart !== null) {
    if (Math.abs(fraction - chartDragStart) < 0.01) return; // ainda é um toque, não um arraste
    let selection = $id("historyChart").querySelector(".chart-selection");
    if (!selection) {
      selection = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      selection.setAttribute("class", "chart-selection");
      selection.setAttribute("height", "280");
      $id("historyChart").append(selection);
    }
    selection.setAttribute("x", Math.min(fraction, chartDragStart) * 1e3);
    selection.setAttribute("width", Math.abs(fraction - chartDragStart) * 1e3);
    return;
  }
  if (event.pointerType !== "mouse") return;
  const nearest = chartNearestRow(loaded, fraction);
  if (nearest) showChartTooltip(loaded, nearest, fraction);
};
$id("historyChart").onpointerleave = () => {
  // Com um ponto marcado, a dica volta a ele; sem marca, some.
  if (telem.pin) paintChartPin();
  else $id("chartTooltip").hidden = true;
};
$id("historyChart").onpointercancel = () => {
  chartDragStart = null;
  $id("historyChart").querySelector(".chart-selection")?.remove();
};
$id("historyChart").onpointerup = (event) => {
  if (chartDragStart === null) return;
  const end = chartFraction(event);
  const start = chartDragStart;
  chartDragStart = null;
  $id("historyChart").querySelector(".chart-selection")?.remove();
  const loaded = telem.loaded;
  if (!loaded) return;
  if (Math.abs(end - start) < 0.01) {
    // Toque: marca o intervalo mais próximo (tocar de novo no mesmo desmarca).
    const nearest = chartNearestRow(loaded, end);
    telem.pin = nearest && nearest.received_at !== telem.pin ? nearest.received_at : null;
    if (!telem.pin) $id("chartTooltip").hidden = true;
    return paintChartPin();
  }
  const span = loaded.range.to - loaded.range.from;
  try {
    const range = validateRange(new Date(loaded.range.from.getTime() + Math.min(start, end) * span), new Date(loaded.range.from.getTime() + Math.max(start, end) * span));
    telem.zoomStack.push({ custom: telem.custom, period: telem.period, range: telem.range });
    Object.assign(telem, { range, custom: true, pin: null });
    $id("chartTooltip").hidden = true;
    loadHistory();
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};

// ----- CSV: sempre do contexto em tela (sensor e período carregados) -----
$id("exportCsv").onclick = async () => {
  const loaded = telem.loaded;
  if (!loaded?.history.length) return;
  if (loaded.modality === "as5600_i2c") return void exportMagCsv(loaded).catch((error) => showMessage(errorText(error), "error"));
  const text = [
    // Só telemetria elétrica. A tensão é a calibrada pelo ADC quando o firmware a envia; senão,
    // a estimada (ADC × 3,3 ÷ 4095). A última coluna diz em que escala o percentual foi calculado.
    ["horario", "posicao_eletrica_estabilizada_pct", "posicao_eletrica_media_pct", "posicao_eletrica_min_pct", "posicao_eletrica_max_pct",
      "tensao_v", "origem_da_tensao", "tensao_estimada_v", "adc_bruto", "leituras", "escala_do_percentual"],
    ...loaded.history.map((row) => [
      row.received_at, row.stable_percent, row.travel_percent, row.min_percent, row.max_percent,
      row.voltage_mv == null ? row.voltage_v : Number(row.voltage_mv) / 1000, row.voltage_mv == null ? "estimada" : "calibrada", row.voltage_v, row.adc_raw ?? "", row.samples,
      (row.percent_scale || "adc bruto 0-4095") + (row.scale_mixed ? " (troca de escala neste intervalo)" : ""),
    ]),
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n");
  try {
    await exportCsvFile(text, `gaxeta-${loaded.sensorId}-intervalos.csv`);
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
$id("exportMovements").onclick = async () => {
  const loaded = telem.loaded;
  if (!loaded?.movements.length) return;
  if (loaded.truncated) return showMessage("Reduza o período para exportar todas as mudanças.");
  if (loaded.modality === "as5600_i2c") return void exportMagMovementsCsv(loaded).catch((error) => showMessage(errorText(error), "error"));
  const text = [
    ["horario", "posicao_eletrica_anterior_pct", "posicao_eletrica_estabilizada_pct", "variacao_pontos", "regra"],
    ...loaded.movements.map((move) => [move.received_at, move.previous_percent, move.stable_percent, move.previous_percent == null ? "" : Number(move.stable_percent) - Number(move.previous_percent), "mudanca de 5 p.p. ou mais na posicao eletrica"]),
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n");
  try {
    await exportCsvFile(text, `gaxeta-${loaded.sensorId}-mudancas.csv`);
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
$id("showRawBand").onchange = renderHistory;
$id("historySeries").onchange = () => loadHistory();
$id("historyEdit").onclick = () => {
  if (state.sensorId) openSensorEditor(state.sensorId);
};

// ---- 72-telemetry-mag.js ----
// =============================================================================
// Telemetria da modalidade magnética (AS5600).
//   * A série magnética nunca entra na conta da série elétrica: % do ADC e % de curso são
//     gráficos, tabelas e CSV separados (telem.loaded.modality).
//   * Com referência no período: Curso de ajuste restante (%), média física por intervalo,
//     um trecho por engaxetamento. A linha quebra em lacunas e na troca de referência.
//   * Sem referência: ângulo absoluto (0° a 360°), em média CIRCULAR calculada no servidor. A
//     linha quebra na passagem por 0° em vez de atravessar o gráfico.
//   * CSV com unidade, método, qualidade, revisão da geometria e referência em cada linha.
// =============================================================================
const TELEM_LABELS = {
  electric: {
    rawNow: ["Posição elétrica (%)", "Leitura atual do potenciômetro, em % da escala elétrica da placa (0 % no mínimo, 100 % no máximo)."],
    volt: null,
    stableNow: ["Linha estabilizada (%)", "Posição elétrica estabilizada: só muda com variação de 5 pontos percentuais ou mais."],
    delta: ["Variação desde o envio anterior", "Diferença entre o envio anterior e o atual, sem a estabilização de 5 p.p."],
    min: ["Mín. elétrico", "Menor posição elétrica do período"],
    max: ["Máx. elétrico", "Maior posição elétrica do período"],
    scale: "Posição elétrica do sensor (% da escala elétrica)",
    legend: ["Leitura atual (média por intervalo)", "Linha estabilizada (5 p.p.)", "Mudança da linha estabilizada"],
    axis: ["100", "75", "50", "25", "0"],
    movementTitle: "Mudanças da linha estabilizada (posição elétrica)",
    movementHead: ["Horário", "Posição elétrica anterior", "Nova posição elétrica", "Variação"],
    historyHead: ["Horário", "Posição elétrica: estabilizada / leitura (média)", "Mín. / máx. elétrico", "Tensão estimada", "Tensão calibrada", "Leituras"],
  },
  course: {
    rawNow: ["Curso restante (%)", "Curso de ajuste restante da leitura atual: calculado pela geometria a partir do engaxetamento registrado."],
    volt: ["Avanço (mm)", "Avanço do preme-gaxeta desde o engaxetamento (calculado). Negativo = recuo."],
    stableNow: ["Linha estabilizada (%)", "Curso restante estabilizado: só muda com variação de 5 pontos percentuais ou mais, dentro do mesmo engaxetamento."],
    delta: ["Ângulo do sensor", "Ângulo absoluto do ímã (medido). Não é avanço nem curso."],
    min: ["Mín. do período", "Menor curso restante válido do período"],
    max: ["Máx. do período", "Maior curso restante válido do período"],
    scale: "Curso de ajuste restante (% do curso disponível no engaxetamento)",
    legend: ["Curso restante (média por intervalo)", "Linha estabilizada (5 p.p.)", "Engaxetamento registrado"],
    axis: ["100", "75", "50", "25", "0"],
    movementTitle: "Mudanças do curso de ajuste restante (5 p.p.)",
    movementHead: ["Horário", "Curso restante anterior", "Novo curso restante", "Variação"],
    historyHead: ["Horário", "Curso restante: estabilizado / média", "Mín. / máx.", "Avanço (mm)", "Ângulo (média circular)", "Leituras válidas / total"],
  },
  // Modo bancada: série própria, nunca somada nem comparada com a de campo.
  bench: {
    rawNow: ["Posição de bancada (%)", "Posição de bancada da leitura atual: demonstração em mesa, limitada a 0–100 %. Não é curso de ajuste restante."],
    volt: ["Posição contínua (°)", "Posição angular contínua no referencial do chip: passa de 360° e fica negativa conforme as voltas."],
    stableNow: ["Além do extremo (°)", "Quanto o eixo passou do 100 % (positivo) ou ficou abaixo do 0 % (negativo)."],
    delta: ["Ângulo do sensor", "Ângulo absoluto do ímã (medido), de 0° a 359,9°."],
    min: ["Mín. de bancada", "Menor posição de bancada do período"],
    max: ["Máx. de bancada", "Maior posição de bancada do período"],
    scale: "MODO BANCADA · Posição de bancada (% entre os dois ângulos configurados) · não é curso de campo",
    legend: ["Posição de bancada (média por intervalo)", "—", "—"],
    axis: ["100", "75", "50", "25", "0"],
    movementTitle: "Mudanças do curso de ajuste restante (5 p.p.)",
    movementHead: ["Horário", "Curso restante anterior", "Novo curso restante", "Variação"],
    historyHead: ["Horário", "Posição de bancada (média)", "Mín. / máx.", "Posição contínua desde o 0 % (mín. / máx.)", "Ângulo (média circular)", "Leituras com posição / total"],
  },
  angle: {
    rawNow: ["Curso restante (%)", "Sem engaxetamento registrado neste período: não há curso restante."],
    volt: ["Avanço (mm)", "Sem engaxetamento registrado: não há avanço."],
    stableNow: ["Linha estabilizada (%)", "Só existe depois de um engaxetamento registrado."],
    delta: ["Ângulo do sensor", "Ângulo absoluto do ímã (medido). Não é avanço nem curso."],
    min: ["Mín. do período", "Sem curso restante no período"],
    max: ["Máx. do período", "Sem curso restante no período"],
    scale: "Ângulo absoluto do sensor (0° a 360°, média circular por intervalo)",
    legend: ["Ângulo (média circular)", "—", "—"],
    axis: ["360°", "270°", "180°", "90°", "0°"],
    movementTitle: "Mudanças do curso de ajuste restante (5 p.p.)",
    movementHead: ["Horário", "Curso restante anterior", "Novo curso restante", "Variação"],
    historyHead: ["Horário", "Curso restante: estabilizado / média", "Mín. / máx.", "Avanço (mm)", "Ângulo (média circular)", "Leituras válidas / total"],
  },
};
// Bancada com as faixas simuladas ligadas: o resumo mostra a faixa no lugar do excesso de giro.
TELEM_LABELS.benchsim = {
  ...TELEM_LABELS.bench,
  stableNow: ["Faixa simulada", "Faixa simulada da bancada, decidida sobre o percentual mostrado: Sem ajuste até 29,99 %, Baixo de 30,00 a 49,99 %, Médio de 50,00 a 72,99 %, Alto de 73,00 % em diante. Não é a condição do engaxetamento."],
  scale: "MODO BANCADA · Posição de bancada (%) com faixas simuladas · não é curso de campo",
};
// Os rótulos do resumo seguem a modalidade da leitura ATUAL; os do gráfico e das tabelas seguem
// a série CARREGADA. Assim, um sensor que voltou ao potenciômetro pode mostrar o histórico
// magnético antigo sem trocar os rótulos da leitura atual, e vice-versa.
let telemSummaryMode = "electric";
let telemChartMode = "electric";
function applySummaryLabels(mode) {
  if (mode === telemSummaryMode) return;
  telemSummaryMode = mode;
  const text = TELEM_LABELS[mode];
  const set = (id, pair) => {
    if (!pair || !$id(id)) return;
    $id(id).textContent = pair[0];
    $id(id).title = pair[1];
  };
  set("lblRawNow", text.rawNow);
  set("historyVoltLabel", text.volt);
  set("lblStableNow", text.stableNow);
  set("lblDelta", text.delta);
}
function applyChartLabels(mode, sim = false) {
  const chartKey = mode + (sim ? ":sim" : "");
  if (chartKey === telemChartMode) return;
  telemChartMode = chartKey;
  const text = TELEM_LABELS[mode === "bench" && sim ? "benchsim" : mode];
  for (const [id, pair] of [["lblMin", text.min], ["lblMax", text.max]]) {
    $id(id).textContent = pair[0];
    $id(id).title = pair[1];
  }
  $id("chartScaleNote").textContent = text.scale;
  // Bancada: legenda com o nome e os limites de cada faixa simulada (ou a linha neutra, lilás).
  $id("chartLegend").innerHTML =
    mode === "bench"
      ? (sim
          ? BENCH_SIM_ORDER.map((name) => `<li class="legend-sim health-${BENCH_SIM[name].key}"><i></i>${esc(BENCH_SIM[name].label)} <small>${esc(BENCH_SIM[name].range)}</small></li>`).join("")
          : `<li class="legend-bench"><i></i>${esc(text.legend[0])}</li>`) + `<li class="legend-anchor"><i></i>Início confirmado</li>`
      : `<li class="legend-raw"><i></i>${esc(text.legend[0])}</li>` +
        (text.legend[1] === "—" ? "" : `<li class="legend-stable"><i></i>${esc(text.legend[1])}</li><li class="legend-change"><i></i>${esc(text.legend[2])}</li>`);
  $id("chartYAxis").innerHTML = text.axis.map((label) => `<span>${esc(label)}</span>`).join("");
  $id("movementTitle").textContent = text.movementTitle;
  $id("movementHead").innerHTML = text.movementHead.map((label) => `<th>${esc(label)}</th>`).join("");
  $id("historyHead").innerHTML = text.historyHead.map((label) => `<th>${esc(label)}</th>`).join("");
  $id("showRawBand").closest("label").hidden = mode === "angle";
  $id("chartScaleNote").classList.toggle("is-bench", mode === "bench");
  document.querySelector(".chart-panel").classList.toggle("is-bench-chart", mode === "bench");
}
// Que série a Telemetria mostra: a da modalidade atual do sensor, ou a escolhida no seletor.
function telemetrySeries(device) {
  const chosen = $id("historySeries")?.value || "auto";
  if (chosen !== "auto") return chosen;
  return isMagnetic(device, device ? deviceLive(device) : null) ? "as5600_i2c" : "adc_pot";
}
// Resposta de gaxeta_mag_history no formato que a tela usa (telem.loaded).
function magLoaded(base, data) {
  const history = data.history || [];
  const course = history.filter((row) => row.remaining_percent != null);
  const bench = history.filter((row) => row.bench_percent != null);
  // A série do gráfico é a da leitura mais recente com valor: bancada ou campo, nunca as duas
  // no mesmo gráfico. Sem nenhuma das duas, o ângulo.
  const lastValued = [...history].reverse().find((row) => row.remaining_percent != null || row.bench_percent != null || row.bench_id != null);
  const series = lastValued?.bench_id != null ? "bench" : course.length ? "course" : bench.length ? "bench" : "angle";
  const valid = series === "bench" ? bench : course;
  const low = (row) => Number(series === "bench" ? row.min_bench ?? row.bench_percent : row.min_remaining ?? row.remaining_percent);
  const high = (row) => Number(series === "bench" ? row.max_bench ?? row.bench_percent : row.max_remaining ?? row.remaining_percent);
  return {
    ...base,
    modality: "as5600_i2c",
    series,
    history,
    movements: data.movements || [],
    services: data.services || [],
    benches: data.benches || [],
    seed: null,
    stats: {
      count: data.stats?.count || 0,
      valid: data.stats?.valid || 0,
      last_received_at: data.stats?.last_received_at || null,
      min: valid.length ? Math.min(...valid.map(low)) : null,
      max: valid.length ? Math.max(...valid.map(high)) : null,
    },
    truncated: !!data.movements_truncated,
    bucketSeconds: data.bucket_seconds,
  };
}

// Leitura atual de um sensor magnético (a cada ciclo, sem refazer o histórico).
function renderTelemetryLiveMag(device) {
  const identity = deviceIdentity(device);
  const view = deviceView(device);
  const computed = view.computed;
  const service = view.service;
  const bench = view.bench || null;
  applySummaryLabels(bench ? (view.benchBands ? "benchsim" : "bench") : computed ? "course" : "angle");
  const benchLate = !!bench && view.scale != null && !deviceStatus(device).online;
  $id("historyTitle").textContent = identity.title;
  $id("historyTitle").title = identity.path || "";
  $id("historyContext").textContent = identity.linked
    ? `Sensor: ${identity.sensor} · Spot: ${identity.spot} · sensor magnético · série: ${bench ? "BANCADA" : computed ? view.series : "ângulo"}`
    : `Sensor magnético sem vínculo com spot (fila de associação) · ${deviceStatus(device).label}`;
  $id("historyContext").title = identity.path || "";
  $id("historyCurrentLabel").textContent = bench ? (benchLate ? "Bancada · última leitura válida (não é a atual)" : "Modo bancada · posição de bancada") : view.kicker + (view.origin ? ` (${view.origin})` : "");
  $id("historyCurrent").textContent = view.value === "—" ? "—" : `${view.value}${view.unit === "%" ? " %" : view.unit}`;
  $id("historyHealthBox").className = "summary-main health-" + view.key;
  $id("historyHealth").textContent = view.label;
  $id("historyAction").textContent = view.note;
  if (bench) {
    $id("historyRawNow").textContent = view.scale != null ? view.value + " %" : "—";
    $id("historyRawNow").title = view.note;
    $id("historyVolt").textContent = bench.continuous_deg == null ? "—" : fmtDeg(bench.continuous_deg, 2);
    $id("historyVolt").title = bench.continuous_deg == null ? "" : `${bench.turns} volta(s) inteira(s)`;
    $id("historyStableNow").textContent = view.benchBands ? view.sim?.label || "—" : bench.over_deg == null ? "—" : fmtDeg(bench.over_deg, 1);
    $id("historyStableNow").title = view.benchBands && view.sim ? `${view.sim.range} · ${view.where}` : "";
  } else {
    $id("historyStableNow").title = "";
    $id("historyRawNow").textContent = computed ? fmtNum(computed.remaining_percent, 2) + " %" : "—";
    $id("historyRawNow").title = computed ? `${fmtMm(computed.remaining_mm, 2)} de ${fmtMm(service?.course_mm, 2)}` + (view.reason === "out_of_range" ? " · fora da faixa validada" : "") : MAG_REASON[view.reason]?.note || "";
    $id("historyVolt").textContent = computed ? fmtMm(computed.advance_mm, 2) : "—";
    $id("historyVolt").title = computed ? "Calculado pela geometria " + (service?.geometry || "") : "";
    $id("historyStableNow").textContent = service?.stable_remaining == null ? "—" : fmtNum(service.stable_shown ?? service.stable_remaining, 2) + " %" + (MAG_BAND[service.band] ? " · " + MAG_BAND[service.band].label : "");
  }
  $id("historyDelta").textContent = view.raw == null ? "—" : `${fmtDeg(view.degrees, 2)} · bruto ${view.raw}`;
  const cadence = firmwareCadence(device.firmware_version);
  $id("historyReading").textContent =
    `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"} · ${magSignalText(device, view.mag)}` +
    (cadence ? ` · ${cadence.text}` : "") +
    (bench ? ` · Modo bancada: ${fmtDeg(bench.zero_deg, 1)} = 0 %, ${fmtDeg(bench.full_deg, 1)} = 100 %, ${Number(bench.direction) > 0 ? "crescente" : "decrescente"}` : "") +
    (service ? ` · engaxetamento de ${fmtDateTime(service.captured_at)}: ${fmtMm(service.course_mm)} ${service.course_origin === "estimated" ? "estimados" : "medidos"}, geometria ${service.geometry}` : "");
  $id("historySince").textContent = bench
    ? (benchLate ? `Última leitura válida às ${fmtClock(device.last_received_at)} · sem atualização há ${agoText(device.last_received_at)}` : `Atualizado às ${fmtClock(device.last_received_at)}`) + " · bancada desde " + fmtClock(bench.started_at)
    : service?.stable_since ? "Linha estabilizada desde " + fmtDateTime(service.stable_since) : "";
  $id("historyHealthBox").classList.toggle("is-stale", benchLate);
  // A preferência das faixas chegou (ou mudou em outro cliente) depois de o gráfico ser desenhado:
  // o gráfico em tela é refeito com ela, sem nova consulta.
  if (telem.loaded?.modality === "as5600_i2c" && telem.loaded.series === "bench" && telem.loaded.sensorId === device.sensor_id && !telem.pending &&
      telem.benchBandsDrawn !== benchBandsOn(device.sensor_id, view.mag)) renderHistoryMag();
  $id("historyEdit").disabled = false;
}

// Valor desenhado de um intervalo, na série em tela (null = sem valor: a linha é interrompida).
function magRowValue(mode, row) {
  if (mode === "bench") return benchShown(row.bench_percent) == null ? null : Number(row.bench_percent);
  if (mode === "course") return row.remaining_percent == null ? null : Number(row.remaining_percent);
  return row.angle_deg == null ? null : (Number(row.angle_deg) / 360) * 100;
}
// Curva da bancada. Cada trecho é pintado conforme a altura que representa: abaixo de 30 %
// vermelho, de 30 a 50 % laranja, de 50 a 73 % amarelo e de 73 % em diante verde. Um trecho que
// cruza um limite é dividido no ponto do cruzamento (interpolação só gráfica: dica e tabela
// continuam com os horários e valores recebidos). A linha é interrompida em toda leitura sem
// posição (inválida, reposicionar, início não confirmado), na troca de configuração e em lacunas
// de tempo; um ponto sozinho aparece como ponto. Com as faixas desligadas, uma cor só (lilás).
function benchChartSvg(rows, { xOf, yOf, gapMs, bands, showBand }) {
  const runs = [];
  let run = null;
  let previous = null;
  for (const row of rows) {
    const value = magRowValue("bench", row);
    if (value == null) {
      run = previous = null; // leitura sem posição entre duas válidas: a interrupção fica à vista
      continue;
    }
    // Intervalo que mistura leituras com e sem posição: fica isolado, sem ligar aos vizinhos.
    const mixed = Number(row.samples) > Number(row.bench_ok);
    const broke = !previous || previous.mixed || mixed || row.bench_id !== previous.row.bench_id || new Date(row.received_at) - new Date(previous.row.last_at || previous.row.received_at) > gapMs;
    if (broke) runs.push((run = []));
    run.push({ x: xOf(row.received_at), v: value, row });
    previous = { row, mixed };
  }
  const paths = { none: "", low: "", medium: "", high: "", bench: "" };
  const dots = { none: "", low: "", medium: "", high: "", bench: "" };
  let casing = "";
  let dotCasing = "";
  let area = "";
  const bandOf = (value) => (bands ? benchSimOf(value)?.band || "bench" : "bench");
  const at = (point) => `${point.x.toFixed(2)} ${yOf(point.v).toFixed(2)}`;
  for (const points of runs) {
    if (points.length === 1) {
      // Ponto isolado: traço de comprimento zero com ponta redonda (não deforma quando o gráfico estica).
      const dot = `M${at(points[0])}h0.01`;
      dots[bandOf(points[0].v)] += dot;
      dotCasing += dot;
      continue;
    }
    casing += "M" + points.map(at).join("L");
    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1];
      const to = points[index];
      const cuts = bands
        ? BENCH_SIM_EDGES.filter((edge) => (from.v - edge) * (to.v - edge) < 0).map((edge) => (edge - from.v) / (to.v - from.v)).sort((left, right) => left - right)
        : [];
      const stops = [from, ...cuts.map((part) => ({ x: from.x + (to.x - from.x) * part, v: from.v + (to.v - from.v) * part })), to];
      for (let piece = 1; piece < stops.length; piece++)
        paths[bandOf((stops[piece - 1].v + stops[piece].v) / 2)] += `M${at(stops[piece - 1])}L${at(stops[piece])}`;
    }
    if (showBand)
      area += "M" + points.map((point) => `${point.x.toFixed(2)} ${yOf(point.row.max_bench ?? point.v).toFixed(2)}`).join("L") +
        "L" + [...points].reverse().map((point) => `${point.x.toFixed(2)} ${yOf(point.row.min_bench ?? point.v).toFixed(2)}`).join("L") + "Z";
  }
  return {
    count: runs.reduce((total, points) => total + points.length, 0),
    runs: runs.length,
    svg:
      `<path class="chart-band" d="${area}"/>` +
      (bands ? `<path class="chart-sim-edge" d="M0 ${yOf(30).toFixed(2)}H1000M0 ${yOf(50).toFixed(2)}H1000M0 ${yOf(73).toFixed(2)}H1000"/>` : "") +
      `<path class="chart-sim-case" d="${casing}"/>` +
      (bands
        ? BENCH_SIM_ORDER.map((name) => `<path class="chart-sim chart-${BENCH_SIM[name].key}" d="${paths[name]}"/>`).join("")
        : "") +
      `<path class="chart-sim chart-bench-line" d="${paths.bench}"/>` +
      `<path class="chart-sim-case chart-sim-dot-case" d="${dotCasing}"/>` +
      Object.keys(dots).map((name) => (dots[name] ? `<path class="chart-sim chart-sim-dot ${name === "bench" ? "chart-bench-line" : "chart-" + BENCH_SIM[name].key}" d="${dots[name]}"/>` : "")).join(""),
  };
}
function renderHistoryMag() {
  const loaded = telem.loaded;
  const mode = loaded.series;
  const gapDevice = currentDevice();
  // Faixas simuladas: a preferência atual do sensor vale para todo o período em tela.
  const bands = mode === "bench" && benchBandsOn(loaded.sensorId, gapDevice ? deviceMag(gapDevice) : null);
  telem.benchBandsDrawn = bands;
  applyChartLabels(mode, bands);
  const rows = loaded.history;
  const movements = loaded.movements;
  const stats = loaded.stats;
  const range = loaded.range;
  $id("historyMin").textContent = stats.min == null ? "—" : `${fmtNum(stats.min, mode === "bench" ? 2 : 1)} %`;
  $id("historyMax").textContent = stats.max == null ? "—" : `${fmtNum(stats.max, mode === "bench" ? 2 : 1)} %`;
  $id("historyCount").textContent = `${fmtNum(stats.valid, 0)} válidas de ${fmtNum(stats.count, 0)}`;
  $id("chartEmpty").hidden = rows.length > 0;
  $id("chartEmpty").textContent = "Nenhuma leitura magnética neste período.";
  $id("chartFrom").textContent = fmtDateTime(range.from);
  $id("chartTo").textContent = fmtDateTime(range.to);
  $id("aggregationNote").textContent = loaded.truncated
    ? "Muitas mudanças neste intervalo. Reduza o período para exibir a linha completa."
    : mode === "bench"
      ? "MODO BANCADA: Posição de bancada, média de " + fmtNum(loaded.bucketSeconds || 1, 0) + " s por intervalo · a linha é interrompida na troca de configuração e onde não há posição válida" +
        (bands ? " · cada trecho tem a cor da faixa simulada da sua altura" : "") + " · não gera mudanças de 5 p.p. nem evento de manutenção."
      : mode === "course"
      ? "Curso restante: média de " + fmtNum(loaded.bucketSeconds || 1, 0) + " s por intervalo, só de leituras válidas · um trecho por engaxetamento · linha estabilizada: 5 p.p."
      : "Ângulo: média circular de " + fmtNum(loaded.bucketSeconds || 1, 0) + " s por intervalo, só de leituras válidas. Sem engaxetamento no período não há curso restante.";
  $id("movementCount").textContent = loaded.truncated ? "Mais de 5.000 registros — reduza o período" : movements.length + " mudanças de 5 p.p. no período";
  $id("movementRows").innerHTML =
    movements
      .slice(-30)
      .reverse()
      .map((move) => `<tr><td>${fmtDateTime(move.received_at)}</td><td>${fmtNum(move.previous_remaining)} %</td><td>${fmtNum(move.stable_remaining)} %</td><td>${fmtNum(move.stable_remaining - move.previous_remaining)} p.p.</td></tr>`)
      .join("") ||
    `<tr><td colspan="4">${mode === "course" ? "Nenhuma mudança de 5 pontos no curso restante neste período." : mode === "bench" ? "Série de bancada: a bancada não registra mudanças de 5 pontos nem evento de campo." : "Sem engaxetamento registrado neste período: não há curso restante para acompanhar."}</td></tr>`;
  const xOf = (time) => Math.max(0, Math.min(1e3, ((new Date(time) - range.from) / (range.to - range.from)) * 1e3));
  const yOf = (percent) => 280 - clampPercent(percent) * 2.8;
  const px = (time) => xOf(time).toFixed(2);
  const py = (percent) => yOf(percent).toFixed(2);
  const valueOf = (row) => magRowValue(mode, row);
  const gapMs = Math.max(3 * (Number(loaded.bucketSeconds) || 1) * 1000, 90e3, 2.5 * (Number(gapDevice ? deviceInterval(gapDevice) : 0) || 0) * 1000);
  // Marca vertical em cada engaxetamento capturado dentro do período.
  // No modo bancada a marca é a confirmação do início de cada configuração.
  const marks = (mode === "bench" ? (loaded.benches || []).filter((bench) => bench.anchor_at).map((bench) => ({ captured_at: bench.anchor_at })) : loaded.services)
    .filter((service) => new Date(service.captured_at) >= range.from && new Date(service.captured_at) <= range.to)
    .map((service) => `M${px(service.captured_at)} 0V280`)
    .join("");
  let drawnCount = 0;
  if (mode === "bench") {
    const chart = benchChartSvg(rows, { xOf, yOf, gapMs, bands, showBand: $id("showRawBand").checked });
    drawnCount = chart.count;
    $id("historyChart").innerHTML = rows.length ? `<path class="chart-service" d="${marks}"/>` + chart.svg : "";
  } else {
    // A linha quebra em lacunas, em intervalos sem leitura válida, na troca de referência e, no
    // modo ângulo, na passagem por 0° (um salto de mais de 180° é a volta do contador, não um giro).
    const breaks = (row, previous) =>
      !previous ||
      new Date(row.received_at) - new Date(previous.last_at || previous.received_at) > gapMs ||
      (mode === "course" && row.service_id !== previous.service_id) ||
      (mode === "angle" && Math.abs(Number(row.angle_deg) - Number(previous.angle_deg)) > 180);
    let rawPath = "", stablePath = "", risers = "", band = "", bandUp = [], bandDown = [];
    let previous = null, previousStable = null, first = null;
    const closeBand = () => {
      if (bandUp.length > 1) band += "M" + bandUp.join(" L") + " L" + bandDown.reverse().join(" L") + " Z ";
      bandUp = [];
      bandDown = [];
    };
    for (const row of rows) {
      // Intervalo sem valor entre dois válidos: a linha é interrompida ali, mesmo sem lacuna de tempo.
      if (valueOf(row) == null) {
        previous = null;
        closeBand();
        continue;
      }
      drawnCount++;
      first ??= row;
      const x = px(row.received_at);
      const broke = breaks(row, previous);
      rawPath += `${broke ? "M" : "L"}${x} ${py(valueOf(row))} `;
      if (mode === "course") {
        if (broke) closeBand();
        bandUp.push(`${x} ${py(row.max_remaining ?? row.remaining_percent)}`);
        bandDown.push(`${x} ${py(row.min_remaining ?? row.remaining_percent)}`);
        if (row.stable_remaining != null) {
          if (broke || previousStable == null) stablePath += `M${x} ${py(row.stable_remaining)}`;
          else {
            stablePath += `H${x}`;
            if (Number(row.stable_remaining) !== Number(previousStable)) {
              risers += `M${x} ${py(previousStable)}V${py(row.stable_remaining)}`;
              stablePath += `M${x} ${py(row.stable_remaining)}`;
            }
          }
          previousStable = row.stable_remaining;
        }
      }
      previous = row;
    }
    closeBand();
    $id("historyChart").innerHTML = rows.length
      ? `<path class="chart-band" d="${$id("showRawBand").checked && mode !== "angle" ? band : ""}"/>` +
        `<path class="chart-service" d="${marks}"/>` +
        `<path class="chart-riser" d="${risers}"/>` +
        `<path class="chart-line chart-electric" d="${stablePath}"/>` +
        `<path class="chart-raw" d="${rawPath.trim()}"/>` +
        (drawnCount === 1 ? `<circle class="chart-dot chart-raw-dot" cx="${px(first.received_at)}" cy="${py(valueOf(first))}" r="4"/>` : "")
      : "";
  }
  paintChartPin();
  $id("historyChart").setAttribute(
    "aria-label",
    mode === "bench"
      ? `Modo bancada: posição de bancada em percentual${bands ? ", com a cor da faixa simulada em cada trecho (Sem ajuste até 29,99, Baixo de 30 a 49,99, Médio de 50 a 72,99, Alto de 73 em diante)" : ""}. ${rows.length} intervalos, ${drawnCount} com posição, mínimo ${fmtNum(stats.min, 2)}%, máximo ${fmtNum(stats.max, 2)}%. Não é curso de campo. Toque num ponto para ler hora, percentual e faixa; arraste para ampliar.`
      : mode === "course"
      ? `Curso de ajuste restante. ${rows.length} intervalos, ${fmtNum(stats.valid, 0)} leituras válidas de ${fmtNum(stats.count, 0)}. Mínimo ${fmtNum(stats.min)}%, máximo ${fmtNum(stats.max)}%. ${loaded.services.length} engaxetamento(s) no período. Arraste para ampliar.`
      : `Ângulo absoluto do sensor magnético. ${rows.length} intervalos, ${fmtNum(stats.valid, 0)} leituras válidas de ${fmtNum(stats.count, 0)}. Sem curso restante no período. Arraste para ampliar.`,
  );
  $id("historyRows").innerHTML =
    rows
      .slice(-30)
      .reverse()
      .map(
        (row) =>
          mode === "bench"
            ? `<tr><td>${fmtDateTime(row.received_at)}</td><td>${benchShown(row.bench_percent) == null ? "—" : fmtNum(benchShown(row.bench_percent), 2) + " %"}${bands ? " " + benchSimChip(benchSimOf(row.bench_percent)) : ""}${row.bench_id != null ? '<small class="raw-average">bancada</small>' : ""}</td>` +
              `<td>${row.bench_percent == null ? "—" : fmtNum(row.min_bench, 2) + " / " + fmtNum(row.max_bench, 2) + " %"}</td>` +
              `<td>${row.min_bench_u_deg == null ? "—" : fmtDeg(row.min_bench_u_deg, 1) + " / " + fmtDeg(row.max_bench_u_deg, 1)}</td>` +
              `<td>${fmtDeg(row.angle_deg, 2)}</td><td>${fmtNum(row.bench_ok, 0)} / ${fmtNum(row.samples, 0)}${magRowFlags(row)}</td></tr>`
            :
          `<tr><td>${fmtDateTime(row.received_at)}</td><td>${row.remaining_percent == null ? "—" : fmtNum(row.stable_remaining) + " %"}<small class="raw-average">Média: ${row.remaining_percent == null ? "—" : fmtNum(row.remaining_percent, 2) + "%"}</small></td>` +
          `<td>${row.remaining_percent == null ? "—" : fmtNum(row.min_remaining) + " / " + fmtNum(row.max_remaining) + " %"}</td><td>${row.advance_mm == null ? "—" : fmtNum(row.advance_mm, 2)}</td>` +
          `<td>${fmtDeg(row.angle_deg, 2)}</td><td>${fmtNum(row.valid, 0)} / ${fmtNum(row.samples, 0)}${magRowFlags(row)}</td></tr>`,
      )
      .join("") || '<tr><td colspan="6">Nenhuma leitura magnética neste período.</td></tr>';
}
// Motivos das leituras inválidas de um intervalo, em poucas palavras.
function magRowFlags(row) {
  const flags = [row.bus_fail ? `${row.bus_fail} sem resposta` : "", row.no_magnet ? `${row.no_magnet} sem ímã` : "", row.field_out ? `${row.field_out} campo fora` : "", row.out_of_range ? `${row.out_of_range} fora da faixa` : "",
    row.bench_reposition ? `${row.bench_reposition} reposicionar` : "", row.bench_waiting ? `${row.bench_waiting} sem início confirmado` : ""].filter(Boolean);
  return flags.length ? `<small class="raw-average">${esc(flags.join(" · "))}</small>` : "";
}
function magTooltipText(row, loaded) {
  const service = loaded.services.find((item) => item.id === row.service_id);
  return (
    `${fmtDateTime(row.received_at)}\n` +
    (benchShown(row.bench_percent) != null
      ? `MODO BANCADA · ${fmtNum(benchShown(row.bench_percent), 2)} %` +
        (benchBandsOn(loaded.sensorId, deviceMag(currentDevice())) ? ` · faixa simulada: ${benchSimOf(row.bench_percent).label}` : "") +
        `\nmín. ${fmtNum(row.min_bench, 2)} · máx. ${fmtNum(row.max_bench, 2)} · posição contínua ${fmtDeg(row.min_bench_u_deg, 1)} a ${fmtDeg(row.max_bench_u_deg, 1)} desde o 0 % · ângulo ${fmtDeg(row.angle_deg, 2)}`
      : row.bench_id != null
      ? `MODO BANCADA · sem posição neste intervalo (${[row.bench_reposition ? "reposicionar" : "", row.bench_waiting ? "início não confirmado" : "", row.bus_fail || row.no_magnet || row.field_out ? "amostra inválida" : ""].filter(Boolean).join(", ") || "leitura sem posição"}) · ângulo ${fmtDeg(row.angle_deg, 2)}`
      : row.remaining_percent == null
      ? `Ângulo do sensor: ${fmtDeg(row.angle_deg, 2)} (média circular) · sem curso restante neste intervalo`
      : `Curso restante: ${fmtNum(row.remaining_percent, 2)}% (${fmtMm(row.remaining_mm, 2)}) · estabilizado ${fmtNum(row.stable_remaining)}% · avanço ${fmtMm(row.advance_mm, 2)} · ângulo ${fmtDeg(row.angle_deg, 2)}`) +
    (service ? `\nEngaxetamento de ${fmtDateTime(service.captured_at)} · ${fmtMm(service.course_mm)} ${service.course_origin === "estimated" ? "estimados" : "medidos"} · ${service.geometry}` : "") +
    `\n${fmtNum(row.valid, 0)} leituras válidas de ${fmtNum(row.samples, 0)}`
  );
}
async function exportMagCsv(loaded) {
  const byId = new Map(loaded.services.map((service) => [service.id, service]));
  const benchById = new Map((loaded.benches || []).map((bench) => [bench.id, bench]));
  // Coluna de apresentação (simulação), preenchida só com a preferência ligada.
  const simOn = benchBandsOn(loaded.sensorId, deviceMag(currentDevice()));
  // Cada linha diz a que série pertence: bancada, campo (curso medido ou estimado) ou só ângulo.
  const seriesOf = (row, service) => (row.bench_id != null ? "bancada" : service ? (service.course_origin === "estimated" ? "campo_curso_estimado" : "campo_curso_medido") : "angulo_sem_referencia");
  const text = [
    ["horario", "serie", "modalidade", "engaxetamento_id", "engaxetamento_capturado_em", "geometria_revisao", "curso_disponivel_mm", "origem_do_curso",
      "curso_restante_estabilizado_pct", "curso_restante_medio_pct", "curso_restante_min_pct", "curso_restante_max_pct", "curso_restante_medio_mm", "avanco_medio_mm",
      "angulo_medio_circular_graus", "leituras", "leituras_validas", "falha_de_barramento", "ima_ausente", "campo_fora_da_faixa", "fora_da_faixa_validada",
      "bancada_config", "bancada_posicao_media_pct", "bancada_posicao_min_pct", "bancada_posicao_max_pct", "bancada_continua_min_graus_desde_0pct", "bancada_continua_max_graus_desde_0pct",
      "bancada_leituras_com_posicao", "bancada_leituras_reposicionar", "bancada_faixa_simulada", "maior_passo_entre_amostras_contagens", "maior_lacuna_entre_amostras_ms", "metodo"],
    ...loaded.history.map((row) => {
      const service = byId.get(row.service_id);
      const bench = benchById.get(row.bench_id);
      return [row.received_at, seriesOf(row, service), "as5600_i2c", row.service_id ?? "", service?.captured_at ?? "", service ? service.geometry + (service.provisional ? " (provisoria)" : "") : "",
        service?.course_mm ?? "", service ? (service.course_origin === "estimated" ? "estimado" : "medido") : "",
        row.remaining_percent == null ? "" : row.stable_remaining ?? "", row.remaining_percent ?? "", row.min_remaining ?? "", row.max_remaining ?? "", row.remaining_mm ?? "", row.advance_mm ?? "",
        row.angle_deg ?? "", row.samples, row.valid, row.bus_fail, row.no_magnet, row.field_out, row.out_of_range,
        bench ? `0%=${bench.zero_deg} graus; 100%=${bench.full_deg} graus; sentido ${Number(bench.direction) > 0 ? "crescente" : "decrescente"}` : "",
        row.bench_percent ?? "", row.min_bench ?? "", row.max_bench ?? "", row.min_bench_u_deg ?? "", row.max_bench_u_deg ?? "", row.bench_id != null ? row.bench_ok : "", row.bench_id != null ? row.bench_reposition : "",
        row.bench_id != null && simOn ? benchSimOf(row.bench_percent)?.label ?? "" : "",
        row.ct_step ?? "", row.ct_gap_ms ?? "",
        row.bench_id != null
          ? "MODO BANCADA: posicao de bancada calculada pela contagem continua da placa, limitada a 0-100 %; nao e curso de ajuste restante"
          : "angulo medido (media circular das leituras validas); avanco e curso restante calculados pela geometria da referencia"];
    }),
  ].map((row) => row.map(csvCell).join(";")).join("\r\n");
  await exportCsvFile(text, `gaxeta-${loaded.sensorId}-magnetico-intervalos.csv`);
}
async function exportMagMovementsCsv(loaded) {
  const byId = new Map(loaded.services.map((service) => [service.id, service]));
  const text = [
    ["horario", "engaxetamento_id", "geometria_revisao", "curso_disponivel_mm", "origem_do_curso", "curso_restante_anterior_pct", "curso_restante_estabilizado_pct", "variacao_pontos", "regra"],
    ...loaded.movements.map((move) => {
      const service = byId.get(move.service_id);
      return [move.received_at, move.service_id, service?.geometry ?? "", service?.course_mm ?? "", service ? (service.course_origin === "estimated" ? "estimado" : "medido") : "",
        move.previous_remaining, move.stable_remaining, Number(move.stable_remaining) - Number(move.previous_remaining), "mudanca de 5 p.p. ou mais no curso de ajuste restante, dentro do mesmo engaxetamento"];
    }),
  ].map((row) => row.map(csvCell).join(";")).join("\r\n");
  await exportCsvFile(text, `gaxeta-${loaded.sensorId}-magnetico-mudancas.csv`);
}

// ---- 75-gateways.js ----
// =============================================================================
// Gateways: cadastro e edição reais, sempre sob uma empresa (gaxeta_save_gateway).
// "Cadastrado" não significa "transmitindo": o transporte por gateway ainda não
// está ativo e nenhum estado de transmissão é mostrado sem evidência.
// =============================================================================
const gatewayView = { search: "", offset: 0, total: 0, rows: [], counts: {}, editId: null, request: 0 };
const GATEWAY_PAGE = 24;
async function loadGateways() {
  const run = ++gatewayView.request;
  let query = sb.from("gaxeta_gateways").select("*", { count: "exact" }).order("name").range(gatewayView.offset, gatewayView.offset + GATEWAY_PAGE - 1);
  if (gatewayView.search) {
    const term = gatewayView.search.replace(/[%,()]/g, " ");
    query = query.or(`name.ilike.%${term}%,identifier.ilike.%${term}%`);
  }
  const { data, error, count } = await query;
  if (error) throw error;
  if (run !== gatewayView.request) return;
  gatewayView.rows = data;
  gatewayView.total = count ?? data.length;
  await ensureAssets(data.map((row) => row.company_id));
  gatewayView.counts = {};
  if (data.length) {
    const linked = await unwrap(sb.from("gaxeta_devices").select("gateway_id").in("gateway_id", data.map((row) => row.id)));
    for (const row of linked) gatewayView.counts[row.gateway_id] = (gatewayView.counts[row.gateway_id] || 0) + 1;
  }
  if (run !== gatewayView.request) return;
  renderGateways();
}
function renderGateways() {
  const canManage = hasCap("manage_gateways");
  $id("gatewayGrid").innerHTML =
    gatewayView.rows
      .map(
        (row) =>
          `<article class="gateway-card">${icon("router")}<div class="gateway-main"><h3>${esc(row.name)}</h3><code>${esc(row.identifier)}</code>` +
          `<p>${esc(assetPathLabel(row.company_id) || "Empresa fora do seu escopo")}</p>` +
          `<p><span class="state-chip">Cadastrado</span> ${gatewayView.counts[row.id] || 0} sensor(es) associados</p></div>` +
          (canManage
            ? `<div class="row-actions"><button class="secondary compact" data-gateway-edit="${row.id}">Editar</button>${hasCap("delete_records") ? `<button class="text-button danger-text" data-gateway-delete="${row.id}">Excluir</button>` : ""}</div>`
            : "") +
          `</article>`,
      )
      .join("") ||
    `<div class="empty-state"><h3>Nenhum gateway ${gatewayView.search ? "encontrado" : "cadastrado"}</h3><p>Os sensores seguem transmitindo direto por Wi-Fi. O gateway é opcional e fica sob a empresa.</p></div>`;
  const first = gatewayView.total ? gatewayView.offset + 1 : 0;
  const last = Math.min(gatewayView.offset + GATEWAY_PAGE, gatewayView.total);
  $id("gatewayPager").innerHTML =
    gatewayView.total > GATEWAY_PAGE
      ? `<button class="secondary compact" data-gw-move="-1"${gatewayView.offset ? "" : " disabled"}>Anterior</button><span>${first}–${last} de ${gatewayView.total}</span><button class="secondary compact" data-gw-move="1"${last < gatewayView.total ? "" : " disabled"}>Próxima</button>`
      : "";
  renderIcons();
}
async function openGatewayForm(editId = null) {
  const row = editId ? gatewayView.rows.find((item) => item.id === editId) : null;
  gatewayView.editId = row?.id || null;
  $id("gatewayDialogTitle").textContent = row ? "Editar gateway" : "Cadastrar gateway";
  $id("gatewayName").value = row?.name || "";
  $id("gatewayIdentifier").value = row?.identifier || "";
  $id("gatewayMessage").textContent = "";
  // Empresa: a do gateway em edição, ou a do ramo selecionado na árvore.
  const seed = row?.company_id || state.assetId;
  await ensureAssets([seed]);
  const values = { corporation: "", company: "" };
  for (const asset of assetPath(seed, state.assets)) if (asset.kind in values) values[asset.kind] = asset.id;
  const levels = ["corporation", "company"];
  await refillPicker("gw-pick-", 0, values, levels);
  $id("gw-pick-corporation").onchange = () =>
    withBusy(null, async () => {
      values.corporation = $id("gw-pick-corporation").value;
      values.company = "";
      await refillPicker("gw-pick-", 1, values, levels);
    });
  $id("gatewayDialog").showModal();
}
$id("gatewayForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("gatewayMessage");
  const company = $id("gw-pick-company").value;
  const name = $id("gatewayName").value.trim();
  const identifier = $id("gatewayIdentifier").value.trim();
  if (!company) return void (message.textContent = "Selecione a empresa.");
  if (!name || !identifier) return void (message.textContent = "Informe nome e identificação.");
  message.textContent = "Salvando…";
  event.submitter.disabled = true;
  try {
    const saved = await callRpc("gaxeta_save_gateway", { p_id: gatewayView.editId, p_company_id: company, p_name: name, p_identifier: identifier });
    $id("gatewayDialog").close();
    await loadGateways();
    showMessage(`Gateway “${saved.name}” ${gatewayView.editId ? "atualizado" : "cadastrado"} em ${assetPathLabel(saved.company_id)}.`, "success");
  } catch (error) {
    message.textContent = errorText(error);
  } finally {
    event.submitter.disabled = false;
  }
};
$id("gatewayGrid").onclick = async (event) => {
  const edit = event.target.closest("[data-gateway-edit]");
  const remove = event.target.closest("[data-gateway-delete]");
  if (edit) return withBusy(edit, () => openGatewayForm(edit.dataset.gatewayEdit));
  if (!remove) return;
  const row = gatewayView.rows.find((item) => item.id === remove.dataset.gatewayDelete);
  if (!row) return;
  if (!(await askConfirm({ title: "Excluir gateway", html: `<p>Excluir definitivamente o gateway <b>${esc(row.name)}</b> (${esc(row.identifier)})? Gateways com sensores associados não são excluídos.</p>`, okLabel: "Excluir" }))) return;
  await withBusy(remove, async () => {
    await callRpc("gaxeta_delete_gateway", { p_id: row.id });
    await loadGateways();
    showMessage(`Gateway “${row.name}” excluído.`, "success");
  });
};
$id("gatewayPager").onclick = (event) => {
  const move = event.target.closest("[data-gw-move]");
  if (!move) return;
  gatewayView.offset = Math.max(0, gatewayView.offset + Number(move.dataset.gwMove) * GATEWAY_PAGE);
  loadGateways().catch((error) => showMessage(errorText(error), "error"));
};
$id("gatewaySearch").oninput = debounce(() => {
  gatewayView.search = $id("gatewaySearch").value.trim();
  gatewayView.offset = 0;
  loadGateways().catch((error) => showMessage(errorText(error), "error"));
}, 350);

// ---- 80-users.js ----
// =============================================================================
// Usuários (ADM 1 e 2): listagem paginada, cadastro em três etapas com escopo por
// ramo, ajustes de acesso, nível e status, convites e auditoria. Toda decisão é
// do servidor (RPCs gaxeta_admin_*); a interface só organiza o fluxo.
// =============================================================================
const usersView = { search: "", role: "", status: "", corp: "", offset: 0, total: 0, items: [], request: 0 };
const USERS_PAGE = 25;
const STATUS_LABEL = {
  active: "Ativo",
  disabled: "Desativado",
  invite_pending: "Convite pendente (não enviado)",
  invite_sent: "Convite enviado",
  invite_failed: "Falha no envio",
  invite_expired: "Convite expirado",
};
async function loadUsers() {
  const run = ++usersView.request;
  if ($id("userCorpFilter").options.length < 2) {
    const roots = await loadKids(null);
    fillSelect($id("userCorpFilter"), roots.ids.map((id) => ({ value: id, label: assetName(id) })), "Todas as corporações", usersView.corp);
  }
  const result = await callRpc("gaxeta_admin_users", {
    p_search: usersView.search || null,
    p_role: usersView.role || null,
    p_status: usersView.status || null,
    p_corporation_id: usersView.corp || null,
    p_company_id: null,
    p_limit: USERS_PAGE,
    p_offset: usersView.offset,
  });
  if (run !== usersView.request) return;
  usersView.items = result.items;
  usersView.total = result.total;
  renderUsers();
  if ($id("auditPanel").open) loadAudit().catch(() => {});
}
function renderUsers() {
  const mine = myRole();
  $id("userRows").innerHTML =
    usersView.items
      .map((item) => {
        const isInvite = item.kind === "invite";
        const isGlobal = item.role !== "corp";
        const allowed = mine === "adm1" || !isGlobal; // ADM 2 não altera contas com papel global
        const self = item.id === state.userId;
        const actions = [];
        if (allowed && isInvite) actions.push(`<button data-user-act="resend">Reenviar convite</button>`, `<button data-user-act="revoke">Revogar convite</button>`);
        if (allowed && !isInvite) {
          if (!isGlobal) actions.push(`<button data-user-act="access">Editar acesso</button>`);
          if (mine === "adm1" && !self) actions.push(`<button data-user-act="role">Alterar nível</button>`);
          if (!self) actions.push(`<button data-user-act="${item.status === "active" ? "disable" : "enable"}">${item.status === "active" ? "Desativar" : "Reativar"}</button>`);
          if (mine === "adm1" && !self) actions.push(`<button data-user-act="delete" class="danger-text">Excluir cadastro</button>`);
        }
        return (
          `<tr data-user="${esc(item.id)}" data-kind="${item.kind}"><td data-label="Nome"><strong>${esc(item.display_name || "—")}</strong></td><td data-label="E-mail">${esc(item.email)}</td>` +
          `<td data-label="Nível">${ROLE_LABEL[item.role] || esc(item.role)}${item.role === "corp" && item.can_write ? " · edita" : ""}</td>` +
          `<td data-label="Corporação">${esc(item.corporation_name || (isGlobal ? "Todas" : "—"))}</td>` +
          `<td data-label="Status"><span class="state-chip status-${item.status}">${STATUS_LABEL[item.status] || esc(item.status)}</span>${item.last_error ? `<small class="cell-note">${esc(item.last_error)}</small>` : ""}</td>` +
          `<td class="col-actions">${actions.length ? `<details class="row-menu"><summary>Ações</summary><div class="menu-list">${actions.join("")}</div></details>` : self ? "<small>sua conta</small>" : ""}</td></tr>`
        );
      })
      .join("") || `<tr><td colspan="6">Nenhum usuário encontrado com estes filtros.</td></tr>`;
  const first = usersView.total ? usersView.offset + 1 : 0;
  const last = Math.min(usersView.offset + USERS_PAGE, usersView.total);
  $id("userPager").innerHTML =
    `<span>${first}–${last} de ${usersView.total}</span>` +
    (usersView.total > USERS_PAGE
      ? `<button class="secondary compact" data-user-move="-1"${usersView.offset ? "" : " disabled"}>Anterior</button><button class="secondary compact" data-user-move="1"${last < usersView.total ? "" : " disabled"}>Próxima</button>`
      : "");
}
const reloadUsers = () => loadUsers().catch((error) => showMessage(errorText(error), "error"));
$id("userSearch").oninput = debounce(() => {
  usersView.search = $id("userSearch").value.trim();
  usersView.offset = 0;
  reloadUsers();
}, 350);
for (const [id, key] of [["userRoleFilter", "role"], ["userStatusFilter", "status"], ["userCorpFilter", "corp"]])
  $id(id).onchange = () => {
    usersView[key] = $id(id).value;
    usersView.offset = 0;
    reloadUsers();
  };
$id("userPager").onclick = (event) => {
  const move = event.target.closest("[data-user-move]");
  if (!move) return;
  usersView.offset = Math.max(0, usersView.offset + Number(move.dataset.userMove) * USERS_PAGE);
  reloadUsers();
};

// ----- Envio do convite pelo serviço no servidor (a chave administrativa nunca vem ao navegador) -----
async function sendInvite(inviteId, email) {
  try {
    const { data } = await sb.auth.getSession();
    const response = await fetchWithTimeout(`${CONFIG.supabaseUrl}/functions/v1/${CONFIG.inviteFunction}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CONFIG.publishableKey, Authorization: `Bearer ${data.session?.access_token || ""}` },
      body: JSON.stringify({ invite_id: inviteId, email }),
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok && body.ok) return { ok: true, message: body.message || "Convite enviado." };
    return { ok: false, message: body.message || (response.status === 404 ? "O serviço de envio (gaxeta-invite) não está implantado." : `Falha no envio (${response.status}).`) };
  } catch (error) {
    // Função ausente responde sem cabeçalhos CORS e chega aqui como falha de rede.
    return { ok: false, message: "O serviço de envio (gaxeta-invite) não respondeu. Confira se a função está implantada e a conexão." };
  }
}

// ----- Ações por usuário -----
$id("userRows").onclick = async (event) => {
  const button = event.target.closest("[data-user-act]");
  if (!button) return;
  const row = button.closest("tr");
  const item = usersView.items.find((entry) => entry.id === row.dataset.user && entry.kind === row.dataset.kind);
  if (!item) return;
  button.closest("details").open = false;
  const act = button.dataset.userAct;
  const who = `<b>${esc(item.display_name || item.email)}</b> (${esc(item.email)})`;
  await withBusy(button, async () => {
    if (act === "access") return openUserWizard({ userId: item.id });
    if (act === "resend") {
      await callRpc("gaxeta_admin_resend_invite", { p_invite_id: item.id });
      const sent = await sendInvite(item.id, item.email);
      showMessage(sent.ok ? `Convite reenviado para ${item.email}.` : `Convite mantido como pendente. ${sent.message}`, sent.ok ? "success" : "error");
    } else if (act === "revoke") {
      if (!(await askConfirm({ title: "Revogar convite", html: `<p>Revogar o convite de ${who}? O link recebido deixa de dar acesso.</p>`, okLabel: "Revogar" }))) return;
      await callRpc("gaxeta_admin_revoke_invite", { p_invite_id: item.id });
      showMessage("Convite revogado.", "success");
    } else if (act === "disable" || act === "enable") {
      const disabling = act === "disable";
      if (!(await askConfirm({ title: disabling ? "Desativar usuário" : "Reativar usuário", html: `<p>${disabling ? "Desativar" : "Reativar"} ${who}?${disabling ? " O acesso é cortado no servidor imediatamente, mesmo com sessão aberta." : ""}</p>`, okLabel: disabling ? "Desativar" : "Reativar", danger: disabling }))) return;
      await callRpc("gaxeta_admin_set_status", { p_user_id: item.id, p_status: disabling ? "disabled" : "active" });
      showMessage(disabling ? "Usuário desativado." : "Usuário reativado.", "success");
    } else if (act === "role") {
      const options = ["adm1", "adm2", "adm3"].map((role) => `<option value="${role}"${role === item.role ? " selected" : ""}>${ROLE_LABEL[role]}</option>`).join("");
      if (!(await askConfirm({ title: "Alterar nível", html: `<p>Nível global de ${who}:</p><label>Nível<select id="roleChoice">${options}</select></label><p class="form-help">Ao receber nível global, o usuário deixa o vínculo com a corporação e as concessões por ramo.</p>`, okLabel: "Aplicar", danger: false }))) return;
      await callRpc("gaxeta_admin_set_role", { p_user_id: item.id, p_global_role: $id("roleChoice").value });
      showMessage("Nível atualizado.", "success");
    } else if (act === "delete") {
      if (!(await askConfirm({ title: "Excluir cadastro", html: `<p>Excluir o cadastro de acesso de ${who}? As concessões são removidas e a ação fica na auditoria.</p>`, okLabel: "Excluir" }))) return;
      await callRpc("gaxeta_admin_delete_user", { p_user_id: item.id });
      showMessage("Cadastro de acesso excluído. A identidade de login permanece no Auth, sem acesso, até ser removida no painel do Supabase.", "success");
    }
    await loadUsers();
  });
};

// ----- Cadastro e edição de acesso em três etapas: dados → acesso → revisão -----
// O escopo é gravado como concessões por ramo: "all" (inclui o ramo e o que for criado
// nele), "none" (bloqueia) ou nenhuma regra (segue o nível acima). Vale a regra do
// ancestral mais próximo; sem regra nenhuma, o acesso é negado. A prévia e a lista
// normalizada vêm do servidor (gaxeta_admin_preview_access) e são a fonte de verdade
// da revisão e da gravação.
const wizard = {
  step: 1,
  userId: null,
  corp: "",
  mode: "", // "whole" | "select" | "none" | "" (ainda não escolhido)
  grants: new Map(),
  stash: null, // seleção por ramos guardada ao alternar para "Toda a corporação" ou "Sem acesso"
  names: new Map(),
  kids: new Map(),
  open: new Set(),
  totals: {},
  root: null, // item da corporação na prévia (estado e se tem empresas)
  run: 0,
  searchRun: 0,
  previewError: "",
  hint: "",
  flash: "",
};
const KIND_PLURAL = { company: "empresa(s)", area: "área(s)", subarea: "subárea(s)", equipment: "TAG(s)", point: "spot(s)" };
const SCOPE_LABEL = { whole: "Toda a corporação", select: "Ramos selecionados", none: "Sem acesso" };
// Qual das três escolhas corresponde a um conjunto de concessões.
function scopeOf(grants, corp) {
  const included = [...grants].filter(([, mode]) => mode === "all");
  if (!included.length) return "none";
  if (grants.size === 1 && grants.get(corp) === "all") return "whole";
  return "select";
}
async function openUserWizard({ userId = null } = {}) {
  Object.assign(wizard, { step: 1, userId, corp: "", mode: "", grants: new Map(), stash: null, names: new Map(), kids: new Map(), open: new Set(), totals: {}, root: null, previewError: "", hint: "", flash: "" });
  wizard.run++;
  const roots = await loadKids(null);
  const roles = [["corp", ROLE_LABEL.corp]];
  if (hasCap("manage_global_roles")) roles.push(["adm3", ROLE_LABEL.adm3], ["adm2", ROLE_LABEL.adm2], ["adm1", ROLE_LABEL.adm1]);
  fillSelect($id("newUserRole"), roles.map(([value, label]) => ({ value, label })), null, "corp");
  fillSelect($id("newUserCorp"), roots.ids.map((id) => ({ value: id, label: assetName(id) })), "Selecione a corporação", "");
  $id("userForm").reset();
  $id("newUserRole").value = "corp";
  $id("userFormMessage").textContent = "";
  if (userId) {
    const detail = await callRpc("gaxeta_admin_user_detail", { p_user_id: userId });
    $id("newUserName").value = detail.display_name;
    $id("newUserEmail").value = detail.email;
    $id("newUserCorp").value = detail.corporation_id || "";
    $id("newUserWrite").checked = !!detail.can_write;
    // Concessões já gravadas: entram como estão e só mudam por ação de quem edita.
    for (const grant of detail.grants) {
      wizard.grants.set(grant.asset_id, grant.mode);
      wizard.names.set(grant.asset_id, { name: grant.tag && grant.kind === "equipment" ? grant.tag : grant.name, kind: grant.kind, path: (grant.path || []).join(" / ") });
    }
    wizard.mode = scopeOf(wizard.grants, detail.corporation_id);
  }
  for (const id of ["newUserName", "newUserEmail", "newUserRole", "newUserCorp"]) $id(id).disabled = !!userId;
  $id("userDialogTitle").textContent = userId ? "Editar acesso" : "Novo usuário";
  syncWizard();
  $id("userDialog").showModal();
}
function wizardData() {
  const role = $id("newUserRole").value;
  return { name: $id("newUserName").value.trim(), email: $id("newUserEmail").value.trim().toLowerCase(), role, corp: role === "corp" ? $id("newUserCorp").value : "", canWrite: role === "corp" && $id("newUserWrite").checked };
}
function syncWizard() {
  const data = wizardData();
  $id("newUserCorpRow").hidden = $id("newUserWriteRow").hidden = data.role !== "corp";
  for (const step of [1, 2, 3]) $id("userStep" + step).hidden = wizard.step !== step;
  document.querySelectorAll("#userSteps li").forEach((item) => {
    const number = Number(item.dataset.step);
    item.className = number === wizard.step ? "current" : number < wizard.step ? "done" : "";
    item.hidden = number === 2 && data.role !== "corp";
  });
  $id("userBack").hidden = wizard.step === 1;
  $id("userNext").textContent = wizard.step < 3 ? "Avançar" : wizard.userId ? "Salvar acesso" : "Cadastrar e enviar convite";
}
$id("newUserRole").onchange = syncWizard;
const grantList = () => [...wizard.grants].map(([asset_id, mode]) => ({ asset_id, mode }));

// Lê do servidor o efeito das concessões em um nível. Devolve false se a resposta chegou
// atrasada (outra alteração ou outra corporação já está em curso) e deve ser ignorada.
async function loadGrantLevel(parentId, run) {
  const corp = wizard.corp;
  const result = await callRpc("gaxeta_admin_preview_access", { p_corporation_id: corp, p_grants: grantList(), p_parent_id: parentId || null });
  if (run !== wizard.run || corp !== wizard.corp) return false;
  wizard.kids.set(kidsKey(parentId), result.items);
  for (const item of result.items) wizard.names.set(item.id, { ...wizard.names.get(item.id), name: item.kind === "equipment" && item.tag ? item.tag : item.name, kind: item.kind });
  if (!parentId) {
    wizard.totals = result.totals || {};
    wizard.root = result.items[0] || null;
    wizard.grants = new Map(result.normalized_grants.map((grant) => [grant.asset_id, grant.mode]));
  }
  return true;
}
// Relê a prévia: primeiro a raiz (que normaliza as concessões), depois os ramos abertos.
async function refreshGrantTree() {
  const run = ++wizard.run;
  wizard.previewError = "";
  try {
    if (!(await loadGrantLevel(null, run))) return false;
    const levels = await Promise.all([wizard.corp, ...wizard.open].map((id) => loadGrantLevel(id, run)));
    if (levels.includes(false)) return false;
  } catch (error) {
    if (run !== wizard.run) return false;
    // Falha de consulta não é "sem acesso": a tela diz que a prévia não carregou.
    wizard.previewError = errorText(error);
  }
  renderGrantStep();
  return !wizard.previewError;
}
function grantChip(item, explicit) {
  if (explicit === "all") return ["Incluído", "included"];
  if (explicit === "none") return [item.state === "path" ? "Bloqueado · exceção abaixo" : "Bloqueado", "blocked"];
  if (item.state === "full") return ["Acesso herdado", "inherited"];
  if (item.state === "path") return ["Só caminho", "path"];
  return ["Sem acesso", "none"];
}
function grantBranch(parentId) {
  const items = wizard.kids.get(kidsKey(parentId)) || [];
  return (
    "<ul>" +
    items
      .map((item) => {
        const explicit = wizard.grants.get(item.id) || "";
        const open = wizard.open.has(item.id);
        const label = item.kind === "equipment" && item.tag ? item.tag : item.tag && item.tag !== item.name ? `${item.name} · ${item.tag}` : item.name;
        const [chip, chipClass] = grantChip(item, explicit);
        const option = (mode, text) => `<button type="button" data-grant="${item.id}" data-mode="${mode}" aria-pressed="${explicit === mode}">${text}</button>`;
        return (
          `<li><div class="grant-row${wizard.flash === item.id ? " flash" : ""}" data-grant-row="${item.id}">` +
          `<button type="button" class="tree-toggle" data-grant-toggle="${item.id}"${item.has_children ? "" : " disabled"} aria-label="${open ? "Recolher" : "Abrir"} ${esc(label)}">${item.has_children ? glyph(open ? "chevron-down" : "chevron-right") : ""}</button>` +
          `<span class="grant-name"><small>${KIND_LABEL[item.kind]}</small>${esc(label)}</span>` +
          `<span class="grant-state chip-${chipClass}">${chip}</span>` +
          `<details class="row-menu grant-menu"><summary aria-label="Regra de acesso para ${esc(label)}">Regra</summary><div class="menu-list">` +
          option("all", "Incluir ramo") +
          option("none", "Bloquear ramo") +
          option("", "Usar regra do nível acima") +
          `</div></details></div>` +
          (open ? grantBranch(item.id) : "") +
          "</li>"
        );
      })
      .join("") +
    "</ul>"
  );
}
// Resumo fiel ao servidor: nunca diz "sem acesso" quando há concessão válida na raiz,
// nem transforma uma falha de consulta em acesso negado.
function grantSummary() {
  if (wizard.previewError) return `Não foi possível carregar a prévia do acesso (${wizard.previewError}). Nada foi alterado; tente de novo.`;
  if (!wizard.root) return "";
  const parts = Object.entries(KIND_PLURAL).filter(([kind]) => wizard.totals[kind] > 0).map(([kind, label]) => `${wizard.totals[kind]} ${label}`);
  const blocked = [...wizard.grants].filter(([, mode]) => mode === "none").length;
  if (wizard.root.state === "full") {
    if (!wizard.root.has_children) return "Acesso concedido à corporação. Ainda não há empresas cadastradas. Novos ramos serão incluídos.";
    return (
      `Acesso concedido à corporação${blocked ? `, com ${blocked} ramo(s) bloqueado(s)` : ""}. ` +
      `Acesso efetivo hoje: ${parts.join(", ") || "nenhum ramo liberado"}. Novos ramos${blocked ? " fora dos bloqueios" : ""} serão incluídos.`
    );
  }
  if (parts.length) return `Acesso efetivo hoje: ${parts.join(", ")}. Cada ramo incluído recebe também o que for criado dentro dele.`;
  return "Sem acesso: nenhum ramo incluído. A conta entra, mas não vê nenhum ativo.";
}
function renderGrantStep() {
  const data = wizardData();
  $id("scopeLead").textContent = `Acesso de ${data.name || data.email} em ${assetName(wizard.corp)}.`;
  document.querySelectorAll('[name="scopeMode"]').forEach((radio) => (radio.checked = radio.value === wizard.mode));
  $id("scopeSelect").hidden = wizard.mode !== "select";
  $id("scopeFuture").checked = wizard.grants.get(wizard.corp) === "all";
  const companies = wizard.kids.get(wizard.corp);
  // Três situações diferentes, três textos diferentes: falha, corporação vazia, lista.
  $id("grantTree").innerHTML = wizard.previewError
    ? `<p class="tree-empty is-error">Não foi possível carregar os ramos: ${esc(wizard.previewError)} <button type="button" class="text-button" data-grant-retry>Tentar de novo</button></p>`
    : !companies
      ? '<p class="tree-empty">Carregando…</p>'
      : !companies.length
        ? '<p class="tree-empty">Esta corporação ainda não tem empresas cadastradas. Com “Toda a corporação”, as que forem criadas entram automaticamente.</p>'
        : grantBranch(wizard.corp);
  const summary = wizard.mode ? grantSummary() : "Escolha o alcance do acesso.";
  $id("grantTotals").textContent = (wizard.hint ? wizard.hint + " " : "") + summary;
  $id("grantTotals").classList.toggle("is-error", !!wizard.previewError);
  if (wizard.flash) {
    $id("grantTree").querySelector(".flash")?.scrollIntoView({ block: "nearest" });
    wizard.flash = "";
  }
}
// As três escolhas do nível superior.
document.querySelectorAll('[name="scopeMode"]').forEach((radio) => {
  radio.onchange = () => {
    if (!radio.checked) return;
    // A seleção por ramos em andamento fica guardada: voltar a "Selecionar ramos" a restaura.
    if (wizard.mode === "select") wizard.stash = new Map(wizard.grants);
    wizard.mode = radio.value;
    wizard.hint = "";
    if (radio.value === "whole") wizard.grants = new Map([[wizard.corp, "all"]]);
    else if (radio.value === "none") wizard.grants = new Map();
    else if (wizard.stash) wizard.grants = new Map(wizard.stash);
    refreshGrantTree().catch((error) => ($id("userFormMessage").textContent = errorText(error)));
  };
});
$id("scopeFuture").onchange = () => {
  $id("scopeFuture").checked ? wizard.grants.set(wizard.corp, "all") : wizard.grants.delete(wizard.corp);
  wizard.hint = "";
  refreshGrantTree().catch((error) => ($id("userFormMessage").textContent = errorText(error)));
};
$id("grantTree").onclick = async (event) => {
  const toggle = event.target.closest("[data-grant-toggle]");
  const grant = event.target.closest("[data-grant]");
  try {
    if (event.target.closest("[data-grant-retry]")) return void (await refreshGrantTree());
    if (toggle) {
      const id = toggle.dataset.grantToggle;
      if (wizard.open.has(id)) wizard.open.delete(id);
      else {
        wizard.open.add(id);
        if (!(await loadGrantLevel(id, wizard.run))) return;
      }
      renderGrantStep();
    } else if (grant) {
      const id = grant.dataset.grant;
      const mode = grant.dataset.mode;
      mode ? wizard.grants.set(id, mode) : wizard.grants.delete(id);
      wizard.hint = "";
      if (!(await refreshGrantTree())) return;
      // O servidor descarta regras sem efeito; a tela explica em vez de mostrar um estado que não foi gravado.
      const name = wizard.names.get(id)?.name || "Este ramo";
      if (mode === "none" && !wizard.grants.has(id)) wizard.hint = `“${name}” já está sem acesso: sem regra acima, só entram os ramos incluídos.`;
      if (mode === "all" && !wizard.grants.has(id)) wizard.hint = `“${name}” já está incluído pela regra do nível acima.`;
      if (wizard.hint) renderGrantStep();
    }
  } catch (error) {
    $id("userFormMessage").textContent = errorText(error);
  }
};
// O menu "Regra" abre sobre a lista, sem ser cortado pela área de rolagem.
$id("grantTree").addEventListener(
  "toggle",
  (event) => {
    const menu = event.target;
    if (!menu.matches?.("details.grant-menu") || !menu.open) return;
    $id("grantTree").querySelectorAll("details.grant-menu[open]").forEach((other) => other !== menu && (other.open = false));
    const anchor = menu.querySelector("summary").getBoundingClientRect();
    const list = menu.querySelector(".menu-list");
    list.style.position = "fixed";
    list.style.right = "auto";
    list.style.left = Math.max(8, Math.min(anchor.right - 220, window.innerWidth - 228)) + "px";
    list.style.top = (anchor.bottom + 110 > window.innerHeight ? anchor.top - 112 : anchor.bottom + 4) + "px";
  },
  true,
);
$id("grantTree").addEventListener("scroll", () => $id("grantTree").querySelectorAll("details.grant-menu[open]").forEach((menu) => (menu.open = false)));

// Busca de ramos dentro da corporação escolhida (empresa, área, subárea ou TAG).
$id("grantSearch").oninput = debounce(async () => {
  const query = $id("grantSearch").value.trim();
  const box = $id("grantResults");
  const run = ++wizard.searchRun;
  const corp = wizard.corp;
  if (query.length < 2) return void (box.hidden = true);
  try {
    const rows = (await callRpc("gaxeta_assets_search", { p_query: query, p_limit: 100 })).filter((row) => row.corporation_id === corp && row.kind !== "corporation");
    if (run !== wizard.searchRun || corp !== wizard.corp) return;
    box.hidden = false;
    box.innerHTML = rows.length
      ? rows
          .slice(0, 30)
          .map((row) => `<button type="button" data-grant-result="${row.id}"><small>${KIND_LABEL[row.kind]}</small><strong>${esc(assetLabel(row))}</strong><span>${esc((row.path_names || []).slice(1, -1).join(" / "))}</span></button>`)
          .join("")
      : `<p class="tree-empty">Nenhum ramo desta corporação corresponde a “${esc(query)}”.</p>`;
  } catch (error) {
    if (run !== wizard.searchRun) return;
    box.hidden = false;
    box.innerHTML = `<p class="tree-empty is-error">Não foi possível buscar agora: ${esc(errorText(error))}</p>`;
  }
}, 300);
$id("grantResults").onclick = async (event) => {
  const button = event.target.closest("[data-grant-result]");
  if (!button) return;
  try {
    const id = button.dataset.grantResult;
    await ensureAssets([id]);
    // Abre os níveis acima do resultado (da empresa até o pai) e destaca a linha.
    for (const ancestor of (assetIndex.get(id)?.path || []).slice(1, -1)) wizard.open.add(ancestor);
    wizard.flash = id;
    $id("grantResults").hidden = true;
    $id("grantSearch").value = "";
    await refreshGrantTree();
  } catch (error) {
    $id("userFormMessage").textContent = errorText(error);
  }
};

function renderUserReview() {
  const data = wizardData();
  const describe = ([id]) => {
    const known = wizard.names.get(id) || {};
    const path = assetPathLabel(id) || [known.path, known.name].filter(Boolean).join(" / ") || id;
    return `<li><small>${KIND_LABEL[known.kind || assetIndex.get(id)?.kind] || ""}</small> ${esc(path)}</li>`;
  };
  const included = [...wizard.grants].filter(([, mode]) => mode === "all");
  const blocked = [...wizard.grants].filter(([, mode]) => mode === "none");
  const scope = scopeOf(wizard.grants, wizard.corp);
  $id("userReview").innerHTML =
    `<dl class="detail-fields"><dt>Nome</dt><dd>${esc(data.name)}</dd><dt>Destinatário</dt><dd>${esc(data.email)}</dd><dt>Nível</dt><dd>${ROLE_LABEL[data.role]}</dd>` +
    (data.role === "corp"
      ? `<dt>Corporação</dt><dd>${esc(assetName(data.corp))}</dd><dt>Edição operacional</dt><dd>${data.canWrite ? "Sim: cria áreas, subáreas, TAGs e spots e vincula sensores nos ramos concedidos" : "Não: somente consulta"}</dd>` +
        `<dt>Alcance</dt><dd>${SCOPE_LABEL[scope]}</dd></dl>` +
        (scope === "select" || blocked.length
          ? `<div class="review-lists">` +
            (included.length ? `<div><h3>Ramos incluídos</h3><ul>${included.map(describe).join("")}</ul></div>` : "") +
            (blocked.length ? `<div><h3>Exceções bloqueadas</h3><ul>${blocked.map(describe).join("")}</ul></div>` : "") +
            `</div>`
          : "") +
        `<p class="grant-totals${wizard.previewError ? " is-error" : ""}">${esc(grantSummary())}</p>`
      : `<dt>Alcance</dt><dd>${data.role === "adm3" ? "Consulta e análise em todas as corporações, sem escrita" : "Global, conforme o nível"}</dd></dl>`) +
    (wizard.userId ? "" : `<p class="form-help">O cadastro é gravado antes do envio. Se o e-mail falhar, o convite fica pendente e pode ser reenviado. Se o e-mail já tiver uma conta verificada, ela é vinculada sem novo convite e sem troca de senha.</p>`);
}
$id("userBack").onclick = () => {
  wizard.step = wizard.step === 3 && wizardData().role !== "corp" ? 1 : wizard.step - 1;
  $id("userFormMessage").textContent = "";
  syncWizard();
  if (wizard.step === 2) renderGrantStep();
};
$id("userForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("userFormMessage");
  const data = wizardData();
  message.textContent = "";
  const button = $id("userNext");
  button.disabled = true;
  try {
    if (wizard.step === 1) {
      if (data.name.length < 1) return void (message.textContent = "Informe o nome.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return void (message.textContent = "Informe um e-mail válido.");
      if (data.role === "corp" && !data.corp) return void (message.textContent = "Selecione a corporação.");
      if (data.role === "corp") {
        // Outra corporação num cadastro novo: a seleção anterior não se aplica. Mesma corporação: tudo é mantido.
        if (wizard.corp !== data.corp) {
          if (!wizard.userId && wizard.corp) Object.assign(wizard, { grants: new Map(), stash: null, mode: "" });
          Object.assign(wizard, { corp: data.corp, kids: new Map(), open: new Set(), root: null, totals: {} });
        }
        wizard.hint = "";
        $id("grantSearch").value = "";
        $id("grantResults").hidden = true;
        wizard.step = 2;
        syncWizard();
        renderGrantStep();
        await refreshGrantTree();
      } else {
        renderUserReview();
        wizard.step = 3;
      }
    } else if (wizard.step === 2) {
      if (!wizard.mode) return void (message.textContent = "Escolha o alcance: Toda a corporação, Selecionar ramos ou Sem acesso.");
      // A revisão usa a resposta do servidor. Se a prévia falhar, o fluxo não avança nem assume "sem acesso".
      if (!(await refreshGrantTree())) return void (message.textContent = wizard.previewError ? "Não foi possível conferir o acesso no servidor. Tente de novo." : "");
      await ensureAssets([...wizard.grants.keys()]);
      renderUserReview();
      wizard.step = 3;
    } else if (wizard.userId) {
      await callRpc("gaxeta_admin_set_access", { p_user_id: wizard.userId, p_can_write: data.canWrite, p_grants: grantList() });
      $id("userDialog").close();
      showMessage(`Acesso de ${data.email} atualizado. Vale no servidor a partir de agora.`, "success");
      await loadUsers();
    } else {
      const result = await callRpc("gaxeta_admin_invite_user", {
        p_email: data.email,
        p_display_name: data.name,
        p_global_role: data.role === "corp" ? null : data.role,
        p_corporation_id: data.role === "corp" ? data.corp : null,
        p_can_write: data.canWrite,
        p_grants: data.role === "corp" ? grantList() : [],
      });
      $id("userDialog").close();
      if (result.kind === "linked") showMessage(`${data.email} já tinha conta verificada: acesso vinculado e ativo, sem novo convite.`, "success");
      else {
        const sent = await sendInvite(result.invite_id, data.email);
        showMessage(sent.ok ? `Cadastro gravado e convite enviado para ${data.email}.` : `Cadastro gravado; o convite ficou pendente. ${sent.message} Use Ações → Reenviar convite.`, sent.ok ? "success" : "error");
      }
      await loadUsers();
    }
    syncWizard();
  } catch (error) {
    message.textContent = errorText(error);
  } finally {
    button.disabled = false;
  }
};

// ----- Auditoria -----
async function loadAudit() {
  const rows = await callRpc("gaxeta_admin_audit", { p_limit: 50, p_offset: 0, p_action_prefix: null, p_target_id: null, p_corporation_id: null });
  $id("auditRows").innerHTML =
    rows
      .map((row) => `<tr><td>${fmtDateTime(row.at)}</td><td>${esc(row.actor_email || "sistema")}</td><td>${esc(row.action)}</td><td>${esc(row.target_type)} ${esc(String(row.target_id || "").slice(0, 18))}</td><td><code>${esc(JSON.stringify(row.details || {}).slice(0, 160))}</code></td></tr>`)
      .join("") || '<tr><td colspan="5">Nenhum registro.</td></tr>';
}
$id("auditPanel").addEventListener("toggle", () => {
  if ($id("auditPanel").open) loadAudit().catch((error) => showMessage(errorText(error), "error"));
});

// ---- 85-auth.js ----
// =============================================================================
// Entrada, convite e recuperação.
//  * Nada entra sozinho: sem sessão, só o envio do formulário (Entrar/Enter);
//    com sessão guardada, "Continuar" ou "Trocar conta".
//  * Convite e recuperação chegam por acesso.html. O painel só abre depois de a
//    senha ser definida e, no convite, de o servidor ativar o vínculo pré-cadastrado.
//  * Tokens do link nunca são gravados, exibidos ou propagados; a URL é limpa.
// =============================================================================
function readEntryIntent() {
  const hash = new URLSearchParams(ENTRY_URL.hash.replace(/^#/, ""));
  const query = new URLSearchParams(ENTRY_URL.search);
  const pick = (key) => hash.get(key) || query.get(key);
  return {
    type: pick("type"),
    tokenHash: query.get("token_hash"),
    hasTokens: !!hash.get("access_token"),
    error: pick("error_code") || pick("error"),
  };
}
const auth = { entered: false, intent: readEntryIntent(), flow: null, pendingLogin: false, verifiedSession: null };
const isCallback = () => !!(auth.intent.type || auth.intent.tokenHash || auth.intent.error);
function cleanUrl() {
  history.replaceState(null, "", location.pathname.replace(new RegExp(CONFIG.callbackPage.replace(".", "\\.") + "$"), ""));
  auth.intent = { type: null, tokenHash: null, hasTokens: false, error: null };
}
function showAuthView(viewId, message = "", kind = "") {
  $id("application").hidden = true;
  $id("auth").hidden = false;
  document.querySelectorAll(".auth-view").forEach((view) => (view.hidden = view.id !== viewId));
  $id("authMessage").textContent = message;
  $id("authMessage").className = "auth-message " + kind;
}
function authErrorText(error) {
  const message = error?.message || "";
  if (/Invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/Email not confirmed/i.test(message)) return "Este e-mail ainda não foi confirmado. Use o link do convite ou peça um novo.";
  if (/different from the old/i.test(message)) return "A nova senha precisa ser diferente da anterior.";
  if (/weak|at least|characters/i.test(message)) return "Senha recusada pela política de segurança: use pelo menos 10 caracteres, com letras e números.";
  if (/expired|invalid|not found/i.test(message)) return "Link vencido ou já utilizado. Solicite um novo.";
  if (/rate limit|too many/i.test(message)) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  return errorText(error);
}
function passwordProblem(password, confirmation) {
  if (password.length < 10) return "A senha precisa de pelo menos 10 caracteres.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "A senha precisa ter letras e números.";
  if (password !== confirmation) return "As senhas não coincidem.";
  return "";
}
function showPasswordView(session, flow) {
  auth.flow = flow;
  auth.verifiedSession = session;
  $id("passwordForm").reset();
  $id("passwordTitle").textContent = flow === "invite" ? "Criar sua senha" : "Definir nova senha";
  $id("passwordEmail").textContent = session.user.email; // e-mail verificado pelo Supabase, sem edição
  $id("passwordSubmit").textContent = flow === "invite" ? "Salvar senha e entrar" : "Salvar nova senha";
  showAuthView("passwordForm");
  $id("setPassword").focus();
}
function showExpiredLink() {
  const wasInvite = auth.intent.type === "invite";
  cleanUrl();
  // Mantém o aviso na tela: eventos seguintes do SDK não o trocam por "Continuar".
  auth.flow = "notice";
  if (wasInvite) showAuthView("loginForm", "Convite vencido ou já utilizado. Peça ao responsável um novo envio.", "error");
  else showAuthView("forgotForm", "Link vencido ou já utilizado. Informe o e-mail para receber um novo.", "error");
}

// ----- Entrada no painel (sempre depois de uma ação explícita) -----
async function enterApp(session) {
  showAuthView("authLoading", "Carregando seu acesso…");
  const run = ++state.authRequest;
  try {
    let context = await callRpc("gaxeta_my_context");
    if (!context.role && context.has_pending_invite) {
      try {
        await callRpc("gaxeta_activate_invite");
        context = await callRpc("gaxeta_my_context");
      } catch (error) {
        if (/senha/i.test(error?.message || "")) return showPasswordView(session, "invite");
        throw error;
      }
    }
    if (run !== state.authRequest) return;
    if (!context.role) {
      $id("continueEmail").textContent = session.user.email;
      return showAuthView("authContinue", "Esta conta ainda não tem acesso autorizado. Fale com o responsável pela operação ou troque de conta.", "error");
    }
    Object.assign(state, { ctx: context, userId: session.user.id, authorized: true, lastContextCheck: Date.now() });
    auth.entered = true;
    auth.flow = null;
    $id("auth").hidden = true;
    $id("application").hidden = false;
    $id("userEmail").textContent = session.user.email;
    $id("userBadge").textContent = (context.display_name || session.user.email || "?").trim().slice(0, 2).toUpperCase();
    $id("password").value = "";
    applyPermissions();
    loadEquipCatalog().catch(() => {}); // rótulos dos tipos de equipamento; sem a leitura vale o catálogo inicial
    setConnection(true);
    showMessage("");
    if (session.user.user_metadata?.must_change_password) openAccountDialog(true);
    showPage(PAGE_TITLES[location.hash.slice(1)] ? location.hash.slice(1) : "sensors");
    clearTimeout(state.timer);
    state.timer = setTimeout(refreshData, CONFIG.pollMs);
  } catch (error) {
    showAuthView("loginForm", authErrorText(error), "error");
  }
}
async function leaveApp(message = "") {
  await bleDisconnect().catch(() => {});
  clearSessionData();
  auth.entered = false;
  auth.flow = null;
  await sb.auth.signOut({ scope: "local" }).catch(() => {});
  showAuthView("loginForm", message, message ? "error" : "");
}

$id("loginForm").onsubmit = async (event) => {
  event.preventDefault();
  const email = $id("email").value.trim();
  const password = $id("password").value;
  if (!email || !password) return showAuthView("loginForm", "Informe e-mail e senha.", "error");
  const button = event.submitter || $id("loginForm").querySelector("button.primary");
  button.disabled = true;
  auth.pendingLogin = true;
  $id("authMessage").textContent = "Entrando…";
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return showAuthView("loginForm", authErrorText(error), "error");
    await enterApp(data.session);
  } catch (error) {
    showAuthView("loginForm", authErrorText(error), "error");
  } finally {
    auth.pendingLogin = false;
    button.disabled = false;
  }
};
$id("continueSession").onclick = (event) =>
  withBusy(event.currentTarget, async () => {
    const { data } = await sb.auth.getSession();
    if (!data.session) return showAuthView("loginForm", "A sessão guardada expirou. Entre novamente.");
    await enterApp(data.session);
  });
$id("switchAccount").onclick = async () => {
  await sb.auth.signOut({ scope: "local" }).catch(() => {});
  $id("loginForm").reset();
  showAuthView("loginForm");
};
$id("showForgot").onclick = () => {
  $id("forgotEmail").value = $id("email").value.trim();
  showAuthView("forgotForm");
};
$id("backToLogin").onclick = () => showAuthView("loginForm");
$id("forgotForm").onsubmit = async (event) => {
  event.preventDefault();
  const email = $id("forgotEmail").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return showAuthView("forgotForm", "Informe um e-mail válido.", "error");
  event.submitter.disabled = true;
  try {
    // Resposta neutra: a tela não revela se o e-mail tem cadastro.
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: CONFIG.publicBaseUrl + CONFIG.callbackPage });
    if (error && /fetch|network/i.test(error.message)) throw error;
    showAuthView("loginForm", "Se houver uma conta para este e-mail, um link para definir a senha chegará em instantes. Confira também a caixa de spam.", "ok");
  } catch (error) {
    showAuthView("forgotForm", authErrorText(error), "error");
  } finally {
    event.submitter.disabled = false;
  }
};
// Link com token_hash: a validação só acontece neste clique, para que verificadores
// automáticos de e-mail não consumam o link.
$id("verifyLink").onclick = (event) =>
  withBusy(event.currentTarget, async () => {
    const { tokenHash, type } = auth.intent;
    const { data, error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: type || "recovery" });
    if (error || !data.session) return showExpiredLink();
    cleanUrl();
    showPasswordView(data.session, type === "recovery" ? "recovery" : "invite");
  });
$id("passwordForm").onsubmit = async (event) => {
  event.preventDefault();
  const password = $id("setPassword").value;
  const problem = passwordProblem(password, $id("setPasswordConfirm").value);
  if (problem) return void (($id("authMessage").textContent = problem), ($id("authMessage").className = "auth-message error"));
  const button = $id("passwordSubmit");
  button.disabled = true;
  $id("authMessage").textContent = "Salvando…";
  try {
    const { data, error } = await sb.auth.updateUser({ password, data: { must_change_password: false } });
    if (error) throw error;
    cleanUrl();
    const session = (await sb.auth.getSession()).data.session || auth.verifiedSession;
    const flow = auth.flow;
    if (flow === "invite") return await enterApp({ ...session, user: data.user || session.user });
    // Recuperação: ativa um convite ainda pendente desta identidade, encerra a sessão e volta ao login.
    const context = await callRpc("gaxeta_my_context").catch(() => null);
    if (context && !context.role && context.has_pending_invite) await callRpc("gaxeta_activate_invite").catch(() => {});
    await sb.auth.signOut({ scope: "local" }).catch(() => {});
    auth.flow = null;
    $id("loginForm").reset();
    showAuthView("loginForm", "Senha atualizada. Entre com a nova senha.", "ok");
  } catch (error) {
    $id("authMessage").textContent = authErrorText(error);
    $id("authMessage").className = "auth-message error";
  } finally {
    button.disabled = false;
  }
};

// ----- Eventos do SDK: decidem só qual tela de entrada mostrar; nunca abrem o painel -----
function onAuthEvent(event, session) {
  if (event === "SIGNED_OUT") {
    if (auth.entered) leaveApp("Sua sessão foi encerrada.");
    return;
  }
  if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "MFA_CHALLENGE_VERIFIED") return;
  if (auth.entered || auth.pendingLogin || auth.flow) return;
  if (event === "PASSWORD_RECOVERY" && session) return showPasswordView(session, "recovery");
  if (auth.intent.error) return showExpiredLink();
  if (auth.intent.tokenHash) {
    $id("verifyTitle").textContent = auth.intent.type === "recovery" ? "Recuperar senha" : "Aceitar convite";
    return showAuthView("authVerify");
  }
  if (session && auth.intent.hasTokens && auth.intent.type) return showPasswordView(session, auth.intent.type === "recovery" ? "recovery" : "invite");
  if (isCallback() && !session) return showExpiredLink();
  if (session) {
    $id("continueEmail").textContent = session.user.email;
    return showAuthView("authContinue");
  }
  showAuthView("loginForm");
}

// ----- Minha senha (dentro do painel) -----
let mustChangePassword = false;
function openAccountDialog(forced = false) {
  mustChangePassword = forced;
  $id("closeAccount").hidden = forced;
  $id("accountMessage").textContent = "";
  $id("accountForm").reset();
  $id("userMenu").open = false;
  $id("accountDialog").showModal();
}
$id("account").onclick = () => openAccountDialog(false);
$id("closeAccount").onclick = () => mustChangePassword || $id("accountDialog").close();
$id("accountDialog").addEventListener("cancel", (event) => mustChangePassword && event.preventDefault());
$id("accountForm").onsubmit = async (event) => {
  event.preventDefault();
  const password = $id("newPassword").value;
  const problem = passwordProblem(password, $id("confirmPassword").value);
  if (problem) return void ($id("accountMessage").textContent = problem);
  event.submitter.disabled = true;
  try {
    const { error } = await sb.auth.updateUser({ password, data: { must_change_password: false } });
    if (error) throw error;
    mustChangePassword = false;
    $id("accountDialog").close();
    showMessage("Sua senha foi atualizada.", "success");
  } catch (error) {
    $id("accountMessage").textContent = authErrorText(error);
  } finally {
    event.submitter.disabled = false;
  }
};
$id("logout").onclick = async () => {
  auth.entered = false;
  await bleDisconnect().catch(() => {});
  clearSessionData();
  await sb.auth.signOut().catch(() => {});
  $id("loginForm").reset();
  showAuthView("loginForm");
};

// ---- 88-manual.js ----
// =============================================================================
// Manual dentro da aplicação. O conteúdo e o índice são os de operacao.html (uma
// só fonte), lidos sob demanda. Como a navegação não sai da página, a sessão
// autorizada, a tela de origem e o sensor selecionado continuam em memória, e o
// Voltar devolve exatamente ao ponto de partida. operacao.html continua valendo
// como endereço direto; aberto fora da plataforma, segue o fluxo normal de entrada.
// =============================================================================
const manual = { loaded: false, observer: null };
function markManualSection(id) {
  $id("manualNav")
    .querySelectorAll("a[data-section]")
    .forEach((link) => (link.dataset.section === id ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current")));
}
function goManualSection(id) {
  const target = $id("manualBody").querySelector("#" + CSS.escape(id));
  if (!target) return;
  target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  markManualSection(id);
  if (isNarrow()) $id("manualNav").querySelector("details")?.removeAttribute("open");
}
async function openManual() {
  if (!manual.loaded) {
    $id("manualNav").replaceChildren();
    $id("manualBody").innerHTML = '<p class="form-help">Carregando o manual…</p>';
    try {
      const response = await fetch("./operacao.html", { cache: "no-cache" });
      if (!response.ok) throw Error("HTTP " + response.status);
      const page = new DOMParser().parseFromString(await response.text(), "text/html");
      const content = page.querySelector("[data-manual-content]");
      const index = page.querySelector("[data-manual-nav]");
      if (!content || !index) throw Error("formato inesperado");
      for (const node of [content, index]) node.querySelectorAll("script, style, link").forEach((element) => element.remove());
      $id("manualBody").replaceChildren(...[...content.children].map((node) => document.importNode(node, true)));
      $id("manualNav").replaceChildren(...[...index.children].map((node) => document.importNode(node, true)));
      manual.loaded = true;
    } catch (error) {
      $id("manualBody").innerHTML =
        '<section><h2>Manual indisponível agora</h2><p>Não foi possível carregar o conteúdo. <a href="./operacao.html" target="_blank" rel="noopener">Abrir o manual em outra aba</a>.</p></section>';
      return;
    }
    // Indicação da seção atual conforme a rolagem.
    manual.observer?.disconnect();
    manual.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
        if (visible) markManualSection(visible.target.id);
      },
      { rootMargin: "-70px 0px -65% 0px" },
    );
    $id("manualBody")
      .querySelectorAll("section[id]")
      .forEach((section) => manual.observer.observe(section));
  }
  const index = $id("manualNav").querySelector("details");
  if (index) index.open = !isNarrow();
  window.scrollTo(0, 0);
}
// Dentro da aplicação o endereço (#manual) é a rota: os links do índice rolam até a seção sem trocá-lo.
$id("manualPage").addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  event.preventDefault();
  goManualSection(link.getAttribute("href").slice(1));
});

// ---- 90-ble-ui.js ----
// =============================================================================
// Buscar sensor por Bluetooth (só no aplicativo nativo, com o plugin embarcado).
//   * Só abre e só procura por toque: abrir o aplicativo ou trocar de tela nunca inicia busca
//     nem envia comando à placa. Na web, a entrada e o diálogo são removidos (95-boot.js).
//   * Estados com texto próprio: Bluetooth desligado, permissão negada, procurando, nenhum
//     sensor encontrado, conectando, conectado e desconectado. Dá para cancelar e repetir.
//   * A busca para ao fechar o diálogo, ao trocar de tela e quando o aplicativo vai para o
//     fundo; a conexão é liberada se ele ficar no fundo por mais de 30 s.
//   * Origem dos dados à vista: a leitura LOCAL (ângulo e saúde do AS5600, pelo Bluetooth) ao
//     lado da última leitura da NUVEM (o que a placa enviou por Wi-Fi), cada uma com o horário.
//     O celular não reenvia nada à nuvem: a ingestão continua sendo só a da placa.
//   * O vínculo ao spot continua passando pelo fluxo autorizado da plataforma.
// =============================================================================
const bleUi = { phase: "idle", devices: new Map(), detail: "", cloudFor: "", cloudAt: 0, cloudError: "", cloudKnown: null, hiddenTimer: null, run: 0 };
const BLE_PHASE = {
  idle: ["", "Pronto para buscar. Aproxime o celular da placa."],
  checking: ["is-busy", "Conferindo o Bluetooth do aparelho…"],
  off: ["is-warn", "Bluetooth desligado. Ligue o Bluetooth do celular e toque em Buscar de novo."],
  denied: ["is-error", "Permissão negada. Sem a permissão de dispositivos próximos o aplicativo não encontra a placa."],
  location: ["is-warn", "Localização desligada. Nesta versão do Android a busca Bluetooth só funciona com a localização ligada."],
  unavailable: ["is-error", "Bluetooth indisponível neste aparelho."],
  scanning: ["is-busy", "Procurando sensores próximos…"],
  none: ["is-warn", "Nenhum sensor encontrado. Confira se a placa está ligada e perto do celular (até uns 5 m) e busque de novo."],
  found: ["", "Busca concluída. Toque no sensor para conectar, ou busque de novo."],
  connecting: ["is-busy", "Conectando ao sensor…"],
  connected: ["is-ok", "Conectado. Leitura local a cada 5 segundos."],
  disconnected: ["is-warn", "Desconectado. A última leitura local continua na tela."],
  error: ["is-error", ""],
};
function setBlePhase(phase, detail = "") {
  Object.assign(bleUi, { phase, detail });
  renderBle();
}
function renderBle() {
  if (!$id("bleStatus")) return;
  const [kind, text] = BLE_PHASE[bleUi.phase] || BLE_PHASE.idle;
  const status = $id("bleStatus");
  status.className = "ble-state " + kind;
  status.textContent = bleUi.detail || text;
  const connected = !!bleCurrent();
  const scanning = bleUi.phase === "scanning" || bleUi.phase === "checking";
  $id("scanBle").hidden = scanning || bleUi.phase === "connecting";
  $id("scanBleLabel").textContent = ["idle", "checking", "scanning"].includes(bleUi.phase) ? "Buscar sensores" : "Buscar de novo";
  $id("cancelBle").hidden = bleUi.phase !== "scanning";
  $id("disconnectBle").hidden = !connected;
  $id("identifyBle").disabled = !connected;
  // Atalhos para resolver o que impede a busca, sem sair procurando nos ajustes.
  $id("bleHelp").innerHTML =
    bleUi.phase === "off"
      ? `<button class="secondary compact" type="button" data-ble-help="bluetooth">Abrir ajustes de Bluetooth</button>`
      : bleUi.phase === "denied"
        ? `<button class="secondary compact" type="button" data-ble-help="app">Abrir permissões do aplicativo</button>`
        : bleUi.phase === "location"
          ? `<button class="secondary compact" type="button" data-ble-help="location">Abrir ajustes de localização</button>`
          : "";
  $id("bleDevices").innerHTML = [...bleUi.devices.values()]
    .map(
      (item) =>
        `<button class="ble-device" data-ble="${esc(item.deviceId)}"${bleUi.phase === "connecting" ? " disabled" : ""}><span><strong>${esc(item.name || item.localName || "Sensor Gaxeta")}</strong>` +
        `<small>${esc(item.deviceId)}${item.rssi == null ? "" : ` · sinal ${item.rssi} dBm`}</small></span>${bleCurrent()?.deviceId === item.deviceId ? "Conectado" : "Conectar →"}</button>`,
    )
    .join("");
}
function openBleDialog({ scan = false } = {}) {
  if (!bleAvailable() || !$id("bleDialog")) return;
  if (!$id("bleDialog").open) $id("bleDialog").showModal();
  renderBle();
  if (scan) startBleScan();
}
function closeBleDialog() {
  const dialog = $id("bleDialog");
  if (dialog?.open) dialog.close();
}
// Busca: confere permissão e Bluetooth, procura por 8 s e mostra o que achou (ou que não achou).
async function startBleScan() {
  if (bleUi.phase === "scanning" || bleUi.phase === "checking" || bleUi.phase === "connecting") return;
  const run = ++bleUi.run;
  bleUi.devices.clear();
  setBlePhase("checking");
  const ready = await blePrepare();
  if (run !== bleUi.run) return;
  if (!ready.ok) return setBlePhase(ready.kind, ready.kind === "unavailable" && ready.message ? "Bluetooth indisponível: " + ready.message : "");
  try {
    setBlePhase("scanning");
    await bleScan(
      (found) => {
        if (run !== bleUi.run) return;
        bleUi.devices.set(found.deviceId, found);
        renderBle();
      },
      () => {},
      () => {
        if (run === bleUi.run && bleUi.phase === "scanning") setBlePhase(bleUi.devices.size ? "found" : "none");
      },
    );
  } catch (error) {
    if (run !== bleUi.run) return;
    const text = String(error?.message || error || "");
    setBlePhase(/denied|permission/i.test(text) ? "denied" : "error", /denied|permission/i.test(text) ? "" : "A busca não começou: " + errorText(error));
  }
}
async function cancelBleScan() {
  bleUi.run++;
  await bleStopScan();
  if (bleUi.phase === "scanning" || bleUi.phase === "checking") setBlePhase(bleUi.devices.size ? "found" : "idle", bleUi.devices.size ? "" : "Busca cancelada.");
}
// Aplicativo no fundo: a busca para na hora; a conexão é liberada depois de 30 s (um diálogo do
// sistema, como o do pareamento, não derruba a conexão).
function bleOnVisibility() {
  clearTimeout(bleUi.hiddenTimer);
  if (!document.hidden || !bleAvailable()) return;
  cancelBleScan().catch(() => {});
  bleUi.hiddenTimer = setTimeout(() => {
    if (document.hidden && bleCurrent()) bleDisconnect().catch(() => {});
  }, 30e3);
}
// Última leitura que a placa enviou à nuvem, para ficar ao lado da leitura local.
async function loadBleCloud(sensorId, force = false) {
  if (!sensorId || !state.authorized) return;
  if (!force && bleUi.cloudFor === sensorId && Date.now() - bleUi.cloudAt < 10e3) return;
  Object.assign(bleUi, { cloudFor: sensorId, cloudAt: Date.now() });
  try {
    const startedAt = Date.now();
    const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: [sensorId] });
    setServerTime(result.server_time, startedAt);
    mergeDevices(result.devices);
    bleUi.cloudKnown = result.devices.length > 0;
    if (bleUi.cloudKnown) await loadTelemetrySummary([sensorId]).catch(() => {});
    bleUi.cloudError = "";
  } catch (error) {
    bleUi.cloudError = isNetworkError(error) ? "offline" : errorText(error);
  }
  renderBleCloud(sensorId);
}
function renderBleCloud(sensorId) {
  if (!$id("bleCloud")) return;
  const device = findDevice(sensorId);
  const offline = bleUi.cloudError === "offline";
  const box = $id("bleCloud");
  if (!device) {
    box.className = "ble-source is-cloud is-late";
    $id("bleCloudValue").textContent = "—";
    $id("bleCloudLabel").textContent = offline ? "sem internet no celular" : bleUi.cloudKnown === false ? "sensor fora do escopo da sua conta, ou ainda sem a primeira transmissão" : bleUi.cloudError || "consultando a nuvem…";
    $id("bleCloudTime").textContent = "";
    $id("linkBle").disabled = !offline && bleUi.cloudKnown === false;
    return;
  }
  const view = deviceView(device);
  const status = deviceStatus(device);
  const late = offline || !status.online;
  box.className = "ble-source is-cloud" + (late ? " is-late" : "");
  $id("bleCloudValue").textContent = view.value === "—" ? "—" : view.value + (view.unit === "%" ? " %" : view.unit);
  $id("bleCloudLabel").innerHTML =
    esc(view.bench ? "posição de bancada" : view.kicker || "posição elétrica") + (view.sim ? " · " + benchSimChip(view.sim) : view.value === "—" ? " · " + esc(view.label) : "");
  $id("bleCloudTime").textContent =
    (late ? "última leitura da nuvem: " : "recebida às ") + fmtClock(device.last_received_at) + ` · há ${agoText(device.last_received_at)}` + (offline ? " · sem internet no celular agora" : late ? " · " + status.label.toLowerCase() : "");
  $id("linkBle").disabled = false;
  $id("linkBle").textContent = `Abrir ${deviceLabel(device)} na plataforma`;
}
function onBleReading(reading, device) {
  state.bleReading = reading;
  state.bleDevice = device;
  const magnetic = reading.modality === "as5600_i2c";
  $id("bleLive").hidden = false;
  $id("bleName").textContent = reading.device || device?.name || "Sensor";
  $id("bleIdentity").textContent = reading.sensor_id || "Firmware sem identificação; atualize para configurar.";
  // Placa magnética (firmware 4.4.0 em diante): ângulo absoluto e saúde. Não há tensão nem percentual local.
  const badSample = magnetic && (reading.bus !== "ok" || reading.mag !== "ok" || reading.angle_deg == null);
  $id("blePercent").textContent = magnetic ? (reading.angle_deg == null ? "—" : fmtDeg(reading.angle_deg, 2)) : `${fmtNum(reading.travel_percent)} %`;
  $id("blePercentLabel").textContent = magnetic ? "ângulo do sensor (absoluto, medido agora)" : "posição elétrica";
  $id("bleVoltage").textContent = magnetic
    ? "sinal: " + (reading.bus !== "ok" ? MAG_BUS_TEXT[reading.bus] || "sem resposta do sensor" : MAG_FIELD_TEXT[reading.mag] || "—")
    : `tensão estimada ${fmtNum(reading.voltage_v, 3)} V`;
  $id("bleVoltage").classList.toggle("tree-state", badSample);
  $id("bleTimestamp").textContent = `lida às ${fmtClock(new Date())} · sequência ${reading.sequence ?? "—"}`;
  $id("bleNote").textContent = magnetic
    ? "O ângulo local é a posição absoluta do ímã, de 0° a 359,9°. O percentual de bancada é calculado na nuvem pela contagem contínua que a placa envia: só com o ângulo não dá para saber em que volta o eixo está depois de passar de 360°."
    : "A leitura local vem direto da placa. A nuvem recebe o que a placa envia pela rede Wi-Fi.";
  if (bleUi.phase === "connecting") setBlePhase("connected");
  if (reading.sensor_id) {
    renderBleCloud(reading.sensor_id);
    loadBleCloud(reading.sensor_id).catch(() => {});
  } else $id("linkBle").disabled = true;
}
// Mensagens do cliente Bluetooth (conexão caiu, falha de leitura): viram estado na tela.
function setBleStatus(text) {
  if (!$id("bleStatus")) return;
  if (/desconectado/i.test(text)) return setBlePhase("disconnected");
  if (/falha na leitura/i.test(text)) return setBlePhase("connected", "Conectado, mas a última leitura local falhou. Tentando de novo a cada 5 segundos.");
  if (bleCurrent() && bleUi.phase !== "connected") return setBlePhase("connected");
  if (bleUi.phase === "connected" || bleUi.phase === "disconnected") return setBlePhase(bleUi.phase, text);
  renderBle();
}
$id("openBle").onclick = () => openBleDialog();
$id("scanBle").onclick = () => startBleScan();
$id("cancelBle").onclick = () => cancelBleScan();
$id("bleHelp").onclick = (event) => {
  const kind = event.target.closest("[data-ble-help]")?.dataset.bleHelp;
  if (!kind) return;
  const open = kind === "bluetooth" ? BleClient.openBluetoothSettings() : kind === "location" ? BleClient.openLocationSettings() : BleClient.openAppSettings();
  open.catch(() => setBlePhase(bleUi.phase, "Não foi possível abrir os ajustes por aqui. Abra os Ajustes do Android e volte ao aplicativo."));
};
$id("bleDevices").onclick = async (event) => {
  const button = event.target.closest("[data-ble]");
  if (!button || bleUi.phase === "connecting") return;
  const run = ++bleUi.run;
  const picked = bleUi.devices.get(button.dataset.ble) || { deviceId: button.dataset.ble };
  setBlePhase("connecting");
  try {
    await bleConnect({ deviceId: picked.deviceId, name: picked.name || picked.localName || "Sensor Gaxeta" }, onBleReading, setBleStatus);
    if (run === bleUi.run) setBlePhase("connected");
  } catch (error) {
    if (run === bleUi.run) setBlePhase("error", "Não foi possível conectar: " + errorText(error) + " Aproxime o celular da placa e tente de novo.");
  }
};
$id("disconnectBle").onclick = async () => {
  await bleDisconnect();
  setBlePhase("disconnected");
};
$id("bleDialog").addEventListener("close", () => cancelBleScan().catch(() => {}));
document.addEventListener("visibilitychange", bleOnVisibility);
window.addEventListener("pagehide", () => {
  if (!bleAvailable()) return;
  bleStopScan().catch(() => {});
  if (bleCurrent()) bleDisconnect().catch(() => {});
});
$id("identifyBle").onclick = async (event) => {
  await withBusy(event.currentTarget, async () => {
    await bleIdentify();
    setBlePhase("connected", "Comando enviado. Observe o LED do sensor por 10 segundos.");
  });
};
// O sensor detectado por Bluetooth só identifica o equipamento e abre o fluxo
// autorizado da plataforma; o vínculo ao spot é decidido no servidor.
$id("linkBle").onclick = async () => {
  const sensorId = state.bleReading?.sensor_id;
  if (!sensorId) return setBlePhase(bleUi.phase, "Atualize o firmware para identificar o sensor por ID.");
  try {
    const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: [sensorId] });
    if (!result.devices.length)
      return setBlePhase(bleUi.phase, "Sensor identificado, mas ainda não disponível para a sua conta. Ele aparece após a primeira transmissão; a primeira associação é feita por um administrador.");
    mergeDevices(result.devices);
    await loadTelemetrySummary([sensorId]).catch(() => {});
    $id("bleDialog").close();
    showPage("sensors");
    // Sensor ainda sem spot e conta que pode associar: abre direto no vínculo. Senão, os Detalhes.
    openDrawer(sensorId, !result.devices[0].measurement_point_id && canEditDevice(result.devices[0]) ? "edit" : "detail");
  } catch (error) {
    setBlePhase(bleUi.phase, isNetworkError(error) ? "Sem internet no celular: a leitura local segue acima; a plataforma abre quando a conexão voltar." : errorText(error));
  }
};

// ---- 95-boot.js ----
// =============================================================================
// Inicialização: liga a navegação e os eventos globais. O painel só abre por
// enterApp(), chamado a partir de uma ação explícita de quem está usando.
// =============================================================================
// Plataforma: decidida pelo runtime (aplicativo nativo × navegador), nunca pela largura da tela.
document.body.classList.toggle("native-app", isNativeApp());
// O topo do aplicativo é claro: os ícones da barra de status precisam ser escuros, inclusive com o
// aparelho em tema escuro (o padrão seguiria o tema e deixaria relógio e sinal brancos sobre branco).
if (isNativeApp()) {
  try {
    const bars = window.Capacitor?.Plugins?.SystemBars;
    Promise.resolve(bars?.setStyle?.({ style: "LIGHT" })).catch(() => {});
  } catch {}
}
if (bleAvailable()) $id("openBle").hidden = false;
else {
  // Web (inclusive navegador de celular): sem entrada de Bluetooth e sem o diálogo no documento.
  $id("openBle").remove();
  $id("bleDialog").remove();
}
document.querySelectorAll("[data-glyph]").forEach((slot) => (slot.innerHTML = glyph(slot.dataset.glyph)));
document.querySelectorAll("[data-page]").forEach((button) => (button.onclick = () => showPage(button.dataset.page)));
document.querySelectorAll("[data-close]").forEach((button) => (button.onclick = () => $id(button.dataset.close).close()));
$id("refresh").onclick = () => refreshData(true);
$id("pageActions").onclick = (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "find-sensor") openBleDialog({ scan: true }); // o toque em "Buscar" já é o pedido de busca
  if (action === "new-corporation") openAssetForm({ parentId: null }).catch((error) => showMessage(errorText(error), "error"));
  if (action === "manual-back") showPage(state.manualReturn);
  if (action === "new-gateway") openGatewayForm().catch((error) => showMessage(errorText(error), "error"));
  if (action === "new-user") openUserWizard().catch((error) => showMessage(errorText(error), "error"));
};
document.addEventListener("click", (event) => {
  // Fecha menus abertos ao clicar fora deles.
  document.querySelectorAll("details.user-menu[open], details.row-menu[open]").forEach((menu) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshData();
});
window.addEventListener("hashchange", () => {
  const page = location.hash.slice(1);
  if (state.authorized && PAGE_TITLES[page] && state.page !== page) showPage(page);
});
window.addEventListener(
  "resize",
  debounce(() => {
    if (!state.authorized) return;
    renderPageActions();
    renderTree();
    renderIcons();
  }, 200),
);
// Telefone com o teclado aberto: o campo em foco fica à vista (o teclado encolhe a área útil).
document.addEventListener("focusin", (event) => {
  if (!(isNativeApp() || isNarrow()) || !event.target.matches?.('input:not([type="checkbox"]):not([type="radio"]), select, textarea')) return;
  setTimeout(() => document.activeElement === event.target && event.target.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
});
// Fora do fluxo síncrono do SDK, para não bloquear a renovação do token.
sb.auth.onAuthStateChange((event, session) => setTimeout(() => onAuthEvent(event, session), 0));
renderIcons();

// ---- 99-exports.js ----
export{Zt as E,ir as W,Va as b,hs as h,bo as m,Eo as t,_o as w};
