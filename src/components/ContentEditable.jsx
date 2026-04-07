import { useEffect, useRef, useState } from "react";

export default function Contenteditable(props) {
  const contentEditableRef = useRef(null);
  const [announcementPlaceholder, setAnnouncementPlaceholder] = useState(
    props?.placeholder
  );
  const handleFocus = () => {
    if (!props.value) {
      setAnnouncementPlaceholder("");
    }
  };
  const handleBlur = () => {
    if (!props.value) {
      setAnnouncementPlaceholder(props?.placeholder);
    }
  };

  useEffect(() => {
    if (props.value) {
      if (contentEditableRef.current.textContent !== props.value) {
        contentEditableRef.current.textContent = props.value;
      }
    } else {
      contentEditableRef.current.textContent = announcementPlaceholder;
    }
  });

  return (
    <div
      // @ts-ignore
      contentEditable="plaintext-only"
      ref={contentEditableRef}
      onInput={(event) => {
        // @ts-ignore
        props.onChange(
          // @ts-ignore
          event.target.textContent === announcementPlaceholder
            ? ""
            : // @ts-ignore
              event.target.textContent
        );
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}
