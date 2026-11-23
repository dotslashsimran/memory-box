/** Shared CSS injection for form + settings (kept out of style.css which the lead owns). */
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/600.css';
import '@fontsource/silkscreen/400.css';
import '@fontsource/gaegu/400.css';
import '@fontsource/gaegu/700.css';
import { C } from '../palette';

const CSS = `
.mb-ov{position:fixed;inset:0;background:${C.cocoa}99;display:flex;align-items:center;justify-content:center;z-index:100;padding:12px;box-sizing:border-box;font-family:'Pixelify Sans',monospace;color:${C.cocoa}}
.mb-card{background:${C.cream};border:4px solid ${C.cocoa};box-shadow:0 4px 0 ${C.cocoa},6px 10px 0 ${C.rose}55;max-width:380px;width:100%;max-height:100%;overflow:auto;padding:16px;box-sizing:border-box;image-rendering:pixelated;
 clip-path:polygon(0 8px,4px 8px,4px 4px,8px 4px,8px 0,calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 4px) calc(100% - 8px),calc(100% - 4px) calc(100% - 4px),calc(100% - 8px) calc(100% - 4px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 4px),4px calc(100% - 4px),4px calc(100% - 8px),0 calc(100% - 8px))}
.mb-card h2{font-family:'Silkscreen',monospace;font-size:16px;margin:0 0 12px;text-align:center;color:${C.rose};letter-spacing:1px}
.mb-types{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.mb-type{font:inherit;font-family:'Silkscreen',monospace;font-size:10px;background:${C.cream};color:${C.cocoa};border:3px solid ${C.cocoa};padding:8px 2px;cursor:pointer;min-height:44px;box-shadow:0 3px 0 ${C.cocoa}}
.mb-type[aria-pressed=true]{background:${C.milk};transform:translateY(2px);box-shadow:0 1px 0 ${C.cocoa}}
.mb-type .e{display:block;font-size:18px;margin-bottom:2px}
.mb-card label{display:block;font-family:'Silkscreen',monospace;font-size:10px;margin:10px 0 4px}
.mb-card input[type=text],.mb-card input[type=date],.mb-card textarea{width:100%;box-sizing:border-box;font-family:'Gaegu','Pixelify Sans',cursive;font-size:20px;background:#fff;background:${C.cream};color:${C.cocoa};border:3px solid ${C.cocoa};padding:6px 8px;border-radius:0;outline:none;min-height:44px}
.mb-card input:focus,.mb-card textarea:focus{background:${C.butter}66;border-color:${C.rose}}
.mb-card textarea{min-height:90px;resize:none}
.mb-file{display:block;text-align:center;background:${C.butter};border:3px dashed ${C.cocoa};padding:10px;cursor:pointer;font-family:'Silkscreen',monospace;font-size:11px;margin:0}
.mb-file input{display:none}
.mb-prev{display:block;margin:8px auto 0;width:144px;height:144px;image-rendering:pixelated;border:3px solid ${C.cocoa};background:${C.sage}}
.mb-prev[hidden]{display:none}
.mb-prev[hidden]{display:none}
.mb-row{display:flex;gap:10px;margin-top:16px}
.mb-btn{flex:1;font-family:'Silkscreen',monospace;font-size:12px;border:3px solid ${C.cocoa};padding:10px;cursor:pointer;min-height:44px;color:${C.cocoa};background:${C.cream};box-shadow:0 3px 0 ${C.cocoa}}
.mb-btn.go{background:${C.rose};color:${C.cream}}
.mb-btn:active{transform:translateY(2px);box-shadow:0 1px 0 ${C.cocoa}}
.mb-btn:disabled{opacity:.5}
.mb-err{color:${C.rose};font-size:13px;min-height:16px;text-align:center;margin-top:6px}
.mb-gear{position:fixed;top:10px;right:10px;z-index:50;width:44px;height:44px;background:${C.cream};border:3px solid ${C.cocoa};box-shadow:0 3px 0 ${C.cocoa};cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}
.mb-gear svg{width:27px;height:27px;image-rendering:pixelated}
.mb-menu{position:fixed;top:60px;right:10px;z-index:50;background:${C.cream};border:3px solid ${C.cocoa};box-shadow:0 3px 0 ${C.cocoa};padding:8px;display:flex;flex-direction:column;gap:8px;min-width:200px;font-family:'Pixelify Sans',monospace;color:${C.cocoa}}
.mb-menu[hidden]{display:none}
.mb-menu .mb-btn{text-align:left;font-size:11px;display:flex;align-items:center;gap:8px;flex:none}
.mb-menu svg{width:18px;height:18px;flex:none}
.mb-menu .note{font-size:12px;text-align:center;min-height:14px}
`;
let done = false;
export function injectCss(): void {
  if (done) return;
  done = true;
  const s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);
}
