"use strict";
//Mario which is who the player plays as
function Player(lives, gravity, music, sounds, coins) {
	//What x coordinate mario is drawn to the screen to
	this.drawnX = 80;
	//If mario is too far forwards or hits a block this is what the drawnX will be set to
	this.alignX = this.drawnX;
	//Y coordinate mario is drawn to
	this.drawnY = 480;
	//The last ground y mario is at whichi s used in the jump function
	this.lastGroundY = this.drawnY;
	this.width = 40;
	this.standardWidth = 40;
	this.standardHeight = 40;
	this.height = 40;
	//Does mario at least have the mushroom powerup?
	this.isBig = false;
	this.bigHeight = 80;
	this.hasFireFlower = false;
	this.hasStar = false;
	//Used for either when mario has the star or has taken a hit
	this.invincibility = 0;
	this.isJumping = false;
	this.jumpHeight = -20
	this.isOnGround = true;
	this.falling = false;
	this.timeFromJump = 0;
	this.isRunning = false;
	this.isWalking = false;
	this.isChangingDirections = "none";
	this.directionFacing = "right";
	this.keyLastPressed = "right";
	this.isCrouching = false;
	this.crouchWidth = 45;
	this.crouchHeight = 60;
	this.crouchingFriction = 0.5;
	this.standardFriction = 0.05;
	this.lives = lives;
	this.constantLives = 3;
	this.velX = 0;
	this.maxCrouchingSpeed = 2;
	this.underwaterMultiplier = 1;
	this.maxSwimmingSpeed = 2.5;
	this.maxWalkingSpeed = 4;
	this.maxRunningSpeed = 9;
	this.velY = 0;
	this.lastVelY = 0;
	this.friction = 0.9;
	this.gravity = gravity;
	this.canMoveRight = true;
	this.canMoveLeft = true;
	this.alive = true;
	this.hitBlock = false;
	this.throwingFireball = false;
	this.timeUntilCanThrowFireball = 0;
	//The amount of enemies in a row mario has stomped on or killed with a star
	this.enemyStreak = 0;
	this.stompedOnEnemy = false;
	this.score = 0;
	this.scoreList = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000, "1UP"];
	//Score values currently drawn to the screen
	this.scoreValues = [];
	this.coins = coins;
	//The animation from coins when you hit a question block containing coins
	this.coinAnimationList = [];
	//Is mario allowed to enter somewhere?
	this.canEnter = false;
	//Used to determine what state mario is in
	this.transition = false;
	this.timeUntilNoTransition = 0;
	this.goingUpPipe = false;
	this.canPlayJumpSound = false;
	this.clearedLevel = false;
	this.timeUntilFallFromFlagpole = 0;
	this.isMovingOnPole = true;
	this.canGoToCastle = false;
	this.timeUntilGoToCastle = 0;
	this.hasFlippedOnPole = false;
	this.isWalkingToCastle = false;
	this.behindCastle = false;
	this.timeToMoveToNextLevel = 0;
	this.flagpoleScores = [100, 400, 800, 2000, 5000];
	this.img = new Image();
	this.img.src = `${pathname}/images/smallMarioStanding.png`;
	this.time = 0;
    this.leftPressed = false;
    this.rightPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    this.zPressed = false;
    this.xPressed = false;
    this.music = music;
    this.sounds = sounds;
    this.canClearLevel = false;
    this.canStand = true;
    this.blockMovingOn = null;
    this.onSpring = false;
    this.springVelocity = -18;
    this.blockStandingOn = null;
    this.blockEntering = null;
    this.swimming = false;
    this.type = "small";
}

