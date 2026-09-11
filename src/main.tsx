import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// No StrictMode: its dev-only double-invoke of effects (mount → cleanup →
// mount) doubled every data-fetch request in the browser's network tab —
// harmless (the first is aborted before completing) but confusing to see.
createRoot(document.getElementById("root")!).render(<App />);
