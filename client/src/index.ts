import Phaser from 'phaser';
import config from './config';
import GetToTheChoppa from './scenes/games/GetToTheChoppa';
import StayOnTheIsland from './scenes/games/StayOnTheIsland';
import ShootIncomingBaddies from './scenes/games/ShootIncomingBaddies';
import TitleScreen from './scenes/TitleScreen';
import ConfigureControls from './scenes/ConfigureControls';
import GameScoreTrackerScreen from './scenes/GameScoreTrackerScreen';
import PressYourButtons from './scenes/games/PressYourButtons';

const game = new Phaser.Game(
  Object.assign(config, {
    // scene: [GameManager],
  }),
);

// MENU SCREENS
game.scene.add('ConfigureControls', ConfigureControls);
game.scene.add('TitleScreen', TitleScreen);
game.scene.add('GameScoreTrackerScreen', GameScoreTrackerScreen);

game.scene.add('GetToTheChoppa', GetToTheChoppa); //depreciated / template

// GAMES
game.scene.add('StayOnTheIsland', StayOnTheIsland);
game.scene.add('ShootIncomingBaddies', ShootIncomingBaddies);
game.scene.add('PressYourButtons', PressYourButtons);

const sceneArray = ['ConfigureControls', 'TitleScreen'];
// const sceneArray = ['TitleScreen', 'ShootIncomingBaddies'];
// const sceneArray = ['PressYourButtons'];
// const sceneArray = ['TitleScreen'];
let sceneIndex = 0;

const advanceScene = () => {

  game.scene.stop(sceneArray[sceneIndex]);
  if(sceneIndex === sceneArray.length -1) {
    sceneIndex = 0;
  } else {
    sceneIndex++; 
  }
  game.scene.start(sceneArray[sceneIndex])
};


game.scene.start(sceneArray[0]); 
