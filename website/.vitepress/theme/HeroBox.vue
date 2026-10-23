<script setup lang="ts">
// The home page's hero graphic: the black box of the logo, open, with source cards (two manga pages, one anime episode)
// dropping into it one after another. The front of the box hides each card as it falls in (clip path below).
const cards = [
  { kind: "manga", x: -34, tilt: -8, delay: 0 },
  { kind: "anime", x: 6, tilt: 5, delay: 1.6 },
  { kind: "manga", x: 38, tilt: -3, delay: 3.2 },
];
</script>

<template>
  <div class="hero-box" role="img" aria-label="Sources dropping into a black box">
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- everything above the box's front edges: a card below them is inside the box -->
        <clipPath id="tb-above-front">
          <path d="M0 0H320V170H250L160 215L70 170H0Z" />
        </clipPath>
      </defs>

      <!-- the two back flaps and the dark opening -->
      <path class="flap" d="M70 170L160 125L150 78L60 123Z" />
      <path class="flap" d="M160 125L250 170L260 123L170 78Z" />
      <path class="inside" d="M70 170L160 125L250 170L160 215Z" />

      <!-- the cards, falling into the opening -->
      <g clip-path="url(#tb-above-front)">
        <g
          v-for="(card, i) in cards"
          :key="i"
          class="card"
          :style="{ animationDelay: `${card.delay}s`, '--x': `${card.x}px`, '--tilt': `${card.tilt}deg` }"
        >
          <g transform="translate(136 0)">
            <rect class="card-face" width="48" height="62" rx="7" />
            <template v-if="card.kind === 'manga'">
              <rect class="card-ink" x="9" y="9" width="30" height="22" rx="3" />
              <rect class="card-ink" x="9" y="37" width="30" height="4" rx="2" />
              <rect class="card-ink" x="9" y="46" width="20" height="4" rx="2" />
            </template>
            <template v-else>
              <path class="card-ink" d="M19 20L34 31L19 42Z" />
            </template>
          </g>
        </g>
      </g>

      <!-- the front of the box, over the cards -->
      <path class="side" d="M70 170L160 215V295L70 250Z" />
      <path class="side dark" d="M250 170L160 215V295L250 250Z" />
      <path class="edge" d="M70 170L160 215L250 170M160 215V295" />
      <!-- the two front flaps, folded open outward over the front faces -->
      <path class="flap front" d="M70 170L160 215L126 232L36 187Z" />
      <path class="flap front" d="M250 170L160 215L194 232L284 187Z" />
      <!-- the plus of the logo, on the left face below its flap -->
      <path class="plus" d="M113 238v28M99 252h28" />
    </svg>
  </div>
</template>

<style scoped>
/* placed and sized like the theme's own hero image (.image-src): 192, 256 and 320 px wide, centred in its frame */
.hero-box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 192px;
  transform: translate(-50%, -50%);
}
@media (min-width: 640px) {
  .hero-box {
    width: 256px;
  }
}
@media (min-width: 960px) {
  .hero-box {
    width: 320px;
  }
}
svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.flap {
  fill: #2a2a2e;
  stroke: #ffffff;
  stroke-opacity: 0.35;
  stroke-width: 2;
  stroke-linejoin: round;
}
.flap.front {
  fill: #1c1c1f;
  stroke-opacity: 0.5;
}
.inside {
  fill: #000000;
  stroke: #ffffff;
  stroke-width: 3;
  stroke-linejoin: round;
}
.side {
  fill: #101012;
  stroke: #ffffff;
  stroke-opacity: 0.18;
  stroke-width: 2;
  stroke-linejoin: round;
}
.side.dark {
  fill: #0a0a0b;
}
.edge {
  fill: none;
  stroke: #ffffff;
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.plus {
  stroke: #ffffff;
  stroke-width: 6;
  stroke-linecap: round;
}
.card-face {
  fill: #ffffff;
  stroke: #101012;
  stroke-width: 3;
}
.card-ink {
  fill: #101012;
}
.card {
  opacity: 0;
  transform-box: view-box;
  /* the middle of a card at the top of the box (it is drawn at x 136, 48 x 62) */
  transform-origin: 160px 31px;
  animation: drop 4.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes drop {
  0% {
    opacity: 0;
    transform: translate(var(--x), 10px) rotate(var(--tilt));
  }
  12% {
    opacity: 1;
  }
  55% {
    transform: translate(var(--x), 90px) rotate(var(--tilt));
  }
  80%,
  100% {
    opacity: 1;
    transform: translate(calc(var(--x) * 0.3), 230px) rotate(0deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
    opacity: 1;
    transform: translate(var(--x), 40px) rotate(var(--tilt));
  }
}
</style>
