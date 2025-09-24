// Carregador dinâmico de OGL com fallback local (apenas dev) e entre CDNs (produção)
async function loadOGL() {
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const sources = isLocal
    ? [
        './node_modules/ogl/src/index.js',
        'https://cdn.jsdelivr.net/npm/ogl@0.0.32/dist/ogl.mjs',
        'https://unpkg.com/ogl@0.0.32/dist/ogl.mjs',
        'https://esm.sh/ogl@0.0.32'
      ]
    : [
        'https://cdn.jsdelivr.net/npm/ogl@0.0.32/dist/ogl.mjs',
        'https://unpkg.com/ogl@0.0.32/dist/ogl.mjs',
        'https://esm.sh/ogl@0.0.32'
      ];
  let lastError = null;
  for (const src of sources) {
    try {
      const mod = await import(src);
      if (mod?.Renderer && mod?.Program && mod?.Mesh && mod?.Color && mod?.Triangle) {
        return mod;
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('Falha ao carregar OGL de todos os CDNs');
}

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

export class Aurora {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      colorStops: options.colorStops || ["#3A29FF", "#FF94B4", "#FF3232"],
      amplitude: options.amplitude || 1.0,
      blend: options.blend || 0.5,
      speed: options.speed || 0.5
    };
    
    this.renderer = null;
    this.program = null;
    this.mesh = null;
    this.animateId = null;
    
    this.ready = this.init();
  }

  async init() {
    const ctn = this.container;
    if (!ctn) return;

    try {
      const { Renderer, Program, Mesh, Color, Triangle } = await loadOGL();
      this._ogl = { Renderer, Program, Mesh, Color, Triangle };

      this.renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true
      });
      
      const gl = this.renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.canvas.style.backgroundColor = 'transparent';

      this.resize = this.resize.bind(this);
      window.addEventListener('resize', this.resize);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) {
        delete geometry.attributes.uv;
      }

      const colorStopsArray = this.options.colorStops.map(hex => {
        const c = new this._ogl.Color(hex);
        return [c.r, c.g, c.b];
      });

      this.program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: this.options.amplitude },
          uColorStops: { value: colorStopsArray },
          uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
          uBlend: { value: this.options.blend }
        }
      });

      this.mesh = new Mesh(gl, { geometry, program: this.program });
      ctn.appendChild(gl.canvas);

      this.startAnimation();
      this.resize();
      
      console.log('Aurora background inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Aurora:', error);
      // Fallback: manter o fundo grafite
    }
  }

  resize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    this.renderer.setSize(width, height);
    if (this.program) {
      this.program.uniforms.uResolution.value = [width, height];
    }
  }

  startAnimation() {
    if (!this.program || !this.renderer || !this.mesh) return;
    
    const animate = (t) => {
      this.animateId = requestAnimationFrame(animate);
      const time = t * 0.01;
      this.program.uniforms.uTime.value = time * this.options.speed * 0.1;
      this.program.uniforms.uAmplitude.value = this.options.amplitude;
      this.program.uniforms.uBlend.value = this.options.blend;
      
      const colorStopsArray = this.options.colorStops.map(hex => {
        // Em ambientes que não suportam optional chaining em "new",
        // garantimos que this._ogl já foi definido no init() antes de animar
        const c = new this._ogl.Color(hex);
        return [c.r, c.g, c.b];
      });
      this.program.uniforms.uColorStops.value = colorStopsArray;
      
      this.renderer.render({ scene: this.mesh });
    };
    this.animateId = requestAnimationFrame(animate);
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  destroy() {
    if (this.animateId) {
      cancelAnimationFrame(this.animateId);
    }
    window.removeEventListener('resize', this.resize);
    if (this.container && this.renderer && this.renderer.gl.canvas.parentNode === this.container) {
      this.container.removeChild(this.renderer.gl.canvas);
    }
    if (this.renderer && this.renderer.gl) {
      this.renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }
}