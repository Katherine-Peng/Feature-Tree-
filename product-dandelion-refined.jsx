import { useState, useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";

var MONTHS=["2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03"];
var ML=["Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26"];
var CATS=["Backend","Frontend","AI/ML","Research","DevOps"];
var STL={complete:"Complete",in_progress:"In Progress",not_started:"Not Started"};
var FLAT=[
{id:"kh",p:null,n:"Knowledge Hubs",lv:1,s:"in_progress",cat:["Frontend","AI/ML"],d:"2025-09",e:8},
{id:"kh-doc",p:"kh",n:"Document Ingestion",lv:2,s:"complete",cat:["Backend"],d:"2025-09",e:5},
{id:"kh-doc-pdf",p:"kh-doc",n:"PDF Parser",lv:3,s:"complete",cat:["Backend"],d:"2025-09",e:3},
{id:"kh-doc-ocr",p:"kh-doc",n:"OCR Pipeline",lv:3,s:"complete",cat:["AI/ML"],d:"2025-10",e:5},
{id:"kh-llm",p:"kh",n:"LLM Query Engine",lv:2,s:"in_progress",cat:["AI/ML"],d:"2025-09",e:8},
{id:"kh-llm-rag",p:"kh-llm",n:"RAG Pipeline",lv:3,s:"in_progress",cat:["AI/ML","Backend"],d:"2025-10",e:8},
{id:"kh-llm-ctx",p:"kh-llm",n:"Context Window",lv:3,s:"not_started",cat:["AI/ML"],d:"2026-02",e:5},
{id:"kh-cite",p:"kh",n:"Citation System",lv:2,s:"in_progress",cat:["Frontend","AI/ML"],d:"2025-10",e:5},
{id:"kh-ui",p:"kh",n:"Hub Browser UI",lv:2,s:"complete",cat:["Frontend"],d:"2025-09",e:5},
{id:"ep",p:null,n:"Evidence Pack",lv:1,s:"in_progress",cat:["Frontend","AI/ML"],d:"2025-09",e:8},
{id:"ep-show",p:"ep",n:"Source Display",lv:2,s:"complete",cat:["Frontend"],d:"2025-09",e:3},
{id:"ep-prove",p:"ep",n:"Confidence Layer",lv:2,s:"in_progress",cat:["AI/ML"],d:"2025-10",e:5},
{id:"ep-ps",p:"ep-prove",n:"Scoring Model",lv:3,s:"in_progress",cat:["AI/ML"],d:"2025-10",e:5},
{id:"ep-pv",p:"ep-prove",n:"Score Viz",lv:3,s:"not_started",cat:["Frontend"],d:"2026-01",e:3},
{id:"ep-admit",p:"ep",n:"Uncertainty Layer",lv:2,s:"not_started",cat:["AI/ML","Frontend"],d:"2025-11",e:5},
{id:"ep-rem",p:"ep",n:"Audit Trail",lv:2,s:"not_started",cat:["Backend"],d:"2025-11",e:5},
{id:"ep-log",p:"ep-rem",n:"Audit Storage",lv:3,s:"not_started",cat:["Backend","DevOps"],d:"2026-03",e:3},
{id:"sd",p:null,n:"Search & Discovery",lv:1,s:"in_progress",cat:["Backend","AI/ML"],d:"2025-09",e:8},
{id:"sd-sem",p:"sd",n:"Semantic Search",lv:2,s:"complete",cat:["AI/ML","Backend"],d:"2025-09",e:8},
{id:"sd-fil",p:"sd",n:"Faceted Filters",lv:2,s:"complete",cat:["Frontend","Backend"],d:"2025-10",e:3},
{id:"sd-rec",p:"sd",n:"Recommendations",lv:2,s:"in_progress",cat:["AI/ML"],d:"2025-12",e:5},
{id:"sd-cf",p:"sd-rec",n:"Collab Filtering",lv:3,s:"in_progress",cat:["AI/ML"],d:"2025-12",e:5},
{id:"sd-rw",p:"sd-rec",n:"Rec Widget",lv:3,s:"not_started",cat:["Frontend"],d:"2026-02",e:2},
{id:"um",p:null,n:"User Management",lv:1,s:"complete",cat:["Backend","Frontend"],d:"2025-09",e:5},
{id:"um-auth",p:"um",n:"Auth & SSO",lv:2,s:"complete",cat:["Backend"],d:"2025-09",e:5},
{id:"um-role",p:"um",n:"Role Access",lv:2,s:"complete",cat:["Backend"],d:"2025-09",e:3},
{id:"um-prof",p:"um",n:"User Profiles",lv:2,s:"complete",cat:["Frontend"],d:"2025-10",e:2},
{id:"um-team",p:"um",n:"Team Spaces",lv:2,s:"in_progress",cat:["Backend","Frontend"],d:"2026-01",e:5},
{id:"an",p:null,n:"Analytics",lv:1,s:"in_progress",cat:["Frontend","Backend"],d:"2025-09",e:8},
{id:"an-use",p:"an",n:"Usage Metrics",lv:2,s:"complete",cat:["Backend"],d:"2025-09",e:3},
{id:"an-eng",p:"an",n:"Engagement",lv:2,s:"complete",cat:["Backend","Frontend"],d:"2025-10",e:3},
{id:"an-rep",p:"an",n:"Report Builder",lv:2,s:"in_progress",cat:["Frontend"],d:"2025-11",e:5},
{id:"an-tmpl",p:"an-rep",n:"Templates",lv:3,s:"in_progress",cat:["Frontend"],d:"2025-12",e:3},
{id:"an-exp",p:"an-rep",n:"PDF/CSV Export",lv:3,s:"not_started",cat:["Backend"],d:"2026-01",e:2},
{id:"an-ai",p:"an",n:"AI Insights",lv:2,s:"not_started",cat:["AI/ML"],d:"2026-03",e:8},
{id:"api",p:null,n:"API Gateway",lv:1,s:"complete",cat:["Backend","DevOps"],d:"2025-09",e:5},
{id:"api-r",p:"api",n:"REST API",lv:2,s:"complete",cat:["Backend"],d:"2025-09",e:5},
{id:"api-rl",p:"api",n:"Rate Limiting",lv:2,s:"complete",cat:["Backend","DevOps"],d:"2025-10",e:3},
{id:"api-v",p:"api",n:"Versioning",lv:2,s:"complete",cat:["Backend"],d:"2025-11",e:2},
{id:"api-gql",p:"api",n:"GraphQL",lv:2,s:"in_progress",cat:["Backend"],d:"2026-02",e:5},
{id:"cg",p:null,n:"Content Gen",lv:1,s:"in_progress",cat:["AI/ML","Frontend"],d:"2025-09",e:8},
{id:"cg-tmpl",p:"cg",n:"Template Engine",lv:2,s:"complete",cat:["Backend","Frontend"],d:"2025-09",e:5},
{id:"cg-dr",p:"cg",n:"AI Drafting",lv:2,s:"in_progress",cat:["AI/ML"],d:"2025-10",e:8},
{id:"cg-med",p:"cg-dr",n:"Medical Writing",lv:3,s:"in_progress",cat:["AI/ML","Research"],d:"2025-11",e:8},
{id:"cg-gen",p:"cg-dr",n:"General Writing",lv:3,s:"complete",cat:["AI/ML"],d:"2025-10",e:3},
{id:"cg-rev",p:"cg",n:"Review Flows",lv:2,s:"not_started",cat:["Frontend","Backend"],d:"2026-01",e:5},
{id:"wf",p:null,n:"Workflows",lv:1,s:"in_progress",cat:["Backend"],d:"2025-10",e:5},
{id:"wf-app",p:"wf",n:"Approvals",lv:2,s:"in_progress",cat:["Backend","Frontend"],d:"2025-10",e:5},
{id:"wf-not",p:"wf",n:"Notifications",lv:2,s:"complete",cat:["Backend"],d:"2025-10",e:2},
{id:"wf-sch",p:"wf",n:"Scheduled Tasks",lv:2,s:"not_started",cat:["Backend","DevOps"],d:"2025-12",e:3},
{id:"wf-ag",p:"wf",n:"Agent Orchestration",lv:2,s:"not_started",cat:["AI/ML","Backend"],d:"2026-03",e:8},
{id:"ce",p:null,n:"Compliance",lv:1,s:"in_progress",cat:["Backend","Research"],d:"2025-10",e:8},
{id:"ce-mlr",p:"ce",n:"MLR Review",lv:2,s:"in_progress",cat:["Frontend","Research"],d:"2025-10",e:8},
{id:"ce-rul",p:"ce-mlr",n:"Rule Engine",lv:3,s:"complete",cat:["Backend"],d:"2025-10",e:5},
{id:"ce-ui",p:"ce-mlr",n:"Review UI",lv:3,s:"in_progress",cat:["Frontend"],d:"2025-11",e:5},
{id:"ce-aud",p:"ce",n:"Audit Trail",lv:2,s:"complete",cat:["Backend"],d:"2025-10",e:3},
{id:"ce-reg",p:"ce",n:"Reg Updates",lv:2,s:"not_started",cat:["Research","Backend"],d:"2026-01",e:5},
{id:"pi",p:null,n:"Infrastructure",lv:1,s:"in_progress",cat:["DevOps","Backend"],d:"2025-09",e:8},
{id:"pi-ci",p:"pi",n:"CI/CD Pipeline",lv:2,s:"complete",cat:["DevOps"],d:"2025-09",e:5},
{id:"pi-mon",p:"pi",n:"Monitoring",lv:2,s:"complete",cat:["DevOps"],d:"2025-09",e:3},
{id:"pi-sc",p:"pi",n:"Auto-Scaling",lv:2,s:"in_progress",cat:["DevOps","Backend"],d:"2025-11",e:5},
{id:"pi-gpu",p:"pi-sc",n:"GPU Allocation",lv:3,s:"not_started",cat:["DevOps","AI/ML"],d:"2026-02",e:5},
{id:"pi-dr",p:"pi",n:"Disaster Recovery",lv:2,s:"not_started",cat:["DevOps"],d:"2026-03",e:5},
];

function getVis(mi,cats){var c=MONTHS[mi];var it=FLAT.filter(function(d){return d.d<=c;});if(cats.length<CATS.length)it=it.filter(function(d){return d.cat.some(function(x){return cats.includes(x);});});return it;}
function bTree(items){var root={id:"root",n:"Platform",lv:0,s:"in_progress",cat:[],d:"2025-09",e:0,children:[]};var m={root:root};items.forEach(function(d){m[d.id]=Object.assign({},d,{children:[]});});items.forEach(function(d){var pid=d.p||"root";if(m[pid])m[pid].children.push(m[d.id]);});root.children=root.children.filter(function(c){return c.lv===1;});return root;}
function gStats(items){var t=items.length,c=items.filter(function(d){return d.s==="complete";}).length;var ip=items.filter(function(d){return d.s==="in_progress";}).length;var te=items.reduce(function(s,d){return s+d.e;},0);var ce=items.filter(function(d){return d.s==="complete";}).reduce(function(s,d){return s+d.e;},0);var cb={};CATS.forEach(function(cat){cb[cat]=items.filter(function(d){return d.cat.includes(cat);}).reduce(function(s,d){return s+d.e;},0);});return{total:t,comp:c,ip:ip,ns:t-c-ip,te:te,ce:ce,cb:cb};}

var TD="#0d4d3d",TL="#1a6b5a",TK="#1a4a40",CO="#e8a87c",CD="#d4845a",AQ="#b5e8e0",AC="#8dd8cc",AG="#d0ece8",CR="#f5f2e8",CRD="#e8e2d4";
var PINK="#f3c8cf",PINKD="#e89aa6"; // "new feature" bloom

// ─── Demo metadata (owners, descriptions) ──────────────────────────────
var OWNERS=["S. Chen","M. Rivera","A. Patel","K. Ono","L. Müller","J. Brown","N. Singh","R. Kowalski","P. Volkov","E. Tanaka","D. Ferreira","H. Yamamoto"];
var DESC_TEMPLATES={
  Backend:"Server-side implementation including API contracts, data layer, and integration with downstream services.",
  Frontend:"User-facing interface with responsive layout, accessibility considerations, and tight integration with the component system.",
  "AI/ML":"Model pipeline and inference flow, including training data preparation, evaluation harness, and production rollout.",
  Research:"Discovery and validation work — user interviews, prior-art review, and scoped prototypes to de-risk the approach.",
  DevOps:"Infrastructure and tooling — provisioning, CI/CD wiring, observability, and operational runbook.",
};
function hashId(id){var h=0;for(var i=0;i<id.length;i++){h=((h*31)+id.charCodeAt(i))|0;}return Math.abs(h);}
function ownerOf(id){return OWNERS[hashId(id)%OWNERS.length];}
function descOf(d){var primary=d.cat[0]||"Backend";var base=DESC_TEMPLATES[primary]||DESC_TEMPLATES.Backend;return base+" Spans "+d.e+" estimated points, scheduled around "+d.d+".";}
function fmtMonth(ym){var parts=ym.split("-");var m=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return m[parseInt(parts[1],10)-1]+" "+parts[0].slice(2);}
function hj(id,seed){var h=0;for(var i=0;i<id.length;i++){h=((h*31)+id.charCodeAt(i))|0;}return((Math.sin(h+seed)*10000)%1+1)%1;}
function leafR(e){return Math.max(4,Math.min(35,3+e*3.8));}

var ACCENTS=[];for(var ai=0;ai<60;ai++){ACCENTS.push({ox:(Math.random()-0.5)*40,oy:(Math.random()-0.5)*40,r:Math.random()*1.8+0.6,isCoral:Math.random()>0.45,op:Math.random()*0.35+0.15});}

// ─── SIMULATION ─────────────────────────────────────────────────────────
function DandelionSim(props){
  var items=props.items,mi=props.mi,hl=props.hl,hov=props.hov,setHov=props.setHov;
  var selBranch=props.selBranch,setSelBranch=props.setSelBranch;
  var onPick=props.onPick,selFeature=props.selFeature;
  var data=useMemo(function(){return bTree(items);},[items]);
  var cm=MONTHS[mi];var W=920,H=880,CX=460,BY=830;

  var layout=useMemo(function(){
    var root=d3.hierarchy(data);var sr=165*Math.PI/180;
    d3.tree().size([sr,300]).separation(function(a,b){return(a.parent===b.parent?1:1.5)/Math.max(1,a.depth*0.7);})(root);
    var nds=[],lks=[],idxMap={};
    root.each(function(n){var idx=nds.length;idxMap[n.data.id]=idx;
      if(n.depth===0){nds.push({id:n.data.id,data:n.data,depth:0,rx:CX,ry:BY,parentIdx:-1,childIdxs:[]});}
      else{
        var a=n.x-sr/2+Math.PI*1.5;
        var br=n.depth===1?145:(n.depth===2?255:330);
        var r=br+Math.sin(n.x*3)*12;
        // Tighter clustering jitter for leaves
        var jx=0,jy=0;
        if(n.depth>=2){jx=(hj(n.data.id,1)-0.5)*22;jy=(hj(n.data.id,2)-0.5)*22;}
        // Constrain children within tighter fan: pull toward parent's angle
        if(n.depth>=2&&n.parent){
          var parentAngle=n.parent.x-sr/2+Math.PI*1.5;
          var myAngle=a;
          var diff=myAngle-parentAngle;
          // Clamp fan to ~45 degrees (0.4 rad each side)
          if(diff>0.4)a=parentAngle+0.4+(diff-0.4)*0.15;
          if(diff<-0.4)a=parentAngle-0.4+(diff+0.4)*0.15;
        }
        nds.push({id:n.data.id,data:n.data,depth:n.depth,rx:CX+r*Math.cos(a)+jx,ry:BY-20+r*Math.sin(a)+jy,parentIdx:-1,childIdxs:[]});
      }
    });
    root.each(function(n){var idx=idxMap[n.data.id];if(n.parent){var pidx=idxMap[n.parent.data.id];nds[idx].parentIdx=pidx;nds[pidx].childIdxs.push(idx);lks.push({source:pidx,target:idx});}});
    return{nodes:nds,links:lks,idxMap:idxMap};
  },[data]);

  var sim=useRef(null);var dragRef=useRef({on:false,idx:-1,tx:0,ty:0});var svgRef=useRef(null);var frameRef=useRef(0);
  var layoutRef=useRef(null);
  var particleMapRef=useRef({});
  var tickState=useState(0);var setTick=tickState[1];

  // Sync sim particles with layout — preserve existing particle state across layout changes
  // so the simulation can ease nodes into new positions instead of teleporting them.
  useMemo(function(){
    layoutRef.current=layout;
    dragRef.current={on:false,idx:-1,tx:0,ty:0};
    var prevMap=particleMapRef.current;
    var nextMap={};
    var pp=[];
    // First pass: place existing nodes (need them so new children can spawn at parent pos)
    for(var pi=0;pi<layout.nodes.length;pi++){
      var pn=layout.nodes[pi];
      var prev=prevMap[pn.id];
      if(prev){
        // Keep current x/y/vx/vy; just retarget rest position. Physics will glide it.
        prev.rx=pn.rx;prev.ry=pn.ry;prev.pinned=pn.depth===0;
        prev.scale=1;
        pp.push(prev);
        nextMap[pn.id]=prev;
      }else{
        pp.push(null); // placeholder, filled in pass 2
      }
    }
    // Second pass: new nodes spawn near parent's current position with scale 0 (grow-in).
    // Slight random offset (12-24px) prevents siblings from co-locating, which would
    // otherwise cause the repulsion force (800/r²) to explode and fling nodes off-screen.
    for(var pj=0;pj<layout.nodes.length;pj++){
      if(pp[pj])continue;
      var nn=layout.nodes[pj];
      var spawnX=nn.rx,spawnY=nn.ry;
      if(nn.parentIdx>=0&&pp[nn.parentIdx]){
        var jitterAngle=Math.random()*Math.PI*2;
        var jitterDist=12+Math.random()*12;
        spawnX=pp[nn.parentIdx].x+Math.cos(jitterAngle)*jitterDist;
        spawnY=pp[nn.parentIdx].y+Math.sin(jitterAngle)*jitterDist;
      }
      var newP={id:nn.id,x:spawnX,y:spawnY,vx:0,vy:0,rx:nn.rx,ry:nn.ry,pinned:nn.depth===0,scale:0};
      pp[pj]=newP;
      nextMap[nn.id]=newP;
    }
    particleMapRef.current=nextMap;
    sim.current=pp;
  },[layout]);

  useEffect(function(){
    var running=true;var tick=0;
    function step(){
      if(!running)return;
      var P=sim.current;
      var L=layoutRef.current;
      if(!P||!L||P.length!==L.nodes.length){frameRef.current=requestAnimationFrame(step);return;}
      var N=P.length;var nds=L.nodes;var lks=L.links;
      for(var i=0;i<N;i++){P[i].fx=0;P[i].fy=0;}
      for(var li=0;li<lks.length;li++){var s=lks[li].source,t=lks[li].target;if(s>=N||t>=N)continue;var dx=P[t].x-P[s].x,dy=P[t].y-P[s].y;var dist=Math.sqrt(dx*dx+dy*dy)||0.1;var rdx=nds[t].rx-nds[s].rx,rdy=nds[t].ry-nds[s].ry;var rl=Math.sqrt(rdx*rdx+rdy*rdy);var disp=dist-rl;var fx=0.012*disp*(dx/dist);var fy=0.012*disp*(dy/dist);P[s].fx+=fx;P[s].fy+=fy;P[t].fx-=fx;P[t].fy-=fy;}
      // Repulsion with safeguards: floor min distance to 6px and cap force magnitude
      // to prevent runaway acceleration when particles overlap.
      for(var a=1;a<N;a++){for(var b=a+1;b<N;b++){var rx=P[b].x-P[a].x,ry=P[b].y-P[a].y;var r2=rx*rx+ry*ry;if(r2>160000)continue;var rd=Math.sqrt(r2);if(rd<6)rd=6;var rf=800/(rd*rd);if(rf>22)rf=22;var rfx=rf*(rx/rd),rfy=rf*(ry/rd);P[a].fx-=rfx;P[a].fy-=rfy;P[b].fx+=rfx;P[b].fy+=rfy;}}
      for(var ci=0;ci<N;ci++){P[ci].fx+=0.003*(P[ci].rx-P[ci].x);P[ci].fy+=0.003*(P[ci].ry-P[ci].y);}
      if(dragRef.current.on&&dragRef.current.idx>=0&&dragRef.current.idx<N){var di=dragRef.current.idx;P[di].vx=(dragRef.current.tx-P[di].x)*0.35;P[di].vy=(dragRef.current.ty-P[di].y)*0.35;P[di].fx=0;P[di].fy=0;}
      // Velocity update with per-frame cap (10 px) so no single force pulse can fling a node.
      for(var ui=0;ui<N;ui++){if(P[ui].scale===undefined)P[ui].scale=1;if(P[ui].scale<1){P[ui].scale=Math.min(1,P[ui].scale+0.06);}if(P[ui].pinned){P[ui].vx=0;P[ui].vy=0;continue;}if(dragRef.current.on&&dragRef.current.idx===ui){P[ui].x+=P[ui].vx;P[ui].y+=P[ui].vy;continue;}P[ui].vx=(P[ui].vx+P[ui].fx)*0.88;P[ui].vy=(P[ui].vy+P[ui].fy)*0.88;if(P[ui].vx>10)P[ui].vx=10;else if(P[ui].vx<-10)P[ui].vx=-10;if(P[ui].vy>10)P[ui].vy=10;else if(P[ui].vy<-10)P[ui].vy=-10;P[ui].x+=P[ui].vx;P[ui].y+=P[ui].vy;}
      tick++;setTick(tick);frameRef.current=requestAnimationFrame(step);
    }
    frameRef.current=requestAnimationFrame(step);
    return function(){running=false;cancelAnimationFrame(frameRef.current);};
  },[]);

  function svgPt(e){var svg=svgRef.current;if(!svg)return{x:e.clientX,y:e.clientY};var pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var ctm=svg.getScreenCTM();if(!ctm)return{x:e.clientX,y:e.clientY};return pt.matrixTransform(ctm.inverse());}
  function onDown(e,idx){if(idx===0)return;e.stopPropagation();e.preventDefault();var pt=svgPt(e);dragRef.current={on:true,idx:idx,tx:pt.x,ty:pt.y,sx:pt.x,sy:pt.y,moved:false};try{e.currentTarget.setPointerCapture(e.pointerId);}catch(err){}}
  function onMove(e){if(!dragRef.current.on)return;var pt=svgPt(e);dragRef.current.tx=pt.x;dragRef.current.ty=pt.y;var ddx=pt.x-dragRef.current.sx,ddy=pt.y-dragRef.current.sy;if(ddx*ddx+ddy*ddy>16)dragRef.current.moved=true;}
  function onUp(){if(dragRef.current.on&&!dragRef.current.moved&&dragRef.current.idx>=0&&onPick){var nd=layoutRef.current&&layoutRef.current.nodes[dragRef.current.idx];if(nd)onPick(nd.id);}dragRef.current.on=false;dragRef.current.idx=-1;}
  var resetRef=props.resetRef;
  useEffect(function(){if(resetRef)resetRef.current=function(){if(!sim.current)return;for(var i=0;i<sim.current.length;i++){sim.current[i].x=sim.current[i].rx;sim.current[i].y=sim.current[i].ry;sim.current[i].vx=0;sim.current[i].vy=0;}};});

  var nds=layout.nodes,lks=layout.links;
  var P=sim.current;if(!P||!nds||P.length!==nds.length)return null;
  var hovIdx=(hov&&layout.idxMap[hov]!==undefined)?layout.idxMap[hov]:-1;
  function isConn(idx){if(hovIdx<0)return true;if(idx===hovIdx)return true;var nd=nds[idx];if(!nd)return false;if(nd.parentIdx===hovIdx)return true;for(var c=0;c<nd.childIdxs.length;c++){if(nd.childIdxs[c]===hovIdx)return true;}return false;}
  function gOp(idx){var nd=nds[idx];if(!nd)return 0;if(hl&&nd.data.d!==cm&&nd.depth>0)return 0.18;if(selBranch){var ch=idx;while(ch>=0&&nds[ch]){if(nds[ch].id===selBranch)return 1;ch=nds[ch].parentIdx;}return 0.12;}return 1;}
  function nOp(idx){var b=gOp(idx);if(!hov)return b;if(isConn(idx))return b;return b*0.25;}
  function lOp(s,t){var b=Math.min(gOp(s),gOp(t));if(!hov)return b;if(s===hovIdx||t===hovIdx)return b;return b*0.2;}
  var isDragging=dragRef.current.on;var hCards=[];

  return(
    <svg ref={svgRef} viewBox={"0 0 "+W+" "+H} style={{width:"100%",overflow:"visible"}} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      <defs>
        <linearGradient id="stg" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={TD} stopOpacity="0.95"/><stop offset="50%" stopColor={TL} stopOpacity="0.8"/><stop offset="100%" stopColor={TL} stopOpacity="0.5"/></linearGradient>
        <radialGradient id="aqg"><stop offset="0%" stopColor={AQ} stopOpacity="0.5"/><stop offset="50%" stopColor={AQ} stopOpacity="0.35"/><stop offset="85%" stopColor="#8cccc0" stopOpacity="0.2"/><stop offset="100%" stopColor="#6bb8ac" stopOpacity="0.1"/></radialGradient>
        <radialGradient id="acg"><stop offset="0%" stopColor={AC} stopOpacity="0.55"/><stop offset="50%" stopColor={AC} stopOpacity="0.4"/><stop offset="85%" stopColor="#6cc0b0" stopOpacity="0.22"/><stop offset="100%" stopColor="#50a898" stopOpacity="0.1"/></radialGradient>
        <radialGradient id="ghg"><stop offset="0%" stopColor={AG} stopOpacity="0.4"/><stop offset="55%" stopColor={AG} stopOpacity="0.25"/><stop offset="85%" stopColor="#b0d8d0" stopOpacity="0.15"/><stop offset="100%" stopColor="#90c0b8" stopOpacity="0.06"/></radialGradient>
        <radialGradient id="bloom"><stop offset="0%" stopColor={PINK} stopOpacity="0.7"/><stop offset="55%" stopColor={PINK} stopOpacity="0.35"/><stop offset="100%" stopColor={PINKD} stopOpacity="0"/></radialGradient>
        <filter id="wc"><feGaussianBlur stdDeviation="1.5"/></filter>
      </defs>

      {/* Stem */}
      <path d={"M"+CX+","+(H+10)+" C"+(CX-3)+","+(BY+40)+" "+(CX+2)+","+(BY+15)+" "+P[0].x+","+P[0].y} stroke="url(#stg)" strokeWidth={5.5} fill="none" strokeLinecap="round" opacity={hov?0.45:0.9}/>

      {/* Primary branches root→T1 */}
      {lks.filter(function(l){return nds[l.source]&&nds[l.source].depth===0;}).map(function(l,i){
        if(!P[l.source]||!P[l.target])return null;
        var sx=P[l.source].x,sy=P[l.source].y,tx=P[l.target].x,ty=P[l.target].y;var lo=lOp(l.source,l.target);
        var mx=sx+(tx-sx)*0.25,my=sy+(ty-sy)*0.6;
        return <path key={"p"+i} d={"M"+sx+","+sy+" C"+mx+","+my+" "+(sx+(tx-sx)*0.65)+","+(sy+(ty-sy)*0.88)+" "+tx+","+ty} fill="none" stroke={TL} strokeWidth={2.8} opacity={lo*0.65} strokeLinecap="round"/>;
      })}

      {/* Secondary branches — coral, fanning beziers with tighter arc */}
      {lks.filter(function(l){return nds[l.source]&&nds[l.source].depth>0;}).map(function(l,i){
        if(!P[l.source]||!P[l.target])return null;
        var sx=P[l.source].x,sy=P[l.source].y,tx=P[l.target].x,ty=P[l.target].y;
        var lo=lOp(l.source,l.target);var isHL=hovIdx>=0&&(l.source===hovIdx||l.target===hovIdx);
        var dx=tx-sx,dy=ty-sy,len=Math.sqrt(dx*dx+dy*dy)||1;
        var bow=(hj(nds[l.target].id,7)-0.5)*14;
        var nx=-dy/len,ny=dx/len;
        var cpx=sx+dx*0.45+nx*bow,cpy=sy+dy*0.45+ny*bow;
        var lineOp=0.35+hj(nds[l.target].id,3)*0.25;
        var sw=nds[l.source].depth===1?1.2:0.7;if(isHL)sw=sw*2;
        return <path key={"s"+i} d={"M"+sx+","+sy+" Q"+cpx+","+cpy+" "+tx+","+ty} fill="none" stroke={CO} strokeWidth={sw} opacity={lo*lineOp*(isHL?2:1)} strokeLinecap="round"/>;
      })}

      {/* Accent dots */}
      {nds.filter(function(nd){return nd.depth>=2;}).map(function(nd,idx){
        var ni=layout.idxMap[nd.id];if(!P[ni])return null;var px=P[ni].x,py=P[ni].y;var op=gOp(ni);if(op<0.3)return null;
        var sc=P[ni].scale===undefined?1:P[ni].scale;if(sc<0.15)return null;
        var count=Math.floor(hj(nd.id,9)*2.5);var dots=[];
        for(var di=0;di<count;di++){var acc=ACCENTS[(idx*3+di)%ACCENTS.length];dots.push(<circle key={nd.id+"-a"+di} cx={px+acc.ox*(0.8+di*0.3)*sc} cy={py+acc.oy*(0.8+di*0.3)*sc} r={acc.r*sc} fill={acc.isCoral?CO:TL} opacity={acc.op*op*0.7*sc}/>);}
        return <g key={"acc-"+nd.id}>{dots}</g>;
      })}

      {/* Pink "new this month" bloom — sits behind nodes added in the current month */}
      {nds.map(function(nd,idx){
        if(nd.depth<1||!P[idx])return null;
        if(nd.data.d!==cm)return null;
        var sc=P[idx].scale===undefined?1:P[idx].scale;if(sc<0.2)return null;
        var op=gOp(idx);if(op<0.25)return null;
        var baseR=nd.depth===1?14:(nd.childIdxs.length>0?12:Math.max(leafR(nd.data.e),10));
        var bloomR=baseR*2.2*sc;
        return <circle key={"bloom-"+nd.id} cx={P[idx].x} cy={P[idx].y} r={bloomR} fill="url(#bloom)" opacity={op*0.9} style={{pointerEvents:"none"}}/>;
      })}

      {/* T1 nodes — small coral dots + labels */}
      {nds.map(function(nd,idx){
        if(nd.depth!==1||!P[idx])return null;
        var px=P[idx].x,py=P[idx].y;var op=nOp(idx);var isH=hovIdx===idx;var isDH=isDragging&&dragRef.current.idx===idx;
        var sc=P[idx].scale===undefined?1:P[idx].scale;
        var pIdx=nd.parentIdx;if(!P[pIdx])return null;var angle=Math.atan2(py-P[pIdx].y,px-P[pIdx].x);var deg=angle*180/Math.PI;
        var lDist=isH?16:12;var lx=px+Math.cos(angle)*lDist,ly=py+Math.sin(angle)*lDist;
        var textRot=deg;var anc="start";if(deg>90||deg<-90){textRot=deg+180;anc="end";}
        return(<g key={"t1-"+nd.id} opacity={op*sc} style={{cursor:isDH?"grabbing":"grab"}}
          onPointerDown={function(e){onDown(e,idx);}} onMouseEnter={function(){if(!isDragging)setHov(nd.id);}} onMouseLeave={function(){if(!isDragging)setHov(null);}}>
          <circle cx={px} cy={py} r={(isH?5:3.5)*sc} fill={CD} opacity={0.85} stroke="none"/>
          <circle cx={px-0.8} cy={py-0.8} r={1.2*sc} fill="#f0c8a8" opacity={0.5}/>
          {op>0.15&&sc>0.4&&<text x={lx} y={ly} textAnchor={anc} dominantBaseline="middle" transform={"rotate("+textRot+","+lx+","+ly+")"} fontSize={isH?10.5:9} fontWeight={600} fill={TK} opacity={(isH?1:0.65)*sc} style={{pointerEvents:"none",fontFamily:"'DM Sans',sans-serif"}}>{nd.data.n}</text>}
        </g>);
      })}

      {/* T2 nodes — coral dot if branching, aqua leaf if terminal + LABELS */}
      {nds.map(function(nd,idx){
        if(nd.depth!==2||!P[idx])return null;
        var px=P[idx].x,py=P[idx].y;var op=nOp(idx);var isH=hovIdx===idx;var isDH=isDragging&&dragRef.current.idx===idx;
        var sc=P[idx].scale===undefined?1:P[idx].scale;
        var hasKids=nd.childIdxs.length>0;
        var pIdx=nd.parentIdx;if(!P[pIdx])return null;var angle=Math.atan2(py-P[pIdx].y,px-P[pIdx].x);var deg=angle*180/Math.PI;
        var r=(hasKids?3:leafR(nd.data.e))*sc;
        var lDist=r+(hasKids?8:6);var lx=px+Math.cos(angle)*lDist,ly=py+Math.sin(angle)*lDist;
        var textRot=deg;var anc="start";if(deg>90||deg<-90){textRot=deg+180;anc="end";}
        if(isH)hCards.push({id:nd.id,x:px+(px>CX?14:-224),y:py-65,data:nd.data});
        return(<g key={"t2-"+nd.id} opacity={op*sc} style={{cursor:isDH?"grabbing":"grab"}}
          onPointerDown={function(e){onDown(e,idx);}} onMouseEnter={function(){if(!isDragging)setHov(nd.id);}} onMouseLeave={function(){if(!isDragging)setHov(null);}}>
          {hasKids&&<circle cx={px} cy={py} r={(isH?4:2.8)*sc} fill={CD} opacity={0.7} stroke="none"/>}
          {!hasKids&&<circle cx={px} cy={py} r={r} fill={"url(#"+(nd.data.s==="complete"?"acg":(nd.data.s==="not_started"?"ghg":"aqg"))+")"} stroke="none"/>}
          {/* T2 label — rotated along branch */}
          {op>0.2&&sc>0.4&&<text x={lx} y={ly} textAnchor={anc} dominantBaseline="middle" transform={"rotate("+textRot+","+lx+","+ly+")"} fontSize={7.5} fontWeight={500} fill={TK} opacity={(isH?0.9:0.5)*sc} style={{pointerEvents:"none",fontFamily:"'DM Sans',sans-serif"}}>{nd.data.n}</text>}
        </g>);
      })}

      {/* T3 leaf nodes — translucent aqua with rim gradient */}
      {nds.map(function(nd,idx){
        if(nd.depth<3||!P[idx])return null;
        var px=P[idx].x,py=P[idx].y;var op=nOp(idx);var isH=hovIdx===idx;var isDH=isDragging&&dragRef.current.idx===idx;
        var sc=P[idx].scale===undefined?1:P[idx].scale;
        var r=leafR(nd.data.e)*sc;var gid=nd.data.s==="complete"?"acg":(nd.data.s==="not_started"?"ghg":"aqg");
        if(isH)hCards.push({id:nd.id,x:px+(px>CX?14:-224),y:py-65,data:nd.data});
        return(<g key={"t3-"+nd.id} opacity={op*sc} style={{cursor:isDH?"grabbing":"grab"}}
          onPointerDown={function(e){onDown(e,idx);}} onMouseEnter={function(){if(!isDragging)setHov(nd.id);}} onMouseLeave={function(){if(!isDragging)setHov(null);}}>
          <circle cx={px} cy={py} r={r*1.25} fill={"url(#"+gid+")"} opacity={isH?0.45:0.25} filter="url(#wc)"/>
          <circle cx={px} cy={py} r={r} fill={"url(#"+gid+")"} stroke="none"/>
          <circle cx={px} cy={py} r={Math.max(r,10)} fill="transparent" stroke="transparent"/>
        </g>);
      })}

      {/* Hub */}
      <circle cx={P[0].x} cy={P[0].y} r={13} fill={TD} opacity={0.85}/>
      <circle cx={P[0].x} cy={P[0].y} r={8} fill={TL} opacity={0.9}/>
      <circle cx={P[0].x} cy={P[0].y} r={3.5} fill="#2a8a70" opacity={0.7}/>

      {/* Selection ring — marks the feature currently open in the drawer */}
      {selFeature&&layout.idxMap[selFeature]!==undefined&&P[layout.idxMap[selFeature]]&&(function(){
        var si=layout.idxMap[selFeature];var snd=nds[si];
        var srx=snd.depth===1?16:(snd.childIdxs&&snd.childIdxs.length>0?14:Math.max(leafR(snd.data.e)+5,12));
        return <circle cx={P[si].x} cy={P[si].y} r={srx} fill="none" stroke={TD} strokeWidth={1.5} opacity={0.85} style={{pointerEvents:"none"}}/>;
      })()}

      {/* Hover cards — top z-layer, clamped to viewbox */}
      {hCards.map(function(card){
        var cw=220,ch=115;
        var cx=Math.max(6,Math.min(W-cw-6,card.x));
        var cy=Math.max(6,Math.min(H-ch-6,card.y));
        return(<foreignObject key={"hc-"+card.id} x={cx} y={cy} width={cw} height={ch} style={{pointerEvents:"none",overflow:"visible"}}>
          <div style={{background:"rgba(245,242,232,0.96)",border:"1px solid "+CRD,borderRadius:10,padding:"10px 14px",fontSize:11,color:TK,boxShadow:"0 8px 30px rgba(13,77,61,0.1)",lineHeight:1.55,fontFamily:"'DM Sans',system-ui,sans-serif",backdropFilter:"blur(8px)"}}>
            <div style={{fontWeight:700,fontSize:12.5,color:TD,marginBottom:3}}>{card.data.n}</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{color:CD}}>{"● "}{STL[card.data.s]}</span><span style={{color:"#8a7a6a"}}>{card.data.e}pt</span></div>
            <div style={{marginTop:4}}>{card.data.cat.map(function(c){return <span key={c} style={{display:"inline-block",marginRight:4,padding:"1px 7px",borderRadius:50,border:"1px solid "+TL+"40",color:TL,fontSize:9,fontWeight:600}}>{c}</span>;})}</div>
          </div>
        </foreignObject>);
      })}
    </svg>
  );
}

