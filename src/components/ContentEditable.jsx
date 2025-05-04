import { useEffect, useRef } from "react";

export default function Contenteditable(props) {
  const contentEditableRef = useRef(null);

  useEffect(() => {
    if (contentEditableRef.current.textContent !== props.value) {
      contentEditableRef.current.textContent = props.value;
    }
  });

  return (
    <div
      // @ts-ignore
      contentEditable="plaintext-only"
      ref={contentEditableRef}
      onInput={event => {
        // @ts-ignore
        props.onChange(event.target.textContent);
      }}
    />
  );
}
