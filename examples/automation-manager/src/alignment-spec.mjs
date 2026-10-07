/** Shared geometric contract of the inspected native default-width profile.
 * Calculated box edges, not claims of browser-computed glyph positions. */
export const ALIGN = Object.freeze({
  pageOuterMax: 768,
  pageGutter: 20,
  pageHeadingInset: 8,
  rowPadding: 12,
  rowHeight: 64,
  rowGap: 4,
  rowLeadingButton: 20,
  rowIcon: 16,
  rowIconGap: 8,
  rowTitleLine: 24,
  rowSecondLine: 16,
  paneBorder: 1,
  paneBodyPadding: 20,
  paneToolbarPadding: 16,
  groupBorder: 1,
  fieldPadding: 16,
  fieldGap: 12,
  fieldRowMin: 40,
  footerPadding: 20,
  footerBorder: 1,
  footerButton: 28,
});
export function pageGeometry(viewport, pane = 0) {
  const main = viewport - pane,
    outerWidth = Math.min(ALIGN.pageOuterMax, main),
    outerX = (main - outerWidth) / 2,
    left = outerX + ALIGN.pageGutter,
    width = outerWidth - 2 * ALIGN.pageGutter;
  return {
    main,
    outerX,
    outerWidth,
    left,
    width,
    right: left + width,
    headingX: left + ALIGN.pageHeadingInset,
    statusCenterX: left + ALIGN.rowPadding + ALIGN.rowLeadingButton / 2,
    titleX: left + ALIGN.rowPadding + ALIGN.rowLeadingButton + ALIGN.rowIconGap,
    dividerLeft: left + ALIGN.rowPadding,
    dividerRight: left + width - ALIGN.rowPadding,
    statusCenterY: ALIGN.rowPadding + ALIGN.rowTitleLine / 2,
    actionCenterY: ALIGN.rowHeight / 2,
  };
}
export function paneGeometry(viewport, pane, height = 840) {
  const left = viewport - pane,
    bodyLeft = left + ALIGN.paneBorder + ALIGN.paneBodyPadding,
    bodyRight = viewport - ALIGN.paneBodyPadding;
  return {
    left,
    bodyLeft,
    bodyRight,
    bodyWidth: bodyRight - bodyLeft,
    labelLeft: bodyLeft + ALIGN.groupBorder + ALIGN.fieldPadding,
    valueRight: bodyRight - ALIGN.groupBorder - ALIGN.fieldPadding,
    footerTop:
      height -
      ALIGN.footerBorder -
      2 * ALIGN.footerPadding -
      ALIGN.footerButton,
    buttonTop: height - ALIGN.footerPadding - ALIGN.footerButton,
    buttonBottom: height - ALIGN.footerPadding,
    buttonRight: viewport - ALIGN.footerPadding,
  };
}
export function alignmentCss() {
  return `:root{--page-outer-max:${ALIGN.pageOuterMax}px;--page-gutter:${ALIGN.pageGutter}px;--row-leading-button:${ALIGN.rowLeadingButton}px;--row-icon-top:${ALIGN.rowPadding + (ALIGN.rowTitleLine - ALIGN.rowLeadingButton) / 2}px;--field-gap:${ALIGN.fieldGap}px;--footer-padding:${ALIGN.footerPadding}px;--footer-button:${ALIGN.footerButton}px}`;
}

/** Standalone regular/inset profile, using the documented 46px toolbar fallback.
 * This preset does not read or infer an account's selected page profile. */
export function regularGeometry(viewport=1280,pane=0,detailOpen=false){
 const page=pageGeometry(viewport,pane),toolbarHeight=46;
 const headingTop=toolbarHeight+20,headingHeight=34+8+24;
 const searchTop=detailOpen?toolbarHeight+20:headingTop+headingHeight+20;
 const navigationTop=detailOpen?9:searchTop+40+8+20;
 const listTop=detailOpen?searchTop+40+8+20:navigationTop+28+8;
 return{...page,toolbarHeight,headingTop,headingBaseline:headingTop+24,subtitleBaseline:headingTop+34+8+16,searchTop,searchHeight:40,navigationTop,listTop,filterX:detailOpen?8:page.left+12,createX:page.main-8-106,createY:9,createWidth:106,createHeight:28,detailOpen};
}
