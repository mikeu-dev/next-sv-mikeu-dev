import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

gsap.registerPlugin(ScrollTrigger);

export function useWorkSection() {
  const workSection = writable<HTMLElement | null>(null);
  const projectCardElements = writable<HTMLElement[]>([]);
  const tooltipOpen = writable(false);
  const virtualAnchor = writable<{ getBoundingClientRect: () => DOMRect } | null>(null);
  const tooltipText = writable('Click and hover the cards to see interaction!');

  function createVirtualAnchor(x: number, y: number) {
    return { getBoundingClientRect: () => new DOMRect(x, y, 1, 1) };
  }

  onMount(() => {
    const section = get(workSection);
    const elements = get(projectCardElements);
    if (!section) return;

    // Animasi muncul section
    gsap.from(section, {
      y: 50,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    // Animasi kartu saat scroll muncul
    elements.forEach((el, i) => {
      gsap.from(el, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });

      // Parallax hover effect
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          rotationY: x * 0.05,
          rotationX: -y * 0.05,
          transformPerspective: 600,
          transformOrigin: 'center',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    });

    // Tooltip mouse move
    function handleMouseMove(event: MouseEvent) {
      virtualAnchor.set(createVirtualAnchor(event.clientX, event.clientY));
    }
    section.addEventListener('mousemove', handleMouseMove);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      elements.forEach((el) => {
        el.replaceWith(el.cloneNode(true)); // hapus semua listener hover
      });
    };
  });

  return {
    workSection,
    projectCardElements,
    tooltipOpen,
    virtualAnchor,
    tooltipText
  };
}
