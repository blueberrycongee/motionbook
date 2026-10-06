export const paths = {
  plus: "M12 5v14M5 12h14",
  search: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.5-2 5 5",
  chevron: "m8 10 4 4 4-4",
  close: "m6 6 12 12M6 18 18 6",
  pause: "M9 6v12M15 6v12",
  play: "m8 5 11 7-11 7V5Z",
  clock: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  review: "M6 3h12v18H6V3Zm3 5h6m-6 4h6m-6 4h4",
  monitor: "M3 5h18v13H3V5Zm5 16h8m-4-3v3",
  trash: "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7",
  check: "m5 12 4 4L19 6",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  filter: "M3 4h18l-7 8v7l-4 2V12L3 4Z",
  edit: "m4 16 12-12 4 4L8 20H4v-4Zm10-10 4 4",
  cloud: "M7 18a5 5 0 1 1 1-9 6 6 0 0 1 11-1 5 5 0 0 1-1 10H7Z",
  bell: "M6 10a6 6 0 1 1 12 0c0 6 2 6 2 7H4c0-1 2-1 2-7Zm4 10h4",
  link: "m10 13 4-4m-7 2-2 2a4 4 0 0 0 6 6l3-3m-4-8 3-3a4 4 0 0 1 6 6l-2 2",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};
export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${name === "more" ? 3.5 : 1.65}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.clock}"/></svg>`;
}
