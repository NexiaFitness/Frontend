/**
 * Exercises hooks exports
 * 
 * Exercise Catalog - Phase 1: GET Endpoints
 * Exporta los 10 hooks RTK Query para Reference Tables
 * 
 * @author Nelson / NEXIA Team
 * @since v5.0.0
 */

export {
    useGetMovementPatternsQuery,
    useGetMovementPatternQuery,
    useGetMuscleGroupsQuery,
    useGetMuscleGroupQuery,
    useGetEquipmentQuery,
    useGetEquipmentByIdQuery,
    useGetTagsQuery,
    useGetTagQuery,
    useGetActionsQuery,
    useGetActionQuery,
} from '../../api/exercisesApi';

// Legacy exercises module hooks (GET/POST/PUT/DELETE /exercises/)
export {
    useGetExercisesQuery,
    useGetExerciseLibraryQuery,
    useGetExerciseByIdQuery,
    useCreateExerciseMutation,
    useUpdateExerciseMutation,
    useDeleteExerciseMutation,
    useExercises,
    // Types
    type Exercise,
    type ExercisePhysicalQualityRef,
    type ExerciseFilters,
    type ExerciseListResponse,
    type ExerciseCreate,
    type ExerciseUpdate,
    type UseExercisesResult,
} from './useExercises';
