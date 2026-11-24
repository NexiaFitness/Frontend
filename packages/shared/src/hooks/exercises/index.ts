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
// Catálogo sin tope (PERF-7): todas las páginas y nombres por ids
export {
    useGetExerciseLibraryQuery,
    useGetExercisePickerLibraryQuery,
    useGetExercisesByIdsQuery,
} from './exerciseLibraryApi';
export {
    useExerciseNamesByIds,
    type UseExerciseNamesByIdsResult,
} from './useExerciseNamesByIds';
export * from '../../types/exerciseCatalogRead';

export {
    useGetExercisesQuery,
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
