// Efeito de destaque inspirado em HeroHighlight (sem React/Framer)
// Aplica padrão de pontos e spotlight seguindo o mouse

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('aurora-background');
  if (!container) return;

  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '0';

  const layerLight = document.createElement('div');
  const layerDark = document.createElement('div');
  const spotlight = document.createElement('div');

  const dotPattern = (color) => ({
    backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    backgroundSize: '16px 16px',
  });

  Object.assign(layerLight.style, {
    position: 'absolute',
    inset: '0',
    // Escurecer ainda mais os pontos base (modo claro)
    opacity: '1',
    pointerEvents: 'none',
    // neutral-700 para ficar mais escuro
    ...dotPattern('rgb(64 64 64)')
  });

  Object.assign(layerDark.style, {
    position: 'absolute',
    inset: '0',
    // Em dark mode, ainda mais escuro
    opacity: '0.9',
    pointerEvents: 'none',
    // neutral-900
    ...dotPattern('rgb(23 23 23)')
  });

  // Spotlight vermelho sob o cursor
  Object.assign(spotlight.style, {
    position: 'absolute',
    inset: '0',
    opacity: '0',
    transition: 'opacity 300ms ease',
    pointerEvents: 'none',
    // red-500
    ...dotPattern('rgb(239 68 68)')
  });

  container.appendChild(layerLight);
  container.appendChild(layerDark);
  container.appendChild(spotlight);

  // Hover em toda a página
  document.addEventListener('mousemove', (e) => {
    const rect = document.body.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mask = `radial-gradient(200px circle at ${x}px ${y}px, black 0%, transparent 100%)`;
    spotlight.style.webkitMaskImage = mask;
    spotlight.style.maskImage = mask;
    spotlight.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
});


