import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import * as THREE from 'three';
import { setupScene } from './helpers/scene';
import { setupLighting } from './helpers/lighting';
import { setupEnvironment } from './helpers/environment';
import { setupControls } from './helpers/controls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Web Component <avatar-controller>
 * Permet d'afficher un avatar 3D avec Three.js et de le contrôler via différentes animations.
 * Intègre une interface d'animation cliquable (tiles), et expose des événements personnalisés.
 */

@customElement('avatar-controller')
export class AvatarController extends LitElement {
  /** URL du modèle GLB à charger */
  @property({ type: String }) modelUrl = '';

  /** Active automatiquement l'animation "Standing" après chargement */
  @property({ type: Boolean }) autoplay = true;

  /** Largeur du composant (CSS string) */
  @property({ type: String }) width = '100%';

  /** Hauteur du composant (CSS string) */
  @property({ type: String }) height = 'auto';

  /** Mode de boucle pour les animations : en boucle ou une seule fois */
  @state() private loopMode: 'loop' | 'once' = 'loop';

  static styles = css`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    :host {
      display: block;
      width: var(--width, 100%);
      height: var(--height, auto);
      aspect-ratio: 16 / 9;
      background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
      --glass-bg: rgba(32, 32, 32, 0.25);
      --glass-border: rgba(255, 255, 255, 0.1);
      --primary: #2196F3;
      --tile-size: 84px;
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .container {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 768px) {
      .container {
        flex-direction: row;
      }
    }

    .viewer {
      flex: 1;
      position: relative;
    }

    .controls-panel {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 16px;
      margin: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      color: white;
    }

    @media (min-width: 768px) {
      .controls-panel {
        position: absolute;
        right: 0;
        top: 0;
        width: 280px;
        height: auto;
        max-height: calc(100% - 32px);
      }
    }

    @media (max-width: 767px) {
      .controls-panel {
        position: absolute;
        bottom: 0;
        left: 0;
        width: calc(100% - 32px);
        max-height: 35%;
        overflow-y: auto;
      }
    }

    .panel-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .animations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(var(--tile-size), 1fr));
      gap: 12px;
    }

    @media (max-width: 767px) {
      .animations-grid {
        grid-auto-flow: column;
        grid-auto-columns: var(--tile-size);
        overflow-x: auto;
      }
    }

    .animation-tile {
      all: unset;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: var(--tile-size);
      height: var(--tile-size);
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 500;
      transition: 0.2s ease all;
      cursor: pointer;
    }

    .animation-tile:hover {
      background: rgba(60, 60, 60, 0.4);
      transform: translateY(-1px);
    }

    .animation-tile[aria-pressed="true"] {
      background: rgba(33, 150, 243, 0.3);
      border-color: rgba(33, 150, 243, 0.5);
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.4);
    }

    .tile-icon {
      font-size: 1.6rem;
      margin-bottom: 6px;
    }
    .tile-icon img {
      width: 40px;
      height: 40px;
      object-fit: contain;
      display: block;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.15);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  // -- Three.js Core Objects --
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationFrameId = 0;
  private mixer?: THREE.AnimationMixer;
  private clock = new THREE.Clock();
  private avatar?: THREE.Object3D;
  private controls!: OrbitControls;

  /** Toutes les animations chargées associées à leur nom */
  private actions: Record<string, THREE.AnimationAction> = {};

  /** Animation actuellement jouée */
  private currentAction?: THREE.AnimationAction;

  /**
   * Rendu HTML (Lit) du composant
   * Génère l'interface avec les tuiles d'animation et la zone de rendu 3D
   */
  render() {
    const tiles = Object.keys(this.actions).map((name) => {
      const isActive = name === this.currentAction?.getClip().name;
      return html`
        <button
          class="animation-tile"
          aria-pressed=${isActive}
          ?disabled=${isActive}
          @click=${() => this.playAnimation(name)}
        >
          <div class="tile-icon">
            <img class="tile-icon" src=${this.getIconForAnimation(name)} alt=${name} />
          </div>
          ${name}
        </button>
      `;
    });

    return html`
      <div class="container">
        <div class="viewer">
          <canvas id="avatar-canvas"></canvas>
          ${!this.avatar ? html`
            <div class="loading-overlay">
              <div class="loading-spinner"></div>
            </div>
          ` : ''}
        </div>

        <div class="controls-panel">
          <div class="panel-title">Settings</div>
          <div class="animations-grid">
            <button class="animation-tile" @click=${() => this.playAnimation('Standing')}>
              <div class="tile-icon"><img src="/icons/standing.png" /></div>
              Reset
            </button>

