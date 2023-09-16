import { createBrowserRouter } from "react-router-dom";

import RegisterPage from "./pages/Register";
import OnboardingPage from "./pages/Onboarding";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import PostPage from "./pages/Post";
// import ErrorPage from "./error-page";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/register",
        element: <RegisterPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/onboarding",
        element: <OnboardingPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/",
        element: <HomePage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/posts",
        element: <PostPage />,
        // errorElement: <ErrorPage />
    }
]);