import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { ThemeProvider } from "@/src/components/theme-provider.jsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="fashion-treats-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

