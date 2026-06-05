type SendButtonProps = {
  disabled: boolean;
  isSending: boolean;
  onClick: () => void;
  label: string;
  sendingLabel: string;
};

export function SendButton({ disabled, isSending, onClick, label, sendingLabel }: SendButtonProps): JSX.Element {
  return (
    <button className="send-button" type="button" disabled={disabled} onClick={onClick}>
      {isSending ? sendingLabel : label}
    </button>
  );
}
