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
            const target =
                originPath ??
                overrideOptions.fallbackPath ??
                options.fallbackPath ??
                "/dashboard";

            const destinationState =
                originState.tab !== undefined ? { tab: originState.tab } : undefined;

            navigate(target, {
                replace: overrideOptions.replace ?? options.replace ?? false,
                state: destinationState,
            });
        },
        [originPath, originState.tab, navigate, options.fallbackPath, options.replace]
    );

    return {
        originPath,
        originState,
        goBack,
    };
};


