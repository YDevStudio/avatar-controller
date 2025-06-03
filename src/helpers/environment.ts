import * as THREE from 'three';

/**
 * Configure l’environnement visuel de la scène :
 * - Ajoute une skybox (texture HDR simulée)
 * - Crée un sol avec texture répétée et effet de réflexion
 *
 * @param scene - La scène Three.js à enrichir
 * @param renderer - Le renderer WebGL utilisé (sert pour l’anisotropy)
 */
export function setupEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
    // Texture de fond (skybox simple, utilisée aussi comme environnement pour les reflets)
    const skyTexture = new THREE.TextureLoader().load('/images/sky.png');
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = skyTexture; // Pour les matériaux PBR (réflexions réalistes)
    scene.background = skyTexture;  // Pour le visuel global

    // Texture du sol (image carrelée)
    const groundTexture = new THREE.TextureLoader().load('/images/surface.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10); // Répéter la texture sur le grand sol
    groundTexture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // meilleure qualité d’affichage oblique

    // Matériau du sol : un standard PBR avec un peu de métal et de rugosité
    const groundMat = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.5,
        metalness: 0.3,
        envMap: skyTexture,
        envMapIntensity: 1.0,
    });

    // Mesh du sol (un simple plan de 300x300 unités)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), groundMat);
    ground.rotation.x = -Math.PI / 2; // pour le placer à plat
    ground.receiveShadow = true;     // permet de recevoir les ombres du modèle
    scene.add(ground);
}