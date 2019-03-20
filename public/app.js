(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("components/label/label.ts", function(exports, require, module) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(scene, x, y, font, text, size, align) {
        var _this = _super.call(this, scene, x, y, font, text, size, align) || this;
        _this.value = 0;
        _this.buffer = 0;
        _this.step = 1;
        _this.throttle = false;
        _this.countUp = true;
        _this.prefix = '';
        return _this;
    }
    Label.prototype.setLabel = function (n) {
        var adjustment = n - this.value;
        this.buffer = this.countUp ? adjustment : -adjustment;
        return this.update();
    };
    Label.prototype.increase = function (n) {
        this.buffer += n;
    };
    Label.prototype.update = function () {
        this.setStep(this.buffer);
        this.consumeBuffer();
        this.text = this.value.toString();
        return this.countUp ? this.value + this.buffer : this.value - this.buffer;
    };
    Label.prototype.setStep = function (buffer) {
        this.step = this.throttle ? this.rateOfChange(buffer) : 1;
    };
    // what would you call it?
    Label.prototype.consumeBuffer = function () {
        // step will be 0 if buffer is zero
        var step = Math.min(this.buffer, this.step);
        this.buffer -= step;
        if (this.countUp) {
            this.value += step;
        }
        else {
            this.value -= step;
        }
    };
    // this is ugly, I'm sure there's a better way
    // int('999999999999' take log10(n) digits?)
    Label.prototype.rateOfChange = function (n) {
        if (n > 1000000) {
            return 999999;
        }
        else if (n > 100000) {
            return 99999;
        }
        else if (n > 10000) {
            return 9999;
        }
        else if (n > 1000) {
            return 999;
        }
        else if (n > 100) {
            return 99;
        }
        else if (n > 10) {
            return 9;
        }
        return 1;
    };
    return Label;
}(Phaser.GameObjects.BitmapText));
exports.default = Label;
//# sourceMappingURL=label.js.map

});

;require.register("enemy/enemy.ts", function(exports, require, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enemy = /** @class */ (function () {
    function enemy() {
    }
    return enemy;
}());
exports.default = enemy;
//# sourceMappingURL=enemy.js.map

});

;require.register("initialize.ts", function(exports, require, module) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var game_1 = require("./scenes/game");
var game = new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [game_1.default],
});
//# sourceMappingURL=initialize.js.map

});

