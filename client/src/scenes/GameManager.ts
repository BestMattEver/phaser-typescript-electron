import Phaser from 'phaser';
import { getGamepads2, mapGamepadsToActionIndex, CondensedGamepadInputs, anyButtonPressed } from '../gamepadManager';

export interface PlayedGame {
  gameTitle: string,
  winner: string,
};

let greenIndex: number = 0;
let redIndex: number = 1;
let yellowIndex: number = 2;
let blueIndex: number = 3;

const possibleGames = ['StayOnTheIsland', 'ShootIncomingBaddies'];
let gamesPlayed: PlayedGame[] = [];
let nextGame: string;

// this is poorly named it doesnt really manage the GAME, it manages... common scene elements, like the controls and a timer. maybe other things? 
export default class GameManager extends Phaser.Scene {
  gamepadText: any;
  actionArray: any;
  buttonToActionMap: any;
  sceneTimeSeconds: number = 0;

  // when false, this turns off the timers that switch between scenes and control the controls at the bottom of the screen
  timersOnDEBUG: boolean = true;
  mashFlash: boolean = true;

  arcadeControlWidget: Phaser.GameObjects.Container;
  greenArcadeControls: Phaser.GameObjects.Container;
  blueArcadeControls: Phaser.GameObjects.Container;
  yellowArcadeControls: Phaser.GameObjects.Container;
  redArcadeControls: Phaser.GameObjects.Container;

  redASound: Phaser.Sound.BaseSound;
  redBSound: Phaser.Sound.BaseSound;
  redUpSound: Phaser.Sound.BaseSound;
  redDownSound: Phaser.Sound.BaseSound;
  redLeftSound: Phaser.Sound.BaseSound;
  redRightSound: Phaser.Sound.BaseSound;

  blueASound: Phaser.Sound.BaseSound;
  blueBSound: Phaser.Sound.BaseSound;
  blueUpSound: Phaser.Sound.BaseSound;
  blueDownSound: Phaser.Sound.BaseSound;
  blueLeftSound: Phaser.Sound.BaseSound;
  blueRightSound: Phaser.Sound.BaseSound;

  greenASound: Phaser.Sound.BaseSound;
  greenBSound: Phaser.Sound.BaseSound;
  greenUpSound: Phaser.Sound.BaseSound;
  greenDownSound: Phaser.Sound.BaseSound;
  greenLeftSound: Phaser.Sound.BaseSound;
  greenRightSound: Phaser.Sound.BaseSound;

  yellowASound: Phaser.Sound.BaseSound;
  yellowBSound: Phaser.Sound.BaseSound;
  yellowUpSound: Phaser.Sound.BaseSound;
  yellowDownSound: Phaser.Sound.BaseSound;
  yellowLeftSound: Phaser.Sound.BaseSound;
  yellowRightSound: Phaser.Sound.BaseSound;

  anyButtonPressed: boolean | null = true;
  timeSinceControllerTouch: number = 0;
  startProgress: number = 0;

  constructor(sceneName: string) {
    super(sceneName);
  }

  getGamesPlayed() {
    return gamesPlayed
  };
  setGamesPlayed(games: PlayedGame[]) {
    gamesPlayed = games;
  };
  addGamePlayed(game: PlayedGame) {
    gamesPlayed.unshift(game);
  };
  getNextGame() {
    return nextGame;
  }
  setNextGame(game: string) {
    nextGame = game;
  }
  setRandomNextGame() {
    //never play the same game twice by removing the previously played game from the possible game options.
    const gamesPlayed = this.getGamesPlayed();
    let possibleGamesWithoutLast: string[];
    if(gamesPlayed.length > 0) {
      const previousGame = gamesPlayed[0].gameTitle || 'none';
      possibleGamesWithoutLast = possibleGames.filter((game) => {
          return game !== previousGame;
      });
    } else {
      possibleGamesWithoutLast = possibleGames;
    }

  // pick a random game from the remainder
    const nextGameIndex = Math.floor(Math.random() * possibleGamesWithoutLast.length);
    // set random game to be the next game.
    this.setNextGame(possibleGamesWithoutLast[nextGameIndex]);
  }

  setGreenIndex(index: number) {
    console.log('green index:', index);
    greenIndex = index;
  }
  setRedIndex(index: number) {
    console.log('red index:', index);
    redIndex = index;
  }
  setYellowIndex(index: number) {
    console.log('yellow index:', index);
    yellowIndex = index;
  }
  setBlueIndex(index: number) {
    console.log('blue index:', index);
    blueIndex = index;
  }

