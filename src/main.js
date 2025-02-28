import { createRoot } from "react-dom/client";
import "./index.css";
import Popup from "./popup.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
