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
const ROLE_LABEL = { adm1: "ADM nível 1", adm2: "ADM nível 2", adm3: "ADM nível 3", corp: "Usuário de corporação" };

const fmtNum = (value, digits = 1) =>
  value == null || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" }) : "—");
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const $id = (id) => document.getElementById(id);
const isNativeApp = () => Z.isNativePlatform();
const isNarrow = () => window.matchMedia("(max-width: 760px)").matches;

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
};
const glyph = (name) =>
  `<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPHS[name] || ""}</svg>`;

// ----- Regras de domínio herdadas do pacote publicado (sem alteração de comportamento) -----
function connectionStatus(t, e = Date.now()) {
  const r = e - new Date(t.last_received_at || 0).getTime();
  return r < 25e3
    ? {
        online: !0,
        label: "Transmitindo",
        className: "green",
      }
    : r < 65e3
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
function adjustmentInfo(t) {
  if (t == null || !Number.isFinite(Number(t)))
    return {
      key: "unknown",
      label: "Sem leitura",
      action: "Aguardando medição",
    };
  const e = Number(t);
  return e >= 70
    ? {
        key: "high",
        label: "Alto ajuste",
        action: "Sem necessidade de intervenção",
      }
    : e >= 45
      ? {
          key: "medium",
          label: "Médio ajuste",
          action: "Sem necessidade de intervenção",
        }
      : e > 20
        ? {
            key: "low",
            label: "Baixo ajuste",
            action: "Planejar intervenção",
          }
        : {
            key: "critical",
            label: "Sem ajuste",
            action: "Substituir a gaxeta",
          };
}
function buildStablePath(t, e, r, s, n) {
  const i = +new Date(r),
    a = +new Date(s),
    o = Math.min(a, +new Date(n));
  if (!(a > i) || !(o >= i)) return "";
  const l = (f) => Math.max(0, Math.min(1e3, ((f - i) / (a - i)) * 1e3)).toFixed(2),
    c = (f) => (280 - Math.max(0, Math.min(100, Number(f))) * 2.8).toFixed(2);
  let h = e?.stable_percent,
    p = h == null ? "" : `M0 ${c(h)}`;
  for (const f of t) {
    const g = +new Date(f.received_at);
    g < i ||
      g > o ||
      ((p += h == null ? `M${l(g)} ${c(f.stable_percent)}` : ` H${l(g)} V${c(f.stable_percent)}`), (h = f.stable_percent));
  }
  return h == null ? "" : p + ` H${l(o)}`;
}
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
async function bleScan(t, e) {
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
      (await bleStopScan(), e("Busca concluída. Selecione um sensor ou busque novamente."));
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
      await BleClient.startNotifications(t.deviceId, BLE_SERVICE, BLE_CHAR_READING, (s) => bleParse(s)).catch(() => {}),
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
  history: [],
  movements: [],
  seed: null,
  stats: {},
  period: 36e5,
  range: presetRange(36e5),
  custom: false,
  authorized: false,
  loading: false,
  timer: null,
  historyRequest: 0,
  authRequest: 0,
  bleReading: null,
  bleDevice: null,
  ctx: null, // resposta de gaxeta_my_context()
  userId: null,
  lastContextCheck: 0,
  sensors: { search: "", filter: "all", offset: 0, total: 0, ids: [], request: 0 },
  drawer: { open: false, mode: "detail", sensorId: "", opener: null },
};
const assetIndex = new Map();

const deviceStatus = (device) => connectionStatus(device, Date.now() + state.clockOffset);
const currentDevice = () => state.devices.find((device) => device.sensor_id === state.sensorId);
const findDevice = (sensorId) => state.devices.find((device) => device.sensor_id === sensorId);
const assetName = (id) => assetIndex.get(id)?.name || "—";
const assetPathLabel = (id) =>
  assetPath(id, state.assets)
    .map((asset) => (asset.tag ? `${asset.name} · ${asset.tag}` : asset.name))
    .join(" / ");
const deviceLabel = (device) =>
  device.desired_label || device.applied_label || (device.label === "Sensor de gaxeta" ? device.sensor_id : device.label) || device.sensor_id;

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
function errorText(error) {
  const message = error?.message || String(error || "");
  if (error?.name === "AbortError" || /Failed to fetch|NetworkError|Load failed/i.test(message))
    return "Não foi possível conectar. Verifique sua conexão e tente de novo.";
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
// Garante no cache os ativos indicados e seus ancestrais (duas consultas no máximo).
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
  const missing = [...new Set(ids.filter((id) => id && !assetIndex.get(id)?.path))];
  if (!missing.length) return;
  const rows = await fetchRows(missing);
  const ancestors = [...new Set(rows.flatMap((row) => row.path || []))].filter((id) => !assetIndex.has(id));
  if (ancestors.length) await fetchRows(ancestors);
}
function mergeDevices(rows) {
  const byId = new Map(state.devices.map((device) => [device.sensor_id, device]));
  for (const row of rows || []) byId.set(row.sensor_id, row);
  state.devices = [...byId.values()];
}
function setServerTime(serverTime, observedAt) {
  if (serverTime) state.clockOffset = new Date(serverTime).getTime() - observedAt;
}
// Atualiza só os sensores em uso (selecionado e painel aberto): uma chamada por ciclo.
async function refreshKnownDevices() {
  const ids = [...new Set([state.sensorId, state.drawer.open ? state.drawer.sensorId : ""].filter(Boolean))];
  if (!ids.length) return;
  const startedAt = Date.now();
  const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: ids });
  setServerTime(result.server_time, startedAt);
  mergeDevices(result.devices);
  if (state.sensorId && !result.devices.some((device) => device.sensor_id === state.sensorId) && state.page === "telemetry") {
    // O sensor saiu do escopo de quem está logado (vínculo ou acesso alterado).
    state.devices = state.devices.filter((device) => device.sensor_id !== state.sensorId);
    state.sensorId = "";
    state.history = [];
    state.movements = [];
    state.stats = {};
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

// ----- Navegação -----
const PAGE_TITLES = { sensors: "Sensores", assets: "Árvore de ativos", telemetry: "Telemetria", gateways: "Gateways", users: "Usuários" };
function renderPageActions() {
  const actions = [];
  if (state.page === "sensors") actions.push('<button class="primary compact" data-action="find-sensor">' + icon("bluetooth-searching") + "Encontrar sensor</button>");
  if (state.page === "assets" && hasCap("manage_corporations") && !isNarrow() && !isNativeApp())
    actions.push('<button class="primary compact" data-action="new-corporation">' + icon("plus") + "Nova corporação</button>");
  if (state.page === "gateways" && hasCap("manage_gateways"))
    actions.push('<button class="primary compact" data-action="new-gateway">' + icon("plus") + "Cadastrar gateway</button>");
  if (state.page === "users" && hasCap("manage_users"))
    actions.push('<button class="primary compact" data-action="new-user">' + icon("plus") + "Novo usuário</button>");
  $id("pageActions").innerHTML = actions.join("");
}
function showPage(page) {
  if (!PAGE_TITLES[page] || (page === "users" && !hasCap("manage_users"))) page = "sensors";
  state.page = page;
  if (location.hash.slice(1) !== page) history.replaceState(null, "", "#" + page);
  document.body.dataset.page = page;
  $id("workspace").hidden = !["sensors", "assets"].includes(page);
  $id("sensorPane").hidden = page !== "sensors";
  $id("assetInspector").hidden = page !== "assets";
  $id("telemetryPage").hidden = page !== "telemetry";
  $id("gatewayPage").hidden = page !== "gateways";
  $id("usersPage").hidden = page !== "users";
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
      await refreshKnownDevices();
      await loadHistory();
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
      setConnection(false);
      if (manual) showMessage(errorText(error), "error");
    }
  } finally {
    state.loading = false;
    if (state.authorized) state.timer = setTimeout(refreshData, state.refreshPending ? 0 : CONFIG.pollMs);
  }
}
function renderAll() {
  if (state.page === "sensors") renderSensorGrid();
  renderTree();
  updateDrawerLive();
  renderHistorySelect();
  renderIcons();
}
const openSensorEditor = (sensorId) => openDrawer(sensorId, "detail");

