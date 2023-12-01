import { createBrowserRouter } from "react-router-dom";

import RegisterPage from "./pages/Register";
import OnboardingPage from "./pages/Onboarding";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import TagCreatePage from "./pages/tags/Create";
import PostCreatePage from "./pages/posts/Create";
import TagIndexPage from "./pages/tags/Index";
import TagUpdatePage from "./pages/tags/Update";
import PostIndexPage from "./pages/posts/Index";
import PostUpdatePage from "./pages/posts/Update";
import NoteIndexPage from "./pages/notes/Index";
import NoteUpdatePage from "./pages/notes/Update";
import NoteCreatePage from "./pages/notes/Create";
import DecisionPdfPage from "./pages/DecisionPdf";
import SinglePostPage from "./pages/Single";
import GraphPage from "./pages/Graph";
import BookmarksPage from "./pages/Bookmarks";
import SearchResultPage from "./pages/SearchResult";
import DecisionsPage from "./pages/Decisions";
import TagPostsPage from "./pages/TagPosts";
import UsersIndexPage from "./pages/users/Index";

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
        element: <SinglePostPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/posts/:slug",
        element: <SinglePostPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/decision/pdf",
        element: <DecisionPdfPage />,
        // errorElement: <ErrorPage />
    },


    // Graph
    {
        path: "/graph",
        element: <GraphPage />,
        // errorElement: <ErrorPage />
    },

    // Bookmarks
    {
        path: "/bookmarks",
        element: <BookmarksPage />,
        // errorElement: <ErrorPage />
    },

    // Decisions
    {
        path: "/decisions",
        element: <DecisionsPage />,
        // errorElement: <ErrorPage />
    },

    // SearchResultPage
    {
        path: "/search",
        element: <SearchResultPage />,
        // errorElement: <ErrorPage />
    },

    // SearchResultPage
    {
        path: "/tag/:tagId",
        element: <TagPostsPage />,
        // errorElement: <ErrorPage />
    },

    // Users Admin
    {
        path: "/admin/users",
        element: <UsersIndexPage />,
        // errorElement: <ErrorPage />
    },

    // Posts Admin
    {
        path: "/admin/posts",
        element: <PostIndexPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/admin/posts/update/:postId",
        element: <PostUpdatePage />,
        // errorElement: <tErrorPage />
    },
    {
        path: "/admin/posts/create",
        element: <PostCreatePage />,
        // errorElement: <ErrorPage />
    },

    // Tags Admin
    {
        path: "/admin/tags",
        element: 
        <TagIndexPage />,
        // errorElement: <ErrorPage />
    },
    {
        path: "/admin/tags/update/:tagId",
        element: <TagUpdatePage />,
        // errorElement: <tErrorPage />
    },
    {
        path: "/admin/tags/create",
        element: <TagCreatePage />,
        // errorElement: <ErrorPage />
    },

    // Notes
    {
        path: "/admin/notes",
        element: <NoteIndexPage/>,
        // errorElement: <ErrorPage />
    },
    {
        path: "/admin/notes/:noteId",
        element: <NoteUpdatePage />,
        // errorElement: <tErrorPage />
    },
    {
        path: "/admin/notes/create",
        element: <NoteCreatePage />,
        // errorElement: <ErrorPage />
    }

]);