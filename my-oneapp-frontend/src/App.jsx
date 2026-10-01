import { useCallback, useEffect, useRef, useState } from 'react';

/* ---------- Styles (inlined so the whole UI lives in one file) ---------- */
const CSS = `
:root {
  --bg: #101010; --panel: #1e1e1e; --raise: #2b2b2b; --line: #262626;
  --text: #f2f2f2; --text-2: #c9c9c9;
  --green: #3bb95a; --green-solid: #2fa84a; --red: #e52d45; --cyan: #1fb3d3;
  --font: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}
*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font); font-size: 13px; line-height: 1.3; letter-spacing: .01em; -webkit-font-smoothing: antialiased; }
h2, p { margin: 0; }
button { font: inherit; letter-spacing: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
button:focus-visible { outline: 2px solid var(--green); outline-offset: 2px; }
.num { font-variant-numeric: tabular-nums; }
.icon { fill: none; stroke: var(--green); stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; flex: none; }
.icon .acc { stroke: var(--red); }
.row { display: flex; align-items: center; }

.app { width: min(100%, 540px); margin: 0 auto; padding: 0 0 96px; min-height: 100vh; }
main { padding: 0 14px; }
main > * + * { margin-top: 15px; }

/* Header */
.topbar { display: flex; justify-content: space-between; align-items: center; height: 70px; padding: 0 14px; border-bottom: 1px solid var(--line); margin-bottom: 18px; }
.user { display: flex; align-items: center; gap: 8px; }
.avatar { position: relative; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 16px; background: linear-gradient(145deg, #c99677, #5e3b2c); }
.avatar-badge { position: absolute; right: -3px; bottom: -3px; width: 13px; height: 13px; border-radius: 50%; background: #dfeee3; display: grid; place-items: center; border: 1.5px solid var(--bg); }
.avatar-badge .icon { stroke: var(--green-solid); }
.greeting { font-size: 13px; color: var(--text-2); }
.user-name { font-size: 14px; font-weight: 500; margin-top: 4px; }
.icon-btn { position: relative; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: #222; }
.dot { position: absolute; top: 6px; right: 7px; width: 6px; height: 6px; border-radius: 50%; background: #ff3b4f; }
.ghost-btn { display: grid; place-items: center; width: 28px; height: 28px; }
.ghost-btn .icon { stroke: #9a9a9a; }
.panel-head .ghost-btn .icon { stroke: #e6e6e6; }

/* Balance carousel */
.carousel { display: flex; gap: 15px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin: 0 -14px; padding: 0 14px; scroll-padding: 0 14px; }
.carousel::-webkit-scrollbar { display: none; }
.card { flex: 0 0 75%; scroll-snap-align: start; height: 144px; padding-left: 3.5px; border-radius: 20px; background: linear-gradient(180deg, #34b34d 10%, #1fb3d3 100%); }
.card-in { position: relative; height: 100%; padding: 14px; border-radius: 17px 19px 19px 17px; background: #1d1d1d; overflow: hidden; }
.mesh { background:
  linear-gradient(30deg, transparent 49.5%, rgba(59,185,90,.16) 50%, transparent 50.5%) 0 0/70px 48px,
  linear-gradient(150deg, transparent 49.5%, rgba(59,185,90,.16) 50%, transparent 50.5%) 0 0/70px 48px,
  linear-gradient(80deg, transparent 49.5%, rgba(59,185,90,.12) 50%, transparent 50.5%) 0 0/120px 90px, #1d1d1d; }
.card-label { color: var(--green); font-weight: 600; font-size: 13px; margin-bottom: 9px; }
.amount-row { display: flex; align-items: center; gap: 8px; }
.amount { font-size: 18px; font-weight: 600; letter-spacing: 0; }
.meta { font-size: 12.5px; color: var(--text-2); margin: 5px 0 6px; }
.air { font-size: 14px; margin: 12px 0 5px; }
.air-amt { display: block; font-size: 15px; margin-bottom: 14px; }
.btn-outline { width: 100%; height: 42px; border-radius: 8px; border: 1.5px solid var(--green-solid); color: var(--green); font-weight: 600; font-size: 14px; background: rgba(0,0,0,.25); }
.pager { display: flex; justify-content: center; gap: 7px; margin: 9px 0 18px; }
.pager span { width: 11px; height: 4px; border-radius: 4px; background: #5c6474; transition: all .2s; }
.pager span.on { width: 18px; background: var(--green-solid); }

/* Panels */
.panel { background: var(--panel); border-radius: 16px; padding: 15px 14px 16px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; height: 17px; margin-bottom: 22px; }
.panel h2, .section-title { font-size: 13.5px; font-weight: 600; letter-spacing: .01em; }
.section-title { margin: 0 0 13px; }
.link { display: inline-flex; align-items: center; gap: 3px; color: var(--green); font-size: 13.5px; font-weight: 500; }
.link .icon { stroke: var(--green); }

.item { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
.label { display: flex; flex-direction: column; font-size: 12.5px; font-weight: 500; line-height: 1.2; color: var(--text); }
.round { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; flex: none; transition: transform .12s; }
.round.dark { background: #323232; }
.round.pochi { background: var(--green-solid); }
.item:active .round, .item:active .square { transform: scale(.94); }
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); row-gap: 9px; }

/* Frequents */
.segmented { display: flex; gap: 7px; height: 36px; padding: 3.5px; border-radius: 18px; background: #363636; margin-bottom: 21px; }
.segmented button { width: 74px; border-radius: 15px; font-size: 13.5px; color: #dcdcdc; transition: background .15s; }
.segmented button.active { background: var(--green-solid); color: #fff; font-weight: 600; }
.freq-row { display: flex; }
.freq { width: 72px; }
.logo { width: 29px; height: 29px; }
.mark-text { font-weight: 800; font-size: 6.5px; line-height: 1.1; letter-spacing: 0; text-align: center; }
.mark-text.green { color: #178a37; } .mark-text.white { color: #fff; }
.mark-text.tiny { font-size: 5px; }
.empty { color: #8a8a8a; padding: 4px 0; }

/* Banner */
.banner { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 210px; border-radius: 13px; overflow: hidden; text-align: center; color: #fff;
  background: radial-gradient(circle at 0% 0%, #000 0, transparent 22%), radial-gradient(circle at 100% 0%, #000 0, transparent 22%), radial-gradient(circle at 50% 45%, #2b2b2b 0, #171717 75%); }
.b-logos { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.fm { width: 60px; height: 60px; border-radius: 50%; background: #fff; border: 3px solid #fff; outline: 2px solid #222; outline-offset: -5px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #d5202f; line-height: 1; }
.fm b { font-size: 17px; font-weight: 800; letter-spacing: -.02em; }
.fm i { font-size: 6px; font-weight: 700; font-style: normal; color: #111; margin-top: 2px; }
.b-rule { width: 1px; height: 56px; background: #d5202f; }
.tf { display: flex; flex-direction: column; align-items: center; line-height: .9; }
.tf em { font-style: normal; font-weight: 900; font-size: 22px; letter-spacing: 1px; color: transparent; -webkit-text-stroke: 1px #eee; }
.tf strong { font-family: 'Brush Script MT', 'Segoe Script', cursive; font-style: italic; font-size: 30px; color: #e5202f; margin-top: -2px; }
.tf small { background: #fff; color: #222; font-weight: 800; font-size: 8px; padding: 1px 6px; letter-spacing: .5px; }
.b-bar { background: #d5202f; font-weight: 800; font-size: 9.5px; padding: 3px 18px; margin: 3px 0 5px; letter-spacing: .5px; clip-path: polygon(2% 0, 100% 8%, 98% 100%, 0 92%); }
.b-sub { font-size: 6.5px; margin-bottom: 8px; }
.b-cta { font-size: 13px; font-weight: 700; line-height: 1.2; }
.b-cta b { color: #3ed35a; }
.b-dots { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 2px; }
.b-dots i { width: 6px; height: 3px; background: #666; transform: skew(-25deg); }
.b-dots i.on { width: 14px; background: #fff; }

/* Finances */
.h-scroll { display: flex; overflow-x: auto; scrollbar-width: none; margin: 0 -14px; padding: 0 14px; }
.h-scroll::-webkit-scrollbar { display: none; }
.fin { flex: 0 0 72px; }
.square { width: 43px; height: 43px; border-radius: 10px; display: grid; place-items: center; transition: transform .12s; }
.disc { width: 37px; height: 37px; border-radius: 50%; display: grid; place-items: center; }
.dots { width: 18px; height: 18px; background: radial-gradient(circle, #fff 1.6px, transparent 2px) 0 0/6px 6px; }
.ent { padding: 14px 11px; }

/* FAB + toast */
.fab { position: fixed; right: max(14px, calc(50% - 256px)); bottom: 22px; z-index: 20; display: inline-flex; align-items: center; gap: 12px; height: 47px; padding: 0 19px 0 15px; border-radius: 14px; background: #333; box-shadow: 0 8px 22px rgba(0,0,0,.55); font-size: 14px; font-weight: 500; letter-spacing: .06em; }
.toast { position: fixed; left: 50%; bottom: 84px; z-index: 30; transform: translate(-50%, 12px); opacity: 0; pointer-events: none; padding: 10px 16px; border-radius: 10px; background: #333; font-size: 13px; transition: opacity .2s, transform .2s; }
.toast.show { opacity: 1; transform: translate(-50%, 0); }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; scroll-behavior: auto !important; } }

/* Send Money screen */
.sm-head { display: grid; grid-template-columns: 36px 1fr 36px; align-items: center; height: 64px; padding: 0 14px; margin-top: 10px; }
.sm-title { text-align: center; font-size: 15px; font-weight: 500; }
.sm-body { padding: 0 14px; }
.seg2 { display: grid; grid-template-columns: 1fr 1fr; height: 50px; padding: 3.5px; border-radius: 25px; background: #333; box-shadow: 0 0 0 1px #262626; }
.seg2 button { border-radius: 22px; font-size: 14px; font-weight: 600; color: #ddd; transition: background .15s; }
.seg2 button.active { background: #2fa04a; color: #fff; }
.sm-row { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; }
.sm-h { font-size: 14px; font-weight: 600; }
.sm-link { font-size: 12.5px; font-weight: 600; }
.fav { margin-top: 14px; }
.fav .round { width: 32px; height: 32px; background: #333; }
.fav .label { font-size: 12.5px; font-weight: 400; }
.sm-label { display: block; font-size: 13.5px; font-weight: 500; margin: 20px 0 8px; }
.field-wrap { position: relative; }
.field { display: flex; align-items: center; height: 50px; padding: 0 14px; border: 1px solid #3b4252; border-radius: 10px; }
.field:focus-within { border: 2px solid var(--green-solid); padding: 0 13px; }
.field input { flex: 1; min-width: 0; height: 100%; background: none; border: 0; outline: 0; color: var(--text); font: inherit; font-size: 14px; letter-spacing: .02em; }
.field input::placeholder { color: #cfcfcf; }
.field .sep { width: 1px; height: 26px; background: #fff; margin: 0 12px; }
.field .suffix { color: #ddd; font-size: 14px; margin-left: 8px; }
.tip { position: absolute; right: -6px; top: 57px; z-index: 2; padding: 7px 14px; border-radius: 14px; background: #f3f3f3; color: #555; font-size: 12px; letter-spacing: .05em; }
.tip::before { content: ''; position: absolute; top: -6px; right: 32px; border: 6px solid transparent; border-top: 0; border-bottom-color: #f3f3f3; }
.hint { font-size: 12px; color: var(--text-2); margin: 7px 0 0 2px; }
.hint.err { color: #ff6b7a; }
.pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 12px; }
.pay { position: relative; height: 50px; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 12px; text-align: left; border: 1px solid #3b4252; border-radius: 10px; background: #1a1a1a; }
.pay.sel { border: 1.5px solid var(--green-solid); }
.pay b { display: block; font-size: 14px; font-weight: 500; }
.pay small { display: block; font-size: 12.5px; color: #ccc; margin-top: 3px; }
.pay .s { width: 22px; height: 22px; border-radius: 50%; background: #0f3a1d; color: var(--green); display: grid; place-items: center; font-weight: 800; font-size: 13px; }
.tick { position: absolute; top: 0; right: 0; width: 20px; height: 20px; background: var(--green-solid); clip-path: polygon(0 0, 100% 0, 100% 100%); }
.tick .icon { position: absolute; top: 2px; right: 2px; stroke: #fff; stroke-width: 2.5; }
.continue { width: 100%; height: 43px; margin-top: 22px; border-radius: 8px; background: #333; color: #b5b5b5; font-size: 14.5px; font-weight: 600; transition: background .15s, color .15s; }
.continue:disabled { cursor: not-allowed; }
.continue.on { background: var(--green-solid); color: #fff; }
.more-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 14px; }
.more { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 16px 6px; border-radius: 16px; background: #1f1f1f; font-size: 14px; font-weight: 500; line-height: 1.35; text-align: center; }
.more .label { font-size: 14px; }

/* Confirm / PIN / Success */
.face { display: grid; place-items: center; border-radius: 50%; font-weight: 700; color: #fff; background: linear-gradient(145deg, #c99677, #5e3b2c); flex: none; overflow: hidden; }
.cta { position: fixed; left: 50%; bottom: 28px; z-index: 10; transform: translateX(-50%); width: min(calc(100% - 22px), 518px); height: 40px; border-radius: 8px; background: #2fa63c; color: #fff; font-size: 15px; font-weight: 600; letter-spacing: .1em; }
.cta:disabled { background: #333; color: #8f8f8f; cursor: not-allowed; }
.confirm { display: flex; flex-direction: column; min-height: 100vh; }
.confirm-mid { flex: 1; display: flex; align-items: center; padding: 0 18px 110px; }
.tcard { position: relative; width: 100%; padding-top: 2px; border-radius: 16px; background: linear-gradient(90deg, #1f8fd1, #14c04a 50%, #00d43b); }
.tcard-in { position: relative; background: #1f1f1f; border-radius: 14px 14px 16px 16px; }
.ring { position: absolute; left: 50%; top: -34px; transform: translateX(-50%); z-index: 2; width: 65px; height: 65px; border-radius: 50%; border: 3px solid #3b4252; background: #1a1a1a; display: grid; place-items: center; }
.t-title { padding: 52px 14px 15px; text-align: center; font-size: 15px; font-weight: 500; border-bottom: 1px solid #3b4252; }
.t-rows { padding: 8px 14px 24px; }
.t-row { padding: 11px 0 6px; border-bottom: 1px solid #cfd3dc; }
.t-row:last-child { border-bottom: 0; }
.t-row:focus-within { border-bottom-color: var(--green-solid); }
.t-row small { display: block; font-size: 12.5px; line-height: 1.2; color: #bbb; margin-bottom: 3px; }
.t-row strong, .t-row input { display: block; width: 100%; font-size: 15px; line-height: 1.25; font-weight: 600; }
.t-row input { background: none; border: 0; outline: 0; padding: 0; color: var(--text); font-family: inherit; letter-spacing: inherit; caret-color: var(--green); }
.t-row input::placeholder { color: #777; font-weight: 400; }
.pin { display: flex; flex-direction: column; min-height: 100vh; }
.pin-top { display: flex; flex-direction: column; align-items: center; margin-top: clamp(30px, 13vh, 165px); text-align: center; }
.pin-name { margin-top: 14px; font-size: 15px; font-weight: 500; color: #bbb; text-transform: uppercase; }
.pin-amt { margin-top: 10px; font-size: 13px; color: #bbb; }
.pin-boxes { display: flex; justify-content: center; gap: 14px; margin-top: clamp(40px, 12vh, 150px); }
.pin-box { width: 43px; height: 43px; border: 1px solid #d8d8d8; border-radius: 9px; display: grid; place-items: center; }
.pin-dot { width: 11px; height: 11px; border-radius: 50%; background: #fff; }
.keypad { margin-top: auto; padding: 0 0 46px; display: grid; grid-template-columns: repeat(3, 1fr); }
.key { height: 72px; display: grid; place-items: center; font-size: 30px; font-weight: 500; color: #fff; }
.key:active { background: rgba(255,255,255,.05); }
.ok-head { display: flex; justify-content: space-between; padding: 0 14px; margin-top: 8px; }
.ok-ring { position: relative; z-index: 2; width: 78px; height: 78px; margin: 15px auto -39px; border-radius: 50%; border: 3px solid #3b4252; background: #1a1a1a; display: grid; place-items: center; font-size: 34px; }
.ok { margin: 0 14px; }
.ok-body { padding: 56px 0 14px; text-align: center; }
.ok-title { margin: 0 24px; font-size: 20px; line-height: 26px; font-weight: 500; }
.ok-date { margin-top: 20px; font-size: 13px; color: #bbb; }
.ok-amt { margin-top: 22px; font-size: 24px; font-weight: 700; }
.ok-cost { margin-top: 20px; font-size: 12.5px; color: #ccc; }
.ok-cost b { color: #fff; font-weight: 600; }
.ok-id { display: inline-flex; align-items: center; gap: 8px; margin-top: 10px; color: var(--green); font-size: 14px; font-weight: 600; }
.ok-id .icon { stroke: var(--green); }
.to-box { margin: 28px 14px 0; padding: 14px; border-radius: 12px; background: #333; text-align: left; font-size: 13px; }
.to-row { display: flex; align-items: center; gap: 11px; margin-top: 8px; font-size: 14px; font-weight: 500; line-height: 21px; word-break: break-word; }
.acts { display: grid; grid-template-columns: repeat(4, 1fr); margin: 18px 0 0; }
.acts .round { background: #262626; }
.acts .label { max-width: 90px; }
.done { display: block; width: calc(100% - 28px); margin: 30px 14px 0; height: 43px; border-radius: 10px; background: #2ea044; color: #fff; font-size: 15px; font-weight: 600; }

/* Statements */
.st-search { display: flex; align-items: center; gap: 10px; width: calc(100% - 87px); height: 42px; padding: 0 12px; margin-top: 6px; border: 1px solid #3b4252; border-radius: 10px; }
.st-search:focus-within { border-color: var(--green-solid); }
.st-search input { flex: 1; min-width: 0; background: none; border: 0; outline: 0; color: var(--text); font: inherit; font-size: 15px; }
.st-search input::placeholder { color: var(--text); opacity: 1; }
.chips { display: flex; gap: 11px; margin-top: 15px; }
.chip-m { height: 32px; padding: 0 13px; border-radius: 16px; background: #333; color: #ddd; font-size: 13.5px; font-weight: 500; }
.chip-m.on { background: #2fa63c; color: #fff; font-weight: 600; }
.st-date { margin: 25px 0 6px; font-size: 14px; font-weight: 600; }
.st-group + .st-group .st-date { margin-top: 21px; }
.st-row { display: flex; align-items: center; gap: 11px; padding: 7px 0; }
.st-av { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 13.5px; font-weight: 700; flex: none; }
.st-mid { flex: 1; min-width: 0; font-size: 14.5px; line-height: 21.5px; }
.st-mid div { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-mid div + div { color: #bdbdbd; }
.st-end { text-align: right; font-size: 14.5px; line-height: 21.5px; flex: none; }
.st-end b { display: block; font-weight: 600; }
.st-end span { color: #bdbdbd; font-size: 14px; }
.st-empty { margin-top: 40px; text-align: center; color: #8a8a8a; }
.st-opts { position: fixed; right: max(21px, calc(50% - 249px)); bottom: 24px; z-index: 10; display: inline-flex; align-items: center; gap: 11px; height: 43px; padding: 0 20px 0 16px; border-radius: 22px; background: #353a37; color: var(--green); font-size: 14px; font-weight: 500; box-shadow: 0 8px 22px rgba(0,0,0,.5); }
.st-opts .icon { stroke: var(--green); }

/* Landing + login */
.landing { position: relative; min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; padding-bottom: 92px; }
.land-hero { position: relative; min-height: 62vh; padding-top: 58px; overflow: hidden; background: linear-gradient(180deg, #4b5764 0%, #8a8788 30%, #6b625c 46%, #1b1a1a 78%, var(--bg) 100%); -webkit-mask-image: linear-gradient(#000 70%, transparent); mask-image: linear-gradient(#000 70%, transparent); }
.skyline { position: absolute; left: 0; bottom: 8%; width: 100%; height: 130px; opacity: .55; }
.mock { position: relative; width: min(350px, 84vw); height: 440px; margin: 0 auto; border: 6px solid #d9d0c0; border-bottom: 0; border-radius: 46px 46px 0 0; background: #050505; overflow: hidden; -webkit-mask-image: linear-gradient(#000 50%, transparent 98%); mask-image: linear-gradient(#000 50%, transparent 98%); }
.island { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 92px; height: 26px; border-radius: 14px; background: #000; z-index: 2; }
.mock-in { height: 100%; margin: 8px 8px 0; padding: 62px 12px 0; border-radius: 36px 36px 0 0; background: #111; }
.pv-head { display: flex; align-items: center; justify-content: space-between; }
.pv-user { display: flex; align-items: center; gap: 8px; font-size: 11px; line-height: 1.3; }
.pv-av { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #1c2a6b; color: #7d9bff; font-size: 11px; font-weight: 700; }
.pv-btns { display: flex; gap: 6px; }
.pv-btns span { width: 30px; height: 30px; border-radius: 50%; background: #1d1d1d; display: grid; place-items: center; }
.pv-card { margin-top: 14px; padding: 11px 12px; border-radius: 14px; background: #1d1d1d; border-left: 3px solid var(--green); font-size: 10px; }
.pv-card b { display: block; margin: 4px 0 2px; font-size: 17px; font-weight: 600; }
.pv-card i { display: block; margin-top: 8px; padding: 7px 0; text-align: center; border: 1px solid var(--green-solid); border-radius: 7px; color: var(--green); font-style: normal; font-weight: 600; font-size: 11px; }
.pv-panel { margin-top: 12px; padding: 12px; border-radius: 14px; background: #1a1a1a; font-size: 11px; font-weight: 600; }
.pv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 4px; margin-top: 12px; }
.pv-i { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 8.5px; font-weight: 400; color: #ccc; text-align: center; }
.pv-i span { width: 30px; height: 30px; border-radius: 50%; background: #2e2e2e; display: grid; place-items: center; }
.land-copy { margin-top: auto; padding: 0 24px; text-align: center; }
.land-copy h1 { margin: 0; font-size: 19px; line-height: 1.55; font-weight: 500; letter-spacing: .01em; }
.land-copy .g { color: #3bb95a; }
.land-copy p { margin: 12px auto 0; max-width: 270px; font-size: 13px; color: #a9a9a9; line-height: 1.45; }
.land-dots { display: flex; justify-content: center; gap: 8px; margin-top: 24px; }
.land-dots i { width: 7px; height: 7px; border-radius: 50%; background: #ddd; }
.land-dots i.on { background: var(--green-solid); }
.notice { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; background: #16261d; font-size: 13px; font-weight: 500; line-height: 1.35; }
.login { display: flex; flex-direction: column; min-height: 100vh; }
.login .notice { margin: 14px 14px 0; }
.login-mid { flex: 1; display: flex; align-items: center; padding: 0 14px; }
.ring.lg { width: 78px; height: 78px; top: -41px; }
.lg-body { padding: 54px 14px 14px; text-align: center; }
.lg-body h1 { margin: 0; font-size: 20px; font-weight: 500; }
.lg-body > p { margin: 12px 2px 0; font-size: 13px; line-height: 1.4; color: #ccc; }
.signbox { margin-top: 26px; padding: 14px; border-radius: 12px; background: #2a2a2a; text-align: left; font-size: 14px; }
.login-row { display: flex; align-items: center; gap: 11px; margin-top: 14px; }
.login-row .pre { white-space: nowrap; font-size: 14.5px; font-weight: 500; }
.login-row input { flex: 1; min-width: 0; height: 32px; background: none; border: 0; border-bottom: 1px solid #555; outline: 0; color: var(--text); font: inherit; font-size: 14.5px; font-weight: 500; }
.login-row input:focus { border-bottom-color: var(--green-solid); }
.login-row input::placeholder { color: #777; font-weight: 400; }
.small-ring { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #3b4252; background: #202020; display: grid; place-items: center; flex: none; }
.note { display: flex; align-items: center; gap: 14px; margin: 0 14px 82px; padding: 13px 14px; border: 1px dashed #2f8f45; border-radius: 10px; font-size: 12.5px; line-height: 1.45; color: #ccc; }
.note .icon, .notice .icon { stroke: var(--green); }
.face.plain { background: #2a2a2a; }
.face.plain .icon { stroke: var(--green); }
.pin-notice { margin: 14px 14px 0; padding: 9px 14px; }
.pin-err { margin: 16px 24px 0; text-align: center; color: #ff6b7a; font-size: 13px; }

/* Entertainment + Do more + assistant */
.panel.ent { padding: 15px 12px 20px; }
.panel.ent h2 { margin-bottom: 14px; }
.ent-items { display: flex; gap: 21px; overflow-x: auto; scrollbar-width: none; }
.ent-items::-webkit-scrollbar { display: none; }
.ent-item { display: flex; flex-direction: column; align-items: center; gap: 9px; flex: none; font-size: 13px; color: #ddd; }
.ent-ic { width: 43px; height: 43px; border-radius: 12px; display: grid; place-items: center; overflow: hidden; }
.emo { font-size: 24px; line-height: 1; }
.baze { padding: 2px 6px; border-radius: 9px; background: linear-gradient(90deg, #ff4f7b, #ff9a3c 55%, #5b8cff); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0; }
.skiza { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle, #2fb44a 55%, #7ed957 100%); color: #ffe23a; font-size: 10px; font-weight: 800; text-shadow: 0 1px 0 #0b5a22; letter-spacing: 0; }
.vyb { padding: 5px 4px; border-radius: 5px; background: #1f9d49; color: #fff; font-size: 8px; font-weight: 800; letter-spacing: 0; }
.dm { margin-top: 12px; padding: 15px 14px 14px; }
.dm-head { display: flex; justify-content: space-between; align-items: flex-start; }
.dm-head h2 { font-size: 14px; }
.dm-sub { margin-top: 5px; font-size: 13px; color: #ddd; }
.dm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 26px; }
.dm-card { position: relative; height: 87px; padding: 12px 8px 0 11px; border-radius: 12px; background: #323232; display: grid; grid-template-columns: 20px 1fr; column-gap: 8px; align-content: start; text-align: left; font-size: 14.5px; font-weight: 500; line-height: 18px; }
.dm-card:active { background: #3a3a3a; }
.dm-card .emo { font-size: 20px; margin-top: 2px; }
.dm-logos { position: absolute; left: 40px; bottom: 14px; display: flex; }
.dm-logo { width: 22px; height: 22px; margin-left: -7px; border-radius: 50%; display: grid; place-items: center; font-size: 5.5px; font-weight: 800; letter-spacing: 0; box-shadow: 0 0 0 1px rgba(0,0,0,.35); overflow: hidden; }
.dm-logo:first-child { margin-left: 0; }
.dm-help { margin: 24px 0 10px; text-align: center; font-size: 14px; }
.dm-browse { display: block; width: 100%; height: 43px; border-radius: 10px; background: #2fa040; color: #fff; font-size: 15px; font-weight: 600; }
.assist { position: fixed; right: max(14px, calc(50% - 256px)); bottom: 94px; z-index: 15; width: 50px; height: 50px; display: grid; place-items: center; border-radius: 18px 4px 4px 18px; background: #2c2c2c; box-shadow: 0 6px 18px rgba(0,0,0,.45); }
.assist svg { display: block; border-radius: 50%; }
.fab .fab-t { white-space: nowrap; }
.fab.compact { width: 47px; padding: 0; justify-content: center; gap: 0; }
.fab.compact .fab-t { display: none; }

/* Withdraw */
.seg2.seg3 { grid-template-columns: repeat(3, 1fr); }
.cta.cont { height: 43px; letter-spacing: .01em; }

/* Lipa na M-PESA */
.pay-grid.pay-grid3 { grid-template-columns: repeat(3, 1fr); }
.pay.col { flex-direction: column; height: 78px; gap: 5px; }
.pay.col > span:not(.tick):not(.s) { text-align: center; }
.pay.col small { margin-top: 2px; }
.more-grid.two { grid-template-columns: 1fr 1fr; }
.more.wide { aspect-ratio: auto; height: 85px; justify-content: center; gap: 8px; }
.more.wide .round { width: 34px; height: 34px; background: #333; }
`;

