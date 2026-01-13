import React, { forwardRef } from 'react';
import ReactQuill from 'react-quill';

/**
 * Wrapper component for ReactQuill that uses refs properly to avoid findDOMNode warnings.
 * This component forwards a ref to the underlying ReactQuill component.
 * All props are passed through to ReactQuill.
 */
const ReactQuillWrapper = forwardRef((props, ref) => {
    return <ReactQuill ref={ref} {...props} />;
});

ReactQuillWrapper.displayName = 'ReactQuillWrapper';

export default ReactQuillWrapper;