// ─── KPI Stat ───────────────────────────────────────────────────────────
function KPI(props){
  return <div style={{textAlign:"center",minWidth:58,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
    <div style={{fontSize:34,fontWeight:800,color:props.color||TK,lineHeight:1,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{props.value}</div>
    <div style={{display:"flex",alignItems:"center",gap:5}}>
      {props.dot&&<span style={{width:7,height:7,borderRadius:"50%",background:props.color||TK,opacity:0.85}}/>}
      <div style={{fontSize:9,fontWeight:700,color:"#8a7a6a",textTransform:"uppercase",letterSpacing:"0.08em"}}>{props.label}</div>
    </div>
  </div>;
}

var catCols={Backend:CD,Frontend:TL,"AI/ML":"#9B8DC7",Research:"#5a9a62",DevOps:"#c8a848"};
var statusCols={complete:"#3d8f6e",in_progress:CD,not_started:"#a09080"};

// ─── Drawer (Jira-style ticket panel) ──────────────────────────────────
function StatusPill(props){var s=props.s,col=statusCols[s]||"#888";return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:100,background:col+"18",color:col,fontSize:10.5,fontWeight:700,letterSpacing:"0.01em"}}><span style={{width:6,height:6,borderRadius:"50%",background:col}}/>{STL[s]}</span>;}
function CatPills(props){return <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{props.cats.map(function(c){var col=catCols[c]||TL;return <span key={c} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:100,border:"1px solid "+col+"55",color:col,fontSize:10,fontWeight:600,background:col+"0e"}}><span style={{width:6,height:6,borderRadius:"50%",background:col}}/>{c}</span>;})}</div>;}
function MetaRow(props){return <div style={{display:"flex",alignItems:"baseline",gap:10,fontSize:11,lineHeight:1.4}}><span style={{minWidth:62,color:"#8a7a6a",fontWeight:600,textTransform:"uppercase",fontSize:9,letterSpacing:"0.06em"}}>{props.label}</span><span style={{color:TK,fontWeight:props.bold?700:500}}>{props.value}</span></div>;}

