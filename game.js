/* ============================================================
   game.js —— 核心逻辑
   身体修正 · 孩子支出 · 左右浮窗 · 年假提醒 · 红涨绿跌
   ============================================================ */

   const RANKS = ["科员", "副科长", "科长", "副处长", "处长", "副厅长", "厅长"];
   const $ = id => document.getElementById(id);
   const rand = n => Math.floor(Math.random() * n);
   const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
   
   let state = {};
   let gender = "male";
   let used = {};
   let stats = { material: 0, meeting: 0, overtime: 0, dinner: 0, inspect: 0, tea: 0 };
   let pendingChain = null;
   let recentEvents = [];
   
   /* ============================================================
      数值定义
      ============================================================ */
   const STAT_DEF = [
     { key: "age",      label: "年龄",   fmt: v => v + "岁", bar: null },
     { key: "rank",     label: "职级",   fmt: v => RANKS[v],  bar: null },
     { key: "savings",  label: "储蓄",   fmt: v => v,         bar: null },
     { key: "fund",     label: "公积金", fmt: v => v,         bar: null },
     { key: "medical",  label: "医保",   fmt: v => v,         bar: null },
     { key: "health",   label: "身体",   fmt: v => v,         bar: "hp" },
     { key: "mood",     label: "心情",   fmt: v => v,         bar: "mood" },
     { key: "leader",   label: "领导",   fmt: v => v,         bar: "lead" },
     { key: "hair",     label: "头发",   fmt: v => v,         bar: "hair" },
     { key: "ability",  label: "能力",   fmt: v => v,         bar: "abil" },
     { key: "relation", label: "关系",   fmt: v => v,         bar: "rel" },
     { key: "family",   label: "家庭",   fmt: v => v,         bar: null },
   ];
   
   /* ============================================================
      初始化
      ============================================================ */
   function initState() {
     state = {
       year: 0, month: 0, age: 23, rank: 0,
       savings: 5000, fund: 0, medical: 0,
       health: 100, mood: 70, leader: 10, hair: 100,
       ability: 10, relation: 10, family: 0,
       living: "rent",
       marital: "single",
       hasChild: false, childLocked: false,
       childAge: 0,          // 孩子年龄（岁）
       childYears: 0,        // 孩子出生后过了几年
       loan: 0, loanPaidMonths: 0, loanTotal: 0,
       monthsInRank: 0,
       buffs: {},
       chains: {},
       flags: {},
       sideJob: false, sideJobKnown: false,
       invest: null,         // { principal, type, years }
       annual: 15,
       ended: false,
     };
     used = {};
     stats = { material: 0, meeting: 0, overtime: 0, dinner: 0, inspect: 0, tea: 0 };
     pendingChain = null;
     recentEvents = [];
   }
   
   /* ============================================================
      阶段
      ============================================================ */
   function getStage() {
     if (state.age <= 27) return "newbie";
     if (state.age <= 34) return "climb";
     if (state.age <= 44) return "mid";
     if (state.age <= 54) return "late";
     return "final";
   }
   
   /* ============================================================
      渲染数值
      ============================================================ */
   function renderStats(prev) {
     $("stats").innerHTML = STAT_DEF.map(d => {
       const v = state[d.key];
       let cls = "";
       if ((d.key === "health" || d.key === "hair") && v < 30) cls = "bad";
       else if ((d.key === "health" || d.key === "hair") && v < 55) cls = "warn";
       else if (d.key === "mood" && v < 35) cls = "warn";
       else if (d.key === "leader" && v >= 40) cls = "good";
       else if (d.key === "ability" && v >= 40) cls = "good";
       const bar = d.bar ? `<div class="bar ${d.bar}"><i style="width:${clamp(v)}%"></i></div>` : "";
       return `<div class="stat" data-key="${d.key}">
         <div class="label">${d.label}</div>
         <div class="val ${cls}" data-val="${d.key}">${d.fmt(v)}</div>${bar}</div>`;
     }).join("");
   
     if (prev) {
       STAT_DEF.forEach(d => {
         if (prev[d.key] === undefined || prev[d.key] === state[d.key]) return;
         const el = document.querySelector(`.val[data-val="${d.key}"]`);
         if (!el) return;
         el.classList.add(state[d.key] > prev[d.key] ? "flash-up" : "flash-down");
         setTimeout(() => el.classList.remove("flash-up", "flash-down"), 450);
       });
     }
   
     renderSideBoxes();
   }
   
   /* ============================================================
      左右浮窗
      ============================================================ */
   function renderSideBoxes() {
     const job = $("sideJobBox");
     const inv = $("investBox");
     if (!job || !inv) return;
   
     if (state.sideJob) {
       job.classList.remove("empty");
       job.classList.add("active");
       job.innerHTML = `<div class="sb-icon">💼</div>
         <div class="sb-title">副业中</div>
         <div class="sb-val">+1500/月</div>
         <div class="sb-sub">点击停止</div>`;
     } else {
       job.classList.add("empty");
       job.classList.remove("active");
       job.innerHTML = `<div class="sb-icon">💼</div>
         <div class="sb-title">副业</div>
         <div class="sb-val">无</div>
         <div class="sb-sub">点击了解</div>`;
     }
   
     if (state.invest) {
       inv.classList.remove("empty");
       inv.classList.add("active");
       inv.innerHTML = `<div class="sb-icon">📈</div>
         <div class="sb-title">${state.invest.type}</div>
         <div class="sb-val">${state.invest.principal}</div>
         <div class="sb-sub">点击查看</div>`;
     } else {
       inv.classList.add("empty");
       inv.classList.remove("active");
       inv.innerHTML = `<div class="sb-icon">📈</div>
         <div class="sb-title">理财</div>
         <div class="sb-val">无</div>
         <div class="sb-sub">点击了解</div>`;
     }
   }
   
   function bindSideBoxes() {
     const job = $("sideJobBox");
     const inv = $("investBox");
     if (!job || !inv) return;
     job.onclick = () => {
       if (state.sideJob) {
         showPopup("副业进行中", [
           ["每月收入", "+1500", "plus"],
           ["每月健康", "-2", "minus"],
           ["每月心情", "+1", "plus"],
         ], "停止副业", () => {
           state.sideJob = false;
           renderStats();
           showPopup("已停止", [["副业收入", "停止", ""]], "知道了");
         });
       } else {
         showPopup("副业", [
           ["状态", "未开启", ""],
           ["说明", "选事件可开启", ""],
         ], "知道了");
       }
     };
     inv.onclick = () => {
       if (state.invest) {
         const inv0 = state.invest;
         showPopup("理财详情", [
           ["产品", inv0.type, ""],
           ["本金", inv0.principal, ""],
           ["持有年数", inv0.years + " 年", ""],
           ["去年盈亏", (inv0.lastProfit >= 0 ? "+" : "") + (inv0.lastProfit || 0),
             inv0.lastProfit >= 0 ? "red" : "green"],
         ], "取出全部", () => {
           state.savings += state.invest.principal;
           showPopup("已取出", [["取回", state.invest.principal, "plus"]], "知道了");
           state.invest = null;
           renderStats();
         });
       } else {
         showPopup("理财", [
           ["状态", "未投资", ""],
           ["说明", "有闲钱时会触发机会", ""],
         ], "知道了");
       }
     };
   }
   
   /* ============================================================
      飘字
      ============================================================ */
   function floatText(key, delta) {
     const el = document.querySelector(`.stat[data-key="${key}"]`);
     if (!el) return;
     const rect = el.getBoundingClientRect();
     const span = document.createElement("div");
     span.className = "float";
     span.textContent = (delta > 0 ? "+" : "") + delta;
     span.style.color = delta > 0 ? "#6ee7a0" : "#ff7b7b";
     span.style.left = (rect.left + rect.width / 2 - 16) + "px";
     span.style.top = (rect.top + 2) + "px";
     document.body.appendChild(span);
     setTimeout(() => span.remove(), 1150);
   }
   
   /* ============================================================
      应用效果
      ============================================================ */
   function applyEffect(effect) {
     const prev = Object.assign({}, state);
     let dropped = false;
     if (effect) {
       for (const k in effect) {
         const v = effect[k];
         if (!v) continue;
         if (k === "savings" || k === "fund" || k === "medical") {
           state[k] = Math.max(0, (state[k] || 0) + v);
         } else {
           state[k] = clamp((state[k] || 0) + v);
         }
         if (["health", "hair", "mood"].includes(k) && v < 0) dropped = true;
         floatText(k, v);
       }
     }
     renderStats(prev);
     if (dropped) {
       const s = $("stats");
       s.classList.remove("shake");
       void s.offsetWidth;
       s.classList.add("shake");
       setTimeout(() => s.classList.remove("shake"), 400);
     }
   }
   
   function applyFlag(flag) {
     if (!flag) return;
     for (const k in flag) {
       state.flags[k] = flag[k];
       if (k === "living") state.living = flag[k];
       if (k === "marital") state.marital = flag[k];
       if (k === "hasChild") {
         state.hasChild = true;
         state.childAge = 0;
         state.childYears = 0;
       }
       if (k === "childLocked") state.childLocked = true;
       if (k === "fit" || k === "checked") state.buffs[k] = true;
       if (k === "sideJob") state.sideJob = true;
       if (k === "sideJobKnown") state.sideJobKnown = true;
     }
   }
   
   function applyChain(c) {
     if (!c) return;
     for (const k in c) state.chains[k] = c[k];
   }
   
   /* ============================================================
      弹窗
      ============================================================ */
   function showPopup(title, rows, btn, cb) {
     const box = $("popupBox");
     box.innerHTML = `<h2>${title}</h2>` +
       rows.map(r => `<div class="row"><span>${r[0]}</span><b class="${r[2] || ""}">${r[1]}</b></div>`).join("") +
       `<button>${btn}</button>`;
     $("popup").style.display = "flex";
     box.querySelector("button").onclick = () => {
       $("popup").style.display = "none";
       if (cb) cb();
     };
   }
   
   function showBanner(text) {
     const b = $("banner");
     b.querySelector(".btext").innerHTML = text;
     b.style.display = "flex";
     setTimeout(() => { b.style.display = "none"; }, 2000);
   }
   
   /* ============================================================
      渲染
      ============================================================ */
   function renderStory(html) {
     const s = $("story");
     s.classList.add("out");
     setTimeout(() => {
       s.innerHTML = html;
       s.scrollTop = 0;
       s.classList.remove("out");
     }, 150);
   }
   
   function renderChoices(choices, onPick) {
     const wrap = $("actions");
     wrap.innerHTML = "";
     choices.forEach((c, i) => {
       const btn = document.createElement("button");
       btn.className = "act" + (c.risky ? " risky" : "");
       btn.innerHTML = c.label + (c.hint ? `<span class="hint">${c.hint}</span>` : "");
       btn.onclick = () => {
         if (btn.disabled) return;
         wrap.querySelectorAll("button").forEach(b => b.disabled = true);
         btn.classList.add("picked");
         setTimeout(() => onPick(i, c), 240);
       };
       wrap.appendChild(btn);
     });
   }
   
   function drawScene(sceneId) {
     if (typeof PIXEL !== "undefined") {
       PIXEL.draw(state, sceneId || "office");
     }
   }
   
   /* ============================================================
      事件抽取
      ============================================================ */
   function pickEvent() {
     if (pendingChain) {
       const ce = EVENTS.find(e => e.id === pendingChain);
       if (ce) { pendingChain = null; return ce; }
       pendingChain = null;
     }
     const force = EVENTS.filter(e =>
       e.type === "force" && !used[e.id] && e.cond && e.cond(state)
     );
     if (force.length) {
       const e = force[rand(force.length)];
       used[e.id] = true;
       return e;
     }
     const onceReady = EVENTS.filter(e =>
       e.once && !used[e.id] && (!e.cond || e.cond(state))
     );
     if (onceReady.length) {
       onceReady.sort((a, b) => (b.weight || 0) - (a.weight || 0));
       const e = onceReady[0];
       used[e.id] = true;
       return e;
     }
     const stage = getStage();
     let pool = EVENTS.filter(e =>
       !e.once && e.type !== "force" &&
       (e.stage === "any" || e.stage === stage) &&
       (!e.cond || e.cond(state)) &&
       recentEvents.indexOf(e.id) === -1
     );
     if (!pool.length) {
       recentEvents = [];
       pool = EVENTS.filter(e =>
         !e.once && e.type !== "force" &&
         (e.stage === "any" || e.stage === stage) &&
         (!e.cond || e.cond(state))
       );
     }
     if (!pool.length) pool = EVENTS.filter(e => !e.once && e.type !== "force");
     const total = pool.reduce((s, e) => s + (e.weight || 1), 0);
     let r = rand(total);
     for (const e of pool) {
       r -= (e.weight || 1);
       if (r < 0) {
         recentEvents.push(e.id);
         if (recentEvents.length > 15) recentEvents.shift();
         return e;
       }
     }
     return pool[0];
   }
   
   /* ============================================================
      月度自然结算
      45 岁前不扣身体，45 后每年 1 月扣一次
      ============================================================ */
   function monthDecay() {
     const a = state.age;
   
     // 身体：45 岁前完全不扣
     if (a >= 45 && state.month === 1) {
       let hpLoss = 2;
       if (a >= 50) hpLoss = 3;
       if (a >= 55) hpLoss = 4;
       if (state.buffs.fit) hpLoss = Math.max(1, hpLoss - 1);
       if (state.buffs.checked) hpLoss = Math.max(1, hpLoss - 1);
       state.health = clamp(state.health - hpLoss);
     }
   
     // 头发：35 岁前每 2 年掉 1，之后每年掉 1（比之前慢）
     if (a < 35) {
       if (state.month === 6 && state.year % 2 === 0) state.hair = clamp(state.hair - 1);
     } else {
       if (state.month === 6) state.hair = clamp(state.hair - 1);
     }
   
     // 心情向 60 回归
     if (state.mood > 60) state.mood = clamp(state.mood - 1);
     else if (state.mood < 60 && state.health > 60) state.mood = clamp(state.mood + 1);
   
     // 家庭自然衰减
     if (state.marital === "married" && state.family > 50) {
       state.family = clamp(state.family - 1);
     }
   
     // 副业
     if (state.sideJob) {
       state.savings += 1500;
       state.health = clamp(state.health - 2);
       state.mood = clamp(state.mood + 1);
     }
   }
   
   /* ============================================================
      工资
      ============================================================ */
   const BASE_SALARY = [4200, 6000, 7800, 10000, 13000, 16000, 20000];
   
   function calcSalary() {
     const base = BASE_SALARY[state.rank] + Math.floor(state.year * 50);
     const allow = state.rank * 300 + 200;
     const sub = 300;
     const total = base + allow + sub;
     const fundIn = Math.floor(total * 0.12);
     const medicalIn = Math.floor(total * 0.02);
     return { base, allow, sub, total, fundIn, medicalIn };
   }
   
   /* ============================================================
      孩子支出
      ============================================================ */
   function childCost() {
     if (!state.hasChild) return { monthly: 0, yearly: 0, phase: "" };
     const y = state.childYears;   // 出生后几年
     if (y < 3) return { monthly: 2000, yearly: 0, phase: "婴儿" };
     if (y < 6) return { monthly: 2000, yearly: 6000, phase: "幼儿园" };
     if (y < 15) return { monthly: 1000, yearly: 3000, phase: "义务教育" };
     if (y < 18) return { monthly: 1500, yearly: 3000, phase: "高中" };
     if (y < 22) return { monthly: 2500, yearly: 6000, phase: "大学" };
     return { monthly: 0, yearly: 0, phase: "成年" };
   }
   
   /* ============================================================
      月度财务
      ============================================================ */
   function monthlyFinance(cb) {
     const s = calcSalary();
     state.savings += s.total;
     state.fund += s.fundIn;
     state.medical += s.medicalIn;
   
     let housing = 0;
     let housingLabel = "";
     const married = state.marital === "married";
   
     if (state.living === "rent") {
       housing = 1500;
       housingLabel = "合租";
     } else if (state.living === "alone") {
       housing = 2500;
       housingLabel = "整租";
     } else if (state.living === "owned") {
       housing = Math.round(s.total * 0.3);
       housingLabel = "房贷月供";
       state.loanPaidMonths++;
       if (state.loan > 0 && state.loanTotal > 0) {
         state.loan = Math.max(0, state.loan - Math.round(state.loanTotal / 240));
       }
     }
     if (married) housing = Math.round(housing / 2);
   
     let living = 3000;
     if (married) living = Math.round(living / 2);
   
     // 孩子支出
     const cc = childCost();
     let childMonthly = cc.monthly;
     let childYearly = 0;
     if (state.hasChild && state.month === 9 && cc.yearly > 0) {
       childYearly = cc.yearly;
     }
   
     const totalCost = housing + living + childMonthly + childYearly;
     state.savings = Math.max(0, state.savings - totalCost);
   
     // 孩子年龄增长
     if (state.hasChild && state.month === 12) {
       state.childYears++;
       state.childAge = state.childYears;
     }
   
     // 半年弹窗
     if (state.month === 6) {
       showPopup("半年收支", [
         ["工资收入", "+" + (s.total * 6), "plus"],
         ["副业收入", state.sideJob ? "+" + (1500 * 6) : "0", state.sideJob ? "plus" : ""],
         ["公积金入账", "+" + (s.fundIn * 6), "plus"],
         ["医保入账", "+" + (s.medicalIn * 6), "plus"],
         [housingLabel + (married ? "（婚后减半）" : ""), "-" + (housing * 6), "minus"],
         ["生活开销", "-" + (living * 6), "minus"],
         ["孩子支出", state.hasChild ? "-" + (childMonthly * 6) : "0", state.hasChild ? "minus" : ""],
         ["当前储蓄", state.savings, ""],
       ], "知道了", cb);
     } else {
       if (cb) cb();
     }
   }
   
   /* ============================================================
      年终
      ============================================================ */
   function yearEnd(cb) {
     const bonus = 2 * calcSalary().total;
     state.savings += bonus;
   
     const rows = [
       ["年终奖", "+" + bonus, "plus"],
     ];
   
     if (state.invest) {
       const r = settleInvest();
       rows.push(["理财投入", state.invest.principal, ""]);
       rows.push(["本年盈亏", (r.profit >= 0 ? "+" : "") + r.profit,
         r.profit >= 0 ? "red" : "green"]);
       rows.push(["经济形势", r.economy, ""]);
     }
   
     rows.push(["储蓄余额", state.savings, ""]);
   
     showPopup(state.year + " 年 · 年终", rows, "继续", () => {
       if (state.invest) {
         investDecision(cb);
       } else {
         cb();
       }
     });
   }
   
   /* ============================================================
      理财
      ============================================================ */
   function economyRoll() {
     const r = rand(100);
     if (r < 15) return { name: "繁荣", mult: 1.5 };
     if (r < 75) return { name: "平稳", mult: 1.0 };
     if (r < 95) return { name: "不景气", mult: 0.5 };
     return { name: "危机", mult: -0.5 };
   }
   
   function settleInvest() {
     const inv = state.invest;
     const eco = economyRoll();
     let rate = 0;
     if (inv.type === "保守型") rate = 0.02 + rand(2) * 0.005;
     else if (inv.type === "稳健型") rate = 0.02 + rand(5) * 0.01;
     else rate = -0.2 + rand(10) * 0.05;
   
     let profit = Math.round(inv.principal * rate * eco.mult);
     const maxLoss = -Math.round(inv.principal * 0.4);
     if (profit < maxLoss) profit = maxLoss;
   
     state.savings += profit;
     inv.years = (inv.years || 0) + 1;
     inv.lastProfit = profit;
     return { profit, economy: eco.name };
   }
   
   function investDecision(cb) {
     const inv = state.invest;
     if (!inv) return cb();
     const choices = [
       { label: "继续持有", hint: "下一年再结算", effect: {} },
       { label: "追加 1 万", hint: "储蓄- 本金+", effect: {} },
       { label: "取出全部", hint: "本金回储蓄", effect: {} },
     ];
     renderStory(`<div class="narr"><span>${state.year} 年</span><span class="tag">理财</span></div>
       <div class="scene">当前持有：<b>${inv.type}</b><br>
       本金：${inv.principal}<br>
       <span class='os'>（怎么办？）</span></div>`);
     drawScene("money");
     renderChoices(choices, (i) => {
       if (i === 0) {
         cb();
       } else if (i === 1) {
         if (state.savings >= 10000) {
           state.savings -= 10000;
           state.invest.principal += 10000;
           showPopup("已追加", [["追加", 10000, ""], ["本金", state.invest.principal, ""]], "知道了", cb);
         } else {
           showPopup("储蓄不足", [["需要", 10000, ""], ["当前", state.savings, ""]], "知道了", cb);
         }
       } else {
         const back = inv.principal;
         state.savings += back;
         state.invest = null;
         renderStats();
         showPopup("已取出", [["取回", back, "plus"], ["储蓄", state.savings, ""]], "知道了", cb);
       }
     });
   }
   
   function investEvent(cb) {
     if (state.savings < 10000) { if (cb) cb(); return; }
     showPopup("理财机会", [
       ["当前储蓄", state.savings, ""],
       ["起投金额", "10000", ""],
     ], "了解一下", () => {
       const choices = [
         { label: "接受，买理财", hint: "进入选择", effect: {} },
         { label: "再等等", hint: "不买", effect: {} },
       ];
       renderStory(`<div class="narr"><span>${state.year} 年</span><span class="tag">理财</span></div>
         <div class="scene">手头有点闲钱，同事推荐了几款理财产品。<br><span class='os'>（要不要试试？）</span></div>`);
       drawScene("money");
       renderChoices(choices, (i) => {
         if (i === 0) {
           setTimeout(() => {
             const products = [
               { label: "保守型", hint: "年化 2% 左右，稳", type: "保守型" },
               { label: "稳健型", hint: "年化 2-6%，偶尔小亏", type: "稳健型" },
               { label: "激进型", hint: "-20% ~ +30%，大起大落", risky: true, type: "激进型" },
             ];
             renderChoices(products, (j, p) => {
               state.savings -= 10000;
               state.invest = { principal: 10000, type: p.type, years: 0, lastProfit: 0 };
               renderStats();
               showPopup("已买入", [
                 ["产品", p.type, ""],
                 ["投入", 10000, ""],
               ], "知道了", cb);
             });
           }, 200);
         } else {
           cb();
         }
       });
     });
   }
   
   /* ============================================================
      晋升
      ============================================================ */
   function checkPromotion() {
     const a = state.age;
     const need = {
       0: { minAge: 27, maxAge: 35, ability: 22, leader: 22 },
       1: { minAge: 35, maxAge: 39, ability: 35, leader: 35 },
       2: { minAge: 39, maxAge: 45, ability: 50, leader: 50 },
       3: { minAge: 45, maxAge: 50, ability: 65, leader: 65 },
       4: { minAge: 50, maxAge: 55, ability: 80, leader: 80 },
       5: { minAge: 55, maxAge: 60, ability: 92, leader: 92 },
     }[state.rank];
     if (!need) return false;
     if (a < need.minAge) return false;
     if (a > need.maxAge) return false;
     if (state.ability >= need.ability &&
         state.leader >= need.leader &&
         state.monthsInRank >= 12) {
       if (rand(10) < 6) {
         const oldSalary = calcSalary().total;
         state.rank++;
         state.monthsInRank = 0;
         const newSalary = calcSalary().total;
         return { from: oldSalary, to: newSalary };
       }
     }
     return false;
   }
   
   /* ============================================================
      月度流程
      ============================================================ */
   function startYear() {
     state.year++;
     state.age = 23 + state.year - 1;
     if (state.age > 60) return endGame();
     state.month = 0;
     nextMonth();
   }
   
   function nextMonth() {
     if (state.ended) return;
     state.month++;
     if (state.month > 12) {
       yearEnd(() => {
         if (state.ended) return;
         startYear();
       });
       return;
     }
     state.monthsInRank++;
     monthDecay();
     renderStats();
   
     const promo = checkPromotion();
     if (promo) {
       renderStats();
       showBanner("🎉 晋升 " + RANKS[state.rank] +
         "<br><span style='font-size:15px;color:#c8d8e8'>月薪 " + promo.from + " → " + promo.to + "</span>");
     }
   
     if (state.health <= 0) return endGame("鞠躬尽瘁");
     if (state.hair <= 0) return endGame("英年早秃");
     if (state.flags.corrupt && state.leader < 5 && state.year > 15) return endGame("锒铛入狱");
   
     monthlyFinance(() => {
       // 年假提醒（每年 1 月）
       if (state.month === 1) {
         renderStory(`<div class="narr"><span>第 ${state.year} 年 · 1 月</span><span class="tag">新年</span></div>
           <div class="scene"><span class="tip">🏖️ 你今年还有 ${state.annual} 天年假</span><br>
           新的一年开始了。<br><span class='os'>（今年会不一样吗？）</span></div>`);
         drawScene("office");
         renderChoices([{ label: "继续", effect: {} }], () => {
           triggerMonthEvent();
         });
         return;
       }
       triggerMonthEvent();
     });
   }
   
   function triggerMonthEvent() {
     if (state.month === 10 && state.year % 3 === 0 && state.savings > 10000 && !state.invest) {
       return investEvent(() => startMonthlyEvent());
     }
     startMonthlyEvent();
   }
   
   function startMonthlyEvent() {
     const ev = pickEvent();
     triggerEvent(ev);
   }
   
   function triggerEvent(ev) {
     const yearLabel = `${state.age} 岁 · ${RANKS[state.rank]} · ${state.month} 月`;
     const alert = ev.type === "sudden" ? `<span class="alert">突发事件</span>` : "";
     const badge = ev.type === "stage" ? `<span class="badge">人生节点</span>` : "";
   
     drawScene(ev.scene);
   
     const evText = typeof ev.text === "function" ? ev.text(gender) : ev.text;
   
     renderStory(
       `<div class="narr"><span>第 ${state.year} 年 · ${state.month} 月</span><span class="tag">${yearLabel}</span></div>` +
       alert + badge +
       `<div class="scene">${evText}</div>`
     );
   
     renderChoices(ev.choices, (i, c) => {
       applyEffect(c.effect);
       applyFlag(c.flag);
       applyChain(c.chain);
       if (ev.stat) stats[ev.stat] = (stats[ev.stat] || 0) + 1;
       if (c.chain && c.chain.next) pendingChain = c.chain.next;
       setTimeout(() => nextMonth(), 620);
     });
   }
   
   /* ============================================================
      结局
      ============================================================ */
   const ENDINGS = {
     "登顶": "你一路走到了厅长。退休那天，办公室很大，人很多，但你忽然想起 23 岁报到时科长拍你肩膀的那一下。你笑了笑，把门带上。",
     "功成身退": "正处退休，体面，无愧。你把用了十年的茶杯带回家，放在书架上。孙子问你当过什么官，你说：为人民服务。",
     "副科退休": "你退休那天，收拾抽屉，翻出一张 23 岁的照片。照片里的年轻人眼睛很亮，笑得很傻。你看了很久，把它放回抽屉，锁上，走了。",
     "正科退休": "干了一辈子，停在正科。退休欢送会上，大家说了很多好话，你知道有一半是客套。但你确实，把每一件小事都做好了。",
     "遴选上岸": "你考上了更高的平台，换了城市，换了圈子。多年后回头看，那是一次豪赌，你赌赢了。",
     "英年早秃": "头发掉光的那天，你终于升了一级。镜子里的人让你陌生，你摸了摸头顶，笑了，又哭了。",
     "万年科员": "从 23 岁到 60 岁，你一直是科员。没有大起，没有大落。退休那天，你锁上抽屉，发现里面整整齐齐，一辈子没出过错。",
     "提前离场": "你递了辞职信。走出大门那天，天很蓝。你第一次觉得，呼吸是自由的。",
     "家庭美满": "你没当上大官，但退休那天，一家人围着你，孩子给你夹菜，老伴给你倒茶。你忽然觉得，这一生，值了。",
     "逍遥独身": "你一个人过完了一生。退休后，你养花、钓鱼、旅行。别人问你孤单吗，你说：我这一辈子，最不缺的就是自己陪自己。",
     "桃李满门": "你带过的年轻人都记得你。退休那天，来了十几个人，有的当了处长，有的还在科员。他们都叫你一声老师。",
     "子女成才": "孩子考上了好大学，后来有了自己的事业。你退休那天，孩子说：谢谢你当年没放弃我。",
     "相濡以沫": "你和老伴，从 23 岁走到 60 岁。没有大富大贵，但每天有人等你回家。退休那天，你们手牵手去公园散步。",
     "重新开始": "退休后，你做了年轻时想做的事。学了画画，去了西藏，写了自己的故事。别人说你疯了，你说：我这才刚开始。",
     "晚节不保": "那笔钱，最终还是被查出来了。退休前一年，你被带走。几十年的一切，归零。",
     "背锅到底": "你替人背了一辈子锅。退休那天，那个你替过锅的人，没有出现。你笑了笑，说：算了。",
     "全身而退": "那场风波里，很多人倒了，你活了下来。你没有什么秘诀，只是每一步都走得小心。退休那天，你长舒一口气。",
     "锒铛入狱": "门被敲响的那一刻，你知道，都结束了。",
     "降级调岗": "你没进监狱，但被降了级、调了岗。最后几年，你在边缘科室度过。退休那天，没人来送你。",
     "材料之神": "你写了一辈子材料。退休后，还有人来请教你怎么写。你笑着说：其实，就是改到领导满意为止。你写了 37 年，没人记得你写过什么。",
     "会议马拉松": "你这一生，开了大约 8000 个会。退休那天，你坐在空会议室里，忽然想不起来，这些会到底决定了什么。",
     "茶叶收藏家": "你的抽屉里，收藏着 37 年来各种会议发的茶。退休那天，你把它们分给了同事，说：这些茶，比我值钱。",
     "佛系一生": "你没升官，但活得舒服。该摸鱼摸鱼，该下班下班。退休那天，你身体很好，心情很好。别人说你没出息，你说：我过得比你开心。",
     "鞠躬尽瘁": "你的身体先于职级倒下了。同事们在你工位上放了一束菊花，第二天就有人坐了你的位子。",
     "平凡之路": "你这一生，什么都没发生。没有大喜，没有大悲。退休那天，你回头看了看那栋楼，然后转身走了。这样也挺好。",
     "活明白了": "退休那天，你笑了。你终于明白，这一生不是用来证明给谁看的。你收拾好东西，走出大门，阳光很好。",
   };
   
   function decideEnding() {
     if (state.flags.corrupt && state.leader < 10) return "晚节不保";
     if (stats.material >= 25) return "材料之神";
     if (stats.meeting >= 200) return "会议马拉松";
     if (stats.tea >= 30) return "茶叶收藏家";
     if (state.rank >= 6) return "登顶";
     if (state.rank >= 4) return "功成身退";
     if (state.rank === 3) return "正科退休";
     if (state.family >= 75 && state.mood >= 60) return "家庭美满";
     if (state.family >= 70 && state.rank >= 2) return "相濡以沫";
     if (state.relation >= 70) return "桃李满门";
     if (state.family < 30 && state.rank >= 3) return "逍遥独身";
     if (state.mood >= 75) return "活明白了";
     if (state.mood >= 65 && state.rank <= 1) return "佛系一生";
     if (state.hair < 20) return "英年早秃";
     if (state.rank === 0) return "万年科员";
     if (state.mood < 30) return "平凡之路";
     return "正科退休";
   }
   
   function endGame(forced) {
     if (state.ended) return;
     state.ended = true;
     state.savings += state.medical;
     const finalMedical = state.medical;
     state.medical = 0;
   
     const key = forced || decideEnding();
     const text = ENDINGS[key] || ENDINGS["平凡之路"];
   
     const e = $("ending");
     e.style.display = "flex";
     e.innerHTML =
       `<h1>${key}</h1>` +
       `<div class="rank-badge">${state.age} 岁 · ${RANKS[state.rank]} · 工龄 ${state.year} 年</div>` +
       `<div class="summary">${text}</div>` +
       `<div class="stats-box">` +
         `<div class="row">最终职级 <b>${RANKS[state.rank]}</b></div>` +
         `<div class="row">最终储蓄 <b>${state.savings}</b></div>` +
         `<div class="row">公积金账户 <b>${state.fund}</b></div>` +
         `<div class="row">医保并入 <b>+${finalMedical}</b></div>` +
         `<div class="row">身体 / 心情 <b>${state.health} / ${state.mood}</b></div>` +
         `<div class="row">头发剩余 <b>${state.hair}%</b></div>` +
         `<div class="row">写材料次数 <b>${stats.material}</b></div>` +
         `<div class="row">加班次数 <b>${stats.overtime}</b></div>` +
       `</div>` +
       `<button onclick="location.reload()">再来一生</button>`;
   }
   
   /* ============================================================
      启动
      ============================================================ */
   function startGame() {
     $("intro").classList.add("hide");
     window.gender = gender;
     initState();
     renderStats();
     bindSideBoxes();
     drawScene("office");
     renderStory(
       `<div class="narr"><span>序章</span><span class="tag">23 岁</span></div>` +
       `<div class="scene">你考上了。<br>报到那天，科长拍拍你肩膀：<span class="dialog">年轻人，好好干。</span><br>` +
       `<span class="os">（内心：我一定好好干！）</span></div>`
     );
     renderChoices(
       [{ label: "开始新生活", hint: "进入第一年", effect: {} }],
       () => {
         renderStats();
         startYear();
       }
     );
   }
   
   document.querySelectorAll("#intro .gender button").forEach(b => {
     b.onclick = () => {
       document.querySelectorAll("#intro .gender button").forEach(x => x.classList.remove("active"));
       b.classList.add("active");
       gender = b.dataset.g;
     };
   });
   
   $("startBtn").onclick = startGame;