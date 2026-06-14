export const vLazyVideo = {
  mounted(el: HTMLVideoElement, binding: any) {
    // Usar IntersectionObserver API nativo (100% seguro y sin librerías)
    const options = {
      root: null,
      rootMargin: '0px 0px 400px 0px', // Cargar el video 400px antes de que entre a la pantalla
      threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const videoElement = entry.target as HTMLVideoElement;
          
          // Asignar el source real al video
          videoElement.src = binding.value;
          videoElement.load();
          
          // Si tiene el atributo autoplay, asegurar que se reproduzca
          if (videoElement.hasAttribute('autoplay')) {
            videoElement.play().catch(e => {
              console.warn("El autoplay fue bloqueado por el navegador", e);
            });
          }
          
          // Dejar de observar este elemento para ahorrar memoria
          observer.unobserve(videoElement);
        }
      });
    }, options);

    observer.observe(el);
  }
};
