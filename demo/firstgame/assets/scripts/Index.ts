

const { ccclass, property } = cc._decorator;

@ccclass
export default class Index extends cc.Component {

    @property(cc.Prefab)
    starPrefab: cc.Prefab = null;

    @property(cc.Node)
    tank: cc.Node = null;

    @property(cc.Label)
    score: cc.Label = null;

    @property(cc.Label)
    highScore: cc.Label = null;

    @property(cc.Label)
    life: cc.Label = null;

    @property(cc.AudioClip)
    scoreClip: cc.AudioClip = null;

    @property(cc.Label)
    gameOver: cc.Label = null;

    @property(cc.Button)
    btnPlay: cc.Button = null;

    allStars: cc.Node[] = [];

    scoreNum: number = 0;
    highScoreNum: number = 0;
    lifeNum: number = 0;

    starHeight: number = 0;
    starWidth: number = 0;
    starMaxY: number = 0;
    starMinY: number = 0;
    starMaxX: number = 0;
    starMinX: number = 0;

    defaultStarBuildSpeed: number = 1000;
    defaultFallSpeed: number = 5;
    defaultLifeNum: number = 10;
    defaultScoreSpeed: number = 5;
    HIGHSTORAGEKEY: String = "TANK_HIGHSCORE";

    starBuildHandle: number = 0;
    starBuildTimeOut: number = this.defaultStarBuildSpeed;
    starFallSpeed = this.defaultFallSpeed;
    starScoreSpeed = this.defaultScoreSpeed;
    starIsRunning: Boolean = false;

    buildOneStar() {
        let star = cc.instantiate(this.starPrefab);
        this.node.addChild(star);
        if (this.starWidth == 0) {
            this.starWidth = star.width;
            this.starHeight = star.height;
            let vs = cc.view.getDesignResolutionSize();
            this.starMaxY = Math.floor((vs.height - this.starHeight) / 2);
            this.starMinY = this.tank.getPosition().y;
            this.starMaxX = Math.floor((vs.width - this.starWidth) / 2);
            this.starMinX = -this.starMaxX;
        }
        // 保存当前对象
        this.allStars.push(star);
        return star;
    }
    buildRandomStar() {
        let tempX = 0;
        let tempY = 0;
        tempX = Math.floor(this.starMaxX - Math.random() * this.starMaxX);
        tempY = Math.floor(this.starMaxY - Math.random() * this.starMaxY);
        if (Math.random() < 0.5) tempX = tempX * -1;
        let star = this.buildOneStar();
        star.setPosition(tempX, tempY);
        star.zIndex = this.tank.zIndex - 1;
        star.name = "star";
        star.getComponent("Star").index = this;
    }
    buildStarForever() {
        if (this.starIsRunning) {
            this.starBuildHandle = setTimeout(() => {
                clearTimeout(this.starBuildHandle);
                this.buildRandomStar();
                this.buildStarForever();
            }, this.starBuildTimeOut);
        }
    }
    initResource() {
        this.scoreNum = 0;
        this.score.string = "得分:" + this.scoreNum;
        this.lifeNum = this.defaultLifeNum;
        this.life.string = "生命:" + this.lifeNum;
        this.highScoreNum = 0;
        let storageValue = cc.sys.localStorage.getItem(this.HIGHSTORAGEKEY);
        if (storageValue) {
            this.highScoreNum = parseInt(storageValue);
        }
        this.highScore.string = "最高分:" + this.highScoreNum;
        this.gameOver.node.active = false;
        //清空缓存星星
        this.allStars.forEach(item => item.destroy());
        this.allStars = [];
        this.starBuildTimeOut = this.defaultStarBuildSpeed;
        this.starFallSpeed = this.defaultFallSpeed;
        this.starScoreSpeed = this.defaultScoreSpeed;
    }

    onBtnPlayClick(e: cc.Event.EventTouch) {
        this.initResource();
        this.btnPlay.node.active = false;
        this.starIsRunning = true;
        // 开始生产星星
        this.buildStarForever();
    }
    onLoad() {
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
        let bannerAd = wx.createBannerAd({
            adUnitId: 'adunit-a6715e39b68734d4',
            adIntervals: 30,
            style: {
                left: wx.getSystemInfoSync().windowWidth / 2 - 150,
                top: wx.getSystemInfoSync().windowHeight - 105,
                width: 300
            }
        })
        bannerAd.show()

    }
    update(dt: number) {

    }
    start() {
    }

}
