import { useState } from "react";

/**
 * Closes a dialog right after a pending form submission finishes without an
 * error. Adjusts state during render (per React's documented pattern for
 * reacting to a value changing) instead of a useEffect, since this only
 * needs to run exactly once per pending→idle transition.
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
  const [wasPending, setWasPending] = useState(pending);

  if (pending !== wasPending) {
    setWasPending(pending);
    if (wasPending && !pending && submitted && !hasError) {
      onClose();
    }
  }
}
