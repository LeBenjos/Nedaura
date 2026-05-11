import { ref, onMounted, onUnmounted, type Ref } from 'vue';

interface Bounds {
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    x: number;
    y: number;
}

const DEFAULT_BOUNDS: Bounds = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
};

export function useBounds(target: Ref<HTMLElement | null>): { bounds: Ref<Bounds>; update: () => void } {
    const bounds = ref<Bounds>({ ...DEFAULT_BOUNDS });

    function update(): void {
        if (!target.value) return;
        const rect = target.value.getBoundingClientRect();
        bounds.value = {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
            x: rect.x,
            y: rect.y,
        };
    }

    const observer = new ResizeObserver(update);

    onMounted(() => {
        if (target.value) observer.observe(target.value);
        //window.addEventListener('scroll', update, { passive: true });
    });

    onUnmounted(() => {
        observer.disconnect();
        //window.removeEventListener('scroll', update);
    });

    return { bounds, update };
}
