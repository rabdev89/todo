"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASE_REGISTRY = exports.PhaseType = void 0;
exports.getNextPhase = getNextPhase;
var PhaseType;
(function (PhaseType) {
    PhaseType["REQUIREMENTS"] = "requirements";
    PhaseType["DESIGN"] = "design";
    PhaseType["IMPLEMENT"] = "implement";
    PhaseType["VALIDATE"] = "validate";
    PhaseType["DONE"] = "done";
})(PhaseType || (exports.PhaseType = PhaseType = {}));
exports.PHASE_REGISTRY = {
    [PhaseType.REQUIREMENTS]: {
        id: PhaseType.REQUIREMENTS,
        description: 'Understand the problem and gather requirements.',
        nextPhase: PhaseType.DESIGN,
        requiresValidation: false
    },
    [PhaseType.DESIGN]: {
        id: PhaseType.DESIGN,
        description: 'Design the solution architecture and components.',
        nextPhase: PhaseType.IMPLEMENT,
        requiresValidation: false
    },
    [PhaseType.IMPLEMENT]: {
        id: PhaseType.IMPLEMENT,
        description: 'Write the code and implement the designated features or fixes.',
        nextPhase: PhaseType.VALIDATE,
        requiresValidation: false
    },
    [PhaseType.VALIDATE]: {
        id: PhaseType.VALIDATE,
        description: 'Run tests, linters, and validations automatically.',
        nextPhase: PhaseType.DONE,
        requiresValidation: true
    },
    [PhaseType.DONE]: {
        id: PhaseType.DONE,
        description: 'Ticket is fully implemented and validated.',
        nextPhase: null,
        requiresValidation: false
    }
};
/**
 * Returns the sequence of phases
 */
function getNextPhase(currentPhase, ticketType) {
    const phaseKey = currentPhase;
    if (exports.PHASE_REGISTRY[phaseKey]) {
        let next = exports.PHASE_REGISTRY[phaseKey].nextPhase;
        // If ticket type is lean and we just finished requirements, skip design and go straight to implement
        if (currentPhase === PhaseType.REQUIREMENTS && ticketType?.toLowerCase() === 'lean') {
            next = PhaseType.IMPLEMENT;
        }
        return next;
    }
    return null;
}
