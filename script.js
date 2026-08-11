(function(){
'use strict';

/* ============================================================
   LZ Portfolio — 27 Themes · Secure IIFE
   No global pollution. textContent only. URL allowlist.
   localStorage always in try/catch. No eval/innerHTML on user data.
   ============================================================ */

const C={
  themeKey:'lz-theme',
  langKey:'lz-lang',
  secretCode:'LAYER',
  githubUser:'HSMTFPS'
};

/* ---------- Tiny DOM helpers ---------- */
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const ce=(t,cls)=>{const e=document.createElement(t);if(cls)e.className=cls;return e};
const safeJSON=(s,d)=>{try{return JSON.parse(s)}catch(_){return d||null}};

/* ---------- Security utilities ---------- */
const Sec={
  ls:{
    get(k){try{return localStorage.getItem(k)}catch(_){return null}},
    set(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}},
    del(k){try{localStorage.removeItem(k)}catch(_){return true}}
  },
  isAllowedUrl(u){
    if(typeof u!=='string')return false;
    try{
      const url=new URL(u);
      if(url.protocol!=='https:')return false;
      const ok=['github.com','linkedin.com','tryhackme.com','hackthebox.com','layerzeppelin.pt','mail.google.com'];
      return ok.some(h=>url.hostname===h||url.hostname.endsWith('.'+h));
    }catch(_){return false}
  }
};

/* ============================================================
   I18N — loads dictionary, applies via textContent
   ============================================================ */
const I18N={
  dict:null,
  cur:'en',

  async init(){
    const stored=Sec.ls.get(C.langKey);
    if(stored==='pt'||stored==='en')this.cur=stored;
    document.documentElement.setAttribute('data-lang',this.cur);

    // 1. Try fetch
    try{
      const r=await fetch('./i18n/'+this.cur+'.json',{cache:'no-cache'});
      if(r.ok){this.dict=await r.json();this.apply();return}
    }catch(_){}

    // 2. Fallback inline JSON
    const fb=document.getElementById('i18n-'+this.cur);
    if(fb){
      this.dict=safeJSON(fb.textContent,{});
      this.apply();
    }
  },

  setLang(l){
    if(l!=='pt'&&l!=='en')return;
    if(l===this.cur)return;
    this.cur=l;
    document.documentElement.setAttribute('data-lang',l);
    Sec.ls.set(C.langKey,l);
    this.init().then(()=>{Theme.updateMini();renderContact();});
  },

  t(path){
    if(!this.dict)return'';
    const parts=path.split('.');
    let v=this.dict;
    for(const p of parts){
      if(v&&typeof v==='object'&&p in v)v=v[p];
      else return'';
    }
    return typeof v==='string'?v:'';
  },

  apply(){
    $$('[data-i18n]').forEach(el=>{
      const k=el.getAttribute('data-i18n');
      const v=this.t(k);
      if(v)el.textContent=v;
    });
    $$('[data-i18n-attr]').forEach(el=>{
      const spec=el.getAttribute('data-i18n-attr')||'';
      spec.split(';').forEach(pair=>{
        const [attr,key]=pair.split(':');
        if(attr&&key){
          const v=this.t(key);
          if(v)el.setAttribute(attr,v);
        }
      });
    });
    // update language label button
    const lbl=document.querySelector('[data-lang-label]');
    if(lbl)lbl.textContent=this.cur.toUpperCase();
    document.documentElement.setAttribute('data-lang',this.cur);
  }
};

/* ============================================================
   THEME MANAGER — applies data-theme, paints, persists
   ============================================================ */
const Theme={
  cur:'t01',
  THEMES:Array.from({length:27},(_,i)=>'t'+(i<10?'0'+i:i+1)),
  names:{
    t01:'Cyberpunk Terminal',t02:'Tron Legacy',t03:'Sakura Dreams',t04:'Bauhaus Constructivism',
    t05:'Brutalist Mono',t06:'Y2K Vapor',t07:'Solarpunk Eden',t08:'Bioluminescent Abyss',
    t09:'VHS Retro',t10:'Nordic Minimalist',t11:'Memphis 80s',t12:'Art Deco Gold',
    t13:'Holographic Pastel',t14:'Dark Academia',t15:'Risograph Print',t16:'Pixel Arcade',
    t17:'Liquid Metal',t18:'Japanese Ukiyo-e',t19:'Renaissance Manuscript',t20:'Steampunk Brass',
    t21:'Space Opera',t22:'Cottagecore',t23:'Cassette Futurism',t24:'Origami Paper',
    t25:'Bauhaus Grid',t26:'Glitch Art',t27:'Aurora Borealis'
  },

  init(){
    const stored=Sec.ls.get(C.themeKey);
    if(stored&&this.THEMES.indexOf(stored)!==-1)this.cur=stored;
    document.documentElement.setAttribute('data-theme',this.cur);
    Sec.ls.set(C.themeKey,this.cur);
    this.updateMini();
    this.buildPicker();
    this.highlightActive();
  },

  apply(){
    document.documentElement.setAttribute('data-theme',this.cur);
    Sec.ls.set(C.themeKey,this.cur);
    CanvasFx.activate(this.cur);
    this.highlightActive();
  },

  set(t){
    if(this.THEMES.indexOf(t)===-1)return;
    this.cur=t;
    this.apply();
  },

  updateMini(){
    const m=document.querySelector('[data-theme-mini]');
    if(m)m.textContent=this.cur;
  },

  highlightActive(){
    $$('.theme-tile').forEach(t=>{
      if(t.getAttribute('data-theme-id')===this.cur)t.classList.add('active');
      else t.classList.remove('active');
    });
  },

  buildPicker(){
    const grid=document.getElementById('theme-grid');
    if(!grid)return;
    grid.textContent='';
    this.THEMES.forEach(id=>{
      const tile=ce('button','theme-tile');
      tile.type='button';
      tile.setAttribute('data-theme-id',id);
      tile.setAttribute('aria-label','Theme '+id+' '+this.names[id]);

      const num=ce('div','theme-tile-num');
      num.textContent=id;
      const name=ce('div','theme-tile-name');
      name.textContent=this.names[id];
      const desc=ce('div','theme-tile-desc');
      // try i18n desc
      const i18nDesc=I18N.t('themes.'+id+'.desc');
      desc.textContent=i18nDesc||'';

      tile.appendChild(num);
      tile.appendChild(name);
      tile.appendChild(desc);
      tile.addEventListener('click',()=>{this.set(id);this.updateMini();});
      grid.appendChild(tile);
    });
  }
};

/* ============================================================
   MODAL — open/close theme picker
   ============================================================ */
const Modal={
  el:null,
  open(){
    const m=document.getElementById('theme-modal');
    if(!m)return;
    m.hidden=false;
    document.body.style.overflow='hidden';
    const btn=document.getElementById('theme-pick-btn');
    if(btn)btn.setAttribute('aria-expanded','true');
  },
  close(){
    const m=document.getElementById('theme-modal');
    if(!m)return;
    m.hidden=true;
    document.body.style.overflow='';
    const btn=document.getElementById('theme-pick-btn');
    if(btn)btn.setAttribute('aria-expanded','false');
  },
  init(){
    const openBtn=document.getElementById('theme-pick-btn');
    if(openBtn)openBtn.addEventListener('click',()=>this.open());
    $$('[data-close-modal]').forEach(el=>el.addEventListener('click',()=>this.close()));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')this.close()});
  }
};

/* ============================================================
   CANVAS FX — matrix rain, tron, sakura, biolumi, vhs, stars, aurora
   ============================================================ */
const CanvasFx={
  canvases:{},
  ctx:{},
  state:{},
  rafId:null,
  active:null,
  reduced:false,
  W:0, H:0,

  init(){
    this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ids=['matrix','tron','sakura','aurora','biolumi','stars','vhs'];
    ids.forEach(id=>{
      const c=document.getElementById('fx-'+id);
      if(!c)return;
      this.canvases[id]=c;
      this.ctx[id]=c.getContext('2d');
    });
    this.W=window.innerWidth;
    this.H=window.innerHeight;
    this.resizeAll();
    window.addEventListener('resize',()=>{this.W=window.innerWidth;this.H=window.innerHeight;this.resizeAll()});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)this.stop();
      else if(this.active)this.start();
    });
  },

  resizeAll(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    Object.keys(this.canvases).forEach(id=>{
      const c=this.canvases[id];
      c.width=this.W*dpr;
      c.height=this.H*dpr;
      c.style.width=this.W+'px';
      c.style.height=this.H+'px';
      if(this.ctx[id])this.ctx[id].setTransform(dpr,0,0,dpr,0,0);
    });
  },

  activate(theme){
    this.stop();
    this.active=theme;
    const map={t01:'matrix',t02:'tron',t03:'sakura',t08:'biolumi',t09:'vhs',t21:'stars',t27:'aurora'};
    const target=map[theme];
    if(!target)return;
    this.W=window.innerWidth;
    this.H=window.innerHeight;
    this.resizeAll();
    this.setupTarget(target);
    this.start();
  },

  setupTarget(id){
    const c=this.canvases[id];
    if(!c)return;
    const W=()=>this.W, H=()=>this.H;

    if(id==='matrix'){
      const chars='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@!%&';
      const fontSize=16;
      const cols=Math.floor(W()/fontSize);
      const drops=[];
      for(let i=0;i<cols;i++){
        let word='';
        const wl=4+Math.floor(Math.random()*12);
        for(let k=0;k<wl;k++)word+=chars[Math.floor(Math.random()*chars.length)];
        drops.push({
          y:Math.random()*H()*-1,
          word:word,
          speed:fontSize*(0.3+Math.random()*1.2)
        });
      }
      this.state.matrix={drops,fontSize};
    }else if(id==='tron'){
      this.state.tron={t:0};
    }else if(id==='sakura'){
      const petals=[];
      for(let i=0;i<30;i++){
        petals.push({x:Math.random()*W(),y:Math.random()*H(),s:Math.random()*3+1,r:Math.random()*Math.PI*2,sp:Math.random()*0.5+0.3});
      }
      this.state.sakura={petals};
    }else if(id==='biolumi'){
      const orgs=[];
      for(let i=0;i<25;i++){
        orgs.push({x:Math.random()*W(),y:Math.random()*H(),s:Math.random()*4+2,ph:Math.random()*Math.PI*2,sp:Math.random()*0.02+0.01});
      }
      this.state.biolumi={orgs};
    }else if(id==='vhs'){
      this.state.vhs={t:0,scanY:0};
    }else if(id==='stars'){
      const stars=[];
      for(let i=0;i<200;i++){
        stars.push({x:Math.random()*W(),y:Math.random()*H(),s:Math.random()*1.5+0.3,tw:Math.random()*Math.PI*2,tsp:Math.random()*0.05+0.01});
      }
      this.state.stars={stars};
    }else if(id==='aurora'){
      this.state.aurora={t:0,ribbons:[]};
      for(let i=0;i<4;i++){
        this.state.aurora.ribbons.push({y:Math.random()*H(),h:Math.random()*80+40,sp:Math.random()*0.3+0.2,ph:Math.random()*Math.PI*2,col:['rgba(0,255,136,','rgba(74,158,255,','rgba(184,100,255,','rgba(255,107,181,'][i]});
      }
    }
  },

  start(){
    if(this.reduced)return;
    if(this.rafId)cancelAnimationFrame(this.rafId);
    const map={t01:'matrix',t02:'tron',t03:'sakura',t08:'biolumi',t09:'vhs',t21:'stars',t27:'aurora'};
    const id=map[this.active];
    if(!id)return;
    const draw=()=>{
      this.frame(id);
      this.rafId=requestAnimationFrame(draw);
    };
    draw();
  },

  stop(){
    if(this.rafId){cancelAnimationFrame(this.rafId);this.rafId=null}
    // clear canvases
    Object.keys(this.ctx).forEach(id=>{
      const c=this.canvases[id];
      if(c)this.ctx[id].clearRect(0,0,c.clientWidth,c.clientHeight);
    });
  },

  frame(id){
    const c=this.canvases[id]; if(!c)return;
    const ctx=this.ctx[id]; if(!ctx)return;
    const W=this.W, H=this.H;
    ctx.clearRect(0,0,W,H);

    if(id==='matrix'){
      const st=this.state.matrix;
      const fs=st.fontSize||16;
      ctx.fillStyle='rgba(10,10,10,0.05)';
      ctx.fillRect(0,0,W,H);
      ctx.font=fs+'px monospace';
      const chars='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@!%&';
      for(let i=0;i<st.drops.length;i++){
        const d=st.drops[i];
        const x=i*fs;
        // Draw trail: each position has a char that mutates
        const trailLen=Math.min(d.word.length,30);
        for(let j=0;j<trailLen;j++){
          const y=d.y-j*fs;
          if(y<-fs||y>H+fs)continue;
          // Mutate chars randomly as they fall
          let ch;
          if(j===0){
            // Head: bright white-green, pick random char
            ch=chars[Math.floor(Math.random()*chars.length)];
            ctx.fillStyle='#e6ffe6';
            ctx.shadowColor='#00ff41';
            ctx.shadowBlur=12;
          }else if(j<3){
            // Near head: bright green, chars still mutating
            ch=Math.random()>0.3?chars[Math.floor(Math.random()*chars.length)]:d.word[j]||chars[0];
            ctx.fillStyle='#00ff41';
            ctx.shadowColor='#00ff41';
            ctx.shadowBlur=8;
          }else{
            // Trail: fading green, chars mutate less frequently
            ch=Math.random()>0.92?chars[Math.floor(Math.random()*chars.length)]:(d.word[j]||chars[Math.floor(Math.random()*chars.length)]);
            const alpha=Math.max(0.03,1-j*0.06);
            ctx.fillStyle='rgba(0,255,65,'+alpha+')';
            ctx.shadowColor='rgba(0,255,65,0.3)';
            ctx.shadowBlur=2;
          }
          ctx.fillText(ch,x,y);
        }
        ctx.shadowBlur=0;
        // Occasionally mutate the stored word
        if(Math.random()>0.7){
          const idx=Math.floor(Math.random()*d.word.length);
          d.word=d.word.substring(0,idx)+chars[Math.floor(Math.random()*chars.length)]+d.word.substring(idx+1);
        }
        // Reset when off screen
        if(d.y-trailLen*fs>H&&Math.random()>0.975){
          d.y=-Math.random()*300;
          d.word='';
          const wl=4+Math.floor(Math.random()*12);
          for(let k=0;k<wl;k++)d.word+=chars[Math.floor(Math.random()*chars.length)];
          d.speed=fs*(0.3+Math.random()*1.2);
        }
        d.y+=d.speed;
      }
    }else if(id==='tron'){
      const st=this.state.tron; st.t+=0.02;
      ctx.strokeStyle='rgba(0,255,255,0.6)';
      ctx.lineWidth=1;
      const horizon=H*0.4;
      for(let z=0;z<20;z++){
        const p=((z+st.t*0.5)%1);
        const y=horizon+p*(H-horizon);
        const w=W*p*1.5;
        ctx.beginPath();ctx.moveTo(W/2-w,y);ctx.lineTo(W/2+w,y);ctx.stroke();
      }
      for(let i=0;i<10;i++){
        const x=(i/10)*W;
        ctx.beginPath();ctx.moveTo(W/2,horizon);ctx.lineTo(x,H);ctx.stroke();
      }
      ctx.fillStyle='rgba(0,255,255,0.15)';
      ctx.beginPath();ctx.moveTo(W/2,horizon);
      for(let i=-10;i<=10;i++){ctx.lineTo(W/2+i*W/20,horizon);ctx.lineTo(W/2+i*W/10,H)}
      ctx.closePath();ctx.fill();
    }else if(id==='sakura'){
      const st=this.state.sakura;
      st.petals.forEach(p=>{
        p.y+=p.sp; p.r+=0.02;
        p.x+=Math.sin(p.r)*0.5;
        if(p.y>H){p.y=-10;p.x=Math.random()*W}
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.r);
        ctx.fillStyle='rgba(255,182,193,0.8)';
        ctx.beginPath();
        ctx.ellipse(0,0,p.s*1.5,p.s*0.8,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      });
    }else if(id==='biolumi'){
      const st=this.state.biolumi;
      st.orgs.forEach(o=>{
        o.ph+=o.sp;
        const glow=Math.sin(o.ph)*0.5+0.5;
        const grd=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.s*8);
        grd.addColorStop(0,`rgba(100,220,255,${0.4*glow})`);
        grd.addColorStop(1,'rgba(100,220,255,0)');
        ctx.fillStyle=grd;
        ctx.fillRect(o.x-o.s*8,o.y-o.s*8,o.s*16,o.s*16);
        ctx.fillStyle=`rgba(180,240,255,${0.7*glow})`;
        ctx.beginPath();ctx.arc(o.x,o.y,o.s,0,Math.PI*2);ctx.fill();
      });
    }else if(id==='vhs'){
      const st=this.state.vhs; st.t+=0.01;
      ctx.fillStyle='rgba(255,0,128,0.04)';
      for(let i=0;i<H;i+=3){
        const off=Math.sin(i*0.1+st.t)*5;
        ctx.fillRect(off,i,W,1);
      }
      ctx.fillStyle='rgba(0,255,255,0.03)';
      for(let i=0;i<H;i+=5){
        const off=Math.cos(i*0.15+st.t*2)*3;
        ctx.fillRect(off,i,W,1);
      }
      st.scanY=(st.scanY+2)%H;
      ctx.fillStyle='rgba(255,255,255,0.05)';
      ctx.fillRect(0,st.scanY,W,2);
    }else if(id==='stars'){
      const st=this.state.stars;
      ctx.fillStyle='#0a0e27';
      ctx.fillRect(0,0,W,H);
      st.stars.forEach(s=>{
        s.tw+=s.tsp;
        const b=Math.sin(s.tw)*0.4+0.6;
        ctx.fillStyle=`rgba(244,196,48,${b})`;
        ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
        if(b>0.8){
          ctx.fillStyle=`rgba(244,196,48,${(b-0.7)*0.3})`;
          ctx.beginPath();ctx.arc(s.x,s.y,s.s*3,0,Math.PI*2);ctx.fill();
        }
      });
    }else if(id==='aurora'){
      const st=this.state.aurora; st.t+=0.01;
      ctx.fillStyle='#0a0e2a';
      ctx.fillRect(0,0,W,H);
      st.ribbons.forEach(rb=>{
        rb.ph+=0.005;
        for(let x=0;x<W;x+=4){
          const y=rb.y+Math.sin(x*0.005+rb.ph)*rb.h*0.4+Math.sin(x*0.01+st.t)*30;
          const alpha=0.3*Math.sin(x*0.01+rb.ph*2);
          ctx.fillStyle=rb.col+alpha+')';
          ctx.fillRect(x,y,4,rb.h*0.6);
        }
      });
    }
  }
};