Player.prototype = {
	constructor: Player,

	update: function(reset, canScroll, terrain, world) {
		this.time++;

		//Determines what conditions allow this.transition to be false
		if (this.timeUntilNoTransition <= 0 && this.alive && !this.clearedLevel && !["walkingIntoPipe", "vine", "climbing vine", "cleared castle"].includes(this.transition) && !this.goingUpPipe) {
			this.transition = false;
		}

		//Is mario dead?
		if (this.drawnY > height && this.transition != "climbing vine" && !this.clearedLevel) {
			if (terrain != "Sky") {
				if (this.alive) {
					this.timeFromJump = 0;
					this.lastGroundY = height;
					this.die();
				} else {
					if (this.music.currentTime/this.music.duration >= .85) {
						if (this.lives > 0) {
							reset();
						} 

						if (this.music.src != `${pathname}/sounds/gameOver.wav` && this.lives == 0) {
							this.music.src = `${pathname}/sounds/gameOver.wav`;
							this.music.play();
							reset();
						}
					}
				}
			} else {
				this.transition = "pipe";
			}
		}

		if (this.isBig && this.alive) {
			this.height = this.bigHeight;
		} else {
			this.height = this.bigHeight/2;
		}

		if (this.isOnGround) {
			this.velY = 0;
			this.stompedOnEnemy = false;
		}

		if (this.transition == false && !this.goingUpPipe) {
			if (this.drawnX > width/2-shiftWidth && canScroll) {
				this.drawnX = width/2-shiftWidth;
			}

			if (this.zPressed && (this.leftPressed || this.rightPressed) && terrain != "Underwater") {
				this.isRunning = true;
			} else if (this.leftPressed || this.rightPressed) {
				this.isWalking = true;
			} else {
				this.isRunning = false;
				this.isWalking = false;
			}

			//Crouching code
			if (((this.downPressed && this.isOnGround) || !this.canStand) && this.isBig) {
				if (!this.isCrouching && this.isBig) {
					this.drawnY += this.standardHeight/2;
					this.lastGroundY += this.standardHeight/2;
				}

				this.isCrouching = true;
				
				if (this.isBig) {
					this.isRunning = false;
					this.isWalking = false;
					this.width = this.crouchWidth;
					this.height = this.crouchHeight;
				}
			} else {
				if (this.canStand) {
					if (this.isCrouching && !this.isOnGround) {
						if (!this.isCrouching && this.isBig) {
							this.drawnY += this.standardHeight/2;
							this.lastGroundY += this.standardHeight/2;
						}

						if (this.isBig) {
							this.isRunning = false;
							this.isWalking = false;
							this.width = this.crouchWidth;
							this.height = this.crouchHeight;
						}
					} else {
						this.isCrouching = false;

						if (this.isBig) {
							this.height = this.bigHeight;
						} else {
							this.height = this.bigHeight/2;
						}

						this.width = this.standardWidth;
					}
				}
			}

			if (this.leftPressed) {
				this.keyLastPressed = "left";

				if (this.canMoveLeft && this.isCrouching && this.isBig && this.isJumping && Math.abs(this.velX) < this.maxCrouchingSpeed) {
					this.velX -= this.crouchingFriction;
				}
			} else if (this.rightPressed) {
				this.keyLastPressed = "right";

				if (this.canMoveRight && this.isCrouching && this.isBig && this.isJumping && Math.abs(this.velX) < this.maxCrouchingSpeed) {
					this.velX += this.crouchingFriction;
				}
			}

			this.underwaterMultiplier = this.isOnGround ? 0.8 : 1;

			if (!this.isCrouching || !this.isBig) {
				if (terrain == "Underwater" && this.isWalking) { 
					if (Math.abs(this.velX) < this.maxSwimmingSpeed*this.underwaterMultiplier) {
						if (this.leftPressed && this.canMoveLeft) {
							this.velX -= this.standardFriction;
						} else if (this.rightPressed && this.canMoveRight) {
							this.velX += this.standardFriction;
						}
					} else {
						this.velX = Math.sign(this.velX) * this.maxSwimmingSpeed*this.underwaterMultiplier;
					}
				} else if (this.isWalking && Math.abs(this.velX) < this.maxWalkingSpeed && terrain != "Underwater") {
					if (this.leftPressed && this.canMoveLeft) {
						this.velX -= this.standardFriction;
					} else if (this.rightPressed && this.canMoveRight) {
						this.velX += this.standardFriction;
					}
				} else if (this.isRunning && Math.abs(this.velX) < this.maxRunningSpeed && terrain != "Underwater") {
					if (this.leftPressed && this.canMoveLeft) {
						this.velX -= this.standardFriction*2;
					} else if (this.rightPressed && this.canMoveRight) {
						this.velX += this.standardFriction*2;
					}
				}
			}

			this.velX = parseFloat(this.velX.toFixed(2));

			if (this.velX > 0 && this.leftPressed && this.canMoveLeft) {
				this.isChangingDirections = "left";
			} else if (this.velX < 0 && this.rightPressed && this.canMoveRight) {
				this.isChangingDirections = "right";
			} else {
				this.isChangingDirections = "none";
			}

			if (this.keyLastPressed == "right") {
				this.directionFacing = "right";
			} else {
				this.directionFacing = "left";
			}

			if (this.drawnX > 1 || this.velX > 0) {
				this.drawnX += this.velX;

				if (this.drawnX+this.width > newWidth && this.velX > 0) {
					this.drawnX = newWidth-this.width;
				}
			} else {
				this.drawnX = 0;
				this.velX = 0;
				this.isRunning = false;
				this.isWalking = false;
			}

			if (this.isChangingDirections != "none") {
				this.velX *= this.friction+this.standardFriction;
			} else if (this.isCrouching && this.isBig) {
				this.velX *= this.friction+this.standardFriction*(6/5);
			} else if (this.velX != 0 && !this.isRunning && !this.isWalking) {
				this.velX *= this.friction;
			}

			if (Math.abs(this.velX) < this.standardFriction || ((Math.abs(this.velX) <= this.standardFriction*3) && this.isCrouching)) {
				this.velX = 0;
			}

			this.lastVelY = this.velY;

			this.swimming = false;

			if (terrain == "Underwater" && this.drawnY <= 70) {
				this.drawnY += 2;
			}

			if (this.isJumping && !this.onSpring) {
				if (terrain != "Underwater") {
					this.jump(this.jumpHeight);
				} else if (this.drawnY > 70) {
					this.swimming = true;
					this.swim();
				}
			} else if (this.onSpring) {
				this.isJumping = false;
				this.jump(this.springVelocity);
			}

			if (terrain == "Underwater") {
				this.isRunning = false;
			}

			if (this.upPressed && terrain == "Underwater") {
				this.sounds[8].currentTime = 0;;
				this.sounds[8].play();

				this.upPressed = false;
				this.timeFromJump = 0;
			}

			if (this.canPlayJumpSound && this.alive) {
				this.canPlayJumpSound = false;

				if (this.isBig) {
					this.sounds[10].currentTime = 0;
					this.sounds[10].play();
				} else {
					this.sounds[17].currentTime = 0;
					this.sounds[17].play();
				}
			}

			//Determines when mario has the star powerup
			if (this.hasStar && this.invincibility > 0)  {
				this.invincibility--;

				if (this.invincibility == 0) {
					this.music.src = `${pathname}/sounds/${terrain}.wav`;
	        		this.music.play();
				}
			} else {
				this.hasStar = false;
			} 

			this.canEnter = false;

			if (this.throwingFireball && this.timeUntilCanThrowFireball < 10) {
				this.timeUntilCanThrowFireball++;
			} else {
				this.throwingFireball = false;
				this.timeUntilCanThrowFireball = 0;
			}


			if (this.invincibility > 0 && !this.hasStar) {
				this.invincibility--;
			}
		} else if (this.transition == "cleared level") {
			if (this.music.src != `${pathname}/sounds/downFlagpole.wav` && this.isMovingOnPole) {
				this.music.src = `${pathname}/sounds/downFlagpole.wav`;
				this.music.play();
			}

			this.velX = 0;
			this.velY = 0;

			this.timeUntilFallFromFlagpole++;

			if (this.timeUntilFallFromFlagpole >= 50) {
				if (this.drawnY+this.height < 480) {
					this.drawnY += 5;
				} else {
					if (this.music.src != `${pathname}/sounds/levelClear.wav` && !this.isMovingOnPole) {
						this.drawnY = 480-this.height;
						this.music.src = `${pathname}/sounds/levelClear.wav`;
						this.music.play();
					}

					this.isMovingOnPole = false;
				}
			}

			if (this.canGoToCastle) {
				this.timeUntilGoToCastle++;
			}

			if (this.timeUntilGoToCastle >= 5 && this.timeUntilGoToCastle < 50) {
				if (!this.hasFlippedOnPole) {
					this.drawnX += 35;
				}

				this.keyLastPressed = "left";
				this.hasFlippedOnPole = true;
			} else if (this.timeUntilGoToCastle >= 50) {
				if (!this.isWalkingToCastle) {
					this.timeFromJump = 0;
					this.lastGroundY = 480-this.height;

					if (this.isBig) {
						this.lastGroundY = 440;
					}

					this.drawnX += 15;
				}

				this.isWalkingToCastle = true;
			}

			if (this.isWalkingToCastle && !this.behindCastle) {
				this.velX = 5;
				this.keyLastPressed = "right";
				this.isWalking = true;
				this.isJumping = false;

				this.fall();
			}
		} else if (this.transition == "cleared castle") {
			this.velX = 2;

			if (this.behindCastle) {
				this.velX = 0;
			}

			this.isWalkingToCastle = true;

			if (this.music.src.indexOf("castleClear") == -1 && this.music.src.indexOf("savePrincess") == -1) {
				if (world != 8 && world != "D") {
					this.music.src = `${pathname}/sounds/castleClear.wav`;
					this.music.play();
				} else {
					this.music.src = `${pathname}/sounds/savePrincess.wav`;
					this.music.play();
				}
			}

			this.fall();
		} else if (this.transition == "growing" || this.transition == "shrinking") {
			const storedVelX = this.velX;
			//this.velX = 0;

			if (this.transition == "shrinking" && this.timeUntilNoTransition == 50) {
				this.drawnY -= this.standardHeight/2;
			}

			if (this.timeUntilNoTransition <= 0) {
				this.velX = storedVelX;

				if (this.transition == "shrinking") {
					this.drawnY += this.standardHeight/2;
				}
			}

			this.timeUntilNoTransition--;
		} else if (this.transition == "dying") {
			this.velX = 0;
			this.jump(this.jumpHeight+1);
		} else if (this.transition == "down pipe") {
			this.velX = 0;
			this.drawnY++;

			if (this.drawnY > this.lastGroundY+85) {
				this.velX = 0;
				this.directionFacing = "right";
				this.transition = "pipe";
			}
		} else if (this.transition == "into pipe") {
			this.velX = 0;
			this.drawnX++;

			if (this.drawnX > this.rightX+45) {
				this.timeUntilNoTransition = 50;
				this.velX = 0;
				this.directionFacing = "right";
				this.transition = "pipe";
				this.goingUpPipe = true;
			}
		} else if (this.goingUpPipe) {
			this.velX = 0;
			this.drawnY--;

			if (this.drawnY < this.lastGroundY) {
				this.goingUpPipe = false;
			}
		} else if (this.transition == "walkingIntoPipe") {
			this.isWalking = true;
			this.drawnX += 1.5;
		} else if (this.transition == "vine") {
			if (this.drawnY < -this.height) {
				this.transition = "pipe";
			}

			this.drawnY -= 3;
		} else if (this.transition == "climbing vine") {
			if (this.drawnY > 360) {
				this.drawnY -= 3;
			} else if (this.drawnY <= 360) {
				this.directionFacing = "left";
				this.drawnX = 160+this.width/2+3;
				this.transition = false;
			}

			this.velX = 0;
			this.leftPressed = false;
			this.rightPressed = false;
			this.downPressed = false;
		}

		if (!this.isBig && !this.hasFireFlower) {
			this.type = "small";
		} else if (!this.hasFireFlower) {
			this.type = "big";
		} else {
			this.type = "fire";
		}
			
		this.changeImage(this.decideImage());

		if (!this.hasStar && (this.invincibility%5 == 1 || (this.transition == "shrinking" && this.timeUntilNoTransition%5 == 1))) {
			this.img.src = "";
		}
	},

	changeLocation: function(transition) {
		this.isCrouching = false;

		if (["smb", "smbtll"].includes(game)) {
			if (transition == "fall") {
				this.drawnX = 80;
                this.drawnY = 80;
                this.lastGroundY = 80;
			} else if (transition == "up pipe") {
				this.drawnX = 140;
                this.drawnY = 485;
                this.lastGroundY = 400;

                if (this.isBig) {
                   	this.drawnY = 440;
                    this.lastGroundY = 360;
                }

                this.goingUpPipe = true;
			} else if (transition == "vine") {
				this.drawnX = 160-this.width/2-3;
				this.drawnY = height;

				this.transition = "climbing vine";
			}
		}
	},

	addScore: function(value, xValue, yValue) {
		if (value != "1UP") {
			this.score += value;
		}

		this.scoreValues.push({
			score: value,
			timer: 0,
			x: xValue,
			y: yValue,
			has1Up: (value == "1UP") ? true : false
		});
	},

	jump: function(vel) {
		if (!this.canPlayJumpSound && this.timeFromJump == 0) {
			this.canPlayJumpSound = true;
		}

		this.timeFromJump++;

		if (this.alive) {
			if (!this.onSpring) {
				if (!this.hitBlock) {
					if (this.timeFromJump <= 20/this.gravity) {
						if (!this.upPressed && this.timeFromJump > 2) {
							this.velY = 0;

							if (this.timeFromJump < 12/this.gravity) {
								this.timeFromJump = 12/this.gravity;
							}
						} else {
							this.velY = vel + this.gravity*this.timeFromJump;
						}
					}

					if (this.velY >= 0) {
						this.velY = vel + this.gravity*this.timeFromJump;
					}
				} else {
					if (this.velY <= 0) {
						this.velY = 0
					}

					this.velY++;
				}

				if (this.lastVelY > this.velY+10 && this.lastVelY != 0 && !this.stompedOnEnemy) {
					this.canPlayJumpSound = false;
					this.timeFromJump = 0;
					this.velY = 0;
					this.isJumping = false;
					this.drawnY = this.lastGroundY;
					this.isOnGround = true;
				}
			} else {
				this.velY = vel + this.gravity*this.timeFromJump;
			}
		} else {
			this.velY = vel + this.gravity*this.timeFromJump;
		}

		let maxVelocity = 15;

		if (this.velY > maxVelocity) {
			this.velY = maxVelocity;
		}

		this.drawnY += this.velY;
	},

	swim: function() {
		this.timeFromJump ++;
		this.velY = this.timeFromJump-10;

		if (this.velY > 0) {
			this.velY = 2;
		}

		this.drawnY += this.velY;
	},

	fall: function() {
		if (!this.canGoToCastle || this.isWalkingToCastle) {
			this.timeFromJump++;
			this.velY = this.gravity*this.timeFromJump;

			if (this.velY > 15) {
				this.velY = 15;
			}

			this.drawnY += this.velY;
		} else {
			this.timeFromJump = 0;
		}
	},

	setHitbox: function() {
		if (this.isCrouching && this.isBig) {
			this.hitboxX = this.drawnX+8;
			this.hitboxY = this.drawnY+this.height/2;
			this.hitboxWidth = this.width-16;
			this.hitboxHeight = this.height/2;
		} else if (this.isBig) {
			this.hitboxX = this.drawnX+8;
			this.hitboxY = this.drawnY+20;
			this.hitboxWidth = 24;
			this.hitboxHeight = 60;
		} else {
			this.hitboxX = this.drawnX+8;
			this.hitboxY = this.drawnY+10;
			this.hitboxWidth = 22;
			this.hitboxHeight = 30;
		}
	},

	decideImage: function() {
		let type = "MarioStanding";

		if (this.isWalking || this.isRunning || (this.transition == "cleared castle" && this.isWalkingToCastle)) {
			type = "MarioMoving";
		}

		if (this.transition == "cleared castle") {
			return this.type + type;
		}

		if (this.isWalkingToCastle) {
			return this.type + type;
		}

		if (this.isChangingDirections != "none") {
			type = "MarioTurning";
		}

		if (this.isJumping && (!this.isCrouching || !this.isBig)) {
			type = "MarioJumping";
		}

		if (this.throwingFireball) {
			type = "MarioShooting";
		}

		if (this.isCrouching) {
			type = "MarioCrouching";
		}

		if (this.swimming) {
			type = "MarioSwimming";

			if (this.velY < 0) {
				type = "MarioStroke"
			}
		}

		if (this.clearedLevel) {
			if (this.drawnY+this.height >= 480) {
				type = "MarioClear";
			}

			if (!this.isWalking || this.isJumping) {
				type = "MarioClear";
			}
		}

		if (["vine", "climbing vine"].includes(this.transition)) {
			type = "MarioClear";
		}

		if (this.transition == "down pipe") {
			type = "MarioStanding";

			if (this.isBig) {
				type = "MarioCrouching";
				this.height = 60;
				this.width = 45;
			}
		}

		if (this.goingUpPipe) {
			type = "MarioStanding";
		}

		if (this.hasFlippedOnPole) {
			type = "MarioClear";
		}

		type = this.type + type

		if (!this.alive) {
			type = "marioDying";
		}

		return type;
	},

	changeImage: function(type) {
		this.img.src = `${pathname}/images/${type}.png`;

		if (this.img.src.indexOf("Moving") > -1) {
			this.img.src = `${pathname}/images/${type}${Math.floor(this.time/10%3)+1}.png`;
		} else if (this.img.src.indexOf("Swimming") > -1 || this.img.src.indexOf("Clear") > -1) {
			this.img.src = `${pathname}/images/${type}${Math.floor(this.time/10%2)+1}.png`;
		} else if (this.img.src.indexOf("Stroke") > -1) {
			this.img.src = `${pathname}/images/${type}${Math.floor(this.time/10%4)+1}.png`;
		}

		if (this.transition == "shrinking") {
			if (this.time%20 < 10) {
				this.img.src = `${pathname}/images/bigMarioStanding.png`;
				this.height = 80;
			} else {
				this.img.src = `${pathname}/images/smallMarioStanding.png`;
				this.height = 40;
			}
		} else if (this.transition == "growing") {
			if (!this.hasFireFlower) {
				if (this.time%30 < 10) {
					this.img.src = `${pathname}/images/smallMarioStanding.png`;
					this.height = 40;
				} else if (this.time%30 < 20) {
					this.img.src = `${pathname}/images/middleMarioStanding.png`;
					this.height = 60;
				} else {
					this.img.src = `${pathname}/images/bigMarioStanding.png`;
					this.height = 80;
				}
			} else {
				this.hasStar = true;
			}
		}

		if (this.transition != "cleared castle" && this.clearedLevel && !this.isWalkingToCastle) {
			if (!this.isWalkingToCastle) {
				this.img.src = `${pathname}/images/${type}${Math.floor(this.time/10%2)+1}.png`;

				if (this.timeUntilFallFromFlagpole < 50 || this.canGoToCastle) {
					this.img.src = `${pathname}/images/${type}1.png`;
				}

				if (!this.isMovingOnPole) {
					this.img.src = `${pathname}/images/${type}1.png`;
				}
			}
		}
	},

	hit: function() {
		if (this.isBig) {
			this.sounds[14].currentTime = 0;
			this.sounds[14].play();
			this.transition = "shrinking"
			this.timeUntilNoTransition = 50;
			this.isBig = false;
			this.drawnY += 40;
			this.lastGroundY += 40;
			this.hasFireFlower = false;
			this.invincibility = 100;
		} else {
			this.die();
		}
	},

	die: function() {
		if (this.alive) {
			this.music.src = `${pathname}/sounds/death.wav`;
			this.lives--;
		}

		this.height = 40;
		this.transition = "dying";
		this.alive = false;
		this.velX = 0;
		this.upPressed = false;
		this.leftPressed = false;
		this.downPressed = false;
		this.rightPressed = false;
	},

	addCoin: function(x, y) {
	    this.coinAnimationList.push({img: new Image(), xValue: x, yValue: y-40, timeUntilDisappear: 0});
	    this.coinAnimationList[this.coinAnimationList.length-1].img.src = `${pathname}/images/CoinSpin1.png`;
	    this.sounds[3].currentTime = 0;
		this.sounds[3].play();
	},

	draw: function() {
		const a = Math.round(this.drawnX*2+this.width)+shiftWidth;

		if (this.keyLastPressed == "left") {
			graphics.setTransform(-1, 0, 0, 1, a, 0);
		}

		if (this.hasStar) {
			graphics.filter = `hue-rotate(${(Math.floor(this.time/10%3)+1)*90}deg)`;
		}

		graphics.drawImage(this.img, Math.round(this.drawnX), Math.round(this.drawnY), this.width, this.height);
		graphics.filter = "none";
		this.setHitbox();

		if (this.keyLastPressed == "left") {
			graphics.setTransform(1, 0, 0, 1, shiftWidth, 0);
		}
	}
}

