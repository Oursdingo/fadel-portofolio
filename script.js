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
