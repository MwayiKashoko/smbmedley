/*
Things to do

make code better/cleaner and optimize graphics, add code for lost levels/smb3/smw/make your own mario levels

/all powerups
/fix hitboxes
/all enemies (/increase score when killed...,) Maybe do something with palettes?
/all blocks (/side collisions when running full speed at pit)
/reset function
/underground section
/pause
/all mario mechanics stuff
/mario jump mechanics
/flagpole, /castle, /ending the level, and /transitioning to the next level
/animations, /score, /timer, /world, /music
/no backwards scrolling
/How to Play button
organize code and add commnets
/Title screen
/Make 1-2, 1-3, 1-4, and 8-4

Advanced stuff:

Add different types of challenges using 
//css filter and other stuff (
//100 seconds per level, 
//randomizer,
//item randomizer,
//enemy randomizer, 
//block randomizer,
//bricks spawn enemies
//Make random blocks have firebars,
//everything has a shadow, 
//make everything a moving platform, 
//everything is hammer bros,
//Every enemy throws hammers
//ever enemy is bowser,
//mario always has fireflower,
//mario is always invincible,
//no friction,
//every block contains a poison mushroom,
//coins are poison,
//enemies fall from sky,
//poison mushrooms fall from the sky,
//Alice in wonderland (everything is twice as big, everything is twice as small depending on the slider),
//create a game genie
...)

Add a random/infinite level generator? and all the enemies in super mario bros
Make an AI that completes levels (Maybe later when I learn neural networks)?
*/

"use strict";
//Obviously global variables are bad but there is not other way for this program to work without these global variables
//creates canvas and allows 2d graphics to be drawn to the screen
const canvas = document.getElementById("canvas");
const graphics = canvas.getContext("2d");
//volume slider
const volume = document.getElementById("volume");
//width and height of the canvas (width = 800px, height = 600px) 4:3 aspect ratio
const width = canvas.width;
const height = canvas.height;

//The challenge dropdown and slider for if the user decides to use them
const challengeSelect = document.getElementById("challengeSelect");
const challengeSlider = document.getElementById("challengeSlider");
const canUseChallengeSlider = document.getElementById("canUseChallengeSlider");

//Music that plays when paused that is supposed to be secret
const pauseMusic = [new Audio("mainSounds/FileSelect.mp3"), new Audio("mainSounds/PiranhaLullaby.mp3"), new Audio("mainSounds/YoshiFindsMario.mp3"), new Audio("mainSounds/MusicBox.mp3"), new Audio("mainSounds/EndingMusic.mp3")];

//The shift to match each game to it's original aspect ratio
let shiftWidth = 0;
//newWidth as a result of shiftWidth
let newWidth = width;

//Determines which game is currently running (smb, smbll smb2, smb3, smw, nsmbds, nsmbwii, smm...)
let game = null;
//current pathname of the url
let pathname;
//If the game has ended then the code will reset back to the game selection screen
let gameEnded = false;

