"use strict";
cc._RF.push(module, 'b3dd09kV7tHQ6V0Q3P6ScsU', 'Index');
// scripts/Index.ts

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
var Index = /** @class */ (function (_super) {
    __extends(Index, _super);
    function Index() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.starPrefab = null;
        _this.tank = null;
        _this.score = null;
        _this.highScore = null;
        _this.life = null;
        _this.scoreClip = null;
        _this.gameOver = null;
        _this.btnPlay = null;
        _this.allStars = [];
        _this.scoreNum = 0;
        _this.highScoreNum = 0;
        _this.lifeNum = 0;
        _this.starHeight = 0;
        _this.starWidth = 0;
        _this.starMaxY = 0;
        _this.starMinY = 0;
        _this.starMaxX = 0;
        _this.starMinX = 0;
        _this.defaultStarBuildSpeed = 1000;
        _this.defaultFallSpeed = 5;
        _this.defaultLifeNum = 10;
        _this.defaultScoreSpeed = 5;
        _this.HIGHSTORAGEKEY = "TANK_HIGHSCORE";
        _this.starBuildHandle = 0;
        _this.starBuildTimeOut = _this.defaultStarBuildSpeed;
        _this.starFallSpeed = _this.defaultFallSpeed;
        _this.starScoreSpeed = _this.defaultScoreSpeed;
        _this.starIsRunning = false;
        return _this;
    }
    Index.prototype.buildOneStar = function () {
        var star = cc.instantiate(this.starPrefab);
        this.node.addChild(star);
        if (this.starWidth == 0) {
            this.starWidth = star.width;
            this.starHeight = star.height;
            var vs = cc.view.getDesignResolutionSize();
            this.starMaxY = Math.floor((vs.height - this.starHeight) / 2);
            this.starMinY = this.tank.getPosition().y;
            this.starMaxX = Math.floor((vs.width - this.starWidth) / 2);
            this.starMinX = -this.starMaxX;
        }
        // 保存当前对象
        this.allStars.push(star);
        return star;
    };
    Index.prototype.buildRandomStar = function () {
        var tempX = 0;
        var tempY = 0;
        tempX = Math.floor(this.starMaxX - Math.random() * this.starMaxX);
        tempY = Math.floor(this.starMaxY - Math.random() * this.starMaxY);
        if (Math.random() < 0.5)
            tempX = tempX * -1;
        var star = this.buildOneStar();
        star.setPosition(tempX, tempY);
        star.zIndex = this.tank.zIndex - 1;
        star.name = "star";
        star.getComponent("Star").index = this;
    };
    Index.prototype.buildStarForever = function () {
        var _this = this;
        if (this.starIsRunning) {
            this.starBuildHandle = setTimeout(function () {
                clearTimeout(_this.starBuildHandle);
                _this.buildRandomStar();
                _this.buildStarForever();
            }, this.starBuildTimeOut);
        }
    };
    Index.prototype.initResource = function () {
        this.scoreNum = 0;
        this.score.string = "得分:" + this.scoreNum;
        this.lifeNum = this.defaultLifeNum;
        this.life.string = "生命:" + this.lifeNum;
        this.highScoreNum = 0;
        var storageValue = cc.sys.localStorage.getItem(this.HIGHSTORAGEKEY);
        if (storageValue) {
            this.highScoreNum = parseInt(storageValue);
        }
        this.highScore.string = "最高分:" + this.highScoreNum;
        this.gameOver.node.active = false;
        //清空缓存星星
        this.allStars.forEach(function (item) { return item.destroy(); });
        this.allStars = [];
        this.starBuildTimeOut = this.defaultStarBuildSpeed;
        this.starFallSpeed = this.defaultFallSpeed;
        this.starScoreSpeed = this.defaultScoreSpeed;
    };
    Index.prototype.onBtnPlayClick = function (e) {
        this.initResource();
        this.btnPlay.node.active = false;
        this.starIsRunning = true;
        // 开始生产星星
        this.buildStarForever();
    };
    Index.prototype.onLoad = function () {
        this.gameOver.node.active = false;
        this.tank.zIndex = 1;
        this.gameOver.node.zIndex = 3;
        this.btnPlay.node.zIndex = 3;
        this.life.node.zIndex = 3;
        this.score.node.zIndex = 3;
        // 注册按事件
        this.btnPlay.node.on(cc.Node.EventType.TOUCH_END, this.onBtnPlayClick.bind(this), false);
        //注册广告
        if (typeof wx === 'undefined') {
            return;
        }
        var bannerAd = wx.createBannerAd({
            adUnitId: 'adunit-a6715e39b68734d4',
            adIntervals: 30,
            style: {
                left: wx.getSystemInfoSync().windowWidth / 2 - 150,
                top: wx.getSystemInfoSync().windowHeight - 105,
                width: 300
            }
        });
        bannerAd.show();
    };
    Index.prototype.update = function (dt) {
    };
    Index.prototype.start = function () {
    };
    __decorate([
        property(cc.Prefab)
    ], Index.prototype, "starPrefab", void 0);
    __decorate([
        property(cc.Node)
    ], Index.prototype, "tank", void 0);
    __decorate([
        property(cc.Label)
    ], Index.prototype, "score", void 0);
    __decorate([
        property(cc.Label)
    ], Index.prototype, "highScore", void 0);
    __decorate([
        property(cc.Label)
    ], Index.prototype, "life", void 0);
    __decorate([
        property(cc.AudioClip)
    ], Index.prototype, "scoreClip", void 0);
    __decorate([
        property(cc.Label)
    ], Index.prototype, "gameOver", void 0);
    __decorate([
        property(cc.Button)
    ], Index.prototype, "btnPlay", void 0);
    Index = __decorate([
        ccclass
    ], Index);
    return Index;
}(cc.Component));
exports.default = Index;

cc._RF.pop();