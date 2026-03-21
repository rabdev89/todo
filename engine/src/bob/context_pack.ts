import type { FrameworkStatus, Phase, Step } from './types';
import { getRecommendedCommands } from '../shared/command_mapping';
import { selectSkillsForContext } from './skills_registry';

export interface BobActionContextPack {
  layer: FrameworkStatus['current_layer'];
  phaseId: string;
  stepId: string;
  requiredAction: string;
  recommendedCommands: string[];
  track: FrameworkStatus['current_track'];
  ticketId: string | null;
  epicId: string | null;
  piId: string | null;
  personaId: string | null;
  docPaths: string[];
  skills: string[];
  patterns: string[];
}

function selectPersonaId(phase: Phase, step: Step): string | null {
  const phaseId = phase.id;
  const action = step.required_action || '';

  if (phaseId === 'framework_bootstrap' || phaseId === 'framework_installation') {
    return 'orchestrator';
  }

  if (phaseId === 'project_initialization' || phaseId === 'product_definition') {
    return 'planner';
  }

  if (phaseId === 'technical_architecture') {
    return 'architecture-designer';
  }

  if (phaseId === 'project_planning') {
    return 'planner';
  }

  if (phaseId === 'development') {
    if (action === 'generate_code' || action === 'fix_bugs' || action === 'update_documentation') {
      return 'executor';
    }
    if (action === 'review_code') {
      return 'verifier';
    }
    if (action === 'generate_unit_tests' || action === 'run_tests' || action === 'run_integration_tests') {
      return 'verifier';
    }
    return 'executor';
  }

  if (phaseId === 'epic_hardening' || phaseId === 'pi_hardening' || phaseId === 'uat') {
    return 'verifier';
  }

  if (phaseId === 'release_preparation' || phaseId === 'deployment' || phaseId === 'post_launch_monitoring') {
    return 'verifier';
  }

  return null;
}

export async function buildBobActionContextPack(
  phaseId: string,
  stepId: string,
  phase: Phase,
  step: Step,
  state: FrameworkStatus
): Promise<BobActionContextPack> {
  const layer = state.current_layer ?? null;
  const selected = await selectSkillsForContext(layer, step);
  const personaId = selectPersonaId(phase, step);
  const docPaths: string[] = [];

  docPaths.push('AGENTS.md');
  docPaths.push('project-management/WORKFLOW_OVERVIEW.md');

  if (state.current_track === 'B' || state.current_track === null) {
    docPaths.push('project-management/vision.md');
    docPaths.push('project-management/PRD.md');
    docPaths.push('project-management/FRD.md');
  }

  return {
    layer,
    phaseId,
    stepId,
    requiredAction: step.required_action || '',
    recommendedCommands: getRecommendedCommands(step.required_action || ''),
    track: state.current_track ?? null,
    ticketId: state.current_ticket_id ?? null,
    epicId: state.current_epic_id ?? null,
    piId: state.current_pi_id ?? null,
    personaId,
    docPaths,
    skills: selected.skills,
    patterns: selected.patterns
  };
}
