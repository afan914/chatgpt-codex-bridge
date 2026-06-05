type ErrorMessageProps = {
  message?: string;
};

export function ErrorMessage({ message }: ErrorMessageProps): JSX.Element | null {
  if (!message) {
    return null;
  }

  return <div className="message message--error">{message}</div>;
}
