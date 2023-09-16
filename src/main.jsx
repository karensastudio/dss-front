import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./assets/css/index.css";

import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from "react-auth-kit";
import { router } from "./routes";
import { RecoilRoot } from "recoil";

const noInternetNotifCustomButton = function () {
  function onClick() {
    window.location.href = "/"
  }

  return (
    <span onClick={onClick} className='text-blue-300 text-[14px] leading-[24px] font-medium cursor-pointer'>
      تلاش دوباره
    </span>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <AuthProvider
      authType={'localstorage'}
      authName={'_auth'}>
      <RouterProvider router={router} />
    </AuthProvider>
  </RecoilRoot>
);