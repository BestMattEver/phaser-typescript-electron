import GameManager from "./GameManager";

export default class TitleScreen extends GameManager {
    constructor() {
        super('TitleScreen');
    }
    
    titleText: any;
    GCRed = '7a243d';
    GCOrange = 'ff6538';
    GCLightOrange = 'ff9b51';
    GCYellow = 'ffbf4c';
    GCBlue = '00c1ff';

    textTouch: Phaser.GameObjects.Text;
    textHands: Phaser.GameObjects.Text;
    textArcade: Phaser.GameObjects.Text;

    explainerContainer1: Phaser.GameObjects.Container;
    explainerContainer2: Phaser.GameObjects.Container;
    explainerContainer3: Phaser.GameObjects.Container;

    pinkColor = new Phaser.Display.Color(242, 166, 190);
    tealColor = new Phaser.Display.Color(111, 196, 169);

    preload() {
        super.preload();
        this.scrambleControls();
        this.changeBackgroundColor(`#${this.GCBlue}`);

        this.load.audio('Title_BG_music',
            [
                'src/assets/sounds/Casual_Arcade_Track_1_(looped).ogg',
                'src/assets/sounds/Casual_Arcade_Track_1_(looped).mp3'
            ]
        );

        this.load.spritesheet('titleScreenSprites', 'src/assets/images/title_screen_sprite_sheet.png', 
            {
                frameWidth: 400,
                frameHeight: 250,
            });
        this.load.image('stayonIslandScreenshot', 'src/assets/images/title_screen_sprite_sheet.png');

        console.log('in title scren');

    };

    create() {
        super.create();
        if(!this.sound.getAll('Title_BG_music').map((instance) => {
            return instance.isPlaying
        }).includes(true)) {
            const bgMusic = this.sound.add('Title_BG_music', {loop: true, volume: .5});
            bgMusic.play();
        } 
        super.writeGamesPlayedToFile();
        super.setGamesPlayed([]);

        const orangeSection = this.add.rectangle(0,-400,2000,2000,0xff6538);
        orangeSection.rotation += -0.5;

        this.textTouch = this.add.text(-200, 500, "TOUCH",
            {
                font: '900 124px ',
                color: this.tealColor.rgba,
                stroke: '#ffffff',
                strokeThickness: 40,
            }
        );
        this.textHands = this.add.text(800, -500, "HANDS",
            {
                font: '900 124px ',
                color: this.pinkColor.rgba,
                stroke: '#ffffff',
                strokeThickness: 40,
            }
        );
        this.textArcade = this.add.text(-500, -500, "ARCADE!",
            {
                font: '900 170px ',
                color: `#${this.GCBlue}`,
                stroke: '#ffffff',
                strokeThickness: 40,
            }
        );  
        this.textTouch.rotation += -0.5
        this.textHands.rotation += -0.5
        this.textArcade.rotation += -0.5

        this.tweens.add({
            targets: this.textTouch,
            x: -20,
            y: 350,
            duration: 200,
            delay: 150,
        });
        this.tweens.add({
            targets: this.textHands,
            x: 350,
            y: 150,
            duration: 200,
            delay: 150,
        });
        this.tweens.add({
            targets: this.textArcade,
            x: 110,
            y: 430,
            duration: 250,
            delay: 400,
        });

        
        // explainer 1
        const explainer1Text1 = this.add.text(0,0, 'The controls are scrambled!',
            {font: '900 32px ', color: `#ffffff`, stroke: '#000000', strokeThickness: 5},
        );
        const explainer1Pic = this.add.sprite(250,150, 'titleScreenSprites');
        const scrambleAnimation = {
            key: 'scrambled',
            defaultTextureKey: "titleScreenSprites",
            duration: 1,
            frames: [
                { frame: 0, duration: 1000},
                { frame: 1, duration: 700},
                { frame: 2, duration: 500},
                { frame: 3, duration: 300},
                { frame: 4, duration: 300},
                { frame: 5, duration: 300},
                { frame: 6, duration: 300},
                { frame: 7, duration: 300},
                { frame: 8, duration: 300},
                { frame: 9, duration: 300},
                { frame: 10, duration: 300},
                { frame: 11, duration: 300},
                { frame: 12, duration: 300},
                { frame: 11, duration: 300},
                { frame: 12, duration: 300},
                { frame: 11, duration: 300},
                { frame: 12, duration: 300},
                { frame: 11, duration: 2000},
            ],
            repeat: -1,
        };
        this.anims.create(scrambleAnimation);
        this.anims.play('scrambled', explainer1Pic);

        this.explainerContainer1 = this.add.container(2500, 175);
        this.explainerContainer1.add([explainer1Pic, explainer1Text1]);
        this.tweens.add({
            targets: this.explainerContainer1,
            x: 1050,
            duration: 250,
            delay: 2000,
        });

        // explainer 2
        const explainer2Text1 = this.add.text(100,0, 'Play minigames!', 
            {font: '900 32px ', color: `#ffffff`, stroke: '#000000', strokeThickness: 5},
        );
        const explainer2Pic = this.add.sprite(250,150, 'titleScreenSprites');
        const gamesAnimation = {
            key: 'games',
            defaultTextureKey: "titleScreenSprites",
            duration: 1,
            frames: [
                { frame: 35, duration: 3300},
                { frame: 36, duration: 3300},
                { frame: 37, duration: 3300},
            ],
            repeat: -1,
        };
        this.anims.create(gamesAnimation);
        this.anims.play('games', explainer2Pic);
        this.explainerContainer2 = this.add.container(2500,600);
        this.explainerContainer2.add([explainer2Pic, explainer2Text1]);
        this.tweens.add({
            targets: this.explainerContainer2,
            x: 300,
            duration: 250,
            delay: 4000,
        });

        // explainer 3
        const explainer3Text1 = this.add.text(95,0, 'You will probably', 
            {font: '900 32px ', color: `#ffffff`, stroke: '#000000', strokeThickness: 5},
        );
        const explainer3Text2 = this.add.text(35,250, 'TOUCH', 
            {font: '900 64px ', color: this.tealColor.rgba, stroke: '#ffffff', strokeThickness: 10},
        );
        const explainer3Text3 = this.add.text(250,250, 'HANDS', 
            {font: '900 64px ', color: this.pinkColor.rgba, stroke: '#ffffff', strokeThickness: 10},
        );
        const explainer3Pic = this.add.sprite(250,150, 'titleScreenSprites');
        const handsAnimation = {
            key: 'hands',
            defaultTextureKey: "titleScreenSprites",
            duration: 1,
            frames: [
                { frame: 14, duration: 800},
                { frame: 15, duration: 800},
                { frame: 16, duration: 800},
                { frame: 17, duration: 800},
                { frame: 18, duration: 800},
                { frame: 19, duration: 800},
                { frame: 20, duration: 800},
                { frame: 21, duration: 800},
            ],
            repeat: -1,
        };
        this.anims.create(handsAnimation);
        this.anims.play('hands', explainer3Pic);
        this.explainerContainer3 = this.add.container(2500,500);
        this.explainerContainer3.add([explainer3Pic, explainer3Text1, explainer3Text2, explainer3Text3]);
        this.tweens.add({
            targets: this.explainerContainer3,
            x: 850,
            duration: 250,
            delay: 6000,
            onComplete: () => {
                console.log('title finished');
            }
        });

    };
 
    update() {
        super.update();
        
        // console.log(this.getSceneTime());
    };

}
