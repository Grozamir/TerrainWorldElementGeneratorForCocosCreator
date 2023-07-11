import {
    _decorator,
    BoxCollider,
    Collider,
    Component,
    director,
    instantiate,
    math,
    Node,
    Quat,
    Terrain,
    Vec3,
} from "cc";
const { ccclass, executeInEditMode, requireComponent, property } = _decorator;

@ccclass("TerrainObjectSpawner")
@executeInEditMode(true)
@requireComponent(BoxCollider)
export class TerrainObjectSpawner extends Component {
    @property({ tooltip: "Press for spawn objects" })
    private generate: boolean = false;

    @property({
        tooltip: "If true, it will spawn within the BoxCollider, otherwise all over the terrain",
    })
    private isBrush: boolean = false;

    @property(Terrain) private targetTerrain: Terrain = null;

    @property({ type: [Node], group: "Spawned Objects" }) private spawnedObjects: Node[] = [];

    @property({ group: "Spawned Objects" })
    private countObjects: number = 10;

    @property({ group: "Spawned Objects" })
    private offsetY: number = 0;

    @property({ type: Node, group: "Spawned Objects" })
    private parentForSpawnedObjects: Node = null;

    private brushCollider: Collider = null;

    protected update(dt: number): void {
        if (this.generate == true) {
            this.generate = false;

            if (this.targetTerrain == null) {
                console.error(
                    "There is no TargetTerrain. For the generator to work, you need to assign your terrain to TargetTerrain"
                );
                return;
            }

            if (this.spawnedObjects.length == 0) {
                console.error(
                    "There are no spawned objects, to make the generator work you need to add at least one node to Spawned objects"
                );
                return;
            }

            for (let index = 0; index < this.countObjects; index++) {
                const newObject = instantiate(
                    this.spawnedObjects[math.randomRangeInt(0, this.spawnedObjects.length)]
                );

                newObject.name += "-" + index;
                newObject.parent = this.parentForSpawnedObjects ?? director.getScene();

                let pos_x: number;
                let pos_z: number;

                if (this.isBrush == true) {
                    const posInCollider = this.getRandPosWithInCollider();
                    pos_x = posInCollider.x;
                    pos_z = posInCollider.z;
                } else {
                    pos_x = math.randomRange(0, this.targetTerrain.size.x);
                    pos_z = math.randomRange(0, this.targetTerrain.size.y);
                }

                const terrainNormal = this.targetTerrain.getNormalAt(pos_x, pos_z);
                const rotationQuat = new Quat();

                Quat.fromViewUp(rotationQuat, Vec3.FORWARD, terrainNormal);
                newObject.setRotation(rotationQuat);

                newObject.setPosition(
                    pos_x,
                    this.targetTerrain.getHeightAt(pos_x, pos_z) + this.offsetY,
                    pos_z
                );
            }
        } else if (this.isBrush == true) {
            this.brushCollider = this.getComponent(Collider);
        }
    }

    getRandPosWithInCollider(): Vec3 {
        const colliderAABB = this.brushCollider.worldBounds;
        const min = new Vec3();
        const max = new Vec3();

        colliderAABB.getBoundary(min, max);

        const position = new Vec3();

        position.x = math.randomRange(min.x, max.x);
        position.z = math.randomRange(min.z, max.z);

        return position;
    }
}
