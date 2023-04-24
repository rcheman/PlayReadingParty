import React from 'react';
import ReactDom from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home, { loader as homeLoader } from './Home';
import Script, {loader as scriptLoader} from './components/Script';
import ErrorPage from './components/ErrorPage';

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
    loader: scriptLoader,
    errorElement: <ErrorPage />
  }
]);



ReactDom.createRoot(document.getElementById("app")).render(
    <RouterProvider router={router} />
);
