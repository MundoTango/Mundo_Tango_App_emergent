/**
 * UI Sub-Agents Index
 * Exports all sub-agents under Agent #11 (Aurora - UI/UX Expert)
 */

export { DarkModeFixer } from './DarkModeFixer';
export { TranslationFixer } from './TranslationFixer';
export { AccessibilityAuditor } from './AccessibilityAuditor';
export { ComponentWatcher } from './ComponentWatcher';

// Initialize all sub-agents
import { DarkModeFixer } from './DarkModeFixer';
import { TranslationFixer } from './TranslationFixer';
import { AccessibilityAuditor } from './AccessibilityAuditor';
import { ComponentWatcher } from './ComponentWatcher';

export const uiSubAgents = {
  darkModeFixer: new DarkModeFixer(),
  translationFixer: new TranslationFixer(),
  accessibilityAuditor: new AccessibilityAuditor(),
  componentWatcher: new ComponentWatcher(),
};

// Start component watcher automatically
uiSubAgents.componentWatcher.execute('start', {}).catch(console.error);

console.log('✅ UI Sub-Agents initialized (4 agents under Agent #11)');
