export type Cleanup = () => void;

export type CleanupRegistry = {
  add(cleanup: Cleanup): Cleanup;
  on(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): Cleanup;
  addKillable(target: { kill: () => void }): { kill: () => void };
  run(): void;
};

export function qs<T extends Element>(selector: string, root: ParentNode = document) {
  const node = root.querySelector<T>(selector);

  if (!node) {
    throw new Error(`Missing element: ${selector}`);
  }

  return node;
}

export function qsa<T extends Element>(selector: string, root: ParentNode = document) {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function optional<T extends Element>(selector: string, root: ParentNode = document) {
  return root.querySelector<T>(selector);
}

export function createCleanupRegistry(): CleanupRegistry {
  const tasks: Cleanup[] = [];

  return {
    add(cleanup) {
      tasks.push(cleanup);
      return cleanup;
    },

    on(target, type, listener, options) {
      target.addEventListener(type, listener, options);
      return this.add(() => target.removeEventListener(type, listener, options));
    },

    addKillable(target) {
      this.add(() => target.kill());
      return target;
    },

    run() {
      while (tasks.length > 0) {
        tasks.pop()?.();
      }
    }
  };
}
