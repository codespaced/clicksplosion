export default class ReticleScene extends Phaser.Scene {

    reticle: Phaser.Physics.Arcade.Sprite;
    preload() {
        this.load.spritesheet('reticle', 'assets/floating_thing.png',
        { frameWidth: 45, frameHeight: 72 }
    );
    }

    create() {
        this.physics.world.setBounds(0, 0, 1600, 1200);
        
        // let graphics = this.make.graphics({x:0, y:0, add: true});
        
        // graphics.lineStyle(2, 0xffff00, 1.0);
        // graphics.strokeCircle(24, 24, 24);
        // graphics.generateTexture('reticle', 48, 48);
        // graphics.destroy();
        this.reticle = this.physics.add.sprite(300, 400, 'reticle');
        this.reticle.setVisible(true);
        console.log(this.reticle.texture);
        

        this.input.on('pointermove', function (pointer) {
            this.reticle.x = pointer.x;
            this.reticle.y = pointer.y;
        }, this);
    }
}