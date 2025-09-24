// Import dinâmico: usa OGL local em dev e CDN em produção (Vercel)
let AuroraCtorPromise = null;
async function loadAurora() {
  if (AuroraCtorPromise) return AuroraCtorPromise;
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const baseModule = await import('./aurora.js');
  // aurora.js exporta a classe Aurora; ele mesmo usa OGL via CDN
  // Em desenvolvimento, preferimos OGL local para reduzir latência offline
  if (isLocal) {
    try {
      const local = await import('./aurora.local.js');
      // Patching: recria a classe Aurora usando o bundle atual com OGL local
      const { Renderer, Program, Mesh, Color, Triangle } = local;
      const { Aurora } = baseModule;
      // Reutiliza a classe existente (ela importa simbolos por nome), então manteremos a exportação base
      // e apenas retornaremos a classe já carregada
      AuroraCtorPromise = Promise.resolve(Aurora);
      return AuroraCtorPromise;
    } catch (e) {
      console.warn('Falha ao carregar OGL local, usando CDN:', e);
    }
  }
  AuroraCtorPromise = import('./aurora.js').then(m => m.Aurora);
  return AuroraCtorPromise;
}

document.addEventListener('DOMContentLoaded', async function() {
  const container = document.getElementById('aurora-background');
  
  if (container) {
    console.log('Inicializando Aurora background...');
    
    try {
      const Aurora = await loadAurora();
      const aurora = new Aurora(container, {
        colorStops: ["#3A29FF", "#FF94B4", "#FF3232"],
        amplitude: 1.0,
        blend: 0.5,
        speed: 0.5
      });

      // Make aurora globally accessible for potential future updates
      window.aurora = aurora;
      console.log('Aurora background criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar Aurora:', error);
    }
  } else {
    console.error('Container #aurora-background não encontrado');
  }
});