/* ============================================================
   NAVIGATION — mobile menu toggle
   ============================================================ */
const Nav={
  init(){
    const toggle=$('#nav-toggle');
    const list=$('.nav');
    if(toggle&&list){
      toggle.addEventListener('click',()=>{
        const open=list.classList.toggle('open');
        toggle.setAttribute('aria-expanded',open?'true':'false');
      });
      $$('.nav a').forEach(a=>a.addEventListener('click',()=>{
        list.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }));
    }
  }
};

/* ============================================================
   LANG BUTTON
   ============================================================ */
const LangBtn={
  init(){
    const btn=$('#lang-btn');
    if(btn)btn.addEventListener('click',()=>{
      I18N.setLang(I18N.cur==='en'?'pt':'en');
    });
  }
};

/* ============================================================
   CONTENT RENDERING — pulls from I18N dict, uses textContent
   ============================================================ */
function renderSkills(){
  const root=document.getElementById('skills-render');
  if(!root||!I18N.dict)return;
  root.textContent='';
  const s=I18N.dict.skills;
  if(!s||!s.items)return;
  const groups={lang:[],sec:[],os:[],dev:[],tools:[]};
  const groupMap={
    english:'lang',portuguese:'lang',
    pentest:'sec',web:'sec',osint:'sec',network:'sec',
    kali:'os',nethunter:'os',parrot:'os',ubuntu:'os',windows:'os',
    python:'dev',proxmox:'dev',vmware:'dev',docker:'dev',wsl:'dev',wireguard:'dev',openvpn:'dev',
    shodan:'tools',burp:'tools',nmap:'tools',metasploit:'tools',wireshark:'tools',john:'tools',hashcat:'tools',gobuster:'tools',nikto:'tools'
  };
  const icons={
    english:'🇬🇧',portuguese:'🇵🇹',
    pentest:'🔓',web:'🌐',osint:'🔍',network:'📡',
    kali:'🐉',nethunter:'📱',parrot:'🦜',ubuntu:'🐧',windows:'🪟',
    python:'🐍',proxmox:'☁️',vmware:'⚙️',docker:'🐳',wsl:'🔧',wireguard:'🔒',openvpn:'🔐',
    shodan:'🔎',burp:'🕷️',nmap:'📡',metasploit:'🔓',wireshark:'🗡️',john:'🔍',hashcat:'🛡️',gobuster:'🌐',nikto:'📊'
  };
  Object.keys(s.items).forEach(k=>{
    const g=groupMap[k]||'tools';
    groups[g].push({key:k,...s.items[k],icon:icons[k]||'🔧'});
  });
  Object.keys(groups).forEach(gKey=>{
    const arr=groups[gKey];
    if(!arr.length)return;
    const cat=ce('div','skill-cat');
    const title=ce('div','skills-cat-title');
    title.textContent=s.categories[gKey]||gKey;
    cat.appendChild(title);
    const grid=ce('div','skills-grid');
    arr.forEach(it=>{
      const card=ce('div','skill-card');
      const ico=ce('div','skill-icon');
      ico.textContent=it.icon;
      card.appendChild(ico);
      const nm=ce('h3','skill-name');
      nm.textContent=it.name;
      card.appendChild(nm);
      if(it.desc){
        const d=ce('p','skill-desc');
        d.textContent=it.desc;
        card.appendChild(d);
      }
      const bar=ce('div','skill-bar');
      const fill=ce('div','skill-bar-fill');
      setTimeout(()=>{fill.style.width=(it.level/20*100)+'%'},100);
      bar.appendChild(fill);
      card.appendChild(bar);
      grid.appendChild(card);
    });
    cat.appendChild(grid);
    root.appendChild(cat);
  });
}

