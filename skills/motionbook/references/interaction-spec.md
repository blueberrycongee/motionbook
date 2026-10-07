# Interaction specification

Read when explaining or integrating a selected effect. Write only the details that determine the interaction; omit irrelevant fields. This is a small implementation and verification reference, not a mandatory document or an approval checkpoint.

## Describe the behavior

- **Purpose and scope:** the user action this serves, the smallest part borrowed, and the target component/runtime.
- **State flow:** starting state, trigger, transition and resulting state. Include cancellation or reversal when users can perform it.
- **Motion and geometry:** the anchor, moving parts, layout relationship, layering and meaningful timing/easing/spring parameters. Link to the source that supports each consequential value; label estimates as estimates.
- **Input and accessibility:** pointer, keyboard or touch behavior relevant to the target; focus destination and reduced-motion alternative.
- **Evidence and decisions:** separate source facts (with file/symbol or evidence links), target adaptations (with rationale), and unresolved questions. A preview alone does not establish input handling or an underlying algorithm.

## Turn the specification into observable checks

Choose scenarios from the actual state flow, including its plausible failure paths. Each check states the starting condition, action and expected visible or behavioral result. For example:

| Interaction | Scenario to consider |
| --- | --- |
| Expand/collapse | Reverse direction while the transition runs; check the final state and whether focus remains usable. |
| Drag/drop | Cancel an active drag; check placement and that no unintended action commits. |
| Async action | Repeat activation while pending, then complete or fail; check the number of actions and the resulting feedback. |
| Hover disclosure | Reach the same action with keyboard or touch when the target supports those inputs. |
| Responsive motion | Exercise relevant narrow/long-content layouts and reduced motion; check readability, clipping and stable click targets. |

These are examples, not a checklist for every effect. Determine expected outcomes from the target contract, not from the fact that an animation looks smooth. For a read-only explanation, identify checks that would verify the behavior and clearly state which have not been run. For integration, run the applicable checks and attach repeatable runtime evidence; report blocked checks separately.
