import GameManager from '../GameManager';

export default class GetToTheChoppa extends GameManager {
    constructor() {
        super('GetToTheChoppa');
      }

      preload() {
        super.preload();
        this.scrambleControls();
        this.changeBackgroundColor('#ff33aa');
        console.log('were in GetToTheChoppa');

        this.load.image('logo', 'assets/phaser3-logo.png');
        
      }
      create() {
        super.create();
        
        const logo = this.add.image(400, 70, 'logo');
        this.tweens.add({
        targets: logo,
        y: 650,
        duration: 1500,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1
        });

      }
      update() {
        super.update();

      }


    // ----------------------------------------- OVER WRITTEN FUNCTIONS FROM GAME MANAGER -------------------------------------------
    // player 1 possible actions
    player1Up() {
        // console.log('player 1 UP  - get To the choppa!');
    }
    player1Right() {
        // console.log('player 1 RIGHT  - get To the choppa!');
    }
    player1Left() {
        // console.log('player 1 LEFT  - get To the choppa!');
    }
    player1Down() {
        // console.log('player 1 DOWN - get To the choppa!');
    }
    player1A() {
        // console.log('player 1 A  - get To the choppa!!');
    }
    player1B() {
        // console.log('player 1 B  - get To the choppa!!');
    }
    // player 2 possible actions
    player2Up() {
        // console.log('player 2 UP  - get To the choppa!!');
    }
    player2Right() {
        // console.log('player 2 RIGHT  - get To the choppa!!');
    }
    player2Left() {
        // console.log('player 2 LEFT  - get To the choppa!!');
    }
    player2Down() {
        // console.log('player 2 DOWN  - get To the choppa!!');
    }
    player2A() {
        // console.log('player 2 A  - get To the choppa!!');
    }
    player2B() {
        // console.log('player 2 B  - get To the choppa!!');
    }
    goToNextGame() {
        console.log('no op');
    }
    


}