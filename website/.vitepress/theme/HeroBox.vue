<script setup lang="ts">
// The home page's hero graphic: the black box of the logo, open, with the logo's plus dropping into it again and again.
// The front of the box hides each plus as it falls in (clip path below).
const pluses = [
  { x: -30, tilt: -6, delay: 0 },
  { x: 8, tilt: 5, delay: 1.6 },
  { x: 34, tilt: -3, delay: 3.2 },
];
</script>

<template>
  <div class="hero-box" role="img" aria-label="A plus dropping into a black box">
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- everything above the box's front edges: a plus below them is inside the box -->
        <clipPath id="tb-above-front">
          <path d="M0 0H320V170H250L160 215L70 170H0Z" />
        </clipPath>
      </defs>

      <!-- the two back flaps and the dark opening -->
      <path class="flap" d="M70 170L160 125L150 78L60 123Z" />
      <path class="flap" d="M160 125L250 170L260 123L170 78Z" />
      <path class="inside" d="M70 170L160 125L250 170L160 215Z" />

      <!-- the pluses, falling into the opening -->
      <g clip-path="url(#tb-above-front)">
        <g
          v-for="(plus, i) in pluses"
          :key="i"
          class="falling"
          :style="{ animationDelay: `${plus.delay}s`, '--x': `${plus.x}px`, '--tilt': `${plus.tilt}deg` }"
        >
          <path class="plus-outline" d="M160 11v40M140 31h40" />
          <path class="plus" d="M160 11v40M140 31h40" />
        </g>
      </g>

      <!-- the front of the box, over the pluses -->
      <path class="side" d="M70 170L160 215V295L70 250Z" />
      <path class="side dark" d="M250 170L160 215V295L250 250Z" />
      <path class="edge" d="M70 170L160 215L250 170M160 215V295" />
      <!-- the two front flaps, folded open outward over the front faces -->
      <path class="flap front" d="M70 170L160 215L126 232L36 187Z" />
      <path class="flap front" d="M250 170L160 215L194 232L284 187Z" />
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
  stroke-width: 11;
  stroke-linecap: round;
}
/* a black outline under the falling plus, so it shows on the light page as well as over the dark box */
.plus-outline {
  stroke: #101012;
  stroke-width: 17;
  stroke-linecap: round;
}
.falling {
  opacity: 0;
  transform-box: view-box;
  /* the middle of the plus (it is drawn around 160, 31) */
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
  .falling {
    animation: none;
    opacity: 1;
    transform: translate(var(--x), 40px) rotate(var(--tilt));
  }
}
</style>
