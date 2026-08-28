type FieldErrorProps = {
  message?: string;
};

/**
 * A validation message for a single field. Rendered as a live region so a
 * screen reader announces it when it appears, rather than only on next focus.
 */
export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="mt-1.5 text-sm text-alert">
      {message}
    </p>
  );
}
