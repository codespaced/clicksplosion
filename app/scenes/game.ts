import Label from "../components/label/label";

export default class GameScene extends Phaser.Scene {
  player: Phaser.Physics.Arcade.Sprite;
  reticle: Phaser.Physics.Arcade.Image;
  enemies: Phaser.Physics.Arcade.Group;
  reticleCollider: Phaser.Physics.Arcade.Collider;
  enemyCount = 0;
  healthLabel: Label;
  animations: Phaser.GameObjects.Group;
  scoreLabel: Label;
  level = 1;
  levelLabel: Label;
  levelNumber: Phaser.GameObjects.BitmapText;
  font = "consolasBold";
  levelNumberFont = 'clarendon'
  explosion: Phaser.GameObjects.Particles.ParticleEmitterManager;
  enabled: boolean = false;
  width: number;
  height: number;
  centerX: number;
  centerY: number;

  /*
   * magic numbers
   * Warning, poor programming practices ahead.
   */
  // Velocity
  magic_initial_velocity_multiplier = 70;
  magic_per_level_velocity_multiplier = 15;
  magic_maximum_velocity_multiplier = 500;
  // Enemies
  magic_initial_number_of_enemies = 5;
  magic_per_level_number_of_enemies = 3;
  magic_maximum_number_of_enemies = 100;
  // Enemy Delay
  magic_initial_enemy_delay = 250;
  magic_per_level_enemy_delay = -5;
  magic_minimum_enemy_delay = 25;
  // Level Delay
  magic_level_delay = 2000;
  // Reticle
  magic_initial_reticle_radius = 10;
  magic_per_level_reticle_radius = 2;
  // Hit Points
  magic_initial_hit_points = 1;
  magic_per_level_hit_points = 2;
  // Experience
  magic_experience_per_enemy_multiplier = 10;

  velocity_multiplier = this.magic_initial_velocity_multiplier;
  number_of_enemies = this.magic_initial_number_of_enemies;
  reticle_radius = this.magic_initial_reticle_radius;
  hit_points = this.magic_initial_hit_points;
  enemy_delay = this.magic_initial_enemy_delay;

  constructor() {
    super({ key: "gameScene", active: true });
  }

