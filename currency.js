/* ===== عملات النماذج — TrioMind =====
   الأسعار بالنماذج مكتوبة بالجنيه المصري، وهون بتتحوّل لعملة الزائر.
   لتعديل سعر الصرف: غيّر الرقم "rate" (كم جنيه = 1 من هالعملة).       */
const CURRENCIES = {
  EGP: { name: "جنيه مصري",    sym: "ج.م", rate: 1,    step: 1    },
  USD: { name: "دولار أمريكي", sym: "$",   rate: 48,   step: 0.5  },
  SAR: { name: "ريال سعودي",   sym: "ر.س", rate: 12.8, step: 1    },
  AED: { name: "درهم إماراتي", sym: "د.إ", rate: 13.1, step: 1    },
  KWD: { name: "دينار كويتي",  sym: "د.ك", rate: 157,  step: 0.25 },
  QAR: { name: "ريال قطري",    sym: "ر.ق", rate: 13.2, step: 1    },
  JOD: { name: "دينار أردني",  sym: "د.أ", rate: 67.7, step: 0.25 },
  EUR: { name: "يورو",          sym: "€",   rate: 52,   step: 0.5  }
};
/* البلد ← العملة (حسب المنطقة الزمنية لجهاز الزائر). لبنان والعراق وسوريا بالدولار */
const ZONES = {
  "Africa/Cairo": "EGP", "Asia/Riyadh": "SAR", "Asia/Dubai": "AED", "Asia/Kuwait": "KWD",
  "Asia/Qatar": "QAR", "Asia/Amman": "JOD", "Asia/Beirut": "USD", "Asia/Baghdad": "USD", "Asia/Damascus": "USD"
};

(function () {
  let code;
  try { code = localStorage.getItem("tm-cur"); } catch (e) {}
  if (!CURRENCIES[code]) {
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    code = ZONES[tz] || (tz.startsWith("Europe/") ? "EUR" : "USD");
  }
  const listeners = [];
  const C = window.CUR = {
    get code() { return code; },
    get sym() { return CURRENCIES[code].sym; },
    /* جنيه ← عملة الزائر (مع تقريب لطيف) */
    conv(egp) { const c = CURRENCIES[code]; return Math.max(Math.round(egp / c.rate / c.step) * c.step, egp ? c.step : 0); },
    /* عملة الزائر ← جنيه (للأرقام اللي بيدخلها المستخدم) */
    toBase(v) { return v * CURRENCIES[code].rate; },
    /* تنسيق رقم محوّل أصلاً لعملة الزائر */
    fmt(v) {
      const c = CURRENCIES[code];
      const s = (Math.round(v * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
      return code === "USD" || code === "EUR" ? c.sym + s : s + " " + c.sym;
    },
    /* تحويل من جنيه + تنسيق */
    money(egp) { return C.fmt(C.conv(egp)); },
    onChange(fn) { listeners.push(fn); },
    set(c) { code = c; try { localStorage.setItem("tm-cur", c); } catch (e) {} listeners.forEach(f => f()); sync(); }
  };
  function sync() { document.querySelectorAll(".cur-sel").forEach(s => s.value = code); }

  /* قائمة اختيار العملة داخل شريط النسخة التجريبية */
  document.addEventListener("DOMContentLoaded", () => {
    const bar = document.querySelector(".demo-bar");
    if (!bar) return;
    const st = document.createElement("style");
    st.textContent = ".cur-sel{margin-inline-start:10px;background:#1b2033;color:#fff;border:1px solid #2e3552;border-radius:8px;padding:3px 6px;font-family:inherit;font-size:.82rem;cursor:pointer}";
    document.head.appendChild(st);
    const sel = document.createElement("select");
    sel.className = "cur-sel";
    sel.setAttribute("aria-label", "العملة");
    sel.innerHTML = Object.entries(CURRENCIES).map(([k, c]) => `<option value="${k}">${c.sym} ${c.name}</option>`).join("");
    sel.onchange = () => C.set(sel.value);
    bar.appendChild(sel);
    sync();
  });
})();
