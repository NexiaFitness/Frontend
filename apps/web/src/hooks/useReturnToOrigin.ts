import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type OriginLocationState = {
    from?: string;
    tab?: string;
};

interface UseReturnToOriginOptions {
    fallbackPath?: string;
    replace?: boolean;
}

export const useReturnToOrigin = (options: UseReturnToOriginOptions = {}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const originState = (location.state as OriginLocationState | undefined) ?? {};
    const originPath = originState.from;

    const goBack = useCallback(
        (overrideOptions: UseReturnToOriginOptions = {}) => {
            const fallback =
                overrideOptions.fallbackPath ??
                options.fallbackPath ??
                "/dashboard";

            const replace = overrideOptions.replace ?? options.replace ?? false;

            if (originPath) {
                const destinationState =
                    originState.tab !== undefined ? { tab: originState.tab } : undefined;

                navigate(originPath, {
                    replace,
                    state: destinationState,
                });
                return;
            }

            if (location.key !== "default") {
                navigate(-1);
                return;
            }

            navigate(fallback, { replace });
        },
        [originPath, originState.tab, location.key, navigate, options.fallbackPath, options.replace]
    );

    return {
        originPath,
        originState,
        goBack,
    };
};
