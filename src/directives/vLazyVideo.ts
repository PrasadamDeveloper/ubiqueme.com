// Shared IntersectionObserver instance — evita crear un observer por cada video
let sharedObserver: IntersectionObserver | null = null

function getSharedObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoElement = entry.target as HTMLVideoElement
            const src = videoElement.dataset.lazySrc
            if (src) {
              videoElement.src = src
              videoElement.load()
              if (videoElement.hasAttribute('autoplay')) {
                videoElement.play().catch(() => {
                  // Autoplay bloqueado por el navegador, silencioso
                })
              }
            }
            sharedObserver!.unobserve(videoElement)
          }
        })
      },
      { rootMargin: '0px 0px 400px 0px', threshold: 0 },
    )
  }
  return sharedObserver
}

export const vLazyVideo = {
  mounted(el: HTMLVideoElement, binding: any) {
    el.dataset.lazySrc = binding.value
    getSharedObserver().observe(el)
  },
  unmounted(el: HTMLVideoElement) {
    if (sharedObserver) {
      sharedObserver.unobserve(el)
    }
  },
}
