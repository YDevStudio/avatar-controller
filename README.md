# `<avatar-controller>` – Lit + Three.js Web Component

Un Web Component stylé, modulaire et réutilisable permettant d'afficher un avatar 3D animé avec **Three.js**, construit avec **Lit** et **TypeScript**.

## 📦 Installation

```bash
npm install
```

## 🚀 Démarrage

### Développement local

```bash
npm run dev
```

### Lancer Storybook

```bash
npm run storybook
```

### Lancer les tests unitaires

```bash
npm run test
```

### Construire le projet

```bash
npm run build
```

## 🧠 Structure du projet

```
.
├── public/               # Ressources statiques (GLB, images, icônes)
│   ├── animations/       # Fichiers d'animations GLB
│   ├── icons/            # Icônes affichées sur les tuiles
│   ├── images/           # Environnement (ciel, sol)
│   └── models/           # Modèles 3D à charger (GLB)
├── src/
│   ├── __tests__/        # Tests unitaires Jest
│   ├── helpers/          # Fonctions utilitaires (scene, lighting, controls...)
│   ├── stories/          # Fichiers Storybook
│   ├── avatar-controller.ts  # Composant principal
│   └── index.css         
├── README.md
├── tsconfig.json         # Configuration TypeScript
├── jest.config.ts        # Configuration Jest
├── vite.config.ts        # Configuration Vite
└── package.json
```

## 📚 Documentation

- **Code commenté** avec JSDoc pour chaque fonction utilitaire.
- **Storybook** contient deux histoires :
  - `Default` : Avatar en mode idle.
  - `Controls` : Interaction avec les animations.

## 🧪 Tests

- **Jest** pour la logique TypeScript.
- **Testing Library** intégré à Storybook pour les interactions.

## ✅ Fonctionnalités

- Chargement dynamique du modèle `.glb`
- Chargement à la volée des animations (lazy-load)
- Interface UI avec animations, icônes, et transitions
- Support du mode `loop` et `once`
- Design responsive & moderne (mobile et desktop)
- Gestion d’événements personnalisés `animation-start` / `animation-end`

## 💡 Astuces

- Les fichiers d'animations sont stockés dans `/public/animations/`.
- Les icônes sont mappés via la fonction `getIconForAnimation()`.
- Le style est directement injecté dans le Web Component avec `css`.

---

Développé dans le cadre d’un test technique. Code optimisé pour la lisibilité, modularité, et performance.