  preload() {
    this.width = this.cameras.main.width;
    this.height = this.cameras.main.height;
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;

    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    let loadingText = this.make.text({
      x: this.centerX, y: this.centerY - 50, text: "Loading...", style: {
        font: "20px monospace", fill: "#ffffff"
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    let percentText = this.make.text({
      x: this.centerX, y: this.centerY - 5, text: "0%", style: {
        font: "18px monospace", fill: "#ffffff"
      }
    });
    percentText.setOrigin(0.5, 0.5);

    let assetText = this.make.text({
      x: this.centerX, y: this.centerY + 50, text: "", style: {
        font: "18px monospace", fill: "#ffffff"
      }
    });

    assetText.setOrigin(0.5, 0.5);

    this.load.on("progress", function (value) {
      percentText.setText(value * 100 + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on("fileprogress", function (file) {
      assetText.setText("Loading asset: " + file.key);
    });

    this.load.on("complete", function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });


    // this.load.spritesheet("mage", "assets/mage.png", {
    //   frameWidth: 60, frameHeight: 60
    // });
    this.load.spritesheet("mage", "assets/cast.png", {
      frameWidth: 64, frameHeight: 68, endFrame: 3
    });
    this.load.spritesheet("enemy", "assets/floating_thing.png", {
      frameWidth: 45, frameHeight: 72
    });

    this.load.atlas(
      "explosion", "assets/particles/explosion.png", "assets/particles/explosion.json"
    );

    this.load.bitmapFont(
      "clarendon", "assets/fonts/bitmap/clarendon.png", "assets/fonts/bitmap/clarendon.xml"
    );
    this.load.bitmapFont(
      "consolasBold", "assets/fonts/consolasBold_0.png", "assets/fonts/consolasBold.fnt"
    );
  }

  // init(data) {
  //   console.debug("init", data, this);
  // }

  create() {
    /* Create world bounds */
    this.physics.world.setBounds(0, 0, 1600, 800);

    /* enemies */
    // TODO: Pooling
    this.enemies = this.physics.add.group();
    this.animations = this.add.group();

    // const background = this.add.image(800, 600, 'background')
    /* player */
    this.player = this.physics.add.sprite(400, 300, "mage");
    this.player
      .setOrigin(0.5, 0.5)
      .setDisplaySize(60, 60)
      .setCollideWorldBounds(true)
      .setImmovable();

    this.createReticle();

    this.healthLabel = this.createLabel(
      this.healthLabel, 50, 10, this.font, 0, 0.5, false, false
    ).setDepth(1);
    this.scoreLabel = this.createLabel(
      this.scoreLabel, 790, 10, this.font, 1, 0.5, true, true
    ).setDepth(1);
    this.levelLabel = this.createLabel(
      this.levelLabel, 360, 10, this.font, 0.5, 0.5, false, true
    ).setDepth(1);
    this.levelNumber = this.add.bitmapText(this.centerX, this.centerY, this.levelNumberFont, '1')
      .setOrigin(0.5, 0.5)
      .setDepth(1)

    this.waitForClick('Click to Begin');

    // time delay for enemies
    this.time.addEvent({
      delay: this.enemy_delay, loop: true, callback: this.addEnemy, callbackScope: this
    });

    // triggers the onCollision handler
    this.physics.add.collider(
      this.player, this.enemies, this.onCollision, null, this
    );

    this.createExplosion();
    
    var config = {
      key: 'castAnimation',
      frames: this.anims.generateFrameNumbers('mage', { start: 0, end: 3}),
      frameRate: 20,
      repeat: 0
    };
    this.anims.create(config);

    this.input.on(
      "pointerdown", function (pointer) {
        this.explosion.emitParticleAt(pointer.x, pointer.y);
        this.reticle.x = pointer.x;
        this.reticle.y = pointer.y;
        this.reticleCollider.active = true;
        this.createFadeAnimation(this.reticle);
        this.player.play('castAnimation')
      }, this
    );
  }

  createExplosion() {
    this.explosion = this.add.particles("explosion");

    // this.explosion.createEmitter({
    //   frame: ["smoke-puff", "cloud", "smoke-puff"],
     //   angle: { min: 240, max: 300 },
     //   speed: { min: 200, max: 300 },
     //   quantity: 6,
     //   lifespan: 2000,
     //   alpha: { start: 1, end: 0 },
     //   //scale: { start: 1.5, end: 0.5 },
     //   scale: { start: 0.5, end: 0.1 },
     //   on: false
    // });

    // this.explosion.createEmitter({
    //   frame: "red",
     //   angle: { min: 0, max: 360, steps: 32 },
     //   lifespan: 1000,
     //   speed: 400,
     //   quantity: 32,
     //   scale: { start: 0.3, end: 0 },
     //   on: false
    // });

    // this.explosion.createEmitter({
    //   frame: "stone",
     //   angle: { min: 240, max: 300 },
     //   speed: { min: 400, max: 600 },
     //   quantity: { min: 2, max: 10 },
     //   lifespan: 4000,
     //   alpha: { start: 1, end: 0 },
     //   scale: { min: 0.05, max: 0.4 },
     //   rotate: { start: 0, end: 360, ease: "Back.easeOut" },
     //   gravityY: 800,
     //   on: false
    // });

    this.explosion.createEmitter({
      frame: "muzzleflash2",
        lifespan: 150,
        scale: { start: 1, end: 0 },
        rotate: { start: 0, end: 360 },
        on: false,
        blendMode: Phaser.BlendModes.ADD
          });
}

  createLabel(label: Label, x, y, font, originX, originY, throttle, countUp) {
    label = new Label(this, x, y, font)
      .setOrigin(originX, originY)
      .setVisible(true);
    this.add.existing(label);
    label.throttle = throttle;
    label.countUp = countUp;
    return label;
  }

  createFloatAnimation(x, y, message, tint, parent) {
    let animation = this.add.bitmapText(x, y, this.font, message).setTint(tint);
    parent.add(animation);
    let tween: Phaser.Tweens.Tween = this.add.tween({
      targets: animation, duration: 750, ease: "Exponential.In", y: y - 50,
      onComplete: () => {
        animation.destroy();
      }, callbackScope: this
    });
  }

  createFadeAnimation(gameObject) {
    let tween: Phaser.Tweens.Tween = this.add.tween({
      targets: gameObject, duration: 100, ease: "Linear", alpha: { getStart: () => 0.5, getEnd: () => 0 }, onComplete: () => {
        this.reticleCollider.active = false;
      }, callbackScope: this
    });
  }

  createLevelAnimation() {
    let tween: Phaser.Tweens.Tween = this.add.tween({
      targets: this.levelNumber,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      hold: 250,
      yoyo: true,
      repeat: 0,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.enabled = true
        this.levelNumber.visible = false
      },
      callbackScope: this,
      onYoyocallbackScope: this
    });
  }

  onCollision(gameObject, enemy) {
    enemy.destroy();
    let damage = Math.round(this.level / 2);
    this.createFloatAnimation(
      enemy.x, enemy.y, "-" + damage, 0xff3333, this.animations
    );
    this.healthLabel.increase(damage);
    this.checkWinLose();
  }

  onZwat(gameObject, enemy) {
    let score = this.level * this.magic_experience_per_enemy_multiplier;
    this.scoreLabel.increase(score);
    this.createFloatAnimation(
      enemy.x, enemy.y, "+" + score, 0xffff00, this.animations
    );
    enemy.destroy();
    this.updateUi();
    this.checkWinLose();
  }

  checkWinLose() {
    this.checkWin();
    this.checkLose();
  }

  isDead() {
    return this.healthLabel.value <= 0;
  }

  die() {
    console.log("Alas, you have expired.");
    this.waitForClick()
  }

  waitForClick(message = 'GAME\nOVER'){
    this.physics.pause()
    let text = this.add.text(this.centerX, this.centerY, message, { fontFamily: 'Impact', color: '#ffffff', align: 'center', fontSize: '128px' })
    text
    .setDepth(1)
    .setOrigin(0.5, 0.5)
    .setVisible(true)
    .setStroke('#de77ae', 8); 
    this.input.once(
      "pointerdown", function (pointer) {
        text.destroy()
        this.physics.resume()
        this.scale.startFullScreen()
        this.newGame()
      }, this
    );    
  }

  newGame() {
    this.enemyCount = 0;
    this.scoreLabel.value = 0;
    this.updateUi();
    this.animations.clear(true, true);
    this.enemies.clear(true, true);

    // reset game objects to reflect level 1
    this.level = 1;
    this.levelUp();
  }

  checkWin() {
    if (this.beatLevel()) {
      this.level += 1;
      this.enemyCount = 0;
      this.levelUp();
    }
  }

  checkLose() {
    if (this.isDead()) {
      this.die();
    }
  }

  beatLevel() {
    return this.enemies.children.size === 0;
  }

  levelUp() {
    //console.log("Congratulations on level " + this.level);
    this.enabled = false

    this.levelNumber.setText('' + this.level)
    this.levelNumber.setVisible(true)
    this.createLevelAnimation();

    this.updateVelocity();

    this.updateNumberOfEnemies();

    this.updateHitPoints();

    this.updateEnemyDelay();

    this.updateReticle();

    this.levelLabel.setLabel(this.level);
  }

  private updateReticle() {
    let calculatedReticleRadius =
      this.magic_initial_reticle_radius +
      this.magic_per_level_reticle_radius * this.level -
      1;
    this.reticle_radius = calculatedReticleRadius;
    this.updateReticleTexture();
  }

  private updateEnemyDelay() {
    let calculatedEnemyDelay =
      this.magic_initial_enemy_delay +
      this.magic_per_level_enemy_delay * (this.level - 1);
    this.enemy_delay = Math.max(
      this.magic_minimum_enemy_delay, calculatedEnemyDelay
    );
  }

  private updateHitPoints() {
    this.hit_points =
      this.magic_initial_hit_points + this.triangleNumber(this.level);
    this.healthLabel.setLabel(this.hit_points);
  }

  private updateNumberOfEnemies() {
    this.number_of_enemies =
      this.magic_initial_number_of_enemies +
      this.magic_per_level_number_of_enemies * (this.level - 1);
  }

  private updateVelocity() {
    let calculatedVelocityMultiplier =
      this.magic_initial_velocity_multiplier +
      this.magic_per_level_velocity_multiplier * (this.level - 1);
    this.velocity_multiplier = Math.min(
      this.magic_maximum_velocity_multiplier, calculatedVelocityMultiplier
    );
  }

  // TODO: Pooling
  // TODO: Move to enemy class
  addEnemy() {
    if (!this.enabled ||
      //this.enemies.children.size >= this.magic_maximum_number_of_enemies ||
      this.enemyCount > this.number_of_enemies
    ) {
      return;
    }

    //let enemy = this.enemies.get(Phaser.Math.Between(-64, 864), Phaser.Math.Between(-64, 0))
    let enemy = this.physics.add.sprite(
      Phaser.Math.Between(-64, 864), Phaser.Math.Between(-64, 0), "enemy"
    );
    //if (!enemy) return // None free
    this.enemyCount += 1;
    this.enemies.add(enemy);
    this.activateEnemy(enemy);
  }

  // TODO: Move to enemy class
  activateEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    enemy
      .setActive(true)
      .setVisible(true)
      .setScale(0.5);
    let v = this.subtract(this.player.getCenter(), enemy.getCenter());
    v.normalize();
    enemy.setVelocityX(v.x * this.velocity_multiplier);
    enemy.setVelocityY(v.y * this.velocity_multiplier);
    enemy.setDebug(false, false, 0);
  }

  // top edge: -100, 900 -100, -50
  // bottom edge: -100, 900 650, 700
  // left: -100, 50 -100, 700
  // right: 850, 900 -100, 700

  updateUi() {
    this.scoreLabel.update();
    this.healthLabel.update();
    this.levelLabel.update();
  }

  // TODO: Move to utility class or find the actual function in phaser to do this
  subtract(
    a: Phaser.Geom.Point, b: Phaser.Geom.Point, out?: Phaser.Math.Vector2
  ): Phaser.Math.Vector2 {
    if (typeof out === "undefined") {
      out = new Phaser.Math.Vector2();
    }
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    return out;
  }

  update(time, delta) {
    this.updateUi();
    //this.reticleCollider.active = false;
  }

  // RETICLE
  createReticle() {
    let texture = this.generateReticleTexture();
    this.reticle = this.physics.add.image(-100, -100, texture);
    this.reticle.setDebug(false, false, 0xffff00);
    this.reticleCollider = this.physics.add.overlap(
      this.reticle, this.enemies, this.onZwat, null, this
    );
  }

  generateReticleTexture() {
    let r = this.reticle_radius;
    let name = "reticle" + r;
    let color = 0xffff00;
    let thickness = 2;
    let alpha = 1.0;
    let graphics = this.make
      .graphics({ x: 0, y: 0, add: false })
      .lineStyle(thickness, color, alpha)
      .strokeCircle(r, r, r)
      .generateTexture(name, r * 2, r * 2);
    graphics.destroy();
    return name;
  }

  updateReticleTexture() {
    this.reticle.setCircle(this.reticle_radius);
    let texture = this.generateReticleTexture();
    this.reticle.setTexture(texture);
  }

  triangleNumber(n: number) {
    // equivalent to 1 + 2 + ... + n = n(n + 1)/2
    // for n = 5 returns 15
    // 5 + 4 + 3 + 2 + 1 = 15
    // 5 * (5 + 1) / 2 = 15
    return n * (n + 1) * 0.5;
  }

}
