
const { ccclass, property } = cc._decorator;
import Index from "./Index"

@ccclass
export default class Star extends cc.Component {

    @property(Index)
    index: Index = null;
    tank: cc.Node = null;
    minY: number = cc.view.getDesignResolutionSize().height / -2;

    start() {
        // 定义一个Action
        let downAction = cc.moveTo(this.index.starFallSpeed, this.node.x, this.minY - 60);
        downAction.easing(cc.easeSineOut());
        this.node.runAction(downAction);
    }

    doMoveDown() {
        //  检测
        this.tank = this.index.tank;
        let distance = this.node.position.sub(this.tank.getPosition()).mag();
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
            this.index.allStars.splice(this.index.allStars.indexOf(this.node), 1)
            this.node.destroy();
        }
        if (this.node.y <= this.minY) {
            this.index.lifeNum -= 1;
            this.index.life.string = "生命:" + this.index.lifeNum;
            this.node.destroy();
            this.index.allStars.splice(this.index.allStars.indexOf(this.node), 1)
            if (this.index.lifeNum <= 0) {
                this.index.gameOver.node.active = true;
                this.index.btnPlay.node.active = true;
                this.index.starIsRunning = false;
                let storageValue = cc.sys.localStorage.getItem(this.index.HIGHSTORAGEKEY);
                if (storageValue && parseInt(storageValue) > this.index.scoreNum) {
                    return;
                }
                cc.sys.localStorage.setItem(this.index.HIGHSTORAGEKEY, this.index.scoreNum);
                this.index.highScore.string = "最高分:" + this.index.scoreNum;
            }
        }
    }
    onLoad() {

    }
    update(dt: number) {
        if (this.index.starIsRunning) {
            this.doMoveDown();
            return;
        }
        this.index.allStars.forEach(node => node.stopAllActions());
    }

}
