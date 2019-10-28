
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        let g = this.getComponent(cc.Graphics);
        //  y轴
        g.moveTo(0, -100);
        g.lineTo(0, 100);
        g.lineTo(-10, 80);
        g.lineTo(10, 80);
        g.lineTo(0, 100);
        // x 轴
        g.moveTo(-100, 0);
        g.lineTo(100, 0);

        g.lineTo(80, -10);
        g.lineTo(80, 10);
        g.lineTo(100, 0);
        g.stroke();
    }

    // update (dt) {}
}
