// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Event extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let layout = this.node.getComponentInChildren(cc.Layout);
        let btn = this.node.getComponentInChildren(cc.Button);
        // 注册Click事件
        // this.node.on("click", this.onCanvasClick);
        // layout.node.on("click", this.onLayoutClick);
        // btn.node.on("click", this.onButtonClick);

        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onCanvasClick);
        layout.node.on(cc.Node.EventType.MOUSE_DOWN, this.onLayoutClick);
        btn.node.on(cc.Node.EventType.MOUSE_DOWN, this.onButtonClick);
        

        // 从button开始冒泡
        console.log("emit")
        btn.node.emit(cc.Node.EventType.MOUSE_DOWN, { type: "emit" });
        console.log("use dispatchEvent EventMouse");
        btn.node.dispatchEvent(new cc.Event.EventMouse(cc.Node.EventType.MOUSE_DOWN, true));
        console.log("use dispatchEvent EventCustom");
        btn.node.dispatchEvent(new cc.Event.EventCustom(cc.Node.EventType.MOUSE_DOWN, true));
    }

    onCanvasClick(event) {
        console.log(event.type + "=>onCanvasClick");
    }
    onLayoutClick(event) {
        console.log(event.type + "=>onLayoutClick");
    }
    onButtonClick(event) {
        console.log(event.type + "=>onButtonClick");

    }

    start() {

    }

    // update (dt) {}
}