function Block(type, constantX, constantY, drawnX, drawnY, width, height, sounds, terrain) {
	this.type = type;
	this.storedType = type;
	this.constantX = constantX;
	this.constantY = constantY;
	this.drawnX = drawnX;
	this.movingX = drawnX;
	this.drawnY = drawnY;
	this.width = width;
	this.constantWidth = width;
	this.height = height;
	this.constantHeight = height;
	this.contains = undefined;
	this.used = false;
	this.coinsLeft = 10;
	this.timeUntilNoMoreCoins = 275;
	this.firstHit = false;
	this.bumping = false;
	this.bumpingY = this.drawnY;
	this.bumpTime = 0;
	this.isEdge = false;
	this.canEnter = false;
	this.offsetY = 0;
	this.time = 0;
	this.sounds = sounds;
	this.terrain = terrain;
	this.terrain == "Bonus" ? this.terrain = "Underground" : null;
	this.animated = 0;
	this.directionMoving = undefined;
	this.hasCollisions = true;
	this.velY = 2;
	this.velX = 1;
	this.fireBar = [];
	this.fold = 20;
	this.folding = false;
	this.bullets = [];
	this.timeToShootBullet = 100;
	this.vineStructure = null;
	this.vineY = this.drawnY*2 + 40;
	this.pulleyPair = null;
	this.falling = false;
	this.fallingSpeed = .1;
	this.maxSpeed = 5;
	this.connection = null;
	this.freeFall = false;
	this.ableToMoveRight = false;

	/*
		" " = Air
		a = Axe
		, = BigCastle
		¡ = BigTree
		< = BowserBridge
		b = Brick
		0 = Brick, 10 coins
		) = Brick, 1up
		* = Brick, Star
		( = Brick, powerup
		n = CannonBottom
		w = CannonMiddle
		e = CannonTop
		. = Castle
		c = Coin
		™ = Fence
		f = Flagpole
		y = FullRedSpring
		g = Ground
		1 = Hidden Block, 1up
		& = Hidden Block, coin
		6 = LargeBush
		3 = LargeHill
		i = Lava
		u = LavaTop
		@ = LongMovingPlatform, cyclic1
		# = LongMovingPlatform, cyclic2
		? = LongMovingPlatform, down
		¿ = LongMovingPlatform, up
		/ = LowerLeftPipe
		| = LowerRightPipe
		5 = MediumBush
		8 = MediumCloud
		m = MiddleMovingPlatform, cyclic2
		: = MushroomBottom
		d = MushroomLeft
		h = MushroomMiddle
		j = MushroomRight
		k = MushroomTop
		% = OverworldEmptyBlock
		$ = OverworldEmptyBlock
		~ = Princess
		q = QuestionBlock, coin
		p = QuestionBlock, powerup
		o = ShortMovingPlatform
		v = SidewaysPipeLowerLeft
		= = SidewaysPipeLowerMiddle
		_ = SidewaysPipeLowerRight
		^ = SidewaysPipeUpperLeft
		+ = SidewaysPipeUpperMiddle
		- = SidewaysPipeUpperRight
		4 = SmallBush
		7 = SmallCloud
		2 = SmallHill
		> = SmallTree
		s = SpecialBlock
		! = Toad
		{ = TopLeftPipe
		[ = TopLeftPipe
		} = TopRightPipe
		] = TopRightPipe
		£ = TowerWall
		¢ = TowerTerrace
		; = Vine
		z = Water
		x = WaterTop
	*/

	const blockObject = {
		" ": "Air",
		"f": "Flagpole",
		"q": "QuestionBlock",
		"p": "QuestionBlock",
		"r": "QuestionBlock",
		"b": "Brick",
		"0": "Brick",
		"*": "Brick",
		"s": "SpecialBlock",
		"1": "Hidden Block",
		"&": "Hidden Block",
		"c": "Coin",
		"[": "TopLeftPipe",
		"]": "TopRightPipe",
		"{": "TopLeftPipe",
		"}": "TopRightPipe",
		"/": "LowerLeftPipe",
		"|": "LowerRightPipe",
		"g": "Ground",
		"^": "SidewaysPipeUpperLeft",
		"+": "SidewaysPipeUpperMiddle",
		"-": "SidewaysPipeUpperRight",
		"v": "SidewaysPipeLowerLeft",
		"=": "SidewaysPipeLowerMiddle",
		"_": "SidewaysPipeLowerRight",
		".": "Castle",
		",": "BigCastle",
		"a": "Axe",
		"n": "CannonBottom",
		"w": "CannonMiddle",
		"e": "CannonTop",
		"y": "FullRedSpring",
		"u": "LavaTop",
		"i": "Lava",
		"o": "ShortMovingPlatform",
		"m": "MiddleMovingPlatform",
		"?": "LongMovingPlatform",
		"¿": "LongMovingPlatform",
		"@": "LongMovingPlatform",
		"#": "LongMovingPlatform",
		"d": "MushroomLeft",
		"h": "MushroomMiddle",
		"j": "MushroomRight",
		"k": "MushroomTop",
		":": "MushroomBottom",
		";": "Vine",
		"z": "Water",
		"x": "WaterTop",
		"~": "Princess",
		"!": "Toad",
		"(": "Brick",
		")": "Brick",
		"$": "OverworldEmptyBlock",
		"%": "OverworldEmptyBlock",
		"<": "BowserBridge",
		"£": "TowerWall",
		"¢": "TowerTerrace",
		"∞": "CastleGround",
		"t": "Hidden Block",
		"l": "Brick",
		"2": "Brick",
		"3": "LongMovingPlatform",
		"4": "Vine1",
		"5": "Vine2",
		"6": "LongMovingPlatform",
		"7": "PulleyLeft",
		"8": "PulleyMiddle",
		"9": "PulleyRight",
		">": "BridgeSupport",
		"¡": "Bridge",
		"™": "Coral",
		"§": "MiddleMovingPlatform",
		"¶": "MiddleMovingPlatform",
		"•": "CloudLeft",
		"ª": "CloudMiddle",
		"º": "CloudRight",
		"œ": "MiddleMovingPlatform",
		"∑": "OverworldEmptyBlock",
		"®": "Hidden Block",
		"†": "FullGreenSpring",
		"¥": "MiddleMovingPlatform"
	};

	const containsObject = {
		"q": "coin",
		"(": "powerup",
		")": "1up",
		"p": "powerup",
		"1": "1up",
		"&": "coin",
		"0": "10 coins",
		"*": "Star",
		"r": "PoisonMushroom",
		"t": "PoisonMushroom",
		"l": "PoisonMushroom",
		"2": "Vine",
		"®": "powerup"
	}

	const directionObject = {
		"?": "down",
		"¿": "up",
		"@": "cyclic1",
		"#": "cyclic2",
		"m": "cyclic2",
		"3": "drop",
		"¶": "drop",
		"6": "pulley",
		"§": "down",
		"œ": "right",
		"¥": "cyclic1"
	}

	const noCollisions = [" ", "f", "1", "&", "c", ".", ",", "a", "u", "i", ";", ":", "4", "5", "z", "x", "~", "!", "k", "a", "£", "¢", "7", "8", "9", ">"];

	if (containsObject.hasOwnProperty(this.type)) {
		this.contains = containsObject[this.type];
	}

	if (directionObject.hasOwnProperty(this.type)) {
		this.directionMoving = directionObject[this.type];
	}

	if (noCollisions.includes(this.type)) {
		this.hasCollisions = false;
	}

	if (this.type == "f") {
		this.drawnY -= 20;
	} else if (this.type == "[" || this.type == "]" || this.type == "^" || this.type == "v") {
		this.canEnter = true;
	} else if (["?", "¿", "@", "#", "3", "6"].includes(this.type)) {
		this.width = 120;
		this.height = 20;

		if (this.type == "6") {
			this.velY = 0;
		}
	} else if (["m", "§", "¶", "œ", "¥"].includes(this.type)) {
		this.width = 80;
		this.height = 20;
	} else if (this.type == "<") {
		this.width = 520;
	} else if (["!", "~"].includes(this.type)) {
		this.height = 60;
		this.drawnY -= 20;
	} else if (this.type == "y") {
		this.height = 80;
	}

	if (this.type == "$") {
		this.fireBar = [];

		let angle = Math.random()*Math.PI*2;

		for (let i = 0; i < 6; i++) {
			this.fireBar.push(new Projectile("Firebar", this.drawnX+this.width/2-10, this.drawnY+this.height/2-10, -1, 1, this.sounds, i*20, angle));
		}
	} else if (this.type == "∑") {
		this.fireBar = [];

		let angle = Math.random()*Math.PI*2;

		for (let i = 0; i < 12; i++) {
			this.fireBar.push(new Projectile("Firebar", this.drawnX+this.width/2-10, this.drawnY+this.height/2-10, -1, 1, this.sounds, i*20, angle));
		}
	}

	if (blockObject.hasOwnProperty(this.type)) {
		this.type = blockObject[this.type];
	}

	this.img = new Image();

	if (this.type != "Air" && this.type != "Hidden Block") {
		this.img.src = `${pathname}/images/${this.type}.png`;
	}

	if (this.type == "Flagpole") {
		this.height = 420;
	} else if (this.type == "Castle") {
		this.width = 200;
		this.height = 200;
	} else if (this.type == "BigCastle") {
		this.width = 360;
		this.height = 440;
	}

	const altBlocks = ["QuestionBlock", "Brick", "Ground", "SpecialBlock"]

	if (altBlocks.some(val => this.type.indexOf(val) > -1)) {
		this.type = this.terrain + this.type;
		this.img.src = `${pathname}/images/${this.type}.png`;
	}

	if (this.type.indexOf("QuestionBlock") > -1 || this.type.indexOf("Coin") > -1 || this.type == "Axe") {
		this.animated = 3;
		this.img.src = `${pathname}/images/${this.type}1.png`;
	}
}

