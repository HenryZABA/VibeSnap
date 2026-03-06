import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExtractorPage from "./pages/extractor";
import InspirationLibrary from "./pages/library";

export const routers = [
    {
      path: "/",
      name: 'home',
      element: <Index />,
    },
    {
      path: "/extractor",
      name: 'extractor',
      element: <ExtractorPage />,
    },
    {
      path: "/library",
      name: 'library',
      element: <InspirationLibrary />,
    },
    /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
    {
      path: "*",
      name: '404',
      element: <NotFound />,
    },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;