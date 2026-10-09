const LARGE_SITE_INDEX = "/large/";
const LARGE_SITE_PAGE_COUNT = 60;
const FIRST_LINKED_PAGE = 1;
const LAST_LINKED_PAGE = LARGE_SITE_PAGE_COUNT - 1;
const LARGE_SITE_PAGE = /^\/large\/page-(\d+)\.html$/;

const renderPage = (title: string, body: string): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>${title}</title></head><body><main><h1>${title}</h1>${body}</main></body></html>`;

const pageHref = (pageNumber: number): string =>
  `/large/page-${pageNumber}.html`;

const renderIndex = (): string => {
  const items = Array.from(
    { length: LAST_LINKED_PAGE },
    (_, index) => index + FIRST_LINKED_PAGE,
  ).map(
    (pageNumber) =>
      `<li><a href="${pageHref(pageNumber)}">Page ${pageNumber}</a></li>`,
  );
  return renderPage("Large site", `<ul>${items.join("")}</ul>`);
};

const isLinkedPage = (pageNumber: number): boolean =>
  pageNumber >= FIRST_LINKED_PAGE && pageNumber <= LAST_LINKED_PAGE;

export const renderLargeSitePage = (pathname: string): string | null => {
  if (pathname === LARGE_SITE_INDEX) {
    return renderIndex();
  }
  const pageNumber = Number(LARGE_SITE_PAGE.exec(pathname)?.[1]);
  if (!isLinkedPage(pageNumber)) {
    return null;
  }
  return renderPage(
    `Large site page ${pageNumber}`,
    `<p><a href="${LARGE_SITE_INDEX}">Back to the index</a></p>`,
  );
};