Block.prototype = {
	constructor: Block,

	update: function(movingScreen, canScroll, marioVelX, marioX) {
		this.time++;

		if (this.firstHit) {
			this.timeUntilNoMoreCoins--;
		}

		if (this.bumping) {
			if (this.bumpTime <= 3) {
				this.bumpTime++;
				this.bumpingY -= 4;
			} else {
				this.bumpTime++;
				this.bumpingY += 4;
			}

			if (this.bumpTime >= 6) {
				this.bumpingY = this.drawnY;
				this.bumping = false;
				this.bumpTime = 0;
			}
		}

		if (movingScreen && canScroll) {
			this.drawnX -= marioVelX;
			this.movingX -= marioVelX;
		}

		if (this.drawnX+this.width > 0 && this.drawnX-this.width < newWidth) {
			if (this.type == "CannonTop") {
				this.timeToShootBullet--;

				if (this.timeToShootBullet <= 0) {
					this.timeToShootBullet = 100;

					if (marioX <= this.drawnX+this.width/2) {
						this.bullets.push(new Enemy(this.drawnX-this.width, this.drawnY, 40, 40, "W", 0, this.sounds, this.terrain, null, marioX, this.drawnX+this.width/2));
					} else {
						this.bullets.push(new Enemy(this.drawnX+this.width, this.drawnY, 40, 40, "W", 0, this.sounds, this.terrain, null, marioX, this.drawnX+this.width/2));
					}

					this.sounds[9].currentTime = 0;
					this.sounds[9].play();
				}
			}
		}

		if (this.directionMoving == "up") {
			this.drawnY -= 2;
		} else if (this.directionMoving == "down") {
			this.drawnY += 2;
		} else if (this.directionMoving == "right" && this.ableToMoveRight) {
			this.velX = 2;
		}


		if (this.drawnY < -this.height && this.directionMoving == "up") {
			this.drawnY = height;
		} else if (this.drawnY+this.height > height+80 && this.directionMoving == "down") {
			this.drawnY = -this.height;
		} else if (this.directionMoving == "cyclic1") {
			if (this.drawnY < 220 || this.drawnY+this.height > height) {
				this.velY *= -1;
			}

			this.drawnY += this.velY;
		} else if (this.directionMoving == "cyclic2") {
			if (this.drawnX < this.movingX || this.drawnX > this.movingX+120) {
				this.velX *= -1;
			}

			this.drawnX += this.velX;
		} else if (this.directionMoving == "right" && this.ableToMoveRight) {
			this.drawnX += this.velX;
		}

		if (this.folding) {
			this.fold--;
		}

		if (this.vineStructure != null && this.vineY > this.drawnY) {
			this.vineY -= 4;
		}

		if (this.directionMoving == "pulley") {
			this.fall();
		}

		this.falling = false;

		this.changeImage();
	},

	changeImage: function() {
		if (!this.used) {
			if (this.animated > 0) {
				let time = Math.floor(this.time/10%5)+1;

				if (time > 3) {
					time == 4 ? time = 2 : time = 1;
				}

				this.img.src = `${pathname}/images/${this.type}${time}.png`;
			}
		}

		let spring = this.type.indexOf("RedSpring") > -1 ? "RedSpring" : "GreenSpring"

		if ((this.fold < 10 && this.fold >= 6) || (this.fold < 4 && this.fold >= 2)) {
			this.img.src = `${pathname}/images/Half${spring}.png`;
			this.height = 60;
			this.drawnY = this.constantY+20;
		} else if (this.type.indexOf("Spring") > -1) {
			if (this.fold < 6 && this.fold >= 4) {
				this.img.src = `${pathname}/images/Empty${spring}.png`;
				this.height = 40;
				this.drawnY = this.constantY+40;
			} else {
				this.img.src = `${pathname}/images/${this.type}.png`;
				this.height = 80;
				this.drawnY = this.constantY;

				if (this.folding) {
					this.fold = 10;
					this.folding = false;
				}
			}
		}
	},

	topCollisions: function(object, mario) {
		if (!this.hasCollisions) {
			return false;
		}

		switch (object.constructor) {
			case Enemy:
				if (object.hit) {
					return false;
				}

			case Player:
				if (object.velY < 0) {
					return false;
				}
		}

		if (this.fireBar.length > 0 && game == "smb" && this.terrain == "Underwater") {
			return;
		}

		if (object.drawnX+object.width-5 > this.drawnX+3 && object.drawnX+5 < this.drawnX+this.width-3 && object.drawnY+object.height >= this.drawnY 
			&& object.drawnY+object.height < this.drawnY+30 && this.type != "Hidden Block") {
			if (this.isEdge && (object.drawnX+object.width-5 < this.drawnX+7 || object.drawnX+5 > this.drawnX+this.width-7)) {
				return false;
			}

			if (object.type == "HammerBros" && object.velY >= 15) {
				if (object.drawnY <= object.lastGroundY && object.drawnY < 460) {
					return false;
				}
			} else {
				object.drawnY = this.drawnY-object.height;
				object.lastGroundY = this.drawnY-object.height;
			}

			if (object.constructor == Player) {
				object.blockStandingOn = this;
				object.onSpring = false;

				if (this.directionMoving == "down" || (this.directionMoving == "cyclic1" && this.velY > 0)) {
					object.drawnY += 2;
				} else if (this.directionMoving == "cyclic2") {
					if (!object.leftPressed && !object.rightPressed) {
						object.blockMovingOn = this;
					}
				} else if (this.type.indexOf("Full") > -1) {
					object.onSpring = true;
					object.timeFromJump = 0;
					this.fold--;
					this.folding = true;

					if (this.type.indexOf("Red") > -1) {
						if (object.upPressed) {
							if (game == "smb") {
								object.springVelocity = -22;
							} else {
								object.springVelocity = -26;
							}
						} else {
							object.springVelocity = -18;
						}
					} else {
						if (object.upPressed) {
							object.springVelocity = -90;
						} else {
							object.springVelocity = -25;
						}
					}
				} else if (this.directionMoving == "drop") {
					this.drawnY += 6;
					object.drawnY += 6;
				} else if (this.directionMoving == "pulley") {
					object.drawnY += this.velY+this.fallingSpeed*2-this.pulleyPair.velY;
					this.falling = true;
				} else if (this.directionMoving == "right") {
					this.ableToMoveRight = true;

					if (!object.leftPressed && !object.rightPressed) {
						object.blockMovingOn = this;
					}
				}

				if (!object.hasStar) {
					object.enemyStreak = 0;
				}

				if (!object.upPressed) {
					object.isJumping = false;
					object.isOnGround = true;
					object.falling = false;
				}

				object.hitBlock = false;

				if (this.type.indexOf("Top") > -1) {
					if (this.type == "TopLeftPipe") {
						if (object.drawnX-object.width/2 >= this.drawnX) {
							object.canEnter = true;
						}
					} else {
						if (object.drawnX+object.width*1.5 <= this.drawnX+this.width && object.downPressed) {
							object.canEnter = true;
						}
					}
				}

				if (this.canEnter && object.downPressed && object.canEnter && this.type.indexOf("Top") > -1) {
					this.sounds[14].currentTime = 0;
					this.sounds[14].play();
					object.transition = "down pipe";
					object.timeUntilNoTransition = 50;

					if (object.isBig) {
						object.drawnY += 20;
					}
				}
			} else if (object.constructor == Powerup) {
				object.hitTop = false;
				object.hitBlock = false;

				object.isJumping = false;

				if (this.bumping && object.risen) {
					if (object.hitboxX+object.hitboxWidth/2 < this.drawnX+this.width/2) {
						object.velX = -Math.abs(object.velX);
					} else {
						object.velX = Math.abs(object.velX);
					}

					object.isJumping = true;
				}
			} else if (object.constructor == Enemy) {
				if (object.type != "HammerBros") {
					object.isJumping = false;
					object.isStanding = true;
				} else {
					if (object.velY < 15) {
						object.isJumping = false;
						object.isStanding = true;
					} else {
						if (object.drawnY > object.lastGroundY+300 || object.drawnY >= 435 || this.type.indexOf("Ground") > -1 || this.type.indexOf("SpecialBlock") > -1) {
							object.isJumping = false;
							object.isStanding = true;
							object.drawnY = this.drawnY-object.height;
							object.lastGroundY = object.drawnY;
						} else {
							return false;
						}
					}
				}

				if (object.type == "RedParatroopa") {
					object.velY *= -1;
				}

				if (this.bumping) {
					this.sounds[5].currentTime = 0;
					this.sounds[5].play();
					mario.addScore(200, this.drawnX, this.drawnY);

					if (object.type.indexOf("oopa") == -1) { 
						if (object.hitboxX+object.hitboxWidth/2 < this.drawnX+this.width/2) {
							object.velX = -5;
						} else {
							object.velX = 5;
						}

						object.die("bumping");
					} else {
						object.timeToKick = 0;
						object.inShell = true;
						object.height = 40;
					}
				}
			} else if (object.constructor == Projectile) {
				object.notBounced = false;
			}

			object.timeFromJump = 0;

			return true;
		}

		return false;
	},

	bottomCollisions: function(object, addPowerup, addEnemy) {
		if (!this.hasCollisions && this.contains == undefined) {
			return false;
		}

		if (this.fireBar.length > 0 && game == "smb" && this.terrain == "Underwater") {
			return;
		}

		if (object.drawnX+object.width-5 > this.drawnX+2 && object.drawnX+5 < this.drawnX+this.width-2 && object.drawnY >= this.drawnY+this.height/2 && object.drawnY <= this.drawnY+this.height) {
			if (this.type != "Hidden Block" || object.velY <= 0) {
				object.drawnY = this.drawnY+this.height;

				if (object.velY < 0) {
					object.placeLastHit = this.drawnY+this.height;
				}
			}

			if (object.constructor == Player && (object.velY < 0 || (object.isCrouching && object.isJumping))) {
				if (this.type == "Hidden Block") {
					this.type = this.terrain + "QuestionBlock";
					this.img.src = `${pathname}/images/${this.terrain}EmptyBlock.png`;
					this.hasCollisions = true;
				}

				this.sounds[1].currentTime = 0;
				this.sounds[1].play();

				if (object.transition == false) {
					object.hitBlock = true;
				}

				if (!this.used && (this.type.indexOf("QuestionBlock") > -1 || this.type.indexOf("Brick") > -1 || this.type.indexOf("Hidden Block") > -1)) {
					if (challengeSelect.value == "SpawnEnemy") {
						addEnemy(this.drawnX, this.drawnY-80);
					}

					this.img.src = `${pathname}/images/${this.terrain}EmptyBlock.png`;
					this.used = true;

					if (this.type.indexOf("Brick") > -1) {
						if (this.contains == undefined) {
							if (object.isBig) {
								this.sounds[2].currentTime = 0;
								this.sounds[2].play();
								object.addScore(50, this.drawnX, this.drawnY);

								this.type = "Air";
								this.bumping = true;

								return true;
							} else {
								this.img.src = `${pathname}/images/${this.terrain}Brick.png`;
							}
						}

						if (this.timeUntilNoMoreCoins > 0) {
							this.bumping = true;
							this.used = false;
						}
					}

					if (this.type.indexOf("QuestionBlock") > -1) {
						this.bumping = true;
					}

					if (this.contains == "coin") {
						object.addScore(200, this.drawnX, this.drawnY);
						object.coins++;
						object.addCoin(this.drawnX+10, this.drawnY-40);
						this.used = true
					} else if (this.contains == "10 coins") {
						if (this.timeUntilNoMoreCoins >= 0) {
							this.img.src = `${pathname}/images/${this.terrain}Brick.png`;
							this.firstHit = true;
							this.used = false;
						}

						if (this.timeUntilNoMoreCoins > 0) {
							object.addCoin(this.drawnX+10, this.drawnY-40);
							object.addScore(200, this.drawnX, this.drawnY);
							object.coins++;
						}
					} else if (["powerup", "1up", "Star", "PoisonMushroom"].includes(this.contains)) {
						this.sounds[16].currentTime = 0;
						this.sounds[16].play();

						if (this.contains == "powerup") {
							this.contains = "Mushroom";

							if (object.isBig) {
								this.contains = "Fire Flower";
							}
						}

						addPowerup(this.drawnX+4, this.drawnY-40, this.contains);
						this.used = true;
					} else if (this.contains == "Vine") {
						this.sounds[16].currentTime = 0;
						this.sounds[16].play();

						this.vineStructure = this.drawnY/40+2;
					}
				}

				return true;
			}
		}

		return false;
	},

	leftCollisions: function(object) {
		if (!this.hasCollisions) {
			return false;
		}

		if (object.timeToHit > 0) {
			object.directionFacing = "right";
			return false;
		}

		if (this.fireBar.length > 0 && game == "smb" && this.terrain == "Underwater") {
			return;
		}

		/*if (object.drawnX+object.width-5 >= this.drawnX && object.drawnX+5 < this.drawnX+5 && object.drawnY+object.height > this.drawnY+1 
			&& object.drawnY < this.drawnY+this.height && this.type != "Hidden Block") {*/
		if (object.drawnX+object.width-5 >= this.drawnX && object.drawnX+5 < this.drawnX+5 && object.drawnY+object.height > this.drawnY+1
			&& object.hitboxY < this.drawnY+this.height && this.type != "Hidden Block" && this.height > 20) {
			if (object.constructor == Player) {
				if (object.velX < 0) {
					return false;
				}

				object.blockEntering = this;

				if (this.type.indexOf("Left") > -1) {
					object.canEnter = true;
					object.rightX = object.drawnX;
				}

				if (object.transition != "into pipe") {
					object.alignX = this.drawnX-object.width+5;
				}

				if (this.canEnter && ((object.rightPressed && object.canEnter && object.isOnGround) || object.transition == "walkingIntoPipe") && this.type.indexOf("Sideways") > -1) {
					this.sounds[14].currentTime = 0;
					this.sounds[14].play();
					object.transition = "into pipe";
					object.timeUntilNoTransition = 50;
				}
			} else {
				if (object.constructor == Powerup && object.drawnY+object.height <= this.drawnY+10) {
					return false;
				} else if (object.constructor == Projectile && object.drawnY+object.height < this.drawnY+10) {
					return false;
				}

				if (object.constructor == Enemy) {
					if (object.moving && object.inShell && object.timeToHit == 0) {
						this.sounds[1].currentTime = 0;
						this.sounds[1].play();
						object.hitWall = "left";
						object.directionMoving = "left";
					}
				}
			}

			return true;
		}

		return false;
	},

	rightCollisions: function(object) {
		if (!this.hasCollisions) {
			return false;
		}

		if (object.timeToHit > 0) {
			object.directionFacing = "left";
			return false;
		}

		if (this.fireBar.length > 0 && game == "smb" && this.terrain == "Underwater") {
			return;
		}

		/*if (object.drawnX+object.width-5 > this.drawnX+this.width-5 && object.drawnX+5 <= this.drawnX+this.width && object.drawnY+object.height > this.drawnY+2 
			&& object.drawnY < this.drawnY+this.height && this.type != "Hidden Block") {*/
		if (object.drawnX+object.width-5 > this.drawnX+this.width-5 && object.drawnX+5 <= this.drawnX+this.width && object.drawnY+object.height > this.drawnY+2 
			&& object.hitboxY < this.drawnY+this.height && this.type != "Hidden Block" && this.height > 20) {

			if (object.constructor == Player) {
				if (object.velX > 0) {
					return false;
				}

				object.alignX = this.drawnX+object.width-5;
			} else  {
				if (object.constructor == Powerup && object.drawnY+object.height <= this.drawnY+10) {
					return false;
				} else if (object.constructor == Projectile && object.drawnY+object.height < this.drawnY+10) {
					return false;
				} else if (object.constructor == Enemy) {
					if (object.moving && object.inShell && object.timeToHit == 0) {
						this.sounds[1].currentTime = 0;
						this.sounds[1].play();
						object.hitWall = "right";
						object.directionMoving = "right";
					}
				}
			}

			return true;
		}

		return false;
	},

	fall: function(object) {
		if (this.falling && this.velY < this.maxSpeed) {
			this.velY += this.fallingSpeed;
		} else if (!this.falling && this.velY > 0) {
			this.velY -= this.fallingSpeed/1.5;
		}

		if (!this.freeFall) {
			this.drawnY += this.velY;
			this.pulleyPair.drawnY -= this.velY;
		} else {
			this.velY = this.maxSpeed/1.5;
			this.fallingSpeed = this.velY;
			this.drawnY += this.velY;
			this.pulleyPair.drawnY += this.velY;
		}

		if (this.drawnY <= this.connection.drawnY+40) {
			this.freeFall = true;
			this.pulleyPair.freeFall = true;
		}
	},

	collides: function(object) {
		if (!object.alive) {
			return false;
		} else {
			if (object.hitboxX+object.hitboxWidth >= this.drawnX && object.hitboxX <= this.drawnX+this.width && object.hitboxY+object.hitboxHeight >= this.drawnY 
				&& object.hitboxY <= this.drawnY+this.height) {
				if (this.type == "Coin") {
					this.type = "Air";
					object.coins++;
					object.addScore(200, this.drawnX, this.drawnY);
					this.sounds[3].currentTime = 0;
					this.sounds[3].play();
				} else if (this.type == "Axe" && object.hitboxX+object.hitboxWidth >= this.drawnX+7 && object.transition != "cleared castle") {
					object.transition = "cleared castle";
					this.sounds[12].currentTime = 0;
					this.sounds[12].play();
				}

				return true;
			}
		}

		return false;
	},

	flagpoleCollisions: function(object) {
		if (!object.alive) {
			return false;
		} else {
			if (object.drawnX >= this.drawnX && object.drawnY+object.height <= this.drawnY+100 && !object.clearedLevel) {
				object.drawnX = this.drawnX;
			} else if (object.hitboxX+object.hitboxWidth >= this.drawnX+this.width/2-2 && object.hitboxY+object.hitboxHeight > this.drawnY && object.hitboxY <= this.drawnY+this.height && !object.clearedLevel) {
				object.addScore(object.flagpoleScores[object.flagpoleScores.length-1-Math.floor((object.drawnY-this.drawnY)/(this.height/object.flagpoleScores.length))], this.drawnX-10, object.drawnY-10);
				object.transition = "cleared level";
				object.velX = 0;
				object.drawnX = this.drawnX-this.width/2;
				object.clearedLevel = true;
				object.directionFacing = "right";
				object.keyLastPressed = "right";
				return object.drawnY-this.drawnY;
			}
		}

		return false;
	},

	castleCollisions: function(object, gameTime, fireworks) {
		if (!object.alive) {
			return false;
		} else {
			if (this.drawnX+this.width >= 0 && object.drawnX >= this.drawnX+this.width/2-20 && object.canClearLevel) {
				object.drawnX = this.drawnX+this.width/2-20;
				object.canMoveRight = false;
				object.behindCastle = true;

				if (object.behindCastle && gameTime <= 0 && fireworks.length == 0) {
					if (this.offsetY > -80) {
						this.offsetY--;
					} else {
						return true;
					}
				}
			}
		}

		return false;
	},


	draw: function() {
		if (this.type != "Air") {
			if (this.fireBar.length > 0 && game == "smb" && this.terrain == "Underwater") {
				return;
			}

			if (this.vineStructure != null) {
				let vine1 = new Image();
				let vine2 = new Image();

				vine1.src = `${pathname}/images/Vine1.png`;
				vine2.src = `${pathname}/images/Vine2.png`;

				for (let i = 0; i < this.vineStructure; i++) {
					if (this.vineY-i*40 < this.drawnY) {
						graphics.drawImage(i == this.vineStructure-1 ? vine1 : vine2, Math.round(this.drawnX), Math.round(this.vineY-i*40), this.width, this.height);
					}
				}
			}

			if (this.type == "Flagpole") {
				let flag = new Image();
				flag.src = `${pathname}/images/flag.png`;
				graphics.drawImage(flag, Math.round(this.drawnX-22), this.drawnY+this.offsetY+39, 40, 40);
			} else if (this.type == "Castle" || this.type == "BigCastle") {
				let castleFlag = new Image();
				castleFlag.src = `${pathname}/images/CastleFlag.png`;
				graphics.drawImage(castleFlag, Math.round(this.drawnX+this.width/2-20), this.drawnY+this.offsetY+40, 40, 40);
			} else if (this.directionMoving == "pulley" && !this.freeFall) {
				let pulley = new Image();
				pulley.src = `${pathname}/images/pulleySide.png`;

				graphics.drawImage(pulley, Math.round(this.drawnX)+40, Math.round(this.connection.drawnY)+40, 40, this.drawnY-this.connection.drawnY-40)
			}

			if (this.type.indexOf("Tower") > -1) {
				let wall = new Image();
				wall.src = `${pathname}/images/TowerWall.png`;

				graphics.drawImage(wall, Math.round(this.drawnX), Math.round(this.drawnY)+this.height, this.width, this.height);
			}

			if (!this.bumping) {
				graphics.drawImage(this.img, Math.round(this.drawnX), Math.round(this.drawnY), this.width, this.height);
			} else {
				graphics.drawImage(this.img, Math.round(this.drawnX), Math.round(this.bumpingY), this.width, this.height);
			}
		} 

		if (this.drawnY >= 520 && this.terrain != "Underwater" && this.terrain != "Sky" && ["Water", "Air", "Lava"].includes(this.type) && challengeSelect.value != "Art") {
			graphics.clearRect(Math.round(this.drawnX), Math.round(this.drawnY-120), this.width, 80);
		}
	},

	vineCollisions: function(object) {
		if (!object.alive) {
			return false;
		}

		if (this.type.indexOf("Vine") == -1 && this.drawnY*2-this.vineY > object.height-40 && object.drawnX+object.width > this.drawnX && object.drawnX < this.drawnX+this.width && object.drawnY && object.drawnY > this.vineY-(this.vineStructure-1)*40 && object.drawnY+object.height <= this.drawnY) {
			object.transition = "vine";
			object.isCrouching = false;

			if (object.directionFacing == "right") {
				object.drawnX = this.drawnX-object.width/2-3;
			} else {
				object.drawnX = this.drawnX+this.width/2+3;
			}

			return true;
		} else if (this.type.indexOf("Vine") > -1) {

		}

		return false;
	}
}