  goToTitleScene() {
    //this loop kills all sounds that arent the specific background music to the title screen
    // we keep that around because the title screen loops on itself, so we dont want the title screen bg music restarting every 15 seconds.
    this.game.sound.sounds.forEach(sound => {
      if(sound.key !== 'Title_BG_music') {
        sound.destroy();
      }
    });
    console.log('going to title scene from: ', this.scene.settings.key);
    this.scene.stop(this.scene.settings.key);
    this.scene.start('TitleScreen');
  }
  goToNextGame() {
    this.sound.stopAll();
    this.scene.stop(this.scene.settings.key);
    this.scene.start(nextGame);
  }
  goToScene(sceneTitle: string) {
    this.sound.stopAll();
    this.scene.stop(this.scene.settings.key);
    this.scene.start(sceneTitle);
  };

  // player 1 possible actions
  player1Up() {
    console.log('player 1 UP - gameManager');
  }
  player1Right() {
    console.log('player 1 RIGHT - gameManager');
  }
  player1Left() {
    console.log('player 1 LEFT - gameManager');
  }
  player1Down() {
    console.log('player 1 DOWN - gameManager');
  }
  player1A() {
    console.log('player 1 A - gameManager');
  }
  player1B() {
    console.log('player 1 B - gameManager');
  }
  // player 2 possible actions
  player2Up() {
    console.log('player 2 UP - gameManager');
  }
  player2Right() {
    console.log('player 2 RIGHT - gameManager');
  }
  player2Left() {
    console.log('player 2 LEFT - gameManager');
  }
  player2Down() {
    console.log('player 2 DOWN - gameManager');
  }
  player2A() {
    console.log('player 2 A - gameManager');
  }
  player2B() {
    console.log('player 2 B - gameManager');
  }

