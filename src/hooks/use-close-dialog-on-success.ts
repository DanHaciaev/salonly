import { useEffect } from "react";

/**
 * Notifies a parent component (e.g. to collapse an inline form) right after
 * a pending form submission finishes without an error. This has to be a
 * useEffect, not a render-time adjustment — `onClose` updates state in a
 * different component than the one calling this hook, and React only allows
 * synchronous state adjustments during render for a component's own state.
 */
export function useCloseDialogOnSuccess({
  pending,
  hasError,
  submitted,
  onClose,
}: {
  pending: boolean;
  hasError: boolean;
  submitted: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!pending && submitted && !hasError) {
      onClose();
    }
    // Only react to the pending→idle transition itself, not every render
    // where hasError/onClose happen to get new identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);
}
