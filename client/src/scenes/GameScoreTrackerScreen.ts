import GameManager from "./GameManager";

export default class GameScoreTrackerScreen extends GameManager {
    constructor() {
        super('GameScoreTrackerScreen');
    }
    
    titleText: any;
    GCRed = '7a243d';
    GCOrange = 'ff6538';
    GCLightOrange = 'ff9b51';
    GCYellow = 'ffbf4c';
    GCBlue = '00c1ff';

    possibleGames = ['StayOnTheIsland', 'ShootIncomingBaddies'];

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
        this.load.image('stayOnIslandScreenshot', 'src/assets/images/stayOnTheIsland/stay_on_the_island_screenshot.png');
    };

    create() {
        if(!this.sound.getAll('Title_BG_music').map((instance) => {
            return instance.isPlaying
        }).includes(true)) {
            const bgMusic = this.sound.add('Title_BG_music', {loop: true, volume: .5});
            bgMusic.play();
        }
        const orangeSection1 = this.add.rectangle(0,-400,2000,2000,Phaser.Display.Color.HexStringToColor(`#${this.GCLightOrange}`).color);
        orangeSection1.rotation += -0.5;
        const orangeSection2 = this.add.rectangle(1750,-400,2000,2000,Phaser.Display.Color.HexStringToColor(`#${this.GCLightOrange}`).color);
        orangeSection2.rotation += 0.5;

        const possibleGameScreenShots = {
            StayOnTheIsland: 'stayOnIslandScreenshot',
        };


        const allGamesPlayed = super.getGamesPlayed();
     
        console.log(allGamesPlayed);
        const lastGamePlayed = allGamesPlayed[0];
        const pinkWinsNum = allGamesPlayed.filter((game) => {
            return game.winner.toUpperCase() === "PINK";
        }).length;
        const tealWinsNum = allGamesPlayed.filter((game) => {
            return game.winner.toUpperCase() === "TEAL";
        }).length;

        const previousGameWidth = 250;
        const previousGameHeight = 150;

        super.setRandomNextGame();
        
        allGamesPlayed.forEach((game, index) => {
            // const oldGameContainer = this.add.container()

            let yValue = Math.floor(index/3);
            const tintValue = Phaser.Display.Color.HexStringToColor(game.winner.toUpperCase() === 'PINK' ? '#ff5050' : '#50ff50').color;
            //width of image*number of images + 20px gutter*number of previous images-1+starting width
            const adjustedIndex = index % 3;
            const xLocation = ((adjustedIndex+1)*previousGameWidth)+((adjustedIndex-1)*20)+(window.innerWidth/2-((previousGameWidth/2)+20+previousGameWidth))-100;
            //height of start of image array+height of image * number of current row + 20px gutter * number of current row
            const yLocation = 300+(previousGameHeight*yValue)+(20*yValue)
            this.add.image(xLocation, yLocation, possibleGameScreenShots[game.gameTitle as keyof typeof possibleGameScreenShots])
            .setDisplaySize(previousGameWidth, previousGameHeight)
            .setTint(tintValue);
            const gameNum = allGamesPlayed.length - index;
            this.add.text(xLocation-(previousGameWidth/4), yLocation-(previousGameHeight/2), `Match ${gameNum}`, 
                {
                    fontSize: '30px',
                    color: '#ffffff',
                }
            );
        });

        const winnerText = this.add.text(window.innerWidth/2, 100, `${lastGamePlayed.winner.toUpperCase()} WON!`,
            {fontSize: '120px', color: lastGamePlayed.winner.toUpperCase() === 'PINK' ? '#ff5050' : '#50ff50', stroke: '#ffffff', strokeThickness: 10}
        ).setOrigin(0.5, 0.5);
        this.tweens.add({
            targets: winnerText,
            size: 90,
            // rotation: -0.4,
            duration: 300,
            infinite: true,
            yoyo: true, 
        });

        const tealWinsText = this.add.text(240, 200, `Teal wins:`,
            {fontSize: '70px', color: '#50ff50', stroke: '#000000', strokeThickness: 10}
        ).setOrigin(0.5, 0.5);
        const tealWinsTextNum = this.add.text(240, 400, `${tealWinsNum}`,
            {fontSize: '120px', color: '#50ff50', stroke: '#000000', strokeThickness: 10}
        ).setOrigin(0.5, 0.5);
        // this.createTallyMarks(tealWinsNum, '#50ff50', 70, 230, 300);
        const pinkWinsText = this.add.text(window.innerWidth-220, 200, `Pink wins:`,
            {fontSize: '70px', color: '#ff5050', stroke: '#000000', strokeThickness: 10}
        ).setOrigin(0.5, 0.5);
        const pinkWinsTextNum = this.add.text(window.innerWidth-220, 400, `${pinkWinsNum}`,
            {fontSize: '120px', color: '#ff5050', stroke: '#000000', strokeThickness: 10}
        ).setOrigin(0.5, 0.5);
        // this.createTallyMarks(pinkWinsNum, '#ff5050', 70, window.innerWidth-220, 300);

        super.create();
    };
 
    update() {
        super.update();
        
        // console.log(this.getSceneTime());
    };

}
