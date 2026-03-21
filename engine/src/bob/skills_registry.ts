import fs from 'fs-extra';
import path from 'path';
import type { FrameworkStatus, Step } from './types';

interface SkillMeta {
  id: string;
  category: string;
  type: string;
  scope: string;
  stacks: string[];
  tags: string[];
}

interface SkillIndex {
  skills: Record<string, SkillMeta>;
  categories: Record<string, string[]>;
}

let cachedIndex: SkillIndex | null = null;

async function loadSkillIndex(): Promise<SkillIndex | null> {
  if (cachedIndex) {
    return cachedIndex;
  }

  try {
    const rootDir = path.resolve(__dirname, '../../../..');
    const indexPath = path.join(rootDir, 'skills-library', 'index.json');
    const data = await fs.readFile(indexPath, 'utf8');
    const parsed = JSON.parse(data) as SkillIndex;
    cachedIndex = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export interface SelectedSkills {
  skills: string[];
  patterns: string[];
}

export async function selectSkillsForContext(
  layer: FrameworkStatus['current_layer'],
  step: Step
): Promise<SelectedSkills> {
  const index = await loadSkillIndex();
  if (!index) {
    return { skills: [], patterns: [] };
  }

  const skills: Set<string> = new Set();
  const patterns: Set<string> = new Set();

  const addCategory = (category: string, target: Set<string>) => {
    const ids = index.categories[category] || [];
    ids.forEach((id) => target.add(id));
  };

  // Base agent skills for most contexts
  addCategory('agents', skills);

  // Methodology skills are generally useful
  addCategory('methodology', skills);

  if (layer === 'ticket') {
    addCategory('architecture', patterns);
    addCategory('backend', patterns);
    addCategory('database', patterns);
    addCategory('forms', patterns);
    addCategory('api', patterns);
    addCategory('authentication', patterns);
  } else if (layer === 'epic') {
    addCategory('architecture', patterns);
    addCategory('backend', patterns);
  } else if (layer === 'pi') {
    addCategory('architecture', patterns);
  }

  return {
    skills: Array.from(skills),
    patterns: Array.from(patterns)
  };
}

