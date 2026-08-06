/**
 * Pragya chat widget — the exact snippet pasted into pyshk.com (WPCode footer).
 * Extracted from an inline <script> so the Content Security Policy can forbid
 * inline scripts. On pyshk.com the snippet stays inline (that page has its own
 * CSP); this file is what the demo page loads.
 */
    (function(){
      var t=document.getElementById('pragya-toggle'),
          f=document.getElementById('pragya-frame'),
          h=document.getElementById('pragya-hello'),
          badge=document.getElementById('pragya-badge'),
          logo=document.getElementById('pragya-logo'),
          close=document.getElementById('pragya-close'),
          o=false;

      // Base URL of the chatbot app. Leave "" here (same origin); on
      // pyshk.com set it to the deployed URL, e.g. "https://pragya-ai-assistant.vercel.app"
      var API="";

      // The launcher bubble always shows the admin's current mascot. Pointing
      // at this endpoint means uploading a new mascot in the dashboard updates
      // the bubble automatically — no snippet edit required.
      if(logo) logo.src=(API||"")+"/api/chat/mascot";

      // Rotating teaser messages — a random one pops up periodically so the
      // visitor's eye keeps returning to the chat. These defaults are
      // replaced by the admin-configured list from the dashboard.
      var teasers=[
        "Namaste 🙏 Questions? Chat with us!",
        "Try 3 classes for HK$450 — ask me how!",
        "🎉 Up to 25% OFF — ask about the offer!",
        "New to yoga? I'll suggest your first class 🧘",
        "Ask me in English, हिंदी or 中文!",
        "Curious about Teacher Training? Ask away 🎓"
      ];
      // Load the live, admin-editable teasers (falls back to the list above).
      fetch(API+"/api/chat/teasers").then(function(r){return r.json();}).then(function(d){
        if(d && Array.isArray(d.teasers) && d.teasers.length) teasers=d.teasers;
      }).catch(function(){});
      var anims=['pw-anim-bounce','pw-anim-wiggle','pw-anim-heartbeat'];

      function openChat(){
        o=!o;
        f.style.display=o?'block':'none';
        logo.style.display=o?'none':'block';
        close.style.display=o?'block':'none';
        h.style.display='none';
        badge.style.display='none';
      }
      t.addEventListener('click',openChat);
      h.addEventListener('click',openChat);
      t.addEventListener('mouseenter',function(){ t.style.transform='scale(1.08)'; });
      t.addEventListener('mouseleave',function(){ t.style.transform='scale(1)'; });

      function react(){
        var a=anims[Math.floor(Math.random()*anims.length)];
        t.classList.add(a,'pw-ring');
        setTimeout(function(){ t.classList.remove(a,'pw-ring'); },1500);
      }
      function tease(msg){
        if(o) return;
        h.textContent=msg||teasers[Math.floor(Math.random()*teasers.length)];
        h.style.display='block';
        setTimeout(function(){ if(!o) h.style.display='none'; },7000);
      }

      // Right after the bubble flies in (~1.4s), give it a little "hello"
      // wobble + first teaser so it immediately grabs attention.
      setTimeout(function(){ if(!o){ react(); tease(teasers[0]); } },1500);

      // Admin General settings: teaser frequency, notification badge, and the
      // breathing animation are all configurable from the dashboard.
      var tickMs=9000;
      fetch(API+"/api/chat/config").then(function(r){return r.json();}).then(function(d){
        var g=(d&&d.general)||{};
        if(g.teaserSeconds) tickMs=Math.min(60,Math.max(3,g.teaserSeconds))*1000;
        if(g.showBadge===false && badge) badge.style.display='none';
        if(g.features && g.features.breathing===false && logo) logo.style.animation='none';
      }).catch(function(){});

      // Self-scheduling loop (re-reads tickMs each time, so a saved change in the
      // dashboard takes effect without reloading): a random reaction, and every
      // other time a rotating teaser. Keeps the eye returning to the bubble.
      var tick=0;
      (function loop(){
        setTimeout(function(){
          if(!o){ tick++; react(); if(tick%2===0) tease(); }
          loop();
        }, tickMs);
      })();
    })();
