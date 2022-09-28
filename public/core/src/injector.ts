import { has, Plugin, Uploader } from '@gaze-anchor/shared';
import { LifeCycleHookTypes } from '@gaze-anchor/static';
import { getHooks, proxyInstall, proxyUploader } from './lifeCycle';

type Dependence = Function;

export class Injector {
  static instance: Injector;
  private deps: Array<Dependence>;
  private idx: number;

  private constructor(deps: Array<Dependence>) {
    this.deps = Array.from(new Set(deps));
    this.idx = 0;
  }

  static getInstance(deps: Array<Dependence>) {
    if (!this.instance) {
      this.instance = new Injector(deps);
    }
    return this.instance;
  }

  private isLifeCycleRequired(plugin: Plugin): boolean {
    for (const type in LifeCycleHookTypes) {
      if (has(plugin, LifeCycleHookTypes[type as keyof typeof LifeCycleHookTypes])) return true;
    }

    return plugin.install.length >= 2;
  }

  // initialize the life cycle of each plugin
  // it will proxy the install function actually
  // and inject the life cycle hooks automatically
  private initLifeCycle(plugin: Plugin) {
    const install = proxyInstall(plugin);
    // the first incoming dependency must be uploader
    const upload = proxyUploader(plugin, this.deps[this.idx++] as Uploader);
    const hooks = getHooks(plugin);

    return install.bind(plugin, upload, hooks);
  }

  resolve(plugin: Plugin) {
    if (!has(plugin, 'install')) {
      throw new Error("it's not a legal plugin");
    }

    let resolvedInstall = plugin.install;
    this.idx = 0;

    if (this.isLifeCycleRequired(plugin)) {
      resolvedInstall = this.initLifeCycle(plugin);
    }

    return resolvedInstall.bind(
      plugin,
      // silent ts type error...
      ...(this.deps.slice(this.idx) as Parameters<Plugin['install']>)
    );
  }
}

export const createInjector = (deps: Array<Dependence>) => {
  return Injector.getInstance(deps);
};
