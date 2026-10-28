"use client";

import { useEffect } from "react";

/**
 * The site's motion and controls (was os.js): mobile menu, scroll reveals, scroll progress, cursor glow
 * and the hero film buttons. Works off the DOM with delegated listeners so the CMS preview, which
 * re-renders blocks as Dan types, keeps working without remounting anything.
 */
export function SiteEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    const setMenu = (open: boolean) => {
      const button = document.querySelector(".menu-toggle");
      const menu = document.querySelector(".mobile-menu");
      root.classList.toggle("menu-open", open);
      button?.setAttribute("aria-expanded", String(open));
      menu?.setAttribute("aria-hidden", String(!open));
      const label = button?.querySelector(".menu-label");
      if (label) label.textContent = open ? "Close" : "Menu";
    };

    const video = () => document.querySelector<HTMLVideoElement>(".art-video");

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest(".menu-toggle")) return setMenu(!root.classList.contains("menu-open"));
      if (target.closest(".mobile-menu a")) return setMenu(false);
      const v = video();
      const play = target.closest(".film-play");
      if (v && play) {
        if (v.paused) v.play().catch(() => {});
        else v.pause();
        return;
      }
      const sound = target.closest(".film-sound");
      if (v && sound) {
        const on = v.muted;
        v.muted = !on;
        if (on) {
          v.currentTime = 0;
          v.play().catch(() => {});
        }
        sound.setAttribute("aria-pressed", String(on));
        sound.textContent = on ? "Sound: on" : "Sound: off";
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    cleanups.push(() => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    });

    // Reveal on scroll, including sections added later in the preview.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const watched = new WeakSet<Element>();
    const syncFilm = () => {
      const v = video();
      const play = document.querySelector(".film-play");
      if (v && play) play.textContent = v.paused ? "Play" : "Pause";
    };
    const scan = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        observer.observe(el);
      });
      const v = video();
      if (v && !watched.has(v)) {
        watched.add(v);
        v.addEventListener("play", syncFilm);
        v.addEventListener("pause", syncFilm);
        syncFilm();
        if (!reduceMotion) v.play().catch(() => {});
      }
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    cleanups.push(() => {
      observer.disconnect();
      mutations.disconnect();
    });

    const updateScroll = () => {
      const bar = document.querySelector<HTMLElement>(".scroll-progress span");
      const scrollable = root.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    cleanups.push(() => window.removeEventListener("scroll", updateScroll));

    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
      let glowX = window.innerWidth / 2;
      let glowY = window.innerHeight / 2;
      let targetX = glowX;
      let targetY = glowY;
      let frame = 0;
      const onMove = (event: PointerEvent) => {
        targetX = event.clientX;
        targetY = event.clientY;
        const xRatio = event.clientX / window.innerWidth - 0.5;
        const yRatio = event.clientY / window.innerHeight - 0.5;
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax || 0);
          el.style.transform = `translate3d(${xRatio * amount}px, ${yRatio * amount}px, 0)`;
        });
      };
      const animate = () => {
        glowX += (targetX - glowX) * 0.09;
        glowY += (targetY - glowY) * 0.09;
        const glow = document.querySelector<HTMLElement>(".cursor-glow");
        if (glow) glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        frame = requestAnimationFrame(animate);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      animate();
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(frame);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
}
