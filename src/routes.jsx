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
import TagCreatePage from "./pages/tags/Create";
import PostCreatePage from "./pages/posts/Create";
import TagIndexPage from "./pages/tags/Index";
import TagUpdatePage from "./pages/tags/Update";
import PostIndexPage from "./pages/posts/Index";
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
        path: "/posts/:slug",
        element: <A131Page />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/posts/create",
        element: <PostCreatePage />,
        // errorElement: <ErrorPage />
    },

    // Posts Admin
    {
        path: "/posts",
        element: <PostIndexPage />,
        // errorElement: <ErrorPage />
    },
    // {
    //     path: "/posts/:postId",
    //     element: <TagUpdatePage />,
    //     // errorElement: <tErrorPage />
    // },
    {
        path: "/posts/create",
        element: <PostCreatePage />,
        // errorElement: <ErrorPage />
    },

    // Tags Admin
    {
        path: "/tags",
        element: <TagIndexPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/tags/:tagId",
        element: <TagUpdatePage />,
        // errorElement: <tErrorPage />
    },
    {
        path: "/tags/create",
        element: <TagCreatePage />,
        // errorElement: <ErrorPage />
    }

]);