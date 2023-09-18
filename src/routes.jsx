import { createBrowserRouter } from "react-router-dom";

import RegisterPage from "./pages/Register";
import OnboardingPage from "./pages/Onboarding";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import A1Page from "./pages/A1";
import A13Page from "./pages/A13";
import A131Page from "./pages/A131";
import A1IntroPage from "./pages/A1Intro";
import A1Case from "./pages/A1Case";
import PostManagementPage from "./pages/PostManagement";
import TagManagement from "./pages/TagManagement";
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
        path: "/A1",
        element: <A1Page />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/A13",
        element: <A13Page />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/A1intro",
        element: <A1IntroPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/A1Case",
        element: <A1Case />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/A131/:id",
        element: <A131Page />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/posts/managemnet",
        element: <PostManagementPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/tags/managemnet",
        element: <TagManagement />,
        // errorElement: <ErrorPage />
    }

]);