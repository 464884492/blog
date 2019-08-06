
const { ccclass, property } = cc._decorator;

@ccclass
export default class Tank extends cc.Component {

    @property
    maxSpeed: number = 0;

    @property
    accel: number = 0;

    moveLeft: Boolean = false;
    moveRight: Boolean = false;
    isMove: Boolean = false;
    leftMinX: number = 0;
    rightMaxX: number = 0;
    topMaxY: number = 0;
    bottomMinY: number = 0;

    tankMoveDirection(keyCode: number, isKeyDown: Boolean) {
        switch (keyCode) {
            case cc.macro.KEY.left:
                this.moveLeft = isKeyDown;
                this.isMove = isKeyDown;
                break;
            case cc.macro.KEY.right:
                this.moveRight = isKeyDown;
                this.isMove = isKeyDown;
                break;
            default:
                break;
        }
        this.doTankMove();
    }

    doTankMove() {
        if (!this.isMove) return;
        // 边界判断
        if (this.moveLeft && this.node.x <= this.leftMinX) return;
        if (this.moveRight && this.node.x >= this.rightMaxX) return;
        //  移动
        let moveValue = 4;
        if (this.moveLeft) moveValue = moveValue * -1;
        this.node.x += moveValue;
    }
    onTouchMove(e: cc.Event.EventTouch) {
        let deltaX = e.getDeltaX();
        let deltaY = e.getDeltaY();
        //左移
        if (deltaX < 0 && this.node.x <= this.leftMinX) return;
        if (deltaX > 0 && this.node.x >= this.rightMaxX) return;
        if (deltaY > 0 && this.node.y >= this.topMaxY) return;
        if (deltaY < 0 && this.node.y <= this.bottomMinY) return;

        this.node.x += deltaX;
        this.node.y += deltaY;
    }
    onKeyDown(e: KeyboardEvent) {
        this.tankMoveDirection(e.keyCode, true);
    }
    onKeyUp(e: KeyboardEvent) {
        this.tankMoveDirection(e.keyCode, false);
    }
    start() {
    }
    onLoad() {
        //计算边界信息
        let { width, height } = cc.view.getDesignResolutionSize();
        this.rightMaxX = (width - this.node.width) / 2;
        this.leftMinX = -1 * this.rightMaxX;
        this.topMaxY = (height - this.node.height) / 2;
        this.bottomMinY = -1 * this.topMaxY + 75;

        //注册事件监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    update(dt: number) {

    }
}