function Background(image, x, y, width, height) {
	this.img = new Image();
	this.img.src = image;
	this.drawnX = x;
	this.constantX = x;
	this.drawnY = y;
	this.constantY = y;
	this.width = width;
	this.height = height;
	this.maxWidth = 1920;
}

Background.prototype = {
	constructor: Background,

	update: function(movingScreen, canScroll, marioVelX) {
		if (movingScreen && canScroll) {
			this.drawnX -= marioVelX;
		}
	},

	draw: function() {
		for (let i = 0; i < 10; i++) {
			if (Math.round(this.drawnX)+i*this.width*3 >= -this.width && Math.round(this.drawnX)+i*this.width*4 >= -this.width) {
				graphics.drawImage(this.img, Math.round(this.drawnX)+i*this.maxWidth, Math.round(this.drawnY), this.width, this.height);
			}
		}
	}
}

function Area(area, terrain, canScroll, color, sounds, background) {
	this.area = area;
	this.terrain = terrain;
	this.canScroll = canScroll;
	this.color = color;
	this.background = background;
	this.enemies = [];

	for (let i = 0; i < this.area.length; i++) {
		for (let j = 0; j < this.area[i].length; j++) {
			if (this.area[i][j] == this.area[i][j].toUpperCase() && ((this.area[i][j].charCodeAt(0) >= 65 && this.area[i][j].charCodeAt(0) <= 90) || (this.area[i][j].charCodeAt(0) >= 97 && this.area[i][j].charCodeAt(0) <= 122))) {
				this.enemies[this.enemies.length] = new Enemy(j*40, i*40, 40, 40, this.area[i][j], 1, sounds, terrain, 0);

				if (this.enemies[this.enemies.length-1].type == "RedPlant" && this.area[i-1][j].type.indexOf("Pipe") > -1) {
					this.enemies[this.enemies.length-1].storedType = "A";
					this.enemies[this.enemies.length-1].height *= -1;
					this.enemies[this.enemies.length-1].drawnY -= 60;
				}

				this.area[i][j] = new Block(" ", j*40, i*40, j*40, i*40, 40, 40, sounds, terrain);
			} /*else if (Number.isInteger(parseInt(this.area[i][j])) && this.area[i][j] >= 2 && this.area[i][j] <= 9 || ["k", "u", "i", "a", ">", "¡", "™", "£", "¢"].includes(this.area[i][j])) {
				//this.background[this.background.length] = new Block(this.area[i][j], j*40, i*40, j*40, i*40, 40, 40, sounds, terrain);
				//this.area[i][j] = new Block(" ", j*40, i*40, j*40, i*40, 40, 40, sounds, terrain);
			} */else {
				this.area[i][j] = new Block(this.area[i][j], j*40, i*40, j*40, i*40, 40, 40, sounds, terrain);
			}
		}
	}

	this.enemies.push(new Enemy(-1000, -1000, 0, 0, "G", 1, sounds, terrain));
}

function Level(areas) {
	this.areas = areas;
}

