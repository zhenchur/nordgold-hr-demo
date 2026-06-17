declare module "@barba/core" {
  export type BarbaPage = {
    container: HTMLElement;
    namespace?: string;
    url: {
      href: string;
      path: string;
    };
  };

  export type BarbaTransitionData = {
    current: BarbaPage;
    next: BarbaPage;
  };

  export type BarbaHook = (data: BarbaTransitionData) => unknown;

  export type BarbaTransition = {
    name?: string;
    sync?: boolean;
    once?: BarbaHook;
    leave?: BarbaHook;
    enter?: BarbaHook;
  };

  export type BarbaOptions = {
    debug?: boolean;
    timeout?: number;
    preventRunning?: boolean;
    transitions?: BarbaTransition[];
  };

  type BarbaCore = {
    hooks: {
      beforeEnter(callback: BarbaHook): void;
      afterEnter(callback: BarbaHook): void;
    };
    init(options?: BarbaOptions): void;
    destroy(): void;
    go(href: string): Promise<void>;
  };

  const barba: BarbaCore;
  export default barba;
}