function renderCerts(){
  const root=document.getElementById('certs-render');
  if(!root||!I18N.dict)return;
  root.textContent='';
  const c=I18N.dict.certs;
  if(!c||!c.items)return;
  const grid=ce('div','certs-grid');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem';
  c.items.forEach(it=>{
    const card=ce('div','cert-card');
    card.setAttribute('data-status',it.status);
    const name=ce('h3');name.textContent=it.name;
    const iss=ce('p');iss.textContent=it.issuer||'';
    const status=ce('span','cert-status');
    status.textContent=(c.status&&c.status[it.status])||it.status;
    card.appendChild(name);
    card.appendChild(iss);
    card.appendChild(status);
    if(it.img){
      const img=ce('img');
      img.src='./assets/certs/'+it.img;
      img.alt=it.name;
      img.loading='lazy';
      img.style.cssText='width:100%;height:auto;margin-top:0.5rem;border-radius:4px';
      card.appendChild(img);
    }
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function renderCTF(){
  const root=document.getElementById('ctf-render');
  if(!root)return;
  root.textContent='';
  const platforms=[
    {n:'TryHackMe',u:'https://tryhackme.com',d:'Active learner'},
    {n:'HackTheBox',u:'https://hackthebox.com',d:'Machine practice'},
    {n:'PortSwigger Academy',u:'https://portswigger.net/web-security',d:'Web security labs'}
  ];
  const grid=ce('div','ctf-grid');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem';
  platforms.forEach(p=>{
    const card=ce('a','ctf-card');
    card.href=p.u;
    card.target='_blank';
    card.rel='noopener noreferrer';
    card.style.cssText='display:block;padding:1.5rem;border:1px solid currentColor;border-radius:8px;text-decoration:none';
    const n=ce('div');n.style.cssText='font-weight:700;font-size:1.1rem';n.textContent=p.n;
    const d=ce('div');d.style.cssText='opacity:0.7;font-size:0.85rem;margin-top:0.3rem';d.textContent=p.d;
    card.appendChild(n);card.appendChild(d);
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function renderProjects(){
  const root=document.getElementById('projects-render');
  if(!root||!I18N.dict)return;
  root.textContent='';
  const p=I18N.dict.projects;
  if(!p||!p.items)return;
  const grid=ce('div','projects-grid');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem';
  p.items.forEach(it=>{
    const card=ce('div','project-card');
    const name=ce('h3');name.textContent=it.name;
    card.appendChild(name);
    const desc=ce('p');desc.textContent=it.description;
    card.appendChild(desc);
    if(it.tags&&it.tags.length){
      const tags=ce('div','project-tags');
      tags.style.cssText='display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.8rem';
      it.tags.forEach(t=>{
        const tag=ce('span','tag');
        tag.textContent=t;
        tag.style.cssText='padding:0.2rem 0.6rem;border:1px solid currentColor;border-radius:12px;font-size:0.75rem;opacity:0.8';
        tags.appendChild(tag);
      });
      card.appendChild(tags);
    }
    if(it.url&&Sec.isAllowedUrl(it.url)){
      const a=ce('a','project-link');
      a.href=it.url;
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.textContent=p.liveDemo||'Live';
      a.style.cssText='display:inline-block;margin-top:1rem;padding:0.5rem 1rem;border:1px solid currentColor;border-radius:6px;text-decoration:none;font-size:0.85rem';
      card.appendChild(a);
    }
    if(it.code&&Sec.isAllowedUrl(it.code)){
      const a=ce('a','project-link');
      a.href=it.code;
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.textContent=p.viewCode||'Code';
      a.style.cssText='display:inline-block;margin-top:1rem;margin-left:0.5rem;padding:0.5rem 1rem;border:1px solid currentColor;border-radius:6px;text-decoration:none;font-size:0.85rem';
      card.appendChild(a);
    }
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function renderWriteups(){
  const root=document.getElementById('writeups-render');
  if(!root||!I18N.dict)return;
  root.textContent='';
  const w=I18N.dict.writeups;
  if(!w)return;
  const grid=ce('div','writeups-grid');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem';
  (w.items||[]).forEach(it=>{
    const card=ce('div','writeup-card');
    card.style.cssText='padding:1.5rem;border:1px dashed currentColor;border-radius:8px;opacity:0.85';
    const n=ce('h3');n.textContent=it.name;
    const d=ce('p');d.textContent=it.desc;
    const coming=ce('span');coming.textContent=w.coming||'Coming Soon';
    coming.style.cssText='display:inline-block;margin-top:0.5rem;padding:0.2rem 0.6rem;background:currentColor;color:var(--bg,#000);border-radius:12px;font-size:0.7rem;font-weight:700';
    card.appendChild(n);card.appendChild(d);card.appendChild(coming);
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function renderTools(){
  const root=document.getElementById('tools-render');
  if(!root||!I18N.dict)return;
  root.textContent='';
  const t=I18N.dict.tools;
  if(!t)return;
  const cats={
    recon:['nmap','shodan'],
    web:['burp','gobuster','nikto'],
    exploit:['metasploit'],
    pass:['john','hashcat'],
    net:['wireshark'],
    os:['kali','parrot','nethunter']
  };
  const grid=ce('div','tools-grid');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem';
  Object.keys(cats).forEach(cKey=>{
    const card=ce('div','tool-cat');
    card.style.cssText='padding:1.2rem;border:1px solid currentColor;border-radius:8px';
    const title=ce('h4');title.textContent=t.categories[cKey]||cKey;
    title.style.cssText='margin-bottom:0.8rem;font-size:0.9rem;letter-spacing:0.1em;text-transform:uppercase';
    card.appendChild(title);
    const ul=ce('ul');ul.style.cssText='display:grid;gap:0.3rem;font-size:0.85rem;list-style:none';
    cats[cKey].forEach(k=>{
      const li=ce('li');
      const sk=I18N.dict.skills&&I18N.dict.skills.items&&I18N.dict.skills.items[k];
      li.textContent=sk?sk.name:k;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

function renderJourney(){
  const root=document.getElementById('journey-render');
  if(!root||!I18N.dict)return;
  root.textContent='';
  const j=I18N.dict.journey;
  const c=I18N.dict.certs;
  if(!c||!c.items)return;
  const timeline=ce('div','journey-timeline');
  timeline.style.cssText='position:relative;max-width:700px;margin:0 auto;padding-left:2rem';
  const line=ce('div');
  line.style.cssText='position:absolute;left:0.5rem;top:0;bottom:0;width:2px;background:currentColor;opacity:0.3';
  timeline.appendChild(line);
  c.items.forEach(it=>{
    const step=ce('div','journey-step');
    step.style.cssText='position:relative;padding:1rem 0 1rem 1.5rem;border-bottom:1px solid currentColor;border-bottom-style:dashed;opacity:0.3';
    if(it.status==='completed')step.style.opacity='1';
    if(it.status==='inProgress')step.style.opacity='0.7';
    const dot=ce('div');
    dot.style.cssText='position:absolute;left:-0.55rem;top:1.2rem;width:0.8rem;height:0.8rem;border-radius:50%;background:currentColor;border:2px solid var(--bg,#000)';
    step.appendChild(dot);
    const name=ce('div');name.style.cssText='font-weight:700';name.textContent=it.name;
    const status=ce('div');status.style.cssText='font-size:0.8rem;opacity:0.7;margin-top:0.2rem';
    status.textContent=(c.status&&c.status[it.status])||it.status;
    step.appendChild(name);step.appendChild(status);
    timeline.appendChild(step);
  });
  root.appendChild(timeline);
}

function renderContact(){
  const root=document.getElementById('contact-render');
  if(!root||!I18N.dict)return;
  // Don't wipe — preserve existing buttons if present
  // We'll rebuild cleanly
  root.textContent='';
  const c=I18N.dict.contact;
  const links=[
    {k:'email',u:'mailto:contact@layerzeppelin.pt',i:'✉'},
    {k:'github',u:'https://github.com/HSMTFPS',i:'◐'},
    {k:'linkedin',u:'https://linkedin.com/in/herminio-teles',i:'in'},
    {k:'tryhackme',u:'https://tryhackme.com/p/HSMTFPS',i:'⌬'}
  ];
  links.forEach(l=>{
    if(!Sec.isAllowedUrl(l.u)&&!l.u.startsWith('mailto:'))return;
    const a=ce('a','contact-link');
    a.href=l.u;
    if(!l.u.startsWith('mailto:')){a.target='_blank';a.rel='noopener noreferrer'}
    const ico=ce('span');ico.textContent=l.i;
    ico.style.cssText='display:inline-block;width:1.5rem;text-align:center;margin-right:0.5rem;font-weight:700';
    const lbl=ce('span');lbl.textContent=c[l.k]||l.k;
    a.appendChild(ico);a.appendChild(lbl);
    root.appendChild(a);
  });
}

function renderAll(){
  renderSkills();
  renderCerts();
  renderCTF();
  renderProjects();
  renderWriteups();
  renderTools();
  renderJourney();
  renderContact();
}

/* ============================================================
   EASTER EGGS — password challenges, secret code, room27, konami, hardware
   ============================================================ */
const Challenges={
  // Expected answers (case-insensitive, trimmed)
  answers:{
    'password-input':'Sporting1906',
    'rockyou-input':'password123'
  },

  check(inputId,errId,okId,answer,okMsg){
    const input=document.getElementById(inputId),err=document.getElementById(errId),ok=document.getElementById(okId);
    if(!input)return;
    err.textContent='';ok.textContent='';
    const v=(input.value||'').trim();
    if(!v){err.textContent='⚠️ Introduza uma password';return}
    if(v.toLowerCase()===answer.toLowerCase()){
      ok.textContent=okMsg;
      input.value='';
      return true;
    }else{
      err.textContent='❌ ACCESS DENIED - Password incorreta';
      input.value='';
      return false;
    }
  },

  init(){
    const self=this;
    const show=id=>{const p=document.getElementById(id);if(p)p.hidden=false};
    const hide=id=>{const p=document.getElementById(id);if(p)p.hidden=true};
    const focus=id=>{const i=document.getElementById(id);if(i)i.focus()};

    document.addEventListener('click',e=>{
      const t=e.target.closest('[data-action]');
      if(!t)return;
      const a=t.getAttribute('data-action');
      switch(a){
        case 'open-easter':show('easter-egg-panel');break;
        case 'close-easter':hide('easter-egg-panel');break;
        case 'open-secret':show('secret-code-panel');focus('secret-code-input');break;
        case 'close-secret':hide('secret-code-panel');break;
        case 'open-rockyou':show('rockyou-panel');focus('rockyou-input');break;
        case 'close-rockyou':hide('rockyou-panel');break;
        case 'open-password':show('password-challenge-panel');focus('password-input');break;
        case 'close-password':hide('password-challenge-panel');break;
        case 'close-room27':hide('room27-panel');break;
        case 'submit-password':
          self.check('password-input','password-error','password-success','Sporting1906','🎉 PARABÉNS! Descobriste o segredo! Sporting Clube de Portugal, fundado em 1906.');
          break;
        case 'submit-rockyou':
          self.check('rockyou-input','rockyou-error','rockyou-success','password123','🔓 HASH CRACKED! Password: password123 — Lição: Nunca uses passwords comuns!');
          break;
        case 'submit-secret':{
          const inp=document.getElementById('secret-code-input'),er=document.getElementById('secret-error');
          if(!inp)break;
          const s=(inp.value||'').replace(/[^0-9#]/g,'');
          if(s==='27'||s==='#27'){hide('secret-code-panel');show('room27-panel');inp.value='';if(er)er.textContent=''}
          else{if(er)er.textContent='ACESSO NEGADO - Código inválido';inp.value=''}
          break;
        }
      }
    });

    // Enter key support for all challenge inputs
    document.querySelectorAll('#password-input,#rockyou-input,#secret-code-input').forEach(el=>{
      el.addEventListener('keydown',e=>{
        if(e.key!=='Enter')return;
        e.preventDefault();
        const id=el.id;
        if(id==='password-input'){
          self.check('password-input','password-error','password-success','Sporting1906','🎉 PARABÉNS! Descobriste o segredo! Sporting Clube de Portugal, fundado em 1906.');
        }else if(id==='rockyou-input'){
          self.check('rockyou-input','rockyou-error','rockyou-success','password123','🔓 HASH CRACKED! Password: password123 — Lição: Nunca uses passwords comuns!');
        }else if(id==='secret-code-input'){
          const s=(el.value||'').replace(/[^0-9#]/g,'');
          if(s==='27'||s==='#27'){document.getElementById('secret-code-panel').hidden=true;document.getElementById('room27-panel').hidden=false;el.value=''}
          else{document.getElementById('secret-error').textContent='ACESSO NEGADO';el.value=''}
        }
      });
    });

    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        ['easter-egg-panel','secret-code-panel','password-challenge-panel','rockyou-panel','room27-panel'].forEach(id=>{const p=document.getElementById(id);if(p)p.hidden=true});
      }
    });
  }
};

/* ============================================================
   KONAMI CODE — shows fsociety panel
   ============================================================ */
const Konami={
  seq:['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'],
  buf:[],
  init(){
    document.addEventListener('keydown',e=>{
      this.buf.push(e.code);this.buf=this.buf.slice(-10);
      if(this.buf.join(',')===this.seq.join(',')){this.show();this.buf=[]}
    });
  },
  show(){
    let p=document.getElementById('konami-panel');
    if(p)p.remove();
    p=ce('div','konami-panel');
    p.id='konami-panel';
    p.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10003;display:flex;align-items:center;justify-content:center;padding:1rem';
    const c=ce('div');
    c.style.cssText='background:#0a0a0a;border:2px solid #e00;border-radius:12px;padding:2rem;max-width:700px;text-align:center;position:relative;box-shadow:0 0 50px rgba(255,0,0,0.3)';
    const pre=ce('pre');
    pre.textContent='    ██████╗ ██████╗ ███████╗ █████╗\n   ██╔══██╗██╔══██╗██╔════╝██╔══██╗\n   ██████╔╝██████╔╝█████╗  ███████║\n   ██╔══██╗██╔══██╗██╔══╝  ██╔══██║\n   ██║  ██║██████╔╝███████╗██║  ██║\n   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝';
    pre.style.cssText='color:#e00;font-size:0.6rem;line-height:1;text-shadow:0 0 10px rgba(255,0,0,0.5)';
    const h=ce('h3');h.textContent='fsociety';h.style.cssText='color:#e00;text-shadow:0 0 10px #f00;margin:1rem 0';
    const q=ce('p');q.textContent='"Our democracy has been hacked."';q.style.cssText='color:#888;font-style:italic';
    const x=ce('button');x.textContent='×';x.style.cssText='position:absolute;top:1rem;right:1rem;background:transparent;border:1px solid #e00;color:#e00;width:35px;height:35px;border-radius:50%;font-size:1.5rem;cursor:pointer';
    x.addEventListener('click',()=>p.remove());
    c.appendChild(x);c.appendChild(pre);c.appendChild(h);c.appendChild(q);
    p.appendChild(c);document.body.appendChild(p);
  }
};

/* ============================================================
   SECRET EASTER EGG — keyboard "LAYER" → cycle to next theme
   ============================================================ */
const EasterEgg={
  buf:'',
  init(){
    document.addEventListener('keydown',e=>{
      if(e.target.matches('input,textarea'))return;
      this.buf=(this.buf+e.key).slice(-C.secretCode.length);
      if(this.buf===C.secretCode){
        const i=Theme.THEMES.indexOf(Theme.cur);
        const next=Theme.THEMES[(i+1)%Theme.THEMES.length];
        Theme.set(next);
        Theme.updateMini();
      }
    });
  }
};

/* ============================================================
   BOOT
   ============================================================ */
function boot(){
  // Start theme + canvas immediately — don't wait for i18n fetch
  Theme.init();
  CanvasFx.init();
  CanvasFx.activate(Theme.cur);
  Modal.init();
  Nav.init();
  LangBtn.init();
  EasterEgg.init();
  Challenges.init();
  Konami.init();
  // Load i18n in parallel
  I18N.init().then(()=>{
    renderAll();
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot);
}else{
  boot();
}

})();
