import { useRecoilState } from "recoil";
import { SinglePostLoadingState, SinglePostState } from "../states";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { getPostBySlugApi } from "../api/userPost";
import { useCallback, useEffect } from "react";

export default function usePostChanger(authHeader, slug) {
    const [singlePost, setSinglePost] = useRecoilState(SinglePostState);
    const [singlePostLoading, setSinglePostLoading] = useRecoilState(SinglePostLoadingState);

    const navigate = useNavigate();

    async function getPostEndpoint() {
        try {
            const response = await getPostBySlugApi(authHeader, slug);

            if (response.status === 'success') {
                setSinglePost(response.response.post);

                // change url to /posts/:slug
                navigate(`/posts/${slug}`);
            } else {
                console.error(response.message);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setSinglePostLoading(false);
        }
    }

    useEffect(() => {
        getPostEndpoint();
    }, [authHeader, slug]);
}