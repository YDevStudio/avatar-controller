// AvatarController Storybook Stories
// Permet de tester visuellement et fonctionnellement le composant <avatar-controller>
// On vérifie aussi les événements personnalisés émis par le composant.
import '../avatar-controller';
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { expect } from '@storybook/test';

// Meta configuration pour Storybook
// On documente les props disponibles et les events émis pour aider les intégrateurs.
const meta: Meta = {
    title: 'Avatar/AvatarController',
    component: 'avatar-controller',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
Le composant <avatar-controller> émet deux événements personnalisés :
          - animation-start : déclenché au démarrage d'une animation.  
            Payload : { name: string } — le nom de l'animation lancée.
    - animation-end : déclenché à la fin d'une animation non bouclée.  
            Payload : { name: string } — le nom de l'animation terminée.
    Ces événements utilisent bubbles: true et composed: true, ce qui permet de les écouter même à l'extérieur du composant Web.
              `.trim(),
            },
        },
        actions: {
            handles: ['animation-start', 'animation-end'],
        },
    },
    argTypes: {
        modelUrl: { control: 'text' },
        autoplay: { control: 'boolean' },
        width: { control: 'text' },
        height: { control: 'text' },
    },
};
export default meta;

type Story = StoryObj;

// Story "Default"
// Charge le modèle de base avec autoplay activé. Sert d'exemple minimal d'intégration.
export const Default: Story = {
    args: {
        modelUrl: '/models/model.glb',
        autoplay: false,
        width: "200px",
        height: 'auto',
    },
    render: ({ modelUrl, autoplay, width, height }) => html`
      <avatar-controller
        .modelUrl=${modelUrl}
        ?autoplay=${autoplay}
        style="width: ${width}; height: ${height};"
      ></avatar-controller>
    `,
};

Default.args = {
    modelUrl: '/models/model.glb',
    autoplay: true,
    width: '100%',
    height: 'auto',
};

// Test basique : on vérifie que les boutons sont bien rendus
// et que cliquer sur 'Dancing' déclenche bien un event 'animation-start'.
Default.play = async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('avatar-controller') as HTMLElement;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const shadow = avatar.shadowRoot!;
    const buttons = Array.from(shadow.querySelectorAll('button'));
    expect(buttons.length).toBeGreaterThanOrEqual(3);

    const danceButton = buttons.find((btn) => btn.textContent?.includes('Dancing'));
    expect(danceButton).toBeDefined();

    let eventFired = false;
    const onStart = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.name === 'Dancing') eventFired = true;
    };
    avatar.addEventListener('animation-start', onStart);

    await danceButton!.click();
    await new Promise((r) => setTimeout(r, 200));

    expect(eventFired).toBe(true);
};

// Story "Controls"
// Variante plus grande, avec un autre modèle. On peut jouer les animations depuis l’UI.
export const Controls: Story = {
    args: {
        modelUrl: '/models/avatar.glb',
        autoplay: false,
        width: '100%',
        height: '600px',
    },
    render: ({ modelUrl, autoplay, width, height }) => html`
      <avatar-controller
        .modelUrl=${modelUrl}
        ?autoplay=${autoplay}
        style="width: ${width}; height: ${height};"
      ></avatar-controller>
    `,
};
Controls.args = {
    modelUrl: '/models/avatar.glb',
    autoplay: true,
    width: '100%',
    height: '600px',
};

// Même logique de test que la story "Default"
// Ici on s’assure que le bouton d’animation 'Dancing' est bien interactif
// et que l’event est correctement propagé.
Controls.play = async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('avatar-controller') as HTMLElement;
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const shadow = avatar.shadowRoot!;
    const tiles = Array.from(shadow.querySelectorAll('.animation-tile'));

    const danceTile = tiles.find((tile) => tile.textContent?.toLowerCase().includes('dancing'));
    expect(danceTile).toBeDefined();

    let eventFired = false;
    avatar.addEventListener('animation-start', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.name?.toLowerCase().includes('dancing')) {
            eventFired = true;
        }
    });

    await danceTile!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await new Promise((r) => setTimeout(r, 300));

    expect(eventFired).toBe(true);
};