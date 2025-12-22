export interface UnsupportedElement {
  type: string;
  value?: string;
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}
