"use strict";
const gameEngine = () => {
    graphics.shadowBlur = 0;
    graphics.shadowOffsetX = 0;
    graphics.shadowOffsetY = 0;

    let state = "title screen";
    let timeUntilPlay = 150;
    let canUpdate = true;
    let time = 0;
    let score = 0;
    let gameTime = 400;
    let paused = false;
    let powerups = [];
    let fireballs = [];
    let timeUntilNextFireball = 0;
    let fireballsThrown = 0;
    let flames = [];
    let timeUntilNextFlame = 0;
    let movingScreen = false;
    let isStanding = true;
    let isHittingBottom = false;
    let isHittingLeft = false;
    let isHittingRight = false;
    let canGoToNextLevel = false;
    let timeUntilNextFish = 0;
    let coinAnimationList = [];
    let world = 1;
    let stage = 1;
    let level = `${world}-${stage}`;
    let debris = [];
    let fireworks = [];
    let shift = 0;
    let quit = false;

    let currentGame = new Game();

    let gravity = currentGame.gravity;
    let music = currentGame.music;
    let sounds = currentGame.sounds;
    let backgroundList = currentGame.backgroundList;
    let levels = currentGame.levels;
    let currentLocation = levels[level].areas[0];
    let mario = currentGame.mario;
    let randomized = false;
    let codeUsed = false;

    let memory
    let code;
    let address = [];
    let replacement = [];

    let a = 0;
    let b = 0;

    //Logic for determining what happens when a key is pressed
    document.addEventListener("keydown", (key) => {
        if (quit) {
            return;
        }

        if (key.keyCode == 32) {
            console.clear();
        }

        if (state == "game") {
            if (paused) {
                if (key.keyCode == 38 || key.keyCode == 40) {
                    shift++;
                } else if (key.keyCode == 13 && shift%2 == 1 && !key.repeat) {
                    quit = true;
                }
            }

            if ((key.keyCode == 80 || (key.keyCode == 13 && shift%2 == 0)) && !key.repeat) {
                paused = !paused;

                if (paused) {
                    let rand = random(0, pauseMusic.length-1);

                    pauseMusic[rand].currentTime = 0;
                    
                    setTimeout(() => pauseMusic[rand].play(), 2000);

                    music.pause();

                    for (let i = 0; i < sounds.length; i++) {
                        sounds[i].pause();
                    }
                } else {
                    for (let i = 0; i < pauseMusic.length; i++) {
                        pauseMusic[i].pause();
                    }

                    music.play();

                    for (let i = 0; i < sounds.length; i++) {
                        if (sounds[i].currentTime != 0 && sounds[i].currentTime != sounds[i].duration) {
                            sounds[i].play();
                        }
                    }
                }

                //Paused sound effect
                sounds[6].currentTime = 0;
                sounds[6].play();
            }

            if (mario.transition == false) {
                if (key.keyCode == 37) {
                    mario.leftPressed = true;
                    mario.rightPressed = false;
                    mario.canMoveRight = true;
                } else if (key.keyCode == 38) {
                    //To prevent holding the up key to keep jumping
                    if (!key.repeat) {
                        mario.upPressed = true;

                        if (currentLocation.terrain == "Underwater") {
                            mario.isOnGround = false;
                            mario.isJumping = true;
                        }

                        if (mario.isOnGround && mario.upPressed && !mario.falling) {
                            mario.isOnGround = false;
                            mario.isJumping = true;
                        }
                    }
                } else if (key.keyCode == 39) {
                    mario.rightPressed = true;
                    mario.leftPressed = false;
                    mario.canMoveLeft = true;
                } else if (key.keyCode == 40) {
                    mario.downPressed = true;
                } else if (key.keyCode == 90) {
                    //Running key
                    mario.zPressed = true;
                } else if (key.keyCode == 88 && !key.repeat && !mario.clearedLevel) {
                    //Fireball key
                    if (mario.hasFireFlower && (fireballsThrown%2 == 1 || timeUntilNextFireball <= 0) && !mario.isCrouching) {
                        sounds[4].currentTime = 0;
                        sounds[4].play();
                        mario.throwingFireball = true;
                        fireballsThrown++;
                        timeUntilNextFireball = 40;
                        fireballs.push(new Projectile("Fireball", mario.directionFacing == "left" ? mario.drawnX : mario.drawnX+mario.width/2, mario.drawnY, mario.directionFacing, gravity, sounds));
                    }
                }
            }
        } else if (state == "title screen") {
            if (key.keyCode == 38 || key.keyCode == 40) {
                shift++;
            } else if (key.keyCode == 13) {
                //starts up the game
                state = "loading";
            }
        }
    });

    //What to do when a key is released
    document.addEventListener("keyup", (key) => {
        if (quit) {
            return;
        }

        if (key.keyCode == 37) {
            mario.leftPressed = false;
        } else if (key.keyCode == 39) {
            mario.rightPressed = false;
        } else if (key.keyCode == 38) {
            mario.upPressed = false;
        } else if (key.keyCode == 40) {
            mario.downPressed = false;
        } else if (key.keyCode == 90) {
            mario.zPressed = false;
        }

        //currentGame.keyup(key);
    });

    //Allows a near unnoticable loop to be created for the music
    currentGame.music.ontimeupdate = function() {
        if (quit) {
            return;
        }

        if (game == "smb" || game == "smbtll") {
            if (music.src == `${pathname}/sounds/BowsersCastle.wav` && music.currentTime/music.duration > 0.985){
                music.currentTime = 0;
                music.play();
            } else if (music.src == `${pathname}/sounds/invincible.wav` && music.currentTime/music.duration > 0.987) {
                music.currentTime = 0;
                music.play();
            } else if (music.src == `${pathname}/sounds/Overworld.wav` && music.currentTime/music.duration > .999) {
                //Nothing needs to happen it is already a perfect loop?
                music.play();
            } else if (music.src == `${pathname}/sounds/savePrincess.wav` && music.currentTime/music.duration > .4725) {
                music.currentTime = 0;
                music.play();
            } else if (music.src == `${pathname}/sounds/Underground.wav` && music.currentTime/music.duration > .99) {
                music.currentTime = 0;
                music.play();
            } else if (music.src == `${pathname}/sounds/Underwater.wav` && music.currentTime/music.duration > .999) {
                music.currentTime = 0;
                music.play();
            } else if (music.src == `${pathname}/sounds/Bonus.wav` && music.currentTime/music.duration > .997) {
                music.currentTime = 2;
                music.play();
            } else if (music.src == `${pathname}/sounds/titleScreen.wav` && music.currentTime/music.duration > .979) {
                music.currentTime = 0;
                music.play();
            }
        }

        //currentGame.musicLoop();
    }

    pauseMusic.forEach((music, i, arr) => {
        arr[i].ontimeupdate = function() {
            if (paused && arr[i].currentTime >= arr[i].duration) {
                arr[i].currentTime = 0;
                arr[i].pause();

                let rand = random(0, pauseMusic.length-1);

                pauseMusic[rand].currentTime = 0;

                setTimeout(() => pauseMusic[rand].play(), 1000);
            } else if (!paused) {
                arr[i].currentTime = 0;
                arr[i].pause();
            } 
                
            arr[i].volume = volume.value/100;
        }
    })

    const setBackground = () => {
        if (currentLocation.terrain == "Underwater") {
            let water = new Image();
            water.src = `${pathname}/images/WaterTop.png`;

            for (let i = 0; i < 17; i++) {
                graphics.drawImage(water, i*40, 80, 40, 40);
            }

            graphics.fillStyle = "#62adff";
            graphics.fillRect(0, 120, width, height);
        }

        if (currentLocation.background != null) {
            if (canUpdate) {
                currentLocation.background.update(movingScreen, currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth, mario.velX);
            }

            currentLocation.background.draw();
        }
    }

    const setCoins = () => {
        let coinList = mario.coinAnimationList;

        for (let i = 0; i < coinList.length; i++) {
            coinList[i].img.src = `${pathname}/images/CoinSpin` + (Math.floor(time/4%4)+1) + ".png";

            if (canUpdate) {
                if (movingScreen && currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth) {
                    coinList[i].xValue -= mario.velX;
                }

                coinList[i].timeUntilDisappear++;

                if (coinList[i].timeUntilDisappear <= 25) {
                    coinList[i].yValue-=4;
                } else {
                    coinList[i].yValue+=4;
                }

                if (coinList[i].timeUntilDisappear >= 60) {
                    coinList.splice(i, 1);
                }
            }
        }

        for (let i = 0; i < coinList.length; i++) {
            graphics.drawImage(coinList[i].img, Math.round(coinList[i].xValue), Math.round(coinList[i].yValue), 20, 40);
        }
    }

    const setScores = () => {
        let scoreValues = mario.scoreValues;

        for (let i = 0; i < scoreValues.length; i++) {
            scoreValues[i].timer++;

            if (scoreValues[i].has1Up) {
                sounds[0].currentTime = 0;
                sounds[0].play();
                mario.lives++;
                scoreValues[i].has1Up = false;
            }

            if (canUpdate && movingScreen && currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth) {
                scoreValues[i].x -= mario.velX;
            }

            scoreValues[i].y -= 3;

            if (scoreValues[i].timer > 50) {
                scoreValues.splice(i, 1);
            }
        }

        graphics.fillStyle = "white";
        graphics.font = "25px smb";

        for (let i = 0; i < scoreValues.length; i++) {
            if (scoreValues[i].score != 50) {
                graphics.fillText(scoreValues[i].score, scoreValues[i].x+18, scoreValues[i].y);
            }
        }
    }

    const addPowerup = (x, y, type) => {
        powerups.push(new Powerup(x, y, type, gravity, music, sounds, currentLocation.terrain));
    }

    const addEnemy = (x, y) => {
        const array = ["G", "K", "B", "Q", "W", "E", "L", "P", "F", "I", "H", "R", "D", "T", "U", "A", "S"];

        currentLocation.enemies.push(new Enemy(x, y, 40, 40, array[random(0, array.length-1)], gravity, sounds, currentLocation.terrain, null))
    }

    const reset = () => {
        randomized = false;
        state = "loading";
        timeUntilPlay = 150;

        if (mario.lives == 0) {
            timeUntilPlay = 350;
        }

        if (mario.lives <= 0) {
            world = 1;
            stage = 1;
            level = "1-1";
        }

        currentLocation = levels[level].areas[0];

        levels[level].areas.forEach((areas, k, place) => {
            place[k].pair = null;

            areas.area.forEach((row, j) => {
                row.forEach((block, i, arr) => {
                    const canEnter = block.canEnter;
                    const isEdge = block.isEdge;
                    let pair = arr[i].pair;
                    let pulleyPair = arr[i].pulleyPair;
                    let connection = arr[i].connection;

                    arr[i] = new Block(block.storedType, block.constantX, block.constantY, block.constantX, block.constantY, block.constantWidth, block.constantHeight, sounds, block.terrain);

                    arr[i].canEnter = canEnter;
                    arr[i].isEdge = isEdge;
                    arr[i].pair = pair;
                    arr[i].pulleyPair = pulleyPair;

                    if (arr[i].pulleyPair != null) {
                        arr[i].pulleyPair.pulleyPair = arr[i];
                    }

                    arr[i].connection = connection;
                });
            });

            if (areas.background != null) {
                areas.background = new Background(areas.background.img.src, areas.background.constantX, areas.background.constantY, areas.background.width, areas.background.height);
            }

            if (areas.enemies != null) {
                let canResetEnemy = true;
                areas.enemies.forEach((enemy, i, arr) => {
                    if (canResetEnemy) {
                        arr[i] = new Enemy(enemy.constantX, enemy.constantY, enemy.constantWidth, enemy.constantHeight, enemy.storedType, gravity, sounds, areas.terrain, enemy.animated);
                    }

                    if (arr[i].drawnX == -1000) {
                        canResetEnemy = false;
                    }
                });

                for (let i = 0; i < areas.enemies.length; i++) {
                    if (areas.enemies[i].drawnX == -1000) {
                        areas.enemies.length = i+1;
                        break;
                    }
                }
            }
        });

        time = 0;
        gameTime = 400;
        movingScreen = false;
        isStanding = false;
        isHittingBottom = false;
        timeUntilNextFireball = 0;
        fireballsThrown = 0;

        mario = new Player(mario.lives, gravity, music, sounds, mario.coins);

        mario.isBig ? mario.drawnY = 440 : mario.drawnY = 480;

        if (stage == 4) {
            mario.drawnY = 240-(mario.height-40);
        }

        powerups = [];
        fireballs = [];
        flames = [];
    }

    const nextLevel = () => {
        randomized = false;
        stage++;
        stage > 4 ? world++ : null;
        stage %= 5;
        stage == 0 ? stage = 1 : null;

        if (world == 2 && stage == 1) {
            world = 8;
        }

        if (world == 10 && stage == 1) {
            world = "C";
            stage = 3;
        } else if (world == "C" && stage == 4) {
            world = "D";
            stage = 1;
        }

        mario.isBig ? mario.drawnY = 440 : mario.drawnY = 480;

        if (stage == 4) {
            mario.drawnY = 240-(mario.height-40);
        }

        level = `${world}-${stage}`;
        currentLocation = levels[level].areas[0];

        state = "loading";
        timeUntilPlay = 250;

        canGoToNextLevel = false;

        time = 0;
        gameTime = 400;
        movingScreen = false;
        isStanding = false;
        isHittingBottom = false;
        timeUntilNextFireball = 0;
        fireballsThrown = 0;
        mario.drawnX = 80;
        mario.alignX = mario.drawnX;
        mario.velX = 0;
        mario.lastGroundY = mario.drawnY;
        mario.hasStar = false;
        mario.invincibility = 0;
        mario.isCrouching = false;
        mario.lastVelY = 0;
        mario.clearedLevel = false;
        mario.timeUntilFallFromFlagpole = 0;
        mario.isMovingOnPole = true;
        mario.canGoToCastle = false;
        mario.timeUntilGoToCastle = 0;
        mario.hasFlippedOnPole = false;
        mario.isWalkingToCastle = false;
        mario.behindCastle = false;
        mario.canClearLevel = false;
        mario.transition = false;
        mario.timeToMoveToNextLevel = 0;

        if (stage == 4) {
            mario.drawnY = 240-(mario.height-40);
        }

        powerups = [];
        fireballs = [];
        flames = [];

        currentLocation = levels[level].areas[0];
    }

    const changeLocation = () => {
        randomized = false;
        let pair;
        powerups = [];
        fireballs = [];
        flames = [];

        if (mario.blockStandingOn.pair != undefined) {
            currentLocation.pair = mario.blockStandingOn.pair;
        }

        let shiftAmount = 0;

        if (game == "smb") {
            if (level == "1-1") {
                if (currentLocation == currentGame.level1_1Overworld) {
                    currentLocation = levels[level].areas[1];
                    mario.changeLocation("fall");
                } else {
                    currentLocation = levels[level].areas[0];

                    mario.changeLocation("up pipe");
                }
            } else if (level == "1-2") {
                if (currentLocation == currentGame.level1_2Overworld1) {
                    currentLocation = levels[level].areas[1];
                    mario.changeLocation("fall");
                } else if (currentLocation == currentGame.level1_2Underground1) {
                    if (currentLocation.area[currentLocation.area.length-1][currentLocation.area[currentLocation.area.length-1].length-1].drawnX <= 600) {
                        canGoToNextLevel = true;

                        if (mario.drawnX < 240) {
                            world = 8;
                            stage = 1;
                        } else if (mario.drawnX < 400) {
                            world = 1;
                            stage = 4;
                        } else {
                            stage = 3;
                        }
                    } if (mario.drawnY+mario.height >= 420) {
                        currentLocation = levels[level].areas[2];
                        mario.changeLocation("fall");
                    } else {
                        currentLocation = levels[level].areas[3];
                        mario.changeLocation("up pipe");
                    }
                } else if (currentLocation == currentGame.level1_2Underground2) {
                    currentLocation = levels[level].areas[1];
                    mario.changeLocation("up pipe");
                }
            } else if (level == "8-1") {
                if (currentLocation == currentGame.level8_1Overworld) {
                    currentLocation = levels[level].areas[1];
                    mario.changeLocation("fall");
                } else if (currentLocation == currentGame.level8_1Underground) {
                    currentLocation = levels[level].areas[0];
                    mario.changeLocation("up pipe");
                }
            } else if (level == "8-2") {
                if (currentLocation == currentGame.level8_2Overworld) {
                    currentLocation = levels[level].areas[1];
                    mario.changeLocation("fall");
                } else if (currentLocation == currentGame.level8_2Underground) {
                    currentLocation = levels[level].areas[0];
                    mario.changeLocation("up pipe");
                }
            } else if (level == "8-4") {
                mario.changeLocation("up pipe");

                if (currentLocation == currentGame.level8_4Castle) {
                    if (currentLocation.area[8][228].drawnX < 600 && currentLocation.area[8][228].drawnX > 0) {
                        currentLocation = currentGame.level8_4Underwater;
                    }
                } else {
                    currentLocation = currentGame.level8_4Castle;
                }
            }
        } else if (game == "smbtll") {
            if (level == "1-1") {
                if (currentLocation == currentGame.level1_1Overworld) {
                    currentLocation = levels[level].areas[1];
                    mario.changeLocation("fall");
                } else {
                    currentLocation = levels[level].areas[0];
                    mario.changeLocation("up pipe");
                }
            } else if (level == "1-2") {
                if (currentLocation == currentGame.level1_2Overworld1) {
                    currentLocation = levels[level].areas[1];
                    mario.changeLocation("fall");
                } else if (currentLocation == currentGame.level1_2Underground1) {
                    if (mario.drawnY < 0) {
                        currentLocation = currentGame.level1_2Overworld2;
                        mario.changeLocation("vine");
                    } else if (currentLocation.area[9][170].drawnX > 0 &&currentLocation.area[9][170].drawnX < width) {
                        currentLocation = currentGame.level1_2Overworld3;
                        mario.changeLocation("up pipe");
                    } else if (currentLocation.area[11][191].drawnX > 0 && currentLocation.area[11][191].drawnX < width) {
                        currentLocation = currentGame.level1_2Underground2;
                        mario.changeLocation("fall");
                    } else {
                        canGoToNextLevel = true;
                        world = 1;
                        stage = 3;
                    }
                } else if (currentLocation == currentGame.level1_2Overworld2) {
                    canGoToNextLevel = true;
                    world = 1
                    stage = 4;
                } else if (currentLocation == currentGame.level1_2Underground2) {
                    if (currentLocation.area[11][51].drawnX > 0 && currentLocation.area[11][51].drawnX < width) {
                        currentLocation = currentGame.level1_2Bonus;
                        mario.changeLocation("fall");
                    } else {
                        canGoToNextLevel = true;
                        world = 8;
                        stage = 4;
                    }
                } else if (currentLocation == currentGame.level1_2Bonus) {
                    currentLocation = currentGame.level1_2Underground1;

                    mario.changeLocation("up pipe");
                }
            } else if (level == "8-1") {
                if (currentLocation == currentGame.level8_1Overworld1) {
                    currentLocation = levels[level].areas[1];

                    mario.changeLocation("fall");
                } else if (currentLocation == currentGame.level8_1Underwater) {
                    currentLocation = levels[level].areas[2];

                    mario.changeLocation("up pipe");
                } else {
                    canGoToNextLevel = true;
                    world = 1;
                    stage = 0;
                }
            } else if (level == "8-2") {
                if (currentLocation == currentGame.level8_2Overworld1) {
                    if (mario.drawnY < 100) {
                        currentLocation = levels[level].areas[1];

                        mario.changeLocation("vine");
                    } else {
                        currentLocation = levels[level].areas[2];

                        mario.changeLocation("fall");
                    }
                } else {
                    currentLocation = levels[level].areas[0];

                    mario.changeLocation("up pipe");
                }
            } else if (level == "8-3") {
                if (currentLocation == currentGame.level8_3Overworld) {
                    currentLocation = levels[level].areas[1];

                    mario.changeLocation("vine");
                } else {
                    currentLocation = levels[level].areas[0];

                    shiftAmount = 4580;

                    mario.changeLocation("fall");
                }
            } else if (level == "8-4") {
                if (currentLocation == currentGame.level8_4Castle1) {
                    currentLocation = levels[level].areas[1];

                    mario.changeLocation("up pipe");
                } else if (currentLocation == currentGame.level8_4Underwater) {
                    currentLocation = levels[level].areas[2];

                    mario.changeLocation("up pipe");
                } else if (currentLocation == currentGame.level8_4Castle2) {
                    currentLocation = levels[level].areas[3];

                    mario.changeLocation("up pipe");

                    shiftAmount = 400;
                } else if (currentLocation == currentGame.level8_4Castle3) {
                    if (mario.drawnY > 400) {
                        currentLocation = levels[level].areas[1];
                    } else {
                        currentLocation = levels[level].areas[4];
                    }

                    mario.changeLocation("up pipe");
                } else if (currentLocation == currentGame.level8_4Castle4) {
                    currentLocation = levels[level].areas[0];

                    mario.changeLocation("up pipe");
                }
            } else if (level == "9-1") {
                currentLocation = levels[level].areas[1];

                mario.changeLocation("up pipe");
            } else if (level == "9-3") {
                if (currentLocation == currentGame.level9_3Castle) {
                    currentLocation = levels[level].areas[1];

                    mario.changeLocation("vine");
                } else {
                    currentLocation = levels[level].areas[0];
                    shiftAmount = 3940;

                    mario.changeLocation("fall");
                }
            } else if (level == "D-1") {
                if (currentLocation == currentGame.levelD_1Overworld) {
                    currentLocation = levels[level].areas[1];

                    mario.changeLocation("fall");
                } else {
                    currentLocation = levels[level].areas[0];

                    mario.changeLocation("up pipe");
                }
            } else if (level == "D-2") {
                if (currentLocation == currentGame.levelD_2Overworld) {
                    if (mario.drawnY < 0) {
                        currentLocation = levels[level].areas[2];

                        mario.changeLocation("vine");
                    } else {
                        currentLocation = levels[level].areas[1];

                        mario.changeLocation("fall");
                    }
                } else if (currentLocation == currentGame.levelD_2Underground) {
                    currentLocation = levels[level].areas[0];

                    mario.changeLocation("up pipe");
                } else {
                    currentLocation = levels[level].areas[0];

                    shiftAmount = 4580;

                    mario.changeLocation("fall");
                }
            } else if (level == "D-4") {
                if (currentLocation == currentGame.levelD_4Castle1) {
                    currentLocation = levels[level].areas[1];

                    mario.changeLocation("up pipe");
                } else if (currentLocation == currentGame.levelD_4Overworld) {
                    currentLocation = levels[level].areas[2];

                    mario.changeLocation("fall");
                } else if (currentLocation == currentGame.levelD_4Underground) {
                    currentLocation = levels[level].areas[3];

                    mario.changeLocation("up pipe");
                } else {
                    currentLocation = levels[level].areas[0];

                    mario.changeLocation("up pipe");
                }
            }
        }

        mario.canClearLevel = false;

        let newX = currentLocation.pair == null ? shiftAmount : currentLocation.pair.constantX - 120;

        currentLocation.area.forEach((row, j) => {
            row.forEach((block, i, arr) => {
                const canEnter = block.canEnter;
                const isEdge = block.isEdge;
                let pair = arr[i].pair;
                let pulleyPair = arr[i].pulleyPair;
                let connection = arr[i].connection;

                arr[i] = new Block(block.storedType, block.constantX, block.constantY, block.constantX, block.constantY, block.constantWidth, block.constantHeight, sounds, block.terrain);

                arr[i].drawnX -= newX;
                arr[i].movingX -= newX;

                arr[i].fireBar.forEach((fireball, k, array) => {
                    array[k].drawnX -= newX;
                    array[k].centerX -= newX;
                });

                arr[i].canEnter = canEnter;
                arr[i].isEdge = isEdge;

                arr[i].pair = pair;
                arr[i].pulleyPair = pulleyPair;

                if (arr[i].pulleyPair != null) {
                    arr[i].pulleyPair.pulleyPair = arr[i];
                }

                arr[i].connection = connection;
            });
        });

        if (currentLocation.background != null) {
            currentLocation.background = new Background(currentLocation.background.img.src, currentLocation.background.constantX, currentLocation.background.constantY, currentLocation.background.width, currentLocation.background.height);
            currentLocation.background.drawnX -= newX;
        }

        let canResetEnemy = true;

        currentLocation.enemies.forEach((enemy, i, arr) => {
            if (canResetEnemy) {
                arr[i] = new Enemy(enemy.constantX, enemy.constantY, enemy.constantWidth, enemy.constantHeight, enemy.storedType, gravity, sounds, currentLocation.terrain, enemy.animated);
            }

            if (arr[i].drawnX == -1000) {
                canResetEnemy = false;
                currentLocation.enemies.length = i+1;
            }
        });

        for (let i = 0; i < currentLocation.enemies.length; i++) {
            let enemy = currentLocation.enemies[i];

            if (enemy.drawnX != -1000) {
                enemy.drawnX -= newX;
                enemy.movingX -= newX;

                enemy.hitboxX -= newX;
            }
        }

        mario.keyLastPressed = "right";
        music.currentTime = 0;
        music.src = `${pathname}/sounds/${currentLocation.terrain}.wav`;
        music.play();
    }

    const goBackwards = () => {
        let newX;

        if (game == "smb" && currentLocation == currentGame.level8_4Castle) {
            timeUntilNextFish--;

            if (timeUntilNextFish <= 0) {
                timeUntilNextFish = 50;

                if (currentLocation.area[10][198].drawnX <= 120 && currentLocation.area[10][243].drawnX >= 600) {
                    currentLocation.enemies.push(new Enemy(random(100, width - shiftWidth * 4), height, 40, 40, "O", gravity, sounds, currentLocation.terrain, 0))
                }
            }

            if (currentLocation.area[13][113].drawnX < 600 && currentLocation.area[13][113].drawnX > 590) {
                newX = currentLocation.area[13][31].constantX;
            } else if (currentLocation.area[13][183].drawnX < 600 && currentLocation.area[13][183].drawnX > 590) {
                newX = currentLocation.area[13][96].constantX;
            } else if (currentLocation.area[10][254].drawnX < 600 && currentLocation.area[10][254].drawnX > 590) {
                newX = currentLocation.area[13][181].constantX;
            }
        } else if (game == "smbtll") {
            if (currentLocation == currentGame.level8_4Castle1) {
                if (currentLocation.area[13][89].drawnX < 600 && currentLocation.area[13][89].drawnX > 590) {
                    newX = currentLocation.area[13][15].constantX;
                }
            } else if (currentLocation == currentGame.level8_4Castle3 && mario.drawnY+mario.height <= 240 && currentLocation.area[9][54].drawnX <= width/2-shiftWidth+20 && currentLocation.area[9][54].drawnX >= width/2-shiftWidth) {
                newX = currentLocation.area[13][10].constantX;
            }
        }

        if (newX != undefined) {
            newX -= 320;

            currentLocation.area.forEach((row, j) => {
                row.forEach((block, i, arr) => {
                    const canEnter = block.canEnter;
                    const isEdge = block.isEdge;
                    let pair = arr[i].pair;
                    let pulleyPair = arr[i].pulleyPair;
                    let connection = arr[i].connection;

                    arr[i] = new Block(block.storedType, block.constantX, block.constantY, block.constantX, block.constantY, block.constantWidth, block.constantHeight, sounds, block.terrain);

                    arr[i].drawnX -= newX;
                    arr[i].movingX -= newX;

                    arr[i].fireBar.forEach((fireball, k, array) => {
                        array[k].drawnX -= newX;
                        array[k].centerX -= newX;
                    });

                    arr[i].canEnter = canEnter;
                    arr[i].isEdge = isEdge;

                    arr[i].pair = pair;
                    arr[i].pulleyPair = pulleyPair;

                    if (arr[i].pulleyPair != null) {
                        arr[i].pulleyPair.pulleyPair = arr[i];
                    }

                    arr[i].connection = connection;
                });
            });

            if (currentLocation.background != null) {
                currentLocation.background = new Background(currentLocation.background.img.src, currentLocation.background.constantX, currentLocation.background.constantY, currentLocation.background.width, currentLocation.background.height);
                currentLocation.background.drawnX -= newX;
            }

            let canResetEnemy = true;
            currentLocation.enemies.forEach((enemy, i, arr) => {
                if (canResetEnemy) {
                    arr[i] = new Enemy(enemy.constantX, enemy.constantY, enemy.constantWidth, enemy.constantHeight, enemy.storedType, gravity, sounds, enemy.terrain, enemy.animated);
                }

                if (arr[i].drawnX == -1000) {
                    canResetEnemy = false;
                    currentLocation.enemies.length = i + 1;
                }
            });

            for (let i = 0; i < currentLocation.enemies.length; i++) {
                let enemy = currentLocation.enemies[i];

                if (enemy.drawnX != 1000) {
                    enemy.drawnX -= newX;
                    enemy.hitboxX -= newX;
                }
            }
        }
    }

    const addDebris = (objects) => {
        for (let i = 0; i < objects.length; i++) {
            debris.push(objects[i]);
        }
    }

    const setDebris = () => {
        for (let i = 0; i < debris.length; i++) {
            debris[i].img.src = `${pathname}/images/${currentLocation.terrain != "Bonus" ? currentLocation.terrain : "Underground"}BrokenBrick${(Math.floor(time/10))%4+1}.png`;

            if (canUpdate) {
            if (currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth) {
                    debris[i].x -= mario.velX;
                }

                debris[i].x += debris[i].velX;
                debris[i].time++;
                debris[i].y = debris[i].originalY -2*debris[i].time + 0.5 * gravity * debris[i].time**2;

                if (debris[i].y > height) {
                    debris.splice(i, 1);
                }
            }

            i < debris.length ? graphics.drawImage(debris[i].img, Math.round(debris[i].x), Math.round(debris[i].y), 20, 20) : null;
        }
    }

    const setFireworks = () => {
        if (fireworks.length > 0) {
            if (fireworks[0].existence < 1) {
                sounds[9].currentTime = 0;
                sounds[9].play();
            }

            fireworks[0].img.src = `${pathname}/images/Firework${(Math.floor(fireworks[0].existence/10))%3+1}.png`;
            fireworks[0].existence++;

            graphics.drawImage(fireworks[0].img, fireworks[0].x, fireworks[0].y, 40, 40);

            if (fireworks[0].existence > 30) {
                mario.addScore(500, -100, -100);
                fireworks.shift();
            }
        }
    }

    const draw = () => {
        if (challengeSelect.value != "Art") {
            graphics.clearRect(0, 0, width, height);
        }

        graphics.fillStyle = "white";

        //draws the text to the screen
        graphics.font = "25px smb";
        graphics.fillText("MARIO", 100, 30);
        graphics.fillText(("00000" + score).slice(-6), 110, 50);
        const coinImageNumber = Math.floor(time%50/10)+1;

        if (state != "loading") {
            currentGame.hudCoin.src = `${pathname}/images/hudCoin${coinImageNumber > 3 ? (coinImageNumber == 4 ? 2 : 1) : coinImageNumber}.png`;
        } else if (currentGame.hudCoin.src != `${pathname}/images/hudCoin1.png`) {
            currentGame.hudCoin.src = `${pathname}/images/hudCoin1.png`;
        }

        graphics.drawImage(currentGame.hudCoin, 220, 32, 20, 20);
        graphics.drawImage(currentGame.xImage, 237, 32, 20, 20)
        graphics.fillText("" + ("0" + mario.coins).slice(-2), 275, 50);
        graphics.fillText("WORLD", 400, 30);
        graphics.fillText(level, 400, 50)
        graphics.fillText("TIME", 550, 30);
        graphics.fillText(("00" + gameTime).slice(-3), 555, 50);

        if (state == "title screen") {
            //What to do if you are on the title screen
            if (canvas.style.background != "#9391ff") {
                canvas.style.background = "#9391ff";
            }

            setBackground();
            
            mario.lives = mario.constantLives;
            timeUntilPlay = 150;
            mario.draw();

            if (music.src != `${pathname}/sounds/titleScreen.wav`) {
                music.pause();
                music.src = `${pathname}/sounds/titleScreen.wav`;
            }

            currentLocation.area.forEach((row) => {
                row.forEach((block, i, arr) => {
                    arr[i].update();
                    if (block.type != "Air" && block.drawnX <= width-shiftWidth && block.drawnX+block.width >= 0) {
                        block.draw();
                    }
                });
            });

            graphics.fillStyle = "white";
            graphics.drawImage(currentGame.hudTitle, 100, 55, 440, 220);

            if (game == "smb") {
                graphics.fillText("1 player game", width/2-shiftWidth, 375);
                graphics.fillText("2 player game", width/2-shiftWidth, 425);
            } else if (game == "smbtll") {
                graphics.fillText("Mario Game", width/2-shiftWidth, 375);
                graphics.fillText("Luigi Game", width/2-shiftWidth, 425);
            }

            graphics.drawImage(currentGame.cursor, 150, 355+shift%2*50, 20, 20);
        } else if (state == "loading") {
            //What to do when on the loading screen
            if (mario.lives > 0) {
                music.src = `${pathname}/sounds/${currentLocation.terrain}.wav`;


                if (currentLocation == currentGame.level1_2Overworld1) {
                    music.src = `${pathname}/sounds/overworldToUnderground.wav`
                }
            }

            if (canvas.style.background != "black") {
                canvas.style.background = "black";
            }

            if (mario.lives > 0) {
                let smallMario = new Image();
                smallMario.src = `${pathname}/images/smallMarioStanding.png`;
                graphics.fillText(`world ${level}`, width/2-shiftWidth, 200);
                graphics.drawImage(smallMario, width/2-75-shiftWidth, 240, 40, 40);
                graphics.drawImage(currentGame.xImage, width/2-shiftWidth, 250, 20, 20);
                graphics.fillText(mario.lives, 460-shiftWidth, 270);
            } else {
                graphics.fillText("game over", width/2-shiftWidth, height/2);
            }

            timeUntilPlay--;

            if (timeUntilPlay == 0) {
                if (mario.lives > 0) {
                    state = "game";
                } else {
                    state = "title screen"
                }
            }
        } else if (state == "game") {
            //What to do if the actual game is running
            if (currentLocation.color != undefined) {
                canvas.style.background = currentLocation.color;
            } else {
                canvas.style.background = "black";
            }

            isHittingLeft = false;
            isHittingRight = false;

            if (mario.blockMovingOn != null) {
                mario.velX = mario.blockMovingOn.velX;
                mario.blockMovingOn = null;
            }

            score = mario.score;

            //Aligning mario at the center of the screen
            if (currentLocation.canScroll && mario.canMoveRight && mario.canMoveLeft && !mario.goingUpPipe && mario.velX > 0) {
                movingScreen = true;
            } else {
                movingScreen = false;
            }

            let possibleToNotScroll = true;

            currentLocation.area.forEach((row) => {
                row.forEach((block, i, arr) => {
                    if (block.type == "Flagpole") {
                        possibleToNotScroll = false;
                    }
                });
            });

            if (currentLocation.area[currentLocation.area.length-1][currentLocation.area[currentLocation.area.length-1].length-1].drawnX <= 600 && possibleToNotScroll) {
                currentLocation.canScroll = false;

                if (game == "smb") {
                    switch (level) {
                        case "1-2":
                            if (currentLocation == currentGame.level1_2Overworld1) {
                                mario.canClearLevel = false;

                                if (!["into pipe", "pipe"].includes(mario.transition)) {
                                    mario.transition = "walkingIntoPipe";
                                }
                            } else if (currentLocation == currentGame.level1_2Underground1) {
                                graphics.fillStyle = "white";
                                graphics.fillText("Welcome to warp zone!", 280, 240);
                                graphics.fillText("8-2", 120, 340);
                                graphics.fillText("8-1", 280, 340);
                                graphics.fillText("1-4", 440, 340);

                                currentLocation.enemies.forEach((val, i, arr) => {
                                    arr[i].drawnX = -100;
                                });
                            }

                            break;
                        default:
                            break;
                    }
                } else if (game == "smbtll") {
                    switch (level) {
                        case "1-2":
                            if (currentLocation == currentGame.level1_2Overworld1) {
                                mario.canClearLevel = false;

                                if (!["into pipe", "pipe"].includes(mario.transition)) {
                                    mario.transition = "walkingIntoPipe";
                                }
                            } else if (currentLocation == currentGame.level1_2Underground1) {
                                graphics.fillStyle = "white";
                                graphics.fillText("Welcome to warp zone!", 280, 260);
                                graphics.fillText("1-4", 280, 340);

                                currentLocation.enemies.forEach((val, i, arr) => {
                                    arr[i].drawnX = -100;
                                });
                            } else if (currentLocation == currentGame.level1_2Underground2) {
                                graphics.fillStyle = "white";
                                graphics.fillText("Welcome to warp zone!", 280, 260);
                                graphics.fillText("9", 280, 340);

                                currentLocation.enemies.forEach((val, i, arr) => {
                                    arr[i].drawnX = -100;
                                });
                            } else if (currentLocation == currentGame.level1_2Overworld2) {
                                graphics.fillStyle = "white";
                                graphics.fillText("Welcome to warp zone!", 280, 260);
                                graphics.fillText("8", 280, 340);

                                currentLocation.enemies.forEach((val, i, arr) => {
                                    arr[i].drawnX = -100;
                                });
                            }

                            break;

                        case "8-1":
                            if (currentLocation == currentGame.level8_1Overworld2) {
                                graphics.fillStyle = "white";
                                graphics.fillText("Welcome to warp zone!", 280, 260);
                                graphics.fillText("1", 280, 340);

                                currentLocation.enemies.forEach((val, i, arr) => {
                                    arr[i].drawnX = -100;
                                });
                            }
                    }
                }
            } else {
                currentLocation.canScroll = true;
            }

            isStanding = false;
            isHittingBottom = false;

            setBackground();

            if (mario.transition == "down pipe" || mario.transition == "into pipe" || mario.goingUpPipe) {
                mario.draw();
            }

            currentLocation.area.forEach((row, j) => {
                row.forEach((block, i, arr) => {
                    if (block.type != "Air") {
                        if (canUpdate) {
                            arr[i].update(movingScreen, currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth, mario.velX, mario.drawnX+mario.width/2);

                            if (arr[i].bullets.length > 0) {
                                arr[i].bullets.forEach((bullet, k, bullets) => {
                                    if (currentLocation.enemies.indexOf(bullets[k]) == -1) {
                                        currentLocation.enemies.push(bullets[k]);
                                    }
                                });
                            }
                        }

                        /*graphics.strokeStyle = "red";
                        graphics.lineWidth = 5;
                        //Top collisions hitbox for blocks
                        if (j-1 > 0 && !currentLocation.area[j-1][i].hasCollisions) {
                            graphics.beginPath();
                            graphics.moveTo(Math.round(block.drawnX), block.drawnY);
                            graphics.lineTo(Math.round(block.drawnX+block.width), block.drawnY);
                            graphics.stroke();
                        }

                        if (block.isEdge) {
                            graphics.strokeStyle = "blue";
                        }

                        //Right collisions
                        if (i+1 < row.length && !row[i+1].hasCollisions) {
                            graphics.beginPath();
                            graphics.moveTo(Math.round(block.drawnX+block.width), block.drawnY);
                            graphics.lineTo(Math.round(block.drawnX+block.width), block.drawnY+block.height);
                            graphics.stroke();
                        }

                        graphics.strokeStyle = "red";

                        //Bottom collisions
                        if (j+1 < currentLocation.area.length && !currentLocation.area[j+1][i].hasCollisions) {
                            graphics.beginPath();
                            graphics.moveTo(Math.round(block.drawnX), block.drawnY+block.height);
                            graphics.lineTo(Math.round(block.drawnX+block.width), block.drawnY+block.height);
                            graphics.stroke();
                        }

                        if (block.isEdge) {
                            graphics.strokeStyle = "blue";
                        }

                        //Left collisions
                        if (i-1 > 0 && !row[i-1].hasCollisions) {
                            graphics.beginPath();
                            graphics.moveTo(Math.round(block.drawnX), block.drawnY);
                            graphics.lineTo(Math.round(block.drawnX), block.drawnY+block.height);
                            graphics.stroke();
                        }

                        graphics.strokeStyle = "black";
                        graphics.lineWidth = 1;*/

                        if (block.type.indexOf("Coin") > -1) {
                            arr[i].collides(mario);
                        } else if (block.type.indexOf("Flagpole") > -1) {
                            if (mario.transition == "cleared level") {
                                if (block.offsetY+79+block.drawnY < 460) {
                                    block.offsetY += 5;
                                } else {
                                    mario.canGoToCastle = true;
                                }
                            }

                            if (mario.clearedLevel && fireworks.length == 0 && !mario.behindCastle) {
                                const fireworkNumber = gameTime%10;

                                if (fireworkNumber == 1 || fireworkNumber == 3 || fireworkNumber == 6) {
                                    for (let i = 0; i < fireworkNumber; i++) {
                                        fireworks.push({
                                            x: random(320, 720),
                                            y: random(120, 200),
                                            img: new Image(),
                                            existence: 0
                                        });
                                    }
                                }
                            }
                        } else if (block.type == "Castle" || block.type == "BigCastle") {
                            if (i > 10 && block.drawnX+block.width >= 0 && block.drawnX < newWidth) {
                                mario.canClearLevel = true;
                            }

                            if (arr[i].castleCollisions(mario, gameTime, fireworks)) {
                                mario.timeToMoveToNextLevel++;

                                if (mario.timeToMoveToNextLevel >= 150) {
                                    canGoToNextLevel = true;
                                }
                            }
                        } else if (block.type == "Axe") {
                            arr[i].collides(mario);
                        } else {
                            if (!mario.goingUpPipe) {
                                if (canUpdate) {
                                    //Top collisions for mario
                                    let cantShoot = false;
                                    if ((j-1 > 0 && !currentLocation.area[j-1][i].hasCollisions && arr[i].topCollisions(mario)) || (["BlockRandomizer", "Randomizer"].includes(challengeSelect.value) && arr[i].topCollisions(mario))) {
                                        isStanding = true;

                                        if (block.type.indexOf("Cannon") > -1) {
                                            cantShoot = true;
                                        }
                                    }

                                    if (!currentLocation.canScroll) {
                                        if (block.type == "Toad") {
                                            mario.isWalkingToCastle = false;
                                            mario.behindCastle = true;

                                            mario.velX = 0;

                                            graphics.fillStyle = "white";
                                            graphics.fillText("Thank you Mario!", width/2-shiftWidth, 220);
                                            graphics.fillText("But our princess is in", width/2-shiftWidth, 300);
                                            graphics.fillText("another castle", width/2-160, 340);
                                        } else if (block.type == "Princess") {
                                            mario.isWalkingToCastle = false;
                                            mario.behindCastle = true;

                                            mario.velX = 0;

                                            if (game == "smb") {
                                                graphics.fillStyle = "white";
                                                graphics.fillText("Thank you Mario!", width/2-shiftWidth, 220);
                                                graphics.fillText("Your quest is over.", width/2-shiftWidth, 300);
                                            } else if (game == "smbtll") {
                                                if (world == 8) {
                                                    graphics.fillStyle = "white";
                                                    graphics.fillText("Thank you Mario!", width/2-shiftWidth, 240);
                                                    graphics.fillText("The Kingdom is saved!", width/2-shiftWidth, 280);
                                                    graphics.fillText("Hurrah to Mario", width/2-shiftWidth, 320);
                                                    graphics.fillText("Now try a more difficult quest...", width/2-shiftWidth, 360);
                                                } else {
                                                    graphics.fillStyle = "#95bdfe";
                                                    graphics.fillText("Peace is Paved", width/2-shiftWidth, 200);
                                                    graphics.fillText("With Kingdom Saved", width/2-shiftWidth, 240);
                                                    graphics.fillText("Hurrah to Mario", width/2-shiftWidth, 280);
                                                    graphics.fillText("Our only Hero", width/2-shiftWidth, 320);
                                                    graphics.fillText("This Ends your trip", width/2-shiftWidth, 360);
                                                    graphics.fillText("Of a long Friendship", width/2-shiftWidth, 400);
                                                    graphics.fillStyle = "#d39828";
                                                    graphics.fillText("100000 pts. added", width/2-shiftWidth, 440);
                                                    graphics.fillText("For Each Player Left", width/2-shiftWidth, 480);

                                                    if (mario.lives > 0 && gameTime == 0) {
                                                        mario.lives--;
                                                        mario.score += 100000;
                                                        sounds[0].currentTime = 0;
                                                        sounds[0].play();
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    const currentBrick = arr[i];

                                    //Bottom collisions for Mario
                                    if (j+1 < currentLocation.area.length && (!currentLocation.area[j+1][i].hasCollisions || currentLocation.area[j+1][i].type == "Air") && arr[i].bottomCollisions(mario, addPowerup, addEnemy)) {
                                        isHittingBottom = true;

                                        if (block.bumping > 0 && j-1 >= 0 && currentLocation.area[j-1][i].type == "Coin") {
                                            currentLocation.area[j-1][i].type = "Air";
                                            mario.addCoin(block.drawnX+10, block.drawnY-40);
                                            mario.coins++;
                                        }

                                        if (block.type == "Air") {
                                            addDebris([{
                                                img: new Image(),
                                                x: currentBrick.drawnX,
                                                y: currentBrick.drawnY,
                                                originalY: currentBrick.drawnY,
                                                time: 0,
                                                velX: -2,
                                            },
                                            {
                                                img: new Image(),
                                                x: currentBrick.drawnX+currentBrick.width,
                                                y: currentBrick.drawnY,
                                                originalY: currentBrick.drawnY,
                                                time: 0,
                                                velX: 2,
                                            },
                                            {
                                                img: new Image(),
                                                x: currentBrick.drawnX,
                                                y: currentBrick.drawnY+currentBrick.height,
                                                originalY: currentBrick.drawnY+currentBrick.height,
                                                time: 0,
                                                velX: -2,
                                            },
                                            {
                                                img: new Image(),
                                                x: currentBrick.drawnX+currentBrick.width,
                                                y: currentBrick.drawnY+currentBrick.height,
                                                originalY: currentBrick.drawnY+currentBrick.height,
                                                time: 0,
                                                velX: 2,
                                            }]);
                                        }
                                    }

                                    //Vine collisions
                                    (block.vineStructure != null || block.type.indexOf("Vine") > -1) && arr[i].vineCollisions(mario);


                                    //Left collisions
                                    if (!mario.clearedLevel && i-1 > 0 && (!row[i-1].hasCollisions || row[i-1].type == "Air") && arr[i].leftCollisions(mario)) {
                                        isHittingLeft = true;

                                        if (block.type.indexOf("Cannon") > -1) {
                                            cantShoot = true;
                                        }
                                    }

                                    //Right collisions
                                    if (!mario.clearedLevel && i+1 < row.length && (!row[i+1].hasCollisions || row[i+1].type == "Air") && arr[i].rightCollisions(mario)) {
                                        isHittingRight = true;

                                        if (block.type.indexOf("Cannon") > -1) {
                                            cantShoot = true;
                                        }
                                    }

                                    if (cantShoot) {
                                        currentLocation.area.forEach((column, k, blocks) => {
                                            blocks[k][i].timeToShootBullet = 100;
                                        });
                                    }
                                }
                            }

                            //Block collisions for enemies
                            if (currentLocation.enemies != undefined) {
                                currentLocation.enemies.forEach((enemy, k, enemies) => {
                                    enemies[k].isStanding = false;

                                    if (enemy.collisions && enemy.affectedByGravity) {
                                        if (j-1 > 0 && (!currentLocation.area[j-1][i].hasCollisions || currentLocation.area[j-1][i].type == "Air") && arr[i].topCollisions(enemies[k], mario)) {
                                            enemies[k].isStanding = true;
                                        }

                                        if (i-1 > 0 && !row[i-1].hasCollisions && arr[i].leftCollisions(enemies[k])) {
                                            enemies[k].directionFacing = "left";
                                        } else if (i+1 < row.length && !row[i+1].hasCollisions && arr[i].rightCollisions(enemies[k])) {
                                            enemies[k].directionFacing = "right";
                                        }
                                    }
                                });
                            }

                            //Block collisions for powerups
                            powerups.forEach((powerup, k) => {
                                if ((i-1 > 0 && !row[i-1].hasCollisions && arr[i].leftCollisions(powerups[k])) || (i+1 < row.length && !row[i+1].hasCollisions && arr[i].rightCollisions(powerups[k]))) {
                                    powerups[k].velX *= -1;
                                }

                                if (j+1 < currentLocation.area.length && !currentLocation.area[j+1][i].hasCollisions && arr[i].bottomCollisions(powerups[k])) {
                                    powerups[k].hitBlock = true;
                                }

                                if (j-1 > 0 && !currentLocation.area[j-1][i].hasCollisions && powerups[k].risen && !arr[i].topCollisions(powerups[k])) {
                                    powerups[k].condition = true;
                                }
                            });

                            //Block collisions for fireballs
                            for (let k = 0; k < fireballs.length; k++) {
                                if ((i-1 > 0 && !row[i-1].hasCollisions && arr[i].leftCollisions(fireballs[k])) || (i+1 < row.length && !row[i+1].hasCollisions && arr[i].rightCollisions(fireballs[k])) || (j+1 < currentLocation.area.length && !currentLocation.area[j+1][i].hasCollisions && arr[i].bottomCollisions(fireballs[k]))) {
                                    sounds[1].currentTime = 0;
                                    sounds[1].play();
                                    fireballs.splice(k, 1);
                                    continue;
                                }

                                if (j-1 > 0 && !currentLocation.area[j-1][i].hasCollisions && arr[i].topCollisions(fireballs[k]));
                            }
                        }
                    } else if (movingScreen && currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth && canUpdate) {
                        arr[i].drawnX -= mario.velX;
                    }
                });
            });

            //Determines whether Mario is falling or not
            if (!isStanding && !mario.isJumping && mario.transition == false && !mario.clearedLevel && !mario.goingUpPipe && !mario.onSpring) {
                mario.falling = true;
                mario.isOnGround = false;

                if (currentLocation.terrain != "Underwater") {
                    mario.fall();
                } else {
                    mario.drawnY += 2;
                    mario.isOnGround = false;
                }
            }

            //The reason I have two of these statements is to make sure that the background is not drawn over the pit as seen in the block.draw function, and then to make sure that every block drawn is still above this air layer
            currentLocation.area.forEach((row, j) => {
                row.forEach((block, i, arr) => {
                    if (block.drawnX <= width-shiftWidth && block.drawnX+block.width >= 0 && ["Water", "Lava", "Air"].includes(block.type)) {
                        block.draw();
                    }
                });
            });

            //All enemy logic
            if (currentLocation.enemies != undefined) {
                for (let enemy of currentLocation.enemies) {
                    if (canUpdate) {
                        enemy.update(movingScreen, currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth, mario.velX, mario.drawnX, mario.drawnY+mario.height/2, world);

                        enemy.hammers.forEach((hammer, i, hammers) => {
                            hammers[i].update(movingScreen, currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth, mario.velX, mario.drawnX, mario.velX);
                            hammers[i].collides(mario);
                        });
                    }

                    if (!enemy.gone) {
                        if (canUpdate) {
                            if (enemy.spinies.length > 0) {
                                enemy.spinies.forEach((spiny, i, arr) => {
                                    if (currentLocation.enemies.indexOf(arr[i]) == -1) {
                                        currentLocation.enemies.push(arr[i]);
                                    }
                                });
                            }
                        }

                        if (enemy.alive) {
                            if (mario.transition == false && !mario.goingUpPipe) {
                                enemy.topMarioCollisions(mario);
                                enemy.otherCollisions(mario, mario);
                            } else {
                                enemy.timeToMoveUpAndDown = 0;
                            }

                            for (let enemy2 of currentLocation.enemies) {
                                if ((enemy.collisions && enemy2.collisions) || (enemy.moving || enemy2.moving)) {
                                    enemy.otherCollisions(enemy2, mario);
                                }
                            }
                        }

                        if (enemy.type == "RedKoopa" && !enemy.inShell && enemy.drawnY == enemy.lastGroundY) {
                            let row = currentLocation.area.filter((row, i, arr) => i*40 >= enemy.drawnY+enemy.height && (i+1)*40 <= enemy.drawnY+enemy.height+40);

                            if (row.length > 0) {
                                row[0].forEach((block, i, arr) => {
                                    if (!block.hasCollisions) {
                                        if (enemy.directionFacing == "left" && enemy.drawnX-block.drawnX < 20 && enemy.drawnX-block.drawnX > 0) {
                                            enemy.directionFacing = "right";
                                        } else if (enemy.directionFacing == "right" && block.drawnX-enemy.drawnX < 20 && block.drawnX-enemy.drawnX > 0) {
                                            enemy.directionFacing = "left";
                                        }
                                    }
                                });
                            }
                        }

                        if (canUpdate && !enemy.isStanding && enemy.affectedByGravity && !enemy.isFlying && !enemy.isJumping && enemy.type.indexOf("Lakitu") == -1 && enemy.type != "BlooperSwimming" && enemy.type != "Podobo") {
                            enemy.fall();
                        }

                        if (enemy.type.indexOf("Plant") > -1 && enemy.drawnX <= width-shiftWidth && enemy.drawnX+enemy.width >= 0) {
                            enemy.draw();
                        }

                        if (enemy.drawnY > height && enemy.type != "Podobo") {
                            enemy.die("stomp");
                        }
                    }
                }
            }

            currentLocation.area.forEach((row, j) => {
                row.forEach((block, i, arr) => {
                    if (block.drawnX <= width-shiftWidth && block.drawnX+block.width >= 0 && !["Water", "Lava", "Air"].includes(block.type) && block.directionMoving == null) {
                        block.draw();

                        if (mario.clearedLevel && (block.type.indexOf("Ground") > -1 || block.type.indexOf("Cloud") > -1) && block.drawnX > newWidth/2) {
                            let ground = new Image();
                            ground.src = block.img.src;

                            for (let i = 0; i < 10; i++) {
                                graphics.drawImage(ground, block.drawnX+(i*block.width), block.drawnY, block.width, block.height);
                            }
                        }
                    }
                });
            });

            currentLocation.area.forEach((row, j) => {
                row.forEach((block, i, arr) => {
                    if (block.drawnX <= width-shiftWidth && block.drawnX+block.width >= 0 && !["Water", "Lava", "Air"].includes(block.type) && block.directionMoving != null) {
                        block.draw();
                    }
                });
            });

            setScores();

            setCoins();
            setDebris();

            fireballs.forEach((fireball, i, arr) => {
                if (canUpdate) {
                    arr[i].update(movingScreen, currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth, mario.velX);
                }

                if (fireball.drawnX <= width-shiftWidth && fireball.drawnX+fireball.width >= 0) {
                    fireball.draw();
                }

                let canBreak = false;

                if (currentLocation.enemies != undefined) {
                    currentLocation.enemies.forEach((val, j, enemies) => {
                        if (arr[i].collides(enemies[j], mario)) {
                            canBreak = true;
                            return;
                        }
                    });
                }

                //deletes fireworks if they go below the screen
                if (arr[i].drawnY > height || canBreak) {
                    arr.splice(i, 1);
                    return;
                }
            });

            if (canUpdate) {
                timeUntilNextFlame--;
            }

            if (currentLocation.enemies != undefined) {
                let bowsers = [];

                currentLocation.enemies.forEach((enemy, i, arr) => {
                    if (enemy.type == "Bowser") {
                        bowsers.push(arr[i]);
                    }
                });

                bowsers.forEach((bowser, i, arr) => {
                    if (mario.transition == "cleared castle") {
                        bowser.collisions = false;
                    }

                    if (world < 8 && timeUntilNextFlame <= 0 && currentLocation.enemies != undefined && bowser.alive && bowser.drawnX > newWidth && currentLocation.area[0][84].drawnX < newWidth && currentLocation.terrain == "Castle") {
                        flames.push(new Projectile("BowserFlame", width, 260+40*random(0, 2), "left", 0, sounds));
                        sounds[13].currentTime = 0;
                        sounds[13].play();

                        timeUntilNextFlame = 100*random(4,5);
                    }

                    if (bowser != undefined && bowser.alive) {
                        if (bowser.timeToShootFlame <= 0 && bowser.alive && bowser.drawnX <= 600) {
                            flames.push(new Projectile("BowserFlame", bowser.directionFacing == "left" ? bowser.drawnX : bowser.drawnX+bowser.width, bowser.drawnY+30, bowser.directionFacing, 0, sounds));
                            sounds[13].currentTime = 0;
                            sounds[13].play();

                            bowser.timeToShootFlame = 300;
                        }

                        if (world >= 8 || world == "D") {
                            if (canUpdate) {
                                bowser.timeToThrow--;
                            }

                            if (bowser.timeToThrow < 5) {
                                bowser.throwing = true;
                            } else {
                                bowser.throwing = false;
                            }

                            if (bowser.timeToThrow <= 0) {
                                bowser.hammers.push(new Projectile("Hammer", bowser.drawnX, bowser.drawnY, bowser.directionFacing, 1, bowser.sounds));

                                if (bowser.hammersLeft <= 0) {
                                    bowser.hammersLeft = random(3, 7);
                                    bowser.timeToThrow = 40;
                                } else {
                                    bowser.hammersLeft--;
                                    bowser.timeToThrow = 10;
                                }
                            }
                        }
                    }
                });
            }

            powerups.forEach((powerup, i, arr) => {
                if (canUpdate) {
                    arr[i].update(movingScreen, currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth, mario.velX);
                }

                if (powerup.drawnX <= width-shiftWidth && powerup.drawnX+powerup.width >= 0) {
                    powerup.draw();
                }

                if (arr[i].condition && arr[i].type != "Star" && arr[i].risen && !arr[i].isJumping && canUpdate) {
                    arr[i].fall();
                } else if (!arr[i].risen) {
                    arr[i].rise();
                }

                arr[i].collides(mario, powerups);
            });

            flames.forEach((flame, i, arr) => {
                if (flame.drawnX+flame.width >= 0) {
                    if (canUpdate) {
                        arr[i].update(movingScreen, currentLocation.canScroll, mario.velX);
                    }

                    arr[i].collides(mario);
                    flame.draw();
                }
            });

            currentLocation.enemies.forEach((enemy) => {
                enemy.hammers.forEach((hammer) => {
                    hammer.draw();
                });

                if (!enemy.gone && enemy.type.indexOf("Plant") == -1 && enemy.drawnX <= width-shiftWidth && enemy.drawnX+enemy.width >= 0) {
                    enemy.draw();
                }
            })

            currentLocation.area.forEach((row, j) => {
                row.forEach((block, i, arr) => {
                    if (arr[i].fireBar != undefined) {
                        arr[i].fireBar.forEach((fire, k, fireballs) => {
                            if (canUpdate) {
                                fireballs[k].update(movingScreen, currentLocation.canScroll && mario.drawnX >= width/2-shiftWidth, mario.velX);
                            }

                            if (k > 0) {
                                fireballs[k].collides(mario);
                            }

                            fireballs[k].draw();
                        });
                    }
                });
            });

            timeUntilNextFireball--;

            if (mario.transition == "pipe") {
                changeLocation();

                if (mario.transition != "climbing vine") {
                    mario.transition = false;
                }
            }

            if (mario.coins == 100) {
                sounds[0].currentTime = 0;
                sounds[0].play();
                mario.lives++;
                mario.coins -= 100;
            }

            mario.update(reset, currentLocation.canScroll, currentLocation.terrain, world);

            currentLocation.area.forEach((row) => {
                row.forEach((block, i, arr) => {
                    if (arr[i].type == "Flagpole") {
                        arr[i].flagpoleCollisions(mario);
                    }
                })
            })

            canUpdate = true;

            if (![false, "cleared level", "cleared castle", "walkingIntoPipe", "vine"].includes(mario.transition)) {
                canUpdate = false;
            }

            mario.canStand = true;

            let a = [];

            currentLocation.area.forEach((row, j) => {
                a = row.filter((block, i, arr) => {
                    if (!block.hasCollisions) {
                        return false;
                    }

                    return mario.drawnX+mario.width-5 > block.drawnX+2 && mario.drawnX+5 < block.drawnX+block.width-2 && mario.drawnY >= block.drawnY;
                });

                if (a.length > 0) {
                    if (mario.isCrouching) {
                        a.forEach((block, i, arr) => {
                            if(block.type != "Air" && mario.drawnY <= block.drawnY+block.height) {
                               mario.canStand = false;
                            }
                        });
                    }
                }
            });

            if (!mario.behindCastle) {
                if (mario.transition != "down pipe" && mario.transition != "into pipe" && !mario.goingUpPipe) {
                    mario.draw();
                }
            } else if (gameTime > 0) {
                sounds[3].currentTime = 0;
                sounds[3].play();
                mario.addScore(50, -100, -100);
                gameTime--;
            } else if (mario.behindCastle && gameTime <= 0) {
                if (mario.transition != "cleared castle") {
                    setFireworks();
                } else {
                    canGoToNextLevel = true;
                }
            }

            if (stage == 4 && mario.transition != "down pipe" && mario.transition != "into pipe" && !mario.goingUpPipe) {
                mario.draw();
            }

            if (isHittingLeft) {
                mario.canMoveRight = false;

                if (mario.velX > 0) {
                    mario.drawnX = mario.alignX;
                    mario.velX = 0;
                }
            } else {
                mario.canMoveRight = true;
            }

            if (isHittingRight) {
                mario.canMoveLeft = false;

                if (mario.velX < 0) {
                    mario.drawnX = mario.alignX;
                    mario.velX = 0;
                }
            } else {
                mario.canMoveLeft = true;
            }
        }

        timeUntilNextFish--;
        goBackwards();

        graphics.fillStyle = "black";
        graphics.fillRect(-shiftWidth, 0, shiftWidth, height);
        graphics.fillRect(newWidth, 0, shiftWidth, height);

        if (canGoToNextLevel && !(world == 8 && stage == 4 && game == "smb") && !(world == "D" && stage == 4 && game == "smbtll")) {
            nextLevel();
        }
    }

    //Frame rate stuff
    let oldTime = new Date();
    let fps = 0;

    const update = () => {
        //currentGame.update();

        if (!paused) {
            draw();

            time++;
        } else {
            graphics.fillStyle = "black";
            let pauseWidth = 1.5;
            let pauseHeight = 3;

            graphics.fillRect(Math.round(newWidth/2-newWidth/pauseWidth/2), Math.round(height/2-height/pauseHeight/2), Math.round(newWidth/pauseWidth), Math.round(height/pauseHeight));
            graphics.fillStyle = "white";

            graphics.font = "35px smb";
            graphics.fillText("Continue", newWidth/2, height/2-15);
            graphics.fillText("Quit", newWidth/2, height/2+50);

            graphics.drawImage(currentGame.cursor, newWidth/2-150, height/2-45+shift%2*70, 30, 30);
        }

        if (!paused && (state == "game" || state == "title screen")) {
            currentGame.playAudio(currentLocation.terrain);
        }

        let frameId = requestAnimationFrame(update);

        const newTime = new Date();
        fps++;

        if (newTime-oldTime >= 1000) {
            //console.log(fps);

            oldTime = newTime;
            fps = 0;
        }

        let option = challengeSelect.value;
        let value = challengeSlider.value;
        let canUse = false;

        if (option != "None") {
            switch (option) {
                case "GameGenie1":
                    if (true) {
                        if (!codeUsed) {
                            codeUsed = true;

                            code = prompt("Enter any text that is longer than 4 letters/digits long. (The more the better))");

                            if (code.length >= 4) {
                                for (let i = 0; i < code.length; i++) {
                                    if (code.substring(i*4, 2+i*4).length == 2) {
                                        address.push(code.substring(i*4, 2+i*4));
                                    }

                                    if (code.substring(i*4+2, (i+1)*4).length == 2) {
                                        replacement.push(code.substring(i*4+2, (i+1)*4));
                                    }
                                }
                            }

                            address.length = replacement.length;
                            
                            address.forEach((addy, j, arr) => {
                                a = 0;
                                b = 0;

                                for (let i = 0; i < addy.length; i++) {
                                    a += arr[j].charCodeAt(i);
                                    b += replacement[j].charCodeAt(i);
                                }

                                arr[j] = a;
                                replacement[j] = b;
                            });
                        }

                        address.forEach((value, j, mem) => {
                            if (mem[j] % 8 == 0) {
                                memory = Object.keys(mario);

                                let num = mem[j]%memory.length;

                                if (!["string", "object", "boolean"].includes(typeof mario[memory[num]])) {
                                    mario[memory[num]] = replacement[j];
                                }
                            } else if (mem[j] % 8 == 1) {
                                currentLocation.enemies.forEach((enemy, i, arr) => {
                                    memory = Object.keys(enemy);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = replacement[j];
                                    }

                                    if (mem[j] % 3 == 0) {
                                        arr[i].spinies.forEach((spiny, k, spinies) => {
                                            memory = Object.keys(spiny);

                                            let num = mem[j]%memory.length;

                                            if (!["string", "object", "boolean"].includes(typeof spinies[k][memory[num]])) {
                                                spinies[k][memory[num]] = replacement[j];
                                            }
                                        });
                                    } else if (mem[j] % 3 == 1) {
                                        arr[i].hammers.forEach((hammer, k, hammers) => {
                                            memory = Object.keys(hammer);

                                            let num = mem[j]%memory.length;

                                            if (!["string", "object", "boolean"].includes(typeof hammers[k][memory[num]])) {
                                                hammers[k][memory[num]] = replacement[j];
                                            }
                                        });
                                    }
                                });
                            } else if (mem[j] % 8 == 2) {
                                currentLocation.area.forEach(row => {
                                    row.forEach((block, i, arr) => {
                                        memory = Object.keys(block);

                                        let num = mem[j]%memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                            arr[i][memory[num]] = replacement[j];
                                        }

                                        if (mem[j] % 3 == 0) {
                                            arr[i].fireBar.forEach((fireball, k, fireballs) => {
                                                memory = Object.keys(fireball);

                                                let num = mem[j]%memory.length;

                                                if (!["string", "object", "boolean"].includes(typeof fireballs[k][memory[num]])) {
                                                    fireballs[k][memory[num]] = replacement[j];
                                                }
                                            });
                                        } else if (mem[j] % 3 == 1) {
                                            arr[i].bullets.forEach((bullet, k, bullets) => {
                                                memory = Object.keys(bullet);

                                                let num = mem[j]%memory.length;

                                                if (!["string", "object", "boolean"].includes(typeof bullets[k][memory[num]])) {
                                                    bullets[k][memory[num]] = replacement[j];
                                                }
                                            });
                                        }
                                    });
                                });
                            } else if (mem[j] % 8 == 3) {
                                powerups.forEach((powerup, i, arr) => {
                                    memory = Object.keys(powerup);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = replacement[j];
                                    }
                                });
                            } else if (mem[j] % 8 == 4) {
                                fireballs.forEach((fireball, i, arr) => {
                                    memory = Object.keys(fireball);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = replacement[j];
                                    }
                                });
                            } else if (mem[j] % 8 == 5) {
                                flames.forEach((flame, i, arr) => {
                                    memory = Object.keys(flame);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = replacement[j];
                                    }
                                });
                            } else if (mem[j] % 8 == 6) {
                                debris.forEach((debris, i, arr) => {
                                    memory = Object.keys(debris);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = replacement[j];
                                    }
                                });
                            } else if (mem[j] % 8 == 7) {
                                fireworks.forEach((fireworks, i, arr) => {
                                    memory = Object.keys(fireworks);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = replacement[j];
                                    }
                                });
                            }
                        });
                    }
                break;

                case "GameGenie2":
                    if (true) {
                        let bitwise = {
                            0: function(a, b) {
                                return a & b;
                            },
                            
                            1: function(a, b) {
                                return a | b;
                            },
                            
                            2: function(a, b) {
                                return a ^ b;
                            },

                            3: function(a) {
                                return ~a;
                            },

                            4: function(a, b) {
                                return a << b;
                            },

                            5: function(a, b) {
                                return a >> b;
                            },

                            6: function(a, b) {
                                return a >>> b;
                            },
                        };

                        if (!codeUsed) {
                            codeUsed = true;

                            code = prompt("Enter any text that is longer than 4 letters/digits long. (The more the better)");

                            if (code.length >= 4) {
                                for (let i = 0; i < code.length; i++) {
                                    if (code.substring(i*4, 2+i*4).length == 2) {
                                        address.push(code.substring(i*4, 2+i*4));
                                    }

                                    if (code.substring(i*4+2, (i+1)*4).length == 2) {
                                        replacement.push(code.substring(i*4+2, (i+1)*4));
                                    }
                                }
                            }

                            address.length = replacement.length;
                            
                            address.forEach((addy, j, arr) => {
                                a = 0;
                                b = 0;

                                for (let i = 0; i < addy.length; i++) {
                                    a += arr[j].charCodeAt(i);
                                    b += replacement[j].charCodeAt(i);
                                }

                                arr[j] = a;
                                replacement[j] = b;
                            });
                        }

                        address.forEach((value, j, mem) => {
                            if (mem[j] % 8 == 0) {
                                memory = Object.keys(mario);

                                let num = mem[j]%memory.length;

                                if (!["string", "object", "boolean"].includes(typeof mario[memory[num]])) {
                                    mario[memory[num]] = bitwise[replacement[j]%7](mario[memory[num]], replacement[j]);
                                }
                            } else if (mem[j] % 8 == 1) {
                                currentLocation.enemies.forEach((enemy, i, arr) => {
                                    memory = Object.keys(enemy);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }

                                    if (mem[j] % 3 == 0) {
                                        arr[i].spinies.forEach((spiny, k, spinies) => {
                                            memory = Object.keys(spiny);

                                            let num = mem[j]%memory.length;

                                            if (!["string", "object", "boolean"].includes(typeof spinies[k][memory[num]])) {
                                                spinies[k][memory[num]] = bitwise[replacement[j]%7](spinies[k][memory[num]], replacement[j]);
                                            }
                                        });
                                    } else if (mem[j] % 3 == 1) {
                                        arr[i].hammers.forEach((hammer, k, hammers) => {
                                            memory = Object.keys(hammer);

                                            let num = mem[j]%memory.length;

                                            if (!["string", "object", "boolean"].includes(typeof hammers[k][memory[num]])) {
                                                hammers[k][memory[num]] = bitwise[replacement[j]%7](hammers[k][memory[num]], replacement[j]);
                                            }
                                        });
                                    }
                                });
                            } else if (mem[j] % 8 == 2) {
                                currentLocation.area.forEach(row => {
                                    row.forEach((block, i, arr) => {
                                        memory = Object.keys(block);

                                        let num = mem[j]%memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                            arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                        }

                                        if (mem[j] % 3 == 0) {
                                            arr[i].fireBar.forEach((fireball, k, fireballs) => {
                                                memory = Object.keys(fireball);

                                                let num = mem[j]%memory.length;

                                                if (!["string", "object", "boolean"].includes(typeof fireballs[k][memory[num]])) {
                                                    fireballs[k][memory[num]] = bitwise[replacement[j]%7](fireballs[k][memory[num]], replacement[j]);
                                                }
                                            });
                                        } else if (mem[j] % 3 == 1) {
                                            arr[i].bullets.forEach((bullet, k, bullets) => {
                                                memory = Object.keys(bullet);

                                                let num = mem[j]%memory.length;

                                                if (!["string", "object", "boolean"].includes(typeof bullets[k][memory[num]])) {
                                                    bullets[k][memory[num]] = bitwise[replacement[j]%7](bullets[k][memory[num]], replacement[j]);
                                                }
                                            });
                                        }
                                    });
                                });
                            } else if (mem[j] % 8 == 3) {
                                powerups.forEach((powerup, i, arr) => {
                                    memory = Object.keys(powerup);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 4) {
                                fireballs.forEach((fireball, i, arr) => {
                                    memory = Object.keys(fireball);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 5) {
                                flames.forEach((flame, i, arr) => {
                                    memory = Object.keys(flame);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 6) {
                                debris.forEach((debris, i, arr) => {
                                    memory = Object.keys(debris);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 7) {
                                fireworks.forEach((fireworks, i, arr) => {
                                    memory = Object.keys(fireworks);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            }
                        });
                    }
                break;

                case "GameGenie3":
                    if (!randomized) {
                        randomized = true;

                        let bitwise = {
                            0: function(a, b) {
                                return a & b;
                            },
                            
                            1: function(a, b) {
                                return a | b;
                            },
                            
                            2: function(a, b) {
                                return a ^ b;
                            },

                            3: function(a) {
                                return ~a;
                            },

                            4: function(a, b) {
                                return a << b;
                            },

                            5: function(a, b) {
                                return a >> b;
                            },

                            6: function(a, b) {
                                return a >>> b;
                            },
                        };

                        if (!codeUsed) {
                            codeUsed = true;

                            code = prompt("Enter any text that is longer than 4 letters/digits long. (The more the better)");

                            if (code.length >= 4) {
                                for (let i = 0; i < code.length; i++) {
                                    if (code.substring(i*4, 2+i*4).length == 2) {
                                        address.push(code.substring(i*4, 2+i*4));
                                    }

                                    if (code.substring(i*4+2, (i+1)*4).length == 2) {
                                        replacement.push(code.substring(i*4+2, (i+1)*4));
                                    }
                                }
                            }

                            address.length = replacement.length;
                            
                            address.forEach((addy, j, arr) => {
                                a = 0;
                                b = 0;

                                for (let i = 0; i < addy.length; i++) {
                                    a += arr[j].charCodeAt(i);
                                    b += replacement[j].charCodeAt(i);
                                }

                                arr[j] = a
                                replacement[j] = b;
                            });
                        }

                        address.forEach((value, j, mem) => {
                            if (mem[j] % 8 == 0) {
                                memory = Object.keys(mario);

                                let num = mem[j]%memory.length;

                                if (!["string", "object", "boolean"].includes(typeof mario[memory[num]])) {
                                    mario[memory[num]] = bitwise[replacement[j]%7](mario[memory[num]], replacement[j]);
                                }
                            } else if (mem[j] % 8 == 1) {
                                currentLocation.enemies.forEach((enemy, i, arr) => {
                                    memory = Object.keys(enemy);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }

                                    if (mem[j] % 3 == 0) {
                                        arr[i].spinies.forEach((spiny, k, spinies) => {
                                            memory = Object.keys(spiny);

                                            let num = mem[j]%memory.length;

                                            if (!["string", "object", "boolean"].includes(typeof spinies[k][memory[num]])) {
                                                spinies[k][memory[num]] = bitwise[replacement[j]%7](spinies[k][memory[num]], replacement[j]);
                                            }
                                        });
                                    } else if (mem[j] % 3 == 1) {
                                        arr[i].hammers.forEach((hammer, k, hammers) => {
                                            memory = Object.keys(hammer);

                                            let num = mem[j]%memory.length;

                                            if (!["string", "object", "boolean"].includes(typeof hammers[k][memory[num]])) {
                                                hammers[k][memory[num]] = bitwise[replacement[j]%7](hammers[k][memory[num]], replacement[j]);
                                            }
                                        });
                                    }
                                });
                            } else if (mem[j] % 8 == 2) {
                                currentLocation.area.forEach(row => {
                                    row.forEach((block, i, arr) => {
                                        memory = Object.keys(block);

                                        let num = mem[j]%memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                            arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                        }

                                        if (mem[j] % 3 == 0) {
                                            arr[i].fireBar.forEach((fireball, k, fireballs) => {
                                                memory = Object.keys(fireball);

                                                let num = mem[j]%memory.length;

                                                if (!["string", "object", "boolean"].includes(typeof fireballs[k][memory[num]])) {
                                                    fireballs[k][memory[num]] = bitwise[replacement[j]%7](fireballs[k][memory[num]], replacement[j]);
                                                }
                                            });
                                        } else if (mem[j] % 3 == 1) {
                                            arr[i].bullets.forEach((bullet, k, bullets) => {
                                                memory = Object.keys(bullet);

                                                let num = mem[j]%memory.length;

                                                if (!["string", "object", "boolean"].includes(typeof bullets[k][memory[num]])) {
                                                    bullets[k][memory[num]] = bitwise[replacement[j]%7](bullets[k][memory[num]], replacement[j]);
                                                }
                                            });
                                        }
                                    });
                                });
                            } else if (mem[j] % 8 == 3) {
                                powerups.forEach((powerup, i, arr) => {
                                    memory = Object.keys(powerup);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 4) {
                                fireballs.forEach((fireball, i, arr) => {
                                    memory = Object.keys(fireball);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 5) {
                                flames.forEach((flame, i, arr) => {
                                    memory = Object.keys(flame);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 6) {
                                debris.forEach((debris, i, arr) => {
                                    memory = Object.keys(debris);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            } else if (mem[j] % 8 == 7) {
                                fireworks.forEach((fireworks, i, arr) => {
                                    memory = Object.keys(fireworks);

                                    let num = mem[j]%memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j]%7](arr[i][memory[num]], replacement[j]);
                                    }
                                });
                            }
                        });
                    }
                break;

                case "GameGenie4":
                    if (true) {
                        if (!codeUsed) {
                            codeUsed = true;

                            code = prompt("Enter any text that is longer than 4 letters/digits long. (The more the better))");

                            if (code.length >= 4) {
                                for (let i = 0; i < code.length; i++) {
                                    if (code.substring(i * 4, 2 + i * 4).length == 2) {
                                        address.push(code.substring(i * 4, 2 + i * 4));
                                    }

                                    if (code.substring(i * 4 + 2, (i + 1) * 4).length == 2) {
                                        replacement.push(code.substring(i * 4 + 2, (i + 1) * 4));
                                    }
                                }
                            }

                            address.length = replacement.length;

                            address.forEach((addy, j, arr) => {
                                a = 0;
                                b = 0;

                                for (let i = 0; i < addy.length; i++) {
                                    a += arr[j].charCodeAt(i);
                                    b += replacement[j].charCodeAt(i);
                                }

                                arr[j] = a;
                                replacement[j] = b;
                            });
                        }

                        address.forEach((value, j, mem) => {
                            memory = Object.keys(mario);

                            let num = mem[j] % memory.length;

                            if (!["string", "object", "boolean"].includes(typeof mario[memory[num]])) {
                                mario[memory[num]] = replacement[j];
                            }

                            currentLocation.enemies.forEach((enemy, i, arr) => {
                                memory = Object.keys(enemy);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = replacement[j];
                                }


                                arr[i].spinies.forEach((spiny, k, spinies) => {
                                    memory = Object.keys(spiny);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof spinies[k][memory[num]])) {
                                        spinies[k][memory[num]] = replacement[j];
                                    }
                                });

                                arr[i].hammers.forEach((hammer, k, hammers) => {
                                    memory = Object.keys(hammer);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof hammers[k][memory[num]])) {
                                        hammers[k][memory[num]] = replacement[j];
                                    }
                                });

                            });

                            currentLocation.area.forEach(row => {
                                row.forEach((block, i, arr) => {
                                    memory = Object.keys(block);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = replacement[j];
                                    }


                                    arr[i].fireBar.forEach((fireball, k, fireballs) => {
                                        memory = Object.keys(fireball);

                                        let num = mem[j] % memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof fireballs[k][memory[num]])) {
                                            fireballs[k][memory[num]] = replacement[j];
                                        }
                                    });

                                    arr[i].bullets.forEach((bullet, k, bullets) => {
                                        memory = Object.keys(bullet);

                                        let num = mem[j] % memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof bullets[k][memory[num]])) {
                                            bullets[k][memory[num]] = replacement[j];
                                        }
                                    });

                                });
                            });

                            powerups.forEach((powerup, i, arr) => {
                                memory = Object.keys(powerup);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = replacement[j];
                                }
                            });

                            fireballs.forEach((fireball, i, arr) => {
                                memory = Object.keys(fireball);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = replacement[j];
                                }
                            });

                            flames.forEach((flame, i, arr) => {
                                memory = Object.keys(flame);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = replacement[j];
                                }
                            });

                            debris.forEach((debris, i, arr) => {
                                memory = Object.keys(debris);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = replacement[j];
                                }
                            });

                            fireworks.forEach((fireworks, i, arr) => {
                                memory = Object.keys(fireworks);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = replacement[j];
                                }
                            });
                        });
                    }
                break;

                case "GameGenie5":
                    if (true) {
                        let bitwise = {
                            0: function(a, b) {
                                return a & b;
                            },

                            1: function(a, b) {
                                return a | b;
                            },

                            2: function(a, b) {
                                return a ^ b;
                            },

                            3: function(a) {
                                return ~a;
                            },

                            4: function(a, b) {
                                return a << b;
                            },

                            5: function(a, b) {
                                return a >> b;
                            },

                            6: function(a, b) {
                                return a >>> b;
                            },
                        };

                        if (!codeUsed) {
                            codeUsed = true;

                            code = prompt("Enter any text that is longer than 4 letters/digits long. (The more the better)");

                            if (code.length >= 4) {
                                for (let i = 0; i < code.length; i++) {
                                    if (code.substring(i * 4, 2 + i * 4).length == 2) {
                                        address.push(code.substring(i * 4, 2 + i * 4));
                                    }

                                    if (code.substring(i * 4 + 2, (i + 1) * 4).length == 2) {
                                        replacement.push(code.substring(i * 4 + 2, (i + 1) * 4));
                                    }
                                }
                            }

                            address.length = replacement.length;

                            address.forEach((addy, j, arr) => {
                                a = 0;
                                b = 0;

                                for (let i = 0; i < addy.length; i++) {
                                    a += arr[j].charCodeAt(i);
                                    b += replacement[j].charCodeAt(i);
                                }

                                arr[j] = a;
                                replacement[j] = b;
                            });
                        }

                        address.forEach((value, j, mem) => {
                            memory = Object.keys(mario);

                            let num = mem[j] % memory.length;

                            if (!["string", "object", "boolean"].includes(typeof mario[memory[num]])) {
                                mario[memory[num]] = bitwise[replacement[j] % 7](mario[memory[num]], replacement[j]);
                            }
                            currentLocation.enemies.forEach((enemy, i, arr) => {
                                memory = Object.keys(enemy);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }

                                arr[i].spinies.forEach((spiny, k, spinies) => {
                                    memory = Object.keys(spiny);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof spinies[k][memory[num]])) {
                                        spinies[k][memory[num]] = bitwise[replacement[j] % 7](spinies[k][memory[num]], replacement[j]);
                                    }
                                });
                                arr[i].hammers.forEach((hammer, k, hammers) => {
                                    memory = Object.keys(hammer);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof hammers[k][memory[num]])) {
                                        hammers[k][memory[num]] = bitwise[replacement[j] % 7](hammers[k][memory[num]], replacement[j]);
                                    }
                                });
                            });
                            currentLocation.area.forEach(row => {
                                row.forEach((block, i, arr) => {
                                    memory = Object.keys(block);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                    }

                                    arr[i].fireBar.forEach((fireball, k, fireballs) => {
                                        memory = Object.keys(fireball);

                                        let num = mem[j] % memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof fireballs[k][memory[num]])) {
                                            fireballs[k][memory[num]] = bitwise[replacement[j] % 7](fireballs[k][memory[num]], replacement[j]);
                                        }
                                    });
                                    arr[i].bullets.forEach((bullet, k, bullets) => {
                                        memory = Object.keys(bullet);

                                        let num = mem[j] % memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof bullets[k][memory[num]])) {
                                            bullets[k][memory[num]] = bitwise[replacement[j] % 7](bullets[k][memory[num]], replacement[j]);
                                        }
                                    });
                                });
                            });
                            powerups.forEach((powerup, i, arr) => {
                                memory = Object.keys(powerup);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            fireballs.forEach((fireball, i, arr) => {
                                memory = Object.keys(fireball);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            flames.forEach((flame, i, arr) => {
                                memory = Object.keys(flame);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            debris.forEach((debris, i, arr) => {
                                memory = Object.keys(debris);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            fireworks.forEach((fireworks, i, arr) => {
                                memory = Object.keys(fireworks);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });
                        });
                    }
                break;

                case "GameGenie6":
                    if (!randomized) {
                        randomized = true;

                        let bitwise = {
                            0: function(a, b) {
                                return a & b;
                            },

                            1: function(a, b) {
                                return a | b;
                            },

                            2: function(a, b) {
                                return a ^ b;
                            },

                            3: function(a) {
                                return ~a;
                            },

                            4: function(a, b) {
                                return a << b;
                            },

                            5: function(a, b) {
                                return a >> b;
                            },

                            6: function(a, b) {
                                return a >>> b;
                            },
                        };

                        if (!codeUsed) {
                            codeUsed = true;

                            code = prompt("Enter any text that is longer than 4 letters/digits long. (The more the better)");

                            if (code.length >= 4) {
                                for (let i = 0; i < code.length; i++) {
                                    if (code.substring(i * 4, 2 + i * 4).length == 2) {
                                        address.push(code.substring(i * 4, 2 + i * 4));
                                    }

                                    if (code.substring(i * 4 + 2, (i + 1) * 4).length == 2) {
                                        replacement.push(code.substring(i * 4 + 2, (i + 1) * 4));
                                    }
                                }
                            }

                            address.length = replacement.length;

                            address.forEach((addy, j, arr) => {
                                a = 0;
                                b = 0;

                                for (let i = 0; i < addy.length; i++) {
                                    a += arr[j].charCodeAt(i);
                                    b += replacement[j].charCodeAt(i);
                                }

                                arr[j] = a
                                replacement[j] = b;
                            });
                        }

                        address.forEach((value, j, mem) => {

                            memory = Object.keys(mario);

                            let num = mem[j] % memory.length;

                            if (!["string", "object", "boolean"].includes(typeof mario[memory[num]])) {
                                mario[memory[num]] = bitwise[replacement[j] % 7](mario[memory[num]], replacement[j]);
                            }

                            currentLocation.enemies.forEach((enemy, i, arr) => {
                                memory = Object.keys(enemy);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }


                                arr[i].spinies.forEach((spiny, k, spinies) => {
                                    memory = Object.keys(spiny);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof spinies[k][memory[num]])) {
                                        spinies[k][memory[num]] = bitwise[replacement[j] % 7](spinies[k][memory[num]], replacement[j]);
                                    }
                                });

                                arr[i].hammers.forEach((hammer, k, hammers) => {
                                    memory = Object.keys(hammer);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof hammers[k][memory[num]])) {
                                        hammers[k][memory[num]] = bitwise[replacement[j] % 7](hammers[k][memory[num]], replacement[j]);
                                    }
                                });

                            });

                            currentLocation.area.forEach(row => {
                                row.forEach((block, i, arr) => {
                                    memory = Object.keys(block);

                                    let num = mem[j] % memory.length;

                                    if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                        arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                    }


                                    arr[i].fireBar.forEach((fireball, k, fireballs) => {
                                        memory = Object.keys(fireball);

                                        let num = mem[j] % memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof fireballs[k][memory[num]])) {
                                            fireballs[k][memory[num]] = bitwise[replacement[j] % 7](fireballs[k][memory[num]], replacement[j]);
                                        }
                                    });

                                    arr[i].bullets.forEach((bullet, k, bullets) => {
                                        memory = Object.keys(bullet);

                                        let num = mem[j] % memory.length;

                                        if (!["string", "object", "boolean"].includes(typeof bullets[k][memory[num]])) {
                                            bullets[k][memory[num]] = bitwise[replacement[j] % 7](bullets[k][memory[num]], replacement[j]);
                                        }
                                    });

                                });
                            });

                            powerups.forEach((powerup, i, arr) => {
                                memory = Object.keys(powerup);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            fireballs.forEach((fireball, i, arr) => {
                                memory = Object.keys(fireball);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            flames.forEach((flame, i, arr) => {
                                memory = Object.keys(flame);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            debris.forEach((debris, i, arr) => {
                                memory = Object.keys(debris);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                            fireworks.forEach((fireworks, i, arr) => {
                                memory = Object.keys(fireworks);

                                let num = mem[j] % memory.length;

                                if (!["string", "object", "boolean"].includes(typeof arr[i][memory[num]])) {
                                    arr[i][memory[num]] = bitwise[replacement[j] % 7](arr[i][memory[num]], replacement[j]);
                                }
                            });

                        });
                    }
                break;

                case "Randomizer":
                    if (!randomized) {
                        randomized = true;

                        let array = ["G", "K", "B", "Q", "W", "E", "L", "P", "F", "I", "H", "R", "D", "T", "U", "A", "S"];

                        randomized = true;

                        currentLocation.enemies.forEach((enemy, i, arr) => {
                            arr[i] = new Enemy(arr[i].constantX, arr[i].constantY, arr[i].width, arr[i].height, array[random(0, array.length-1)], currentGame.gravity, sounds, currentLocation.terrain);
                            arr[i].drawnY -= 50;
                        });

                        array = ["0","2","3","q","p","r","b","*","s",
                                 "{","}","/","|","g","^","+","-","v","=",
                                 "_","n","w","e","y","o","m","?","¿","@",
                                 "#","d","h","j","(",")","%","<","l",
                                 "™","§","¶","•","ª","º","œ","†","¥"];

                        currentLocation.area.forEach(row => {
                            row.forEach((block, i, arr) => {
                                if (block.hasCollisions && !block.canEnter && !["Flagpole", "FullRedSpring", "FullGreenSpring", "Bridge", "Axe"].includes(block.type) && block.storedType != "6" && block.contains != "Vine") {
                                    arr[i] = new Block(array[random(0, array.length-1)], block.constantX, block.constantY, block.constantX, block.constantY, block.constantWidth, block.constantHeight, sounds, currentLocation.terrain);
                                    arr[i].isEdge = false;
                                }
                            })
                        });

                        array = ["coin", "powerup", "1up", "10 coins", "Star", "PoisonMushroom"];

                        currentLocation.area.forEach(row => {
                            row.forEach((block, i, arr) => {
                                if (block.type.indexOf("Brick") > -1 || block.type.indexOf("QuestionBlock") > -1) {
                                    if (!random(0, challengeSlider.value)) {
                                        arr[i].contains = array[random(0, array.length-1)];
                                    } else {
                                        arr[i].contains = null;
                                    }
                                }
                            });
                        });
                    }

                    challengeSlider.min = 0;
                    challengeSlider.max = 10;
                    canUse = true;
                break;

                case "EnemyRandomizer":
                    if (!randomized) {
                        const array = ["G", "K", "B", "Q", "W", "E", "L", "P", "F", "I", "H", "R", "D", "T", "U", "A", "S"];

                        randomized = true;


                        currentLocation.enemies.forEach((enemy, i, arr) => {
                            arr[i] = new Enemy(arr[i].constantX, arr[i].constantY, arr[i].width, arr[i].height, array[random(0, array.length-1)], currentGame.gravity, sounds, currentLocation.terrain);
                            arr[i].drawnY -= 50;
                        });
                    }
                break;

                case "BlockRandomizer":
                    if (!randomized) {
                        randomized = true;

                        const array = ["0","2","3","q","p","r","b","*","s",
                                   "{","}","/","|","g","^","+","-","v","=",
                                   "_","n","w","e","y","o","m","?","¿","@",
                                   "#","d","h","j","(",")","%","<","l",
                                   "™","§","¶","•","ª","º","œ","†","¥"];

                        currentLocation.area.forEach(row => {
                            row.forEach((block, i, arr) => {
                                if (block.hasCollisions && !block.canEnter && !["Flagpole", "FullRedSpring", "FullGreenSpring", "Bridge", "Axe"].includes(block.type) && block.storedType != "6" && block.contains != "Vine") {
                                    arr[i] = new Block(array[random(0, array.length-1)], block.constantX, block.constantY, block.constantX, block.constantY, block.constantWidth, block.constantHeight, sounds, currentLocation.terrain);
                                    arr[i].isEdge = false;
                                }
                            })
                        });
                    }
                break;

                case "ItemRandomizer":
                    if (!randomized) {
                        randomized = true;

                        const array = ["coin", "powerup", "1up", "10 coins", "Star", "PoisonMushroom"];

                        currentLocation.area.forEach(row => {
                            row.forEach((block, i, arr) => {
                                if ((block.type.indexOf("Brick") > -1 || block.type.indexOf("QuestionBlock") > -1) && block.contains != "Vine") {
                                    if (!random(0, challengeSlider.value)) {
                                        arr[i].contains = array[random(0, array.length-1)];
                                    } else {
                                        arr[i].contains = null;
                                    }
                                }
                            });
                        });
                    }

                    challengeSlider.min = 0;
                    challengeSlider.max = 10;
                    canUse = true;
                break;

                case "PoisonCoins":
                    currentLocation.area.forEach(row => {
                        row.forEach((block, i, arr) => {
                            if (block.type == "Coin") {
                                if (canUpdate && mario.invincibility <= 0 && arr[i].collides(mario)) {
                                    mario.hit();
                                }
                            }
                        });
                    });
                break;

                case "EnemySky":
                    challengeSlider.min = 0;
                    challengeSlider.max = 1000;
                    canUse = true;

                    if (time%challengeSlider.value == 0) {
                        const array = ["G", "K", "B", "Q", "W", "E", "L", "P", "F", "I", "H", "R", "D", "T", "U", "A", "S"];

                        currentLocation.enemies.push(new Enemy(random(0, newWidth-80), -100, 40, 40, array[random(0, array.length-1)], gravity, sounds, currentLocation.terrain, null));
                    }
                break;

                case "PoisonSky":
                    challengeSlider.min = 0;
                    challengeSlider.max = 1000;
                    canUse = true;

                    if (time%challengeSlider.value == 0) {
                        powerups.push(new Powerup(random(0, newWidth-40), -80, "PoisonMushroom", gravity, music, sounds, currentLocation.terrain));
                    }
                break;

                case "AliceInWonderLand1":
                    challengeSlider.min = 50;
                    challengeSlider.max = 300;
                    canUse = true;

                    currentLocation.enemies.forEach((enemy, i, arr) => {
                        if (arr[i].constantWidth*challengeSlider.value/100 != arr[i].width) {
                            arr[i].width = arr[i].constantWidth*challengeSlider.value/100;
                            arr[i].height = arr[i].constantHeight*challengeSlider.value/100;
                            arr[i].drawnY -= arr[i].height-arr[i].constantHeight;
                        }
                    });

                    currentLocation.area.forEach(row => {
                        row.forEach((block, i, arr) => {
                            if (arr[i].constantWidth*challengeSlider.value/100 != arr[i].width) {
                                arr[i].width = arr[i].constantWidth*challengeSlider.value/100;
                                arr[i].height = arr[i].constantHeight*challengeSlider.value/100;
                            }
                        });
                    });
                break;

                case "AliceInWonderLand2":
                    if (!randomized) {
                        randomized = true;

                        currentLocation.enemies.forEach((enemy, i, arr) => {
                            arr[i].width = arr[i].constantWidth*random(50, 300)/100;
                            arr[i].height = arr[i].constantHeight*random(50, 300)/100;

                            arr[i].drawnY -= arr[i].height-arr[i].constantHeight;
                        });

                        currentLocation.area.forEach(row => {
                            row.forEach((block, i, arr) => {
                                arr[i].width = arr[i].constantWidth*random(50, 300)/100;
                                arr[i].height = arr[i].constantHeight*random(50, 300)/100;
                            });
                        });
                    }
                break;

                case "ResetLevel":
                    reset();
                    challengeSelect.value = "None";
                break;

                case "RandomFirebar":
                    if (!randomized) {
                        randomized = true;


                        currentLocation.area.forEach(row => {
                            row.forEach((block, i, arr) => {
                                if (block.hasCollisions) {
                                    let rand = random(0, challengeSlider.value);

                                    if (!rand || rand == 1 || rand == 2) {
                                        arr[i].fireBar = [];

                                        let angle = Math.random()*Math.PI*2;

                                        for (let j = 0; j < 6; j++) {
                                            arr[i].fireBar.push(new Projectile("Firebar", block.drawnX+block.width/2-10, block.drawnY+block.height/2-10, -1, 1, sounds, j*20, angle));
                                        }
                                    } else if (rand == challengeSlider.max) {
                                        arr[i].fireBar = [];

                                        let angle = Math.random()*Math.PI*2;

                                        for (let j = 0; j < 12; j++) {
                                            block.fireBar.push(new Projectile("Firebar", block.drawnX+block.width/2-10, block.drawnY+block.height/2-10, -1, 1, sounds, j*20, angle));
                                        }
                                    }
                                }
                            });
                        });
                    }

                    challengeSlider.min = 0;
                    challengeSlider.max = 50;
                    canUse = true;
                break;

                case "ChooseLevel":
                    world = prompt(`What world do you want? (${game == "smb" ? `1, 8` : `1, 8, 9, C, D`})`);
                    world = world.toUpperCase();

                    stage = prompt(`What level do you ? (${world == "C" ? `3` : `1-4`})`);

                    if (((game == "smb" && ![1,8].includes(world)) || (game == "smbtll" && !["1", "8", "9", "C", "D"].includes(world))) && !["1", "2", "3", "4"].includes(stage)) {
                        if (world == "C" && stage != 3) {
                            alert("Enter a valid level!");
                        } else {
                            alert("Enter a valid level!");
                        }
                    } else {
                        level = `${world}-${stage}`;
                        currentLocation = levels[level].areas[0];
                        reset();
                        challengeSelect.value = "None";
                    }
                break;

                case "NoFriction":
                    challengeSlider.min = 0;
                    challengeSlider.max = 100;
                    canUse = true;

                    mario.friction = challengeSlider.value/100;
                break;

                case "Poison":
                    if (!randomized) {
                        randomized = true;

                        currentLocation.area.forEach(row => {
                            row.forEach((block, i, arr) => {
                                if ((block.type.indexOf("Brick") > -1 || block.type.indexOf("QuestionBlock") > -1) && block.contains != "Vine") {
                                    arr[i].contains = "PoisonMushroom";
                                }
                            });
                        });
                    }
                break;

                case "Blur":
                    challengeSlider.min = 0;
                    challengeSlider.max = 20;
                    canUse = true;
                    canvas.style.filter = `blur(${value}px)`;

                break;

                case "Brightness":
                    challengeSlider.min = 0;
                    challengeSlider.max = 1000;
                    canUse = true;
                    canvas.style.filter = `brightness(${value}%)`;
                break;

                case "Contrast":
                    challengeSlider.min = 0;
                    challengeSlider.max = 1000;
                    canUse = true;
                    canvas.style.filter = `contrast(${value}%)`;
                break;

                case "Grayscale":
                    challengeSlider.min = 0;
                    challengeSlider.max = 100;
                    canUse = true;
                    canvas.style.filter = `grayscale(${value}%)`;
                break;

                case "Hue":
                    challengeSlider.min = 0;
                    challengeSlider.max = 360;
                    canUse = true;
                    canvas.style.filter = `hue-rotate(${value}deg)`;
                break;

                case "Invert":
                    challengeSlider.min = 0;
                    challengeSlider.max = 100;
                    canUse = true;
                    canvas.style.filter = `invert(${value}%)`;
                break;

                case "Opacity":
                    challengeSlider.min = 0;
                    challengeSlider.max = 100;
                    canUse = true;
                    canvas.style.filter = `opacity(${value}%)`;
                break;

                case "Saturate":
                    challengeSlider.min = 0;
                    challengeSlider.max = 1000;
                    canUse = true;
                    canvas.style.filter = `saturate(${value}%)`;
                break;

                case "Sepia":
                    challengeSlider.min = 0;
                    challengeSlider.max = 100;
                    canUse = true;
                    canvas.style.filter = `sepia(${value}%)`;
                break;

                case "NoTime":
                    if (gameTime > 100) {
                        gameTime = 100;
                    }
                break;

                case "OneLife":
                    if (mario.lives > 1) {
                        mario.lives = 1;
                    }
                break;

                case "NoPowerups":
                    mario.isBig = false;
                    mario.hasFireFlower = false;
                    mario.hasStar = false;
                break;

                case "Shadow":
                    challengeSlider.min = 0;
                    challengeSlider.max = 100;
                    canUse = true;
                    graphics.shadowColor = "black";
                    graphics.shadowBlur = Math.round(challengeSlider.value/10);
                    graphics.shadowOffsetX = challengeSlider.value;
                    graphics.shadowOffsetY = challengeSlider.value;
                break;

                case "MovingPlatform":
                    challengeSlider.min = 1;
                    challengeSlider.max = 5;
                    canUse = true;

                    const object = {
                        1: "up",
                        2: "cyclic1",
                        3: "cyclic2",
                        4: "drop",
                        5: "right"
                    }

                    currentLocation.area.forEach((row) => {
                        row.forEach((block, i, arr) => {
                            if (block.directionMoving != object[challengeSlider.value]) {
                                arr[i].directionMoving = object[challengeSlider.value];
                            }
                        });
                    });
                break;

                case "DoubleSpeed":
                    frameId = requestAnimationFrame(update);
                break;

                case "HammerBros":
                    currentLocation.enemies.forEach((enemy, i, arr) => {
                        if (arr[i].type != "HammerBros") {
                            arr[i].type = "HammerBros";
                            arr[i].drawnY -= 30;
                        }
                    })
                break;

                case "Hammers":
                    challengeSlider.min = 0;
                    challengeSlider.max = 2;
                    canUse = true;

                    currentLocation.enemies.forEach((enemy, i, arr) => {
                        if (enemy.type != "HammerBros" && enemy.type != "Bowser") {
                            if (challengeSlider.value == 0) {
                                if (canUpdate) {
                                    arr[i].timeToThrow--;
                                }

                                if (enemy.timeToThrow < 20) {
                                    arr[i].throwing = true;
                                } else {
                                    arr[i].throwing = false;
                                }

                                if (enemy.timeToThrow <= 0 && enemy.drawnX <= newWidth && enemy.alive) {
                                    arr[i].hammersLeft--;

                                    if (enemy.hammersLeft <= 0) {
                                        arr[i].timeToThrow = 70;
                                        arr[i].hammersLeft = random(3, 7);
                                    } else {
                                        arr[i].timeToThrow = 40;
                                    }

                                    arr[i].hammers.push(new Projectile("Hammer", arr[i].drawnX, arr[i].drawnY, arr[i].directionFacing, 1, sounds));
                                }
                            } else if (challengeSlider.value == 1) {
                                if (canUpdate) {
                                    arr[i].timeToShootFlame--;
                                }

                                if (enemy.timeToShootFlame <= 0 && enemy.alive && enemy.drawnX <= 600) {
                                    flames.push(new Projectile("BowserFlame", enemy.directionFacing == "left" ? enemy.drawnX : enemy.drawnX+enemy.width, enemy.drawnY+30, enemy.directionFacing, 0, sounds));
                                    sounds[13].currentTime = 0;
                                    sounds[13].play();

                                    arr[i].timeToShootFlame = 300;
                                }
                            } else {
                                if (canUpdate) {
                                    arr[i].timeToThrow--;
                                }

                                if (enemy.timeToThrow < 5) {
                                    arr[i].throwing = true;
                                } else {
                                    arr[i].throwing = false;
                                }

                                if (enemy.timeToThrow <= 0) {
                                    arr[i].hammers.push(new Projectile("Hammer", enemy.drawnX, enemy.drawnY, enemy.directionFacing, 1, enemy.sounds));

                                    if (enemy.hammersLeft <= 0) {
                                        enemy.hammersLeft = random(3, 7);
                                        enemy.timeToThrow = 40;
                                    } else {
                                        enemy.hammersLeft--;
                                        enemy.timeToThrow = 10;
                                    }
                                }
                            }
                        }
                    });
                break;

                case "Bowser":
                    currentLocation.enemies.forEach((enemy, i, arr) => {
                        if (arr[i].type != "Bowser") {
                            arr[i].type = "Bowser";
                            arr[i].width = 80;
                            arr[i].height = 80;
                            arr[i].canStomp = false;
                            arr[i].drawnY -= 50;
                        }
                    });
                break;

                case "Flower":
                    if (!mario.isBig || !mario.hasFireFlower) {
                        mario.isBig = true;
                        mario.hasFireFlower = true;
                        mario.drawnY -= 40;
                        mario.lastGroundY -= 40;
                    }
                break;

                case "Star":
                    mario.hasStar = true;
                    mario.invincibility = 10;
                break;

                case "OneColor":
                    graphics.shadowColor = "black";
                    graphics.setTransform(1, 0, 0, 1, -1000, 0);
                    graphics.offsetX = 1000;
                    graphics.clearRect(-1000, 0, 2000+width, height);

                break;
            }
        } else {
            canvas.style.filter = "none";
            codeUsed = false;
            randomized = false;
            mario.friction = 0.9;
        }

        if (canUse) {
            canUseChallengeSlider.innerText = "You can use the challenge slider";
        } else {
            canUseChallengeSlider.innerText = "You cannot use the challenge slider";
        }

        if (quit) {
            cancelAnimationFrame(frameId);
            gameEnded = true;
            codeUsed = false;
            randomized = false;
            return;
        }
    }

    let intervalId;

    const updateTime = () => {
        if (gameTime <= 0 && !mario.clearedLevel && mario.transition != "cleared castle") {
            mario.die();   
        }

        if (gameTime == 100 && music.src != `${pathname}/sounds/hurryUp.wav` && music.src != `${pathname}/sounds/savePrincess.wav`) {
            music.src = `${pathname}/sounds/hurryUp.wav`;
        }

        if (!paused && gameTime > 0 && mario.transition == false && !mario.clearedLevel && state == "game") {
            gameTime--;
        }

        if (quit) {
            clearInterval(intervalId);
            return;
        }
    }

    //console.log(gameEngine + "");

    update();
    intervalId = setInterval(updateTime, 400);
}