window.onload = function() {
    //function declarations
    let startup;
    let titleScreen;
    let gameSelectTransition;
    let gameSelectScreen;

    //The button you clcik to press play
    const playButton = document.getElementById("playButton");
    //Current state of the program (What game is it on or is it on the title screen etc.)
    let state = "none";
    let sounds = [];

	graphics.font = "80px Arial";

	const text = graphics.measureText("MWAYI KASHOKO");

    let gradient = graphics.createLinearGradient(Math.floor(width/2-text.width/2), height/2+40, Math.floor(width/2+text.width/2), height/2+40);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(.17, "magenta");
    gradient.addColorStop(.33, "purple");
    gradient.addColorStop(.5, "blue");
    gradient.addColorStop(.67, "cyan");
    gradient.addColorStop(.83, "green");
    gradient.addColorStop(1, "yellow");

    graphics.fillStyle = gradient;
    graphics.textAlign = "center";

    graphics.shadowOffsetX = -8;
    graphics.shadowOffsetY = 8;
    let offsetAngle = 0;
    graphics.shadowBlur = 15;
    graphics.shadowColor = "white";

    let x = 0;

    const startupSound = new Audio("mainSounds/startup.wav");
    sounds.push(startupSound);
    startupSound.playbackRate = 1.5;

    startup = () => {
    	graphics.clearRect(0, 0, width, height);

	    graphics.shadowColor = "white";
	    graphics.shadowOffsetX = -7*Math.cos(offsetAngle);
    	graphics.shadowOffsetY = 7*Math.sin(offsetAngle);
	    graphics.fillStyle = gradient;
    	graphics.fillText("MWAYI KASHOKO", width/2, height/2+20);

	    graphics.shadowColor = "black";
    	graphics.fillStyle = "black";
    	graphics.fillRect(x, height/2-50, width, 80);

    	x += 10;
    	offsetAngle += .125;

        let frameId;

        if (x > width) {
            state = "main title screen";
            cancelAnimationFrame(frameId);

            graphics.shadowBlur = 0;
            graphics.shadowOffsetX = 0;
            graphics.shadowOffsetY = 0;
            graphics.fillStyle = "white";
            graphics.font = "30px smb";
            graphics.globalAlpha = 0;
            titleScreen();
        }

    	if (state == "startup") {
    		frameId = requestAnimationFrame(startup);
    	}
    }

    const titleScreenImage = new Image();
    titleScreenImage.src = "mainImages/titleScreenImage.jpeg";
    const titleScreenMusic = new Audio("mainSounds/titleScreen.wav");
    sounds.push(titleScreenMusic);

    titleScreen = () => {
        graphics.clearRect(0, 0, width, height);

        titleScreenMusic.play();

        graphics.drawImage(titleScreenImage, 0, 0, width, height);
        graphics.fillText("Press Enter To Start", width/2, 100);

        if (graphics.globalAlpha < 1) {
            graphics.globalAlpha += 0.01;
        }

        let frameId;

        if (state == "main title screen") {
            frameId = requestAnimationFrame(titleScreen);
        } else {
            titleScreenMusic.pause();
            graphics.globalAlpha = 1;
            cancelAnimationFrame(frameId);
            gameSelectTransition();
        }
    }

    const transitionToGameSelect1 = new Audio("mainSounds/transitionToGameSelect1.wav");
    sounds.push(transitionToGameSelect1);
    transitionToGameSelect1.hasPlayed = false;
    const transitionToGameSelect2 = new Audio("mainSounds/transitionToGameSelect2.wav");
    sounds.push(transitionToGameSelect2);
    transitionToGameSelect2.hasPlayed = false;
    let transitionRadius = 0;
    let firstTransitionToGameSelect = false;

    gameSelectTransition = () => {
        graphics.clearRect(0, 0, width, height);

        graphics.fillStyle = "rgb(245, 161, 66)";

        if (!transitionToGameSelect1.hasPlayed) {
            transitionToGameSelect1.play();
            transitionToGameSelect1.hasPlayed = true;
        }

        if (firstTransitionToGameSelect && !transitionToGameSelect2.hasPlayed) {
            transitionToGameSelect2.play();
            transitionToGameSelect2.hasPlayed = true;
        }

        graphics.beginPath();

        if (!firstTransitionToGameSelect) {
            graphics.drawImage(titleScreenImage, 0, 0, width, height);
        }

        graphics.arc(width/2, height/2, transitionRadius, 0, Math.PI*2);
        graphics.closePath();
        graphics.fill();

        if (transitionRadius < width/1.5 && !firstTransitionToGameSelect) { 
            transitionRadius += 8;
        } else if (transitionRadius > width/1.5 && !firstTransitionToGameSelect) {
            firstTransitionToGameSelect = true;
        } else if (firstTransitionToGameSelect) {
            transitionRadius -= 8;
        }

        let frameId;

        if (transitionRadius <= 0) {
            state = "game select";
            graphics.font = "30px smb";
            cancelAnimationFrame(frameId);
            gameSelectScreen();
        }

        if (state == "game select transition") {
            frameId = requestAnimationFrame(gameSelectTransition);
        }
    }

    const gameSelectMusic = new Audio("mainSounds/gameSelect.wav");
    sounds.push(gameSelectMusic);
    let coverImages = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
    coverImages[0].src = "mainImages/superMarioBrosCover.png";
    coverImages[1].src = "mainImages/superMarioBrosTheLostLevelsCover.png";
    //Determines which game is selected on the game select screen
    let gameSelected = 0;
    let gamesText = ["Super Mario Bros.", "Super Mario Bros.: The Lost Levels"];
    let gamesObject = {
        0: "smb",
        1: "smbtll",
    }

    gameSelectScreen = () => {
        graphics.clearRect(0, 0, width, height);

        graphics.fillStyle = gradient;
        graphics.textAlign = "center";

        graphics.shadowOffsetX = -8;
        graphics.shadowOffsetY = 8;
        graphics.shadowBlur = 15;
        graphics.shadowColor = "white";
        canvas.style.background = "black";

        if (gameSelected-1 >= 0) {
            graphics.font = "15px smb";
            graphics.drawImage(coverImages[gameSelected-1], width*1/4-150, height/2-100, 150, 200);
            graphics.fillText(gamesText[gameSelected-1], width*1/4-75, height/2+150);
        }

        if (gameSelected+1 < gamesText.length) {
            graphics.font = "15px smb";
            graphics.drawImage(coverImages[gameSelected+1], width*3/4, height/2-100, 150, 200);
            graphics.fillText(gamesText[gameSelected+1], width*3/4+100, height/2+150);
        }

        graphics.font = "30px smb";
        graphics.drawImage(coverImages[gameSelected], width/2-150, height/2-200, 300, 400);
        graphics.fillText(gamesText[gameSelected], width/2, height/2+250);

        gameSelectMusic.play();

        let frameId;

        if (state == "game select") {
            frameId = requestAnimationFrame(gameSelectScreen);
        } else {
            gameSelectMusic.currentTime = 0;
            gameSelectMusic.pause();
            cancelAnimationFrame(frameId);
            gameEngine();
        }
    }

    setInterval(() => {
        if (gameEnded) {
            gameEnded = false;

            shiftWidth = 0;
            graphics.setTransform(1, 0, 0, 1, 0, 0);
            graphics.fillStyle = gradient;
            graphics.textAlign = "center";

            graphics.shadowOffsetX = -8;
            graphics.shadowOffsetY = 8;
            graphics.shadowBlur = 15;
            graphics.shadowColor = "white";
            canvas.style.background = "black";

            state = "game select";
            gameSelectScreen();
        }
    }, 1000);

    titleScreenMusic.ontimeupdate = function() {
        if (this.currentTime >= this.duration*.991) {
            this.currentTime = 0;
        }
    }

    for (let i = 0; i < sounds.length; i++) {
        sounds[i].volume = volume.value/100;
    }

    volume.onclick = () => {
        for (let i = 0; i < sounds.length; i++) {
            sounds[i].volume = volume.value/100;
        }
    }

    gameSelectMusic.ontimeupdate = function() {
        if (this.currentTime >= this.duration*.9842) {
            this.currentTime = 0;
        }
    }

    playButton.onclick = () => {
        if (state == "none") {
            state = "startup";
            startup();
            startupSound.volume = volume.value/100;
            startupSound.play();
        }
    }

    document.addEventListener("keydown", function(key) {
        let position = key.keyCode-38;

        if (key.keyCode == 13) {
            if (state == "main title screen") {
                state = "game select transition";
            } else if (state == "game select") {
                state = gamesObject[gameSelected];
                game = gamesObject[gameSelected];
            }
        } else if (Math.abs(position) == 1 && state == "game select") {
            if (gamesObject[gameSelected+position] != undefined) {
                gameSelected += position;
            }
        }
    });
};
