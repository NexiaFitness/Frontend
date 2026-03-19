/**
 * useMilestones.ts — Hook para gestión de Milestones
 * 
 * Encapsula toda la lógica CRUD de milestones:
 * - Fetch milestones por training plan
 * - Crear nuevo milestone
 * - Actualizar milestone existente
 * - Eliminar milestone
 * - Toggle milestone completion
 * 
 * Arquitectura: Lógica de negocio en shared, UI en web
 * 
 * @author Nelson Valero
 * @since v4.7.0 - Training Planning FASE 3A
 */

import { useCallback } from 'react';
import {
  useGetMilestonesQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
} from '../../api/trainingPlansApi';
import type { Milestone, MilestoneCreate, MilestoneUpdate } from '../../types/training';

interface UseMilestonesParams {
  planId: number;
}

interface UseMilestonesReturn {
  // Data
  milestones: Milestone[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;

  // Actions
  createMilestone: (data: Omit<MilestoneCreate, 'training_plan_id'>) => Promise<Milestone>;
  updateMilestone: (id: number, data: MilestoneUpdate) => Promise<Milestone>;
  deleteMilestone: (id: number) => Promise<void>;
  toggleComplete: (milestone: Milestone) => Promise<Milestone>;

  // State
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Hook para gestionar milestones de un training plan
 * 
 * IMPORTANTE: No hace refetch manual. RTK Query invalida automáticamente
 * los tags "Milestone" y "PLAN-{planId}", lo que causa que todas las queries
 * activas que usan esos tags se re-ejecuten automáticamente.
 * 
 * @example
 * ```tsx
 * const { milestones, createMilestone, toggleComplete } = useMilestones({ planId: 123 });
 * 
 * // Crear milestone
 * await createMilestone({
 *   title: 'Competition Day',
 *   milestone_date: '2025-12-01',
 *   type: 'competition',
 *   importance: 'high'
 * });
 * 
 * // Toggle completado
 * await toggleComplete(milestone);
 * ```
 */
export const useMilestones = ({ planId }: UseMilestonesParams): UseMilestonesReturn => {
  // Queries
  const {
    data: milestones = [],
    isLoading,
    isError,
    error,
  } = useGetMilestonesQuery(planId);

  // Mutations
  const [createMilestoneMutation, { isLoading: isCreating }] = useCreateMilestoneMutation();
  const [updateMilestoneMutation, { isLoading: isUpdating }] = useUpdateMilestoneMutation();
  const [deleteMilestoneMutation, { isLoading: isDeleting }] = useDeleteMilestoneMutation();

  // Actions
  const createMilestone = useCallback(
    async (data: Omit<MilestoneCreate, 'training_plan_id'>) => {
      try {
        const result = await createMilestoneMutation({
          planId,
          data,
        }).unwrap();
        return result;
      } catch (err) {
        // El error se maneja en el estado del hook
        throw err;
      }
    },
    [createMilestoneMutation, planId]
  );

  const updateMilestone = useCallback(
    async (id: number, data: MilestoneUpdate) => {
      try {
        const result = await updateMilestoneMutation({ id, data }).unwrap();
        return result;
      } catch (err) {
        // El error se maneja en el estado del hook
        throw err;
      }
    },
    [updateMilestoneMutation]
  );

  const deleteMilestone = useCallback(
    async (id: number) => {
      try {
        await deleteMilestoneMutation(id).unwrap();
        // NO hacer refetch manual - RTK Query invalida automáticamente los tags
      } catch (err) {
        // El error se maneja en el estado del hook
        throw err;
      }
    },
    [deleteMilestoneMutation]
  );

  const toggleComplete = useCallback(
    async (milestone: Milestone) => {
      try {
        const result = await updateMilestoneMutation({
          id: milestone.id,
          data: { done: !milestone.done },
        }).unwrap();
        return result;
      } catch (err) {
        // El error se maneja en el estado del hook
        throw err;
      }
    },
    [updateMilestoneMutation]
  );

  return {
    // Data
    milestones,
    isLoading,
    isError,
    error,

    // Actions
    createMilestone,
    updateMilestone,
    deleteMilestone,
    toggleComplete,

    // State
    isCreating,
    isUpdating,
    isDeleting,
  };
};

