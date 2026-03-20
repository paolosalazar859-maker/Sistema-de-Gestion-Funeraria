import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

// DIAGNÓSTICO VISUAL PARA VERCEL: Si ves esto en rojo, el servidor funciona.
if (typeof document !== 'undefined') {
  const debugDiv = document.createElement('div');
  debugDiv.id = 'vercel-debug';
  debugDiv.innerHTML = '<h1 style="color:white; font-size:30px; text-align:center; padding-top:100px; font-family:sans-serif;">[ VERCEL DEBUG ] SISTEMA VIVO - INICIALIZANDO REACT...</h1>';
  debugDiv.style.cssText = 'position:fixed; inset:0; background:#dc2626; z-index:999999;';
  document.body.appendChild(debugDiv);
  setTimeout(() => {
    const d = document.getElementById('vercel-debug');
    if (d) d.remove();
  }, 4000);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
