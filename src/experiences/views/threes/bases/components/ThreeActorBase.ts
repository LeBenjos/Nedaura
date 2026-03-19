import { BufferGeometry, Material, Mesh, Object3D, Texture } from 'three';

export default abstract class ThreeActorBase extends Object3D {
    constructor() {
        super();
    }

    public init(): void {
        this.reset();
    }

    public reset(): void {
        //
    }

    public dispose(): void {
        const geometries = new Set<BufferGeometry>();
        const materials = new Set<Material>();
        const textures = new Set<Texture>();

        this.traverse((child) => {
            if (child instanceof Mesh) {
                if (child.geometry instanceof BufferGeometry) geometries.add(child.geometry as BufferGeometry);

                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat) => {
                    if (mat instanceof Material) {
                        materials.add(mat);

                        Object.values(mat).forEach((value) => {
                            if (value instanceof Texture) textures.add(value);
                        });
                    }
                });
            }
        });

        textures.forEach((tex) => tex.dispose());
        materials.forEach((mat) => mat.dispose());
        geometries.forEach((geo) => geo.dispose());
    }

    public update(_dt: number): void { }
}