function Enemy(x, y, width, height, type, gravity, sounds, terrain, animated, marioX, bulletX) {
	this.type = type;
	this.storedType = type;
	this.drawnX = x;
	this.movingX = this.drawnX;
	this.constantX = x;
	this.drawnY = y;
	this.constantY = y;
	this.width = width;
	this.constantWidth = width;
	this.height = height;
	this.constantHeight = height;
	this.velX = 1;
	this.velY = 0;
	this.timeUntilCollisions = 0;
	this.changedDirections = false;
	this.gravity = gravity;
	this.directionFacing = "left";
	this.moving = false;
	this.directionMoving;
	this.lastGroundY = y;
	this.alive = true;
	this.inShell = false;
	this.timeToKick = 0;
	this.gettingUp = false;
	this.timeToGetUp = 0;
	this.isStanding = true;
	this.timeUntilGone = 0;
	this.hit = false;
	this.hitWall;
	this.timeToHit = 0;
	this.bufferTime = 0;
	this.collisions = true;
	this.scoreList = [500, 800, 1000, 2000, 4000, 5000, 8000, "1UP"];
	this.enemyStreak = 0;
	this.time = 0;
	this.sounds = sounds;
	this.gone = false;
	this.terrain = terrain;
	this.animated = animated;
	this.canMove = true;
	this.canStomp = true;
	this.timeToMoveUpAndDown = 100;
	this.canMoveUp = true;
	this.affectedByGravity = true;
	this.timeFromJump = 0;
	this.isFlying = false;
	this.timeToCollide = 0;
	this.timeToJump = 0;
	this.timeToShootFlame = 0;
	this.isJumping = false;
	this.hitsToKill = 5;
	this.canDieByFire = true;
	this.canBounce = false;
	this.spinies = [];
	this.timeToThrowSpiny = 0;
	this.hammers = [];
	this.hammersLeft = random(3, 7);
	this.timeToThrow = 70;
	this.throwing = false;
	this.flying = false;
	this.horizontal = false;

	/*
		Q = Blooper
		B = Bowser
		W = BulletBill
		E = BuzzyBeetle
		G = Goomba
		M = GreenCheepCheep
		K = GreenKoopa
		P = GreenParatroopa
		I = GreenPlant
		H = HammerBros
		L = NormalLakitu
		T = Podobo
		Y = RedCheepCheep
		R = RedKoopa
		D = RedParatroopa
		U = RedPlant
		S = Spiny
	*/

	const enemyObject = {
		"G": "Goomba",
		"K": "GreenKoopa",
		"B": "Bowser",
		"Q": "BlooperSwimming",
		"W": "BulletBill",
		"E": "BuzzyBeetle",
		"L": "NormalLakitu",
		"M": "GreenCheepCheep",
		"P": "GreenParatroopa",
		"F": "GreenParatroopa",
		"I": "GreenPlant",
		"H": "HammerBros",
		"R": "RedKoopa",
		"D": "RedParatroopa",
		"T": "Podobo",
		"Y": "RedCheepCheep",
		"O": "RedCheepCheep",
		"U": "RedPlant",
		"A": "RedPlant",
		"S": "Spiny",
	};

	if (["O"].includes(this.type)) {
		this.flying = true;
	}

	if (this.type == "F") {
		this.horizontal = true;
		this.isFlying  = true;
	}

	if (["W", "E", "T"].includes(this.type)) {
		this.canDieByFire = false;
	}

	if (["I", "U", "S", "B", "T"].includes(this.type)) {
		this.canStomp = false;
	}

	if (this.type == "A") {
		this.height = -60;
		this.drawnY -= 60;
	}

	if (enemyObject.hasOwnProperty(this.type)) {
		if (["G", "K", "E", "M", "P", "I", "R", "D", "Y", "U", "A", "S", "B", "H", "O", "F"].includes(this.type)) {
			this.animated = 2;
		}

		this.type = enemyObject[this.type];
	}

	if (this.type.indexOf("Koopa") > -1 || this.type.indexOf("Paratroopa") > -1) {
		this.height = 60;
		this.drawnY -= 20;

		if (this.type == "RedParatroopa") {
			this.isFlying = true;
			this.canMove = false;
			this.velY = 2;
		} else if (this.type == "GreenParatroopa") {
			this.canBounce = true;
			this.velX = 2;
		}
	} else if (this.type.indexOf("Plant") > -1) {
		if (this.height > 0) {
			this.height = 60;
		}

		if (this.type != "RedPlant") {
			this.drawnY += 40;
		}

		this.drawnX -= 20;
		this.canMove = false;
		this.affectedByGravity = false;
	} else if (this.type == "Bowser") {
		this.width = 80;
		this.height = 80;
	} else if (this.type.indexOf("Lakitu") > -1) {
		this.drawnY -= 20;
		this.height = 60;
		this.velX = 3;
		this.collisions = false;
	} else if (this.type == "BulletBill") {
		if (marioX > bulletX) {
			this.directionFacing = "right";
		}

		this.collisions = false;

		this.velX = 5;
	} else if (this.type == "HammerBros") {
		this.height = 60;
		this.drawnY -= 20;
		this.velX = 0;
	} else if (this.type == "BlooperSwimming") {
		this.collisions = false;

		if (this.terrain == "Underwater") {
			this.drawnY -= 20;
			this.canStomp = false;
		}

		this.affectedByGravity = false;
	} else if (this.type == "Podobo") {
		this.drawnY += 80;
		this.velX = 0;
		this.collisions = false;
		this.affectedByGravity = false;
	}

	if (this.flying) {
		this.collisions = false;
		this.affectedByGravity = false;
		this.velX = random(3, 5);
		this.directionFacing = random(0, 1) ? "left" : "right";
	}

	if (this.horizontal) {
		this.affectedByGravity = false;
	}

	this.img = new Image();

	if (!this.animated) {
		this.img.src = `${pathname}/images/${this.type}.png`;
	} else {
		this.img.src = `${pathname}/images/${this.type}1.png`;
	}
}

