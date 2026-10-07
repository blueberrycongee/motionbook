const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
export function toRRule(s) {
  const [h, m] = s.time.split(":").map(Number);
  let freq =
    { once: "DAILY", weekdays: "WEEKLY", custom: "WEEKLY" }[s.frequency] ||
    s.frequency.toUpperCase();
  const parts = [`FREQ=${freq}`];
  if (s.frequency === "once") parts.push("COUNT=1");
  if (s.frequency === "hourly" && s.interval > 1)
    parts.push(`INTERVAL=${s.interval}`);
  if (s.frequency === "weekdays") parts.push("BYDAY=MO,TU,WE,TH,FR");
  if (["weekly", "custom"].includes(s.frequency))
    parts.push("BYDAY=" + s.days.map((d) => DAYS[d]).join(","));
  if (["monthly", "yearly"].includes(s.frequency))
    parts.push(`BYMONTHDAY=${s.dayOfMonth}`);
  if (s.frequency === "yearly") parts.push(`BYMONTH=${s.month}`);
  parts.push(`BYHOUR=${h}`, `BYMINUTE=${m}`);
  if (s.endDate) parts.push(`UNTIL=${s.endDate.replaceAll("-", "")}T235959`);
  return "RRULE:" + parts.join(";");
}
export function fromRRule(text, previous) {
  const raw = text.trim().replace(/^RRULE:/i, "");
  const data = {};
  for (const piece of raw.split(";")) {
    const pair = piece.split("=");
    if (
      pair.length !== 2 ||
      !pair[0] ||
      !pair[1] ||
      Object.hasOwn(data, pair[0].toUpperCase())
    )
      throw Error("Enter a valid RRULE");
    data[pair[0].toUpperCase()] = pair[1].toUpperCase();
  }
  const allowed = new Set([
    "FREQ",
    "COUNT",
    "INTERVAL",
    "BYDAY",
    "BYMONTHDAY",
    "BYMONTH",
    "BYHOUR",
    "BYMINUTE",
    "UNTIL",
  ]);
  for (const key of Object.keys(data))
    if (!allowed.has(key))
      throw Error(`This local preview does not support ${key}`);
  const frequency = data.FREQ?.toLowerCase();
  if (!["hourly", "daily", "weekly", "monthly", "yearly"].includes(frequency))
    throw Error("Choose HOURLY, DAILY, WEEKLY, MONTHLY, or YEARLY");
  const integer = (v, min, max) => /^\d+$/.test(v) && +v >= min && +v <= max;
  const s = structuredClone(previous);
  s.frequency = frequency;
  s.interval = Number(data.INTERVAL || 1);
  if (!integer(String(s.interval), 1, 24))
    throw Error("Enter a repeat interval from 1 to 24");
  if (s.interval !== 1 && frequency !== "hourly")
    throw Error("This local preview supports intervals only for hourly rules");
  const h = data.BYHOUR ?? s.time.slice(0, 2),
    m = data.BYMINUTE ?? s.time.slice(3);
  if (!integer(h, 0, 23) || !integer(m, 0, 59))
    throw Error("Enter one valid hour and minute");
  s.time = `${String(+h).padStart(2, "0")}:${String(+m).padStart(2, "0")}`;
  if (data.COUNT) {
    if (data.COUNT !== "1")
      throw Error("This local preview supports COUNT=1 only");
    s.frequency = "once";
  }
  if (data.BYDAY) {
    const days = data.BYDAY.split(",").map((d) => DAYS.indexOf(d));
    if (days.some((d) => d < 0) || !days.length)
      throw Error("Use weekday codes such as MO,TU,WE");
    if (!["weekly", "daily"].includes(frequency))
      throw Error("Weekday rules are supported for weekly and daily schedules");
    s.frequency = "custom";
    s.days = [...new Set(days)];
  }
  if (data.BYMONTHDAY) {
    if (!integer(data.BYMONTHDAY, 1, 31))
      throw Error("Choose one day of the month");
    s.dayOfMonth = +data.BYMONTHDAY;
  }
  if (data.BYMONTH) {
    if (!integer(data.BYMONTH, 1, 12)) throw Error("Choose one month");
    s.month = +data.BYMONTH;
  }
  if (data.UNTIL) {
    const x = data.UNTIL.match(/^(\d{4})(\d{2})(\d{2})(?:T\d{6}Z?)?$/);
    if (!x) throw Error("Enter a valid end date");
    s.endDate = `${x[1]}-${x[2]}-${x[3]}`;
  } else s.endDate = null;
  return s;
}
