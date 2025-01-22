import { Game, GameObjects } from 'phaser';
import GameManager from '../GameManager';

//this is well outside the scope of the scene so that our custom player action methods can access it.
let player1: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined = undefined;
let player2: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined = undefined;
let tealLasers: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
let pinkLasers: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
let pinkMeteors: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
let tealMeteors: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
const laserCoolDownMax: number = 30
let pinkLaserCoolDown: number = laserCoolDownMax;
let tealLaserCoolDown: number = laserCoolDownMax;
const friction: number = 12;
let rightLimit: number = 0; //1300
let leftLimit: number = 0; //200
const moveSpeed: number = 300;
const winningMeteorCount: number = 3
const losingCollisionCount: number = 2;
let stopGame: boolean = false;

export default class ShootIncomingBaddies extends GameManager {
    constructor() {
        super('ShootIncomingBaddies');
      }

      titleTimer: number = 0;
      meteorSpeed: number = 150;
      gameEndTimer: number = 0;
      possiblePinkMeteors: string[] = ['meteorPink01', 'meteorPink02'];
      possibleTealMeteors: string[] = ['meteorTeal01', 'meteorTeal02'];
      allMeteors: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
      allPlayers: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
      allLasers: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
      p1MeteorsDestroyed: number = 0;
      p2MeteorsDestroyed: number = 0;
      p1Collisions: number = 0;
      p2Collisions: number = 0;
      pinkEmitter: GameObjects.Particles.ParticleEmitter;
      tealEmitter: GameObjects.Particles.ParticleEmitter;
      startTime: Date = new Date(Date.now());

      pinkColor = new Phaser.Display.Color(242, 166, 190);
      tealColor = new Phaser.Display.Color(111, 196, 169);

      preload() {

        //these are defined outside the functions of this class, so need to be reset on start because
        //phaser doesnt know they exist, and if we restart this scene they will have the same values as when we 
        //last ended it. i think we can fix this by making these constructor variables... or destroying the scene?
        this.titleTimer = 0;
        this.gameEndTimer = 0;
        stopGame = false;
        leftLimit = 200
        rightLimit = window.innerWidth-200;
        this.startTime = new Date(Date.now());
        
        this.scrambleControls();
        this.changeBackgroundColor('#363764');
        this.setMashFlash(false);
        console.log('were in ShootIncomingBaddies');

        this.load.image('meteorPink01', 'src/assets/images/shootIncomingBaddies/meteor_pink_01.png');
        this.load.image('meteorPink02', 'src/assets/images/shootIncomingBaddies/meteor_pink_02.png');
        this.load.image('meteorTeal01', 'src/assets/images/shootIncomingBaddies/meteor_teal_01.png');
        this.load.image('meteorTeal02', 'src/assets/images/shootIncomingBaddies/meteor_teal_02.png');

        this.load.image('tealLaser', 'src/assets/images/shootIncomingBaddies/tealLaser.png');
        this.load.image('pinkLaser', 'src/assets/images/shootIncomingBaddies/pinkLaser.png');

        this.load.image('pinkPart', 'src/assets/images/shootIncomingBaddies/pink_particle.png');
        this.load.image('tealPart', 'src/assets/images/shootIncomingBaddies/teal_particle.png');

        this.load.spritesheet('player_movement', 'src/assets/images/shootIncomingBaddies/player_movement_sprites.png', 
            {
                frameWidth: 32,
                frameHeight: 32,
            });
        
        // music
        this.load.audio('anotherworld',
            [
                'src/assets/sounds/Another World.wav',
            ]
        );

        super.preload();
        
      }

      launchMeteor() {
        // find the meteors we'll be launching.
        const tealToLaunch = tealMeteors.filter((meteor) => {
            return meteor.data.list.ready === true;
        })[0];
        const pinkToLaunch = pinkMeteors.filter((meteor) => {
            return meteor.data.list.ready === true;
        })[0];
        pinkToLaunch.setData('ready', false);
        tealToLaunch.setData('ready', false);

        pinkToLaunch.setX((Math.random() * rightLimit)+leftLimit);
        pinkToLaunch.setY(-100);
        pinkToLaunch.setVelocityY(this.meteorSpeed);

        tealToLaunch.setX((Math.random() * rightLimit)+leftLimit);
        tealToLaunch.setY(-100);
        tealToLaunch.setVelocityY(this.meteorSpeed);
      }

