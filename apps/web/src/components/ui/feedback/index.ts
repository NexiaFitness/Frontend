/**
 * Barrel export para componentes de feedback
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v9.2.0 — Alert unificado + contrato ARIA
 */

export { ServerErrorBanner } from './ServerErrorBanner';
export { LoadingSpinner } from './LoadingSpinner';
export { EmptyState } from './EmptyState';
export { Alert } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';
export {
    alertAriaLive,
    alertAriaRole,
    type AlertAriaLive,
    type AlertAriaRole,
} from './alertContract';
export { NexiaSemanticIcon } from './NexiaSemanticIcon';
export type { NexiaSemanticTone } from './nexiaSemanticIconPresentation';
export { Toast, type ToastVariant, type ToastProps } from './Toast';
export { ToastProvider } from './ToastProvider';
export { useToast } from './useToast';
export { HintTooltip } from './HintTooltip';
export type { HintTooltipProps, HintTooltipAlign } from './HintTooltip';