export default class GameScene extends Phaser.Scene {

    player: Phaser.Physics.Arcade.Sprite
    reticle
    enemies: Phaser.Physics.Arcade.Group
    enemyCount = 0
    hitPoints = 0
    points = 0
    level = 1
    /* 
     * magic numbers 
     * Warning, poor programming practices ahead.
     */
    magic_initial_velocity_multiplier = 100
    magic_per_level_velocity_multiplier = 10
    magic_maximum_velocity_multiplier = 500
    magic_initial_number_of_enemies = 20
    magic_per_level_number_of_enemies = 5
    magic_maximum_number_of_enemies = 1000
    magic_initial_reticle_radius = 5
    magic_per_level_reticle_radius = 5
    magic_initial_hit_points = 5
    magic_per_level_hit_points = 2
    magic_initial_enemy_delay = 100
    magic_per_level_enemy_delay = -5
    magic_minimum_enemy_delay = 25

    velocity_multiplier = this.magic_initial_velocity_multiplier
    number_of_enemies = this.magic_initial_number_of_enemies
    reticle_radius = this.magic_initial_reticle_radius
    hit_points = this.magic_initial_hit_points
    enemy_delay = this.magic_initial_enemy_delay

    constructor() {
        super('default')
        // this.progressBar = null
    }

    // init(data) {
    //     console.debug('init', data, this)
    // }

    preload() {
        this.load.spritesheet('mage', 'assets/mage.png',
            { frameWidth: 60, frameHeight: 60 }
        )
        this.load.spritesheet('enemy', 'assets/floating_thing.png',
            { frameWidth: 45, frameHeight: 72 }
        )
    }

    create() {
        /* Create world bounds */
        this.physics.world.setBounds(0, 0, 1600, 800)
        
        /* reticle */
        this.createReticle()

        /* enemies */
        // TODO: Pooling
        this.enemies = this.physics.add.group()

        // const background = this.add.image(800, 600, 'background')
        /* player */
        this.player = this.physics.add.sprite(400, 300, 'mage')
        this.hitPoints = this.hit_points

        // time delay for enemies
        this.time.addEvent({
            delay: this.enemy_delay,
            loop: true,
            callback: this.addEnemy,
            callbackScope: this
        })
        // this.time.delayedCall(100, this.addEnemy, null, this)
        
        // triggers the onCollision handler
        this.physics.add.collider(this.player, this.enemies, this.onCollision, null, this)

        // Move to player class
        // image/sprite properties
        this.player.setOrigin(0.5, 0.5).setDisplaySize(60, 60).setCollideWorldBounds(true).setDrag(500, 500)

        // reticle is probably going away, but it's helpful for now
        this.physics.add.overlap(this.reticle, this.enemies, this.onZwat, this.canCollide, this)

        this.input.on('pointermove', function (pointer) {
            this.reticle.x = pointer.x
            this.reticle.y = pointer.y
        }, this)

        this.input.on('pointerdown', function (pointer){
            this.reticle.setVisible(true)
        }, this)

        this.input.on('pointerup', function (pointer){
            this.reticle.setVisible(false)
        }, this)
    }


    // this will probably go away
    createReticle() {
        let r = this.reticle_radius
        let color = 0xffff00
        let thickness = 2
        let alpha = 1.0
        let graphics = this
            .make.graphics({x: 0, y: 0, add: false})
            .lineStyle(thickness, color, alpha)
            .strokeCircle(r, r, r)
            .generateTexture('reticle', r*2, r*2)
        graphics.destroy()
        this.reticle = this.physics.add.image(300, 400, 'reticle')
        //this.reticle.setDebug(true, true, true)
        this.reticle.setVisible(false)
    }

    // this is input and collision
    // This is used as a processCallback. If it returns false, the onZwat is not called
    canCollide(reticle, enemy){
        return this.input.activePointer.isDown
    }

    // collision
    onCollision(gameObject, enemy) {
        enemy.destroy()
        this.hitPoints -= 1
        console.log('hp:' + this.hitPoints)
        this.checkWinLose()
    }

    // collision ?
    onZwat(gameObject, enemy) {
        enemy.destroy()
        this.checkWinLose()
    }

    checkWinLose(){
        this.checkWin()
        this.checkLose()
    }
    
    isDead() {
        return this.hitPoints <= 0
    }

    die(){
        console.log('Alas, you have expired.')
        console.log('Game Over')
        this.scene.restart()
        this.enemyCount = 0
    }

    checkWin() {
        if (this.beatLevel()) {
            this.levelUp()
        }
    }

    checkLose() {
        if (this.isDead()){
            this.die()
        }
    }

    beatLevel() {
        return this.enemies.children.size === 0
    }

    levelUp() {
        this.level += 1
        this.enemyCount = 0
        console.log('Congratulations on level ' + this.level)
        if (this.velocity_multiplier < this.magic_maximum_velocity_multiplier){
            this.velocity_multiplier = this.magic_initial_velocity_multiplier + this.magic_per_level_velocity_multiplier * (this.level - 1)
        } else {
            this.velocity_multiplier = this.magic_maximum_velocity_multiplier
        }
        console.log('velocity_multiplier: ' + this.velocity_multiplier)
        this.magic_maximum_velocity_multiplier = 500
        this.number_of_enemies = this.magic_initial_number_of_enemies + this.magic_per_level_number_of_enemies * (this.level - 1)
        console.log('number_of_enemies: ' + this.number_of_enemies)
        this.reticle_radius = this.magic_initial_reticle_radius + this.magic_per_level_reticle_radius * (this.level - 1)
        console.log('reticle_radius: ' + this.reticle_radius)
        this.hit_points = this.magic_initial_hit_points + this.magic_per_level_hit_points * (this.level - 1)
        console.log('hit_points: ' + this.hit_points)
        this.hitPoints = this.hit_points
        if (this.enemy_delay > this.magic_minimum_enemy_delay){
            this.enemy_delay = this.magic_initial_enemy_delay + this.magic_per_level_enemy_delay * (this.level - 1)
        } else {
            this.enemy_delay = this.magic_minimum_enemy_delay
        }
        console.log('enemy_delay: ' + this.enemy_delay)
    }

    // TODO: Pooling
    // TODO: Move to enemy class
   addEnemy() {
        if (this.enemies.children.size >= this.magic_maximum_number_of_enemies || this.enemyCount > this.number_of_enemies) 
        {
            return
        }

        //let enemy = this.enemies.get(Phaser.Math.Between(-64, 864), Phaser.Math.Between(-64, 0))
        let enemy = this.physics.add.sprite(Phaser.Math.Between(-64, 864), Phaser.Math.Between(-64, 0), 'enemy')
        //if (!enemy) return // None free        
        this.enemyCount += 1
        this.enemies.add(enemy)
        this.activateEnemy(enemy)
    }

    // TODO: Move to enemy class
    activateEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
        enemy
            .setActive(true)
            .setVisible(true)
            .setScale(0.5)
        let v = this.subtract(this.player.getCenter(), enemy.getCenter())
        v.normalize()
        enemy.setVelocityX(v.x * this.velocity_multiplier)
        enemy.setVelocityY(v.y * this.velocity_multiplier)      
    }

    // TODO: Move to utility class or find the actual function in phaser to do this
    subtract(a: Phaser.Geom.Point, b: Phaser.Geom.Point, out?: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        if (typeof out === "undefined") {
            out = new Phaser.Math.Vector2()
        }
        out.x = a.x - b.x
        out.y = a.y - b.y
        return out
    }

    update(time, delta) {
    }
}
