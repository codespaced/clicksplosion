import {} from 'phaser'

export default class Label extends Phaser.GameObjects.BitmapText {
    value: number = 0;
    buffer: number = 0;
    step: number = 1;
    throttle: boolean = false;
    countUp: boolean = true
    prefix: string = ''

    constructor(scene: Phaser.Scene, x: number, y: number, font: string, text?: string | string[], size?: number, align?: number) {
        super(scene, x, y, font, text, size, align)
    }

    setLabel(n: number) {
        let adjustment = n - this.value;
        this.buffer = this.countUp ? adjustment : -adjustment;
        return this.update();
    }

    increase(n: number){
        this.buffer += n
    }

    update() {
        this.setStep(this.buffer)
        this.consumeBuffer();
        this.text = this.prefix + this.value.toString()
        return this.countUp ? this.value + this.buffer : this.value - this.buffer
    }

    setStep(buffer){
        this.step = this.throttle ? this.rateOfChange(buffer) : 1
    }

    // what would you call it?
    consumeBuffer() {
        // step will be 0 if buffer is zero
        let step = Math.min(this.buffer, this.step)
        this.buffer -= step;
        if (this.countUp) {
            this.value += step;
        } else {
            this.value -= step;
        }
    }

    // this is ugly, I'm sure there's a better way
    // int('999999999999' take log10(n) digits?)
    rateOfChange(n: number) {
        if (n > 1000000) {
            return 999999;
        } else if (n > 100000) {
            return 99999;
        } else if (n > 10000) {
            return 9999;
        } else if (n > 1000) {
            return 999;
        } else if (n > 100) {
            return 99;
        } else if (n > 10) {
            return 9;
        }
        return 1;
    }
}
