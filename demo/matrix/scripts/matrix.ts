const { ccclass, property } = cc._decorator;

@ccclass
export default class Matrix extends cc.Component {
    onLoad() {

    }

    update() {

    }

    log(title) {
        console.log(`------------------${title}-------------------`);
        let wm = cc.mat4();
        this.node.getWorldMatrix(wm);
        console.log("---1. [世界坐标矩阵]---");
        console.log(wm.toString());

        let lm = cc.mat4();
        this.node.getLocalMatrix(lm);
        console.log("---2. [本地坐标矩阵]---");
        console.log(lm.toString());

        console.log("---3. [当前各属性状态]---");

        console.log(`1. position: ${this.node.position.toString()}
2. scale: ${this.node.scale.toString()}
3. angle: ${this.node.angle}
4. skewX: ${this.node.skewX}
5. skewY: ${this.node.skewY}
6. width: ${this.node.width}
7. height: ${this.node.height}
8. parentWidth: ${this.node.parent.width}
9. parentHeight: ${this.node.parent.height}`)

        console.log("---4. [锚点角(0,0)坐标信息]---")
        let wordVec = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
        console.log(`原点的世界坐标:${wordVec.toString()}  本地坐标: ${localVec.toString()}`);

        console.log("---5. [右上角(50,50)坐标信息]---")
        wordVec = this.node.convertToWorldSpaceAR(cc.v2(50, 50));
        localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
        console.log(`右上角的世界坐标:${wordVec.toString()}  本地坐标: ${localVec.toString()}`);
    }

    start() {
        this.log("初始状态");
        this.node.angle = 30;
        this.log("旋转30°");
        this.node.rotation = 30;
        this.log("旋转30°");
        this.node.skewX = 30;
        this.node.skewY = 30;
        this.log("XY倾斜30°");
        this.node.scale = 0.5;
        this.log("缩小50%");
        this.node.setPosition(10, 10);
        this.log("平移(10,10)");
    }

}
