/**
 * OpenSpec v1.0 Specification Standard for Educational Modules
 * Standardized metadata, curriculum alignment (NCERT / FLN),
 * state machines, and level configurations.
 */

export const OPEN_SPEC_VERSION = "1.0.0";

/**
 * Validates whether a module specification conforms to OpenSpec v1.0
 */
export function validateOpenSpec(spec) {
  const requiredFields = [
    'id',
    'name',
    'version',
    'domain',
    'competency',
    'targetAge',
    'learningOutcomes',
    'levels',
    'stateMachine'
  ];

  const missing = requiredFields.filter(f => !spec[f]);
  if (missing.length > 0) {
    console.warn(`[OpenSpec Validation] Module ${spec.id || 'unknown'} is missing fields:`, missing);
    return false;
  }
  return true;
}
