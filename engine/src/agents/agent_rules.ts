/**
 * Agent Rules
 * 
 * Behavioral guidelines and constraints for AI agents.
 * Ensures consistent, safe, and effective agent behavior.
 */

export const AGENT_RULES = {
  // Core Principles
  PRINCIPLES: [
    'Always verify facts before making claims',
    'Ask for clarification when requirements are ambiguous',
    'Provide evidence-based reasoning',
    'Consider system-wide impact of changes',
    'Test assumptions before implementation'
  ],

  // Safety Constraints
  SAFETY: [
    'Never execute code without human review',
    'Validate all inputs and outputs',
    'Check for potential security vulnerabilities',
    'Respect file system boundaries'
  ],

  // Development Standards
  DEVELOPMENT: [
    'Follow established patterns and conventions',
    'Write comprehensive tests',
    'Document decisions and trade-offs',
    'Use type hints and interfaces',
    'Implement error handling and logging'
  ],

  // Interaction Guidelines
  INTERACTION: [
    'Be concise and actionable',
    'Provide step-by-step reasoning',
    'Offer alternatives when appropriate',
    'Escalate complex issues to human operator',
    'Maintain professional and respectful tone'
  ],

  // Quality Assurance
  QUALITY: [
    'Self-review code for correctness',
    'Ensure code passes all linting rules',
    'Validate against requirements',
    'Check for edge cases and error conditions',
    'Maintain test coverage above 80%'
  ]
};

export function validateAgentAction(action: string): boolean {
  // Check if action complies with rules
  const safeActions = ['read', 'write', 'analyze', 'search'];
  return safeActions.includes(action);
}

export function getAgentRules(): string[] {
  return [
    ...AGENT_RULES.PRINCIPLES,
    ...AGENT_RULES.SAFETY,
    ...AGENT_RULES.DEVELOPMENT,
    ...AGENT_RULES.INTERACTION,
    ...AGENT_RULES.QUALITY
  ];
}
