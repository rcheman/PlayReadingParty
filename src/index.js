import React from 'react';
import ReactDom from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Header from '../src/components/Header';
import Home, { loader as homeLoader } from '../src/Home';
import Script, {loader as scriptLoader} from '../src/components/Script'
import ErrorPage from '../src/components/ErrorPage'

const router = createBrowserRouter([
  {
    path:'/',
    element: <Home />,
    loader: homeLoader,
    errorElement: <ErrorPage />
  },
  {
    path:'script/:scriptId',
    element: <Script />,
    loader: scriptLoader
  }
])



ReactDom.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