      create() {
        this.sound.stopAll();
        const anotherworld = this.sound.add('anotherworld', {loop: true, volume: 1});
        anotherworld.play();

        //reset these every time the game is created again.
        this.p1MeteorsDestroyed = 0;
        this.p2MeteorsDestroyed = 0;
        this.p1Collisions = 0;
        this.p2Collisions = 0;
        this.framesSinceLastUpdate = 0;

        // PLAYER 1 --------------------TEAL--------------------------------
        player1 = this.physics.add.sprite(window.innerWidth/3,850, 'player_movement'); // TEAL
        player1.setDataEnabled();
        player1.setData('name', 'teal');
        player1.setScale(4);
        const p1_idle = {
            key: 'p1_idle',
            defaultTextureKey: "player_movement",
            duration: 1,
            frames: [
                { frame: 0, duration: 1000},
            ],
            repeat: -1,
        };
        const p1_right = {
            key: 'p1_right',
            defaultTextureKey: "player_movement",
            duration: 1,
            frames: [
                { frame: 10, duration: 1000},
            ],
            repeat: -1,
        };
        const p1_left = {
            key: 'p1_left',
            defaultTextureKey: "player_movement",
            duration: 1,
            frames: [
                { frame: 5, duration: 1000},
            ],
            repeat: -1,
        };
        this.anims.create(p1_idle);
        this.anims.create(p1_left);
        this.anims.create(p1_right);

        // TEAL LASERS 
        const p1Laser_01 = this.physics.add.image(rightLimit + 1000, 1300, 'tealLaser').setDataEnabled().setData('color', 'teal').setData('ready', true).setBodySize(80,50);
        const p1Laser_02 = this.physics.add.image(rightLimit + 1000, 1300, 'tealLaser').setDataEnabled().setData('color', 'teal').setData('ready', true).setBodySize(80,50);
        const p1Laser_03 = this.physics.add.image(rightLimit + 1000, 1300, 'tealLaser').setDataEnabled().setData('color', 'teal').setData('ready', true).setBodySize(80,50);
        tealLasers = [p1Laser_01, p1Laser_02, p1Laser_03];

        // TEAL METEORS
        const p1Meteor_01 = this.physics.add.image(leftLimit-1000,-100, this.possibleTealMeteors[0])
        .setDataEnabled()
        .setData('color', 'teal')
        .setData('ready', true)
        .setBodySize(30,30);
        const p1Meteor_02 = this.physics.add.image(leftLimit-1000,-100, this.possibleTealMeteors[0])
        .setDataEnabled()
        .setData('color', 'teal')
        .setData('ready', true)
        .setBodySize(30,30);
        const p1Meteor_03 = this.physics.add.image(leftLimit-1000,-100, this.possibleTealMeteors[1])
        .setDataEnabled()
        .setData('color', 'teal')
        .setData('ready', true)
        .setBodySize(30,30);
        const p1Meteor_04 = this.physics.add.image(leftLimit-1000,-100, this.possibleTealMeteors[1])
        .setDataEnabled()
        .setData('color', 'teal')
        .setData('ready', true)
        .setBodySize(30,30);
        tealMeteors = [p1Meteor_01, p1Meteor_02, p1Meteor_03, p1Meteor_04];


        // PLAYER 2 ----------------------- PINK -------------------------------
        player2 = this.physics.add.sprite(window.innerWidth-window.innerWidth/3,850, 'player_movement'); // PINK
        player2.setDataEnabled();
        player2.data.set('name','pink')
        player2.setScale(4);
        const p2_idle = {
            key: 'p2_idle',
            defaultTextureKey: "player_movement",
            duration: 1,
            frames: [
                { frame: 15, duration: 1000},
            ],
            repeat: -1,
        };
        const p2_right = {
            key: 'p2_right',
            defaultTextureKey: "player_movement",
            duration: 1,
            frames: [
                { frame: 25, duration: 1000},
            ],
            repeat: -1,
        };
        const p2_left = {
            key: 'p2_left',
            defaultTextureKey: "player_movement",
            duration: 1,
            frames: [
                { frame: 20, duration: 1000},
            ],
            repeat: -1,
        };
        this.anims.create(p2_idle);
        this.anims.create(p2_left);
        this.anims.create(p2_right);
        
        // PINK LASERS
        const p2Laser_01 = this.physics.add.image(rightLimit + 1000, 1300, 'pinkLaser').setDataEnabled().setData('color', 'pink').setData('ready', true).setBodySize(80,50);
        const p2Laser_02 = this.physics.add.image(rightLimit + 1000, 1300, 'pinkLaser').setDataEnabled().setData('color', 'pink').setData('ready', true).setBodySize(80,50);
        const p2Laser_03 = this.physics.add.image(rightLimit + 1000, 1300, 'pinkLaser').setDataEnabled().setData('color', 'pink').setData('ready', true).setBodySize(80,50);
        pinkLasers = [p2Laser_01, p2Laser_02, p2Laser_03];

        // PINK METEORS
        const p2Meteor_01 = this.physics.add.image(leftLimit-1000,-100, this.possiblePinkMeteors[0])
        .setDataEnabled()
        .setData('color', 'pink')
        .setData('ready', true)
        .setBodySize(30,30);
        const p2Meteor_02 = this.physics.add.image(leftLimit-1000,-100, this.possiblePinkMeteors[0])
        .setDataEnabled()
        .setData('color', 'pink')
        .setData('ready', true)
        .setBodySize(30,30);
        const p2Meteor_03 = this.physics.add.image(leftLimit-1000,-100, this.possiblePinkMeteors[1])
        .setDataEnabled()
        .setData('color', 'pink')
        .setData('ready', true)
        .setBodySize(30,30);
        const p2Meteor_04 = this.physics.add.image(leftLimit-1000,-100, this.possiblePinkMeteors[1])
        .setDataEnabled()
        .setData('color', 'pink')
        .setData('ready', true)
        .setBodySize(30,30);
        pinkMeteors = [p2Meteor_01, p2Meteor_02, p2Meteor_03, p2Meteor_04];

        this.allLasers = [p2Laser_01, p2Laser_02, p2Laser_03, p1Laser_01, p1Laser_02, p1Laser_03];
        this.allMeteors = [p2Meteor_01, p2Meteor_02, p2Meteor_03, p2Meteor_04, p1Meteor_01, p1Meteor_02, p1Meteor_03, p1Meteor_04] 
        this.allPlayers = [player1, player2];

        const meteorCreationTimer = this.time.addEvent({delay: 3000, callback: () => {
            if(!stopGame) {
                this.launchMeteor()
            }
        }, callbackScope: this, loop: true});
        

        super.create();

        const titleTimerEvent = this.time.addEvent({delay: 400, callback:() => { 
            this.titleTimer++;
            if(this.titleTimer === 1) {
                //play noise
                this.add.text(150,20, "DESTROY", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 2) {
                this.add.text(550,20, "THREE", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 3) {
                this.add.text(850,20, "OF", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 4) {
                this.add.text(1000,20, "YOUR", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 5) {
                this.add.text(1250,20, "METEORS", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 6) {
                this.add.text(200,100, "DONT", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 7) {
                this.add.text(475,100, "LET", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 8) {
                this.add.text(700,100, "ANY", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 9) {
                this.add.text(1000,100, "HIT", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 10) {
                this.add.text(1250,100, "YOU", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 11) {
                stopGame = false;
                this.time.removeEvent(titleTimerEvent);
            }
        }, callbackScope: this, loop: true});
        
        const pinkParticles = this.add.particles('pinkPart');
        const tealParticles = this.add.particles('tealPart');

        this.pinkEmitter = pinkParticles.createEmitter({
            x: rightLimit + 1000,
            speed: 120,
            lifespan: 2000,
            scale: { start: .7, end: .7 },
            frequency: -1
          }).setVisible(false);
          this.tealEmitter = tealParticles.createEmitter({
            x: rightLimit + 1000,
            speed: 120,
            lifespan: 2000,
            scale: { start: .7, end: .7 },
            frequency: -1
          }).setVisible(false);

        this.physics.add.overlap(this.allMeteors, this.allPlayers, this.playerHit, undefined, this);
        this.physics.add.overlap(this.allMeteors, this.allLasers, this.meteorHit, undefined, this);

      }

      playerHit(meteor: any, player: any) {
        if(stopGame) {return null}
        console.log(player.data.list.name , 'got smashed!');
        this.cameras.main.shake(1000, 0.005);
        meteor.setX(leftLimit - 1000);
        meteor.setVelocityY(0);
        meteor.setY(-100);
        meteor.setData('ready', true);

        if(player.data.list.name === 'teal') {
            this.p1Collisions++;
            if(this.p1Collisions >= losingCollisionCount) {
                player.setVisible(false);
                this.tealEmitter?.explode(50,player.body.x+65,player.body.y+65);
                this.tealEmitter.setVisible(true);
                stopGame = true;
                this.playerWins(player2, player);
            }
            this.tealEmitter?.explode(10,player.body.x+65,player.body.y+65);
            this.tealEmitter.setVisible(true);
        }
        if(player.data.list.name === 'pink') {
            this.p2Collisions++;
            if(this.p2Collisions >= losingCollisionCount) {
                player.setVisible(false);
                this.pinkEmitter?.explode(50,player.body.x+65,player.body.y+65);
                this.pinkEmitter.setVisible(true);
                stopGame = true;
                this.playerWins(player1, player);
            }
            this.pinkEmitter?.explode(10,player.body.x+65,player.body.y+65);
            this.pinkEmitter.setVisible(true);
        }
        this.tweens.add({
            targets: player,
            rotation: -0.3,
            duration: 300,
            repeat: 1,
            yoyo: true, 
        });
      }

      meteorHit(meteor: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, laser: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        if(stopGame) {return null}

        if(meteor.data.list.color === 'pink') {
            console.log('pink meteor destroyed!');
            this.p2MeteorsDestroyed++;
            this.cameras.main.shake(70, 0.003);
            const hitText = this.add.text(meteor.body.x+50, meteor.body.y-100, `${this.p2MeteorsDestroyed}`,
                {fontSize: '80px', color: '#ff5050', stroke: '#cccccc', strokeThickness: 5}
            ).setOrigin(0.5, 0.5);
            const hitTextTimer = this.time.addEvent({delay: this.p2MeteorsDestroyed >= winningMeteorCount ? 4000 : 600, callback: () => {
                hitText.destroy();
            }, callbackScope: this, loop: false});
            this.pinkEmitter?.explode(10,meteor.body.x+65,meteor.body.y+65);
            this.pinkEmitter.setVisible(true);

            if(this.p2MeteorsDestroyed === winningMeteorCount) {
                stopGame = true;
                this.playerWins(player2, hitText);
            }
        } else if(meteor.data.list.color === 'teal') {
            console.log('teal meteor destroyed!');
            this.cameras.main.shake(70, 0.003);
            this.p1MeteorsDestroyed++;
            const hitText = this.add.text(meteor.body.x+50, meteor.body.y-100, `${this.p1MeteorsDestroyed}`,
                {fontSize: '80px', color: '#50ff50', stroke: '#cccccc', strokeThickness: 5}
            ).setOrigin(0.5, 0.5);
            const hitTextTimer = this.time.addEvent({delay: this.p1MeteorsDestroyed >= winningMeteorCount ? 4000 : 600, callback: () => {
                hitText.destroy();
            }, callbackScope: this, loop: false});
            this.tealEmitter?.explode(10,meteor.body.x+65,meteor.body.y+65);
            this.tealEmitter.setVisible(true);

            if(this.p1MeteorsDestroyed === winningMeteorCount) {
                stopGame = true;
                this.playerWins(player1, hitText);
            }
        }
        laser.setX(rightLimit + 1000);
        laser.setVelocityY(0);
        laser.setData('ready', true);
        meteor.setX(leftLimit - 1000);
        meteor.setY(-100);
        meteor.setVelocityY(0);
        meteor.setData('ready', true);
      }

      recycleLasers() {
        if(stopGame) {return null}
        for(let i = 0; i < this.allLasers.length; i++) {
            if(this.allLasers[i].body.y < -20) {
                this.allLasers[i].setData('ready', true);
                this.allLasers[i].setX(rightLimit + 1000);
                this.allLasers[i].setVelocityY(0);
            }
        }
      }

      recycleMeteors() {
        if(stopGame) {return null}
        for(let i = 0; i < this.allMeteors.length; i++) {
            if(this.allMeteors[i].body.y > window.innerHeight + 100) {
                this.allMeteors[i].setData('ready', true);
                this.allMeteors[i].setX(leftLimit - 1000);
                this.allMeteors[i].setY(-100);
                this.allMeteors[i].setVelocityY(0);
            }
        }
      }

      update() {
        if(!stopGame) {
                this.applyFriction(player1);
                this.applyFriction(player2);
                this.recycleLasers();
                this.recycleMeteors();
                if(pinkLaserCoolDown > 0) {
                    pinkLaserCoolDown = pinkLaserCoolDown-1 ;
                }
                if(tealLaserCoolDown > 0) {
                    tealLaserCoolDown = tealLaserCoolDown-1;
                }

                player1?.anims.play('p1_idle');
                player2?.anims.play('p2_idle');
            }
        super.update();
      }
 
      applyFriction(player:  Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined) {
        //simulate friction slowing players down every frame and stopping them
        if(player?.body?.velocity?.x >= -1*(friction) && player?.body?.velocity?.x <= friction) {
            player?.setVelocityX(0);
        }
        if(player?.body?.velocity?.x > 0) {
            player?.setVelocityX(player.body.velocity.x - friction);
        }
        if(player?.body?.velocity?.x < 0) {
            player?.setVelocityX(player.body.velocity.x + friction);
        }
        if(player?.body?.velocity?.y >= -1*(friction) && player?.body?.velocity?.y <= friction) {
            player?.setVelocityY(0);
        }
        if(player?.body?.velocity?.y > 0) { 
            player?.setVelocityY(player.body.velocity.y - friction);
        }
        if(player?.body?.velocity?.y < 0) {
            player?.setVelocityY(player.body.velocity.y + friction);
        }
      }

 
      playerWins(winner: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, zoomObject: Phaser.GameObjects.GameObject) {
        //stop everything from moving
        for(let i = 0; i < this.allMeteors.length; i++) {
            if(this.allMeteors[i].active) {
                this.allMeteors[i].setVelocityY(0);
            }
        }
        for(let i = 0; i < this.allPlayers.length; i++) {
            this.allPlayers[i].setVelocityX(0);
        }
        for(let i = 0; i < this.allLasers.length; i++) {
            this.allLasers[i].setVelocityY(0);
        }

        // figure out winning color
        const winningColor = winner.data.list.name;
        let hexCode = '';
        if(winningColor === 'teal') {hexCode = this.tealColor.rgba}
        else if (winningColor === 'pink') {hexCode = this.pinkColor.rgba}

        const winnerText = this.add.text(winner.body.x+50, winner.body.y-100, `${winningColor.toUpperCase()} WINS!`,
            {fontSize: '100px', color: hexCode, stroke: '#cccccc', strokeThickness: 10}
        ).setOrigin(0.5, 0.5).setRotation(0.3);
        winnerText.setVisible(false);

        const winTimer = this.time.addEvent({delay: 1000, callback:() => {
            this.gameEndTimer++;
            if(this.gameEndTimer >= 1 && this.gameEndTimer < 4) {
                this.cameras.main.zoomTo(1.5,100); 
                this.cameras.main.startFollow(zoomObject);
            } else if (this.gameEndTimer >= 4 && this.gameEndTimer < 8) {
                this.cameras.main.startFollow(winner);
                winnerText.setVisible(true);
                this.tweens.add({
                    targets: winnerText,
                    rotation: -0.3,
                    duration: 500,
                    infinite: true,
                    yoyo: true, 
                });
            } else if (this.gameEndTimer === 8) {
                this.time.removeEvent(winTimer)
                const endTime = new Date(Date.now());
                super.addGamePlayed(
                    {
                        gameTitle: 'ShootIncomingBaddies',
                        winner: winningColor,
                        startTime: this.startTime,
                        endtime: endTime,
                        playTime: (endTime.getTime() - this.startTime.getTime()) / 1000
                    }
                );
                super.goToScene('GameScoreTrackerScreen');
            }

        }, callbackScope: this, loop: true});
      }


      // ----------------------------------------- OVER WRITTEN FUNCTIONS FROM GAME MANAGER -------------------------------------------
    // player 1 possible actions
    player1Up(this: this) {
        if(stopGame) {return null}

        console.log('incoming-P1U-P1R');
        // no up or down in left and right shoot game.
        if(player1?.body?.x < rightLimit) {
            player1?.setVelocityX(moveSpeed);
            player1?.anims.play('p1_right');
            // this.game.anims.play('p1_right', player1);
        }
    }
    player1Right() {
        if(stopGame) {return null}

        console.log('incoming-P1R');
        if(player1?.body?.x < rightLimit) {
            player1?.setVelocityX(moveSpeed);
            player1?.anims.play('p1_right');
        }
    }
    player1Left(this: this) {
        if(stopGame) {return null}

        console.log('incoming-P1L');
        if(player1?.body?.x > leftLimit) {
            player1?.setVelocityX(-1*(moveSpeed));
            player1?.anims.play('p1_left');
        }
    }
    player1Down(this: this) {
        if(stopGame) {return null}

        // no up or down in left and right shoot game.
        console.log('incoming-P1D-P1L');
        if(player1?.body?.x > leftLimit) {
            player1?.setVelocityX(-1*(moveSpeed));
            player1?.anims.play('p1_left');
        }

    }
    player1A() {
        if(stopGame) {return null}
        //find the first ready laser
        const laserToShoot = tealLasers.filter((laser) => {
            return laser.data.list.ready;
        })[0];
        //if we have a laser, and the cooldown on shooting is done.
        if(laserToShoot && tealLaserCoolDown <= 0) {
            //set the cooldown back to its max
            tealLaserCoolDown = laserCoolDownMax;
            laserToShoot.setData('ready', false);
            laserToShoot.setX(player1?.body?.x + 65);
            laserToShoot.setY(850);
            laserToShoot.setVelocityY(-600);
        }

        console.log('incoming-P1A');
    }
    player1B() {
        if(stopGame) {return null}
        const laserToShoot = tealLasers.filter((laser) => {
            return laser.data.list.ready;
        })[0];
        if(laserToShoot && tealLaserCoolDown <= 0) {
            tealLaserCoolDown = laserCoolDownMax;
            laserToShoot.setData('ready', false);
            laserToShoot.setX(player1?.body?.x + 65);
            laserToShoot.setY(850);
            laserToShoot.setVelocityY(-600);
        }

        console.log('incoming-P1B');
    }
    // player 2 possible actions
    player2Up() {
        if(stopGame) {return null}
        
        // no up or down in left and right shoot game.
        console.log('incoming-P2U-P2R');
        if(player2?.body?.x < rightLimit) {
            player2?.setVelocityX(moveSpeed);
            player2?.anims.play('p2_right');
        }
    }
    player2Right() {
        if(stopGame) {return null}

        console.log('incoming-P2R');
        if(player2?.body?.x < rightLimit) {
            player2?.setVelocityX(moveSpeed);
            player2?.anims.play('p2_right');
        }
    }
    player2Left() { 
        if(stopGame) {return null}
        
        console.log('incoming-P2L');
        if(player2?.body?.x > leftLimit) {
            player2?.setVelocityX(-1*(moveSpeed));
            player2?.anims.play('p2_left');
        }
    }
    player2Down() {
        if(stopGame) {return null}

        // no up or down in left and right shoot game.
        console.log('incoming-P2D-P2L');
        if(player2?.body?.x > leftLimit) {
            player2?.setVelocityX(-1*(moveSpeed));
            player2?.anims.play('p2_left');
        }
    }
    player2A() {
        if(stopGame) {return null}
        const laserToShoot = pinkLasers.filter((laser) => {
            return laser.data.list.ready;
        })[0];
        if(laserToShoot && pinkLaserCoolDown <= 0) {
            pinkLaserCoolDown = laserCoolDownMax;
            laserToShoot.setData('ready', false);
            laserToShoot.setX(player2?.body?.x + 65);
            laserToShoot.setY(850);
            laserToShoot.setVelocityY(-600);
        }
        console.log('incoming-P2A');
    }
    player2B() {
        if(stopGame) {return null}
        const laserToShoot = pinkLasers.filter((laser) => {
            return laser.data.list.ready;
        })[0];
        if(laserToShoot && pinkLaserCoolDown <= 0) {
            pinkLaserCoolDown = laserCoolDownMax;
            laserToShoot.setData('ready', false);
            laserToShoot.setX(player2?.body?.x + 65);
            laserToShoot.setY(850);
            laserToShoot.setVelocityY(-600);
        }
        console.log('incoming-P2B');
    }
    goToNextGame() {
        //to prevent automatic timer from kicking us around.
        console.log('no op');
    }

}