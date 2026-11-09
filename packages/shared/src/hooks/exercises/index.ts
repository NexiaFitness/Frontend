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

// Exercises module hooks (GET and DELETE /exercises/; POST/PUT retired in H8-B)
export {
    useGetExercisesQuery,
    useGetExerciseLibraryQuery,
    useGetExerciseByIdQuery,
    useDeleteExerciseMutation,
    useCheckExerciseSafetyMutation,
    useCheckExerciseSafetyBatchMutation,
    useGetSafeAlternativesQuery,
    useExercises,
    // Types
    type Exercise,
    type ExercisePhysicalQualityRef,
    type ExerciseJointActionRef,
    type ExerciseTagRef,
    type ExerciseFilters,
    type ExerciseListResponse,
    type UseExercisesResult,
} from './useExercises';
