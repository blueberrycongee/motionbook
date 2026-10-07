/** Independent projections of the separately traced Work Scheduled page.
 * Not wired as the active UI until its route is selected from actual runtime evidence.
 */
export function workTaskStatus(task) {
  if (!task.eventTriggered && task.nextRuns.length === 0) return "completed";
  return task.enabled ? "active" : "paused";
}
export function workTaskGroups(tasks, now, localPauseTimes = {}) {
  const groups = { active: [], recent: [], paused: [], completed: [] };
  const updated = (task, overrides = {}) => {
    const value = overrides[task.id] ?? Date.parse(task.updatedAt);
    return Number.isNaN(value) ? 0 : value;
  };
  for (const task of tasks) {
    const status = workTaskStatus(task);
    groups[status].push(task);
    if (
      status !== "active" &&
      updated(task, status === "paused" ? localPauseTimes : {}) >=
        now - 86400000
    )
      groups.recent.push(task);
  }
  for (const group of [groups.paused, groups.completed])
    group.sort((a, b) => updated(b) - updated(a));
  groups.recent.sort(
    (a, b) => updated(b, localPauseTimes) - updated(a, localPauseTimes),
  );
  return groups;
}
export function workVisibleTasks(tasks, filter, now, localPauseTimes = {}) {
  const g = workTaskGroups(tasks, now, localPauseTimes);
  return filter === "active" ? [...g.active, ...g.recent] : g[filter] || [];
}
