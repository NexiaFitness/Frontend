const RUN_SESSION_PATH = /^\/dashboard\/sessions\/[^/]+\/run\/?$/;

export function shouldShowPwaUpdateBanner(pathname: string, needRefresh: boolean): boolean {
    if (!needRefresh) {
        return false;
    }
    return !RUN_SESSION_PATH.test(pathname);
}
