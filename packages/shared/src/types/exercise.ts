/**
 * exercise.ts — Tipos TypeScript para Exercise Catalog
 *
 * PROPÓSITO:
 * - Tipos completos para el módulo Exercise Catalog del backend
 * - Reference Tables: MovementPattern, MuscleGroup, Equipment, Tag, Action, Variant
 * - Mapping Tables: ExerciseMovementPattern, ExerciseMuscle, ExerciseEquipment, ExerciseTag
 * - Variant Mappings: VariantMovementPattern, VariantMuscle, VariantEquipment, VariantTag, VariantJointAction
 * - Create/Update types para cada entidad
 * - Query params types y enums de roles
 *
 * CONTEXTO:
 * - Backend: ~90 endpoints implementados en /api/v1/exercise-catalog
 * - Alineado 100% con schemas de backend (backend/app/schemas.py)
 * - Basado en estructura Excel para gestión de ejercicios
 *
 * NOTAS:
 * - Todos los campos nullable están marcados como `string | null` o `number | null`
 * - Enums de roles: 'primary' | 'secondary', 'prime_mover' | 'synergist' | 'stabilizer'
 * - Sin usar `any`, strict TypeScript
 * - Timestamps en formato ISO string
 *
 * @author Frontend Team
 * @since v5.0.0
 */

// ========================================
// ENUMS DE ROLES
// ========================================

/**
 * MovementPatternRole - Rol de patrón de movimiento
 * Usado en: ExerciseMovementPattern, VariantMovementPattern
 */
export type MovementPatternRole = 'primary' | 'secondary';

/**
 * MuscleRole - Rol de músculo en ejercicio/variante
 * Usado en: ExerciseMuscle, VariantMuscle
 */
export type MuscleRole = 'prime_mover' | 'synergist' | 'stabilizer';

/**
 * EquipmentRole - Rol de equipamiento
 * Usado en: VariantEquipment
 */
export type EquipmentRole = 'primary' | 'secondary';

// ========================================
// REFERENCE TABLES
// ========================================

/**
 * MovementPattern - Patrón de movimiento del Exercise Catalog
 * Backend schema: MovementPatternOut
 * Endpoint: /exercise-catalog/movement-patterns/
 */
