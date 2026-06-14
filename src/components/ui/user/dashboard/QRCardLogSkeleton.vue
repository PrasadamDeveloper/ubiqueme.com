<template>
  <div class="bg-[#090b14] border border-white/5 rounded-2xl p-5 space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-2">
        <div class="h-3 w-24 bg-white/10 rounded skeleton-item"></div>
        <div class="h-3 w-32 bg-white/5 rounded skeleton-item"></div>
      </div>
      <div class="h-2 w-20 bg-white/5 rounded skeleton-item"></div>
    </div>

    <!-- Image Placeholder -->
    <div class="w-full h-48 rounded-xl bg-black/40 border border-white/10 skeleton-item opacity-20"></div>

    <!-- Message Placeholder -->
    <div class="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
      <div class="h-2 w-full bg-white/5 rounded skeleton-item"></div>
      <div class="h-2 w-3/4 bg-white/5 rounded skeleton-item"></div>
    </div>

    <!-- Map Placeholder -->
    <div class="space-y-2">
      <div class="h-2 w-24 bg-white/5 rounded skeleton-item"></div>
      <div class="w-full h-[180px] rounded-xl bg-black/40 border border-white/10 skeleton-item opacity-20"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-item {
  position: relative;
  overflow: hidden;
  animation: smooth-pulse 2.5s infinite ease-in-out;
}

.skeleton-item::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 40%,
      rgba(255, 255, 255, 0.06) 50%,
      rgba(255, 255, 255, 0.03) 60%,
      transparent 100%);
  animation: shimmer 1s infinite linear;
}

@keyframes smooth-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
