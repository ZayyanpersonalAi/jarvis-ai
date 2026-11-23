import { NextResponse } from "next/server";

// /widget.js — Jarvis widget for any site (plain JS). English UI;
// the chat itself understands Urdu, Roman Urdu and English too.
const SCRIPT = `(function(){
  var slug = document.currentScript && document.currentScript.getAttribute('data-business') || 'demo';
  var btn = document.createElement('button');
  btn.textContent = 'Talk to Jarvis';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;background:linear-gradient(135deg,#2dd4bf,#22d3ee);color:#052e2b;border:none;border-radius:999px;padding:12px 18px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35)';
  var panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:9999;width:320px;max-width:90vw;background:#121829;border:1px solid rgba(148,163,184,0.2);border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.5);display:none;overflow:hidden;font-family:sans-serif;color:#edf1f8';
  panel.innerHTML = '<div style="background:#0d1526;color:#fff;padding:12px;font-weight:bold">Jarvis AI — ' + slug + '</div><div id="jarvis-msgs" style="padding:12px;height:200px;overflow:auto;font-size:14px">Hi! I\\'m Jarvis — how can I help you today?</div><div style="display:flex;border-top:1px solid rgba(148,163,184,0.2)"><input id="jarvis-input" style="flex:1;border:none;padding:10px;outline:none;background:#0f1526;color:#edf1f8" placeholder="Type here…" /><button id="jarvis-send" style="background:#2dd4bf;color:#052e2b;border:none;padding:0 14px;cursor:pointer;font-weight:600">Send</button></div>';
  btn.onclick = function(){ panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };
  panel.querySelector('#jarvis-send').onclick = async function(){
    var input = panel.querySelector('#jarvis-input');
    var text = input.value.trim(); if(!text) return;
    var box = panel.querySelector('#jarvis-msgs');
    box.innerHTML += '<p><b>You:</b> ' + text.replace(/</g,'&lt;') + '</p>';
    input.value = '';
    try {
      var res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: text, language: 'en' }) });
      var j = await res.json();
      box.innerHTML += '<p><b>Jarvis:</b> ' + (j.reply || 'Sorry, no reply.').replace(/</g,'&lt;') + '</p>';
    } catch(e){ box.innerHTML += '<p>Sorry, could not connect.</p>'; }
    box.scrollTop = box.scrollHeight;
  };
  document.body.appendChild(btn); document.body.appendChild(panel);
})();`;

export async function GET() {
  return new NextResponse(SCRIPT, { headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=3600" } });
}
