import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GearWizard from "../장비병자_카테고리선택.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><GearWizard /></StrictMode>,
);