  preload() {

    this.startProgress = 0;
    // action array hase each action twice so each action can map to 2 seperate controls
    this.actionArray = [
      this.player1Up,
      this.player1Down,
      this.player1Left,
      this.player1Right,
      this.player1A,
      this.player1B,
      this.player2Up,
      this.player2Down,
      this.player2Left,
      this.player2Right,
      this.player2A,
      this.player2B,
      this.player1Up,
      this.player1Down,
      this.player1Left,
      this.player1Right,
      this.player1A,
      this.player1B,
      this.player2Up,
      this.player2Down,
      this.player2Left,
      this.player2Right,
      this.player2A,
      this.player2B,
    ];

    // green arcade controls images
    this.load.image('GJoyRight', 'src/assets/images/arcadeControls/greenControls/GJoyRight.png');
    this.load.image('GJoyLeft', 'src/assets/images/arcadeControls/greenControls/GJoyLeft.png');
    this.load.image('GJoyDownRight', 'src/assets/images/arcadeControls/greenControls/GJoyDownRight.png');
    this.load.image('GJoyDownLeft', 'src/assets/images/arcadeControls/greenControls/GJoyDownLeft.png');
    this.load.image('GJoyUpRight', 'src/assets/images/arcadeControls/greenControls/GJoyUpRight.png');
    this.load.image('GJoyUpLeft', 'src/assets/images/arcadeControls/greenControls/GJoyUpLeft.png');
    this.load.image('GJoyUp', 'src/assets/images/arcadeControls/greenControls/GJoyUp.png');
    this.load.image('GJoyDown', 'src/assets/images/arcadeControls/greenControls/GJoyDown.png');
    this.load.image('GJoyNeutral', 'src/assets/images/arcadeControls/greenControls/GJoyNeutral.png');
    this.load.image('GButtonUp', 'src/assets/images/arcadeControls/greenControls/GButtonUp.png');
    this.load.image('GButtonDown', 'src/assets/images/arcadeControls/greenControls/GButtonDown.png');
    // blue arcade controls images
    this.load.image('BJoyRight', 'src/assets/images/arcadeControls/blueControls/BJoyRight.png');
    this.load.image('BJoyLeft', 'src/assets/images/arcadeControls/blueControls/BJoyLeft.png');
    this.load.image('BJoyDownRight', 'src/assets/images/arcadeControls/blueControls/BJoyDownRight.png');
    this.load.image('BJoyDownLeft', 'src/assets/images/arcadeControls/blueControls/BJoyDownLeft.png');
    this.load.image('BJoyUpRight', 'src/assets/images/arcadeControls/blueControls/BJoyUpRight.png');
    this.load.image('BJoyUpLeft', 'src/assets/images/arcadeControls/blueControls/BJoyUpLeft.png');
    this.load.image('BJoyUp', 'src/assets/images/arcadeControls/blueControls/BJoyUp.png');
    this.load.image('BJoyDown', 'src/assets/images/arcadeControls/blueControls/BJoyDown.png');
    this.load.image('BJoyNeutral', 'src/assets/images/arcadeControls/blueControls/BJoyNeutral.png');
    this.load.image('BButtonUp', 'src/assets/images/arcadeControls/blueControls/BButtonUp.png');
    this.load.image('BButtonDown', 'src/assets/images/arcadeControls/blueControls/BButtonDown.png');
    // yellow arcade controls images
    this.load.image('YJoyRight', 'src/assets/images/arcadeControls/yellowControls/YJoyRight.png');
    this.load.image('YJoyLeft', 'src/assets/images/arcadeControls/yellowControls/YJoyLeft.png');
    this.load.image('YJoyDownRight', 'src/assets/images/arcadeControls/yellowControls/YJoyDownRight.png');
    this.load.image('YJoyDownLeft', 'src/assets/images/arcadeControls/yellowControls/YJoyDownLeft.png');
    this.load.image('YJoyUpRight', 'src/assets/images/arcadeControls/yellowControls/YJoyUpRight.png');
    this.load.image('YJoyUpLeft', 'src/assets/images/arcadeControls/yellowControls/YJoyUpLeft.png');
    this.load.image('YJoyUp', 'src/assets/images/arcadeControls/yellowControls/YJoyUp.png');
    this.load.image('YJoyDown', 'src/assets/images/arcadeControls/yellowControls/YJoyDown.png');
    this.load.image('YJoyNeutral', 'src/assets/images/arcadeControls/yellowControls/YJoyNeutral.png');
    this.load.image('YButtonUp', 'src/assets/images/arcadeControls/yellowControls/YButtonUp.png');
    this.load.image('YButtonDown', 'src/assets/images/arcadeControls/yellowControls/YButtonDown.png');
    // red arcade controls images
    this.load.image('RJoyRight', 'src/assets/images/arcadeControls/redControls/RJoyRight.png');
    this.load.image('RJoyLeft', 'src/assets/images/arcadeControls/redControls/RJoyLeft.png');
    this.load.image('RJoyDownRight', 'src/assets/images/arcadeControls/redControls/RJoyDownRight.png');
    this.load.image('RJoyDownLeft', 'src/assets/images/arcadeControls/redControls/RJoyDownLeft.png');
    this.load.image('RJoyUpRight', 'src/assets/images/arcadeControls/redControls/RJoyUpRight.png');
    this.load.image('RJoyUpLeft', 'src/assets/images/arcadeControls/redControls/RJoyUpLeft.png');
    this.load.image('RJoyUp', 'src/assets/images/arcadeControls/redControls/RJoyUp.png');
    this.load.image('RJoyDown', 'src/assets/images/arcadeControls/redControls/RJoyDown.png');
    this.load.image('RJoyNeutral', 'src/assets/images/arcadeControls/redControls/RJoyNeutral.png');
    this.load.image('RButtonUp', 'src/assets/images/arcadeControls/redControls/RButtonUp.png');
    this.load.image('RButtonDown', 'src/assets/images/arcadeControls/redControls/RButtonDown.png');

    //red sounds
    this.load.audio('redASound', 'src/assets/sounds/controlSounds/redSounds/redA.mp3');
    this.load.audio('redBSound', 'src/assets/sounds/controlSounds/redSounds/redB.mp3');
    this.load.audio('redUpSound', 'src/assets/sounds/controlSounds/redSounds/redUp.mp3');
    this.load.audio('redDownSound', 'src/assets/sounds/controlSounds/redSounds/redDown.mp3');
    this.load.audio('redLeftSound', 'src/assets/sounds/controlSounds/redSounds/redLeft.mp3');
    this.load.audio('redRightSound', 'src/assets/sounds/controlSounds/redSounds/redRight.mp3');
    //blue sounds
    this.load.audio('blueASound', 'src/assets/sounds/controlSounds/blueSounds/blueA.mp3');
    this.load.audio('blueBSound', 'src/assets/sounds/controlSounds/blueSounds/blueB.mp3');
    this.load.audio('blueUpSound', 'src/assets/sounds/controlSounds/blueSounds/blueUp.mp3');
    this.load.audio('blueDownSound', 'src/assets/sounds/controlSounds/blueSounds/blueDown.mp3');
    this.load.audio('blueLeftSound', 'src/assets/sounds/controlSounds/blueSounds/blueLeft.mp3');
    this.load.audio('blueRightSound', 'src/assets/sounds/controlSounds/blueSounds/blueRight.mp3');
    //green sounds
    this.load.audio('greenASound', 'src/assets/sounds/controlSounds/greenSounds/greenA.mp3');
    this.load.audio('greenBSound', 'src/assets/sounds/controlSounds/greenSounds/greenB.mp3');
    this.load.audio('greenUpSound', 'src/assets/sounds/controlSounds/greenSounds/greenUp.mp3');
    this.load.audio('greenDownSound', 'src/assets/sounds/controlSounds/greenSounds/greenDown.mp3');
    this.load.audio('greenLeftSound', 'src/assets/sounds/controlSounds/greenSounds/greenLeft.mp3');
    this.load.audio('greenRightSound', 'src/assets/sounds/controlSounds/greenSounds/greenRight.mp3');
    //yellow sounds
    this.load.audio('yellowASound', 'src/assets/sounds/controlSounds/yellowSounds/yellowA.mp3');
    this.load.audio('yellowBSound', 'src/assets/sounds/controlSounds/yellowSounds/yellowB.mp3');
    this.load.audio('yellowUpSound', 'src/assets/sounds/controlSounds/yellowSounds/yellowUp.mp3');
    this.load.audio('yellowDownSound', 'src/assets/sounds/controlSounds/yellowSounds/yellowDown.mp3');
    this.load.audio('yellowLeftSound', 'src/assets/sounds/controlSounds/yellowSounds/yellowLeft.mp3');
    this.load.audio('yellowRightSound', 'src/assets/sounds/controlSounds/yellowSounds/yellowRight.mp3');
    
  }

