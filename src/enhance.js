// Progressive enhancement: streaming reveal on scroll and the XP reading-progress bar.
// The page is complete without this file; styles.css only hides content under html.js,
// a class set by the inline script in <head>.

(() => {
  const root = document.documentElement;

  // ---- Streaming reveal -------------------------------------------------------
  const REVEAL = ".section:not(.section--about) .section__header, .entry, .tool, .language";
  const targets = document.querySelectorAll(REVEAL);

  if (!("IntersectionObserver" in window)) {
    root.classList.remove("js");
  } else {
    const observer = new IntersectionObserver(
      (records) => {
        // Items entering together are staggered so the list streams in one by one.
        let order = 0;
        for (const record of records) {
          if (!record.isIntersecting) continue;
          record.target.style.setProperty("--reveal-delay", `${Math.min(order, 8) * 0.09}s`);
          record.target.classList.add("is-visible");
          observer.unobserve(record.target);
          order += 1;
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    targets.forEach((target) => observer.observe(target));
  }

  // ---- XP bar -----------------------------------------------------------------
  const bar = document.querySelector(".xp-bar");
  if (!bar) return;

  const list = bar.querySelector(".xp-bar__checkpoints");
  const levelText = bar.querySelector(".xp-bar__level");
  const valueText = bar.querySelector(".xp-bar__value");
  const marker = bar.querySelector(".xp-bar__marker");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sections = [...document.querySelectorAll("main section[id]")];
  let checkpoints = [];
  let level = 0;
  let queued = false;

  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);

  // One checkpoint per distinct section start; paired sections share a row and a checkpoint.
  function measure() {
    const max = maxScroll();
    const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const stops = [];
    for (const section of sections) {
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      const stop = max > 0 ? Math.min(1, Math.max(0, top / max)) : 0;
      if (!stops.some((existing) => Math.abs(existing - stop) < 0.005)) stops.push(stop);
    }
    // Rebuild only when the count changes (pairs stack below 960px); otherwise just
    // move the existing items so their pop-in animation does not replay.
    if (stops.length !== checkpoints.length) {
      list.replaceChildren();
      checkpoints = stops.map((stop, index) => {
        const item = document.createElement("li");
        item.className = "xp-bar__checkpoint";
        item.style.setProperty("--i", String(index));
        list.append(item);
        return { item, stop };
      });
    }
    checkpoints.forEach((checkpoint, index) => {
      checkpoint.stop = stops[index];
      checkpoint.item.style.top = `${(stops[index] * 100).toFixed(2)}%`;
    });
    update();
  }

  function update() {
    queued = false;
    const max = maxScroll();
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    bar.style.setProperty("--p", progress.toFixed(4));

    let reached = 0;
    for (const { item, stop } of checkpoints) {
      const on = progress >= stop - 0.002;
      item.classList.toggle("is-reached", on);
      if (on) reached += 1;
    }
    if (reached > level && level > 0 && !reducedMotion.matches && marker.animate) {
      // Level-up flash: the marker swells and throws off a ring of light.
      marker.animate(
        [
          { scale: "1", filter: "brightness(1)" },
          { scale: "1.8", filter: "brightness(1.8)", offset: 0.35 },
          { scale: "1", filter: "brightness(1)" },
        ],
        { duration: 650, easing: "cubic-bezier(.215,.61,.355,1)" },
      );
    }
    level = reached;

    levelText.textContent = `Lv ${Math.max(1, reached)}`;
    valueText.textContent = `${Math.round(progress * 100)}%`;
    bar.classList.toggle("is-started", progress > 0.005);
    bar.classList.toggle("is-complete", progress >= 0.995);
  }

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  bar.hidden = false;
  measure();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  if ("ResizeObserver" in window) new ResizeObserver(() => measure()).observe(document.body);
  document.fonts?.ready.then(measure);
})();
