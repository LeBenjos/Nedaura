import { markRaw, shallowRef, type Component, type ShallowRef } from 'vue';

interface MountedComponent {
    id: string;
    component: Component;
    noAnimation?: boolean;
    props?: Record<string, unknown>;
}

const stack = shallowRef<MountedComponent[]>([]);

export function useInterfaceManager(): {
    stack: ShallowRef<MountedComponent[]>;
    mount: (params: MountedComponent) => void;
    unmount: (id: string) => void;
    unmountAll: () => void;
} {
    function mount(params: MountedComponent): void {
        if (stack.value.find((c) => c.id === params.id)) return; // eviter des doublons

        stack.value = [...stack.value, { id: params.id, component: markRaw(params.component), noAnimation: params.noAnimation, props: params.props }];
        console.log('mouting this bitch', stack.value);
    }
    function unmount(id: string): void {
        stack.value = stack.value.filter((c) => c.id !== id);

        console.log('just unmounted that bitch', stack.value);
    }
    function unmountAll(): void {
        stack.value = [];
    }
    return { stack, mount, unmount, unmountAll };
}
