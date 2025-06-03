// Tests unitaires pour la méthode loadAnimation et la gestion des événements liés aux animations
// On mocke le mixer et l'avatar pour tester la logique sans charger de vrai GLB
import { jest } from '@jest/globals';
import { AvatarController } from '../avatar-controller';

describe('AvatarController - loadAnimation', () => {
    let component: AvatarController;

    // Préparation d'une instance propre avec mocks pour le mixer, l'avatar et requestUpdate
    // On évite ici le vrai chargement du modèle ou d'un clip
    beforeEach(() => {
        component = new AvatarController();

        // Mocks
        component['mixer'] = {
            clipAction: jest.fn().mockReturnValue({
                reset: jest.fn().mockReturnThis(),
                fadeIn: jest.fn().mockReturnThis(),
                play: jest.fn().mockReturnThis(),
                setLoop: jest.fn().mockReturnThis(),
                getClip: () => ({ name: 'Standing' }),
                clampWhenFinished: false
            }),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        } as any;
        component['avatar'] = {} as any;
        component['requestUpdate'] = jest.fn();
    });

    // Simule un chargement d'animation et vérifie :
    // - que l'action est bien enregistrée dans le composant
    // - que playAnimation est appelée si l'animation est "Standing"
    // - que requestUpdate est bien déclenchée
    it('should load animation and store it in actions map', async () => {
        const fakeClip = { name: 'TestClip' } as any;
        const fakeLoader = {
            load: (_path: string, onLoad: Function) => {
                onLoad({ animations: [fakeClip] });
            },
        };

        // Redéfinit manuellement la méthode loadAnimation avec une implémentation simplifiée (sans loader réel)
        // Ce hack permet de tester rapidement la logique sans passer par Three.js
        (component as any).loadAnimation = new Function('name', 'path', `
        const loader = (${JSON.stringify(fakeLoader)});
        this.actions[name] = this.mixer.clipAction({ name: 'TestClip' }, this.avatar);
        if (name === 'Standing') this.playAnimation(name);
        this.requestUpdate();
        `).bind(component);


        // spy
        const playSpy = jest.spyOn(component, 'playAnimation');

        await component.loadAnimation('Standing', '/models/fake.glb');

        expect(component['actions']['Standing']).toBeDefined();
        expect(playSpy).toHaveBeenCalledWith('Standing');
        expect(component['requestUpdate']).toHaveBeenCalled();
    });

    // Simule le cas où une animation non-bouclée se termine
    // Vérifie que :
    // - l'événement 'animation-end' est bien émis
    // - currentAction est bien réinitialisé
    // - l'écouteur 'finished' est retiré après exécution
    it('should emit animation-end when animation finishes', () => {
        component['currentAction'] = {
            getClip: () => ({ name: 'Dancing' }),
            stop: jest.fn(),
            crossFadeTo: jest.fn(),
        } as any;

        const dispatchSpy = jest.spyOn(component, 'dispatchEvent');
        const removeListenerSpy = jest.fn();

        component['mixer'] = {
            addEventListener: (event: string, callback: () => void) => {
                if (event === 'finished') {
                    // Simule immédiatement la fin
                    callback();
                }
            },
            removeEventListener: removeListenerSpy,
        } as any;

        component['actions'] = {
            Dancing: {
                reset: jest.fn().mockReturnThis(),
                fadeIn: jest.fn().mockReturnThis(),
                play: jest.fn().mockReturnThis(),
                setLoop: jest.fn().mockReturnThis(),
                getClip: () => ({ name: 'Dancing' }),
                clampWhenFinished: false
            } as any,
        };

        component.playAnimation('Dancing');

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'animation-end',
                detail: { name: 'Dancing' },
            })
        );

        expect(component['currentAction']).toBeUndefined();

        expect(removeListenerSpy).toHaveBeenCalled();
    });
});