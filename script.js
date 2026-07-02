// ---------- Top nav: floating-on-scroll + mobile burger ----------
const siteNav = document.getElementById("siteNav");
const navBurger = document.getElementById("navBurger");
const navInner = document.getElementById("navInner");
const heroEl = document.querySelector(".hero");

// turn the nav into a translucent floating pill once the first section is passed
function updateNav() {
  if (!siteNav || !heroEl) return;
  const passed = heroEl.getBoundingClientRect().bottom < 70;
  siteNav.classList.toggle("floating", passed);
}
window.addEventListener("scroll", updateNav, { passive: true });
window.addEventListener("resize", updateNav);
updateNav();

// mobile burger toggle
function closeNav() {
  navInner.classList.remove("open");
  navBurger.classList.remove("open");
  navBurger.setAttribute("aria-expanded", "false");
}
navBurger.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = navInner.classList.toggle("open");
  navBurger.classList.toggle("open", open);
  navBurger.setAttribute("aria-expanded", String(open));
});
navInner
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => closeNav()));
document.addEventListener("click", (e) => {
  if (!navInner.contains(e.target) && !navBurger.contains(e.target)) closeNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// ---------- Inline video player (play on the site, no YouTube redirect) ----------
document.querySelectorAll('a.thumb[href*="youtube.com/watch"]').forEach((thumb) => {
  thumb.addEventListener("click", (e) => {
    e.preventDefault();
    if (thumb.classList.contains("playing")) return;
    let id = null;
    try {
      id = new URL(thumb.href).searchParams.get("v");
    } catch (_) {}
    if (!id) return;
    const iframe = document.createElement("iframe");
    iframe.src =
      "https://www.youtube.com/embed/" +
      id +
      "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    iframe.title = "YouTube video player";
    iframe.allow =
      "autoplay; encrypted-media; picture-in-picture; fullscreen; web-share";
    iframe.allowFullscreen = true;
    thumb.classList.add("playing");
    thumb.appendChild(iframe);
  });
});

// ---------- Language switcher (FR / EN) ----------
const FR_QUOTES = {
  wow: '" Wow ! J\'adore ce rythme, incroyable mec, meilleure vidéo de la chaîne "',
  treat:
    '" Ok je viens de finir la vidéo, un vrai régal. C\'est incroyable, merci beaucoup pour ton implication !<br />Bien joué \u{1F389} "',
  level:
    '" franchement le montage m\'a satisfait, honnêtement je suis agréablement surpris par ton niveau "',
  bestFrance:
    '" L\'un des meilleurs monteurs gaming de France. Entre l\'animation, le dynamisme et la créativité, je n\'ai jamais été déçu "',
  stopit:
    '" Ok, je viens de voir la vidéo, mec, tu ne m\'as jamais déçu, arrête ! mdr \u{1F923} "',
  recommend:
    '" Monteur sérieux, impliqué et très professionnel qui respecte les délais. Je recommande vivement ! "',
};
const MARQUEE = {
  en: "Fluent in French and English",
  fr: "Bilingue français et anglais",
};
const SUBS = { en: "subs", fr: "abonnés" };

const trEls = [...document.querySelectorAll("[data-fr],[data-tkey]")];
const enCache = new Map();
trEls.forEach((el) => enCache.set(el, el.innerHTML));

const langToggle = document.getElementById("langToggle");
const langLabel = document.getElementById("langLabel");

function frValue(el) {
  if (el.dataset.fr != null) return el.dataset.fr;
  if (el.dataset.tkey && FR_QUOTES[el.dataset.tkey])
    return FR_QUOTES[el.dataset.tkey];
  return enCache.get(el);
}

function setLang(lang) {
  const fr = lang === "fr";
  trEls.forEach((el) => {
    el.innerHTML = fr ? frValue(el) : enCache.get(el);
  });
  document.querySelectorAll(".marquee-track span").forEach((s) => {
    s.textContent = fr ? MARQUEE.fr : MARQUEE.en;
  });
  document.querySelectorAll(".client-subs, .subs").forEach((el) => {
    if (!el.dataset.num) {
      el.dataset.num = el.textContent
        .replace(/\s*(subs|abonnés)\s*$/i, "")
        .trim();
    }
    el.textContent = el.dataset.num + " " + (fr ? SUBS.fr : SUBS.en);
  });
  document.documentElement.lang = lang;
  if (langLabel) langLabel.textContent = lang.toUpperCase();
  try {
    localStorage.setItem("lang", lang);
  } catch (_) {}
}

let currentLang = "en";
try {
  currentLang = localStorage.getItem("lang") || "en";
} catch (_) {}
setLang(currentLang);

if (langToggle) {
  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setLang(document.documentElement.lang === "fr" ? "en" : "fr");
  });
}
