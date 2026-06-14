<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  trendIcon: {
    type: String,
    required: true,
  },
  trendText: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div
    class="col-span-1 border border-white/5 bg-white/[0.03] rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-500 hover:bg-white/[0.06] hover:border-amber-500/20 ">
    <!-- Background Hero Glow -->


    <div class="relative z-10 space-y-5">
      <!-- Icon Container -->
      <div class="relative inline-flex">

        <div
          class="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-amber-500 text-2xl group-hover:scale-110 transition-transform">{{
            icon }}</span>
        </div>
      </div>

      <div class="space-y-1">
        <p class="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">{{ title }}</p>
        <p class="text-4xl font-black text-white tracking-tighter">{{ value }}</p>
      </div>

      <!-- Trend Footer -->
      <div class="flex items-center gap-2 pt-4 border-t border-white/5 mt-2">
        <div class="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <span class="material-symbols-outlined text-[10px] text-amber-500 font-black">{{ trendIcon }}</span>
        </div>
        <span class="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">{{ trendText }}</span>
      </div>
    </div>

    <!-- Technical Decoration Overlay -->
    <div
      class="absolute right-4 bottom-4 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none">
      <span class="material-symbols-outlined text-[120px] font-black">{{ icon }}</span>
    </div>
  </div>
</template>

<style scoped></style>