/* ---------- Icons: green line + red accent (.acc), 24px grid ---------- */
const PATHS = {
  bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  eyeOff: <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /><path d="m4 4 16 16" /></>,
  eye: <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
  chevronUp: <path d="m5 15 7-7 7 7" />,
  chevronDown: <path d="m7 10 5 5 5-5" />,
  send: <><path d="M21 3 3 11l7 3 3 7 8-18Z" /><path d="m10 14 4-4" /></>,
  shop: <><path d="M5 10h14l-1.2 9H6.2L5 10Z" /><path className="acc" d="M8.5 10a3.5 3.5 0 0 1 7 0" /><path d="M9.5 13v3.5M12 13v3.5M14.5 13v3.5" /></>,
  withdraw: <><rect x="3" y="5" width="15" height="12" rx="2" /><path d="M6.5 9.5h4" /><path className="acc" d="M17 13v8M14 18l3 3 3-3" /></>,
  data: <><path d="M8 20V5M4.5 8.5 8 5l3.5 3.5" /><path className="acc" d="M16 4v15M12.5 15.5 16 19l3.5-3.5" /></>,
  phone: <><path d="M7 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 5 5a2 2 0 0 1 2-2Z" /><path className="acc" d="M14 4h6v6M20 4l-6 6" /></>,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3 6.5h18V9H3z" /><path className="acc" d="M12 6.5V20M12 6.5c-2.5 0-4-1-3.3-2.6.8-1.5 3.3.6 3.3 2.6Zm0 0c2.5 0 4-1 3.3-2.6-.8-1.5-3.3.6-3.3 2.6Z" /></>,
  house: <><path d="M4 11 12 4l8 7v9H4z" /><path className="acc" d="M8.5 14.5a5 5 0 0 1 7 0M10.3 16.8a2.5 2.5 0 0 1 3.4 0" /></>,
  scan: <><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" /><path className="acc" d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM14 14h2v2h-2z" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  back: <path d="m15 6-6 6 6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <><path d="M5 12h14" /><path className="acc" d="M12 5v14" /></>,
  contact: <><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle className="acc" cx="12" cy="10.5" r="2.6" /><path d="M7.5 17.5c1-2.5 2.8-3.5 4.5-3.5s3.5 1 4.5 3.5" /></>,
  users: <><circle cx="7.5" cy="5.5" r="2" /><circle cx="16.5" cy="5.5" r="2" /><circle className="acc" cx="12" cy="17.5" r="2.5" /><path d="M4 12.5a3.5 3 0 0 1 7 0M13 12.5a3.5 3 0 0 1 7 0" /></>,
  request: <><rect x="3" y="5" width="15" height="12" rx="2" /><circle cx="7.5" cy="10" r="1.5" /><path className="acc" d="M18 21v-8M15 16l3-3 3 3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /><path className="acc" d="M15 19c2-2 4-2 6-1" /></>,
  close: <><path d="M6 6l12 12" /><path className="acc" d="M18 6 6 18" /></>,
  share: <><path d="M8 10H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" /><path className="acc" d="M12 15V3M8.5 6.5 12 3l3.5 3.5" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
  refresh: <><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path className="acc" d="M18 3v4h-4" /></>,
  calEdit: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4" /><path className="acc" d="M4 10h16" /></>,
  receipt: <><path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path className="acc" d="M9 14h6" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path className="acc" d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" /></>,
  fingerprint: <><path d="M5 9a7 7 0 0 1 14 0" /><path className="acc" d="M8 20c-.5-3-1-6-1-9a5 5 0 0 1 10 0c0 3 .5 6 1 9" /><path d="M12 11c0 3 0 6 1 9M9.5 13c0 2 .5 4 1 6" /></>,
  backspace: <><path d="M9 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7Z" /><path className="acc" d="m11.5 10 4 4M15.5 10l-4 4" /></>,
  searchDuo: <><circle cx="10.8" cy="10.8" r="6.8" /><path className="acc" d="m16 16 5 5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path className="acc" d="M12 8h.01M12 11.5V16" /></>,
  mobile: <><rect x="8" y="3" width="8" height="18" rx="2" /><path className="acc" d="M12 17.5h.01" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
  sim: <><path d="M7 3h7l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 1-2Z" /><circle className="acc" cx="12" cy="14" r="3.2" /><path className="acc" d="M12 10.8v6.4M8.8 14h6.4" /></>,
  bill: <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /><path className="acc" d="M9 10h6M9 13h6" /></>,
  swoosh: <path d="M3 15c3-6 9-9 18-6-3 6-11 9-18 6Z" fill="currentColor" stroke="none" />,
};