  create() {
    //call this once every time you want to scramble the controls.
    this.buttonToActionMap = mapGamepadsToActionIndex();
    //generic one second timer to keep track of game time.
    const oneSecondTimer = this.time.addEvent({delay: 1000, callback: () => { this.sceneTimeSeconds++ }, callbackScope: this, loop: true});
    // set a random game to play next.
    this.setRandomNextGame();

    //green control images in phaser
    const gJoyDown = this.add.image(0, 32, 'GJoyDown');
    gJoyDown.visible = false;
    const gJoyUp = this.add.image(0, 32, 'GJoyUp');
    gJoyUp.visible = false;
    const gJoyLeft = this.add.image(0, 32, 'GJoyLeft');
    gJoyLeft.visible = false;
    const gJoyRight = this.add.image(0, 32, 'GJoyRight');
    gJoyRight.visible = false;
    const gJoyDownLeft = this.add.image(0, 32, 'GJoyDownLeft');
    gJoyDownLeft.visible = false;
    const gJoyDownRight = this.add.image(0, 32, 'GJoyDownRight');
    gJoyDownRight.visible = false;
    const gJoyUpLeft = this.add.image(0, 32, 'GJoyUpLeft');
    gJoyUpLeft.visible = false;
    const gJoyUpRight = this.add.image(0, 32, 'GJoyUpRight');
    gJoyUpRight.visible = false;
    const gJoyNeutral = this.add.image(0, 32, 'GJoyNeutral');
    gJoyNeutral.visible = false;
    const gBButtonUp = this.add.image(20, 32, 'GButtonUp');
    gBButtonUp.visible = false;
    const gBButtonDown = this.add.image(20, 32, 'GButtonDown');
    gBButtonDown.visible = false;
    const gAButtonUp = this.add.image(40, 32, 'GButtonUp');
    gAButtonUp.visible = false;
    const gAButtonDown = this.add.image(40, 32, 'GButtonDown');
    gAButtonDown.visible = false;
    // green control images added to a container for easy manipulation
    this.greenArcadeControls = this.add.container(50, 0, [
      gJoyNeutral, //0
      gJoyDown, //1
      gJoyUp, //2
      gJoyLeft, //3
      gJoyRight, //4
      gJoyDownLeft, //5
      gJoyDownRight, //6
      gJoyUpLeft, //7
      gJoyUpRight, //8
      gBButtonUp, //9
      gBButtonDown, //10
      gAButtonUp, //11
      gAButtonDown //12
    ]);
    this.greenArcadeControls.setScale(4);

    // blue control images in phaser
    const bJoyDown = this.add.image(0, 32, 'BJoyDown');
    bJoyDown.visible = false;
    const bJoyUp = this.add.image(0, 32, 'BJoyUp');
    bJoyUp.visible = false;
    const bJoyLeft = this.add.image(0, 32, 'BJoyLeft');
    bJoyLeft.visible = false;
    const bJoyRight = this.add.image(0, 32, 'BJoyRight');
    bJoyRight.visible = false;
    const bJoyDownLeft = this.add.image(0, 32, 'BJoyDownLeft');
    bJoyDownLeft.visible = false;
    const bJoyDownRight = this.add.image(0, 32, 'BJoyDownRight');
    bJoyDownRight.visible = false;
    const bJoyUpLeft = this.add.image(0, 32, 'BJoyUpLeft');
    bJoyUpLeft.visible = false;
    const bJoyUpRight = this.add.image(0, 32, 'BJoyUpRight');
    bJoyUpRight.visible = false;
    const bJoyNeutral = this.add.image(0, 32, 'BJoyNeutral');
    bJoyNeutral.visible = false;
    const bBButtonUp = this.add.image(20, 32, 'BButtonUp');
    bBButtonUp.visible = false;
    const bBButtonDown = this.add.image(20, 32, 'BButtonDown');
    bBButtonDown.visible = false;
    const bAButtonUp = this.add.image(40, 32, 'BButtonUp');
    bAButtonUp.visible = false;
    const bAButtonDown = this.add.image(40, 32, 'BButtonDown');
    bAButtonDown.visible = false;
    // blue control images added to a group for easy manipulation
    this.blueArcadeControls = this.add.container(300, 0, [
      bJoyNeutral, //0
      bJoyDown, //1
      bJoyUp, //2
      bJoyLeft, //3
      bJoyRight, //4
      bJoyDownLeft, //5
      bJoyDownRight, //6
      bJoyUpLeft, //7
      bJoyUpRight, //8
      bBButtonUp, //9
      bBButtonDown, //10
      bAButtonUp, //11
      bAButtonDown //12
    ]);
    this.blueArcadeControls.setScale(4);

    // yellow control images in phaser
    const yJoyDown = this.add.image(0, 32, 'YJoyDown');
    yJoyDown.visible = false;
    const yJoyUp = this.add.image(0, 32, 'YJoyUp');
    yJoyUp.visible = false;
    const yJoyLeft = this.add.image(0, 32, 'YJoyLeft');
    yJoyLeft.visible = false;
    const yJoyRight = this.add.image(0, 32, 'YJoyRight');
    yJoyRight.visible = false;
    const yJoyDownLeft = this.add.image(0, 32, 'YJoyDownLeft');
    yJoyDownLeft.visible = false;
    const yJoyDownRight = this.add.image(0, 32, 'YJoyDownRight');
    yJoyDownRight.visible = false;
    const yJoyUpLeft = this.add.image(0, 32, 'YJoyUpLeft');
    yJoyUpLeft.visible = false;
    const yJoyUpRight = this.add.image(0, 32, 'YJoyUpRight');
    yJoyUpRight.visible = false;
    const yJoyNeutral = this.add.image(0, 32, 'YJoyNeutral');
    yJoyNeutral.visible = false;
    const yBButtonUp = this.add.image(20, 32, 'YButtonUp');
    yBButtonUp.visible = false;
    const yBButtonDown = this.add.image(20, 32, 'YButtonDown');
    yBButtonDown.visible = false;
    const yAButtonUp = this.add.image(40, 32, 'YButtonUp');
    yAButtonUp.visible = false;
    const yAButtonDown = this.add.image(40, 32, 'YButtonDown');
    yAButtonDown.visible = false;
    // yellow control images added to a group for easy manipulation
    this.yellowArcadeControls = this.add.container(550, 0, [
      yJoyNeutral, //0
      yJoyDown, //1
      yJoyUp, //2
      yJoyLeft, //3
      yJoyRight, //4
      yJoyDownLeft, //5
      yJoyDownRight, //6
      yJoyUpLeft, //7
      yJoyUpRight, //8
      yBButtonUp, //9
      yBButtonDown, //10
      yAButtonUp, //11
      yAButtonDown //12
    ]);
    this.yellowArcadeControls.setScale(4);

    // red control images in phaser
    const rJoyDown = this.add.image(0, 32, 'RJoyDown');
    rJoyDown.visible = false;
    const rJoyUp = this.add.image(0, 32, 'RJoyUp');
    rJoyUp.visible = false;
    const rJoyLeft = this.add.image(0, 32, 'RJoyLeft');
    rJoyLeft.visible = false;
    const rJoyRight = this.add.image(0, 32, 'RJoyRight');
    rJoyRight.visible = false;
    const rJoyDownLeft = this.add.image(0, 32, 'RJoyDownLeft');
    rJoyDownLeft.visible = false;
    const rJoyDownRight = this.add.image(0, 32, 'RJoyDownRight');
    rJoyDownRight.visible = false;
    const rJoyUpLeft = this.add.image(0, 32, 'RJoyUpLeft');
    rJoyUpLeft.visible = false;
    const rJoyUpRight = this.add.image(0, 32, 'RJoyUpRight');
    rJoyUpRight.visible = false;
    const rJoyNeutral = this.add.image(0, 32, 'RJoyNeutral');
    rJoyNeutral.visible = false;
    const rBButtonUp = this.add.image(20, 32, 'RButtonUp');
    rBButtonUp.visible = false;
    const rBButtonDown = this.add.image(20, 32, 'RButtonDown');
    rBButtonDown.visible = false;
    const rAButtonUp = this.add.image(40, 32, 'RButtonUp');
    rAButtonUp.visible = false;
    const rAButtonDown = this.add.image(40, 32, 'RButtonDown');
    rAButtonDown.visible = false;
    // red control images added to a group for easy manipulation
    this.redArcadeControls = this.add.container(800, 0, [
      rJoyNeutral, //0
      rJoyDown, //1
      rJoyUp, //2
      rJoyLeft, //3
      rJoyRight, //4
      rJoyDownLeft, //5
      rJoyDownRight, //6
      rJoyUpLeft, //7
      rJoyUpRight, //8
      rBButtonUp, //9
      rBButtonDown, //10
      rAButtonUp, //11
      rAButtonDown //12
    ]);
    this.redArcadeControls.setScale(4);


    // setting up the arcade controls widget
    const widgetWidth = 600;
    this.arcadeControlWidget = this.add.container(innerWidth/2-widgetWidth, innerHeight-180);
    const arcadeControlWidgetBackground = this.add.rectangle(600,125,1200,100,999999, .5);
    const arcadeControlWidgetReadyBackground = this.add.rectangle(600,125,1200,100,0x99ff99);
    const arcadeControlWidgetIdleBackground = this.add.rectangle(600,125,1200,100,0xff9999);
    arcadeControlWidgetBackground.setStrokeStyle(3, 0xffffff);

    const mashButtons = this.add.text(300, 45, 'Mash Those Controls!', {fontSize: '50px', color: '#000000', stroke: '#ffffff', strokeThickness: 3});
    //this timer makes the mash buttons text flash colors
    const mashButtonstimer = this.time.addEvent({delay: 500, callback: () => {
      if(this.mashFlash) {
        if(mashButtons.style.color === "#000000" ) { mashButtons.setColor("#ffffff"); }
        else { mashButtons.setColor("#000000"); }
      }
    }, callbackScope: this, loop: true});

    this.arcadeControlWidget.add(arcadeControlWidgetBackground);
    this.arcadeControlWidget.add(arcadeControlWidgetReadyBackground);
    this.arcadeControlWidget.add(arcadeControlWidgetIdleBackground);
    this.arcadeControlWidget.add(mashButtons);
    //add all the colored control groups together into their own container
    const controlsDisplay = this.add.container(80,0, [
      this.greenArcadeControls,
      this.blueArcadeControls,
      this.yellowArcadeControls,
      this.redArcadeControls
    ]);
    // add that container to the widget
    this.arcadeControlWidget.add(controlsDisplay);

    // this timer checks if the controls have been touched and calls a function to do something about it.
    const touchCheckTimer = this.time.addEvent({delay: 1000, callback: this.checkControllerTouch, callbackScope: this, loop: true});

    //create sounds
    //red
    this.redASound = this.sound.add('redASound');
    this.redBSound = this.sound.add('redBSound');
    this.redUpSound = this.sound.add('redUpSound');
    this.redDownSound = this.sound.add('redDownSound');
    this.redLeftSound = this.sound.add('redLeftSound');
    this.redRightSound = this.sound.add('redRightSound');
    //blue
    this.blueASound = this.sound.add('blueASound');
    this.blueBSound = this.sound.add('blueBSound');
    this.blueUpSound = this.sound.add('blueUpSound');
    this.blueDownSound = this.sound.add('blueDownSound');
    this.blueLeftSound = this.sound.add('blueLeftSound');
    this.blueRightSound = this.sound.add('blueRightSound');
    //green
    this.greenASound = this.sound.add('greenASound');
    this.greenBSound = this.sound.add('greenBSound');
    this.greenUpSound = this.sound.add('greenUpSound');
    this.greenDownSound = this.sound.add('greenDownSound');
    this.greenLeftSound = this.sound.add('greenLeftSound');
    this.greenRightSound = this.sound.add('greenRightSound');
    //yellow
    this.yellowASound = this.sound.add('yellowASound');
    this.yellowBSound = this.sound.add('yellowBSound');
    this.yellowUpSound = this.sound.add('yellowUpSound');
    this.yellowDownSound = this.sound.add('yellowDownSound');
    this.yellowLeftSound = this.sound.add('yellowLeftSound');
    this.yellowRightSound = this.sound.add('yellowRightSound');


  }

