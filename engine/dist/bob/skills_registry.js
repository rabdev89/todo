"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectSkillsForContext = selectSkillsForContext;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
let cachedIndex = null;
async function loadSkillIndex() {
    if (cachedIndex) {
        return cachedIndex;
    }
    try {
        const rootDir = path_1.default.resolve(__dirname, '../../../..');
        const indexPath = path_1.default.join(rootDir, 'skills-library', 'index.json');
        const data = await fs_extra_1.default.readFile(indexPath, 'utf8');
        const parsed = JSON.parse(data);
        cachedIndex = parsed;
        return parsed;
    }
    catch {
        return null;
    }
}
async function selectSkillsForContext(layer, step) {
    const index = await loadSkillIndex();
    if (!index) {
        return { skills: [], patterns: [] };
    }
    const skills = new Set();
    const patterns = new Set();
    const addCategory = (category, target) => {
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
    }
    else if (layer === 'epic') {
        addCategory('architecture', patterns);
        addCategory('backend', patterns);
    }
    else if (layer === 'pi') {
        addCategory('architecture', patterns);
    }
    return {
        skills: Array.from(skills),
        patterns: Array.from(patterns)
    };
}
