import NotFound from "./pages/NotFound";
import AppLayout from "./components/vibeSnap/AppLayout";

export const routers = [
    {
      path: "/",
      name: 'root',
      element: <AppLayout />,
      children: [
        { path: "", name: 'home' },
        { path: "modifier", name: 'modifier' },
        { path: "extractor", name: 'extractor' },
        { path: "library", name: 'library' },
      ],
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