  scrambleControls = () => {
    console.log('scrambling controls');
    this.buttonToActionMap = mapGamepadsToActionIndex();
  }
  changeBackgroundColor = (color: string) => {
    console.log('changing background color');
    const background = document.getElementById('game');
    if(background) {
        background.style.backgroundColor = color;
    }
  }
  getSceneTime = () => {
    return this.sceneTimeSeconds;
  }

  setMashFlash = (flash: boolean) => {
    this.mashFlash = flash;
  }

  //this function is called every second and checks if the controls have been touched. 
  // if yes, it checks if we've reached the required touches to start the game
  // if no, it counts down to when it eventually just restarts the title screen.
  checkControllerTouch = () => {
    if(!this.anyButtonPressed) {
      if(this.timeSinceControllerTouch >= 15) {
        this.timeSinceControllerTouch = 0;
        if(this.timersOnDEBUG) {this.goToTitleScene(); }
      } else if(!this.anyButtonPressed) {
        if(this.startProgress === 0) {
          this.timeSinceControllerTouch += 1;
        } else {
          if(this.startProgress > 240) {this.startProgress = 240} //80%
          else if(this.startProgress > 180) {this.startProgress = 180} //60%
          else if(this.startProgress > 120) {this.startProgress = 120} //40%
          else if(this.startProgress > 60) {this.startProgress = 60} //20%
          else if(this.startProgress <= 60) {this.startProgress = 0} //0%
        }
      }
    } else if(this.startProgress >= 300) {
      if(this.timersOnDEBUG) { this.goToNextGame(); }
    } else {
      this.timeSinceControllerTouch = 0;
    }
   }

  