            <button class="animation-tile" @click=${() => this.toggleLoopMode()}>
              <div class="tile-icon">${this.loopMode === 'loop' ? '🔁' : '⏱️'}</div>
              ${this.loopMode === 'loop' ? 'Loop' : 'Once'}
            </button>
          </div>
          <div class="panel-title">Animations</div>
          <div class="animations-grid">${tiles}</div>
        </div>
      </div>
    `;
  }

  /** Alterne entre le mode de boucle infini et "une seule fois" */
  private toggleLoopMode() {
    this.loopMode = this.loopMode === 'loop' ? 'once' : 'loop';
    this.requestUpdate();
  }

  /** Retourne l'icône associée à une animation donnée */
  private getIconForAnimation(name: string): string {
    const iconMap: Record<string, string> = {
      'Standing': '/icons/standing.png',
      'Dancing': '/icons/dancing.png',
      'Walk Back': '/icons/walking-back.png',
      'Stretching': '/icons/stretching.png',
      'Back Flip': '/icons/back-flip.png',
      'Crouch': '/icons/crouch.png',
    };

    return iconMap[name] || '/icons/standing.png';    // valeur par défaut
  }


  /**
     * Met à jour la taille du renderer (appelé lors du resize)
     */
  private resizeRenderer() {
    const width = this.clientWidth;
    const height = this.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }


  /**
    * Initialisation complète du canvas, caméra, modèle, environnement et animations
    */
  async firstUpdated() {
    const canvas = this.renderRoot.querySelector('#avatar-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Setup du renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(this.offsetWidth, this.offsetHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene & Camera
    this.scene = setupScene();
    this.camera = new THREE.PerspectiveCamera(45, this.clientWidth / this.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 1.2, 3);
    this.controls = setupControls(this.camera, this.renderer.domElement);

    // Lumière et fond
    setupLighting(this.scene);
    await setupEnvironment(this.scene, this.renderer);

    // Chargement du modèle + animations de base
    this.loadModel(this.modelUrl);

    this.resizeRenderer();
    window.addEventListener('resize', () => this.resizeRenderer());

    // Démarre l’animation idle si autoplay est activé
    if (this.autoplay) {
      this.playAnimation('Standing');
    }

    // Boucle de rendu
    const animate = () => {
      const delta = this.clock.getDelta();
      this.mixer?.update(delta);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  /** Charge un modèle GLB et initialise ses animations */
  private async loadModel(url: string) {
    if (!url) return;
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        this.avatar = model;

        // Active le castShadow sur tous les meshes du modèle
        model.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
          }
        });

        // Centre la caméra sur le modèle
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        this.controls.target.copy(center);
        this.controls.update();
        model.position.set(0, -box.min.y - 0.04, 0);
        this.scene.add(model);
        this.mixer = new THREE.AnimationMixer(model);

        // Pré-charge toutes les animations disponibles
        this.loadAnimation('Standing', '/animations/M_Standing_Idle_001.glb');
        this.loadAnimation('Dancing', '/animations/M_Dances_011.glb');
        this.loadAnimation('Walk Back', '/animations/M_Walk_Backwards_001.glb');
        this.loadAnimation('Stretching', '/animations/M_Standing_Expressions_006.glb');
        this.loadAnimation('Back Flip', '/animations/M_Back_Flip.glb');
        this.loadAnimation('Crouch', '/animations/M_Standard_Stand_To_Crouch.glb');
      },
      undefined,
      (err) => console.error('Error loading avatar:', err)
    );
  }

  /** Charge une animation et l’associe à un nom clé */
  public async loadAnimation(name: string, path: string) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        if (!this.mixer || !this.avatar) return;
        const clip = gltf.animations[0];
        const action = this.mixer.clipAction(clip, this.avatar);

        this.actions[name] = action;

        // Auto-play Idle
        if (name === 'Standing' && this.autoplay) this.playAnimation('Standing');

        this.requestUpdate();
      },
      undefined,
      (err) => console.error(`Error loading animation ${name}:`, err)
    );
  }

  /** Joue une animation spécifique (avec transition, loop, événements) */
  public playAnimation(name: string) {
    const action = this.actions[name];
    if (!action) return;

    // Configure le mode de boucle
    if (this.loopMode === 'loop') {
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
    } else {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }

    // Transition douce si une animation était déjà en cours
    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.crossFadeTo(action, 0.4, false);
    }

    // Événement de démarrage de l'animation
    this.dispatchEvent(
      new CustomEvent('animation-start', {
        detail: { name },
        bubbles: true,
        composed: true,
      })
    );

    this.currentAction = action;
    action.reset().fadeIn(0.2).play();

    // Gère la fin de l'animation (pour repasser à "Standing")
    const onFinished = () => {
      this.dispatchEvent(
        new CustomEvent('animation-end', {
          detail: { name },
          bubbles: true,
          composed: true,
        })
      );

      this.mixer?.removeEventListener('finished', onFinished);
      this.currentAction = undefined;

      if (name !== 'Standing' && name !== 'Walk Back') {
        this.playAnimation('Standing');
      }
    };

    if (name !== 'Standing' && name !== 'Walk Back') {
      this.mixer?.addEventListener('finished', onFinished);
    }

    this.requestUpdate();
  }

  /** Nettoyage lors du démontage du composant */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.resizeRenderer);
  }
}