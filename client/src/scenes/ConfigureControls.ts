import Phaser from 'phaser';
import { getGamepads2, mapGamepadsToActionIndex, CondensedGamepadInputs, anyButtonPressed } from '../gamepadManager';
import GameManager from './GameManager';


export default class ConfigureControls extends GameManager {

    state: number = 0;
    notificationTimer: number = 0;

    calibrate: Phaser.GameObjects.Text;
    thanks: Phaser.GameObjects.Text;
    handsOff: Phaser.GameObjects.Text;
    touchGreen: Phaser.GameObjects.Text;
    touchRed: Phaser.GameObjects.Text;
    touchYellow: Phaser.GameObjects.Text;
    touchBlue: Phaser.GameObjects.Text;


  constructor(sceneName: string) {
    super(sceneName);
  }

  preload() {
    
    const background = document.getElementById('game');
    if(background) {
        background.style.backgroundColor = '#000000';
    }

  }

  create() {

    this.calibrate = this.add.text(150, 200, "Please Calibrate Controls",
        {
            font: '900 100px ',
            color: `#ffffff`,
        }
    );
    this.thanks = this.add.text(150, 200, "Aw yeah. thats the stuff.\nThanks for calibrating me.\nyou were great.",
        {
            font: '900 100px ',
            color: `#ffffff`,
        }
    );
    this.handsOff = this.add.text(400, 400, "please keep your hands\naway from the controls.\n\nThis will be the only time\nwe ever ask this of you.",
        {
            font: '900 60px ',
            color: `#ffffff`,
        }
    );
    this.touchGreen = this.add.text(400, 500, "now, press a single\nGREEN button once.",
        {
            font: '900 80px ',
            color: `green`,
        }
    );
    this.touchRed = this.add.text(400, 500, "now, press a single\nRED button once.",
        {
            font: '900 80px ',
            color: `red`,
        }
    );
    this.touchYellow = this.add.text(400, 500, "now, press a single\nYELOW button once.",
        {
            font: '900 80px ',
            color: `yellow`,
        }
    );
    this.touchBlue = this.add.text(400, 500, "now, press a single\nBLUE button once.",
        {
            font: '900 80px ',
            color: `blue`,
        }
    );

  }


  update() {
    // get gamepad input and massage it as needed.
    const padInfo = getGamepads2();
    const touched0 = Object.values(padInfo[0] || []).includes(true);
    const touched1 = Object.values(padInfo[1] || []).includes(true);
    const touched2 = Object.values(padInfo[2] || []).includes(true);
    const touched3 = Object.values(padInfo[3] || []).includes(true);

    // run through calibration states
    if(this.state===0) { //instructions
        this.touchGreen.visible = false;
        this.touchRed.visible = false;
        this.touchYellow.visible = false;
        this.touchBlue.visible = false;
        this.thanks.visible = false;

        if(this.notificationTimer === 500) {
            this.notificationTimer=0;
            this.state=1;
        } else {
            this.notificationTimer++;
        }
    } else if (this.state===1) { // press green button
        this.notificationTimer++
        this.touchGreen.visible = true;
        this.handsOff.visible = false;

        if((touched0 || touched1 || touched2 || touched3) && this.notificationTimer >= 100) {
            if(touched0) { super.setGreenIndex(0) } 
            else if (touched1) { super.setGreenIndex(1)}
            else if (touched2) { super.setGreenIndex(2)}
            else if (touched3) { super.setGreenIndex(3)}
            this.notificationTimer=0;
            this.state=2
        }
   
    } else if (this.state===2) { // press red button
        this.notificationTimer++
        this.touchGreen.visible=false;
        this.touchRed.visible=true;

        if((touched0 || touched1 || touched2 || touched3) && this.notificationTimer >= 100) {
            if(touched0) { super.setRedIndex(0) } 
            else if (touched1) { super.setRedIndex(1)}
            else if (touched2) { super.setRedIndex(2)}
            else if (touched3) { super.setRedIndex(1)}
            this.notificationTimer=0;
            this.state=3
        }
    } else if (this.state===3) { // press yellow button
        this.notificationTimer++;
        this.touchRed.visible=false;
        this.touchYellow.visible=true;

        if((touched0 || touched1 || touched2 || touched3) && this.notificationTimer >= 100) {
            if(touched0) { super.setYellowIndex(0) } 
            else if (touched1) { super.setYellowIndex(1) }
            else if (touched2) { super.setYellowIndex(2) }
            else if (touched3) { super.setYellowIndex(3) }
            this.notificationTimer=0;
            this.state=4
        }
    } else if (this.state===4) { // press blue button
        this.notificationTimer++;
        this.touchYellow.visible=false;
        this.touchBlue.visible=true;

        if((touched0 || touched1 || touched2 || touched3) && this.notificationTimer >= 100) {
            if(touched0) { super.setBlueIndex(0) } 
            else if (touched1) { super.setBlueIndex(1)}
            else if (touched2) { super.setBlueIndex(2)}
            else if (touched3) { super.setBlueIndex(3)}
            this.notificationTimer=0;
            this.state=5
        }
    } else if (this.state===5) { // thanks for calibrating
        this.notificationTimer++;
        this.calibrate.visible=false;
        this.touchBlue.visible=false;
        this.thanks.visible=true;

        if(this.notificationTimer===200) {
            this.thanks.visible=false;
            this.game.scene.stop(this.scene.settings.key);
            this.game.scene.start('TitleScreen');
        }
    } 
  }
}
