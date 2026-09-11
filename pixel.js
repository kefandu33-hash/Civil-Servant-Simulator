/* ============================================================
   pixel.js —— 像素场景 + 动态主角
   画布 48 × 32
   ============================================================ */

   const PIXEL = (function () {
    let cvs = null, ctx = null;
  
    function init() {
      cvs = document.getElementById("pixelCanvas");
      if (!cvs) return;
      cvs.width = 48;
      cvs.height = 32;
      ctx = cvs.getContext("2d");
      ctx.imageSmoothingEnabled = false;
    }
  
    function px(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }
  
    function clear(color) {
      px(0, 0, 48, 32, color || "#2a3a52");
    }
  
    /* ============================================================
       主角绘制 —— 自动读 state
       ============================================================ */
    function drawHero(state, x, y, opts) {
      opts = opts || {};
      const sitting = opts.sitting;
      const age = state.age;
      const health = state.health;
      const mood = state.mood;
      const hair = state.hair;
      const isOld = age >= 50;
      const isMid = age >= 35 && age < 50;
      const hunch = health < 40;
  
      const skin = isOld ? "#e8c098" : "#f5cfa0";
      const hairColor = isOld ? "#9a9a9a" : "#3a2a1e";
      const suit = "#4a8ad8";
      const pants = "#2a3a52";
  
      let bodyTop;
      if (sitting) {
        const hx = x - 1, hy = y - 12;
        px(hx, hy, 4, 4, skin);
        drawHair(hx, hy, hair, hairColor);
        drawEyes(hx, hy, mood, isMid || isOld);
        drawMouth(hx, hy, mood);
        if (isOld && opts.gender === "male") px(hx + 1, hy + 3, 2, 1, hairColor);
        px(x - 2, y - 8, 6, 6, suit);
        px(x - 2, y - 2, 6, 2, suit);
        px(x + 2, y - 2, 2, 4, pants);
        bodyTop = hy;
      } else {
        const hunchOff = hunch ? 1 : 0;
        const hx = x - 1 + hunchOff, hy = y - 14 + hunchOff;
        px(hx, hy, 4, 4, skin);
        drawHair(hx, hy, hair, hairColor);
        drawEyes(hx, hy, mood, isMid || isOld);
        drawMouth(hx, hy, mood);
        if (isOld && opts.gender === "male") px(hx + 1, hy + 3, 2, 1, hairColor);
        px(x - 2 + hunchOff, y - 10 + hunchOff, 6, 7, suit);
        px(x - 2, y - 3, 2, 3, pants);
        px(x + 1, y - 3, 2, 3, pants);
        if (hunch) px(x - 4, y - 6, 2, 2, suit);
        bodyTop = hy;
      }
  
      // 状态符号（只保留健康差和心情差，删掉了心情好的三个黄点）
      if (health < 30) {
        px(x + 4, bodyTop - 3, 1, 1, "#ff7b7b");
        px(x + 6, bodyTop - 4, 1, 1, "#ff7b7b");
        px(x + 8, bodyTop - 3, 1, 1, "#ff7b7b");
      }
      if (mood < 25) {
        px(x + 3, bodyTop, 2, 2, "#7dd3fc");
        px(x + 3, bodyTop - 1, 2, 1, "#a8d8f0");
      }
    }
  
    function drawHair(hx, hy, hair, color) {
      if (hair > 60) {
        px(hx - 1, hy - 2, 6, 3, color);
        px(hx - 1, hy, 1, 3, color);
        px(hx + 4, hy, 1, 3, color);
      } else if (hair > 25) {
        px(hx - 1, hy - 1, 6, 2, color);
        px(hx - 1, hy, 1, 2, color);
        px(hx + 4, hy, 1, 2, color);
      } else if (hair > 5) {
        px(hx, hy - 1, 1, 1, color);
        px(hx + 2, hy - 1, 1, 1, color);
      } else {
        px(hx + 1, hy + 1, 1, 1, "#ffffff44");
      }
    }
  
    function drawEyes(hx, hy, mood, wearGlasses) {
      const ey = hy + 2;
      if (mood < 30) {
        px(hx + 1, ey, 1, 1, "#3a2a1e");
        px(hx + 3, ey, 1, 1, "#3a2a1e");
      } else {
        px(hx + 1, ey, 1, 1, "#2a1a0e");
        px(hx + 3, ey, 1, 1, "#2a1a0e");
      }
      if (wearGlasses) {
        px(hx, ey - 1, 2, 1, "#88c0d0");
        px(hx + 3, ey - 1, 2, 1, "#88c0d0");
        px(hx, ey, 1, 1, "#88c0d0");
        px(hx + 4, ey, 1, 1, "#88c0d0");
        px(hx + 2, ey - 1, 1, 1, "#88c0d0");
      }
    }
  
    function drawMouth(hx, hy, mood) {
      const my = hy + 3;
      if (mood > 70) {
        px(hx + 1, my, 3, 1, "#8a4a3a");
      } else if (mood > 35) {
        px(hx + 1, my, 2, 1, "#8a4a3a");
      } else {
        px(hx + 1, my + 1, 2, 1, "#8a4a3a");
      }
    }
  
    /* ============================================================
       配角绘制
       ============================================================ */
    function drawNPC(x, y, opts) {
      opts = opts || {};
      const skin = opts.skin || "#f0c898";
      const hair = opts.hairColor || "#3a2a1e";
      const suit = opts.suit || "#3e5478";
      const sitting = opts.sitting;
      if (sitting) {
        px(x - 1, y - 12, 4, 4, skin);
        px(x - 2, y - 14, 6, 3, hair);
        px(x - 2, y - 8, 6, 6, suit);
        px(x - 2, y - 2, 6, 2, suit);
        px(x + 2, y - 2, 2, 4, "#2a3a52");
      } else {
        px(x - 1, y - 14, 4, 4, skin);
        px(x - 2, y - 16, 6, 3, hair);
        px(x - 2, y - 10, 6, 7, suit);
        px(x - 2, y - 3, 2, 3, "#2a3a52");
        px(x + 1, y - 3, 2, 3, "#2a3a52");
      }
    }
  
    /* ============================================================
       场景函数
       ============================================================ */
  
    function sceneOffice(s) {
      clear("#5a7aa8");
      px(0, 0, 48, 22, "#6a8ab8");
      px(0, 22, 48, 10, "#4a6688");
      px(4, 3, 16, 13, "#e8f4ff");
      px(5, 4, 14, 11, "#bce0ff");
      px(11, 4, 1, 11, "#6a8ab8");
      px(5, 9, 14, 1, "#6a8ab8");
      px(18, 6, 10, 16, "rgba(255,245,200,0.20)");
      px(3, 18, 4, 4, "#5aaa6a");
      px(4, 16, 2, 3, "#6ac87a");
      px(2, 22, 6, 2, "#9a7a4a");
      px(26, 20, 18, 2, "#a8805a");
      px(27, 22, 2, 6, "#6a4a28");
      px(41, 22, 2, 6, "#6a4a28");
      px(30, 14, 8, 6, "#2a3a52");
      px(31, 15, 6, 4, "#6ab0f0");
      px(28, 19, 4, 1, "#f8f8f8");
      drawHero(s, 24, 26, { sitting: true, gender: s.gender });
    }
  
    function sceneOvertime(s) {
      clear("#2a3a5c");
      px(0, 0, 48, 20, "#243458");
      px(38, 4, 3, 3, "#fff4c0");
      px(39, 5, 2, 2, "#243458");
      px(8, 5, 1, 1, "#9ab0d0");
      px(20, 3, 1, 1, "#9ab0d0");
      px(30, 7, 1, 1, "#9ab0d0");
      px(0, 20, 48, 12, "#324468");
      px(2, 22, 44, 2, "#9a7a4a");
      px(3, 24, 2, 6, "#5a3e1e");
      px(43, 24, 2, 6, "#5a3e1e");
      for (let i = 0; i < 4; i++) px(6 + i * 3, 20, 2, 2, "#f8f8f8");
      for (let i = 0; i < 3; i++) px(32 + i * 3, 20, 2, 2, "#f8f8f8");
      px(24, 12, 1, 8, "#6a7a9a");
      px(22, 10, 5, 2, "#ffe898");
      px(20, 12, 9, 8, "rgba(255,230,140,0.22)");
      drawNPC(8, 26, { sitting: true, suit: "#3e5478" });
      drawNPC(38, 26, { sitting: true, suit: "#3e5478" });
      drawHero(s, 22, 26, { sitting: true, gender: s.gender });
    }
  
    function sceneDinner(s) {
      clear("#5a4838");
      px(0, 0, 48, 32, "#5a4838");
      px(20, 2, 8, 3, "#ffe898");
      px(16, 5, 16, 10, "rgba(255,230,140,0.18)");
      px(10, 18, 28, 3, "#c0885a");
      px(12, 21, 24, 2, "#8a6038");
      px(20, 23, 8, 8, "#6a4828");
      px(16, 16, 4, 2, "#e86a5a");
      px(24, 16, 4, 2, "#6aaa6a");
      px(20, 15, 8, 1, "#f8e8b8");
      px(14, 14, 2, 4, "#f0f8ff");
      px(32, 14, 2, 4, "#f0f8ff");
      drawNPC(6, 28, { sitting: true, suit: "#8a4a5a" });
      px(5, 12, 3, 1, "#ffd76e");
      drawNPC(34, 28, { sitting: true, suit: "#3e5478" });
      drawHero(s, 20, 30, { sitting: true, gender: s.gender });
    }
  
    function sceneMeeting(s) {
      clear("#5a7aa8");
      px(0, 0, 48, 20, "#6a8ab8");
      px(2, 2, 8, 8, "#e8f4ff");
      px(2, 2, 8, 8, "#bce0ff");
      px(6, 2, 1, 8, "#6a8ab8");
      px(18, 3, 16, 10, "#f8fcff");
      px(19, 4, 14, 8, "#d0e0f0");
      px(20, 6, 12, 1, "#8aa8d0");
      px(20, 8, 10, 1, "#8aa8d0");
      px(2, 20, 44, 3, "#a8805a");
      px(4, 23, 40, 2, "#6a4a28");
      drawNPC(5, 28, { sitting: true, suit: "#8a4a5a", hairColor: "#1a1a1a" });
      drawNPC(12, 28, { sitting: true, suit: "#3e5478" });
      drawNPC(40, 28, { sitting: true, suit: "#3e5478" });
      drawHero(s, 24, 28, { sitting: true, gender: s.gender });
    }
  
    function sceneInspect(s) {
      clear("#6a8ab8");
      px(0, 0, 48, 22, "#7a9ac8");
      px(6, 2, 36, 4, "#e85a4a");
      px(8, 3, 4, 2, "#fff");
      px(14, 3, 4, 2, "#fff");
      px(20, 3, 4, 2, "#fff");
      px(26, 3, 4, 2, "#fff");
      px(0, 22, 48, 10, "#4a6688");
      drawNPC(4, 30, { suit: "#3e5478", hairColor: "#2a1a0e" });
      drawNPC(11, 30, { suit: "#3e5478", hairColor: "#3a2a1e" });
      drawNPC(18, 30, { suit: "#8a4a5a", hairColor: "#1a1a1a" });
      px(16, 20, 3, 4, "#f8f8f8");
      drawHero(s, 28, 30, { gender: s.gender });
      drawNPC(35, 30, { suit: "#3e5478", hairColor: "#2a1a0e" });
      drawNPC(42, 30, { suit: "#3e5478", hairColor: "#4a3a2e" });
    }
  
    function sceneSpring(s) {
      clear("#3a2a4e");
      px(0, 0, 48, 24, "#2a2458");
      px(8, 3, 4, 5, "#f85a4a");
      px(9, 2, 2, 1, "#ffe08a");
      px(9, 8, 2, 2, "#ffe08a");
      px(36, 3, 4, 5, "#f85a4a");
      px(37, 2, 2, 1, "#ffe08a");
      px(37, 8, 2, 2, "#ffe08a");
      px(4, 2, 12, 12, "rgba(255,140,100,0.18)");
      px(32, 2, 12, 12, "rgba(255,140,100,0.18)");
      px(42, 6, 1, 1, "#ffe08a");
      px(44, 8, 1, 1, "#ff9a6a");
      px(40, 9, 1, 1, "#8ee0ff");
      px(0, 24, 48, 8, "#4a3a48");
      px(14, 24, 20, 2, "#9a7a4a");
      px(15, 26, 2, 5, "#6a4a28");
      px(31, 26, 2, 5, "#6a4a28");
      px(20, 19, 8, 5, "#2a3a52");
      px(21, 20, 6, 3, "#6ab0f0");
      drawHero(s, 10, 30, { sitting: true, gender: s.gender });
    }
  
    function sceneHome(s) {
      clear("#7ac8a8");
      px(0, 0, 48, 20, "#88d8b8");
      px(0, 20, 48, 12, "#5aa888");
      px(4, 3, 10, 9, "#e8f8ff");
      px(5, 4, 8, 7, "#bce8e8");
      px(9, 4, 1, 7, "#88d8b8");
      px(24, 18, 20, 6, "#e8f0e0");
      px(24, 16, 20, 2, "#f0f8e8");
      px(24, 24, 2, 4, "#88a898");
      px(42, 24, 2, 4, "#88a898");
      px(44, 10, 3, 8, "#5aaa6a");
      px(45, 8, 1, 3, "#6ac87a");
      px(14, 26, 2, 3, "#f8f8f8");
      drawNPC(36, 24, { sitting: true, suit: "#a888a8", hairColor: "#5a3a2a" });
      drawHero(s, 28, 24, { sitting: true, gender: s.gender });
    }
  
    function sceneHospital(s) {
      clear("#4a6a88");
      px(0, 0, 48, 22, "#5a7a98");
      px(0, 22, 48, 10, "#3a5878");
      px(20, 1, 8, 2, "#fff4c0");
      px(16, 3, 16, 6, "rgba(255,240,180,0.14)");
      px(18, 20, 22, 2, "#f8fcff");
      px(18, 22, 2, 6, "#9aa3b3");
      px(38, 22, 2, 6, "#9aa3b3");
      px(20, 17, 5, 3, "#e8f0f8");
      const skin = s.age >= 50 ? "#e8c098" : "#f5cfa0";
      px(26, 16, 6, 4, skin);
      px(25, 15, 8, 2, s.age >= 50 ? "#9a9a9a" : "#3a2a1e");
      px(30, 17, 8, 3, "#7a9ac0");
      px(42, 8, 1, 14, "#9aa3b3");
      px(40, 6, 5, 3, "#e8f0f8");
      drawNPC(8, 30, { suit: "#f8fcff", hairColor: "#1a1a1a" });
      px(6, 18, 1, 3, "#e85a4a");
      px(5, 19, 3, 1, "#e85a4a");
      px(0, 2, 2, 1, "#6ee7a0");
      px(2, 1, 1, 3, "#6ee7a0");
      px(3, 2, 2, 1, "#6ee7a0");
    }
  
    function sceneMoney(s) {
      clear("#3a5478");
      px(0, 0, 48, 32, "#3a5478");
      px(0, 22, 48, 10, "#6a5038");
      px(8, 16, 14, 6, "#6aaa6a");
      px(9, 15, 12, 1, "#7aba7a");
      px(8, 16, 14, 1, "#5a9a5a");
      px(13, 18, 4, 2, "#f8f8e8");
      px(28, 12, 8, 12, "#2a3a52");
      px(29, 13, 6, 10, "#6ab0f0");
      px(31, 16, 2, 1, "#6ee7a0");
      px(31, 18, 3, 1, "#6ee7a0");
      px(38, 20, 4, 4, "#ffe08a");
      px(39, 21, 2, 2, "#f0c85a");
      drawHero(s, 4, 30, { sitting: true, gender: s.gender });
    }
  
    function sceneDate(s) {
      clear("#7a6a8a");
      px(0, 0, 48, 22, "#8a7a9a");
      px(0, 22, 48, 10, "#5a4a5a");
      px(22, 1, 4, 2, "#ffe898");
      px(18, 3, 12, 8, "rgba(255,230,140,0.18)");
      px(16, 20, 16, 3, "#a8805a");
      px(17, 23, 2, 6, "#6a4a28");
      px(29, 23, 2, 6, "#6a4a28");
      px(20, 17, 3, 3, "#f8e8d0");
      px(26, 17, 3, 3, "#f8e8d0");
      drawNPC(34, 28, { sitting: true, suit: "#9a6a8a", hairColor: "#5a3a2a" });
      drawHero(s, 12, 28, { sitting: true, gender: s.gender });
      px(22, 10, 1, 1, "#ff9aaa");
      px(24, 10, 1, 1, "#ff9aaa");
      px(23, 11, 1, 1, "#ff9aaa");
    }
  
    function sceneNewYear(s) {
      clear("#8a3a3a");
      px(0, 0, 48, 24, "#a84a4a");
      px(2, 4, 4, 14, "#e85a4a");
      px(3, 6, 2, 1, "#ffe08a");
      px(3, 9, 2, 1, "#ffe08a");
      px(3, 12, 2, 1, "#ffe08a");
      px(3, 15, 2, 1, "#ffe08a");
      px(42, 4, 4, 14, "#e85a4a");
      px(43, 6, 2, 1, "#ffe08a");
      px(43, 9, 2, 1, "#ffe08a");
      px(43, 12, 2, 1, "#ffe08a");
      px(43, 15, 2, 1, "#ffe08a");
      px(21, 4, 6, 6, "#e85a4a");
      px(23, 6, 2, 2, "#ffe08a");
      px(0, 24, 48, 8, "#6a3a38");
      px(18, 1, 3, 2, "#e85a4a");
      px(27, 1, 3, 2, "#e85a4a");
      drawNPC(8, 30, { suit: "#8a4a5a", hairColor: "#9a9a9a" });
      px(14, 22, 3, 2, "#e85a4a");
      drawHero(s, 24, 30, { gender: s.gender });
      drawNPC(38, 30, { suit: "#6a4a98", hairColor: "#3a2a1e" });
      px(32, 22, 3, 2, "#e85a4a");
    }
  
    function sceneWedding(s) {
      clear("#9a6a8a");
      px(0, 0, 48, 22, "#a87a9a");
      px(14, 3, 20, 2, "#f8a8c8");
      px(14, 5, 2, 10, "#f8a8c8");
      px(32, 5, 2, 10, "#f8a8c8");
      px(16, 4, 16, 1, "#ffd0e0");
      px(0, 22, 48, 10, "#6a4a5a");
      px(20, 22, 8, 10, "#c84a5a");
      drawNPC(22, 30, { suit: "#3a3a4a", hairColor: "#2a1a0e" });
      drawNPC(27, 30, { suit: "#f8f0f0", hairColor: "#5a3a2a" });
      px(26, 15, 3, 2, "#f8f8f8");
      drawNPC(6, 30, { suit: "#3e5478" });
      drawHero(s, 12, 30, { gender: s.gender });
      drawNPC(38, 30, { suit: "#6a4a98" });
      drawNPC(44, 30, { suit: "#3e5478" });
      px(16, 10, 1, 1, "#ffd76e");
      px(34, 12, 1, 1, "#ff9aaa");
      px(20, 8, 1, 1, "#8ee0ff");
      px(30, 10, 1, 1, "#ffd76e");
    }
  
    function sceneReunion(s) {
      clear("#6a5a78");
      px(0, 0, 48, 22, "#7a6a88");
      px(22, 1, 4, 2, "#ffe898");
      px(16, 3, 16, 8, "rgba(255,230,140,0.14)");
      px(0, 22, 48, 10, "#4a3a58");
      px(10, 20, 28, 2, "#b8906a");
      px(12, 22, 24, 2, "#8a6038");
      px(20, 24, 8, 6, "#6a4828");
      px(16, 18, 3, 2, "#d86a5a");
      px(29, 18, 3, 2, "#6aaa6a");
      px(22, 17, 4, 1, "#f8e8b8");
      px(14, 16, 2, 3, "#f0f8ff");
      px(32, 16, 2, 3, "#f0f8ff");
      drawNPC(4, 28, { sitting: true, suit: "#6a5a7a", hairColor: "#3a2a1e" });
      drawNPC(14, 30, { sitting: true, suit: "#3e5478" });
      drawNPC(34, 30, { sitting: true, suit: "#3e5478" });
      drawNPC(43, 28, { sitting: true, suit: "#6a4a98", hairColor: "#9a9a9a" });
      drawHero(s, 24, 30, { sitting: true, gender: s.gender });
    }
  
    function sceneTrip(s) {
      clear("#6a8ab8");
      px(0, 0, 48, 6, "#5a7aa0");
      px(0, 6, 48, 2, "#3a5a80");
      px(28, 10, 20, 10, "#e8f0f8");
      px(29, 11, 18, 8, "#b8d0e8");
      px(30, 13, 4, 3, "#3a5a80");
      px(36, 13, 4, 3, "#3a5a80");
      px(42, 13, 4, 3, "#3a5a80");
      px(28, 17, 20, 1, "#8aa8c8");
      px(0, 22, 48, 10, "#4a5a6a");
      px(0, 20, 48, 1, "#ffd76e");
      drawNPC(38, 30, { suit: "#3e5478" });
      drawHero(s, 12, 30, { gender: s.gender });
      px(15, 24, 5, 5, "#8a4a3a");
      px(16, 23, 3, 1, "#6a3a2a");
      px(16, 29, 1, 1, "#3a2a1a");
      px(19, 29, 1, 1, "#3a2a1a");
      px(9, 22, 3, 3, "#3a4a68");
    }
  
    function sceneReceive(s) {
      clear("#7a9ac8");
      px(0, 0, 48, 22, "#6a8ab8");
      px(18, 4, 12, 16, "#3a4a68");
      px(20, 6, 8, 12, "#5a7aa0");
      px(24, 4, 1, 16, "#3a4a68");
      px(14, 20, 20, 2, "#8a9ab8");
      px(12, 22, 24, 2, "#7a8aa8");
      px(6, 0, 36, 3, "#e85a4a");
      px(10, 1, 3, 1, "#fff");
      px(16, 1, 3, 1, "#fff");
      px(22, 1, 3, 1, "#fff");
      px(28, 1, 3, 1, "#fff");
      px(0, 24, 48, 8, "#4a6688");
      drawNPC(14, 30, { suit: "#8a4a5a", hairColor: "#1a1a1a" });
      drawHero(s, 30, 30, { gender: s.gender });
      px(20, 22, 4, 1, "#f5cfa0");
    }
  
    function sceneTraining(s) {
      clear("#5a7aa8");
      px(0, 0, 48, 22, "#6a8ab8");
      px(6, 3, 36, 12, "#2a4a3a");
      px(7, 4, 34, 10, "#3a5a4a");
      px(10, 6, 8, 1, "#d8e8d8");
      px(10, 8, 12, 1, "#d8e8d8");
      px(10, 10, 6, 1, "#d8e8d8");
      px(18, 18, 12, 3, "#8a6a4a");
      px(0, 22, 48, 10, "#4a6688");
      drawNPC(24, 22, { suit: "#8a4a5a", hairColor: "#1a1a1a" });
      drawNPC(6, 30, { sitting: true, suit: "#3e5478" });
      drawNPC(38, 30, { sitting: true, suit: "#3e5478" });
      drawHero(s, 22, 30, { sitting: true, gender: s.gender });
    }
  
    function sceneCanteen(s) {
      clear("#7a9ac0");
      px(0, 0, 48, 20, "#8aaac8");
      px(3, 3, 7, 8, "#e8f4ff");
      px(3, 3, 7, 8, "#bce0ff");
      px(12, 3, 7, 8, "#e8f4ff");
      px(12, 3, 7, 8, "#bce0ff");
      px(6, 3, 1, 8, "#8aaac8");
      px(15, 3, 1, 8, "#8aaac8");
      px(30, 2, 16, 10, "#d8e8f0");
      px(31, 3, 14, 8, "#b8d0e0");
      px(32, 5, 4, 3, "#e86a5a");
      px(37, 5, 4, 3, "#6aaa6a");
      px(42, 5, 3, 3, "#e8c85a");
      px(33, 4, 1, 6, "rgba(255,255,255,0.3)");
      px(0, 22, 48, 10, "#5a7090");
      px(0, 20, 48, 2, "#d8a878");
      px(0, 22, 48, 1, "#a87848");
      px(6, 23, 2, 5, "#7a5028");
      px(24, 23, 2, 5, "#7a5028");
      px(40, 23, 2, 5, "#7a5028");
      px(4, 17, 7, 3, "#f0f0f0");
      px(5, 16, 5, 1, "#e86a5a");
      px(18, 17, 7, 3, "#f0f0f0");
      px(19, 16, 5, 1, "#6aaa6a");
      px(32, 17, 7, 3, "#f0f0f0");
      px(33, 16, 5, 1, "#e8c85a");
      px(11, 16, 3, 1, "#d8c8a8");
      px(25, 16, 3, 1, "#d8c8a8");
      px(39, 16, 3, 1, "#d8c8a8");
      drawNPC(6, 30, { sitting: true, suit: "#3e5478" });
      drawNPC(34, 30, { sitting: true, suit: "#6a4a98" });
      drawHero(s, 20, 30, { sitting: true, gender: s.gender });
    }
  
    function sceneCommute(s) {
      clear("#3a4a68");
      px(0, 0, 48, 26, "#4a5a7a");
      px(4, 4, 40, 10, "#1a2438");
      px(5, 5, 38, 8, "#2a3a58");
      px(8, 7, 2, 4, "#8aa0c0");
      px(20, 6, 2, 5, "#8aa0c0");
      px(32, 7, 2, 4, "#8aa0c0");
      px(0, 14, 48, 1, "#8a9ab8");
      px(8, 14, 1, 3, "#8a9ab8");
      px(20, 14, 1, 3, "#8a9ab8");
      px(32, 14, 1, 3, "#8a9ab8");
      px(40, 14, 1, 3, "#8a9ab8");
      px(0, 26, 48, 6, "#2a3a58");
      drawNPC(6, 32, { suit: "#3e5478" });
      drawNPC(42, 32, { suit: "#6a4a98" });
      drawHero(s, 22, 32, { gender: s.gender });
    }
  
    function sceneChild(s) {
      clear("#7ac8a8");
      px(0, 0, 48, 22, "#88d8b8");
      px(4, 3, 8, 8, "#e8f8ff");
      px(4, 3, 8, 8, "#bce8e8");
      px(0, 22, 48, 10, "#5aa888");
      px(20, 22, 22, 3, "#a8805a");
      px(22, 25, 2, 6, "#6a4a28");
      px(40, 25, 2, 6, "#6a4a28");
      px(38, 14, 1, 8, "#5a6a8a");
      px(36, 12, 5, 2, "#ffe898");
      px(34, 14, 9, 8, "rgba(255,230,140,0.20)");
      px(24, 20, 8, 2, "#f8f8f8");
      px(26, 19, 4, 1, "#f8f8f8");
      drawNPC(34, 30, { sitting: true, suit: "#8ab8a8", hairColor: "#3a2a1e" });
      px(33, 28, 4, 2, "#8ab8a8");
      drawHero(s, 24, 28, { sitting: true, gender: s.gender });
    }
  
    function sceneReport(s) {
      clear("#5a7a98");
      px(0, 0, 48, 22, "#6a8aa8");
      px(4, 3, 8, 8, "#d8ecff");
      px(4, 3, 8, 8, "#a8d8ff");
      px(0, 22, 48, 10, "#4a6688");
      px(16, 22, 24, 3, "#a8805a");
      px(18, 25, 2, 6, "#6a4a28");
      px(38, 25, 2, 6, "#6a4a28");
      px(22, 16, 12, 8, "#f8f8f8");
      px(23, 17, 10, 1, "#3a3a3a");
      px(23, 19, 6, 1, "#3a3a3a");
      px(30, 19, 3, 1, "#e85a4a");
      px(23, 21, 5, 1, "#3a3a3a");
      px(30, 21, 3, 1, "#e85a4a");
      drawHero(s, 10, 30, { gender: s.gender });
      px(13, 22, 4, 5, "#f8f8f8");
      px(14, 23, 2, 1, "#e85a4a");
      px(10, 12, 1, 1, "#8aa0bc");
      px(12, 11, 1, 1, "#8aa0bc");
      px(14, 12, 1, 1, "#8aa0bc");
    }
  
    function scenePromote(s) {
      clear("#8a3a3a");
      px(0, 0, 48, 32, "#a84a3a");
      px(0, 0, 48, 32, "rgba(255,215,110,0.10)");
      px(10, 6, 28, 22, "#f8f8f8");
      px(11, 7, 26, 20, "#fff8e8");
      px(12, 8, 24, 3, "#d83a2a");
      px(16, 9, 16, 1, "#fff");
      px(14, 13, 20, 1, "#3a3a3a");
      px(14, 15, 20, 1, "#3a3a3a");
      px(14, 17, 16, 1, "#3a3a3a");
      px(14, 19, 18, 1, "#3a3a3a");
      px(20, 21, 8, 2, "#e85a4a");
      px(22, 21, 4, 2, "#d83a2a");
      px(30, 22, 5, 5, "#d83a2a");
      px(31, 23, 3, 3, "#e85a4a");
      px(4, 4, 1, 1, "#ffd76e");
      px(44, 6, 1, 1, "#ffd76e");
      px(6, 28, 1, 1, "#ffd76e");
      px(42, 28, 1, 1, "#ffd76e");
    }
  
    /* ============================================================
       场景注册表
       ============================================================ */
    const SCENES = {
      office: sceneOffice,
      overtime: sceneOvertime,
      dinner: sceneDinner,
      meeting: sceneMeeting,
      inspect: sceneInspect,
      spring: sceneSpring,
      home: sceneHome,
      hospital: sceneHospital,
      money: sceneMoney,
      date: sceneDate,
      newyear: sceneNewYear,
      wedding: sceneWedding,
      reunion: sceneReunion,
      trip: sceneTrip,
      receive: sceneReceive,
      training: sceneTraining,
      canteen: sceneCanteen,
      commute: sceneCommute,
      child: sceneChild,
      report: sceneReport,
      promote: scenePromote,
    };
  
    /* ============================================================
       对外接口
       ============================================================ */
    function draw(state, sceneId) {
      if (!ctx) init();
      if (!ctx) return;
      const s = Object.assign({}, state);
      s.gender = window.gender || "male";
      const fn = SCENES[sceneId] || sceneOffice;
      ctx.clearRect(0, 0, 48, 32);
      fn(s);
    }
  
    function label(state) {
      const tags = [];
      if (state.health < 30) tags.push("虚弱");
      else if (state.health < 55) tags.push("疲惫");
      if (state.mood < 25) tags.push("低落");
      else if (state.mood > 80) tags.push("开心");
      if (state.hair < 25) tags.push("脱发");
      if (state.age >= 50) tags.push("年长");
      if (state.rank >= 3) tags.push("领导");
      return tags.slice(0, 3).join(" · ");
    }
  
    return { draw, label, init };
  })();