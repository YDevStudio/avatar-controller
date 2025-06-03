/// <reference types="jest" />
// Tests unitaires du composant <avatar-controller>
// Ici on isole le comportement de playAnimation() avec un mock du mixer et des actions
import { jest } from '@jest/globals';
import '../avatar-controller';
import { AvatarController } from '../avatar-controller';

describe('AvatarController', () => {
    let component: AvatarController;

    // Création d'une instance du composant avant chaque test
    // + Mock des éléments internes nécessaires (mixer et action 'Standing')
    beforeEach(() => {
        component = new AvatarController();

        // Mock mixer + actions
        component['mixer'] = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        } as any;

        component['actions'] = {
            Standing: {
                reset: jest.fn().mockReturnThis(),
                fadeIn: jest.fn().mockReturnThis(),
                play: jest.fn().mockReturnThis(),
                setLoop: jest.fn().mockReturnThis(),
                getClip: () => ({ name: 'Standing' }),
                clampWhenFinished: false
            } as any,
        };
    });

    // Vérifie que le composant est bien instancié
    // Sanity check basique
    it('should be defined', () => {
        expect(component).toBeDefined();
    });

    // Vérifie que playAnimation('Standing') fonctionne correctement :
    // - Émet l'event 'animation-start'
    // - Met à jour currentAction
    // - Appelle les méthodes reset, fadeIn et play de l'action
    it('should play Standing animation and emit start event', () => {
        const dispatchSpy = jest.spyOn(component, 'dispatchEvent');

        component.playAnimation('Standing');

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'animation-start',
                detail: { name: 'Standing' },
            })
        );

        expect(component['currentAction']).toBe(component['actions']['Standing']);
        expect(component['actions']['Standing'].reset).toHaveBeenCalled();
        expect(component['actions']['Standing'].fadeIn).toHaveBeenCalledWith(0.2);
        expect(component['actions']['Standing'].play).toHaveBeenCalled();
    });
});