// Limpa da tela e da memória tudo o que pertence à sessão encerrada.
function clearSessionData() {
  clearTimeout(state.timer);
  state.authorized = false;
  state.authRequest++;
  state.historyRequest++;
  Object.assign(state, { devices: [], assets: [], sensorId: "", assetId: "", history: [], movements: [], seed: null, stats: {}, ctx: null, userId: null });
  state.sensors = { search: "", filter: "all", offset: 0, total: 0, ids: [], request: 0 };
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
function allowedChildKinds(asset) {
  const kinds = asset ? KIND_CHILDREN[asset.kind] || [] : ["corporation"];
  const role = myRole();
  return kinds.filter((kind) => {
    if (kind === "corporation") return role === "adm1";
    // Corporações e empresas são criadas no desktop (o servidor valida de qualquer forma).
    if (kind === "company" && (isNarrow() || isNativeApp())) return false;
    if (role === "adm1" || role === "adm2") return true;
    return role === "corp" && state.ctx.can_write && kind !== "company" && asset.access === "full";
  });
}
function canEditAsset(asset) {
  const role = myRole();
  if (role === "adm1") return true;
  if (role === "adm2") return asset.kind !== "corporation";
  return role === "corp" && state.ctx.can_write && ["area", "subarea", "equipment", "point"].includes(asset.kind) && asset.access === "full";
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
    const label = asset.tag ? `${asset.name} · ${asset.tag}` : asset.name;
    const sensor = asset.kind === "point" ? state.devices.find((device) => device.measurement_point_id === id) : null;
    html +=
      `<li role="treeitem" aria-selected="${selected}"${asset.has_children ? ` aria-expanded="${open}"` : ""}>` +
      `<div class="tree-row${selected ? " selected" : ""}${asset.access === "path" ? " path-only" : ""}">` +
      `<button class="tree-toggle" data-toggle="${id}" aria-label="${open ? "Recolher" : "Expandir"} ${esc(asset.name)}"${asset.has_children ? "" : " disabled"}>${asset.has_children ? (open ? "▾" : "▸") : ""}</button>` +
      `<button class="tree-node" data-asset="${id}" title="${esc(KIND_LABEL[asset.kind] + ": " + label)}">${icon(KIND_ICON[asset.kind])}<span><small>${KIND_LABEL[asset.kind]}</small>${esc(label)}</span></button>` +
      (allowedChildKinds(asset).length
        ? `<button class="tree-action" data-add-child="${id}" aria-label="Adicionar abaixo de ${esc(asset.name)}" title="Adicionar abaixo">+</button>`
        : "") +
      "</div>" +
      (sensor
        ? `<button class="tree-sensor" data-tree-sensor="${esc(sensor.sensor_id)}">${icon("radio")}${esc(deviceLabel(sensor))} <strong>${fmtNum(sensor.stable_percent)}%</strong></button>`
        : "") +
      (open ? treeBranch(id) : "") +
      "</li>";
  }
  if (entry.total > entry.ids.length)
    html += `<li><button class="tree-more" data-more="${parentId || ""}">Carregar mais (${entry.total - entry.ids.length} restantes)</button></li>`;
  return html + "</ul>";
}
function renderTree() {
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
          (isNarrow() || isNativeApp() ? "<p>A criação de corporações é feita no computador.</p>" : '<button class="secondary compact" data-add-child="">Criar corporação</button>') +
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
    await renderInspector();
    if (isNarrow()) setTreeDrawer(false);
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
function setTreeDrawer(open) {
  document.body.classList.toggle("tree-open", !!open);
}

$id("tree").onclick = async (event) => {
  const pick = (name) => event.target.closest(`[data-${name}]`);
  try {
    if (pick("tree-sensor")) {
      state.sensorId = pick("tree-sensor").dataset.treeSensor;
      showPage("telemetry");
    } else if (pick("add-child")) {
      openAssetForm({ parentId: pick("add-child").dataset.addChild || null });
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
$id("toggleTree").onclick = () => {
  if (isNarrow()) setTreeDrawer(!document.body.classList.contains("tree-open"));
  else {
    const collapsed = document.body.classList.toggle("tree-collapsed");
    $id("toggleTree").setAttribute("aria-expanded", String(!collapsed));
  }
};
$id("closeTree").onclick = () => setTreeDrawer(false);

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
              `<button data-result="${row.id}"><small>${KIND_LABEL[row.kind]}</small><strong>${esc(row.tag ? row.name + " · " + row.tag : row.name)}</strong><span>${esc((row.path_names || []).slice(0, -1).join(" / "))}</span></button>`,
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
  await ensureAssets(page.items.map((device) => device.measurement_point_id));
  if (run !== view.request) return;
  if (!state.assetId && !view.search && view.filter === "all") {
    $id("sensorCount").textContent = page.total;
    $id("onlineCount").textContent = online.count ?? "—";
    $id("offlineCount").textContent = online.count == null ? "—" : Math.max(0, page.total - online.count);
    view.allTotal = page.total;
  } else if (online.count != null && view.allTotal != null) {
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
  grid.innerHTML =
    devices
      .map((device) => {
        const status = deviceStatus(device);
        const health = adjustmentInfo(device.stable_percent);
        const scale = Math.max(0, Math.min(100, Number(device.stable_percent) || 0));
        const path = assetPathLabel(device.measurement_point_id);
        return (
          `<article class="sensor-card health-${health.key}" data-card="${esc(device.sensor_id)}">` +
          `<header><strong>${esc(deviceLabel(device))}</strong><span class="conn"><i class="dot ${status.className}"></i>${status.label}</span></header>` +
          `<p class="card-path${path ? "" : " unlinked"}">${esc(path || "Sem vínculo · fila de associação")}</p>` +
          `<div class="card-main"><div class="card-value">${fmtNum(device.stable_percent)}<small>%</small></div>` +
          `<div class="card-side"><span class="adjustment-badge">${health.label}</span><small>${health.action}</small></div></div>` +
          `<div class="mini-scale"><i style="width:${scale}%"></i></div>` +
          `<div class="card-meta"><span>Bruto ${fmtNum(device.last_percent)} %</span><span>${fmtNum(device.last_voltage_v, 3)} V</span><span title="Última leitura">${fmtDateTime(device.last_received_at)}</span></div>` +
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
  if (button.dataset.act === "history") {
    state.sensorId = sensorId;
    state.history = [];
    state.stats = {};
    showPage("telemetry");
  } else openDrawer(sensorId, button.dataset.act, button);
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
$id("statusFilter").onchange = () => {
  state.sensors.filter = $id("statusFilter").value;
  state.sensors.offset = 0;
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
};

// ----- Seletor de localização em cascata (lê cada nível sob demanda) -----
const PICK_LEVELS = ["corporation", "company", "area", "subarea", "equipment", "point"];
const PICK_PLACEHOLDER = {
  corporation: "Selecione a corporação",
  company: "Selecione a empresa",
  area: "Selecione a área",
  subarea: "TAG direto na área (sem subárea)",
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
      options.map((asset) => ({ value: asset.id, label: asset.tag ? `${asset.name} · ${asset.tag}` : asset.name })),
      PICK_PLACEHOLDER[level],
      values[level] || "",
    );
    values[level] = select.value;
    select.disabled = level !== "corporation" && !parent;
  }
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
  renderDrawer().catch((error) => showMessage(errorText(error), "error"));
}
function closeDrawer(restoreFocus = true) {
  const opener = state.drawer.opener;
  Object.assign(state.drawer, { open: false, sensorId: "", opener: null });
  $id("detailPane").hidden = true;
  $id("scrim").hidden = true;
  document.body.classList.remove("drawer-open");
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
  const health = adjustmentInfo(device.stable_percent);
  $id("detailStatus").innerHTML = `<i class="dot ${status.className}"></i>${status.label} · ${fmtDateTime(device.last_received_at)}`;
  $id("detailStable").textContent = fmtNum(device.stable_percent) + " %";
  $id("detailRaw").textContent = fmtNum(device.last_percent) + " %";
  $id("detailVolt").textContent = fmtNum(device.last_voltage_v, 3) + " V";
  $id("detailHealth").textContent = health.label + " · " + health.action;
  $id("detailHealth").className = "health-banner health-" + health.key;
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
  const head =
    `<div class="drawer-head"><div><small>${mode === "edit" ? "Editar sensor" : "Sensor"}</small><h2>${esc(deviceLabel(device))}</h2></div>` +
    `<button id="drawerClose" class="icon-button" aria-label="Fechar painel">×</button></div>` +
    `<div class="drawer-body"><div class="live-line" id="detailStatus"></div>` +
    `<div class="drawer-values"><div><span>Estabilizado</span><strong id="detailStable"></strong></div><div><span>Bruto</span><strong id="detailRaw"></strong></div><div><span>Tensão est.</span><strong id="detailVolt"></strong></div></div>` +
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
          if (state.page === "sensors") await loadSensors({ quiet: true });
        } catch (error) {
          message.textContent = errorText(error);
        }
      });
    };
    if ($id("unlinkSensor"))
      $id("unlinkSensor").onclick = async (event) => {
        if (!(await askConfirm({ title: "Desvincular sensor", html: `<p>O sensor <b>${esc(deviceLabel(device))}</b> sai de <b>${esc(path)}</b> e volta à fila de associação. As leituras continuam chegando e o histórico é preservado.</p>`, okLabel: "Desvincular" }))) return;
        await withBusy(event.target, async () => {
          const saved = await callRpc("gaxeta_unlink_sensor", { p_sensor_id: sensorId, p_reason: "desvínculo pela interface" });
          mergeDevices([saved]);
          showMessage("Sensor desvinculado. Ele está na fila de associação.", "success");
          openDrawer(sensorId, "detail");
          if (state.page === "sensors") await loadSensors({ quiet: true });
        });
      };
  } else {
    const gateway = device.gateway_id ? (await unwrap(sb.from("gaxeta_gateways").select("name,identifier").eq("id", device.gateway_id).limit(1)))[0] : null;
    if (state.drawer.sensorId !== sensorId) return;
    const fields = [
      ["ID", device.sensor_id],
      ["MAC Wi-Fi", device.wifi_mac || "—"],
      ["MAC BLE", device.ble_mac || "—"],
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
      `</div><dl class="detail-fields">${fields.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("")}` +
      `<dt>Sequência</dt><dd id="detailSequence"></dd><dt>Sinal Wi-Fi</dt><dd id="detailRssi"></dd></dl>` +
      (canEditDevice(device)
        ? `<details class="technical-detail"><summary>Nome anunciado por Bluetooth (opcional)</summary><p class="form-help">O nome da plataforma não depende do Bluetooth. Para gravar o nome na placa, conecte o sensor pelo Bluetooth e use o PIN de 6 dígitos. Nada é enviado à placa sem esta ação.</p><button id="applyBleName" class="secondary compact">Gravar nome na placa</button></details>`
        : "") +
      `<small class="drawer-note">Posição e tensão são estimadas. Curso de referência: 50 mm.</small></div>`;
    $id("detailHistory").onclick = () => {
      state.sensorId = sensorId;
      closeDrawer(false);
      showPage("telemetry");
    };
    if ($id("detailEdit")) $id("detailEdit").onclick = () => openDrawer(sensorId, "edit");
    if ($id("applyBleName"))
      $id("applyBleName").onclick = (event) =>
        withBusy(event.currentTarget, async () => {
          if (!bleCurrent() || state.bleReading?.sensor_id !== sensorId) {
            openBleDialog();
            $id("bleStatus").textContent = "Conecte o sensor com ID " + sensorId + " para gravar o nome.";
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

// ---- 65-assets.js ----
// =============================================================================
// Ativos: inspetor do nível selecionado, formulários persistentes (RPCs com
// autorização no servidor), exclusão com dependências e vínculo sensor–spot.
// =============================================================================
const HIERARCHY_GUIDE =
  '<ol class="hierarchy-guide"><li>Corporação</li><li>Empresa</li><li>Área</li><li>Subárea <em>(opcional)</em></li><li>TAG (equipamento)</li><li>Spot → sensor</li></ol>' +
  "<p>O TAG pode ficar direto na área ou dentro de uma subárea. O sensor é vinculado ao spot. O gateway é cadastrado na empresa.</p>";

async function renderInspector() {
  const box = $id("assetInspector");
  const assetId = state.assetId;
  const asset = assetIndex.get(assetId);
  if (!asset) {
    box.innerHTML = `<div class="inspector-card"><h2>Estrutura de ativos</h2><p>Selecione um nível na árvore para ver detalhes, editar ou criar o próximo nível.</p>${HIERARCHY_GUIDE}</div>`;
    return;
  }
  await ensureAssets([assetId]);
  let sensor = null;
  if (asset.kind === "point") {
    sensor = (await unwrap(sb.from("gaxeta_devices").select("*").eq("measurement_point_id", assetId).limit(1)))[0] || null;
    if (sensor) mergeDevices([sensor]);
  }
  if (state.assetId !== assetId || state.page !== "assets") return;
  const childKinds = allowedChildKinds(asset);
  const editable = canEditAsset(asset);
  const canLink = asset.kind === "point" && (isAdminWriter() || (myRole() === "corp" && state.ctx.can_write && asset.access === "full"));
  const sensorBlock =
    asset.kind !== "point"
      ? ""
      : sensor
        ? `<div class="inspector-sensor"><div><small>Sensor vinculado</small><strong>${esc(deviceLabel(sensor))}</strong><span>${fmtNum(sensor.stable_percent)} % · ${deviceStatus(sensor).label}</span></div>` +
          `<div class="row-actions"><button class="secondary compact" data-act="sensor-detail" data-sensor="${esc(sensor.sensor_id)}">Detalhes</button><button class="secondary compact" data-act="sensor-history" data-sensor="${esc(sensor.sensor_id)}">Histórico</button></div></div>`
        : `<div class="inspector-sensor empty"><div><small>Sensor</small><strong>Aguardando instalação</strong><span>Nenhum sensor vinculado a este spot.</span></div>` +
          (canLink ? `<div class="row-actions"><button class="primary compact" data-act="link">Vincular sensor</button></div>` : "") +
          `</div>`;
  box.innerHTML =
    `<div class="inspector-card"><span class="kind-chip">${KIND_LABEL[asset.kind]}</span><h2>${esc(asset.name)}</h2>` +
    `<p class="inspector-path">${esc(assetPathLabel(assetId))}</p>` +
    (asset.access === "path" ? '<p class="path-note">Este nível aparece só como caminho de navegação até os ramos concedidos à sua conta.</p>' : "") +
    `<dl class="detail-fields">${asset.tag ? `<dt>TAG / código</dt><dd>${esc(asset.tag)}</dd>` : ""}${asset.position ? `<dt>Posição</dt><dd>${esc(asset.position)}</dd>` : ""}</dl>` +
    sensorBlock +
    `<div class="inspector-actions">` +
    childKinds.map((kind) => `<button class="primary compact" data-act="add" data-kind="${kind}">${icon("plus")}${KIND_LABEL[kind]}</button>`).join("") +
    (editable ? `<button class="secondary compact" data-act="edit">Editar</button>` : "") +
    (asset.kind === "company" ? `<button class="secondary compact" data-act="gateways">Gateways da empresa</button>` : "") +
    (hasCap("delete_records") ? `<button class="text-button danger-text" data-act="delete">Excluir…</button>` : "") +
    `</div>` +
    (childKinds.length ? `<p class="form-help">Próximo nível: ${childKinds.map((kind) => KIND_LABEL[kind]).join(" ou ")}.</p>` : "") +
    `</div>`;
  renderIcons();
}
$id("assetInspector").onclick = async (event) => {
  const button = event.target.closest("[data-act]");
  if (!button) return;
  const act = button.dataset.act;
  const asset = assetIndex.get(state.assetId);
  if (act === "sensor-detail") return openDrawer(button.dataset.sensor, "detail", button);
  if (act === "sensor-history") {
    state.sensorId = button.dataset.sensor;
    return showPage("telemetry");
  }
  if (!asset) return;
  if (act === "add") return openAssetForm({ parentId: asset.id, kind: button.dataset.kind });
  if (act === "edit") return openAssetForm({ editId: asset.id });
  if (act === "link") return openLinkDialog(asset.id);
  if (act === "gateways") return showPage("gateways");
  if (act === "delete") return withBusy(button, () => deleteAsset(asset));
};

// ----- Formulário de ativo -----
const assetFormState = { editId: null, parentId: null };
function openAssetForm({ parentId = null, kind = null, editId = null }) {
  const editing = editId ? assetIndex.get(editId) : null;
  const parent = editing ? assetIndex.get(editing.parent_id) : assetIndex.get(parentId);
  const kinds = editing ? [editing.kind] : allowedChildKinds(parent || null);
  if (!kinds.length) return showMessage("Sua conta não pode criar níveis aqui.", "error");
  Object.assign(assetFormState, { editId: editing?.id || null, parentId: editing ? editing.parent_id : parentId });
  fillSelect($id("assetKind"), kinds.map((value) => ({ value, label: KIND_LABEL[value] })), null, kind && kinds.includes(kind) ? kind : kinds[0]);
  $id("assetKindRow").hidden = kinds.length < 2;
  $id("assetContext").textContent = parent ? "Dentro de: " + assetPathLabel(parent.id) : "Raiz da estrutura";
  $id("assetName").value = editing?.name || "";
  $id("assetTag").value = editing?.tag || "";
  $id("assetPosition").value = editing?.position || "";
  for (const id of ["corpEmail", "corpResponsible", "corpPhone"]) $id(id).value = "";
  $id("assetFormMessage").textContent = "";
  syncAssetForm();
  $id("assetDialog").showModal();
  $id("assetName").focus();
}
function syncAssetForm() {
  const kind = $id("assetKind").value;
  const editing = !!assetFormState.editId;
  $id("assetDialogTitle").textContent = (editing ? "Editar " : "Novo nível: ") + KIND_LABEL[kind];
  $id("assetTagRow").hidden = kind === "corporation" || kind === "point";
  $id("assetPositionRow").hidden = kind !== "point";
  $id("corpFields").hidden = kind !== "corporation";
  $id("corpFields").querySelector(".form-help").textContent = editing
    ? "Para atualizar o contato, preencha e-mail e responsável. Em branco, só o nome é alterado."
    : "Contato e responsável podem ser preenchidos depois: a corporação pode nascer como rascunho.";
}
$id("assetKind").onchange = syncAssetForm;
$id("assetForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("assetFormMessage");
  const kind = $id("assetKind").value;
  const name = $id("assetName").value.trim();
  if (!name) return void (message.textContent = "Informe o nome.");
  const email = $id("corpEmail").value.trim();
  if (kind === "corporation" && email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return void (message.textContent = "E-mail de contato inválido.");
  message.textContent = "Salvando…";
  const button = event.submitter;
  button.disabled = true;
  try {
    const { editId, parentId } = assetFormState;
    const withContact = kind === "corporation" && (!editId || email || $id("corpResponsible").value.trim());
    const saved = withContact
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
          p_tag: kind === "corporation" || kind === "point" ? "" : $id("assetTag").value.trim(),
          p_position: kind === "point" ? $id("assetPosition").value.trim() : "",
          p_sensor_id: null,
          p_sensor_label: null,
        });
    // Relê o ramo no servidor: o que aparece na árvore é o que ficou gravado.
    await loadKids(parentId || null, { force: true });
    await ensureAssets([saved.id]);
    if (parentId) tree.open.add(parentId);
    $id("assetDialog").close();
    await revealAsset(saved.id);
    state.assetId = saved.id;
    renderTree();
    if (state.page === "assets") await renderInspector();
    renderIcons();
    const next = allowedChildKinds(assetIndex.get(saved.id)).map((value) => KIND_LABEL[value]);
    showMessage(`${KIND_LABEL[kind]} “${saved.name}” ${editId ? "atualizado" : "gravado"}.${!editId && next.length ? " Próximo nível: " + next.join(" ou ") + "." : ""}`, "success");
  } catch (error) {
    message.textContent = errorText(error);
  } finally {
    button.disabled = false;
  }
};

// ----- Exclusão definitiva (nível 1), sempre com as dependências à vista -----
async function deleteAsset(asset) {
  const deps = await callRpc("gaxeta_asset_dependencies", { p_id: asset.id });
  const lines = [
    ["children", "níveis diretamente abaixo"],
    ["linked_sensors", "sensores vinculados"],
    ["gateways", "gateways"],
    ["link_history", "registros de instalação (histórico de vínculos)"],
    ["users", "usuários vinculados à corporação"],
  ]
    .filter(([key]) => deps[key] > 0)
    .map(([key, label]) => `<li><b>${deps[key]}</b> ${label}</li>`);
  if (lines.length) {
    await askConfirm({
      title: "Não é possível excluir",
      html: `<p><b>${esc(asset.name)}</b> possui dependências:</p><ul>${lines.join("")}</ul><p>Remova ou mova as dependências primeiro. Itens com histórico de instalação ficam preservados.</p>`,
      allowOk: false,
    });
    return;
  }
  const grants = deps.access_grants > 0 ? `<p>${deps.access_grants} concessão(ões) de acesso apontam para este nível e serão removidas.</p>` : "";
  if (!(await askConfirm({ title: "Excluir " + KIND_LABEL[asset.kind].toLowerCase(), html: `<p>Excluir definitivamente <b>${esc(assetPathLabel(asset.id))}</b>?</p>${grants}<p>A exclusão fica registrada na auditoria.</p>`, okLabel: "Excluir" }))) return;
  await callRpc("gaxeta_delete_asset", { p_id: asset.id, p_reason: "exclusão pela interface" });
  forgetAsset(asset.id);
  tree.kids.delete(kidsKey(asset.id));
  await loadKids(asset.parent_id || null, { force: true });
  state.assetId = asset.parent_id || "";
  renderTree();
  await renderInspector();
  renderIcons();
  showMessage(`${KIND_LABEL[asset.kind]} “${asset.name}” excluído.`, "success");
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
    await renderInspector();
    showMessage(`Sensor ${deviceLabel(saved)} vinculado a ${assetPathLabel(linkState.pointId)}.`, "success");
  } catch (error) {
    $id("linkMessage").textContent = errorText(error);
    button.disabled = false;
  }
};

// ---- 70-telemetry.js ----
// =============================================================================
// Telemetria. O cálculo, o gráfico, o zoom e os CSV vêm do pacote publicado, sem
// mudança de comportamento. A escolha do sensor passou a buscar no servidor.
// =============================================================================
const telemetry = { matchIds: null, searchRun: 0 };
function renderHistorySelect() {
  const known = telemetry.matchIds ? telemetry.matchIds.map(findDevice).filter(Boolean) : [...state.devices];
  const current = currentDevice();
  if (current && !known.includes(current)) known.unshift(current);
  known.sort((left, right) => deviceLabel(left).localeCompare(deviceLabel(right), "pt-BR"));
  fillSelect(
    $id("historySensor"),
    known.slice(0, 100).map((device) => ({ value: device.sensor_id, label: deviceLabel(device) + " — " + (assetPathLabel(device.measurement_point_id) || "Sem vínculo") })),
    known.length ? null : "Nenhum sensor",
    state.sensorId,
  );
  $id("historyLocation").textContent = current ? assetPathLabel(current.measurement_point_id) || "Sensor sem vínculo com spot" : "";
}
async function searchHistorySensors() {
  const run = ++telemetry.searchRun;
  const query = $id("historySearch").value.trim();
  const result = await callRpc("gaxeta_devices_page", { p_asset_id: null, p_search: query || null, p_unlinked: false, p_limit: 50, p_offset: 0 });
  if (run !== telemetry.searchRun) return;
  mergeDevices(result.items);
  await ensureAssets(result.items.map((device) => device.measurement_point_id));
  telemetry.matchIds = query ? result.items.map((device) => device.sensor_id) : null;
  renderHistorySelect();
}
$id("historySearch").oninput = debounce(() => searchHistorySensors().catch((error) => showMessage(errorText(error), "error")), 350);
async function openTelemetry() {
  if (state.sensorId && !currentDevice()) await refreshKnownDevices();
  if (!currentDevice()) {
    await searchHistorySensors();
    if (!currentDevice()) state.sensorId = state.devices[0]?.sensor_id || "";
  }
  await ensureAssets([currentDevice()?.measurement_point_id]);
  renderHistorySelect();
  renderHistory();
  await loadHistory();
}

// ----- Herdado do pacote publicado -----
function toLocalInput(t) {
  return new Date(t.getTime() - t.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
}
async function loadHistory() {
  const t = ++state.historyRequest,
    e = state.sensorId;
  if (!e) {
    ((state.history = []), (state.stats = {}), renderHistory());
    return;
  }
  state.custom || (state.range = presetRange(state.period, new Date(Date.now() + state.clockOffset)));
  const r = {
      ...state.range,
    },
    s = await unwrap(
      sb.rpc("gaxeta_history", {
        p_sensor_id: e,
        p_from: r.from.toISOString(),
        p_to: r.to.toISOString(),
      }),
    );
  t !== state.historyRequest ||
    e !== state.sensorId ||
    !state.authorized ||
    ((state.history = s.history || []),
    (state.movements = s.movements || []),
    (state.seed = s.seed || null),
    (state.movementsTruncated = !!s.movements_truncated),
    (state.stats = s.stats || {}),
    (state.historyRange = r),
    (state.bucketSeconds = s.bucket_seconds),
    $id("customRange").contains(document.activeElement) ||
      (($id("fromTime").value = toLocalInput(r.from)), ($id("toTime").value = toLocalInput(r.to))),
    renderHistory());
}
function renderHistory() {
  const t = state.history,
    e = currentDevice(),
    r = state.historyRange || state.range;
  (($id("historyTitle").textContent = e ? deviceLabel(e) : "Deslocamento da gaxeta"),
    ($id("historyCurrent").textContent = `${fmtNum(e?.stable_percent)} %`));
  const s = adjustmentInfo(e?.stable_percent);
  (($id("historyHealth").className = "health-banner health-" + s.key),
    ($id("historyHealth").textContent = s.label + " · " + s.action),
    ($id("historyRaw").textContent =
      "Leitura bruta atual: " + fmtNum(e?.last_percent) + "% · referência desde " + fmtDateTime(e?.stable_since)),
    ($id("historyMin").textContent = `${fmtNum(state.stats.min)} %`),
    ($id("historyMax").textContent = `${fmtNum(state.stats.max)} %`),
    ($id("historyCount").textContent = fmtNum(state.stats.count || 0, 0)),
    ($id("chartEmpty").hidden = t.length > 0),
    ($id("chartFrom").textContent = fmtDateTime(r.from)),
    ($id("chartTo").textContent = fmtDateTime(r.to)),
    ($id("aggregationNote").textContent = state.movementsTruncated
      ? "Muitos movimentos neste intervalo. Reduza o período para exibir o gráfico completo."
      : "Linha: variação ≥ 5 p.p. · faixa bruta: mín./máx. · médias de " + fmtNum(state.bucketSeconds || 1, 0) + " s"),
    ($id("exportCsv").disabled = !t.length),
    ($id("exportMovements").disabled = !state.movements.length || state.movementsTruncated),
    ($id("movementCount").textContent = state.movementsTruncated
      ? "Mais de 5.000 registros — reduza o período"
      : state.movements.filter((o) => o.previous_percent != null).length + " mudanças no período"),
    ($id("movementRows").innerHTML =
      state.movements
        .slice(-30)
        .reverse()
        .map((o) => {
          const l = adjustmentInfo(o.stable_percent);
          return `<tr><td>${fmtDateTime(o.received_at)}</td><td>${o.previous_percent == null ? "Referência inicial" : fmtNum(o.previous_percent) + " %"}</td><td>${fmtNum(o.stable_percent)} %</td><td>${o.previous_percent == null ? "—" : fmtNum(o.stable_percent - o.previous_percent) + " p.p."}</td><td><span class="adjustment-badge health-${l.key}">${l.label}</span></td></tr>`;
        })
        .join("") ||
      '<tr><td colspan="5">Nenhuma mudança de 5 pontos neste período. A referência anterior é mantida enquanto chegam novas leituras.</td></tr>'));
  const n = (o, l) => {
      const c = Math.max(0, Math.min(1e3, ((new Date(o.received_at) - r.from) / (r.to - r.from)) * 1e3)),
        h = 280 - Math.max(0, Math.min(100, Number(o[l]))) * 2.8;
      return `${c.toFixed(2)} ${h.toFixed(2)}`;
    },
    i = state.movementsTruncated
      ? ""
      : buildStablePath(state.movements, state.seed, r.from, r.to, state.stats.last_received_at || t.at(-1)?.received_at),
    a = t.length
      ? t.map((o, l) => `${l ? "L" : "M"}${n(o, "min_percent")}`).join(" ") +
        [...t]
          .reverse()
          .map((o) => `L${n(o, "max_percent")}`)
          .join(" ") +
        " Z"
      : "";
  (($id("historyChart").innerHTML = t.length
    ? `<path class="chart-band" d="${$id("showRawBand").checked ? a : ""}"/><path class="chart-line" d="${i}"/>${t.length === 1 && i ? `<circle cx="${n(t[0], "travel_percent").split(" ")[0]}" cy="${n(t[0], "stable_percent").split(" ")[1]}" r="4" fill="#174f6a"/>` : ""}`
    : ""),
    $id("historyChart").setAttribute(
      "aria-label",
      `${t.length} intervalos. ${fmtNum(state.stats.count || 0, 0)} leituras. Mínimo ${fmtNum(state.stats.min)}%, máximo ${fmtNum(state.stats.max)}%. Arraste para ampliar.`,
    ),
    ($id("historyRows").innerHTML =
      t
        .slice(-30)
        .reverse()
        .map(
          (o) =>
            `<tr><td>${fmtDateTime(o.received_at)}</td><td>${fmtNum(o.stable_percent)} %<small class="raw-average">Bruta: ${fmtNum(o.travel_percent)}%</small></td><td>${fmtNum(o.min_percent)} / ${fmtNum(o.max_percent)} %</td><td>${fmtNum(o.position_mm, 2)} mm</td><td>${fmtNum(o.voltage_v, 3)} V</td><td>${fmtNum(o.samples, 0)}</td></tr>`,
        )
        .join("") || '<tr><td colspan="6">Nenhuma leitura neste período.</td></tr>'));
}
document.querySelectorAll("[data-range]").forEach(
  (t) =>
    (t.onclick = () => {
      ((state.period = t.dataset.range),
        (state.custom = !1),
        document.querySelectorAll("[data-range]").forEach((e) => e.classList.toggle("selected", e === t)),
        loadHistory().catch((e) => showMessage(errorText(e))));
    }),
);
$id("customRange").onsubmit = (t) => {
  t.preventDefault();
  try {
    ((state.range = validateRange($id("fromTime").value, $id("toTime").value)),
      (state.custom = !0),
      document.querySelectorAll("[data-range]").forEach((e) => e.classList.remove("selected")),
      loadHistory().catch((e) => showMessage(errorText(e))));
  } catch (e) {
    showMessage(errorText(e));
  }
};
$id("resetZoom").onclick = () => {
  ((state.custom = !1), loadHistory().catch((t) => showMessage(errorText(t))));
};
$id("historySensor").onchange = () => {
  ((state.sensorId = $id("historySensor").value),
    state.historyRequest++,
    (state.history = []),
    (state.stats = {}),
    renderAll(),
    renderHistory(),
    loadHistory().catch((t) => showMessage(errorText(t))));
};
let chartDragStart = null;
const chartFraction = (t) =>
  Math.max(
    0,
    Math.min(
      1,
      (t.clientX - $id("historyChart").getBoundingClientRect().left) / $id("historyChart").getBoundingClientRect().width,
    ),
  );
$id("historyChart").onpointerdown = (t) => {
  state.history.length && ((chartDragStart = chartFraction(t)), $id("historyChart").setPointerCapture(t.pointerId));
};
$id("historyChart").onpointermove = (t) => {
  const e = chartFraction(t),
    r = state.historyRange || state.range;
  if (chartDragStart !== null) {
    let i = $id("historyChart").querySelector(".chart-selection");
    (i ||
      ((i = document.createElementNS("http://www.w3.org/2000/svg", "rect")),
      i.setAttribute("class", "chart-selection"),
      i.setAttribute("height", "280"),
      $id("historyChart").append(i)),
      i.setAttribute("x", Math.min(e, chartDragStart) * 1e3),
      i.setAttribute("width", Math.abs(e - chartDragStart) * 1e3));
    return;
  }
  const s = r.from.getTime() + e * (r.to - r.from),
    n = state.history.reduce(
      (i, a) => (!i || Math.abs(new Date(a.received_at) - s) < Math.abs(new Date(i.received_at) - s) ? a : i),
      null,
    );
  n &&
    (($id("chartTooltip").hidden = !1),
    ($id("chartTooltip").textContent = `${fmtDateTime(n.received_at)}
Estabilizado ${fmtNum(n.stable_percent)}% · média bruta ${fmtNum(n.travel_percent)}% · mín. ${fmtNum(n.min_percent)}% · máx. ${fmtNum(n.max_percent)}%
${fmtNum(n.samples, 0)} leituras`));
};
$id("historyChart").onpointerleave = () => {
  $id("chartTooltip").hidden = !0;
};
$id("historyChart").onpointercancel = () => {
  ((chartDragStart = null), $id("historyChart").querySelector(".chart-selection")?.remove());
};
$id("historyChart").onpointerup = (t) => {
  if (chartDragStart === null) return;
  const e = chartFraction(t),
    r = chartDragStart;
  if (((chartDragStart = null), $id("historyChart").querySelector(".chart-selection")?.remove(), Math.abs(e - r) < 0.01)) return;
  const s = state.historyRange || state.range,
    n = s.to - s.from;
  try {
    ((state.range = validateRange(
      new Date(s.from.getTime() + Math.min(r, e) * n),
      new Date(s.from.getTime() + Math.max(r, e) * n),
    )),
      (state.custom = !0),
      loadHistory().catch((i) => showMessage(errorText(i))));
  } catch (i) {
    showMessage(errorText(i));
  }
};
$id("exportCsv").onclick = async () => {
  const e = [
    [
      "horario",
      "percentual_estabilizado",
      "media_percentual",
      "min_percentual",
      "max_percentual",
      "posicao_estimada_mm",
      "tensao_estimada_v",
      "leituras",
    ],
    ...state.history.map((r) => [
      r.received_at,
      r.stable_percent,
      r.travel_percent,
      r.min_percent,
      r.max_percent,
      r.position_mm,
      r.voltage_v,
      r.samples,
    ]),
  ].map((r) => r.map(csvCell).join(";")).join(`\r
`);
  try {
    await exportCsvFile(e, `gaxeta-${state.sensorId}-intervalos.csv`);
  } catch (r) {
    showMessage(errorText(r));
  }
};
$id("exportMovements").onclick = async () => {
  if (state.movementsTruncated) {
    showMessage("Reduza o período para exportar todas as mudanças.");
    return;
  }
  const t = [
    ["horario", "percentual_anterior", "percentual_estabilizado", "variacao_pontos", "regra"],
    ...state.movements.map((e) => [
      e.received_at,
      e.previous_percent,
      e.stable_percent,
      e.previous_percent == null ? "" : Number(e.stable_percent) - Number(e.previous_percent),
      e.rule_version,
    ]),
  ].map((e) => e.map(csvCell).join(";")).join(`\r
`);
  try {
    await exportCsvFile(t, `gaxeta-${state.sensorId}-mudancas.csv`);
  } catch (e) {
    showMessage(errorText(e));
  }
};
$id("showRawBand").onchange = renderHistory;
$id("historyEdit").onclick = () => {
  state.sensorId && openSensorEditor(state.sensorId);
};

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

// ----- Cadastro e edição de acesso em três etapas -----
const wizard = { step: 1, userId: null, corp: "", grants: new Map(), names: new Map(), kids: new Map(), open: new Set(), totals: {} };
const KIND_PLURAL = { company: "empresa(s)", area: "área(s)", subarea: "subárea(s)", equipment: "TAG(s)", point: "spot(s)" };
async function openUserWizard({ userId = null } = {}) {
  Object.assign(wizard, { step: 1, userId, corp: "", grants: new Map(), names: new Map(), kids: new Map(), open: new Set(), totals: {} });
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
    for (const grant of detail.grants) {
      wizard.grants.set(grant.asset_id, grant.mode);
      wizard.names.set(grant.asset_id, { name: grant.name, kind: grant.kind, path: (grant.path || []).join(" / ") });
    }
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
// Lê do servidor o efeito das concessões em um nível (prévia do acesso efetivo).
async function loadGrantLevel(parentId) {
  const result = await callRpc("gaxeta_admin_preview_access", { p_corporation_id: wizard.corp, p_grants: grantList(), p_parent_id: parentId || null });
  wizard.kids.set(kidsKey(parentId), result.items);
  for (const item of result.items) wizard.names.set(item.id, { ...wizard.names.get(item.id), name: item.name, kind: item.kind });
  if (!parentId) {
    wizard.totals = result.totals || {};
    wizard.grants = new Map(result.normalized_grants.map((grant) => [grant.asset_id, grant.mode]));
  }
}
async function refreshGrantTree() {
  await loadGrantLevel(null);
  await Promise.all([...wizard.open].map((id) => loadGrantLevel(id)));
  renderGrantTree();
}
function grantBranch(parentId) {
  const items = wizard.kids.get(kidsKey(parentId)) || [];
  return (
    "<ul>" +
    items
      .map((item) => {
        const explicit = wizard.grants.get(item.id) || "";
        const open = wizard.open.has(item.id);
        const stateLabel = { full: "Com acesso", path: "Só caminho", none: "Sem acesso" }[item.state];
        return (
          `<li><div class="grant-row state-${item.state}"><button type="button" class="tree-toggle" data-grant-toggle="${item.id}"${item.has_children ? "" : " disabled"} aria-label="${open ? "Recolher" : "Selecionar dentro de"} ${esc(item.name)}">${item.has_children ? (open ? "▾" : "▸") : ""}</button>` +
          `<span class="grant-name"><small>${KIND_LABEL[item.kind]}</small>${esc(item.tag ? item.name + " · " + item.tag : item.name)}</span><span class="grant-state">${stateLabel}</span>` +
          `<span class="segmented" role="group" aria-label="Concessão para ${esc(item.name)}">` +
          `<button type="button" data-grant="${item.id}" data-mode="all" aria-pressed="${explicit === "all"}">Todos</button>` +
          `<button type="button" data-grant="${item.id}" data-mode="none" aria-pressed="${explicit === "none"}">Nenhum</button>` +
          `<button type="button" data-grant="${item.id}" data-mode="" aria-pressed="${!explicit}" title="Segue o nível acima; abra o ramo para selecionar itens">Herdar</button></span></div>` +
          (open ? grantBranch(item.id) : "") +
          "</li>"
        );
      })
      .join("") +
    "</ul>"
  );
}
function grantSummary() {
  const parts = Object.entries(wizard.totals).filter(([kind]) => KIND_PLURAL[kind]).map(([kind, count]) => `${count} ${KIND_PLURAL[kind]}`);
  return parts.length ? "Acesso efetivo hoje: " + parts.join(", ") + ". Ramos com “Todos” incluem itens futuros." : "Sem acesso efetivo: nenhuma concessão válida.";
}
function renderGrantTree() {
  $id("grantTree").innerHTML = grantBranch(null);
  $id("grantTotals").textContent = grantSummary();
}
$id("grantTree").onclick = async (event) => {
  const toggle = event.target.closest("[data-grant-toggle]");
  const grant = event.target.closest("[data-grant]");
  try {
    if (toggle) {
      const id = toggle.dataset.grantToggle;
      if (wizard.open.has(id)) wizard.open.delete(id);
      else {
        wizard.open.add(id);
        await loadGrantLevel(id);
      }
      renderGrantTree();
    } else if (grant) {
      grant.dataset.mode ? wizard.grants.set(grant.dataset.grant, grant.dataset.mode) : wizard.grants.delete(grant.dataset.grant);
      await refreshGrantTree();
    }
  } catch (error) {
    $id("userFormMessage").textContent = errorText(error);
  }
};
function renderUserReview() {
  const data = wizardData();
  const grants = [...wizard.grants].map(([id, mode]) => {
    const known = wizard.names.get(id) || {};
    return `<li><b>${mode === "all" ? "Todos" : "Nenhum"}</b> em ${esc((KIND_LABEL[known.kind] || "") + " " + (known.name || id))}</li>`;
  });
  $id("userReview").innerHTML =
    `<dl class="detail-fields"><dt>Nome</dt><dd>${esc(data.name)}</dd><dt>Destinatário</dt><dd>${esc(data.email)}</dd><dt>Nível</dt><dd>${ROLE_LABEL[data.role]}</dd>` +
    (data.role === "corp"
      ? `<dt>Corporação</dt><dd>${esc(assetName(data.corp))}</dd><dt>Edição operacional</dt><dd>${data.canWrite ? "Sim: cria áreas, subáreas, TAGs e spots e vincula sensores nos ramos concedidos" : "Não: somente consulta"}</dd></dl>` +
        `<h3>Concessões</h3>${grants.length ? `<ul>${grants.join("")}</ul>` : "<p>Nenhuma concessão: o usuário entra, mas não vê nenhum ramo.</p>"}<p class="grant-totals">${grantSummary()}</p>`
      : `<dt>Alcance</dt><dd>${data.role === "adm3" ? "Consulta e análise em todas as corporações, sem escrita" : "Global, conforme o nível"}</dd></dl>`) +
    (wizard.userId ? "" : `<p class="form-help">O cadastro é gravado antes do envio. Se o e-mail falhar, o convite fica pendente e pode ser reenviado. Se o e-mail já tiver uma conta verificada, ela é vinculada sem novo convite e sem troca de senha.</p>`);
}
$id("userBack").onclick = () => {
  wizard.step = wizard.step === 3 && wizardData().role !== "corp" ? 1 : wizard.step - 1;
  $id("userFormMessage").textContent = "";
  syncWizard();
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
        if (wizard.corp !== data.corp && !wizard.userId) wizard.grants = new Map();
        wizard.corp = data.corp;
        wizard.kids = new Map();
        wizard.open = new Set();
        await refreshGrantTree();
        wizard.step = 2;
      } else {
        renderUserReview();
        wizard.step = 3;
      }
    } else if (wizard.step === 2) {
      await loadGrantLevel(null);
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

// ---- 90-ble-ui.js ----
// Diálogo de Bluetooth (herdado do pacote publicado, com o vínculo passando pelo fluxo autorizado).
function openBleDialog() {
  $id("bleDialog").showModal();
}
function onBleReading(t, e) {
  ((state.bleReading = t),
    (state.bleDevice = e),
    ($id("bleLive").hidden = !1),
    ($id("bleName").textContent = t.device || e?.name || "Sensor"),
    ($id("bleIdentity").textContent = t.sensor_id || "Firmware sem identificação; atualize para configurar."),
    ($id("blePercent").textContent = `${fmtNum(t.travel_percent)} %`),
    ($id("bleVoltage").textContent = `${fmtNum(t.voltage_v, 3)} V`),
    ($id("bleTimestamp").textContent = `Leitura local ${fmtDateTime(new Date())} · sequência ${t.sequence ?? "—"}`));
}
function setBleStatus(t) {
  (($id("bleStatus").textContent = t),
    ($id("disconnectBle").disabled = !bleCurrent()),
    ($id("identifyBle").disabled = !bleCurrent()),
    ($id("linkBle").disabled = !bleCurrent()));
}
$id("openBle").onclick = openBleDialog;
$id("scanBle").onclick = async (t) => {
  await withBusy(t.currentTarget, async () => {
    const e = new Map();
    ($id("bleDevices").replaceChildren(),
      await bleScan((r) => {
        (e.set(r.deviceId, r),
          ($id("bleDevices").innerHTML = [...e.values()]
            .map(
              (s) =>
                `<button class="ble-device" data-ble="${esc(s.deviceId)}"><span><strong>${esc(s.name || s.localName || "Sensor Gaxeta")}</strong><small>${esc(s.deviceId)} ${s.rssi == null ? "" : `· ${s.rssi} dBm`}</small></span>Conectar →</button>`,
            )
            .join("")));
      }, setBleStatus));
  });
};
$id("bleDevices").onclick = async (t) => {
  const e = t.target.closest("[data-ble]");
  if (e)
    try {
      await bleConnect(
        {
          deviceId: e.dataset.ble,
          name: e.querySelector("strong").textContent,
        },
        onBleReading,
        setBleStatus,
      );
    } catch (r) {
      setBleStatus(errorText(r));
    }
};
$id("disconnectBle").onclick = () => bleDisconnect();
$id("bleDialog").addEventListener("close", () => bleStopScan());
$id("identifyBle").onclick = async (t) => {
  await withBusy(t.currentTarget, async () => {
    (await bleIdentify(), setBleStatus("Comando enviado. Observe o LED do sensor por 10 segundos."));
  });
};
// O sensor detectado por Bluetooth só identifica o equipamento e abre o fluxo
// autorizado da plataforma; o vínculo ao spot é decidido no servidor.
$id("linkBle").onclick = async () => {
  const sensorId = state.bleReading?.sensor_id;
  if (!sensorId) return setBleStatus("Atualize o firmware para identificar o sensor por ID.");
  try {
    const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: [sensorId] });
    if (!result.devices.length)
      return setBleStatus("Sensor identificado, mas ainda não disponível para a sua conta. Ele aparece após a primeira transmissão; a primeira associação é feita por um administrador.");
    mergeDevices(result.devices);
    $id("bleDialog").close();
    showPage("sensors");
    openDrawer(sensorId, canEditDevice(result.devices[0]) ? "edit" : "detail");
  } catch (error) {
    setBleStatus(errorText(error));
  }
};

// ---- 95-boot.js ----
// =============================================================================
// Inicialização: liga a navegação e os eventos globais. O painel só abre por
// enterApp(), chamado a partir de uma ação explícita de quem está usando.
// =============================================================================
document.querySelectorAll("[data-glyph]").forEach((slot) => (slot.innerHTML = glyph(slot.dataset.glyph)));
document.querySelectorAll("[data-page]").forEach((button) => (button.onclick = () => showPage(button.dataset.page)));
document.querySelectorAll("[data-close]").forEach((button) => (button.onclick = () => $id(button.dataset.close).close()));
$id("refresh").onclick = () => refreshData(true);
$id("pageActions").onclick = (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "find-sensor") openBleDialog();
  if (action === "new-corporation") openAssetForm({ parentId: null });
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
// Fora do fluxo síncrono do SDK, para não bloquear a renovação do token.
sb.auth.onAuthStateChange((event, session) => setTimeout(() => onAuthEvent(event, session), 0));
renderIcons();

// ---- 99-exports.js ----
export{Zt as E,ir as W,Va as b,hs as h,bo as m,Eo as t,_o as w};
