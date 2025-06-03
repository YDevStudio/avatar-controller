import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Initialise les contrôles orbitaux de la caméra avec des limites personnalisées.
 *
 * - Active un effet de "damping" (inertie douce).
 * - Restreint le zoom et les angles verticaux pour éviter des mouvements étranges.
 * - Centre la vue sur la tête de l’avatar (position verticale 1.2).
 *
 * @param camera - Caméra utilisée dans la scène (PerspectiveCamera)
 * @param domElement - Élément DOM sur lequel appliquer les contrôles (ex: canvas)
 * @returns Une instance configurée de `OrbitControls`
 */
export function setupControls(camera: THREE.PerspectiveCamera, domElement: HTMLElement): OrbitControls {
    const controls = new OrbitControls(camera, domElement);

    // Activation de l'inertie quand on bouge la caméra
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Limites de zoom
    controls.minDistance = 2;
    controls.maxDistance = 6;

    // Limites verticales pour éviter de passer sous le sol ou trop haut
    controls.minPolarAngle = Math.PI / 6;   // ≈ 30°
    controls.maxPolarAngle = Math.PI / 2.2; // ≈ 80°

    // Focus par défaut : hauteur de la tête du modèle
    controls.target.set(0, 1.2, 0);
    controls.update();

    return controls;
}