/**
 * Dev-only RTK endpoints for OBS QA (web app; not exported from @nexia/shared).
 */

import { baseApi } from "@nexia/shared/api/baseApi";

export const devObsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getObsIntentional500: build.query<unknown, void>({
            query: () => "/dev/obs-intentional-500",
        }),
    }),
});

export const { useLazyGetObsIntentional500Query } = devObsApi;
