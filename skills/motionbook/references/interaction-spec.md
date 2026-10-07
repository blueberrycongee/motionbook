# Interaction specification

Use inline for a small explanation or adaptation. Include only what determines the behavior:

- **Purpose:** the problem, smallest borrowed part and target component/runtime
- **State flow:** start, trigger, transition, result, cancellation and reversal
- **Motion:** anchors, layout relationships and consequential timing/easing values, linked to source; mark estimates
- **Input:** pointer, keyboard, touch, focus and reduced-motion behavior relevant to the target
- **Checks:** starting condition, action and expected visible or behavioral result

Choose failure paths that matter: interrupted expansion, cancelled dragging, repeated pending submission, errors/retry, keyboard equivalents, long content and narrow layouts. Separate source facts from target adaptations. For explanations, state which checks remain unrun; for integrations, execute them and report observed results or blockers.
