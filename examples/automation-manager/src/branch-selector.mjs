/** Pure evidence fixtures. No feature/account/config access and no runtime flag guessing. */
export function platformGuardForInspectedBuild({
  browser = false,
  chromeExtension = false,
  extension = false,
  electron = false,
} = {}) {
  // The macOS bundle has compile-folded the generic platform predicate to this one term.
  return electron === true;
}
export function sourceFeatureSelector(gate, auth = { status: "allowed" }) {
  return (
    gate === true &&
    !(auth.status === "denied" && auth.reason === "unsupported-auth")
  );
}
export function nativeScheduledBranch({
  feature3085093835,
  feature4283773748 = false,
  unsupportedAuth = false,
  authState,
  path = "/scheduled",
  view = null,
  sharedTask = false,
  shareDialog = false,
  creating = false,
  templateCreate = false,
  localCapability = true,
  cloudCapability = true,
  capabilitiesLoading = false,
} = {}) {
  if (typeof feature3085093835 !== "boolean")
    return {
      view: "unresolved",
      missing: "runtime feature evaluation 3085093835",
      shippedMissingEvaluationFallback: "AutomationsLayoutPage",
    };
  const modern = sourceFeatureSelector(
    feature3085093835,
    authState ||
      (unsupportedAuth
        ? { status: "denied", reason: "unsupported-auth" }
        : { status: "allowed" }),
  );
  // Source order matters: old-path redirect happens before capability denial/loading handling.
  if (modern && path === "/automations")
    return { view: "redirect", redirect: "/scheduled" };
  if (!localCapability && !cloudCapability)
    return capabilitiesLoading
      ? { view: "loading" }
      : { view: "unavailable", redirect: "/" };
  const configuration = modern || feature4283773748;
  if (modern && view !== "manage" && !sharedTask && !shareDialog)
    return {
      view: "ScheduledLanding",
      configuration,
      createDialog: creating || templateCreate,
    };
  return {
    view: "AutomationsLayoutPage",
    configuration,
    createDialog: (creating || templateCreate) && configuration,
  };
}
/** Logic inside the shipped browser-only wrapper, separately tested but unreachable in this native build. */
export function browserOnlyWrappedSubexpression({
  mode = "codex",
  configuration = false,
  creating = false,
  templateCreate = false,
  sharedTask = false,
  shareDialog = false,
  scheduledCapability = true,
  scheduledCapabilityLoading = false,
} = {}) {
  if (
    sharedTask ||
    shareDialog ||
    (mode === "work" && (!(creating || templateCreate) || configuration))
  ) {
    if (scheduledCapabilityLoading) return { view: "loading" };
    return scheduledCapability
      ? { view: "ScheduledTasksPage" }
      : { view: "unavailable", redirect: "/" };
  }
  return { view: "AutomationsLayoutPage" };
}
