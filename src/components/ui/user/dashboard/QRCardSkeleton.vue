<template>
  <div
    class="relative w-full max-w-[700px] bg-[#0d111d] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-lg font-google-sans">
    
    <div class="p-6 md:p-8">
      <!-- Header Skeleton -->
      <div class="flex justify-between items-start mb-6">
        <div class="flex flex-col gap-2">
          <!-- Title -->
          <div class="h-6 w-48 bg-white/10 rounded-md skeleton-item"></div>
          <!-- ID -->
          <div class="h-3 w-32 bg-white/5 rounded-md skeleton-item"></div>
        </div>

        <!-- Status Badge -->
        <div class="h-8 w-24 bg-white/10 rounded-full skeleton-item"></div>
      </div>

      <!-- Stats Pill Skeleton -->
      <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl mb-6 border border-white/5 overflow-hidden">
        <div class="flex flex-col gap-2">
          <div class="h-2 w-16 bg-white/5 rounded skeleton-item"></div>
          <div class="h-6 w-12 bg-white/10 rounded skeleton-item"></div>
        </div>
        <div class="w-px h-8 bg-white/10"></div>
        <div class="flex flex-col gap-2 items-end">
          <div class="h-2 w-16 bg-white/5 rounded skeleton-item"></div>
          <div class="h-4 w-24 bg-white/10 rounded skeleton-item"></div>
        </div>
      </div>

      <!-- Content Skeleton -->
      <div class="space-y-3 mb-6">
         <div class="h-3 w-40 bg-white/5 rounded skeleton-item mb-4"></div>
         <div class="w-full h-24 bg-black/40 rounded-[2rem] border border-white/5 skeleton-item"></div>
      </div>

      <!-- Asset Preview Skeleton -->
      <section class="relative flex justify-center bg-[#000000]/30 rounded-2xl overflow-hidden mb-6 border border-white/5 min-h-[220px]">
        <div class="w-full h-full skeleton-item opacity-10"></div>
      </section>

      <!-- Actions Footer Skeleton -->
      <div class="flex items-center justify-end">
        <div class="w-[42px] h-[42px] bg-white/5 border border-white/10 rounded-xl skeleton-item"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Custom Skeleton for Ubiqueme
</script>

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

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  20% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
