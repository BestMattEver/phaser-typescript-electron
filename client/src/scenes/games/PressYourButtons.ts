import { Game, GameObjects } from 'phaser';
import GameManager from '../GameManager';

//this is well outside the scope of the scene so that our custom player action methods can access it.
let tealDrill: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined = undefined;
let pinkDrill: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined = undefined;

let stopGame: boolean = false;
const maxBarHeight: number = window.innerHeight*.8;
const centerWidth: number = window.innerWidth/2;
const centerHeight: number = window.innerHeight/2;

const basePoints: number = 2;

let pinkScore: number = 0;
let tealScore: number = 0;

let tealEmitter: GameObjects.Particles.ParticleEmitterManager;
let pinkEmitter: GameObjects.Particles.ParticleEmitterManager;

// this is how much each player's bar goes up each frame
let tealMultiplier: number = 0;
let pinkMultiplier: number = 0;

// these arrays hold which buttons were pressed this frame.
let pinkControlArray: boolean[] = [false, false, false, false, false, false];
let tealControlArray: boolean[] = [false, false, false, false, false, false];

// the visual bars representing the scores for each player.
let tealRectBar: GameObjects.Rectangle;
let pinkRectBar: GameObjects.Rectangle;
let tealDrillBar: GameObjects.Rectangle;
let pinkDrillBar: GameObjects.Rectangle;

export default class PressYourButtons extends GameManager {
    constructor() {
        super('PressYourButtons');
      }

      titleTimer: number = 0;

      gameEndTimer: number = 0;
      pinkColor = new Phaser.Display.Color(242, 166, 190);
      tealColor = new Phaser.Display.Color(111, 196, 169);

      startTime: Date = new Date(Date.now());

      preload() {

        //these are defined outside the functions of this class, so need to be reset on start because
        //phaser doesnt know they exist, and if we restart this scene they will have the same values as when we 
        //last ended it. i think we can fix this by making these constructor variables... or destroying the scene?
        this.titleTimer = 0;
        this.gameEndTimer = 0;
        stopGame = false;
        this.startTime = new Date(Date.now());
        pinkScore = 0;
        tealScore = 0;
        
        this.scrambleControls();
        this.changeBackgroundColor('#756849');
        this.setMashFlash(false);
        console.log('were in PushYourButtons');
        
        this.load.image('pinkGem', 'src/assets/images/PressYourButtons/pinkGem.png');
        this.load.image('tealGem', 'src/assets/images/PressYourButtons/tealGem.png');
        this.load.image('rock', 'src/assets/images/PressYourButtons/meteorBrown_small1.png');

        this.load.image('pinkGemCluster', 'src/assets/images/PressYourButtons/pinkGemCluster.png');
        this.load.image('tealGemCluster', 'src/assets/images/PressYourButtons/tealGemCluster.png');

        this.load.spritesheet('drills_sprite_sheet', 'src/assets/images/PressYourButtons/drills_sprite_sheet.png', 
            {
                frameWidth: 32,
                frameHeight: 32,
            });
        
        // music
        this.load.audio('fatalityRacer',
            [
                'src/assets/sounds/Fatality_Racer.wav',
            ]
        );

        super.preload();
        
      }

