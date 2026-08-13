const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const yearSlot = document.querySelector("[data-year]");
if (yearSlot) yearSlot.textContent = new Date().getFullYear();

const closeMenu = () => {
  if (!menu || !menuToggle) return;
  menu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

if (menu && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  // Escape closes the menu and returns focus to the trigger.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.classList.contains("open")) return;
    closeMenu();
    menuToggle.focus();
  });
}

navLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) closeMenu();
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("visible");
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${visible.target.id}`,
      );
    });
  },
  {
    rootMargin: "-18% 0px -68% 0px",
    threshold: [0, 0.2, 0.5],
  },
);

sections.forEach((section) => sectionObserver.observe(section));

// Reflect the active section for assistive tech, not just visually.
const nav = document.getElementById("primary-nav");
if (nav) {
  const syncCurrent = () => {
    navLinks.forEach((link) => {
      if (link.classList.contains("active")) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };
  new MutationObserver(syncCurrent).observe(nav, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}