function Icon({ name, size = 22, ...rest }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

/* ---------- Data ---------- */
const QUICK_ACTIONS = [
  { id: 'send', label: 'Send\nMoney', icon: 'send' },
  { id: 'lipa', label: 'Lipa na\nM-PESA', icon: 'shop' },
  { id: 'withdraw', label: 'Withdraw\nMoney', icon: 'withdraw' },
  { id: 'pochi', label: 'Pochi\nWallet', pochi: true },
  { id: 'bundles', label: 'Buy\nBundles', icon: 'data' },
  { id: 'airtime', label: 'Airtime\nTop Up', icon: 'phone' },
  { id: 'tunukiwa', label: 'Tunukiwa\nBundles', icon: 'gift' },
  { id: 'internet', label: 'Home\nInternet', icon: 'house' },
];

const FREQUENTS = {
  Apps: [
    { id: 'mshwari', label: 'M-Shwari', disc: 'white', node: <span className="mark-text green">M-Shwari</span> },
    { id: 'visa', label: 'M-Pesa Visa\nCard(Globa...', disc: 'green', node: <Icon name="phone" size={18} style={{ color: '#fff' }} /> },
  ],
  Send: [], Pay: [], Bundles: [],
};

const FINANCES = [
  { id: 'trader', label: 'ZiiDi\nTrader', tile: '#15291d', disc: 'transparent', node: <span className="mark-text green tiny">ZiiDi Trader</span> },
  { id: 'invest', label: 'ZiiDi\nInvest &\nSave', tile: '#1b3a26', disc: '#fff', node: <span className="mark-text green">ZiiDi</span> },
  { id: 'tuunza', label: 'Tuunza\nMapato', tile: '#1b3a26', disc: '#2fa84a', node: <span className="mark-text white tiny">TUUNZA<br />MAPATO</span> },
  { id: 'shiriki', label: 'ShirikiPay', tile: '#3a1e24', disc: '#fff', node: <Icon name="swoosh" size={22} style={{ color: '#e52d45' }} /> },
  { id: 'mali', label: 'Mali', tile: '#1b3a26', disc: '#2fa84a', node: <span className="mark-text white">MALI</span> },
  { id: 'faraja', label: 'Faraja', tile: '#45361c', disc: '#f08a24', node: <span className="dots" /> },
  { id: 'ratiba', label: 'M-PESA\nRatiba', tile: '#1b3a26', disc: '#2fa84a', node: <Icon name="calendar" size={18} style={{ color: '#fff' }} /> },
];

const formatKsh = (n) => `Ksh ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const Lines = ({ text }) => text.split('\n').map((l, i) => <span key={i}>{l}</span>);

function useToast() {
  const [message, setMessage] = useState('');
  const timer = useRef();
  const show = useCallback((t) => { setMessage(t); clearTimeout(timer.current); timer.current = setTimeout(() => setMessage(''), 1800); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [message, show];
}

/* ---------- Sections ---------- */
function Header({ name, onAction }) {
  return (
    <header className="topbar">
      <div className="user">
        <div className="avatar" aria-hidden="true">
          {name[0]}
          <span className="avatar-badge"><Icon name="chevronDown" size={10} strokeWidth={3} /></span>
        </div>
        <div className="who">
          <p className="greeting">{greeting()}</p>
          <p className="user-name">{name} <span aria-hidden="true">👋</span></p>
        </div>
      </div>
      <div className="row" style={{ gap: 7 }}>
        <button className="icon-btn" aria-label="Notifications, 1 unread" onClick={() => onAction('Notifications')}>
          <Icon name="bell" size={19} /><span className="dot" />
        </button>
        <button className="icon-btn" aria-label="Search" onClick={() => onAction('Search')}>
          <Icon name="search" size={19} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

function BalanceCarousel({ balance, fuliza, hidden, setHidden, onAction, onOpen }) {
  const [index, setIndex] = useState(0);
  const track = useRef(null);
  const onScroll = () => {
    const el = track.current;
    setIndex(Math.round(el.scrollLeft / (el.firstElementChild.offsetWidth + 15)));
  };

  return (
    <section aria-label="Balances">
      <div className="carousel" ref={track} onScroll={onScroll}>
        <article className="card">
          <div className="card-in mesh">
            <p className="card-label">M-PESA Balance</p>
            <div className="amount-row">
              <strong className="amount num" aria-live="polite">{hidden ? 'Ksh ••••' : formatKsh(balance)}</strong>
              <button className="ghost-btn" aria-label={hidden ? 'Show balance' : 'Hide balance'} aria-pressed={hidden} onClick={() => setHidden((h) => !h)}>
                <Icon name={hidden ? 'eyeOff' : 'eye'} size={21} strokeWidth={1.5} />
              </button>
            </div>
            <p className="meta num">Available Fuliza: {formatKsh(fuliza)}</p>
            <button className="btn-outline" onClick={() => onOpen('statements')}>View Statements</button>
          </div>
        </article>
        <article className="card">
          <div className="card-in">
            <p className="card-label">My Balances</p>
            <p className="air">Airtime</p>
            <strong className="amount num air-amt">Ksh. 0</strong>
            <button className="btn-outline" onClick={() => onAction('View Details')}>View Details</button>
          </div>
        </article>
      </div>
      <div className="pager" role="presentation">
        {[0, 1].map((i) => <span key={i} className={i === index ? 'on' : ''} />)}
      </div>
    </section>
  );
}

function QuickActions({ onAction, onOpen }) {
  return (
    <section className="panel" aria-labelledby="qa">
      <div className="panel-head">
        <h2 id="qa">Quick Actions</h2>
        <button className="link" onClick={() => onAction('All actions')}>View all <Icon name="chevron" size={14} strokeWidth={2.2} /></button>
      </div>
      <div className="quick-grid">
        {QUICK_ACTIONS.map((a) => (
          <button key={a.id} className="item" onClick={() => (['send', 'withdraw', 'lipa'].includes(a.id) ? onOpen(a.id) : onAction(a.label.replace('\n', ' ')))}>
            <span className={`round ${a.pochi ? 'pochi' : 'dark'}`}>
              {a.pochi ? <Icon name="swoosh" size={20} style={{ color: '#e52d45' }} /> : <Icon name={a.icon} size={21} strokeWidth={1.6} />}
            </span>
            <span className="label"><Lines text={a.label} /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Frequents({ onAction }) {
  const tabs = Object.keys(FREQUENTS);
  const [tab, setTab] = useState('Apps');
  const [open, setOpen] = useState(true);
  const items = FREQUENTS[tab];
  return (
    <section className="panel" aria-labelledby="fq">
      <div className="panel-head">
        <h2 id="fq">Frequents</h2>
        <button className="ghost-btn" aria-expanded={open} aria-label="Toggle frequents" onClick={() => setOpen((o) => !o)}>
          <Icon name="chevronUp" size={20} strokeWidth={1.6} style={{ transform: open ? 'none' : 'rotate(180deg)' }} />
        </button>
      </div>
      {open && (
        <>
          <div className="segmented" role="tablist">
            {tabs.map((t) => (
              <button key={t} role="tab" aria-selected={t === tab} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          {items.length ? (
            <div className="freq-row">
              {items.map((f) => (
                <button key={f.id} className="item freq" onClick={() => onAction(f.label.replace('\n', ' '))}>
                  <span className="round logo" style={{ background: f.disc === 'white' ? '#fff' : '#2fb454' }}>{f.node}</span>
                  <span className="label"><Lines text={f.label} /></span>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty">Nothing here yet. Recent {tab.toLowerCase()} will appear as you use them.</p>
          )}
        </>
      )}
    </section>
  );
}

function Promo({ onAction }) {
  return (
    <section aria-labelledby="deals">
      <h2 id="deals" className="section-title">Explore &amp; Discover Deals <span aria-hidden="true">🔥</span></h2>
      <button className="banner" onClick={() => onAction('Third Flow Experience')} aria-label="Third Flow Experience: get tickets and 7% cashback">
        <span className="b-logos">
          <span className="fm"><b>98.4</b><i>Capital FM</i></span>
          <span className="b-rule" />
          <span className="tf"><em>THIRD</em><strong>Flow</strong><small>EXPERIENCE</small></span>
        </span>
        <span className="b-bar">30 YEARS • THREE ERAS • ONE FLOW</span>
        <span className="b-sub">The City Energy • The Country Escape • The Capital Experience</span>
        <span className="b-cta">Get your tickets now on MY ONEAPP via MOOKH<br />and get a <b>7% CASHBACK</b></span>
        <span className="b-dots" aria-hidden="true"><i className="on" /><i /><i /><i /></span>
      </button>
    </section>
  );
}

function Finances({ onAction }) {
  return (
    <section className="panel" aria-labelledby="fin">
      <div className="panel-head">
        <h2 id="fin">My Finances</h2>
        <button className="link" onClick={() => onAction('All finances')}>View all <Icon name="chevron" size={14} strokeWidth={2.2} /></button>
      </div>
      <div className="h-scroll">
        {FINANCES.map((f) => (
          <button key={f.id} className="item fin" onClick={() => onAction(f.label.replace(/\n/g, ' '))}>
            <span className="square" style={{ background: f.tile }}>
              <span className="disc" style={{ background: f.disc }}>{f.node}</span>
            </span>
            <span className="label"><Lines text={f.label} /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Helpers ---------- */
const money = (n) => n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/* Safaricom 2026 send-money charges: [highest amount in band, fee in Ksh] */
const FEE_TIERS = [
  [49, 0], [100, 0], [500, 7], [1000, 13], [1500, 23], [2500, 33], [3500, 53], [5000, 57],
  [7500, 78], [10000, 90], [15000, 100], [20000, 105], [35000, 108], [50000, 108], [250000, 108],
];
const feeFor = (amount) => (FEE_TIERS.find(([max]) => amount <= max) ?? [0, 0])[1];
const normalizePhone = (raw) => {
  const p = raw.replace(/\s/g, '');
  if (p.startsWith('+254')) return '0' + p.slice(4);
  if (p.startsWith('254')) return '0' + p.slice(3);
  return p;
};
const makeId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(crypto.getRandomValues(new Uint32Array(10)), (n) => chars[n % chars.length]).join('');
};
const formatWhen = (d) => {
  const day = d.getDate(), v = day % 100, sfx = ['th', 'st', 'nd', 'rd'];
  const h = d.getHours() % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}${sfx[(v - 20) % 10] || sfx[v] || sfx[0]} ${d.toLocaleDateString('en-GB', { month: 'short' })} ${d.getFullYear()} | ${h}:${mm} ${d.getHours() < 12 ? 'am' : 'pm'}`;
};

