import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import About from './components/about/About';
import Resume from './components/resume/Resume';
import Projects from './components/projects/Projects';
import Github from './components/github/Github';
import Root from './components/Root';
import { Analytics } from "@vercel/analytics/react";
import Certifications from './components/certification/Certification';
import NotFound from './components/notfound/NotFound';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route path="" element={<About />} />
      <Route path="resume" element={<Resume />} />
      <Route path="projects" element={<Projects />} />
      <Route path="github" element={<Github />} />
      <Route path="certification" element={<Certifications />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Analytics />
  </React.StrictMode>,
);
