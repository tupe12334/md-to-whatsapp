export class UnsupportedElementError extends Error {
  constructor(elementType: string) {
    super(`Unsupported element: ${elementType}`);
    this.name = 'UnsupportedElementError';
    Object.setPrototypeOf(this, UnsupportedElementError.prototype);
  }
}