function Face({ name, size }) {
  return <span className="face" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(name.trim()[0] || '•').toUpperCase()}</span>;
}

function BackHeader({ title, onBack, left = 14 }) {
  return (
    <div className="sm-head" style={{ paddingLeft: left }}>
      <button className="icon-btn" aria-label="Back" onClick={onBack}><Icon name="back" size={20} strokeWidth={2} style={{ stroke: '#f2f2f2' }} /></button>
      <h1 className="sm-title" style={{ margin: 0 }}>{title}</h1>
    </div>
  );
}

/* ---------- Confirm ---------- */
function Confirm({ txn, onName, onBack, onSend }) {
  const isW = txn.kind === 'withdraw';
  const rows = txn.details ?? (isW ? [['Agent number', txn.agent], ['Store number', txn.store]] : null);
  const ready = !!rows || txn.name.trim().length > 0;
  return (
    <div className="confirm">
      <BackHeader title="Confirm" onBack={onBack} />
      <div className="confirm-mid">
        <div className="tcard">
          <div className="tcard-in">
            <div className="ring"><Face name={txn.name} size={53} /></div>
            <p className="t-title">{txn.title ?? (isW ? 'Withdraw cash from agent' : 'Send money to mobile number')}</p>
            <div className="t-rows">
              {rows ? (
                <>
                  {rows.map(([k, v]) => <div key={k} className="t-row"><small>{k}</small><strong className="num">{v}</strong></div>)}
                </>
              ) : (
                <label className="t-row" style={{ display: 'block' }}>
                <small>Send to</small>
                <input value={txn.name} onChange={(e) => onName(e.target.value)} placeholder="Enter recipient name" maxLength={40} autoComplete="name" aria-label="Send to" />
              </label>
              )}
              <div className="t-row"><small>Amount</small><strong className="num">Ksh {money(txn.amount)}</strong></div>
              <div className="t-row"><small>Transaction cost</small><strong className="num">{txn.fee == null ? 'N/A' : txn.fee === 0 ? 'Free' : `Ksh ${money(txn.fee)}`}</strong></div>
            </div>
          </div>
        </div>
      </div>
      <button className="cta" disabled={!ready} onClick={onSend}>{txn.kind === 'pay' ? 'Pay' : isW ? 'Withdraw' : 'Send'}</button>
    </div>
  );
}

