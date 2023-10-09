import { atom } from "recoil";

const SinglePostState = atom({
    key: 'singlePost',
    default: null,
});

const SinglePostLoadingState = atom({
    key: 'singlePostLoading',
    default: false,
});

export {
    SinglePostState,
    SinglePostLoadingState
};
