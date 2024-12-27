import Phaser from 'phaser';
import { getGamepads2, mapGamepadsToActionIndex } from '../gamepadManager';

export default class Demo extends Phaser.Scene {
  gamepadText: any;
  actionText: any;
  actionArray: any;
  buttonToActionMap: any;

  constructor() {
    super('GameScene');
  }

  // player 1 possible actions
  player1Up() {
    console.log('player 1 UP');
  }
  player1Right() {
    console.log('player 1 RIGHT');
  }
  player1Left() {
    console.log('player 1 LEFT');
  }
  player1Down() {
    console.log('player 1 DOWN');
  }
  player1A() {
    console.log('player 1 A');
  }
  player1B() {
    console.log('player 1 B');
  }
  // player 2 possible actions
  player2Up() {
    console.log('player 2 UP');
  }
  player2Right() {
    console.log('player 2 RIGHT');
  }
  player2Left() {
    console.log('player 2 LEFT');
  }
  player2Down() {
    console.log('player 2 DOWN');
  }
  player2A() {console.log('player 2 A');
  }
  player2B() {
    console.log('player 2 B');
  }


  preload() {
    this.load.image('logo', 'assets/phaser3-logo.png');
    
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
    
  }

  create() {

    //call this once every time you want to scramble the controls.
    this.buttonToActionMap = mapGamepadsToActionIndex();

    let fifteens = 0;
    const countFifteens = () => {
      fifteens++;
      console.log(fifteens);
    };
    const fifteenSecondTimer = this.time.addEvent({delay: 15000, callback: countFifteens, callbackScope: this, loop: true})

    const logo = this.add.image(400, 70, 'logo');
    this.tweens.add({
      targets: logo,
      y: 350,
      duration: 1500,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
    this.gamepadText = this.add.text(700,300, this.gamepadText);
    this.actionText = this.add.text(400, 600, this.actionText);

  }

  update() {

    const padInfo = getGamepads2();

    // get keyboard input
    const cursors = this.input.keyboard.createCursorKeys();
    //hit the spacebar to scramble joystick controls.
    if(cursors.space.isDown) {
      this.buttonToActionMap = mapGamepadsToActionIndex();
    }

    if(padInfo[0]?.up) { // if the up button on pad 0 is pressed
      //do the action in the action array that has the index in the up0 place of the buttonToActionMap
      this.actionArray[this.buttonToActionMap['up0']]();
    }
    if(padInfo[0]?.left) {
      this.actionArray[this.buttonToActionMap['left0']]();
    }
    if(padInfo[0]?.right) {
      this.actionArray[this.buttonToActionMap['right0']]();
    }
    if(padInfo[0]?.down) {
      this.actionArray[this.buttonToActionMap['down0']]();
    }
    if(padInfo[0]?.AButton) {
      this.actionArray[this.buttonToActionMap['AButton0']]();
    }
    if(padInfo[0]?.BButton) {
      this.actionArray[this.buttonToActionMap['BButton0']]();
    }// gamepad 1
    if(padInfo[1]?.up) {
      this.actionArray[this.buttonToActionMap['up1']]();
    }
    if(padInfo[1]?.left) {
      this.actionArray[this.buttonToActionMap['left1']]();
    }
    if(padInfo[1]?.right) {
      this.actionArray[this.buttonToActionMap['right1']]();
    }
    if(padInfo[1]?.down) {
      this.actionArray[this.buttonToActionMap['down1']]();
    }
    if(padInfo[1]?.AButton) {
      this.actionArray[this.buttonToActionMap['AButton1']]();
    }
    if(padInfo[1]?.BButton) {
      this.actionArray[this.buttonToActionMap['BButton1']]();
    }// gamepad 2
    if(padInfo[2]?.up) {
      this.actionArray[this.buttonToActionMap['up2']]();
    }
    if(padInfo[2]?.left) {
      this.actionArray[this.buttonToActionMap['left2']]();
    }
    if(padInfo[2]?.right) {
      this.actionArray[this.buttonToActionMap['right2']]();
    }
    if(padInfo[2]?.down) {
      this.actionArray[this.buttonToActionMap['down2']]();
    }
    if(padInfo[2]?.AButton) {
      this.actionArray[this.buttonToActionMap['AButton2']]();
    }
    if(padInfo[2]?.BButton) {
      this.actionArray[this.buttonToActionMap['BButton2']]();
    }// gamepad 3
    if(padInfo[3]?.up) {
      this.actionArray[this.buttonToActionMap['up3']]();
    }
    if(padInfo[3]?.left) {
      this.actionArray[this.buttonToActionMap['left3']]();
    }
    if(padInfo[3]?.right) {
      this.actionArray[this.buttonToActionMap['right3']]();
    }
    if(padInfo[3]?.down) {
      this.actionArray[this.buttonToActionMap['down3']]();
    }
    if(padInfo[3]?.AButton) {
      this.actionArray[this.buttonToActionMap['AButton3']]();
    }
    if(padInfo[3]?.BButton) {
      this.actionArray[this.buttonToActionMap['BButton3']]();
    }

    const gamePadString = padInfo.map((pad, index) => {
      return `
    gamepad ${index}: {
      AButton: ${pad?.AButton},
      BButton: ${pad?.BButton},
      up: ${pad?.up},
      down: ${pad?.down},
      left: ${pad?.left},
      right: ${pad?.right},
    },
    `;
    });

    this.gamepadText.setText(gamePadString);
  }
}
