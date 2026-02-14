declare module 'react-katex' {
  import { ComponentType } from 'react';

  interface BlockMathProps {
    math: string;
  }

  interface InlineMathProps {
    math: string;
  }

  export const BlockMath: ComponentType<BlockMathProps>;
  export const InlineMath: ComponentType<InlineMathProps>;
}
