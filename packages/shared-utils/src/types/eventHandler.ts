export type EventHandler = (e: ErrorEvent | Event) => void;

export type AfterLoadListenerHandler = (this: Window, ev: PageTransitionEvent) => any;
export type BeforeUnloadListenerHandler = (this: Window, ev: BeforeUnloadEvent) => any;
export type UnloadListenerHandler = (this: Window, ev: Event) => any;
