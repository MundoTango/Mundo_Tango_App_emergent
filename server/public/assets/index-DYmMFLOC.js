import{v as m,r as o}from"./index-DGIM1dnE.js";import{g as v}from"./ScrollTrigger-lnFyu4_T.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=m("Bed",[["path",{d:"M2 4v16",key:"vw9hq8"}],["path",{d:"M2 8h18a2 2 0 0 1 2 2v10",key:"1dgv2r"}],["path",{d:"M2 17h20",key:"18nfp3"}],["path",{d:"M6 8v9",key:"1yriud"}]]);/*!
 * @gsap/react 2.1.2
 * https://gsap.com
 *
 * Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/let c=typeof document<"u"?o.useLayoutEffect:o.useEffect,a=e=>e&&!Array.isArray(e)&&typeof e=="object",u=[],x={},p=v;const d=(e,t=u)=>{let r=x;a(e)?(r=e,e=null,t="dependencies"in r?r.dependencies:u):a(t)&&(r=t,t="dependencies"in r?r.dependencies:u),e&&typeof e!="function"&&console.warn("First parameter must be a function or config object");const{scope:f,revertOnUpdate:y}=r,s=o.useRef(!1),n=o.useRef(p.context(()=>{},f)),h=o.useRef(g=>n.current.add(null,g)),i=t&&t.length&&!y;return i&&c(()=>(s.current=!0,()=>n.current.revert()),u),c(()=>{if(e&&n.current.add(e,f),!i||!s.current)return()=>n.current.revert()},t),{context:n.current,contextSafe:h.current}};d.register=e=>{p=e};d.headless=!0;export{C as B,d as u};
//# sourceMappingURL=index-DYmMFLOC.js.map