;require.register("scenes/game.ts", function(exports, require, module) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var label_1 = require("../components/label/label");
var GameScene = /** @class */ (function (_super) {
    __extends(GameScene, _super);
    function GameScene() {
        var _this = _super.call(this, { key: "gameScene", active: true }) || this;
        _this.enemyCount = 0;
        _this.level = 1;
        _this.font = "consolasBold";
        _this.levelNumberFont = 'clarendon';
        _this.enabled = false;
        /*
         * magic numbers
         * Warning, poor programming practices ahead.
         */
        // Velocity
        _this.magic_initial_velocity_multiplier = 70;
        _this.magic_per_level_velocity_multiplier = 15;
        _this.magic_maximum_velocity_multiplier = 500;
        // Enemies
        _this.magic_initial_number_of_enemies = 5;
        _this.magic_per_level_number_of_enemies = 3;
        _this.magic_maximum_number_of_enemies = 100;
        // Enemy Delay
        _this.magic_initial_enemy_delay = 250;
        _this.magic_per_level_enemy_delay = -5;
        _this.magic_minimum_enemy_delay = 25;
        // Level Delay
        _this.magic_level_delay = 2000;
        // Reticle
        _this.magic_initial_reticle_radius = 10;
        _this.magic_per_level_reticle_radius = 2;
        // Hit Points
        _this.magic_initial_hit_points = 1;
        _this.magic_per_level_hit_points = 2;
        // Experience
        _this.magic_experience_per_enemy_multiplier = 10;
        _this.velocity_multiplier = _this.magic_initial_velocity_multiplier;
        _this.number_of_enemies = _this.magic_initial_number_of_enemies;
        _this.reticle_radius = _this.magic_initial_reticle_radius;
        _this.hit_points = _this.magic_initial_hit_points;
        _this.enemy_delay = _this.magic_initial_enemy_delay;
        return _this;
    }
    GameScene.prototype.preload = function () {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        var loadingText = this.make.text({
            x: this.centerX, y: this.centerY - 50, text: "Loading...", style: {
                font: "20px monospace", fill: "#ffffff"
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        var percentText = this.make.text({
            x: this.centerX, y: this.centerY - 5, text: "0%", style: {
                font: "18px monospace", fill: "#ffffff"
            }
        });
        percentText.setOrigin(0.5, 0.5);
        var assetText = this.make.text({
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
        this.load.atlas("explosion", "assets/particles/explosion.png", "assets/particles/explosion.json");
        this.load.bitmapFont("clarendon", "assets/fonts/bitmap/clarendon.png", "assets/fonts/bitmap/clarendon.xml");
        this.load.bitmapFont("consolasBold", "assets/fonts/consolasBold_0.png", "assets/fonts/consolasBold.fnt");
    };
    // init(data) {
    //   console.debug("init", data, this);
    // }
    GameScene.prototype.create = function () {
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
        this.healthLabel = this.createLabel(this.healthLabel, 50, 10, this.font, 0, 0.5, false, false).setDepth(1);
        this.scoreLabel = this.createLabel(this.scoreLabel, 790, 10, this.font, 1, 0.5, true, true).setDepth(1);
        this.levelLabel = this.createLabel(this.levelLabel, 360, 10, this.font, 0.5, 0.5, false, true).setDepth(1);
        this.levelNumber = this.add.bitmapText(this.centerX, this.centerY, this.levelNumberFont, '1')
            .setOrigin(0.5, 0.5)
            .setDepth(1);
        this.waitForClick('Click to Begin');
        // time delay for enemies
        this.time.addEvent({
            delay: this.enemy_delay, loop: true, callback: this.addEnemy, callbackScope: this
        });
        // triggers the onCollision handler
        this.physics.add.collider(this.player, this.enemies, this.onCollision, null, this);
        this.createExplosion();
        var config = {
            key: 'castAnimation',
            frames: this.anims.generateFrameNumbers('mage', { start: 0, end: 3 }),
            frameRate: 20,
            repeat: 0
        };
        this.anims.create(config);
        this.input.on("pointerdown", function (pointer) {
            this.explosion.emitParticleAt(pointer.x, pointer.y);
            this.reticle.x = pointer.x;
            this.reticle.y = pointer.y;
            this.reticleCollider.active = true;
            this.createFadeAnimation(this.reticle);
            this.player.play('castAnimation');
        }, this);
    };
    GameScene.prototype.createExplosion = function () {
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
    };
    GameScene.prototype.createLabel = function (label, x, y, font, originX, originY, throttle, countUp) {
        label = new label_1.default(this, x, y, font)
            .setOrigin(originX, originY)
            .setVisible(true);
        this.add.existing(label);
        label.throttle = throttle;
        label.countUp = countUp;
        return label;
    };
    GameScene.prototype.createFloatAnimation = function (x, y, message, tint, parent) {
        var animation = this.add.bitmapText(x, y, this.font, message).setTint(tint);
        parent.add(animation);
        var tween = this.add.tween({
            targets: animation, duration: 750, ease: "Exponential.In", y: y - 50,
            onComplete: function () {
                animation.destroy();
            }, callbackScope: this
        });
    };
    GameScene.prototype.createFadeAnimation = function (gameObject) {
        var _this = this;
        var tween = this.add.tween({
            targets: gameObject, duration: 100, ease: "Linear", alpha: { getStart: function () { return 0.5; }, getEnd: function () { return 0; } }, onComplete: function () {
                _this.reticleCollider.active = false;
            }, callbackScope: this
        });
    };
    GameScene.prototype.createLevelAnimation = function () {
        var _this = this;
        var tween = this.add.tween({
            targets: this.levelNumber,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 500,
            hold: 250,
            yoyo: true,
            repeat: 0,
            ease: 'Quad.easeInOut',
            onComplete: function () {
                _this.enabled = true;
                _this.levelNumber.visible = false;
            },
            callbackScope: this,
            onYoyocallbackScope: this
        });
    };
    GameScene.prototype.onCollision = function (gameObject, enemy) {
        enemy.destroy();
        var damage = Math.round(this.level / 2);
        this.createFloatAnimation(enemy.x, enemy.y, "-" + damage, 0xff3333, this.animations);
        this.healthLabel.increase(damage);
        this.checkWinLose();
    };
    GameScene.prototype.onZwat = function (gameObject, enemy) {
        var score = this.level * this.magic_experience_per_enemy_multiplier;
        this.scoreLabel.increase(score);
        this.createFloatAnimation(enemy.x, enemy.y, "+" + score, 0xffff00, this.animations);
        enemy.destroy();
        this.updateUi();
        this.checkWinLose();
    };
    GameScene.prototype.checkWinLose = function () {
        this.checkWin();
        this.checkLose();
    };
    GameScene.prototype.isDead = function () {
        return this.healthLabel.value <= 0;
    };
    GameScene.prototype.die = function () {
        console.log("Alas, you have expired.");
        this.waitForClick();
    };
    GameScene.prototype.waitForClick = function (message) {
        if (message === void 0) { message = 'GAME\nOVER'; }
        this.physics.pause();
        var text = this.add.text(this.centerX, this.centerY, message, { fontFamily: 'Impact', color: '#ffffff', align: 'center', fontSize: '128px' });
        text
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .setVisible(true)
            .setStroke('#de77ae', 8);
        this.input.once("pointerdown", function (pointer) {
            text.destroy();
            this.physics.resume();
            this.newGame();
        }, this);
    };
    GameScene.prototype.newGame = function () {
        this.enemyCount = 0;
        this.scoreLabel.value = 0;
        this.updateUi();
        this.animations.clear(true, true);
        this.enemies.clear(true, true);
        // reset game objects to reflect level 1
        this.level = 1;
        this.levelUp();
    };
    GameScene.prototype.checkWin = function () {
        if (this.beatLevel()) {
            this.level += 1;
            this.enemyCount = 0;
            this.levelUp();
        }
    };
    GameScene.prototype.checkLose = function () {
        if (this.isDead()) {
            this.die();
        }
    };
    GameScene.prototype.beatLevel = function () {
        return this.enemies.children.size === 0;
    };
    GameScene.prototype.levelUp = function () {
        //console.log("Congratulations on level " + this.level);
        this.enabled = false;
        this.levelNumber.setText('' + this.level);
        this.levelNumber.setVisible(true);
        this.createLevelAnimation();
        this.updateVelocity();
        this.updateNumberOfEnemies();
        this.updateHitPoints();
        this.updateEnemyDelay();
        this.updateReticle();
        this.levelLabel.setLabel(this.level);
    };
    GameScene.prototype.updateReticle = function () {
        var calculatedReticleRadius = this.magic_initial_reticle_radius +
            this.magic_per_level_reticle_radius * this.level -
            1;
        this.reticle_radius = calculatedReticleRadius;
        this.updateReticleTexture();
    };
    GameScene.prototype.updateEnemyDelay = function () {
        var calculatedEnemyDelay = this.magic_initial_enemy_delay +
            this.magic_per_level_enemy_delay * (this.level - 1);
        this.enemy_delay = Math.max(this.magic_minimum_enemy_delay, calculatedEnemyDelay);
    };
    GameScene.prototype.updateHitPoints = function () {
        this.hit_points =
            this.magic_initial_hit_points + this.triangleNumber(this.level);
        this.healthLabel.setLabel(this.hit_points);
    };
    GameScene.prototype.updateNumberOfEnemies = function () {
        this.number_of_enemies =
            this.magic_initial_number_of_enemies +
                this.magic_per_level_number_of_enemies * (this.level - 1);
    };
    GameScene.prototype.updateVelocity = function () {
        var calculatedVelocityMultiplier = this.magic_initial_velocity_multiplier +
            this.magic_per_level_velocity_multiplier * (this.level - 1);
        this.velocity_multiplier = Math.min(this.magic_maximum_velocity_multiplier, calculatedVelocityMultiplier);
    };
    // TODO: Pooling
    // TODO: Move to enemy class
    GameScene.prototype.addEnemy = function () {
        if (!this.enabled ||
            //this.enemies.children.size >= this.magic_maximum_number_of_enemies ||
            this.enemyCount > this.number_of_enemies) {
            return;
        }
        //let enemy = this.enemies.get(Phaser.Math.Between(-64, 864), Phaser.Math.Between(-64, 0))
        var enemy = this.physics.add.sprite(Phaser.Math.Between(-64, 864), Phaser.Math.Between(-64, 0), "enemy");
        //if (!enemy) return // None free
        this.enemyCount += 1;
        this.enemies.add(enemy);
        this.activateEnemy(enemy);
    };
    // TODO: Move to enemy class
    GameScene.prototype.activateEnemy = function (enemy) {
        enemy
            .setActive(true)
            .setVisible(true)
            .setScale(0.5);
        var v = this.subtract(this.player.getCenter(), enemy.getCenter());
        v.normalize();
        enemy.setVelocityX(v.x * this.velocity_multiplier);
        enemy.setVelocityY(v.y * this.velocity_multiplier);
        enemy.setDebug(false, false, 0);
    };
    // top edge: -100, 900 -100, -50
    // bottom edge: -100, 900 650, 700
    // left: -100, 50 -100, 700
    // right: 850, 900 -100, 700
    GameScene.prototype.updateUi = function () {
        this.scoreLabel.update();
        this.healthLabel.update();
        this.levelLabel.update();
    };
    // TODO: Move to utility class or find the actual function in phaser to do this
    GameScene.prototype.subtract = function (a, b, out) {
        if (typeof out === "undefined") {
            out = new Phaser.Math.Vector2();
        }
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        return out;
    };
    GameScene.prototype.update = function (time, delta) {
        this.updateUi();
        //this.reticleCollider.active = false;
    };
    // RETICLE
    GameScene.prototype.createReticle = function () {
        var texture = this.generateReticleTexture();
        this.reticle = this.physics.add.image(-100, -100, texture);
        this.reticle.setDebug(false, false, 0xffff00);
        this.reticleCollider = this.physics.add.overlap(this.reticle, this.enemies, this.onZwat, null, this);
    };
    GameScene.prototype.generateReticleTexture = function () {
        var r = this.reticle_radius;
        var name = "reticle" + r;
        var color = 0xffff00;
        var thickness = 2;
        var alpha = 1.0;
        var graphics = this.make
            .graphics({ x: 0, y: 0, add: false })
            .lineStyle(thickness, color, alpha)
            .strokeCircle(r, r, r)
            .generateTexture(name, r * 2, r * 2);
        graphics.destroy();
        return name;
    };
    GameScene.prototype.updateReticleTexture = function () {
        this.reticle.setCircle(this.reticle_radius);
        var texture = this.generateReticleTexture();
        this.reticle.setTexture(texture);
    };
    GameScene.prototype.triangleNumber = function (n) {
        // equivalent to 1 + 2 + ... + n = n(n + 1)/2
        // for n = 5 returns 15
        // 5 + 4 + 3 + 2 + 1 = 15
        // 5 * (5 + 1) / 2 = 15
        return n * (n + 1) * 0.5;
    };
    return GameScene;
}(Phaser.Scene));
exports.default = GameScene;
//# sourceMappingURL=game.js.map

});

;require.register("scenes/loading.ts", function(exports, require, module) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var LoadingScene = /** @class */ (function (_super) {
    __extends(LoadingScene, _super);
    function LoadingScene() {
        var _this = _super.call(this, { key: 'loadingscene', active: true }) || this;
        _this.progressBar = null;
        return _this;
    }
    LoadingScene.prototype.init = function (data) {
        console.debug('init', data, this);
    };
    LoadingScene.prototype.preload = function () {
        // this.load.image('sky', 'space3.png');
        // this.load.image('logo', 'phaser3-logo.png');
        this.progressBar = this.add.graphics();
        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.load.spritesheet("mage", "assets/mage.png", {
            frameWidth: 60,
            frameHeight: 60
        });
        this.load.spritesheet("enemy", "assets/floating_thing.png", {
            frameWidth: 45,
            frameHeight: 72
        });
        this.load.atlas("explosion", "assets/particles/explosion.png", "assets/particles/explosion.json");
        this.load.bitmapFont("clarendon", "assets/fonts/bitmap/clarendon.png", "assets/fonts/bitmap/clarendon.xml");
        this.load.bitmapFont("consolasBold", "assets/fonts/consolasBold_0.png", "assets/fonts/consolasBold.fnt");
    };
    // create () {
    //   const sky = this.add.image(400, 300, 'sky');
    //   sky.alpha = 0.5;
    // }
    LoadingScene.prototype.onLoadComplete = function (loader, totalComplete, totalFailed) {
        console.debug('complete', totalComplete);
        console.debug('failed', totalFailed);
        this.progressBar.destroy();
        this.scene.start('GameScene');
    };
    LoadingScene.prototype.onLoadProgress = function (progress) {
        console.debug('progress', progress);
        this.progressBar
            .clear()
            .fillStyle(0xaaffaa, 0.75)
            .fillRect(0, 0, 800 * progress, 50);
    };
    return LoadingScene;
}(Phaser.Scene));
exports.default = LoadingScene;
;
//# sourceMappingURL=loading.js.map

});

;require.register("scenes/reticle.ts", function(exports, require, module) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var ReticleScene = /** @class */ (function (_super) {
    __extends(ReticleScene, _super);
    function ReticleScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReticleScene.prototype.preload = function () {
        this.load.spritesheet('reticle', 'assets/floating_thing.png', { frameWidth: 45, frameHeight: 72 });
    };
    ReticleScene.prototype.create = function () {
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
    };
    return ReticleScene;
}(Phaser.Scene));
exports.default = ReticleScene;
//# sourceMappingURL=reticle.js.map

});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('initialize');
//# sourceMappingURL=app.js.map