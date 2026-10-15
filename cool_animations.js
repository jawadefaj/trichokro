/* TriChokro decorative animation: adaptive and paused while offscreen. */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particle-canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 767px)');
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  if (canvas && !reduced.matches && !saveData && !small.matches) {
    const ctx = canvas.getContext('2d', { alpha:true });
    if (ctx) {
      const count = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 24 : 45;
      let particles = [], raf = 0, active = true, last = 0;
      function sizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.min(rect.width || innerWidth, innerWidth));
        const h = Math.max(1, Math.min(rect.height || innerHeight, innerHeight));
        // Avoid creating a 4K backing canvas on high-density devices.
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
        particles = Array.from({length:count}, () => ({
          x:Math.random()*w, y:Math.random()*h,
          vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45,
          radius:Math.random()*1.6+.5
        }));
      }
      function draw(now) {
        raf = 0;
        if (!active || document.hidden) return;
        // 30fps cap prevents a heavy background effect from occupying every frame.
        if (now-last >= 32) {
          last=now;
          const w=canvas.width/Math.min(devicePixelRatio||1,1.5);
          const h=canvas.height/Math.min(devicePixelRatio||1,1.5);
          ctx.clearRect(0,0,w,h);
          particles.forEach((p,i)=> {
            p.x=(p.x+p.vx+w)%w; p.y=(p.y+p.vy+h)%h;
            ctx.fillStyle='rgba(100,255,218,.45)';
            ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fill();
            // Connect only nearby points, calculate squared distance (no sqrt per pair).
            for(let j=i+1;j<particles.length;j++) {
              const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,d2=dx*dx+dy*dy;
              if(d2<10000) {
                ctx.strokeStyle=`rgba(100,255,218,${.14*(1-d2/10000)})`;
                ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
              }
            }
          });
        }
        raf=requestAnimationFrame(draw);
      }
      function start() { if (!raf && active && !document.hidden) raf=requestAnimationFrame(draw); }
      sizeCanvas();
      const obs=new IntersectionObserver(entries=>{
        active=entries[0].isIntersecting;
        if (!active && raf) {cancelAnimationFrame(raf);raf=0;}
        if (active) start();
      },{threshold:0.01});
      obs.observe(canvas);
      document.addEventListener('visibilitychange',start);
      let resizeTimer;
      addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{sizeCanvas();start();},150);},{passive:true});
      start();
    }
  }

  // Each counter animates at most once, and only when visible.
  const counters = [...document.querySelectorAll('.counter[data-target]')];
  const updateCounter=el=>{
    const target=Number(el.dataset.target);
    if (!Number.isFinite(target)) return;
    if (reduced.matches) {el.textContent=String(target);return;}
    const start=performance.now();
    function frame(now){
      const progress=Math.min(1,(now-start)/850);
      el.textContent=String(Math.round(target*(1-Math.pow(1-progress,3))));
      if (progress<1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver((entries,obs)=>entries.forEach(e=>{
      if(e.isIntersecting){updateCounter(e.target);obs.unobserve(e.target);}
    }),{threshold:.1});
    counters.forEach(el=>observer.observe(el));
  } else counters.forEach(updateCounter);

  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced.matches) {
    document.querySelectorAll('.magnetic-btn').forEach(btn=>{
      btn.addEventListener('mousemove',e=>{
        const r=btn.getBoundingClientRect();
        btn.style.translate=`${((e.clientX-r.left)-r.width/2)*.18}px ${((e.clientY-r.top)-r.height/2)*.18}px`;
      },{passive:true});
      btn.addEventListener('mouseleave',()=>{btn.style.translate='0 0';});
    });
  }
});
