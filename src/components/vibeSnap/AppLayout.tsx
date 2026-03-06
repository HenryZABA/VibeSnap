import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ExtractorPage from "@/pages/extractor";
import ModifierPage from "@/pages/modifier";
import InspirationLibrary from "@/pages/library";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Redirect root to modifier
  useEffect(() => {
    if (path === "/") {
      navigate("/modifier", { replace: true });
    }
  }, [path, navigate]);

  return (
    <>
      <div style={{ display: path === "/modifier" || path === "/" ? "block" : "none" }}>
        <ModifierPage />
      </div>
      <div style={{ display: path === "/extractor" ? "block" : "none" }}>
        <ExtractorPage />
      </div>
      <div style={{ display: path === "/library" ? "block" : "none" }}>
        <InspirationLibrary />
      </div>
    </>
  );
};

export default AppLayout;
