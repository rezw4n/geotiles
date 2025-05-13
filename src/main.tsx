
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

// Create root with React 18 
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