      create() {
        this.sound.stopAll();
        const fatalityRacer = this.sound.add('fatalityRacer', {loop: true, volume: 1});
        fatalityRacer.play();

        //reset these every time the game is created again.


        const pinkColor = Phaser.Display.Color.GetColor(242, 166, 190);
        const tealColor = Phaser.Display.Color.GetColor(111, 196, 169);
        const pinkDirtColor = Phaser.Display.Color.GetColor(87, 57, 57);
        const tealDirtColor = Phaser.Display.Color.GetColor(47, 61, 43);
        const topDirtColor = Phaser.Display.Color.GetColor(245, 191, 64);

        const groundLevel = this.add.rectangle(0,0,5000,200,topDirtColor).setOrigin(0,0);

        pinkEmitter = this.add.particles('rock', {
            x: 0,
            y: 0,
            speed: 700,
            lifespan: 200,
            gravityY: 10000,
            scale: {start: 2, end: 0}
        });
        pinkEmitter.setVisible(false);
        tealEmitter = this.add.particles('rock', {
            x: 0,
            y: 0,
            speed: 700,
            lifespan: 200,
            gravityY: 10000,
            scale: {start: 2, end: 0}
        });
        tealEmitter.setVisible(false);

        this.physics.add.image((centerWidth)-centerWidth/2, (window.innerHeight*.95)-125, 'pinkGemCluster').setScale(2,2).setOrigin(.5,0);
        this.physics.add.image((centerWidth)+centerWidth/2, (window.innerHeight*.95)-125, 'tealGemCluster').setScale(2,2).setOrigin(.5,0);

        // PLAYER 1 BAR--------------------TEAL--------------------------------
        tealRectBar = this.add.rectangle((centerWidth)+centerWidth/2, 200, 150, 0, tealDirtColor).setOrigin(.5,0);
        this.add.ellipse((centerWidth)+centerWidth/2, 175, 150, 50, tealDirtColor).setOrigin(.5,0);

        tealDrillBar = this.add.rectangle((centerWidth)+centerWidth/2, 0, 50, 200, tealColor).setOrigin(.5,0);
        tealDrillBar.setStrokeStyle(6, Phaser.Display.Color.GetColor(0,0,0));

        tealDrill = this.physics.add.sprite(tealRectBar.x,tealRectBar.y+30, 'drills_sprite_sheet').setRotation(0.785398); // TEAL
        tealDrill.setDataEnabled();
        tealDrill.data.set('name','teal')
        tealDrill.setScale(6, 6);
        const teal_idle = {
            key: 'teal_idle',
            defaultTextureKey: "drills_sprite_sheet",
            duration: 1,
            frames: [
                { frame: 0, duration: 1000},
            ],
            repeat: -1,
        };
        const teal_drilling = {
            key: 'teal_drilling',
            defaultTextureKey: "drills_sprite_sheet",
            duration: 1,
            frames: [
                { frame: 0, duration: 150},
                { frame: 1, duration: 150},
            ],
            repeat: -1,
        };
        const b = {
            key: 'b',
            defaultTextureKey: "drills_sprite_sheet",
            duration: 1,
            frames: [
                { frame: 0, duration: 50},
                { frame: 1, duration: 50},
            ],
            repeat: -1,
        };
       
        this.anims.create(teal_idle);
        this.anims.create(teal_drilling);
        this.anims.create(b);
 

        // PLAYER 2 BAR----------------------- PINK -------------------------------
        pinkRectBar = this.add.rectangle((centerWidth)-centerWidth/2, 200, 150, 0, pinkDirtColor).setOrigin(.5,0);
        this.add.ellipse((centerWidth)-centerWidth/2, 175, 150, 50, pinkDirtColor).setOrigin(.5,0);

        pinkDrillBar = this.add.rectangle((centerWidth)-centerWidth/2, 0, 50, 200, pinkColor).setOrigin(.5,0);
        pinkDrillBar.setStrokeStyle(6, Phaser.Display.Color.GetColor(0,0,0));

        pinkDrill = this.physics.add.sprite(pinkRectBar.x,pinkRectBar.y+30, 'drills_sprite_sheet', 4).setRotation(0.785398); // PINK
        pinkDrill.setDataEnabled();
        pinkDrill.data.set('name','pink')
        pinkDrill.setScale(6, 6);
        const pink_idle = {
            key: 'pink_idle',
            defaultTextureKey: "drills_sprite_sheet",
            duration: 1,
            frames: [
                { frame: 4, duration: 1000},
            ],
            repeat: -1,
        };
        const pink_drilling = {
            key: 'pink_drilling',
            defaultTextureKey: "drills_sprite_sheet",
            duration: 1,
            frames: [
                { frame: 4, duration: 150},
                { frame: 5, duration: 150},
            ],
            repeat: -1,
        };
        const pink_drilling_hard = {
            key: 'pink_drilling_hard',
            defaultTextureKey: "drills_sprite_sheet",
            duration: 1,
            frames: [
                { frame: 4, duration: 10},
                { frame: 5, duration: 10},
            ],
            repeat: -1,
        };
       
        this.anims.create(pink_idle);
        this.anims.create(pink_drilling);
        this.anims.create(pink_drilling_hard);
 

        super.create();

        stopGame = true;
        const titleTimerEvent = this.time.addEvent({delay: 400, callback:() => {
            this.titleTimer++;
            if(this.titleTimer === 1) {
                //play noise?
                this.add.text(centerWidth,250, "DIG", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10}).setOrigin(.5,.5);
            } else if (this.titleTimer === 2) {
                this.add.text(centerWidth,450, "TO", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10}).setOrigin(.5,.5);
            } else if (this.titleTimer === 3) {
                this.add.text(centerWidth,660, "THE", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10}).setOrigin(.5,.5);
            } else if (this.titleTimer === 4) {
                this.add.text(centerWidth,880, "GEMS", {fontSize: '80px', color:'#295070', stroke: '#cccccc', strokeThickness: 10}).setOrigin(.5,.5);
            } else if (this.titleTimer === 5) {
                stopGame = false;
                this.time.removeEvent(titleTimerEvent);
            }
        }, callbackScope: this, loop: true});

      }


      update() {
        if(!stopGame) {
            if(pinkControlArray.includes(true) || tealControlArray.includes(true)) {
                this.cameras.main.shake(70, 0.003);
            }

            // how many controls are pressed this frame?
            tealMultiplier = tealControlArray.filter((control) => {return control}).length;
            pinkMultiplier = pinkControlArray.filter((control) => {return control}).length;

            pinkEmitter.setY((pinkDrill?.y || 0) + 50);
            pinkEmitter.setX(pinkDrill?.x);
            tealEmitter.setY((tealDrill?.y || 0) + 50);
            tealEmitter.setX(tealDrill?.x);


            if (tealMultiplier === 0 && tealDrill?.anims.currentAnim?.key !== 'teal_idle')  {
                tealDrill?.anims.stop();
                tealDrill?.anims.play('teal_idle');
                tealEmitter.setVisible(false);
            }
            if(tealMultiplier === 1 && tealDrill?.anims.currentAnim?.key != 'teal_drilling') {
                tealDrill?.anims.stop();
                tealDrill?.anims.play('teal_drilling');
                tealEmitter.setVisible(false);
            }
            if(tealMultiplier >= 2 && tealDrill?.anims.currentAnim?.key != 'b') {
                tealDrill?.anims.stop();
                tealDrill?.anims.play('b');
                tealEmitter.setVisible(true);
            }

            if (pinkMultiplier === 0 && pinkDrill?.anims.currentAnim?.key !== 'pink_idle')  {
                pinkDrill?.anims.stop();
                pinkDrill?.anims.play('pink_idle');
                pinkEmitter.setVisible(false);
            }
            if(pinkMultiplier === 1 && pinkDrill?.anims.currentAnim?.key != 'pink_drilling') {
                pinkDrill?.anims.stop();
                pinkDrill?.anims.play('pink_drilling');
                pinkEmitter.setVisible(false);
            }
            if(pinkMultiplier >= 2 && pinkDrill?.anims.currentAnim?.key != 'pink_drilling_hard') {
                pinkDrill?.anims.stop();
                pinkDrill?.anims.play('pink_drilling_hard');
                pinkEmitter.setVisible(true);
            }

            // do some math based on multiplier and basepoints add that to the score
            pinkScore = pinkScore + (pinkMultiplier*basePoints)/3;
            tealScore = tealScore + (tealMultiplier*basePoints)/3;

            //make the control arrays false for use next frame
            pinkControlArray = [false, false, false, false, false, false];
            tealControlArray = [false, false, false, false, false, false];

            //make bars as tall as score
            tealRectBar.height = tealScore;
            tealDrillBar.setSize( tealDrillBar.width, tealScore+200);

            tealDrill?.setY(tealRectBar.y + tealRectBar.height + 30);
            pinkDrill?.setY(pinkRectBar.y + pinkRectBar.height + 30);

            pinkRectBar.height = pinkScore;
            pinkDrillBar.setSize( pinkDrillBar.width, pinkScore+200);

            // if the y coord of one of the drills (+100 for size of drill) reaches 95% screen height, someone wins!
            if(tealDrill?.y+100 >= window.innerHeight*.95) {
                stopGame = true;
                this.playerWins(tealDrill as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, tealDrill as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
            }
            if(pinkDrill?.y+100 >= window.innerHeight*.95) {
                stopGame = true;
                this.playerWins(pinkDrill as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, pinkDrill as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
            }

        }
        super.update();
      }

 
      playerWins(winner: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, zoomObject: Phaser.GameObjects.GameObject) {
        //stop everything from moving
       

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
                        gameTitle: 'PressYourButtons',
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
        tealControlArray[0] = true;
        console.log('press-P1U-P1R');
    }
    player1Right() {
        if(stopGame) {return null}
        tealControlArray[1] = true;
        console.log('press-P1R');
    }
    player1Left(this: this) {
        if(stopGame) {return null}
        tealControlArray[2] = true;
        console.log('press-P1L');
    }
    player1Down(this: this) {
        if(stopGame) {return null}
        tealControlArray[3] = true;
        console.log('press-P1D-P1L');
    }
    player1A() {
        if(stopGame) {return null}
        tealControlArray[4] = true;
        console.log('press-P1A');
    }
    player1B() {
        if(stopGame) {return null}
        tealControlArray[5] = true;
        console.log('incoming-P1B');
    }
    // player 2 possible actions
    player2Up() {
        if(stopGame) {return null}
        pinkControlArray[0] = true;
        console.log('press-P2U-P2R');
    }
    player2Right() {
        if(stopGame) {return null}
        pinkControlArray[1] = true;
        console.log('press-P2R');
    }
    player2Left() { 
        if(stopGame) {return null}
        pinkControlArray[2] = true;
        console.log('press-P2L');
    }
    player2Down() {
        if(stopGame) {return null}
        pinkControlArray[3] = true;
        console.log('press-P2D-P2L');
    }
    player2A() {
        if(stopGame) {return null}
        pinkControlArray[4] = true;
        console.log('press-P2A');
    }
    player2B() {
        if(stopGame) {return null}
        pinkControlArray[5] = true;
        console.log('press-P2B');
    }
    goToNextGame() {
        //to prevent automatic timer from kicking us around.
        console.log('no op');
    }

}