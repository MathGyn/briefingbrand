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
    // Deixar os pontos mais escuros no estado sem hover
    opacity: '1',
    pointerEvents: 'none',
    // neutral-600 para ficar mais escuro
    ...dotPattern('rgb(115 115 115)')
  });

  Object.assign(layerDark.style, {
    position: 'absolute',
    inset: '0',
    // Para ambientes dark, manter visível também
    opacity: '0.7',
    pointerEvents: 'none',
    ...dotPattern('rgb(38 38 38)') // neutral-800 for dark
  });

  // Spotlight indigo sob o cursor
  Object.assign(spotlight.style, {
    position: 'absolute',
    inset: '0',
    opacity: '0',
    transition: 'opacity 300ms ease',
    pointerEvents: 'none',
    ...dotPattern('rgb(99 102 241)') // indigo-500
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


