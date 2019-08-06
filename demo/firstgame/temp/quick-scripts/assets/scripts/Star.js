(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/Star.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '94fdcQL5I5Cp6aXwh63/3Ta', 'Star', __filename);
// scripts/Star.ts

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
var Index_1 = require("./Index");
var Star = /** @class */ (function (_super) {
    __extends(Star, _super);
    function Star() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.index = null;
        _this.tank = null;
        _this.minY = cc.view.getDesignResolutionSize().height / -2;
        return _this;
    }
    Star.prototype.start = function () {
        // 定义一个Action
        var downAction = cc.moveTo(this.index.starFallSpeed, this.node.x, this.minY - 60);
        downAction.easing(cc.easeSineOut());
        this.node.runAction(downAction);
    };
    Star.prototype.doMoveDown = function () {
        //  检测
        this.tank = this.index.tank;
        var distance = this.node.position.sub(this.tank.getPosition()).mag();
        if (distance < (this.tank.width / 2 - 5)) {
            this.index.scoreNum += this.index.starScoreSpeed;
            this.index.score.string = "得分:" + this.index.scoreNum;
            // 降落速度加
            if (Math.floor(this.index.scoreNum / 100) == this.index.starScoreSpeed - 4 && this.index.starFallSpeed > 1) {
                this.index.starFallSpeed -= 0.2;
                if (this.index.starBuildTimeOut > 200) {
                    this.index.starBuildTimeOut -= 100;
                }
                this.index.lifeNum += 1;
                if (this.index.starScoreSpeed < 10) {
                    this.index.starScoreSpeed += 1;
                }
            }
            cc.audioEngine.play(this.index.scoreClip, false, 0.2);
            this.index.allStars.splice(this.index.allStars.indexOf(this.node), 1);
            this.node.destroy();
        }
        if (this.node.y <= this.minY) {
            this.index.lifeNum -= 1;
            this.index.life.string = "生命:" + this.index.lifeNum;
            this.node.destroy();
            this.index.allStars.splice(this.index.allStars.indexOf(this.node), 1);
            if (this.index.lifeNum <= 0) {
                this.index.gameOver.node.active = true;
                this.index.btnPlay.node.active = true;
                this.index.starIsRunning = false;
                var storageValue = cc.sys.localStorage.getItem(this.index.HIGHSTORAGEKEY);
                if (storageValue && parseInt(storageValue) > this.index.scoreNum) {
                    return;
                }
                cc.sys.localStorage.setItem(this.index.HIGHSTORAGEKEY, this.index.scoreNum);
                this.index.highScore.string = "最高分:" + this.index.scoreNum;
            }
        }
    };
    Star.prototype.onLoad = function () {
    };
    Star.prototype.update = function (dt) {
        if (this.index.starIsRunning) {
            this.doMoveDown();
            return;
        }
        this.index.allStars.forEach(function (node) { return node.stopAllActions(); });
    };
    __decorate([
        property(Index_1.default)
    ], Star.prototype, "index", void 0);
    Star = __decorate([
        ccclass
    ], Star);
    return Star;
}(cc.Component));
exports.default = Star;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=Star.js.map
        