function Drawer(props){
  var feature=props.feature;var onClose=props.onClose;var kids=props.kids;var onPick=props.onPick;
  if(!feature)return null;
  var owner=ownerOf(feature.id);var desc=descOf(feature);var isNew=props.isNew;
  return(
    <div style={{position:"absolute",top:0,right:0,bottom:0,width:380,background:"rgba(252,250,243,0.98)",backdropFilter:"blur(14px)",borderLeft:"1px solid "+CRD,boxShadow:"-12px 0 40px rgba(13,77,61,0.12)",zIndex:60,display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",animation:"drawerIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)"}}>
      {/* Header */}
      <div style={{padding:"18px 22px 14px",borderBottom:"1px solid "+CRD}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
          <div style={{fontSize:10,color:"#8a7a6a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Sans',sans-serif"}}>{feature.id.toUpperCase()}{isNew&&<span style={{marginLeft:8,padding:"2px 7px",borderRadius:100,background:PINK,color:"#8e3a47",fontSize:9,fontWeight:700}}>NEW</span>}</div>
          <button onClick={onClose} aria-label="Close" style={{background:"transparent",border:"none",cursor:"pointer",fontSize:20,color:"#8a7a6a",padding:0,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,lineHeight:1}}>×</button>
        </div>
        <h2 style={{margin:"0 0 10px",fontSize:20,fontWeight:600,color:TD,letterSpacing:"-0.01em",lineHeight:1.2,fontFamily:"'Newsreader',Georgia,serif"}}>{feature.n}</h2>
        <StatusPill s={feature.s}/>
      </div>
      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 22px 22px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
          <MetaRow label="Owner" value={owner} bold/>
          <MetaRow label="Effort" value={feature.e+" points"} bold/>
          <MetaRow label="Start" value={fmtMonth(feature.d)}/>
          <div style={{display:"flex",alignItems:"baseline",gap:10}}>
            <span style={{minWidth:62,color:"#8a7a6a",fontWeight:600,textTransform:"uppercase",fontSize:9,letterSpacing:"0.06em"}}>Tags</span>
            <CatPills cats={feature.cat}/>
          </div>
        </div>
        <div style={{paddingTop:14,borderTop:"1px solid "+CRD}}>
          <div style={{fontSize:9,color:"#8a7a6a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Description</div>
          <p style={{margin:0,fontSize:12.5,color:TK,lineHeight:1.55}}>{desc}</p>
        </div>
        {kids&&kids.length>0&&(
          <div style={{marginTop:22,paddingTop:14,borderTop:"1px solid "+CRD}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:9,color:"#8a7a6a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Sub-tickets</div>
              <div style={{fontSize:10,color:"#8a7a6a",fontWeight:600}}>{kids.length}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {kids.map(function(ch){return (
                <button key={ch.id} onClick={function(){onPick(ch.id);}} className="subTicket" style={{textAlign:"left",background:"rgba(245,242,232,0.7)",border:"1px solid "+CRD,borderRadius:9,padding:"10px 12px",cursor:"pointer",transition:"background 0.15s ease, border-color 0.15s ease",fontFamily:"'DM Sans',sans-serif"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:5}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:TD,lineHeight:1.25}}>{ch.n}</div>
                    <div style={{fontSize:10,color:"#8a7a6a",fontWeight:600,whiteSpace:"nowrap"}}>{ch.e}pt</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                    <StatusPill s={ch.s}/>
                    <span style={{fontSize:10,color:"#8a7a6a"}}>{ownerOf(ch.id)}</span>
                  </div>
                </button>
              );})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

var BTN={width:36,height:36,borderRadius:10,border:"1px solid "+CRD,background:"rgba(245,242,232,0.92)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 12px rgba(13,77,61,0.08)",backdropFilter:"blur(8px)"};

export default function App(){
  var mS=useState(MONTHS.length-1);var mi=mS[0],setMi=mS[1];
  var cS=useState(CATS.slice());var cats=cS[0],setCats=cS[1];
  var hS=useState(false);var hl=hS[0],setHl=hS[1];
  var hovS=useState(null);var hov=hovS[0],setHov=hovS[1];
  var selS=useState(null);var selBranch=selS[0],setSelBranch=selS[1];
  var fS=useState(null);var selFeature=fS[0],setSelFeature=fS[1];
  var zS=useState(1.0);var zoom=zS[0],setZoom=zS[1];
  var pxS=useState(0);var panX=pxS[0],setPanX=pxS[1];
  var pyS=useState(0);var panY=pyS[0],setPanY=pyS[1];
  var pdS=useState(false);var isPanning=pdS[0],setIsPanning=pdS[1];
  var panRef=useRef({sx:0,sy:0,ox:0,oy:0});
  var resetPosRef=useRef(null);

  function zoomIn(){setZoom(function(z){return Math.min(z+0.15,3);});}
  function zoomOut(){setZoom(function(z){return Math.max(z-0.15,0.4);});}
  function zoomReset(){setZoom(1.0);}
  function panDown(e){if(e.button!==undefined&&e.button!==0)return;setIsPanning(true);panRef.current={sx:e.clientX,sy:e.clientY,ox:panX,oy:panY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch(err){}}
  function panMove(e){if(!isPanning)return;setPanX(panRef.current.ox+(e.clientX-panRef.current.sx));setPanY(panRef.current.oy+(e.clientY-panRef.current.sy));}
  function panUp(){setIsPanning(false);}
  function resetAll(){setPanX(0);setPanY(0);if(resetPosRef.current)resetPosRef.current();}

  var items=useMemo(function(){return getVis(mi,cats);},[mi,cats]);
  var st=useMemo(function(){return gStats(items);},[items]);
  var nc=items.filter(function(d){return d.d===MONTHS[mi];}).length;
  var pct=st.total?Math.round(st.comp/st.total*100):0;
  function toggleCat(c){setCats(function(prev){var next=prev.includes(c)?prev.filter(function(x){return x!==c;}):prev.concat([c]);return next.length===0?CATS.slice():next;});}
  var allOn=cats.length===CATS.length;
  function toggleAll(){setCats(allOn?[CATS[0]]:CATS.slice());}

  var featureNode=useMemo(function(){if(!selFeature)return null;for(var i=0;i<FLAT.length;i++)if(FLAT[i].id===selFeature)return FLAT[i];return null;},[selFeature]);
  var featureChildren=useMemo(function(){if(!featureNode)return [];return FLAT.filter(function(f){return f.p===featureNode.id;});},[featureNode]);
  var featureIsNew=featureNode&&featureNode.d===MONTHS[mi];

  return(
    <div style={{background:CR,color:TK,height:"100vh",fontFamily:"'DM Sans', Georgia, serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet"/>

      {/* ═══ STICKY TOP BAR ═══ */}
      <div style={{flexShrink:0,background:"rgba(245,242,232,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid "+CRD,padding:"12px 20px",zIndex:20}}>
        {/* Row 1: Title + KPI stats */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:10}}>
          <h1 style={{margin:0,fontSize:20,fontWeight:300,color:TD,letterSpacing:"-0.02em",fontFamily:"'Newsreader', Georgia, serif",fontStyle:"italic"}}>Product Growth Map</h1>
          <div style={{display:"flex",gap:24,alignItems:"center"}}>
            <KPI value={st.comp} label="Complete" color="#3d8f6e" dot/>
            <KPI value={st.ip} label="In Progress" color={CD} dot/>
            <KPI value={st.ns} label="Not Started" color="#a09080" dot/>
            <div style={{width:1,height:42,background:CRD}}/>
            <KPI value={st.total} label="Total" color={TD}/>
            <KPI value={pct+"%"} label="Done" color="#3d8f6e"/>
          </div>
        </div>
        {/* Row 2: Legend (checkbox filters) */}
        <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap",fontFamily:"'DM Sans', sans-serif"}}>
          <span style={{fontSize:9,color:"#8a7a6a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Legend</span>
          <label className="legendItem" style={{display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:11,color:allOn?TK:"#a09080",fontWeight:700}}>
            <input type="checkbox" checked={allOn} onChange={toggleAll} style={{margin:0,width:14,height:14,accentColor:TD,cursor:"pointer"}}/>
            <span>All</span>
          </label>
          <div style={{width:1,height:16,background:CRD}}/>
          {CATS.map(function(c){var a=cats.includes(c);var col=catCols[c]||TL;return (
            <label key={c} className="legendItem" style={{display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:11,color:a?TK:"#a09080",fontWeight:600,transition:"color 0.15s ease"}}>
              <input type="checkbox" checked={a} onChange={function(){toggleCat(c);}} style={{margin:0,width:14,height:14,accentColor:col,cursor:"pointer"}}/>
              <span style={{display:"inline-block",width:9,height:9,borderRadius:"50%",background:col,opacity:a?1:0.45}}/>
              <span>{c}</span>
            </label>
          );})}
          <div style={{width:1,height:16,background:CRD}}/>
          <button onClick={function(){setHl(function(p){return!p;});}} className={"filterBtn"+(hl?" filterBtnOn":"")} style={{padding:"4px 11px",borderRadius:100,border:"1.5px solid "+(hl?PINKD:CRD),background:hl?PINK:"transparent",color:hl?"#8e3a47":"#a09080",fontSize:10,fontWeight:hl?700:600,cursor:"pointer",transition:"background 0.18s ease, color 0.18s ease, border-color 0.18s ease",display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:"50%",background:PINKD,opacity:hl?1:0.6}}/>{"New this month"}</button>
          {selBranch&&<button onClick={function(){setSelBranch(null);}} style={{padding:"4px 10px",borderRadius:100,border:"1.5px solid "+TL,background:"transparent",color:TL,fontSize:10,fontWeight:600,cursor:"pointer"}}>{"✕ Clear branch"}</button>}
        </div>
      </div>

      {/* ═══ DIAGRAM CANVAS (fills remaining space) ═══ */}
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        <div onPointerDown={panDown} onPointerMove={panMove} onPointerUp={panUp} onPointerLeave={panUp}
          style={{width:"100%",height:"100%",cursor:isPanning?"grabbing":"default",touchAction:"none",overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100%",padding:"0 0 48px 0",
            transform:"translate("+panX+"px, "+panY+"px)",transition:isPanning?"none":"transform 0.15s ease-out",willChange:"transform"}}>
            <div style={{flexShrink:0,width:Math.round(920*zoom),maxWidth:"none",transition:"width 0.3s ease"}}>
              <DandelionSim items={items} mi={mi} hl={hl} hov={hov} setHov={setHov} selBranch={selBranch} setSelBranch={setSelBranch} onPick={setSelFeature} selFeature={selFeature} resetRef={resetPosRef}/>
            </div>
          </div>
        </div>

        {/* Floating zoom controls */}
        <div style={{position:"absolute",bottom:16,right:16,display:"flex",flexDirection:"column",gap:4,zIndex:10}}>
          <button onClick={resetAll} title="Reset" className="zoomBtn" style={Object.assign({},BTN,{color:TK,fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:4})}>{"Reset"}</button>
          <button onClick={zoomIn} className="zoomBtn" style={Object.assign({},BTN,{color:TD,fontSize:18,fontWeight:500,lineHeight:"1"})}>{"+"}</button>
          <button onClick={zoomReset} className="zoomBtn" style={Object.assign({},BTN,{height:28,color:"#8a7a6a",fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif"})}>{Math.round(zoom*100)+"%"}</button>
          <button onClick={zoomOut} className="zoomBtn" style={Object.assign({},BTN,{color:TD,fontSize:18,fontWeight:500,lineHeight:"1"})}>{"−"}</button>
        </div>

        {/* Feature drawer */}
        <Drawer feature={featureNode} kids={featureChildren} isNew={featureIsNew} onClose={function(){setSelFeature(null);}} onPick={function(id){setSelFeature(id);}}/>
      </div>

      {/* ═══ FIXED BOTTOM TIMELINE ═══ */}
      <div onPointerDown={function(e){e.stopPropagation();}} onPointerMove={function(e){e.stopPropagation();}} onPointerUp={function(e){e.stopPropagation();}} style={{flexShrink:0,background:"rgba(245,242,232,0.95)",backdropFilter:"blur(12px)",borderTop:"1px solid "+CRD,padding:"12px 24px 16px",zIndex:20,fontFamily:"'DM Sans', sans-serif"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,maxWidth:700,margin:"0 auto"}}>
          <span style={{fontSize:12,color:TK,fontWeight:700,letterSpacing:"-0.01em",whiteSpace:"nowrap"}}>{ML[mi]}</span>
          <div style={{flex:1,position:"relative"}}>
            <div style={{position:"absolute",top:"50%",left:0,right:0,height:3,background:CRD,borderRadius:2,transform:"translateY(-50%)"}}/>
            <div style={{position:"absolute",top:"50%",left:0,width:(mi/(MONTHS.length-1))*100+"%",height:3,background:TL,borderRadius:2,transform:"translateY(-50%)",transition:"width 0.25s ease-out",opacity:0.85}}/>
            {/* Tick marks aligned to each month */}
            <div style={{position:"absolute",top:"50%",left:0,right:0,height:0,transform:"translateY(-50%)",pointerEvents:"none"}}>
              {ML.map(function(m,i){var leftPct=(i/(MONTHS.length-1))*100;var passed=i<=mi;return <div key={"tick-"+m} style={{position:"absolute",left:"calc("+leftPct+"% - 1px)",top:-3,width:2,height:6,background:passed?TL:CRD,borderRadius:1,opacity:passed?0.7:0.9}}/>;})}
            </div>
            <input type="range" min={0} max={MONTHS.length-1} value={mi}
              onPointerDown={function(e){e.stopPropagation();}}
              onPointerMove={function(e){e.stopPropagation();}}
              onPointerUp={function(e){e.stopPropagation();}}
              onChange={function(e){setMi(Number(e.target.value));}}
              style={{width:"100%",WebkitAppearance:"none",background:"transparent",cursor:"pointer",height:28,position:"relative",zIndex:2}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3,padding:"0 1px"}}>
              {ML.map(function(m,i){return <span key={m} className="monthLabel" onClick={function(e){e.stopPropagation();setMi(i);}} style={{fontSize:11,cursor:"pointer",fontWeight:i===mi?700:500,color:i===mi?TD:"#8a7a6a",transition:"color 0.2s ease",padding:"2px 4px",borderRadius:4}}>{m}</span>;})}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:
        "input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:"+TD+";border:3px solid "+CR+";box-shadow:0 1px 6px rgba(13,77,61,0.3);cursor:grab;transition:transform 0.15s ease, box-shadow 0.15s ease}"
        +"input[type=range]:hover::-webkit-slider-thumb{transform:scale(1.08);box-shadow:0 2px 10px rgba(13,77,61,0.4)}"
        +"input[type=range]:active::-webkit-slider-thumb{cursor:grabbing;transform:scale(1.18);box-shadow:0 3px 14px rgba(13,77,61,0.45)}"
        +"input[type=range]::-webkit-slider-runnable-track{height:4px;background:transparent;border-radius:2px}"
        +".monthLabel:hover{color:"+TD+" !important;background:"+TL+"14}"
        +".filterBtn:not(.filterBtnOn):hover{background:"+TD+"14 !important;color:"+TD+" !important;border-color:"+TD+"55 !important}"
        +".filterBtn.filterBtnOn:hover{background:"+PINKD+"55 !important}"
        +".legendItem:hover{color:"+TD+" !important}"
        +".zoomBtn{transition:background 0.15s ease, transform 0.1s ease}"
        +".zoomBtn:hover{background:"+TL+"18 !important}"
        +".zoomBtn:active{transform:scale(0.94)}"
        +".subTicket:hover{background:rgba(245,242,232,1) !important;border-color:"+TL+"55 !important}"
        +"@keyframes drawerIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}"
        +"*{box-sizing:border-box}"
      }}/>
    </div>
  );
}
