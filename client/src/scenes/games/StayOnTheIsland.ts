import { Game, GameObjects } from 'phaser';
import GameManager from '../GameManager';

//this is well outside the scope of the scene so that our custom player action methods can access it.
let player1: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined = undefined;
let p1Falling: boolean = false;

let player2: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined = undefined;
let p2Falling: boolean = false;

export default class StayOnTheIsland extends GameManager {
    constructor() {
        super('StayOnTheIsland');
      }

      orderedHexIsland: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
      hexFallTimer: number = 0;
      killPlane: any;
      p1StandingOn: Phaser.Physics.Arcade.Image | undefined;
      p2StandingOn: Phaser.Physics.Arcade.Image | undefined;
      playersBounced: boolean =  false;
      lavaSplashEmitter: GameObjects.Particles.ParticleEmitter | undefined;
      titleTimer: number = 0;
      gameEndTimer: number = 0;
      stopGame: boolean = false;


      preload() {

        //these are defined outside the functions of this class, so need to be reset on start because
        //phaser doesnt know they exist, and if we restart this scene they will have the same values as when we 
        //last ended it. i think we can fix this by making these constructor variables...
        this.titleTimer = 0;
        this.gameEndTimer = 0;
        this.stopGame = false;
        this.hexFallTimer = 0;
        
        this.scrambleControls();
        this.changeBackgroundColor('#00c1ff');
        this.setMashFlash(false);
        console.log('were in StayOnTheIsland');
        

        // hexes are w=65, h=89
        // for spacing, h=50 is better looking, and w=32 for diagonal
        this.load.image('RockRockHex', 'src/assets/images/stayOnTheIsland/hexes/tileRock_full.png');
        this.load.image('StoneRockHex', 'src/assets/images/stayOnTheIsland/hexes/tileRock.png');
        this.load.image('DirtStoneHex', 'src/assets/images/stayOnTheIsland/hexes/tileDirt.png');
        this.load.image('DirtDirtHex', 'src/assets/images/stayOnTheIsland/hexes/tileDirt_full.png');
        this.load.image('GrassDirtHex', 'src/assets/images/stayOnTheIsland/hexes/tileGrass.png');
        this.load.image('GrassGrassHex', 'src/assets/images/stayOnTheIsland/hexes/tileGrass_full.png');
        this.load.image('LAVA', 'src/assets/images/stayOnTheIsland/hexes/tileLava_full.png');

        //player sprites
        this.load.image('p1_idle', 'src/assets/images/stayOnTheIsland/players/alienGreen_stand.png');
        this.load.image('p2_idle', 'src/assets/images/stayOnTheIsland/players/alienPink_stand.png');
        
        // music
        this.load.audio('beFaste',
            [
                'src/assets/sounds/Be Faste.ogg',
                'src/assets/sounds/Be Faste.mp3'
            ]
        );


        super.preload();
        
      }
      create() {
        this.sound.stopAll();
        const beFaste = this.sound.add('beFaste', {loop: true, volume: 1});
        beFaste.play();


        const hexXStep = 65;
        const hexYStep = 89;
        const hexXHalfStep = 32;
        const hexYhalfStep = 50;
        const startxA = window.innerWidth/2-200;
        const startyA = 800;
        let hexRowA1 = [];
        let hexRowA2 = [];
        let hexRowA3 = [];
        let hexRowA4 = [];
        let hexRowA5 = [];
        let hexRowA6 = [];

        // const exampleHex = this.physics.add.image(100, 100, 'LAVA');
        // console.log(exampleHex.getBottomCenter());
        
        for(let i = 6; i >= 0; i--) {
            //up left row
            hexRowA3.push(this.physics.add.image((startxA+(hexXStep*8))+2*(hexXHalfStep)-(i*hexXHalfStep), startyA-(hexYhalfStep*7)-hexYhalfStep-(i*hexYhalfStep), 'RockRockHex'));
            //up right row
            hexRowA2.push(this.physics.add.image((startxA+(hexXStep*6))+(hexXHalfStep)+(i*hexXHalfStep), startyA-hexYhalfStep-(i*hexYhalfStep), 'RockRockHex'));
        };
        //horizontal row
        for(let i = 0; i < 7; i++) {
            hexRowA1.push(this.physics.add.image(startxA+(i*hexXStep), startyA, 'RockRockHex'));
        };
        for(let i = 0; i < 6; i++) {
            hexRowA4.push(this.physics.add.image(startxA+(i*hexXStep)+2, startyA-(hexYStep*8)+10, 'RockRockHex'));
        };
        for(let i = 6; i >= 0; i--) {
            //up right row
            hexRowA6.push(this.physics.add.image((startxA-(hexXStep*4)+hexXHalfStep+5)+(i*hexXHalfStep), startyA-(7*hexYhalfStep)-(i*hexYhalfStep), 'RockRockHex'));
            //up left row
            hexRowA5.push(this.physics.add.image(startxA-(i*hexXHalfStep), startyA-(i*hexYhalfStep), 'RockRockHex'));
        };
 
        const startxB = startxA + hexXHalfStep;
        const startyB = startyA - hexYhalfStep;
        let hexRowB1 = [];
        let hexRowB2 = [];
        let hexRowB3 = [];
        let hexRowB4 = [];
        let hexRowB5 = [];
        let hexRowB6 = [];

        for(let i = 5; i >= 0; i--) {
            //up left row
            hexRowB3.push(this.physics.add.image((startxB+(hexXStep*7))+(hexXHalfStep)-(i*hexXHalfStep), startyB-(hexYhalfStep*7)-(i*hexYhalfStep), 'StoneRockHex'));
            //up right row
            hexRowB2.push(this.physics.add.image((startxB+(hexXStep*5))+(hexXHalfStep)+(i*hexXHalfStep), startyB-hexYhalfStep-(i*hexYhalfStep), 'StoneRockHex'));
        };
        //horizontal row
        for(let i = 0; i < 6; i++) {
            hexRowB1.push(this.physics.add.image(startxB+(i*hexXStep), startyB, 'StoneRockHex'));
        };
        for(let i = 0; i < 5; i++) {
            hexRowB4.push(this.physics.add.image(startxB+(i*hexXStep)+2, startyB-(hexYStep*7)+20, 'StoneRockHex'));
        };
            //up right row
        for(let i = 5; i >= 0; i--) {
            //up right row
            hexRowB6.push(this.physics.add.image((startxB-(hexXStep*4)+hexXStep+5)+(i*hexXHalfStep), startyB-(6*hexYhalfStep)-(i*hexYhalfStep), 'StoneRockHex'));
            //up left row
            hexRowB5.push(this.physics.add.image(startxB-(i*hexXHalfStep), startyB-(i*hexYhalfStep), 'StoneRockHex'));
        };

        const startxC = startxB + hexXHalfStep;
        const startyC = startyB - hexYhalfStep;
        let hexRowC1 = [];
        let hexRowC2 = [];
        let hexRowC3 = [];
        let hexRowC4 = [];
        let hexRowC5 = [];
        let hexRowC6 = [];

        for(let i = 4; i >= 0; i--) {
            //up left row
            hexRowC3.push(this.physics.add.image((startxC+(hexXStep*6))-(i*hexXHalfStep), startyC-(hexYhalfStep*6)-(i*hexYhalfStep), 'DirtStoneHex'));
        }
        for(let i = 5; i >= 0; i--) {
            //up right row
            hexRowC2.push(this.physics.add.image((startxC+(hexXStep*4))+(i*hexXHalfStep), startyC-(i*hexYhalfStep), 'DirtStoneHex'));
        };
        //horizontal row
        for(let i = 0; i < 4; i++) {
            hexRowC1.push(this.physics.add.image(startxC+(i*hexXStep), startyC, 'DirtStoneHex'));
        };
        for(let i = 0; i < 3; i++) {
            hexRowC4.push(this.physics.add.image(startxC+((i+1)*hexXStep)+2, startyC-(hexYStep*6)+30, 'DirtStoneHex'));
        };
        for(let i = 4; i >= 0; i--) {
            //up right row
            hexRowC6.push(this.physics.add.image((startxC-(hexXStep*2))+(i*hexXHalfStep)+5, startyC-(6*hexYhalfStep)-(i*hexYhalfStep), 'DirtStoneHex'));
        }
        for(let i = 5; i >= 0; i--) {
            //up left row
            hexRowC5.push(this.physics.add.image(startxC-(i*hexXHalfStep), startyC-(i*hexYhalfStep), 'DirtStoneHex'));
        };

        const startxD = startxC + hexXHalfStep;
        const startyD = startyC - hexYhalfStep;
        let hexRowD1 = [];
        let hexRowD2 = [];
        let hexRowD3 = [];
        let hexRowD4 = [];
        let hexRowD5 = [];
        let hexRowD6 = [];

        for(let i = 4; i >= 0; i--) {
            //up left row (top right)
            hexRowD3.push(this.physics.add.image((startxD+(hexXStep*5))-(i*hexXHalfStep)-3, startyD-(hexYhalfStep*4)-(i*hexYhalfStep), 'DirtDirtHex'));
        }
        for(let i = 3; i >= 0; i--) {
            //up right row
            hexRowD2.push(this.physics.add.image((startxD+(hexXStep*3))+(i*hexXHalfStep), startyD-(i*hexYhalfStep), 'DirtDirtHex'));
        };
        for(let i = 0; i < 3; i++) {
            //horizontal Row bottom
            hexRowD1.push(this.physics.add.image(startxD+(i*hexXStep), startyD, 'DirtDirtHex'));
        };
        for(let i = 0; i < 3; i++) {
            //horizontal Row top
            hexRowD4.push(this.physics.add.image(startxD+(i*hexXStep), startyD-(hexYStep*4)-hexYhalfStep+5, 'DirtDirtHex'));
        };
        for(let i = 3; i >= 0; i--) {
            //up right row
            hexRowD6.push(this.physics.add.image((startxD-(hexXStep)-hexXStep)+(i*hexXHalfStep), startyD-(4*hexYhalfStep)-(i*hexYhalfStep), 'DirtDirtHex'));
        }
        for(let i = 3; i >= 0; i--) {
            //up left row (bottom left)
            hexRowD5.push(this.physics.add.image(startxD-(i*hexXHalfStep), startyD-(i*hexYhalfStep), 'DirtDirtHex'));
        };

        const startxE = startxD + hexXHalfStep;
        const startyE = startyD - hexYhalfStep;
        let hexRowE1 = [];
        let hexRowE2 = [];
        let hexRowE3 = [];
        let hexRowE4 = [];
        let hexRowE5 = [];
        let hexRowE6 = [];

        for(let i = 3; i >= 0; i--) {
            //up left row (top right)
            hexRowE3.push(this.physics.add.image((startxE+(hexXStep*4)-hexXHalfStep)-(i*hexXHalfStep)-3, startyE-(hexYhalfStep*3)-(i*hexYhalfStep), 'GrassDirtHex'));
        }
        for(let i = 2; i >= 0; i--) {
            //up right row (bottom left)
            hexRowE2.push(this.physics.add.image((startxE+(hexXStep*2))+(i*hexXHalfStep), startyE-(i*hexYhalfStep), 'GrassDirtHex'));
        };
        for(let i = 0; i < 2; i++) {
            //horizontal Row bottom
            hexRowE1.push(this.physics.add.image(startxE+(i*hexXStep), startyE, 'GrassDirtHex'));
        };
        for(let i = 0; i < 2; i++) {
            //horizontal Row top
            hexRowE4.push(this.physics.add.image(startxE+(i*hexXStep), startyE-(hexYStep*3)-hexYhalfStep+15, 'GrassDirtHex'));
        };
        for(let i = 2; i >= 0; i--) {
            //up right row
            hexRowE6.push(this.physics.add.image((startxE-(hexXStep)-hexXHalfStep)+(i*hexXHalfStep), startyE-(3*hexYhalfStep)-(i*hexYhalfStep), 'GrassDirtHex'));
        }
        for(let i = 2; i >= 0; i--) {
            //up left row (bottom left)
            hexRowE5.push(this.physics.add.image(startxE-(i*hexXHalfStep), startyE-(i*hexYhalfStep), 'GrassDirtHex'));
        };


        const startxF = startxE + hexXHalfStep;
        const startyF = startyE - hexYhalfStep;
        let hexRowF5 = [];
        let hexRowF2 = [];
        let hexRowF3 = [];
        let hexRowF6 = [];

        for(let i = 2; i >= 0; i--) {
            //up right row
            hexRowF6.push(this.physics.add.image((startxE)+(i*hexXHalfStep)-hexXHalfStep, startyE-(3*hexYhalfStep)-(i*hexYhalfStep), 'GrassGrassHex'));
        }
        for(let i = 2; i >= 0; i--) {
            //up left row (bottom left)
            hexRowF5.push(this.physics.add.image(startxE-((i-1)*hexXHalfStep), startyE-(i*hexYhalfStep)-hexYhalfStep, 'GrassGrassHex'));
        };
        for(let i = 1; i >= 0; i--) {
            //up left row (top right)
            hexRowF3.push(this.physics.add.image((startxE+(hexXStep*4)-hexXStep)-hexXStep-(i*hexXHalfStep)-3, startyE-(hexYhalfStep*4)-(i*hexYhalfStep), 'GrassGrassHex'));
        }
        for(let i = 2; i >= 0; i--) {
            //up right row (bottom left)
            hexRowF2.push(this.physics.add.image((startxE+(hexXStep+hexXHalfStep))+(i*hexXHalfStep), startyE-(i*hexYhalfStep)-hexYhalfStep, 'GrassGrassHex'));
        };

        
        const lastHex2 = this.physics.add.image(787, 490-hexYStep, 'GrassGrassHex');
        const lastHex3 = this.physics.add.image(787-hexXHalfStep, 490-hexYhalfStep, 'GrassGrassHex');
        const lastHex4 = this.physics.add.image(787+hexXHalfStep, 490-hexYhalfStep, 'GrassGrassHex');
        const lastHex1 = this.physics.add.image(787, 480, 'GrassGrassHex');


        const allHexes = [
            ...hexRowA3, ...hexRowA2, ...hexRowA1.reverse(), ...hexRowA5.reverse(), ...hexRowA6.reverse(), ...hexRowA4,
            ...hexRowB3, ...hexRowB2, ...hexRowB1.reverse(), ...hexRowB5.reverse(), ...hexRowB6.reverse(), ...hexRowB4,
            ...hexRowC3, ...hexRowC2, ...hexRowC1.reverse(), ...hexRowC5.reverse(), ...hexRowC6.reverse(), ...hexRowC4,
            ...hexRowD3, ...hexRowD2, ...hexRowD1.reverse(), ...hexRowD5.reverse(), ...hexRowD6.reverse(), ...hexRowD4,
            ...hexRowE3, ...hexRowE2, ...hexRowE1.reverse(), ...hexRowE5.reverse(), ...hexRowE6.reverse(), ...hexRowE4,
            ...hexRowF3, ...hexRowF2, ...hexRowF5.reverse(), ...hexRowF6.reverse(), lastHex2, lastHex3, lastHex4, lastHex1,
        ]; 
        this.orderedHexIsland = [...allHexes];

        this.add.rectangle(1000,window.innerHeight+1350,3000, 3000, 0xad4d03);
        let allKillHexes = [];
        for(let i = 0; i< 40; i++) {
            const killHex = this.physics.add.image(0+(i*hexXStep),window.innerHeight-130, 'LAVA').setImmovable()
            this.tweens.add({
                targets: killHex,
                x: 0+(i*hexXStep),
                y: window.innerHeight-130-20,
                duration: 2000,
                yoyo: true,
                delay: i*(100),
                loop: Infinity,
            });
            allKillHexes.push(killHex);
        } 

        player1 = this.physics.add.image(700,150, 'p1_idle');
        player2 = this.physics.add.image(700,600, 'p2_idle');

        //this timer calls a function that tells hexes to fall once per delay
        const hexFallTimer = this.time.addEvent({delay: 200, callback: this.makeHexesFall, callbackScope: this, loop: true});
        //this timer resets the bounce on player collisions
        const playerBounceTimer = this.time.addEvent({delay: 300, callback:() => { this.playersBounced = false}, callbackScope: this, loop: true});

        this.killPlane = allKillHexes;

        //this calls a callback if player 1 overlaps with the island hexes
        this.physics.add.overlap(player1, this.orderedHexIsland, this.isPlayer1OnIsland, undefined, this);
        //this calls a callback if player 2 overlaps with the island hexes
        this.physics.add.overlap(player2, this.orderedHexIsland, this.isPlayer2OnIsland, undefined, this);
        //this calls a callback if player 1 overlaps with the Lava
        this.physics.add.overlap(player1, this.killPlane, this.Player1InLava, undefined, this);
        //this calls a callback if player 2 overlaps with the lava
        this.physics.add.overlap(player2, this.killPlane, this.Player2InLava, undefined, this);
        this.physics.add.overlap(player1, player2, this.makePlayersCollide, undefined, this);

        //this calls a callback if there is an overlap between any island hex and the kill tiles
        this.physics.add.overlap(this.orderedHexIsland, this.killPlane, this.killTile, undefined, this);


        const particles = this.add.particles('LAVA');
        this.lavaSplashEmitter = particles.createEmitter({
          speed: 120,
          scale: { start: .5, end: 0 },
          blendMode: 'ADD',
          frequency: -1
        });

        this.stopGame = true;

        const titleTimerEvent = this.time.addEvent({delay: 400, callback:() => { 
            this.titleTimer++;
            if(this.titleTimer === 1) {
                //play noise
                this.add.text(100,50, "STAY", {fontSize: '100px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 2) {
                this.add.text(1300,50, "ON", {fontSize: '100px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 3) {
                this.add.text(100,600, "THE", {fontSize: '100px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 4) {
                this.add.text(1200,600, "ISLAND", {fontSize: '100px', color:'#295070', stroke: '#cccccc', strokeThickness: 10});
            } else if (this.titleTimer === 5) {
                this.stopGame = false;
                this.time.removeEvent(titleTimerEvent);
            }
        }, callbackScope: this, loop: true});

        super.create();

      }

      makeHexesFall() {
        if(this.stopGame) {return null}
        this.hexFallTimer++;
        for(let i = 0; i <= this.hexFallTimer; i++) {
            if(!(i+1 > this.orderedHexIsland.length)) {
                if(this.orderedHexIsland[i].body) { //check if it even exists 
                    this.orderedHexIsland[i].setVelocityY(this.orderedHexIsland[i].body.velocity.y+100);
                }
            } else {
                return null;
            }
        }
        return null;
      }

      update() {
        //player 1 physics stuff
        if(!this.p1StandingOn) {
            p1Falling = true;
        }
        if(this.stopGame) {
            p1Falling = false;
            return null;
        }
        //simulate friction slowing players down every frame and stopping them
        if(!p1Falling) {
            if(player1?.body?.velocity?.y > 0) {
                player1?.setVelocityY(player1.body.velocity.y - 3);
            }
            if(player1?.body?.velocity?.y < 0) {
                player1?.setVelocityY(player1.body.velocity.y + 3);
            }
        }
        if(player1?.body?.velocity?.x > 0) {
            player1?.setVelocityX(player1.body.velocity.x - 3);
        }
        if(player1?.body?.velocity?.x < 0) {
            player1?.setVelocityX(player1.body.velocity.x + 3);
        }
        //make player1 fall
        if(p1Falling) {
            player1?.setVelocityY(player1.body.velocity.y + 50);
        }
        this.p1StandingOn = undefined; 

        //player 2 physics stuff
        if(!this.p2StandingOn) {
            p2Falling = true;
        }
        //simulate friction slowing players down every frame and stopping them
        if(!p2Falling) {
            if(player2?.body?.velocity?.y > 0) {
                player2?.setVelocityY(player2.body.velocity.y - 3);
            }
            if(player2?.body?.velocity?.y < 0) {
                player2?.setVelocityY(player2.body.velocity.y + 3);
            }
        }
        if(player2?.body?.velocity?.x > 0) {
            player2?.setVelocityX(player2.body.velocity.x - 3);
        }
        if(player2?.body?.velocity?.x < 0) {
            player2?.setVelocityX(player2.body.velocity.x + 3);
        }
        //make player1 fall
        if(p2Falling) {
            player2?.setVelocityY(player2.body.velocity.y + 50);
        }
        this.p2StandingOn = undefined;

        super.update();
      }

    killTile(tile: Phaser.Physics.Arcade.Image, killplane) {
        if(this.stopGame) {return null}
        const location = {x: tile.body.x, y: tile.body.y};
        this.lavaSplashEmitter?.explode(1,location.x,location.y);
        this.cameras.main.shake(70, 0.003);
        tile.destroy();
    } 

    isPlayer1OnIsland(player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, tile: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        if(this.stopGame) {return null}
        this.p1StandingOn = tile;
        player1?.setVelocityY(1);
        p1Falling = false;
    }
    isPlayer2OnIsland(player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, tile: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        if(this.stopGame) {return null}
        this.p2StandingOn = tile;
        player2?.setVelocityY(1);
        p2Falling = false;
    }
    Player1InLava(player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, tile: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        player1?.setVelocityX(0);
        player1?.setVelocityY(0);
        player2?.setVelocityX(0);
        player2?.setVelocityY(0);
        p1Falling = false;
        p2Falling = false;
        const location = {x: player.body.x, y: player.body.y};
        this.lavaSplashEmitter?.explode(10,location.x,location.y);
        if(!this.stopGame) {
            this.pinkWins();
        }
        this.stopGame = true;
    
    }
    Player2InLava(player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, tile: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        player1?.setVelocityX(0);
        player1?.setVelocityY(0);
        player2?.setVelocityX(0);
        player2?.setVelocityY(0);
        p1Falling = false;
        p2Falling = false;
        const location = {x: player.body.x, y: player.body.y};
        this.lavaSplashEmitter?.explode(10,location.x,location.y);
        if(!this.stopGame) {
            this.tealWins();
        }
        this.stopGame = true;
     
    }

    // you could combine/refactor these two functions SO easily. but it would just take time and we dont have it. sorry bruh. next pass.
    pinkWins() {
        const pinkWinText = this.add.text(player2?.body.x+50, player2?.body.y-100, "PINK WINS!",
            {fontSize: '100px', color:'#ff5050', stroke: '#cccccc', strokeThickness: 10}
        ).setOrigin(0.5, 0.5).setRotation(0.3);
        pinkWinText.setVisible(false);

        const pinkwinsTimer = this.time.addEvent({delay: 1000, callback:() => {
            this.gameEndTimer++;
            if(this.gameEndTimer >= 1 && this.gameEndTimer < 6) {
                this.cameras.main.zoomTo(1.5,100); 
                this.cameras.main.startFollow(player1);
            } else if (this.gameEndTimer >= 6 && this.gameEndTimer < 12) {
                this.cameras.main.startFollow(player2);
                pinkWinText.setVisible(true);
                this.tweens.add({
                    targets: pinkWinText,
                    rotation: -0.3,
                    duration: 500,
                    infinite: true,
                    yoyo: true, 
                });
            } else if (this.gameEndTimer === 12) {
                this.time.removeEvent(pinkwinsTimer)
                super.addGamePlayed({gameTitle: 'StayOnTheIsland', winner: 'pink'})
                super.goToScene('GameScoreTrackerScreen');
            }

        }, callbackScope: this, loop: true});
    }


    tealWins() {
        const tealWinText = this.add.text(player1?.body.x+50, player1?.body.y-100, "TEAL WINS!",
            {fontSize: '100px', color:'#50ff50', stroke: '#cccccc', strokeThickness: 10}
        ).setOrigin(0.5,0.5).setRotation(0.3);
        tealWinText.setVisible(false);
        const tealwinstimer = this.time.addEvent({delay: 1000, callback:() => {
            this.gameEndTimer++;
            if(this.gameEndTimer >= 1 && this.gameEndTimer < 6) {
                this.cameras.main.zoomTo(1.5,100); 
                this.cameras.main.startFollow(player2);
            } else if (this.gameEndTimer >= 6 && this.gameEndTimer < 12) {
                this.cameras.main.startFollow(player1);
                tealWinText.setVisible(true);
                this.tweens.add({
                    targets: tealWinText,
                    rotation: -0.3,
                    duration: 500,
                    infinite: true,
                    yoyo: true, 
                });
            } else if (this.gameEndTimer === 12) {
                this.time.removeEvent(tealwinstimer);
                super.addGamePlayed({gameTitle: 'StayOnTheIsland', winner: 'teal'})
                super.goToScene('GameScoreTrackerScreen');
            }

        }, callbackScope: this, loop: true});
    }

    makePlayersCollide(player1: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, player2: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        if(this.stopGame) {return null}
        if(!this.playersBounced) {
            // bounce back player 1
            let newp1Velx = -1*(player1.body.velocity.x);
            let newp1Vely = -1*(player1.body.velocity.y);
            if(newp1Velx > 0) {
                newp1Velx += 300;
            } else {
                newp1Velx -= 300;
            }
            if(newp1Vely > 0) {
                newp1Vely += 300;
            } else {
                newp1Vely -= 300;
            }
            player1.setVelocity(newp1Velx, newp1Vely);
    
            //bounce back player2
            let newp2Velx = -1*(player2.body.velocity.x);
            let newp2Vely = -1*(player2.body.velocity.y);
            if(newp2Velx > 0) {
                newp2Velx += 300; 
            } else {
                newp2Velx -= 300;
            }
            if(newp2Vely > 0) {
                newp2Vely += 300;
            } else {
                newp2Vely -= 300;
            }
            player2.setVelocity(newp2Velx, newp2Vely);

            this.playersBounced = true;
        }
    }
 

      // ----------------------------------------- OVER WRITTEN FUNCTIONS FROM GAME MANAGER -------------------------------------------
    // player 1 possible actions
    player1Up(this: this) {
        if(this.stopGame) {return null}
        console.log('island-P1U');
        if(!p1Falling) {
            player1?.setVelocityY(-150);
        }
    }
    player1Right() {
        if(this.stopGame) {return null}
        console.log('island-P1R');
        player1?.setVelocityX(150);
    }
    player1Left(this: this) {
        if(this.stopGame) {return null}
        console.log('island-P1L');
        player1?.setVelocityX(-150);
    }
    player1Down(this: this) {
        if(this.stopGame) {return null}
        if(!p1Falling) {
            player1?.setVelocityY(150);
        }
        console.log('island-P1D');
    }
    player1A() {
        console.log('island-P1A');
    }
    player1B() {
        console.log('island-P1B');
    }
    // player 2 possible actions
    player2Up() {
        if(this.stopGame) {return null}
        console.log('island-P2U');
        if(!p2Falling) {
            player2?.setVelocityY(-150);
        }
    }
    player2Right() {
        if(this.stopGame) {return null}
        console.log('island-P2R');
        player2?.setVelocityX(150);
    }
    player2Left() { 
        if(this.stopGame) {return null}
        console.log('island-P2L');
        player2?.setVelocityX(-150);
    }
    player2Down() {
        if(this.stopGame) {return null}
        if(!p2Falling) {
            player2?.setVelocityY(150);
        }
        console.log('island-P2D');
    }
    player2A() {
        console.log('island-P2A');
    }
    player2B() {
        console.log('island-P2B');
    }
    goToNextGame() {
        //to prevent automatic timer from kicking us around.
    }
    


}