Enemy.prototype = {
	constructor: Enemy,

	update: function(movingScreen, canScroll, marioVelX, marioX, marioY, world) {
		this.time++;
		this.timeToKick++;
		this.timeToCollide++;

		if (movingScreen && canScroll && this.drawnX > -this.width) {
			if (this.type.indexOf("Lakitu") > -1 && this.drawnX+this.width < newWidth) {
				marioVelX = 0;
			}

			this.drawnX -= marioVelX;
			this.movingX -= marioVelX;
		}

		if (this.type.indexOf("Lakitu") > -1 && this.drawnX <= newWidth) {
			if (this.drawnX+this.width >= 520) {
				this.velX = -Math.abs(this.velX);
				this.directionFacing = "right";
			} else if (this.drawnX <= 120) {
				this.velX = -Math.abs(this.velX);
				this.directionFacing = "left";
			}

			this.timeToThrowSpiny++;

			if (this.timeToThrowSpiny > 130) {
				this.timeToThrowSpiny = 0;
				this.spinies.push(new Enemy(this.drawnX, this.drawnY, 40, 40, "S", 1, this.sounds, this.terrain, 2));
			}
		}

		if (this.drawnX < -this.width && this.drawnX != 1000) {
			this.drawnX = -100;
			this.alive = false;
		}

		if (this.alive && !this.hit && !this.inShell && this.drawnX < width && this.canMove) {
			if (this.directionFacing == "left") {
				this.drawnX -= this.velX;
			} else {
				this.drawnX += this.velX;
			}
		}

		if (this.moving) {
			if (this.drawnX > -this.width && this.drawnX < newWidth) {
				this.bufferTime--;

				if (this.directionMoving == "left") {
					this.drawnX -= 5;
				} else {
					this.drawnX += 5;
				}
			} else {
				this.moving = false;
				this.alive = false;
				this.drawnX = -100;
			}
		}

		if (!this.alive) {
			this.timeUntilGone++;
		}

		if (this.timeUntilGone > 20) {
			this.gone = true;
		}

		if (this.inShell && !this.moving) {
			this.timeToGetUp++;
		} else {
			this.timeToGetUp = 0;
		}

		if (this.timeToGetUp > 600) {
			this.inShell = false;

			if (this.type != "BuzzyBeetle") {
				this.height = 60;
			}

			this.moving = false;
		}

		if (this.type == "HammerBros" && this.drawnX+this.width > 0 && this.drawnX < newWidth) {
			if (marioX < this.drawnX+this.width/2) {
				this.directionFacing = "left";
			} else {
				this.directionFacing = "right";
			}

			if (game == "smbtll" && (isNaN(world) || world >= 7)) {
				this.velX = 2;
			} else {
				this.velX = this.time%80 < 40 ? -.25 : .25;
			}

			this.timeToThrow--;

			if (this.timeToThrow < 20) {
				this.throwing = true;
			} else {
				this.throwing = false;
			}

			if (this.timeToJump <= 0) {
				this.timeToJump = 240;
				this.isJumping = true;
			}

			if (this.isJumping) {
				this.jump(-20);
			}

			if (this.timeToThrow <= 0 && this.drawnX <= newWidth && this.alive) {
				this.hammersLeft--;

				if (this.hammersLeft <= 0) {
					this.timeToThrow = 70;
					this.hammersLeft = random(3, 7);
				} else {
					this.timeToThrow = 40;
				}

				this.hammers.push(new Projectile("Hammer", this.drawnX, this.drawnY, this.directionFacing, 1, this.sounds));
			}
		} else if (this.type == "BlooperSwimming") {
			this.timeToJump--;

			if (marioX < this.drawnX+this.width/2) {
				this.directionFacing = "left";
			} else {
				this.directionFacing = "right";
			}

			this.velX = 1.5;

			if (this.velY < 0) {
				this.velX = 2.5;
			}

			if (marioY > this.drawnY+this.height && this.drawnY+this.height < 480 && this.velY >= 0) {
				this.drawnY += 1.5;
				this.swimming = false;
			} else {
				if (this.timeToJump <= 0) {
					this.timeFromJump = 0;
					this.timeToJump = 75;
				}

				this.swim();
				this.swimming = true;
			}
		} else if (this.type == "Podobo") {
			if (this.drawnY >= 600) {
				this.timeFromJump = 0;
				this.time = 0;
				this.drawnY = 560;
			}

			if (this.time > 100) {
				this.jump(-23);
			}
		}

		if (this.flying) {
			this.jump(-30);
		}

		this.timeUntilCollisions--;

		if (this.hitWall != undefined) {
			this.timeToHit++;
		}

		if (this.timeToHit > 10) {
			this.hitWall = undefined;
			this.timeToHit = 0;
		}

		this.timeToJump--;
		this.timeToShootFlame--;

		if (this.type == "Bowser") {
			if (this.timeToJump <= 0) {
				this.isJumping = true;
				this.timeToJump = 200;
			}

			this.velX = this.time%200 < 100 ? -3/4 : 3/4;

			if (marioX < this.drawnX+this.width/2) {
				this.directionFacing = "left";
			} else {
				this.directionFacing = "right";
			}

			if (this.directionFacing == "right") {
				this.velX = 3/4;
			}

			if (this.isJumping) {
				this.jump(-15);
			}
		}

		if (this.canBounce && !this.horizontal) {
			this.isJumping = true;
			this.jump(-15);
		}

		if (this.type.indexOf("Plant") > -1) {
			if (this.timeToMoveUpAndDown == 0) {
				if (this.drawnY >= this.constantY+(this.height < 0 ? this.height+20 : 0)-20 && this.drawnY < this.constantY+(this.height < 0 ? this.height+20 : 0)+Math.abs(this.height)-20) {
					this.drawnY++;
				} else {
					this.timeToMoveUpAndDown = 101;
				}
			} else if (this.timeToMoveUpAndDown == 1) {
				if (this.drawnY <= this.constantY+(this.height < 0 ? this.height+20 : 0)+Math.abs(this.height)-20 && this.drawnY > this.constantY+(this.height < 0 ? this.height+20 : 0)-20 && (this.canMoveUp || this.drawnY < this.constantY+this.height-20)) {
					this.drawnY--;
				} else {
					this.timeToMoveUpAndDown = 100;
				}
			} else {
				if (this.type == "GreenPlant") {
					this.timeToMoveUpAndDown -= 2;
				} else {
					this.timeToMoveUpAndDown -= 4;
				}
			}
		}

		if (this.isFlying) {
			if (this.type.indexOf("Paratroopa" > -1)) {
				if (!this.horizontal) {
					if (this.drawnY < this.constantY-20 || this.drawnY > this.constantY+220) {
						this.velY *= -1;
					}

					this.drawnY += this.velY;
					this.lastGroundY = this.drawnY;
				} else {
					if (this.drawnX < this.movingX || this.drawnX > this.movingX+200) {
						this.directionFacing = this.directionFacing == "left" ? "right" : "left";
					}
				}
			}
		}

		if (this.type.indexOf("Koopa") > -1) {
			this.affectedByGravity = true;
		}

		this.changeImage();
	},

	jump: function(vel) {
		this.timeFromJump++;

		this.velY = vel + this.gravity*this.timeFromJump;

		if (this.velY > 15) {
			this.velY = 15;
		}

		this.drawnY += this.velY;
	},

	swim: function() {
		this.timeFromJump++;
		this.velY = this.timeFromJump-13;

		if (this.velY > 0) {
			this.velY = 2;
		}

		this.drawnY += this.velY;
	},

	setHitbox: function() {
		if (["Goomba", "BuzzyBeetle", "Spiny", "BulletBill", "RedCheepCheep", "GreenCheepCheep", "Podobo"].includes(this.type)) {
				this.hitboxX = this.drawnX+10;
				this.hitboxY = this.drawnY+15;
				this.hitboxWidth = this.width/2;
				this.hitboxHeight = this.height/4;
		} else if (this.type.indexOf("Koopa") > -1 || this.type.indexOf("Paratroopa") > -1) {
			if (!this.inShell) {
				this.hitboxX = this.drawnX+5;
				this.hitboxY = this.drawnY+20;
				this.hitboxWidth = this.width*3/4;
				this.hitboxHeight = this.height/2;
			} else {
				this.hitboxX = this.drawnX+5;
				this.hitboxY = this.drawnY;
				this.hitboxWidth = this.width*3/4;
				this.hitboxHeight = this.height/2;
			}
		} else if (this.type.indexOf("Plant") > -1) {
			this.hitboxX = this.drawnX+5;
			this.hitboxY = this.drawnY+30;
			this.hitboxWidth = this.width*3/4;
			this.hitboxHeight = this.height/3;
		} else if (this.type == "Bowser") {
			this.hitboxX = this.drawnX+5;
			this.hitboxY = this.drawnY+5;
			this.hitboxWidth = this.width*7/8;
			this.hitboxHeight = this.height*7/8;
		} else if (this.type.indexOf("Lakitu") > -1) {
			if (this.timeToThrowSpiny <=120) {
				this.hitboxX = this.drawnX+5;
				this.hitboxY = this.drawnY+15;
				this.hitboxWidth = this.width*3/4;
				this.hitboxHeight = this.height*7/8;
			} else {
				this.hitboxX = -1000;
			}
		} else if (this.type == "HammerBros") {
			this.hitboxX = this.drawnX+8;
			this.hitboxY = this.drawnY+5;
			this.hitboxWidth = this.width/2;
			this.hitboxHeight = this.height-5;
		} else if (this.type == "BlooperSwimming") {
			this.hitboxX = this.drawnX+4;
			this.hitboxY = this.drawnY+this.height/2-5;
			this.hitboxWidth = this.width-8;
			this.hitboxHeight = this.height/2;
		} else {
			console.log("something is wrong");
		}

		/*graphics.strokeStyle = "black";
		graphics.strokeRect(Math.round(this.hitboxX), Math.round(this.hitboxY), Math.round(this.hitboxWidth), this.hitboxHeight);*/
	},

	topMarioCollisions: function(mario) {
		if (!mario.alive || mario.clearedLevel) {
			return;
		}

		if (!mario.hasStar && (mario.velY > 0 || (this.flying && mario.velY >= 0)) && mario.hitboxX <= this.hitboxX+this.hitboxWidth && mario.hitboxX+mario.hitboxWidth >= this.hitboxX 
			&& mario.hitboxY+mario.hitboxHeight >= this.hitboxY && mario.hitboxY <= this.hitboxY+this.hitboxHeight/2 && this.alive) {
			if (this.timeToCollide < 10) {
				return true;
			}

			if (this.canStomp && this.type.indexOf("Koopa") == -1 && this.type != "BuzzyBeetle") {
				mario.addScore(mario.scoreList[mario.enemyStreak], this.drawnX, this.drawnY);

				if (mario.enemyStreak < mario.scoreList.length-1) {
					mario.enemyStreak++;
				}
			}

			if (this.type.indexOf("Koopa") > -1 || this.type == "BuzzyBeetle") {
				if (!this.inShell) {
					this.sounds[8].currentTime = 0;
					this.sounds[8].play();
					this.timeToKick = 0;
					this.inShell = true;
					this.height = 40;

					mario.addScore(mario.scoreList[mario.enemyStreak], this.drawnX, this.drawnY);

					if (mario.enemyStreak < mario.scoreList.length-1) {
						mario.enemyStreak++;
					}
				} else {
					if (this.timeToKick > 10) {
						mario.addScore(mario.scoreList[mario.enemyStreak], this.drawnX, this.drawnY);

						if (mario.enemyStreak < mario.scoreList.length-1) {
							mario.enemyStreak++;
						}

						this.timeToKick = 0;
						this.bufferTime = 10;
						this.moving = !this.moving;

						if (this.moving) {
							if (mario.hitboxX+mario.hitboxWidth/2 < this.hitboxX+this.hitboxWidth/2) {
								this.directionMoving = "right";
							} else {
								this.directionMoving = "left";
							}
						}
					}
				}
			} else if (this.type.indexOf("Paratroopa") > -1) {
				this.type.length > 13 ? this.type = "GreenKoopa" : this.type = "RedKoopa";
				this.sounds[8].currentTime = 0;
				this.sounds[8].play();
				this.isFlying = false;
				this.canBounce = false;
				this.isJumping = false;
				this.canMove = true;
				this.velY = 0;
				this.timeToCollide = 0;
				this.velX = 1;
			} else if (this.canStomp) {
				this.sounds[8].currentTime = 0;
				this.sounds[8].play();
				this.die("stomp");
			}  else {
				if ((!this.inShell || (this.inShell && this.moving)) && mario.invincibility <= 0 && this.bufferTime <= 0) {
					mario.hit();
				}

				return true;
			}

			mario.timeFromJump = 0;
			mario.hitBlock = false;
			mario.lastGroundY = this.hitboxY-mario.height;
			mario.drawnY = mario.lastGroundY;
			mario.isJumping = true;
			mario.falling = false;
			mario.stompedOnEnemy = true;
			return true;
		}

		return false;
	},

	otherCollisions: function(object, mario) {
		if (!this.alive || (object.constructor == Player && this.topMarioCollisions(object)) || object.clearedLevel) {
			return false;
		}

		if (object.hitboxX+object.hitboxWidth >= this.hitboxX && object.hitboxX <= this.hitboxX+this.hitboxWidth 
			&& object.hitboxY+object.hitboxHeight > this.hitboxY+this.hitboxHeight/3 && object.hitboxY <= this.hitboxY+this.hitboxHeight) {
			if (object.constructor == Player) {
				if (object.hasStar) {
					object.addScore(object.scoreList[object.enemyStreak], this.drawnX, this.drawnY);
					if (object.enemyStreak < object.scoreList.length-1) {
						object.enemyStreak++;
					}

					if (this.enemyStreak < this.scoreList.length-1) {
						this.enemyStreak++;
					}

					this.sounds[5].currentTime = 0;
					this.sounds[5].play();
					this.die("star");
				} else if ((!this.inShell || this.moving) && object.invincibility <= 0 && this.bufferTime <= 0) {
					object.hit();
				} else if (this.inShell && this.timeToKick > 10 && !this.moving) {
					this.sounds[5].currentTime = 0;
					this.sounds[5].play();
					object.addScore(500, this.drawnX, this.drawnY);
					this.moving = true;
					object.stillInShell = true;
					this.bufferTime = 10;

					if (object.drawnX+object.width/2 > this.drawnX+this.width/2) {
						this.directionMoving = "left";
					} else {
						this.directionMoving = "right";
					}
				}
			} else if (object.constructor == Enemy && this != object) {
				if (this.drawnX+this.width < 0 || object.drawnX+object.width < 0) {
					return false;
				}

				if (object.inShell && object.moving) {
					mario.addScore(object.scoreList[object.enemyStreak], object.drawnX, object.drawnY);

					if (object.enemyStreak < object.scoreList.length-1) {
						object.enemyStreak++;
					}

					this.sounds[5].currentTime = 0;
					this.sounds[5].play();
					this.die("shell");

				} else if (!["BlooperSwimming", "BulletBill", "NormalLakitu", "GreenCheepCheep", "GreenPlant", "Podobo", "RedCheepCheep", "RedPlant"].includes(this.type) && !["BlooperSwimming", "BulletBill", "NormalLakitu", "GreenCheepCheep", "GreenPlant", "Podobo", "RedCheepCheep", "RedPlant"].includes(object.type) && this.timeUntilCollisions <= 0 && object.timeUntilCollisions <= 0) {
					if (Math.abs(this.drawnX-object.drawnX) < 10) {
						if (this.directionFacing == "left") {
							this.drawnX = object.hitboxX+object.hitboxWidth;
						} else {
							this.drawnX = object.hitboxX-this.hitboxWidth;
						}

						return false;
					}

					if (this.directionFacing == "left") {
						this.directionFacing = "right";
						object.directionFacing = "left";
					} else {
						this.directionFacing = "left";
						object.directionFacing = "right";
					}

					this.changedDirections = true;
					object.changedDirections = true;

					this.timeUntilCollisions = 15;
					object.timeUntilCollisions = 15;
				}
			}

			if (!this.changedDirections) {
				return true;
			}
		}

		if (object.constructor == Player) {
			if (this.type.indexOf("Plant") > -1) {
				if ((this.type == "GreenPlant" || this.drawnY >= object.drawnY+object.height) && Math.abs(this.drawnX-object.drawnX) < 56) {
					this.canMoveUp = false;
				} else {
					this.canMoveUp = true;
				}
			}
		}

		return false;
	},

	die: function(death) {
		this.alive = false;

		if (death == "stomp") {
			if (this.type.indexOf("Goomba") > -1) {
				this.img.src = `${pathname}/images/GoombaSquashed.png`;
				this.height = 20;
			} else if (this.type.indexOf("Lakitu") > -1) {
				this.height *= -1;
				this.drawnX = 1000;
			}
		} else {
			this.hit = true;
			this.collisions = false;
		}

		if (this.type.indexOf("Plant") > -1) {
			this.width = 0;
		} else if (this.type == "Bowser") {
			this.fall();
		}
	},

	changeImage: function() {
		if (this.animated == 0) {
			if (this.type != "BlooperSwimming") {
				this.img.src = `${pathname}/images/${this.type}.png`;
			} else {
				if (this.swimming && this.velY < 0) {
					this.height = 40;
					this.img.src = `${pathname}/images/BlooperSwimming.png`;
				} else {
					this.height = 60;
					this.img.src = `${pathname}/images/BlooperStroke.png`;
				}
			}

			if (this.type.indexOf("Lakitu") > -1){
				if (this.timeToThrowSpiny > 120) {
					this.img.src = `${pathname}/images/FindingLakitu.png`;
					this.height = 40;
					this.drawnY = this.constantY + 20;
				} else {
					this.height = 60;
					this.drawnY = this.constantY;
				}
			}
		} else if (this.animated > 0) {
			if (this.type != "HammerBros") {
				this.img.src = `${pathname}/images/${this.type}${Math.floor(this.time/10%this.animated)+1}.png`;
			} else {
				if (!this.throwing) {
					this.img.src = `${pathname}/images/${this.type}${Math.floor(this.time/10%this.animated)+1}.png`;
				} else {
					this.img.src = this.img.src = `${pathname}/images/HammerBrosThrowing${Math.floor(this.time/10%this.animated)+1}.png`;
				}
			}
		}

		if (this.type.indexOf("Koopa") > -1 || this.type == "BuzzyBeetle") {
			if (this.inShell) {
				this.img.src = `${pathname}/images/${this.type}Shell.png`;
			}

			if (this.alive && !this.hit && this.type.indexOf("Koopa") > -1 && this.inShell) {
				if (this.timeToGetUp < 500) {
					this.img.src = `${pathname}/images/${this.type}Shell.png`;
				} else {
					if (this.timeToGetUp % 10 < 5) {
						this.img.src = `${pathname}/images/${this.type}GettingUp.png`;
					} else {
						this.img.src = `${pathname}/images/${this.type}Shell.png`;
					}
				}
			}
		} else if (this.type == "HammerBros") {
			if (this.img.src.indexOf("Throwing") > -1) {
				if (this.height != 85) {
					this.drawnY -= 25;
					this.lastGroundY -= 25;
				}

				this.height = 85;
			} else {
				if (this.height != 60) {
					this.drawnY += 25;
					this.lastGroundY += 25;
				}

				this.height = 60;
			}
		}
	},

	fall: function() {
		this.timeFromJump++;
		this.velY = this.gravity*this.timeFromJump;

		if (this.velY > 15) {
			this.velY = 15;
		}

		this.drawnY += this.velY;
	},

	draw: function() {
		if (this.hit) {
			const a = Math.round(this.drawnY*2+this.height);

			graphics.setTransform(1, 0, 0, -1, shiftWidth, a);
		}	else if (this.directionFacing == "right") {
			const a = Math.round(this.drawnX*2+this.width)+shiftWidth;

			graphics.setTransform(-1, 0, 0, 1, a, 0);
		}

		if (this.height < 0 && this.type.indexOf("Plant") > -1) {
			const a = Math.round(this.drawnY*2-this.height);

			graphics.setTransform(1, 0, 0, -1, shiftWidth, a);
		}

		if (this.velY > 0 && this.type == "Podobo") {
			const a = Math.round(this.drawnY*2+this.height);

			graphics.setTransform(1, 0, 0, -1, shiftWidth, a);
		}

		if ((this.type != "Bowser" || !this.throwing) && (this.type != "Podobo" || (this.drawnY <= height-80 && this.velY != 0))) {
			graphics.drawImage(this.img, Math.round(this.drawnX), Math.round(this.drawnY), this.width, Math.abs(this.height));
		}

		if (this.type == "Bowser" && this.throwing) {
			let img1 = new Image();
			img1.src = `${pathname}/images/BowserThrowing.png`;
			let img2 = new Image;
			img2.src = `${pathname}/images/BowserBottom${Math.floor(this.time/10%2+1)}.png`;

			graphics.drawImage(img1, Math.round(this.drawnX), Math.round(this.drawnY)-25, this.width, 65);
			graphics.drawImage(img2, Math.round(this.drawnX), Math.round(this.drawnY)+40, this.width, this.height/2);
		}

		this.setHitbox();

		graphics.setTransform(1, 0, 0, 1, shiftWidth, 0);
	}
}

