declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Extend global types for testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}