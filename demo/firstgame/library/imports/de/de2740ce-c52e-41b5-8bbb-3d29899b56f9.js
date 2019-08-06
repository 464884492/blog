"use strict";
cc._RF.push(module, 'de274DOxS5BtYu7PSmJm1b5', 'Tank');
// scripts/Tank.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Tank = /** @class */ (function (_super) {
    __extends(Tank, _super);
    function Tank() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.maxSpeed = 0;
        _this.accel = 0;
        _this.moveLeft = false;
        _this.moveRight = false;
        _this.isMove = false;
        _this.leftMinX = 0;
        _this.rightMaxX = 0;
        _this.topMaxY = 0;
        _this.bottomMinY = 0;
        return _this;
    }
    Tank.prototype.tankMoveDirection = function (keyCode, isKeyDown) {
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
    };
    Tank.prototype.doTankMove = function () {
        if (!this.isMove)
            return;
        // 边界判断
        if (this.moveLeft && this.node.x <= this.leftMinX)
            return;
        if (this.moveRight && this.node.x >= this.rightMaxX)
            return;
        //  移动
        var moveValue = 4;
        if (this.moveLeft)
            moveValue = moveValue * -1;
        this.node.x += moveValue;
    };
    Tank.prototype.onTouchMove = function (e) {
        var deltaX = e.getDeltaX();
        var deltaY = e.getDeltaY();
        //左移
        if (deltaX < 0 && this.node.x <= this.leftMinX)
            return;
        if (deltaX > 0 && this.node.x >= this.rightMaxX)
            return;
        if (deltaY > 0 && this.node.y >= this.topMaxY)
            return;
        if (deltaY < 0 && this.node.y <= this.bottomMinY)
            return;
        this.node.x += deltaX;
        this.node.y += deltaY;
    };
    Tank.prototype.onKeyDown = function (e) {
        this.tankMoveDirection(e.keyCode, true);
    };
    Tank.prototype.onKeyUp = function (e) {
        this.tankMoveDirection(e.keyCode, false);
    };
    Tank.prototype.start = function () {
    };
    Tank.prototype.onLoad = function () {
        //计算边界信息
        var _a = cc.view.getDesignResolutionSize(), width = _a.width, height = _a.height;
        this.rightMaxX = (width - this.node.width) / 2;
        this.leftMinX = -1 * this.rightMaxX;
        this.topMaxY = (height - this.node.height) / 2;
        this.bottomMinY = -1 * this.topMaxY + 75;
        //注册事件监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    };
    Tank.prototype.update = function (dt) {
        this.doTankMove();
    };
    __decorate([
        property
    ], Tank.prototype, "maxSpeed", void 0);
    __decorate([
        property
    ], Tank.prototype, "accel", void 0);
    Tank = __decorate([
        ccclass
    ], Tank);
    return Tank;
}(cc.Component));
exports.default = Tank;

cc._RF.pop();