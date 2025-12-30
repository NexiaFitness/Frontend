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

// Legacy exercises module hooks (GET /exercises/)
export {
    useGetExercisesQuery,
    useGetExerciseByIdQuery,
    useExercises,
    // Types
    type Exercise,
    type ExerciseFilters,
    type ExerciseListResponse,
    type UseExercisesResult,
} from './useExercises';
