const fittedHeadings = document.querySelectorAll("[data-fit-text]");
const measurementContext = document.createElement("canvas").getContext("2d");

function fitHeading(heading) {
  const container = heading.parentElement;
  heading.style.setProperty("--fit-scale", "1");

  const styles = getComputedStyle(heading);
  const text = heading.textContent.trim();
  const letterSpacing = parseFloat(styles.letterSpacing) || 0;

  measurementContext.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

  const metrics = measurementContext.measureText(text);
  const inkStart = -metrics.actualBoundingBoxLeft;
  const inkWidth =
    metrics.actualBoundingBoxLeft +
    metrics.actualBoundingBoxRight +
    letterSpacing * (text.length - 1);
  const scale = container.clientWidth / inkWidth;

  heading.style.setProperty("--fit-scale", scale);
  heading.style.setProperty("--ink-left", `${-inkStart * scale}px`);
  container.style.setProperty("--fit-height", `${heading.getBoundingClientRect().height}px`);
}

document.fonts.ready.then(() => {
  fittedHeadings.forEach(fitHeading);
});

let fitFrame;
const pendingHeadings = new Set();
const fitObserver = new ResizeObserver((entries) => {
  entries.forEach(({ target }) => {
    const heading = target.querySelector("[data-fit-text]");
    if (heading) pendingHeadings.add(heading);
  });

  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(() => {
    pendingHeadings.forEach(fitHeading);
    pendingHeadings.clear();
  });
});

fittedHeadings.forEach((heading) => fitObserver.observe(heading.parentElement));

const displaySections = document.querySelectorAll(".recent-work, .footer-display");
const displayObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelector("[data-fit-text]").classList.add("is-visible");
      displayObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
);

displaySections.forEach((section) => displayObserver.observe(section));

const initiallyVisibleImages = document.querySelectorAll(
  '.portfolio-item[data-mobile-order="1"] img, .portfolio-item[data-mobile-order="2"] img, .portfolio-item[data-mobile-order="3"] img'
);

// Warm the decoded image cache before these cards reach the viewport. The
// matching preload hints in the document head start their downloads earlier.
initiallyVisibleImages.forEach((image) => image.decode().catch(() => {}));

const touchPortfolioItems = document.querySelectorAll(".portfolio-item");
const touchInput = window.matchMedia("(hover: none), (pointer: coarse)");

touchPortfolioItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    if (!touchInput.matches || event.target.closest("a")) return;

    const willOpen = !item.classList.contains("is-active");
    touchPortfolioItems.forEach((otherItem) => {
      otherItem.classList.remove("is-active");
    });
    item.classList.toggle("is-active", willOpen);
  });
});

document.addEventListener("click", (event) => {
  if (!touchInput.matches || event.target.closest(".portfolio-item")) return;
  touchPortfolioItems.forEach((item) => item.classList.remove("is-active"));
});

const aboutSection = document.querySelector(".about");
const aboutObserver = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting) return;
    aboutSection.classList.add("is-visible");
    aboutObserver.disconnect();
  },
  { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
);

aboutObserver.observe(aboutSection);

const menuButton = document.querySelector(".menu-button");
const siteMenu = document.querySelector(".site-menu");

function setMenu(open) {
  menuButton.classList.toggle("is-open", open);
  siteMenu.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  siteMenu.setAttribute("aria-hidden", String(!open));
  siteMenu.inert = !open;
}

menuButton.addEventListener("click", () => {
  setMenu(!siteMenu.classList.contains("is-open"));
});

siteMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("click", (event) => {
  if (!siteMenu.contains(event.target) && !menuButton.contains(event.target)) {
    setMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
    setMenu(false);
    menuButton.focus();
  }
});