/* ---------- PIN ---------- */
function PinScreen({ txn, login, onBack, onSubmit, onAction }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;
  const busy = useRef(false);
  const press = useCallback((d) => { if (busy.current) return; setError(''); setPin((p) => (p.length < 4 ? p + d : p)); }, []);
  const del = useCallback(() => { if (!busy.current) setPin((p) => p.slice(0, -1)); }, []);

  useEffect(() => {
    const onKey = (e) => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') del(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, del]);

  useEffect(() => {
    if (pin.length !== 4 || busy.current) return;
    busy.current = true;
    submitRef.current(pin)
      .catch((e) => { setError(e.message); setPin(''); })
      .finally(() => { busy.current = false; });
  }, [pin]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'finger', '0', 'del'];
  return (
    <div className="pin">
      <BackHeader title="Enter M-PESA PIN" onBack={onBack} left={7} />
      <div className="pin-top">
        {login ? (
          <>
            <span className="face plain" style={{ width: 54, height: 54 }}><Icon name="user" size={26} strokeWidth={1.6} /></span>
            <p className="pin-name num">{maskPhone(login)}</p>
            <p className="notice pin-notice"><Icon name="info" size={20} strokeWidth={1.6} />This app will not use any of your data bundles</p>
          </>
        ) : (
          <>
            <Face name={txn.name} size={54} />
            <p className="pin-name">{txn.name.trim()}</p>
            <p className="pin-amt num">Ksh. {money(txn.amount)}&nbsp; Fee:Ksh. {money(txn.fee ?? 0)}</p>
          </>
        )}
      </div>
      <div className="pin-boxes" role="group" aria-label={`PIN, ${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className="pin-box">{pin[i] && <span className="pin-dot" />}</span>)}
      </div>
      {error && <p className="pin-err" role="alert">{error}</p>}
      <div className="keypad">
        {keys.map((k) =>
          k === 'finger' ? <button key={k} className="key" aria-label="Use fingerprint" onClick={() => onAction('Fingerprint is not set up')}><Icon name="fingerprint" size={23} strokeWidth={1.4} /></button>
          : k === 'del' ? <button key={k} className="key" aria-label="Delete" onClick={del}><Icon name="backspace" size={23} strokeWidth={1.6} /></button>
          : <button key={k} className="key" onClick={() => press(k)}>{k}</button>
        )}
      </div>
    </div>
  );
}

/* ---------- Success ---------- */
function Success({ txn, onClose, onAction }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(txn.id); onAction('Transaction ID copied'); }
    catch { onAction('Could not copy the ID'); }
  };
  const acts = [['star', 'Add to\nfavourites'], ['refresh', 'Reverse transaction'], ['calEdit', 'Schedule\npayment'], ['receipt', 'Download\nreceipt']];
  return (
    <div>
      <div className="ok-head">
        <button className="icon-btn" aria-label="Close" onClick={onClose}><Icon name="close" size={20} strokeWidth={2} /></button>
        <button className="icon-btn" aria-label="Share receipt" onClick={() => onAction('Share receipt')}><Icon name="share" size={20} strokeWidth={1.7} /></button>
      </div>
      <div className="ok-ring" aria-hidden="true">🎉</div>
      <div className="ok">
        <div className="tcard">
          <div className="tcard-in">
            <div className="ok-body">
              <h1 className="ok-title">Your transaction was successful</h1>
              <p className="ok-date">{formatWhen(txn.at)}</p>
              <p className="ok-amt num">Ksh {money(txn.amount)}</p>
              <p className="ok-cost">Transaction cost:<b>Ksh {money(txn.fee ?? 0)}</b></p>
              <button className="ok-id" onClick={copy} aria-label="Copy transaction ID">ID: {txn.id} <Icon name="copy" size={16} strokeWidth={1.6} /> Copy</button>
              <div className="to-box">
                {txn.kind === 'pay' ? 'Paid to:' : txn.kind === 'withdraw' ? 'Withdraw from:' : 'Send to:'}
                <div className="to-row">
                  <Face name={txn.name} size={36} />
                  <div>{txn.kind === 'pay'
                    ? <><div>{txn.toName}</div><div className="num">{txn.toLine}</div></>
                    : txn.kind === 'withdraw'
                    ? <><div>AGENT {txn.agent}</div><div className="num">Store number:{txn.store}</div></>
                    : <><div>{txn.name.trim().toUpperCase()}</div><div className="num">Phone number:{txn.phone}</div></>}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="acts">
        {acts.map(([icon, text]) => (
          <button key={icon} className="item" onClick={() => onAction(text.replace('\n', ' '))}>
            <span className="round"><Icon name={icon} size={20} strokeWidth={1.6} /></span>
            <span className="label"><Lines text={text} /></span>
          </button>
        ))}
      </div>
      <button className="done" onClick={onClose}>Done</button>
    </div>
  );
}

/* ---------- Statements ---------- */
const AVATARS = [['#2a1a6b', '#8f80ff'], ['#5a1a12', '#ff6a3d'], ['#0d3320', '#3bd06a'], ['#1c2260', '#6c86ff'], ['#5a2412', '#ff8a4a']];
const avatarFor = (name) => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATARS[h % AVATARS.length];
};
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const maskPhone = (p) => (p.length >= 9 ? `${p.slice(0, 4)}***${p.slice(-3)}` : '******');
const formatTime = (d) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'am' : 'pm'}`;
const formatDay = (d) => `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleDateString('en-GB', { month: 'long' })} ${d.getFullYear()}`;
const formatSigned = (n) => `${n < 0 ? '-' : '+'}KSH.${Math.abs(n).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;

function Statements({ transactions, onBack, onAction }) {
  const now = new Date();
  const months = [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 1)];
  const [month, setMonth] = useState(1);
  const [q, setQ] = useState('');
  const m = months[month];
  const term = q.trim().toLowerCase();

  const rows = transactions.filter((t) =>
    t.name !== 'Transaction cost' && // cost lines are not listed on the statement
    t.at.getFullYear() === m.getFullYear() && t.at.getMonth() === m.getMonth() &&
    (!term || `${t.name} ${t.masked} ${Math.abs(t.amount)}`.toLowerCase().includes(term)));
  const groups = [];
  rows.forEach((t) => {
    const key = t.at.toDateString();
    const g = groups[groups.length - 1];
    if (g && g.key === key) g.items.push(t); else groups.push({ key, at: t.at, items: [t] });
  });

  return (
    <div>
      <BackHeader title="M-PESA Statements" onBack={onBack} />
      <div className="sm-body" style={{ paddingBottom: 100 }}>
        <label className="st-search">
          <Icon name="searchDuo" size={22} strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search statements" />
        </label>
        <div className="chips" role="tablist">
          {months.map((d, i) => (
            <button key={i} role="tab" aria-selected={i === month} className={`chip-m ${i === month ? 'on' : ''}`} onClick={() => setMonth(i)}>
              {d.toLocaleDateString('en-GB', { month: 'long' })}
            </button>
          ))}
        </div>

        {groups.length === 0 && (
          <p className="st-empty">{term ? 'No transactions match your search.' : `No transactions in ${m.toLocaleDateString('en-GB', { month: 'long' })}.`}</p>
        )}
        {groups.map((g) => (
          <section key={g.key} className="st-group">
            <h2 className="st-date">{formatDay(g.at)}</h2>
            {g.items.map((t) => {
              const [bg, fg] = avatarFor(t.name);
              return (
                <div key={t.id} className="st-row">
                  <span className="st-av" style={{ background: bg, color: fg }}>{initials(t.name)}</span>
                  <div className="st-mid"><div>{t.name}</div><div className="num">{t.masked}</div></div>
                  <div className="st-end num"><b>{formatSigned(t.amount)}</b><span>{formatTime(t.at)}</span></div>
                </div>
              );
            })}
          </section>
        ))}
      </div>
      <button className="st-opts" onClick={() => onAction('Statement options')}>
        <Icon name="receipt" size={22} strokeWidth={1.6} /> Statement Options
      </button>
    </div>
  );
}

/* ---------- Send Money screen ---------- */
const PHONE_RE = /^(?:\+?254|0)[17]\d{8}$/;

function SendMoney({ initial, balance, fuliza, onBack, onAction, onContinue }) {
  const available = balance + fuliza;
  const [mode, setMode] = useState(initial?.mode ?? 'mobile');
  const [phone, setPhone] = useState(initial?.phoneRaw ?? '');
  const [touched, setTouched] = useState(false);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [method, setMethod] = useState(initial?.method ?? 'mpesa');
  const [tip, setTip] = useState(true);

  const phoneOk = PHONE_RE.test(phone.replace(/\s/g, ''));
  const amt = Number(amount);
  const ready = phoneOk && amt >= 1 && amt <= 250000;

  const submit = () => {
    if (!ready) return;
    const fee = method === 'mpesa' ? feeFor(amt) : null;
    if (method === 'mpesa' && amt + fee > available) {
      onAction(`Insufficient funds. You need Ksh ${money(amt + fee)} including the Ksh ${money(fee)} fee`);
      return;
    }
    onContinue({ mode, method, phoneRaw: phone, phone: normalizePhone(phone), amount: amt, fee });
  };

  return (
    <div>
      <div className="sm-head">
        <button className="icon-btn" aria-label="Back" onClick={onBack}><Icon name="back" size={20} strokeWidth={2} style={{ stroke: '#f2f2f2' }} /></button>
        <h1 className="sm-title" style={{ margin: 0 }}>Send Money</h1>
      </div>

      <div className="sm-body">
        <div className="seg2" role="tablist">
          <button role="tab" aria-selected={mode === 'mobile'} className={mode === 'mobile' ? 'active' : ''} onClick={() => setMode('mobile')}>Mobile number</button>
          <button role="tab" aria-selected={mode === 'pochi'} className={mode === 'pochi' ? 'active' : ''} onClick={() => setMode('pochi')}>Pochi la Biashara</button>
        </div>

        <div className="sm-row">
          <h2 className="sm-h">Favourites</h2>
          <button className="sm-link" onClick={() => onAction('All favourites')}>View All</button>
        </div>
        <div className="fav">
          <button className="item" onClick={() => onAction('Add favourite')}>
            <span className="round"><Icon name="plus" size={20} strokeWidth={2} /></span>
            <span className="label">Add</span>
          </button>
        </div>

        <label className="sm-label" htmlFor="phone">{mode === 'mobile' ? 'Enter Phone Number' : 'Enter Pochi Phone Number'}</label>
        <div className="field-wrap">
          <div className="field">
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={16} placeholder="Enter Phone Number" value={phone}
              onFocus={() => setTip(false)} onBlur={() => setTouched(true)}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ''))} />
            <button aria-label="Choose from contacts" onClick={() => onAction('Contacts')}><Icon name="contact" size={24} strokeWidth={1.8} /></button>
            <span className="sep" />
            <button aria-label="Scan to send" onClick={() => onAction('Scan to send')}><Icon name="scan" size={24} strokeWidth={1.5} /></button>
          </div>
          {tip && <span className="tip" role="note">Scan to send</span>}
        </div>
        {touched && phone && !phoneOk && <p className="hint err">Enter a valid number, e.g. 0712 345 678</p>}

        <label className="sm-label" htmlFor="amount">Enter Amount</label>
        <div className="field">
          <input id="amount" type="text" inputMode="numeric" placeholder="0" value={amount} maxLength={6}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))} />
          <span className="suffix">Ksh</span>
        </div>
        <p className="hint num">Balance: Ksh {money(balance)} - Fuliza: Ksh {money(fuliza)}</p>
        {amt > 250000 && <p className="hint err">The maximum per transaction is Ksh 250,000</p>}

        <h2 className="sm-h" style={{ marginTop: 30 }}>Select Payment Method</h2>
        <div className="pay-grid" role="radiogroup" aria-label="Payment method">
          <button role="radio" aria-checked={method === 'mpesa'} className={`pay ${method === 'mpesa' ? 'sel' : ''}`} onClick={() => setMethod('mpesa')}>
            <Icon name="swoosh" size={22} style={{ color: '#e52d45' }} />
            <span><b>M-PESA</b><small className="num">Bal. Ksh. {money(balance)}</small></span>
            {method === 'mpesa' && <span className="tick"><Icon name="check" size={10} /></span>}
          </button>
          <button role="radio" aria-checked={method === 'shiriki'} className={`pay ${method === 'shiriki' ? 'sel' : ''}`} onClick={() => setMethod('shiriki')}>
            <span className="s">S</span>
            <span><b>Shiriki Pay</b><small>Select</small></span>
            {method === 'shiriki' && <span className="tick"><Icon name="check" size={10} /></span>}
          </button>
        </div>

        <button className={`continue ${ready ? 'on' : ''}`} disabled={!ready} onClick={submit}>Continue</button>

        <h2 className="sm-h" style={{ marginTop: 26 }}>Do More</h2>
        <div className="more-grid">
          {[['users', 'Send to\nMany'], ['request', 'Request\nMoney'], ['globe', 'International\nTransfers']].map(([icon, text]) => (
            <button key={icon} className="more" onClick={() => onAction(text.replace('\n', ' '))}>
              <Icon name={icon} size={24} strokeWidth={1.5} />
              <span className="label"><Lines text={text} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Remember the last successful login so returning users only see the PIN screen. */
const SESSION_KEY = 'mpesa.lastLogin';
const SESSION_DAYS = 30;
const loadSession = () => {
  try {
    const v = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (v?.phone && Date.now() - v.at < SESSION_DAYS * 864e5) return v.phone;
  } catch { /* storage unavailable or corrupt: treat as signed out */ }
  return null;
};
const saveSession = (phone) => {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ phone, at: Date.now() })); } catch { /* ignore */ }
};

/* ---------- API ---------- */
const API_URL = import.meta.env.VITE_API_URL || 'https://my-one-app-backend.onrender.com';
async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong'), { status: res.status });
  return data;
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
};

/* ---------- Landing ---------- */
const PREVIEW = [['send', 'Send Money'], ['shop', 'Lipa na M-PESA'], ['withdraw', 'Withdraw Money'], ['data', 'Buy Bundles'],
  ['globe', 'International Transfers'], ['phone', 'Airtime Top up'], ['gift', 'Tunukiwa Bundles'], ['house', 'Home Fibre']];

function Landing({ onStart }) {
  return (
    <div className="landing">
      <div className="land-hero" aria-hidden="true">
        <svg className="skyline" viewBox="0 0 400 130" preserveAspectRatio="none">
          <path fill="#0f0f10" d="M0 130V88h22V70h18v30h20V56h26v44h18V76h24V40h20V22h22v18h14v52h20V64h26v30h22V50h20v46h24V78h30v52Z" />
        </svg>
        <div className="mock">
          <span className="island" />
          <div className="mock-in">
            <div className="pv-head">
              <div className="pv-user"><span className="pv-av">B</span><span>{greeting()}<br />Brian 👋</span></div>
              <div className="pv-btns"><span><Icon name="bell" size={15} /></span><span><Icon name="search" size={15} /></span></div>
            </div>
            <div className="pv-card">
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>M-PESA Balance</span>
              <b>Ksh 20,000</b>
              <span style={{ color: '#bbb' }}>Available Fuliza: Kshs 2,500</span>
              <i>View Statements</i>
            </div>
            <div className="pv-panel">
              Quick Actions
              <div className="pv-grid">
                {PREVIEW.map(([icon, label]) => (
                  <span key={label} className="pv-i"><span><Icon name={icon} size={16} strokeWidth={1.6} /></span>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="land-copy">
        <h1><span className="g">Transact</span> &amp; Access<br />your <span className="g">Favourite</span> Services</h1>
        <p>One place to manage your home WiFi, data, sms and airtime</p>
        <div className="land-dots" aria-hidden="true"><i className="on" /><i /></div>
      </div>
      <button className="cta" onClick={onStart}>Get Started</button>
    </div>
  );
}

/* ---------- Login: enter phone number ---------- */
function Login({ initial, onClose, onProceed }) {
  const [phone, setPhone] = useState(initial || '');
  const [touched, setTouched] = useState(false);
  const ok = PHONE_RE.test(phone.replace(/\s/g, ''));
  return (
    <div className="login">
      <div className="ok-head" style={{ marginTop: 14 }}>
        <button className="icon-btn" aria-label="Close" onClick={onClose}><Icon name="close" size={20} strokeWidth={2} /></button>
      </div>
      <p className="notice"><Icon name="info" size={24} strokeWidth={1.5} />This app will not use any of your data bundles</p>
      <div className="login-mid">
        <div className="tcard">
          <div className="tcard-in">
            <div className="ring lg"><Icon name="sim" size={32} strokeWidth={1.7} /></div>
            <div className="lg-body">
              <h1>Enter your phone number</h1>
              <p>This number will be used to sign in to the app.</p>
              <div className="signbox">
                Sign in on M-PESA with:
                <label className="login-row">
                  <span className="small-ring"><Icon name="mobile" size={16} strokeWidth={1.6} /></span>
                  <span className="pre">Phone Number:</span>
                  <input type="tel" inputMode="tel" autoComplete="tel" maxLength={16} placeholder="0712 345 678" value={phone}
                    onBlur={() => setTouched(true)} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ''))} aria-label="Phone number" />
                </label>
                {touched && phone && !ok && <p className="hint err" style={{ marginLeft: 47 }}>Enter a valid number, e.g. 0712 345 678</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="note"><Icon name="info" size={22} strokeWidth={1.5} />If you'd like to use a different number, please insert the matching SIM card and set it as the default.</p>
      <button className="cta" disabled={!ok} onClick={() => onProceed(normalizePhone(phone))}>Proceed with login</button>
    </div>
  );
}

/* ---------- Entertainment, Do more, assistant ---------- */
const ENTERTAINMENT = [
  { id: 'baze', label: 'Baze', bg: '#fde9ee', node: <b className="baze">Baze</b> },
  { id: 'games', label: 'Games', bg: '#fde7da', node: <span className="emo">🎮</span> },
  { id: 'news', label: 'Newspaper', bg: '#fdebd9', node: <span className="emo">📰</span> },
  { id: 'skiza', label: 'Skiza', bg: '#e2f6e8', node: <b className="skiza">Skiza</b> },
  { id: 'vyb', label: 'VybCall', bg: '#e2f6e8', node: <b className="vyb">VybCall</b> },
];

// logos are [background, text colour, short text] placeholders: swap in real brand images if you have them
const DO_MORE = [
  { id: 'fin', title: 'Financial Services', emoji: '💰', logos: [['#161616', '#3bd06a', 'ZT'], ['#fff', '#178a37', 'ZiiDi'], ['#2fa84a', '#fff', 'TM'], ['#fff', '#e52d45', 'swoosh']] },
  { id: 'ins', title: 'Insure and Protect', emoji: '🛡️', logos: [['#fff', '#1a7a3c', 'SHA'], ['#111', '#e44', 'PRU'], ['#2fa84a', '#fff', 'TM'], ['#fff', '#222', '☺']] },
  { id: 'evt', title: 'Events & Tickets', emoji: '🎫', logos: [['#f5c400', '#111', 'TIX'], ['#e91e63', '#fff', 'MLP'], ['#fff', '#7b1fa2', 'GO'], ['#fff', '#d32f2f', 'TAAM']] },
  { id: 'util', title: 'Pay for Utilities', emoji: '🧾', logos: [['#0c1a3a', '#7fb2ff', 'KP'], ['#fff', '#333', 'nes'], ['#1b6fa8', '#fff', '💧']] },
  { id: 'bet', title: 'Betting', emoji: '🎮', logos: [['#1a2a6c', '#fff', 'Sp'], ['#ffe600', '#111', 'BET'], ['#111', '#ffb300', 'LOT'], ['#2fb44a', '#fff', 'odi']] },
  { id: 'trv', title: 'Book & Travel', emoji: '🚌', logos: [['#e53935', '#fff', 'K'], ['#111', '#ffc107', 'Y'], ['#e91e63', '#fff', 'MLP'], ['#e53935', '#fff', 'V']] },
  { id: 'shop', title: 'Shop & Gift', emoji: '🎁', logos: [['#161616', '#3bd06a', 'MA'], ['#111', '#fff', 'SV'], ['#6a2c91', '#fff', 'U'], ['#f26a1b', '#fff', 'U']] },
  { id: 'biz', title: 'Safaricom Business', emoji: '📊', logos: [['#fff', '#178a37', 'S'], ['#0e3b1d', '#3bd06a', '⌁'], ['#0e3b1d', '#3bd06a', '◎'], ['#12301f', '#3bd06a', '⚙']] },
];

function Entertainment({ onAction }) {
  return (
    <section className="panel ent" aria-labelledby="ent">
      <h2 id="ent">Entertainment</h2>
      <div className="ent-items">
        {ENTERTAINMENT.map((e) => (
          <button key={e.id} className="ent-item" onClick={() => onAction(e.label)}>
            <span className="ent-ic" style={{ background: e.bg }}>{e.node}</span>
            {e.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function DoMore({ onAction }) {
  return (
    <section className="panel dm" aria-labelledby="dm">
      <div className="dm-head">
        <div>
          <h2 id="dm">Do more with M-PESA</h2>
          <p className="dm-sub">Pay, book, learn, and earn in one place.</p>
        </div>
        <button aria-label="Search services" onClick={() => onAction('Search services')}><Icon name="searchDuo" size={26} strokeWidth={1.7} /></button>
      </div>
      <div className="dm-grid">
        {DO_MORE.map((c) => (
          <button key={c.id} className="dm-card" onClick={() => onAction(c.title)}>
            <span className="emo" aria-hidden="true">{c.emoji}</span>
            <span>{c.title}</span>
            <span className="dm-logos" aria-hidden="true">
              {c.logos.map(([bg, fg, t], i) => (
                <span key={i} className="dm-logo" style={{ background: bg, color: fg, zIndex: i }}>
                  {t === 'swoosh' ? <Icon name="swoosh" size={16} /> : t}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
      <p className="dm-help">Can't find what you're looking for?</p>
      <button className="dm-browse" onClick={() => onAction('All services')}>Browse all services</button>
    </section>
  );
}

function Assistant({ onClick }) {
  return (
    <button className="assist" aria-label="Virtual assistant" onClick={onClick}>
      <svg viewBox="0 0 64 64" width="42" height="42" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="#dde8f2" />
        <path d="M17 31c0-12 6-19 15-19s15 7 15 19c0 9-2 17-3 20H20c-1-3-3-11-3-20Z" fill="#241713" />
        <path d="M8 64c1-10 8-15 17-17h14c9 2 16 7 17 17Z" fill="#f4f7fb" />
        <path d="M27 42h10v7c-2 2-8 2-10 0Z" fill="#c98f6b" />
        <ellipse cx="32" cy="30" rx="10.5" ry="12.5" fill="#d9a07c" />
        <path d="M21.5 28c1-8 6-12 11-12s9 4 10 11c-3-3-6-5-10-5s-8 2-11 6Z" fill="#241713" />
        <circle cx="28" cy="31" r="1.1" fill="#2b1b14" />
        <circle cx="36" cy="31" r="1.1" fill="#2b1b14" />
        <path d="M28.5 36c2 2.2 5 2.2 7 0" stroke="#8a3b2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <g transform="rotate(-18 14 50)">
          <rect x="9" y="42" width="7" height="14" rx="3.5" fill="#d9a07c" />
          <path d="M9 45l-2-4M12 43l-1-5M15 43l1-5" stroke="#d9a07c" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </svg>
    </button>
  );
}

/* ---------- Withdraw money ---------- */
/* Safaricom 2026 "from M-PESA agent" charges: [highest amount in band, fee]. Below Ksh 50 is not allowed. */
const AGENT_FEES = [[49, null], [100, 11], [2500, 29], [3500, 52], [5000, 69], [7500, 87], [10000, 115], [15000, 167], [20000, 185], [35000, 197], [50000, 278], [250000, 309]];
const agentFeeFor = (n) => (AGENT_FEES.find(([max]) => n <= max) ?? [0, null])[1];
const DIGITS_4_7 = /^\d{4,7}$/;

function Withdraw({ initial, balance, fuliza, onBack, onAction, onContinue }) {
  const [tab, setTab] = useState('agent');
  const [agent, setAgent] = useState(initial?.agent ?? '');
  const [store, setStore] = useState(initial?.store ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const amt = Number(amount);
  const ready = tab === 'agent' && DIGITS_4_7.test(agent) && DIGITS_4_7.test(store) && amt >= 50 && amt <= 250000;
  const digits = (set, max) => (e) => set(e.target.value.replace(/\D/g, '').slice(0, max));

  const submit = () => {
    if (!ready) return;
    const fee = agentFeeFor(amt);
    if (amt + fee > balance + fuliza) {
      onAction(`Insufficient funds. You need Ksh ${money(amt + fee)} including the Ksh ${money(fee)} fee`);
      return;
    }
    onContinue({ kind: 'withdraw', method: 'mpesa', agent, store, name: `Agent ${agent}`, amount: amt, fee });
  };

  return (
    <div>
      <BackHeader title="Withdraw money" onBack={onBack} />
      <div className="sm-body" style={{ paddingBottom: 100 }}>
        <div className="seg2 seg3" role="tablist">
          {[['agent', 'At Agent'], ['atm', 'At ATM'], ['ziidi', 'From ZiiDi']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab !== 'agent' ? (
          <p className="empty" style={{ marginTop: 28 }}>Withdrawing {tab === 'atm' ? 'at an ATM' : 'from ZiiDi'} is not available yet. Choose At Agent.</p>
        ) : (
          <>
            <label className="sm-label" htmlFor="agent">Enter agent number</label>
            <div className="field">
              <input id="agent" type="text" inputMode="numeric" autoComplete="off" placeholder="Enter agent number" value={agent} onChange={digits(setAgent, 7)} />
              <button aria-label="Scan agent code" onClick={() => onAction('Scan agent code')}><Icon name="scan" size={24} strokeWidth={1.5} /></button>
            </div>

            <label className="sm-label" htmlFor="store">Enter store number</label>
            <div className="field">
              <input id="store" type="text" inputMode="numeric" autoComplete="off" placeholder="Enter store number" value={store} onChange={digits(setStore, 7)} />
            </div>

            <label className="sm-label" htmlFor="wamount">Enter Amount</label>
            <div className="field">
              <input id="wamount" type="text" inputMode="numeric" placeholder="0" value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 6))} />
              <span className="suffix">Ksh</span>
            </div>
            <p className="hint num">Balance: Ksh {money(balance)} - Fuliza: Ksh {money(fuliza)}</p>
            {amt > 0 && amt < 50 && <p className="hint err">The minimum withdrawal is Ksh 50</p>}
            {amt > 250000 && <p className="hint err">The maximum per transaction is Ksh 250,000</p>}
          </>
        )}
      </div>
      <button className="cta cont" disabled={!ready} onClick={submit}>Continue</button>
    </div>
  );
}

/* ---------- Lipa na M-PESA ---------- */
const TILL_RE = /^\d{5,7}$/;

function Lipa({ initial, balance, fuliza, hidden, onBack, onAction, onContinue }) {
  const [tab, setTab] = useState(initial?.type ?? 'till');
  const [till, setTill] = useState(initial?.till ?? '');
  const [business, setBusiness] = useState(initial?.business ?? '');
  const [account, setAccount] = useState(initial?.account ?? '');
  const [phone, setPhone] = useState(initial?.phoneRaw ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [method, setMethod] = useState(initial?.method ?? 'mpesa');
  const amt = Number(amount);
  const targetOk = tab === 'till' ? TILL_RE.test(till)
    : tab === 'paybill' ? TILL_RE.test(business) && /^[\w-]{1,20}$/.test(account)
    : PHONE_RE.test(phone.replace(/\s/g, ''));
  const ready = targetOk && amt >= 1 && amt <= 250000;
  const stars = (v) => (hidden ? '******' : v);
  const digits = (set, max) => (e) => set(e.target.value.replace(/\D/g, '').slice(0, max));

  const submit = () => {
    if (!ready) return;
    if (method === 'bonga') { onAction('Insufficient Bonga Points'); return; }
    const fee = method === 'mpesa' ? (tab === 'paybill' ? 0 : feeFor(amt)) : null; // paybill: no customer charge in the table
    if (method === 'mpesa' && amt + fee > balance + fuliza) {
      onAction(`Insufficient funds. You need Ksh ${money(amt + fee)} including the Ksh ${money(fee)} fee`);
      return;
    }
    const to = normalizePhone(phone);
    const target = tab === 'till'
      ? { title: 'Pay to till number', details: [['Till number', till]], name: `Till ${till}`, toName: `TILL ${till}`, toLine: 'Buy Goods' }
      : tab === 'paybill'
      ? { title: 'Pay bill', details: [['Business number', business], ['Account number', account]], name: `Paybill ${business}`, toName: `PAYBILL ${business}`, toLine: `Account number:${account}` }
      : { title: 'Pay Pochi la Biashara', details: [['Phone number', to]], name: 'Pochi la Biashara', toName: 'POCHI LA BIASHARA', toLine: `Phone number:${to}` };
    onContinue({ kind: 'pay', type: tab, method, till, business, account, phone: to, phoneRaw: phone, amount: amt, fee, ...target });
  };

  return (
    <div>
      <BackHeader title="Lipa na M-PESA" onBack={onBack} />
      <div className="sm-body" style={{ paddingBottom: 40 }}>
        <div className="seg2 seg3" role="tablist">
          {[['till', 'Buy Goods'], ['paybill', 'Paybill'], ['pochi', 'Pochi la Biashara']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        <div className="sm-row">
          <h2 className="sm-h">Favourites</h2>
          <button className="sm-link" onClick={() => onAction('All favourites')}>View All</button>
        </div>
        <div className="fav">
          <button className="item" onClick={() => onAction('Add favourite')}>
            <span className="round"><Icon name="plus" size={20} strokeWidth={2} /></span>
            <span className="label">Add</span>
          </button>
        </div>

        {tab === 'till' && (
          <>
            <label className="sm-label" htmlFor="till">Enter till number</label>
            <div className="field">
              <input id="till" type="text" inputMode="numeric" autoComplete="off" placeholder="Enter till number" value={till} onChange={digits(setTill, 7)} />
              <button aria-label="Scan till code" onClick={() => onAction('Scan till code')}><Icon name="scan" size={24} strokeWidth={1.5} /></button>
            </div>
          </>
        )}
        {tab === 'paybill' && (
          <>
            <label className="sm-label" htmlFor="biz">Enter business number</label>
            <div className="field">
              <input id="biz" type="text" inputMode="numeric" autoComplete="off" placeholder="Enter business number" value={business} onChange={digits(setBusiness, 7)} />
              <button aria-label="Scan business code" onClick={() => onAction('Scan business code')}><Icon name="scan" size={24} strokeWidth={1.5} /></button>
            </div>
            <label className="sm-label" htmlFor="acct">Enter account number</label>
            <div className="field">
              <input id="acct" type="text" autoComplete="off" maxLength={20} placeholder="Enter account number" value={account} onChange={(e) => setAccount(e.target.value.replace(/[^\w-]/g, ''))} />
            </div>
          </>
        )}
        {tab === 'pochi' && (
          <>
            <label className="sm-label" htmlFor="pphone">Enter phone number</label>
            <div className="field">
              <input id="pphone" type="tel" inputMode="tel" maxLength={16} placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ''))} />
              <button aria-label="Choose from contacts" onClick={() => onAction('Contacts')}><Icon name="contact" size={24} strokeWidth={1.8} /></button>
            </div>
          </>
        )}

        <label className="sm-label" htmlFor="lamount" style={{ marginTop: 26 }}>Enter amount</label>
        <div className="field">
          <input id="lamount" type="text" inputMode="numeric" placeholder="0" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 6))} />
          <span className="suffix">Ksh</span>
        </div>
        <p className="hint num" style={{ marginLeft: 14 }}>Balance: Ksh {stars(money(balance))} - Fuliza: {stars(`Ksh ${money(fuliza)}`)}</p>
        {amt > 250000 && <p className="hint err">The maximum per transaction is Ksh 250,000</p>}

        <h2 className="sm-h" style={{ marginTop: 26 }}>Select Payment Method</h2>
        <div className="pay-grid pay-grid3" role="radiogroup" aria-label="Payment method">
          <button role="radio" aria-checked={method === 'mpesa'} className={`pay col ${method === 'mpesa' ? 'sel' : ''}`} onClick={() => setMethod('mpesa')}>
            <Icon name="swoosh" size={22} style={{ color: '#e52d45' }} />
            <span><b>M-PESA</b><small className="num">Ksh. {stars(money(balance))}</small></span>
            {method === 'mpesa' && <span className="tick"><Icon name="check" size={10} /></span>}
          </button>
          <button role="radio" aria-checked={method === 'bonga'} className={`pay col ${method === 'bonga' ? 'sel' : ''}`} onClick={() => setMethod('bonga')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cfcfcf" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M8 4h8M9.5 4c0 2-4.5 3-4.5 8 0 5 3 8 7 8s7-3 7-8c0-5-4.5-6-4.5-8M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01" /></svg>
            <span><b>Bonga Points</b><small>Ksh. 0</small></span>
            {method === 'bonga' && <span className="tick"><Icon name="check" size={10} /></span>}
          </button>
          <button role="radio" aria-checked={method === 'shiriki'} className={`pay col ${method === 'shiriki' ? 'sel' : ''}`} onClick={() => setMethod('shiriki')}>
            <span className="s">S</span>
            <span><b>Shiriki Pay</b><small>Select</small></span>
            {method === 'shiriki' && <span className="tick"><Icon name="check" size={10} /></span>}
          </button>
        </div>

        <button className={`continue ${ready ? 'on' : ''}`} style={{ height: 40, letterSpacing: '.1em' }} disabled={!ready} onClick={submit}>Continue</button>

        <h2 className="sm-h" style={{ marginTop: 28 }}>Do More</h2>
        <div className="more-grid two">
          <button className="more wide" onClick={() => onAction('Bill Manager')}>
            <span className="round"><Icon name="bill" size={19} strokeWidth={1.6} /></span>
            <span className="label">Bill Manager</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [toast, notify] = useToast();
  const [loginPhone, setLoginPhone] = useState(() => loadSession() ?? '');
  const [screen, setScreen] = useState(() => (loadSession() ? 'auth' : 'landing'));
  const [token, setToken] = useState('');           // kept in memory only: a PIN is needed each time the app opens
  const [txn, setTxn] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fuliza, setFuliza] = useState(0);
  const [transactions, setTransactions] = useState([]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);
  const [hideBal, setHideBal] = useState(false); // eye icon on the balance card, also masks balances on Lipa na M-PESA
  const [compact, setCompact] = useState(false); // the Scan to pay button shrinks to an icon while scrolling
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [screen]);

  const expire = useCallback(() => { setToken(''); setScreen('auth'); notify('Session expired. Enter your PIN to continue.'); }, [notify]);

  // Keep balances fresh, including changes made directly in MongoDB.
  useEffect(() => {
    if (!token || screen !== 'home') return undefined;
    const load = () => api('/api/me', { token })
      .then((u) => { setBalance(u.balance); setFuliza(u.fuliza); })
      .catch((e) => { if (e.status === 401) expire(); });
    load();
    const timer = setInterval(load, 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [token, screen, expire]);

  useEffect(() => {
    if (screen !== 'statements' || !token) return;
    api('/api/transactions', { token })
      .then((rows) => setTransactions(rows.map((t) => ({ ...t, at: new Date(t.at) }))))
      .catch((e) => { if (e.status === 401) expire(); else notify('Could not load statements'); });
  }, [screen, token, expire, notify]);

  const finish = () => { setTxn(null); setScreen('home'); };

  const signIn = async (pin) => {
    const r = await api('/api/auth/login', { method: 'POST', body: { phone: loginPhone, pin } });
    setToken(r.token);
    setBalance(r.user.balance);
    setFuliza(r.user.fuliza);
    saveSession(loginPhone);
    if (r.created) notify('Account created with this PIN');
    setScreen('home');
  };

  const pay = async (pin) => {
    try {
      const isW = txn.kind === 'withdraw';
      const isPay = txn.kind === 'pay';
      const r = await api(isW ? '/api/withdraw' : isPay ? '/api/pay' : '/api/transfer', {
        method: 'POST', token,
        body: isW
          ? { pin, agent: txn.agent, store: txn.store, amount: txn.amount }
          : isPay
          ? { pin, type: txn.type, method: txn.method, till: txn.till, business: txn.business, account: txn.account, phone: txn.phone, amount: txn.amount }
          : { pin, method: txn.method, name: txn.name.trim(), phone: txn.phone, amount: txn.amount },
      });
      setBalance(r.balance);
      setFuliza(r.fuliza);
      setTxn((t) => ({ ...t, id: r.id, at: new Date(r.at), fee: r.fee }));
      setScreen('success');
    } catch (e) {
      if (e.status === 401) { expire(); return; }
      throw e;
    }
  };

  return (
    <div className="app">
      <style>{CSS}</style>
      {screen === 'landing' && <Landing onStart={() => setScreen('login')} />}
      {screen === 'login' && <Login initial={loginPhone} onClose={() => setScreen('landing')} onProceed={(p) => { setLoginPhone(p); setScreen('auth'); }} />}
      {screen === 'auth' && <PinScreen login={loginPhone} onAction={notify} onBack={() => setScreen('login')} onSubmit={signIn} />}
      {screen === 'send' && (
        <SendMoney
          initial={txn && !txn.kind ? txn : null}
          balance={balance}
          fuliza={fuliza}
          onBack={() => setScreen('home')}
          onAction={notify}
          onContinue={(d) => { setTxn((t) => ({ ...d, name: t?.name ?? '' })); setScreen('confirm'); }}
        />
      )}
      {screen === 'withdraw' && (
        <Withdraw
          initial={txn?.kind === 'withdraw' ? txn : null}
          balance={balance}
          fuliza={fuliza}
          onBack={() => setScreen('home')}
          onAction={notify}
          onContinue={(d) => { setTxn(d); setScreen('confirm'); }}
        />
      )}
      {screen === 'lipa' && (
        <Lipa
          initial={txn?.kind === 'pay' ? txn : null}
          balance={balance}
          fuliza={fuliza}
          hidden={hideBal}
          onBack={() => setScreen('home')}
          onAction={notify}
          onContinue={(d) => { setTxn(d); setScreen('confirm'); }}
        />
      )}
      {screen === 'confirm' && txn && (
        <Confirm txn={txn} onName={(name) => setTxn((t) => ({ ...t, name }))} onBack={() => setScreen(txn.kind === 'withdraw' ? 'withdraw' : txn.kind === 'pay' ? 'lipa' : 'send')} onSend={() => setScreen('pin')} />
      )}
      {screen === 'pin' && txn && <PinScreen txn={txn} onAction={notify} onBack={() => setScreen('confirm')} onSubmit={pay} />}
      {screen === 'success' && txn?.at && <Success txn={txn} onAction={notify} onClose={finish} />}
      {screen === 'statements' && <Statements transactions={transactions} onBack={() => setScreen('home')} onAction={notify} />}
      {screen === 'home' && (
        <>
          <Header name="Brian" onAction={notify} />
          <main>
            <BalanceCarousel balance={balance} fuliza={fuliza} hidden={hideBal} setHidden={setHideBal} onAction={notify} onOpen={setScreen} />
            <QuickActions onAction={notify} onOpen={(sc) => { setTxn(null); setScreen(sc); }} />
            <Frequents onAction={notify} />
            <Promo onAction={notify} />
            <Finances onAction={notify} />
            <Entertainment onAction={notify} />
            <DoMore onAction={notify} />
          </main>
          <button className={`fab ${compact ? 'compact' : ''}`} aria-label="Scan to pay" onClick={() => notify('Opening Scan to Pay')}>
            <Icon name="scan" size={24} strokeWidth={1.5} /> <span className="fab-t">Scan to pay</span>
          </button>
          <Assistant onClick={() => notify('Hi! How can I help you today?')} />
        </>
      )}
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
