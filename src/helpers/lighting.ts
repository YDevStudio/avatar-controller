import * as THREE from 'three';

/**
 * Ajoute un éclairage réaliste à la scène :
 * - Une lumière hémisphérique pour la lumière ambiante globale
 * - Une lumière directionnelle qui projette des ombres
 *
 * @param scene - La scène Three.js dans laquelle ajouter les lumières
 * @returns La DirectionalLight principale (utile pour des ajustements futurs)
 */
export function setupLighting(scene: THREE.Scene): THREE.DirectionalLight {
    // Lumière d’ambiance douce (ciel/blé + sol foncé)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0); // au-dessus de la scène
    scene.add(hemiLight);

    // Lumière principale type soleil, qui projette des ombres
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 5); // décalée pour créer des ombres visibles
    dirLight.castShadow = true;

    // Config ombres : qualité, position de la caméra virtuelle pour les ombres
    dirLight.shadow.mapSize.width = 2048;  // meilleure résolution
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;        // évite les artefacts visuels

    // Taille de la "caméra" des ombres : délimite la zone qui projette des ombres
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;

    scene.add(dirLight);
    return dirLight;
}