  // takes input from one controller, displays the input on screen, and does whatever scrambled action is assigned to it.
  actOnInputs = (color: string, padIndex: number, padInfo: CondensedGamepadInputs | undefined) => {
    const soundSetVolume = 1;
    let controlSet: Phaser.GameObjects.Container;
    let soundSet = {buttonA: this.greenASound, buttonB: this.greenBSound, up: this.greenUpSound, down: this.greenDownSound, left: this.greenLeftSound, right: this.greenRightSound};
    switch(color) {
      case 'green':
        controlSet = this.greenArcadeControls;
        soundSet = {buttonA: this.greenASound, buttonB: this.greenBSound, up: this.greenUpSound, down: this.greenDownSound, left: this.greenLeftSound, right: this.greenRightSound};
        break;
      case 'red':
        controlSet = this.redArcadeControls;
        soundSet = {buttonA: this.redASound, buttonB: this.redBSound, up: this.redUpSound, down: this.redDownSound, left: this.redLeftSound, right: this.redRightSound};
        break;
      case 'yellow':
        controlSet = this.yellowArcadeControls;
        soundSet = {buttonA: this.yellowASound, buttonB: this.yellowBSound, up: this.yellowUpSound, down: this.yellowDownSound, left: this.yellowLeftSound, right: this.yellowRightSound};
        break;
      case 'blue':
      default:
        controlSet = this.blueArcadeControls;
        soundSet = {buttonA: this.blueASound, buttonB: this.blueBSound, up: this.blueUpSound, down: this.blueDownSound, left: this.blueLeftSound, right: this.blueRightSound};
        break;
    }
    if(controlSet.list[0] && controlSet.list[1] && controlSet.list[2] && controlSet.list[3] && controlSet.list[4] && controlSet.list[5]
      && controlSet.list[6] && controlSet.list[7] && controlSet.list[8] && controlSet.list[9] && controlSet.list[10] && controlSet.list[10]
      && controlSet.list[11] && controlSet.list[12]
    ) {
      if(!padInfo) {
        controlSet.list[11].visible = true;
        controlSet.list[9].visible = true;
        controlSet.list[0].visible = true;
        return null;
      }
      //diagonals
      if(padInfo.down && padInfo?.left) {
        //joystick down left
        controlSet.list[5].visible = true;
      }
      if(padInfo.down && padInfo?.right) {
        //joystick down right
        controlSet.list[6].visible = true;
      }
      if(padInfo.up && padInfo.right) {
        //joystick up right
        controlSet.list[8].visible = true;
      }
      if(padInfo.up && padInfo.left) {
        //joystick up left
        controlSet.list[7].visible = true;
      }
      if(!padInfo.down && !padInfo.up && !padInfo.left && !padInfo.right) {
        //joystick idle
        controlSet.list[0].visible = true;
      }
      // cardinal directions
      if(padInfo.up && !padInfo.left && !padInfo.right) { // if the up button is pressed alone
        //show the corresponding arcade control on screen
        //indicies are the order the images were put into the arcadecontrols container.
        controlSet.list[2].visible = true;
        //play a sound so players can start to memorize the noises of the controls without looking.
        if(!this.sound.getAll(soundSet.up.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.up.play({volume: soundSetVolume});
        } 
        //do the action in the action array that has the index in the up0 place of the buttonToActionMap
        this.actionArray[this.buttonToActionMap[`up${padIndex}`]]();
      }
      if(padInfo.left && !padInfo.down && !padInfo.up) {//left
        controlSet.list[3].visible = true;
        if(!this.sound.getAll(soundSet.left.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.left.play({volume: soundSetVolume});
        } 
        this.actionArray[this.buttonToActionMap[`left${padIndex}`]]();
      }
      if(padInfo.right && !padInfo.down && !padInfo.up) {//right
        controlSet.list[4].visible = true;
        if(!this.sound.getAll(soundSet.right.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.right.play({volume: soundSetVolume});
        } 
        this.actionArray[this.buttonToActionMap[`right${padIndex}`]]();
      }
      if(padInfo.down && !padInfo.left && !padInfo.right) {//down
        controlSet.list[1].visible = true;
        if(!this.sound.getAll(soundSet.down.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.down.play({volume: soundSetVolume});
        } 
        this.actionArray[this.buttonToActionMap[`down${padIndex}`]]();
      }
      // button presses
      if (!padInfo.AButton && !padInfo.BButton) { //both buttons idle
        controlSet.list[11].visible = true;
        controlSet.list[9].visible = true;
      }
      if(padInfo.AButton && !padInfo.BButton) { //a button only
        if(!this.sound.getAll(soundSet.buttonA.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.buttonA.play({volume: soundSetVolume});
        } 
        controlSet.list[12].visible = true;
        controlSet.list[9].visible = true;

        this.actionArray[this.buttonToActionMap[`AButton${padIndex}`]]();
      }
      if(padInfo.BButton && !padInfo.AButton) { // b button only
        if(!this.sound.getAll(soundSet.buttonB.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.buttonB.play({volume: soundSetVolume});
        } 
        controlSet.list[10].visible = true;
        controlSet.list[11].visible = true;

        this.actionArray[this.buttonToActionMap[`BButton${padIndex}`]]();
      }
      if(padInfo.BButton && padInfo.AButton) {// both buttons 
        if(!this.sound.getAll(soundSet.buttonB.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.buttonB.play({volume: soundSetVolume});
        } 
        if(!this.sound.getAll(soundSet.buttonA.key).map((instance) => {
          return instance.isPlaying
        }).includes(true)) {
          soundSet.buttonA.play({volume: soundSetVolume});
        } 
        controlSet.list[10].visible = true;
        controlSet.list[12].visible = true;

        this.actionArray[this.buttonToActionMap[`AButton${padIndex}`]]();
        this.actionArray[this.buttonToActionMap[`BButton${padIndex}`]]();
      }
    }

  }

  update() {
    // get keyboard input
    const cursors = this.input.keyboard.createCursorKeys();
    //hit the spacebar to scramble joystick controls.
    if(cursors.space.isDown) {
      this.cameras.main.shake(100, 0.003);
      this.buttonToActionMap = mapGamepadsToActionIndex();
    }

    // get gamepad input
    const padInfo = getGamepads2();
    this.anyButtonPressed = anyButtonPressed(padInfo);
    if(this.timersOnDEBUG) {
      if(this.anyButtonPressed && this.startProgress <= 300) {
        this.timeSinceControllerTouch = 0;
        this.startProgress += 1;
        this.checkControllerTouch();
      }
      if(this.arcadeControlWidget.list[1] && this.arcadeControlWidget.list[2]) {
        this.arcadeControlWidget.list[1].width = this.startProgress*4;
        this.arcadeControlWidget.list[2].width = this.timeSinceControllerTouch*80;
      }
    }

    //turn off visibility on control images from each of the 4 control pads.
    this.greenArcadeControls.list.forEach((image) => {
      if(image) { image.visible = false; }
    });
    this.blueArcadeControls.list.forEach((image) => {
      if(image) { image.visible = false; }
    });
    this.yellowArcadeControls.list.forEach((image) => {
      if(image) { image.visible = false; }
    });
    this.redArcadeControls.list.forEach((image) => {
      if(image) { image.visible = false; }
    });

    // this is an abstracted function to check which inputs on which control pads have been pressed and do actions based on that.
    // it has been abstracted so we can easily change the indicies to match the colors of the IRL controls. 
    // (ie: just in case index 3/padInfo[3] is not the green controls IRL in the future)
    this.actOnInputs('green', greenIndex, padInfo[greenIndex]);
    this.actOnInputs('red', redIndex, padInfo[redIndex]);
    this.actOnInputs('yellow', yellowIndex, padInfo[yellowIndex]);
    this.actOnInputs('blue', blueIndex, padInfo[blueIndex]);

   
  }
}
