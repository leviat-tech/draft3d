import { setupVitestCanvasMock } from 'vi-canvas-mock';


export default function setup() {
  setupVitestCanvasMock();

  vi.mock('three', async (importOriginal) => {
    const three = await importOriginal();

    return {
      ...three,
      WebGLRenderer: vi.fn().mockReturnValue({
        domElement: document.createElement('div'),
        setPixelRatio: vi.fn(),
        setSize: vi.fn(),
        render: vi.fn(),
      }),
    };
  });
}
