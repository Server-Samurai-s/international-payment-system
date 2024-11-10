declare module 'xss-clean' {
    const xss: () => (req: any, res: any, next: any) => void;
    export default xss;
  }