export interface MovementPattern {
    id: number;
    name_en: string;
    name_es: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * MuscleGroup - Grupo muscular del Exercise Catalog
 * Backend schema: MuscleGroupOut
 * Endpoint: /exercise-catalog/muscle-groups/
 */
export interface MuscleGroup {
    id: number;
    name_en: string;
    name_es: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Equipment - Equipamiento del Exercise Catalog
 * Backend schema: EquipmentOut
 * Endpoint: /exercise-catalog/equipment/
 */
export interface Equipment {
    id: number;
    name_en: string;
    name_es: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Tag - Etiqueta del Exercise Catalog
 * Backend schema: TagOut
 * Endpoint: /exercise-catalog/tags/
 */
export interface Tag {
    id: number;
    name_en: string;
    name_es: string | null;
    category: string | null; // e.g., "difficulty", "goal"
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Action - Acción articular (Joint Movement) del Exercise Catalog
 * Backend schema: JointMovementOut
 * Endpoint: /exercise-catalog/actions/
 * Nota: En backend se llama JointMovement, pero en API se expone como "actions"
 */
export interface Action {
    id: number;
    name: string; // Backward compatibility
    name_en: string;
    name_es: string | null;
    is_active: boolean;
    created_at: string;
}

/**
 * Variant - Variante de ejercicio del Exercise Catalog
 * Backend schema: ExerciseVariantOut
 * Endpoint: /exercise-catalog/variants/
 */
export interface Variant {
    id: number;
    base_exercise_id: number;
    variant_type: string; // "equipment", "grip", "stance", "position", "tempo", "range_of_motion", "load_type", "assistance", "execution_style", "pause"
    name_en: string;
    name_es: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ========================================
// MAPPING TABLES - EXERCISE
// ========================================

/**
 * ExerciseMovementPattern - Relación ejercicio-patrón de movimiento
 * Backend schema: ExerciseMovementPatternOut
 * Endpoint: /exercise-catalog/exercises/{exercise_id}/movement-patterns/
 */
export interface ExerciseMovementPattern {
    id: number;
    exercise_id: number;
    movement_pattern_id: number;
    role: MovementPatternRole | null;
    movement_pattern?: MovementPattern; // Opcional: relación expandida
}

/**
 * ExerciseMuscle - Relación ejercicio-músculo
 * Backend schema: ExerciseMuscleOut
 * Endpoint: /exercise-catalog/exercises/{exercise_id}/muscles/
 */
export interface ExerciseMuscle {
    id: number;
    exercise_id: number;
    muscle_id: number;
    role: MuscleRole;
    muscle_group?: MuscleGroup; // Opcional: relación expandida
}

/**
 * ExerciseEquipment - Relación ejercicio-equipamiento
 * Backend schema: ExerciseEquipmentOut
 * Endpoint: /exercise-catalog/exercises/{exercise_id}/equipment/
 */
export interface ExerciseEquipment {
    id: number;
    exercise_id: number;
    equipment_id: number;
    equipment?: Equipment; // Opcional: relación expandida
}

/**
 * ExerciseTag - Relación ejercicio-etiqueta
 * Backend schema: ExerciseTagOut
 * Endpoint: /exercise-catalog/exercises/{exercise_id}/tags/
 */
export interface ExerciseTag {
    id: number;
    exercise_id: number;
    tag_id: number;
    tag?: Tag; // Opcional: relación expandida
}

// ========================================
// MAPPING TABLES - VARIANT
// ========================================

/**
 * VariantMovementPattern - Relación variante-patrón de movimiento
 * Backend schema: VariantMovementPatternOut
 * Endpoint: /exercise-catalog/variant-movement-patterns/
 */
export interface VariantMovementPattern {
    id: number;
    variant_id: number;
    movement_pattern_id: number;
    role: MovementPatternRole | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    movement_pattern?: MovementPattern; // Opcional: relación expandida
}

/**
 * VariantMuscle - Relación variante-músculo
 * Backend schema: VariantMuscleOut
 * Endpoint: /exercise-catalog/variant-muscles/
 */
export interface VariantMuscle {
    id: number;
    variant_id: number;
    muscle_id: number;
    role: MuscleRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    muscle_group?: MuscleGroup; // Opcional: relación expandida
}

/**
 * VariantEquipment - Relación variante-equipamiento
 * Backend schema: VariantEquipmentOut
 * Endpoint: /exercise-catalog/variant-equipment/
 */
export interface VariantEquipment {
    id: number;
    variant_id: number;
    equipment_id: number;
    role: EquipmentRole | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    equipment?: Equipment; // Opcional: relación expandida
}

/**
 * VariantTag - Relación variante-etiqueta
 * Backend schema: VariantTagOut
 * Endpoint: /exercise-catalog/variant-tags/
 */
export interface VariantTag {
    id: number;
    variant_id: number;
    tag_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    tag?: Tag; // Opcional: relación expandida
}

/**
 * VariantJointAction - Relación variante-acción articular
 * Backend schema: VariantJointActionOut
 * Endpoint: /exercise-catalog/variant-joint-actions/
 */
export interface VariantJointAction {
    id: number;
    variant_id: number;
    joint_id: number;
    action_id: number | null;
    role: MovementPatternRole | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    action?: Action; // Opcional: relación expandida
}

// ========================================
// CREATE TYPES
// ========================================

/**
 * MovementPatternCreate - Payload para crear patrón de movimiento
 * Backend schema: MovementPatternCreate
 */
export interface MovementPatternCreate {
    name_en: string;
    name_es?: string | null;
    description?: string | null;
}

/**
 * MuscleGroupCreate - Payload para crear grupo muscular
 * Backend schema: MuscleGroupCreate
 */
export interface MuscleGroupCreate {
    name_en: string;
    name_es?: string | null;
    description?: string | null;
}

/**
 * EquipmentCreate - Payload para crear equipamiento
 * Backend schema: EquipmentCreate
 */
export interface EquipmentCreate {
    name_en: string;
    name_es?: string | null;
    description?: string | null;
}

/**
 * TagCreate - Payload para crear etiqueta
 * Backend schema: TagCreate
 */
export interface TagCreate {
    name_en: string;
    name_es?: string | null;
    category?: string | null;
}

/**
 * ActionCreate - Payload para crear acción articular
 * Backend schema: JointMovementCreate
 */
export interface ActionCreate {
    name: string; // Backward compatibility
    name_en: string;
    name_es?: string | null;
}

/**
 * VariantCreate - Payload para crear variante
 * Backend schema: ExerciseVariantCreate
 */
export interface VariantCreate {
    base_exercise_id: number;
    variant_type: string;
    name_en: string;
    name_es?: string | null;
    description?: string | null;
}

/**
 * ExerciseMovementPatternCreate - Payload para crear relación ejercicio-patrón
 * Backend schema: ExerciseMovementPatternCreate
 */
export interface ExerciseMovementPatternCreate {
    exercise_id: number;
    movement_pattern_id: number;
    role?: MovementPatternRole | null;
}

/**
 * ExerciseMuscleCreate - Payload para crear relación ejercicio-músculo
 * Backend schema: ExerciseMuscleCreate
 */
export interface ExerciseMuscleCreate {
    exercise_id: number;
    muscle_id: number;
    role: MuscleRole;
}

/**
 * ExerciseEquipmentCreate - Payload para crear relación ejercicio-equipamiento
 * Backend schema: ExerciseEquipmentCreate
 */
export interface ExerciseEquipmentCreate {
    exercise_id: number;
    equipment_id: number;
}

/**
 * ExerciseTagCreate - Payload para crear relación ejercicio-etiqueta
 * Backend schema: ExerciseTagCreate
 */
export interface ExerciseTagCreate {
    exercise_id: number;
    tag_id: number;
}

/**
 * VariantMovementPatternCreate - Payload para crear relación variante-patrón
 * Backend schema: VariantMovementPatternCreate
 */
export interface VariantMovementPatternCreate {
    variant_id: number;
    movement_pattern_id: number;
    role?: MovementPatternRole | null;
}

/**
 * VariantMuscleCreate - Payload para crear relación variante-músculo
 * Backend schema: VariantMuscleCreate
 */
export interface VariantMuscleCreate {
    variant_id: number;
    muscle_id: number;
    role: MuscleRole;
}

/**
 * VariantEquipmentCreate - Payload para crear relación variante-equipamiento
 * Backend schema: VariantEquipmentCreate
 */
export interface VariantEquipmentCreate {
    variant_id: number;
    equipment_id: number;
    role?: EquipmentRole | null;
}

/**
 * VariantTagCreate - Payload para crear relación variante-etiqueta
 * Backend schema: VariantTagCreate
 */
export interface VariantTagCreate {
    variant_id: number;
    tag_id: number;
}

/**
 * VariantJointActionCreate - Payload para crear relación variante-acción articular
 * Backend schema: VariantJointActionCreate
 */
export interface VariantJointActionCreate {
    variant_id: number;
    joint_id: number;
    action_id?: number | null;
    role?: MovementPatternRole | null;
}

// ========================================
// UPDATE TYPES
// ========================================

/**
 * MovementPatternUpdate - Payload para actualizar patrón de movimiento
 * Backend schema: MovementPatternUpdate
 */
export interface MovementPatternUpdate {
    name_en?: string | null;
    name_es?: string | null;
    description?: string | null;
    is_active?: boolean | null;
}

/**
 * MuscleGroupUpdate - Payload para actualizar grupo muscular
 * Backend schema: MuscleGroupUpdate
 */
export interface MuscleGroupUpdate {
    name_en?: string | null;
    name_es?: string | null;
    description?: string | null;
    is_active?: boolean | null;
}

/**
 * EquipmentUpdate - Payload para actualizar equipamiento
 * Backend schema: EquipmentUpdate
 */
export interface EquipmentUpdate {
    name_en?: string | null;
    name_es?: string | null;
    description?: string | null;
    is_active?: boolean | null;
}

/**
 * TagUpdate - Payload para actualizar etiqueta
 * Backend schema: TagUpdate
 */
export interface TagUpdate {
    name_en?: string | null;
    name_es?: string | null;
    category?: string | null;
    is_active?: boolean | null;
}

/**
 * ActionUpdate - Payload para actualizar acción articular
 * Backend schema: JointMovementCreate (usado en PUT)
 */
export interface ActionUpdate {
    name?: string | null;
    name_en?: string | null;
    name_es?: string | null;
}

/**
 * VariantUpdate - Payload para actualizar variante
 * Backend schema: ExerciseVariantUpdate
 */
export interface VariantUpdate {
    variant_type?: string | null;
    name_en?: string | null;
    name_es?: string | null;
    description?: string | null;
    is_active?: boolean | null;
}

/**
 * VariantMovementPatternUpdate - Payload para actualizar relación variante-patrón
 * Backend schema: VariantMovementPatternUpdate
 */
export interface VariantMovementPatternUpdate {
    variant_id?: number | null;
    movement_pattern_id?: number | null;
    role?: MovementPatternRole | null;
}

/**
 * VariantMuscleUpdate - Payload para actualizar relación variante-músculo
 * Backend schema: VariantMuscleUpdate
 */
export interface VariantMuscleUpdate {
    variant_id?: number | null;
    muscle_id?: number | null;
    role?: MuscleRole | null;
}

/**
 * VariantEquipmentUpdate - Payload para actualizar relación variante-equipamiento
 * Backend schema: VariantEquipmentUpdate
 */
export interface VariantEquipmentUpdate {
    variant_id?: number | null;
    equipment_id?: number | null;
    role?: EquipmentRole | null;
}

/**
 * VariantTagUpdate - Payload para actualizar relación variante-etiqueta
 * Backend schema: VariantTagUpdate
 */
export interface VariantTagUpdate {
    variant_id?: number | null;
    tag_id?: number | null;
}

/**
 * VariantJointActionUpdate - Payload para actualizar relación variante-acción articular
 * Backend schema: VariantJointActionUpdate
 */
export interface VariantJointActionUpdate {
    variant_id?: number | null;
    joint_id?: number | null;
    action_id?: number | null;
    role?: MovementPatternRole | null;
}

// ========================================
// QUERY PARAMS TYPES
// ========================================

/**
 * CatalogQueryParams - Parámetros de consulta para Reference Tables
 * Usado en: GET /movement-patterns/, GET /muscle-groups/, GET /equipment/, etc.
 */
export interface CatalogQueryParams {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    /** Para muscle-groups: 1=body region, 2=muscle group */
    level?: number;
}

/**
 * MappingQueryParams - Parámetros de consulta para Mapping Tables
 * Usado en: GET /exercise-movement-patterns/, GET /variant-muscles/, etc.
 */
export interface MappingQueryParams {
    skip?: number;
    limit?: number;
    exercise_id?: number;
    variant_id?: number;
}