function Powerup(x, y, type, gravity, music, sounds, terrain) {
	this.drawnX = x;
	this.drawnY = y;
	this.targetY = y;
	this.width = 40;
	this.height = this.width;
	this.lastGroundY = this.drawnY;
	this.velX = 0;
	this.velY = 0;
	this.gravity = gravity;
	this.timeFromJump = 0;
	this.type = type;
	this.condition = false;
	this.time = 0;
	this.timeFromJump = 0;
	this.risen = false;
	this.isJumping = false;
	this.hitTop = false;
	this.placeLastHit = 0;
	this.music = music;
	this.sounds = sounds;
	this.terrain = terrain;

	this.drawnY += this.height/2;

	this.img = new Image();

	this.img.src = `${pathname}/images/${this.type}.png`;

	if (this.type == "Fire Flower") {
		this.type = "FireFlower";
	}

	if (this.type == "Star") {
		this.img.src = `${pathname}/images/Star1.png`;
	} else if (this.type == "FireFlower") {
		this.img.src = `${pathname}/images/FireFlower1.png`;
	}
}

Powerup.prototype = {
	constructor: Powerup,

	rise: function() {
		this.drawnY -= 0.5;

		if (this.drawnY <= this.targetY) {
			this.risen = true;

			if (this.type.indexOf("FireFlower") == -1) {
				this.velX = 2;
			} 
		}
	},

	fall: function() {
		this.velY = this.gravity*this.timeFromJump;
		this.timeFromJump++;

		this.drawnY = this.lastGroundY + 0.5 * this.gravity * this.timeFromJump**2;
	},

	update: function(movingScreen, canScroll, marioVelX) {
		this.time++;

		if (movingScreen && canScroll) {
			this.drawnX -= marioVelX;
		}

		if (this.type.indexOf("FireFlower") > -1 || this.type == "Star") {
			this.img.src = `${pathname}/images/${this.type}${Math.floor(this.time/10%4)+1}.png`;

			if (this.type == "Star" && this.risen) {
				this.jump(-14);
			}
		}

		if (this.isJumping && this.risen) {
			this.jump(-13);
		}
		

		this.drawnX += this.velX;
	},

	setHitbox: function() {
		this.hitboxX = this.drawnX+5;
		this.hitboxY = this.drawnY;
		this.hitboxWidth = 30;
		this.hitboxHeight = 30;

		/*graphics.strokeStyle = "black";
		graphics.strokeRect(Math.round(this.hitboxX), Math.round(this.hitboxY), this.hitboxWidth, this.hitboxHeight);*/
	},

	jump: function(vel) {
		if (this.type.indexOf("FireFlower") > -1) {
			return;
		}

		this.timeFromJump++;

		if (!this.hitTop) {
			this.velY = vel + this.gravity*this.timeFromJump;
		} else {
			if (this.velY <= 0) {
				this.velY = 0;
			}

			this.velY++;
		}

		this.drawnY += this.velY;
	},

	collides: function(object, powerups) {
		if (!object.alive || object.clearedLevel) {
			return false;
		}

		if (object.hitboxX+object.hitboxWidth >= this.hitboxX && object.hitboxX <= this.hitboxX+this.hitboxWidth && object.hitboxY+object.hitboxHeight > this.hitboxY 
			&& object.hitboxY < this.hitboxY+this.hitboxHeight) {
			powerups.splice(powerups.indexOf(this), 1);

			if (this.type != "PoisonMushroom" && object.invincibility <= 0) {
				object.addScore(1000, this.drawnX, this.drawnY);
			}

			if (this.type == "Mushroom" || this.type.indexOf("FireFlower") > -1) {
				this.sounds[15].currentTime = 0;
				this.sounds[15].play();
			}

			if (this.type == "Mushroom" && !object.isBig) {
				object.isBig = true;
				object.timeUntilNoTransition = 50;
				object.transition = "growing";

				if (object.isOnGround) {
					object.lastGroundY -= object.height;
					object.drawnY -= object.height;
				}
			} else if (this.type == "PoisonMushroom") {
				object.hit()
			} else if (this.type.indexOf("FireFlower") > -1 && !object.hasFireFlower) {
				object.timeUntilNoTransition = 50;
				object.transition = "growing";
				if (object.isBig) {
					object.hasFireFlower = true;
				} else {
					object.isBig = true;

					if (object.isOnGround) {
						object.lastGroundY -= object.height;
						object.drawnY -= object.height+1;
					}
				}
			} else if (this.type.indexOf("1up") > -1) {
				this.sounds[0].currentTime = 0;
				this.sounds[0].play();
				object.lives++;
			} else if (this.type == "Star") {
				this.music.src = `${pathname}/sounds/invincible.wav`;
				this.music.play();
				object.hasStar = true;
				object.invincibility = 618;
			}

			return true;
		}

		return false;
	},

	draw: function() {
		graphics.drawImage(this.img, Math.round(this.drawnX), Math.round(this.drawnY), 40, 40);
		this.setHitbox();
	}
}

function Projectile(type, x, y, direction, gravity, sounds, radius, angle) {
	this.type = type;
	this.canMove = true;

	if (this.type == "Firebar") {
		this.canMove = false;
		this.type = "Fireball";
	}

	this.drawnX = x;
	this.centerX = x;
	this.drawnY = y;
	this.centerY = y;
	this.lastGroundY = y;
	this.isJumping = false;
	this.isOnGround = false;
	this.timeFromJump = 0;
	this.velX = 10;
	this.velY = 0;
	this.gravity = gravity;
	this.direction = direction;
	this.notBounced = true;
	this.time = 0;
	this.angle = angle;
	this.sounds = sounds;
	this.radius = radius;
	this.width = 20;
	this.height = 20;
	this.hitboxX = this.drawnX;
	this.hitboxY = this.drawnY;
	this.hitboxWidth = 20;
	this.hitboxHeight = 20;
	this.img = new Image();
	this.img.src = `${pathname}/images/${this.type}1.png`;

	if (this.type == "Hammer") {
		this.img.src = `${pathname}/images/Hammer.png`;
	}

	if (this.type == "BowserFlame") {
		this.velX = 5;
		this.width = 60;
	} else if (this.type == "Hammer") {
		this.velX = 5;
		this.height = 40;
		this.angle = 0;
	}
}

Projectile.prototype = {
	constructor: Projectile,

	update: function(movingScreen, canScroll, marioVelX) {
		this.time++;

		if (movingScreen && canScroll) {
			this.drawnX -= marioVelX;
			this.centerX -= marioVelX;
			this.movingX -= marioVelX;
		}

		if (this.type == "Fireball") {
			this.img.src = `${pathname}/images/${this.type}${Math.floor(this.time/10%4)+1}.png`;
		} else if (this.type == "BowserFlame") {
			this.img.src = `${pathname}/images/${this.type}${Math.floor(this.time/10%2)+1}.png`;
		} else if (this.type == "Hammer") {

		}

		if (this.canMove) {
			if (this.direction == "left") {
				this.drawnX -= this.velX;
			} else {
				this.drawnX += this.velX;
			}

			if (this.type == "Fireball") {
				if (this.notBounced) {
					this.drawnY += 10;
				} else {
					this.bounce();
				}
			}

			if (this.type == "Hammer") {
				if (this.time%5 == 0) {
					this.angle -= Math.PI/2;
				}

				this.jump(-15);
			}
		} else if (this.type == "Fireball") {
			this.angle += 1/50;

			this.drawnX = this.centerX+this.radius*Math.cos(this.angle);
			this.drawnY = this.centerY+this.radius*this.direction*Math.sin(this.angle);
		}

		this.hitboxX = this.drawnX;
		this.hitboxY = this.drawnY;
		this.hitboxWidth = 20;
		this.hitboxHeight = 20;
	},

	bounce: function() {
		let initialVelocity = -9;

		this.velY = initialVelocity + this.gravity*this.timeFromJump;
		this.timeFromJump++;

		this.drawnY = this.lastGroundY + initialVelocity * this.timeFromJump + 0.5 * this.gravity * this.timeFromJump**2;
	},

	jump: function(vel) {
		this.timeFromJump++;

		this.velY = vel + this.gravity*this.timeFromJump;

		if (this.velY >= 15) {
			this.velY = 15;
		}

		this.drawnY += this.velY
	},

	collides: function(object, mario) {
		if (!object.alive || object.clearedLevel) {
			return false;
		}

		if (this.drawnX+this.width > object.hitboxX && this.drawnX < object.hitboxX+object.hitboxWidth && this.drawnY+this.height > object.hitboxY && this.drawnY < object.hitboxY+object.hitboxHeight) {
			if (object.constructor == Enemy) {
				object.hitsToKill--;

				if (object.type != "Bowser" && object.canDieByFire) {
					this.sounds[5].currentTime = 0;
					this.sounds[5].play();
					mario.addScore(200, this.drawnX, this.drawnY);
					object.die("fireball");
				} else if (!object.canDieByFire) {
					this.sounds[1].currentTime = 0;
					this.sounds[1].play();
				}

				if (object.type == "Bowser" && object.hitsToKill <= 0) {
					this.sounds[12].currentTime = 0;
					this.sounds[12].play();
					mario.addScore(5000, this.drawnX, this.drawnY);
					object.die("fireball");
				}
			} else if (object.constructor == Player && object.invincibility <= 0) {
				if (this.type == "Hammer") {
					this.drawnX = -100;
				}

				object.hit();
			}

			return true;
		}

		return false;
	},

	draw: function() {
		graphics.strokeStyle = "green";

		if (this.type == "Hammer") {
			graphics.setTransform(Math.round(Math.cos(this.angle)), Math.round(Math.sin(this.angle)), Math.round(-Math.sin(this.angle)), Math.round(Math.cos(this.angle)), this.drawnX+this.width/2+shiftWidth, this.drawnY+this.height/2);
			graphics.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height);
			//graphics.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
			graphics.setTransform(1, 0, 0, 1, shiftWidth, 0);	
		} else {
			graphics.drawImage(this.img, Math.round(this.drawnX), Math.round(this.drawnY), this.width, this.height);
			//graphics.strokeRect(this.drawnX, this.drawnY, this.width, this.height);
		}
	}
}
