import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 导入 BrowserRouter
import '@ant-design/v5-patch-for-react-19';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/FashionMaker"> {/* 使用 BrowserRouter 包裹 App 并设置 basename */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);

