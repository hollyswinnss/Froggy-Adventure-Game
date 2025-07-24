//---------------------
// Final Project: Froggy Adventure
// By: Holly Swinburne
// Date: 2025
//---------------------

var gameChar_x;
var gameChar_y;
var floorPos_y;
var cameraPosX;

var isLeft;
var isRight;
var isPlummeting;
var isFalling;
var isJumping;

var clouds;
var mountains;
var collectables;
var canyons;

var game_score;
var flagpole;
var lives;
var levelCompleteAlpha = 0; // For fade in effect
var starRotation = 0; // For rotating star animation
var collectedHats = [];// a variable to track collected hats at the top of your file
var isGameOverSoundPlaying = false;
var isLevelCompleteSoundPlaying = false;

var backgroundMusic, jumpSound, gameOverSound, levelCompleteSound;
var gamestart = true;


//---------------------
// Main Game Setup Functions
//---------------------

// Function to preload my sounds
function preload() {
	soundFormats('mp3', 'wav');
	backgroundMusic = loadSound('sounds/gamebg2.mp3'); //Bg Music
	levelCompleteSound = loadSound('sounds/levelcompletes.wav'); //Level Complete Sound
	gameOverSound = loadSound('sounds/gameovers.wav'); //Game Over Sound
	jumpSound = loadSound('sounds/jumping.wav'); //Jump Sound
	collectedFlySound = loadSound('sounds/frogbite.wav'); // Collected Fly Sound
	collectedHatSound = loadSound('sounds/collectedhat.wav'); // Collected Hat Sound
	fallIntoCanyonSound = loadSound('sounds/falledintocanyon.wav'); // Fall Into Canyon Sound
	awakeToadSound = loadSound('sounds/toadawake.wav'); // Awake Toad Sound
}
// Function to set up backgroundmusic
function playBackgroundMusic() {
	backgroundMusic.loop();
	backgroundMusic.setVolume(0.6);
	userStartAudio(); // Start audio on user interaction
}
// Function to set up initial environment
function setup() {
	createCanvas(1024, 576);
	floorPos_y = height * 3 / 4;
	lives = 3; // Lives
	playBackgroundMusic(); // Start the bg music
}
// Function to reset character
function resetCharacter() {
	gameChar_x = -1360;
	gameChar_y = floorPos_y;
	isLeft = false;
	isRight = false;
	isPlummeting = false;
	isFalling = false;
	isJumping = false;
}
// Function to draw the game
function draw() {
	// Start game
	if (gamestart === true) {
		drawStartScreen();
		return;
	}
	// End Game
	if (lives < 1) {
		drawGameOverScreen();
		if (!isGameOverSoundPlaying) {
			gameOverSound.setVolume(0.5);
			gameOverSound.play();
			isGameOverSoundPlaying = true;
		}
		gameOver = true;
		return; // Stop further game logic
	}
	// In your draw function, modify this section
	if (flagpole.isReached && levelComplete) {  // Add check for both conditions
		drawLevelCompleteScreen();
		if (!isLevelCompleteSoundPlaying) {
			levelCompleteSound.setVolume(0.5);
			levelCompleteSound.play();
			isLevelCompleteSoundPlaying = true;
		}
		return; // Stop further game logic
	}
	background(174, 219, 255,);
	// Update camera position
	cameraPosX = gameChar_x - width / 2;
	// Draw scenery
	drawGround();
	//Sun in sky
	noStroke();
	fill(255, 219, 59);
	ellipse(850, 90, 100, 100);
	// Game Score Text
	fill(69, 133, 71);
	noStroke();
	textSize(15);
	textAlign(LEFT);
	text("score: " + game_score, 30, 30);
	text("lives: ", 105, 30);
	for (let i = 0; i < lives; i++) {
		drawHeart(155 + i * 20, 20, 10);
	}
	push();
	// Add this after the hearts:
	text("hats: ", 30, 50);
	// Draw mini hat icons for collected hats
	push();
	translate(70, 42);
	scale(0.3); // Make the hats smaller
	for (let i = 0; i < collectedHats.length; i++) {
		let hat = collectedHats[i];
		switch (hat.type) {
			case 'tophat':
				drawTopHat(i * 60, 0, 0.8);
				break;
			case 'beret':
				drawBeret(i * 60, 0, 0.8);
				break;
			case 'policehat':
				drawPoliceHat(i * 60, 0, 0.8);
				break;
			case 'cowboyhat':
				drawCowboyHat(i * 60, 0, 0.8);
				break;
			case 'hardhat':
				drawHardHat(i * 60, 0, 0.8);
				break;
		}
	}
	pop();
	// Apply camera translation
	translate(-cameraPosX, 0);
	drawScenery();
	// Render flagpole
	renderFlagpole();
	// Check if the player has reached flagpole
	checkFlagpole();
	// Loop through the canyons array
	for (let i = 0; i < canyons.length; i++) {
		if (!canyons[i].isFound) { // Only draw if not collected
			drawCanyon(canyons[i]);
			checkCanyon(canyons[i]);
		}
	}
	// Loop through the collectables array
	for (let i = 0; i < collectables.length; i++) {
		if (!collectables[i].isFound) { // Only draw if not collected
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
			// Increment the angle for circular motion
			collectables[i].angle += 0.05;
		}
	}
	// Draw platforms
	for (let i = 0; i < platform.length; i++) {
		drawPlatform(platform[i]);
	}
	// Check for platform collisions
	checkPlatformCollision();
	// Check if the player has died
	checkPlayerDie();
	//Draw character hats 
	drawAndCheckHats();
	// Draw character
	drawGameCharacter();
	// Draw toads
	drawToads();
	// Draw patrolling toads
	drawPatrollingToads();
	// Check for toad collisions
	checkToadCollision();
	checkPatrollingToadCollision();
	pop();
}
// Function to start the game and reset variables
function startGame() {
	gameChar_x = -1360;
	gameChar_y = floorPos_y + 30;
	cameraPosX = 0; // Camera x position

	//Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isPlummeting = false;
	isFalling = false;
	isJumping = false;
	isFound = false;
	isGameOverSoundPlaying = false;
	isLevelCompleteSoundPlaying = false;

	// Initialise arrays of scenery objects.	
	trees_x = [-2000, -1700, -1300, -1000, -600, -160, 300, 500, 900, 1300]; // x-positions of trees
	bushes_x = [-250, 600, 670, 950, 1400]; // x-positions of trees
	t_canyon = { x_pos: 170, width: 70 } //canyon position
	clouds = [
		{ x: -2450, y: 100, speed: 0.4 },
		{ x: -2250, y: 220, speed: 0.3 },
		{ x: -2050, y: 150, speed: 0.2 },
		{ x: -1650, y: 220, speed: 0.4 },
		{ x: -1450, y: 100, speed: 0.3 },
		{ x: -1050, y: 200, speed: 0.4 },
		{ x: -850, y: 100, speed: 0.4 },
		{ x: -650, y: 150, speed: 0.3 },
		{ x: 150, y: 100, speed: 0.4 },
		{ x: 400, y: 150, speed: 0.2 },
		{ x: 700, y: 200, speed: 0.4 },
		{ x: 900, y: 100, speed: 0.4 },
	]; // cloud positions
	mountains = [{ x: -2000, height: 300 }, { x: -1500, height: 150 }, { x: -900, height: 150 }, { x: -800, height: 150 }, { x: -330, height: 250 }, { x: 650, height: 180 },]; // mountain position
	collectables = [
		{ x_pos: 1350, y_pos: 330, size: 13, isFound: false, angle: 0 },
		{ x_pos: 1050, y_pos: 350, size: 13, isFound: false, angle: 0 },
		{ x_pos: 950, y_pos: 350, size: 13, isFound: false, angle: 0 },
		{ x_pos: 850, y_pos: 350, size: 13, isFound: false, angle: 0 },
		{ x_pos: 470, y_pos: 370, size: 13, isFound: false, angle: 0 },
		{ x_pos: 300, y_pos: 370, size: 13, isFound: false, angle: 0 },
		{ x_pos: 70, y_pos: 400, size: 13, isFound: false, angle: 0 },
		{ x_pos: -270, y_pos: 400, size: 13, isFound: false, angle: 0 },
		{ x_pos: -370, y_pos: 400, size: 13, isFound: false, angle: 0 },
		{ x_pos: -700, y_pos: 340, size: 13, isFound: false, angle: 0 },
		{ x_pos: -1050, y_pos: 270, size: 13, isFound: false, angle: 0 },
		{ x_pos: -530, y_pos: 260, size: 13, isFound: false, angle: 0 },
		{ x_pos: -1250, y_pos: 360, size: 13, isFound: false, angle: 0 },
		{ x_pos: -1450, y_pos: 320, size: 13, isFound: false, angle: 0 },
		{ x_pos: -1550, y_pos: 300, size: 13, isFound: false, angle: 0 },
		{ x_pos: -1650, y_pos: 320, size: 13, isFound: false, angle: 0 },
	];
	canyons = [
		{ x_pos: -2850, width: 660 },
		{ x_pos: -1850, width: 60 },
		{ x_pos: -1200, width: 60 },
		{ x_pos: -500, width: 60 },
		{ x_pos: -30, width: 60 },
		{ x_pos: 170, width: 60 },
		{ x_pos: 400, width: 60 },
		{ x_pos: 1150, width: 60 }
	];

	toads = [
		{ x: -1470, y: floorPos_y, size: 0.3, isAwake: false },
		{ x: -900, y: floorPos_y + 30, size: 0.4, isAwake: false },
		{ x: -600, y: floorPos_y, size: 0.3, isAwake: false },
		{ x: -180, y: floorPos_y, size: 0.4, isAwake: false },
		{ x: 1050, y: floorPos_y, size: 0.3, isAwake: false },
		{ x: 1400, y: floorPos_y, size: 0.3, isAwake: false },
	];

	game_score = 0; // Game score

	// Initialise the flagpole for endgame
	flagpole = {
		x_pos: 1600,
		isReached: false
	};

	// Initialise game state flags
	gameOver = false;
	levelComplete = false;

	platform = [];
	platform.push(createPlatform(1300, 360, 300));//Platform 0
	platform.push(createPlatform(1150, 300, 100));//Platform 1
	platform.push(createPlatform(600, 380, 500));//Platform 2
	platform.push(createPlatform(220, 400, 300));//Platform 3
	platform.push(createPlatform(550, 300, 100));//Platform 4
	// Beret Hat Platforms
	platform.push(createPlatform(-490, 200, 100));//Platform 5
	platform.push(createPlatform(-650, 290, 250));//Platform 6
	platform.push(createPlatform(-750, 370, 150));//Platform 7
	// Hard Hat Platforms
	platform.push(createPlatform(-1200, 230, 100));//Platform 8
	platform.push(createPlatform(-1200, 300, 250));//Platform 9
	platform.push(createPlatform(-900, 350, 100));//Platform 10
	// Party easter egg hat
	platform.push(createPlatform(-2500, 150, 100));//Platform 11
	platform.push(createPlatform(-2450, 200, 100));//Platform 12
	platform.push(createPlatform(-2350, 250, 100));//Platform 13
	platform.push(createPlatform(-2250, 300, 100));//Platform 14
	platform.push(createPlatform(-2150, 350, 300));//Platform 15
	platform.push(createPlatform(-1800, 350, 500));//Platform 16
	platform.push(createPlatform(-1300, 390, 100));//Platform 17

	toadIsAsleep = true;
	toadIsAwake = false;

	// Add new patrolling toads
	patrollingToads = [
		new PatrollingToad(1320, platform[0].y, 0.3, platform[0]),
		new PatrollingToad(600, platform[2].y, 0.3, platform[2]),
		new PatrollingToad(220, platform[3].y, 0.3, platform[3]),
		new PatrollingToad(-650, platform[6].y, 0.3, platform[6]),
		new PatrollingToad(-1200, platform[9].y, 0.3, platform[9]),
		new PatrollingToad(-1300, platform[16].y, 0.3, platform[16])
		// Add more patrolling toads as needed
	];

	// Initialize hats collection
	hats = [
		{ type: 'tophat', x: -2460, y: floorPos_y - 330, size: 0.5, isCollected: false },
		{ type: 'beret', x: -454, y: floorPos_y - 270, size: 0.6, isCollected: false },
		{ type: 'policehat', x: 590, y: floorPos_y - 170, size: 0.6, isCollected: false },
		{ type: 'cowboyhat', x: 1185, y: floorPos_y - 170, size: 0.6, isCollected: false },
		{ type: 'hardhat', x: -1165, y: floorPos_y - 235, size: 0.6, isCollected: false }
	];

	// Add a variable to track which hat is currently worn
	currentHat = null;
	collectedHats = [];

}

//---------------------
// Start Game Screens
//---------------------
// Add this new function to draw the start screen
function drawStartScreen() {
	background(174, 219, 255);

	// Draw title
	textSize(50);
	textAlign(CENTER);
	fill(34, 139, 34);
	textStyle(BOLD);
	text("Froggy Adventure", width / 2, height / 3 - 10);

	// Draw evil toad
	push();
	translate(width / 2 + 50, height / 2 - 10);
	scale(1.2);
	toadIsAwake = false;
	drawToad(0, 0, 0.7, true);
	pop();
	// Draw evil toad
	push();
	translate(width / 2 + 140, height / 2 + 10);
	scale(1.2);
	toadIsAwake = true;
	drawToad(0, 0, 0.5, true);
	pop();

	// Draw character preview with top hat
	push();
	translate(width / 2 - 160, height / 2 + 70);
	scale(1.6);

	// Draw the frog character (standing position)
	noStroke();
	fill(104, 160, 27);
	//frog back legs
	push();
	translate(-17, -23);
	rotate(radians(-30));
	ellipse(0, 0, 10, 15);
	pop();
	push();
	translate(17, -23);
	rotate(radians(30));
	ellipse(0, 0, 10, 15);
	pop();

	// Draw rest of frog
	arc(-17, -13, 12, 13, PI, 0);
	arc(17, -13, 12, 13, PI, 0);
	fill(122, 181, 85);
	ellipse(0, -32, 35, 35);
	ellipse(-7, -45, 17, 17);
	ellipse(7, -45, 17, 17);
	fill(212, 242, 141);
	ellipse(0, -24, 25, 18);
	fill(122, 181, 85);
	ellipse(-9, -22, 9, 20);
	ellipse(9, -22, 9, 20);
	fill(255);
	ellipse(-7, -45, 15, 15);
	ellipse(7, -45, 15, 15);
	fill(0);
	ellipse(-7, -45, 7, 7);
	ellipse(7, -45, 7, 7);
	fill(122, 181, 85);
	arc(-7, -49, 14, 8, PI, 0);
	arc(7, -49, 14, 8, PI, 0);
	noFill();
	stroke(0);
	strokeWeight(1);
	arc(0, -35, 7, 4, 0, PI);

	// Draw top hat on frog
	drawTopHat(-10, -77, 0.5);
	pop();

	// Draw instructions
	textSize(20);
	fill(0);
	text("Use LEFT and RIGHT ARROW keys to move", width / 2, height * 0.64);
	text("Press SPACE to jump", width / 2, height * 0.69);
	text("Collect flies and avoid evil toads!", width / 2, height * 0.74);

	// Draw start prompt
	textSize(25);
	fill(255, 0, 0);
	text("Press ENTER to start", width / 2, height * 0.8);
}
// Add this function to draw the game over screen
function drawGameOverScreen() {
	background(0, 0, 0, 200);
	// Game Over text
	textSize(50);
	textAlign(CENTER);
	fill(255, 0, 0);
	text("Game Over!", width / 2, height / 3);

	// Score text
	textSize(25);
	fill(255);
	text("Final Score: " + game_score, width / 2, height / 2);

	// Draw hats collected section
	textSize(25);
	text("Hats Collected:", width / 2, height / 2 + 50);

	// Draw collected hats in a row
	push();
	translate(width / 2 - (collectedHats.length * 60) / 2, height / 2 + 80);
	for (let i = 0; i < collectedHats.length; i++) {
		let hat = collectedHats[i];
		switch (hat.type) {
			case 'tophat':
				drawTopHat(i * 60, 0, 0.8);
				break;
			case 'beret':
				drawBeret(i * 60, 0, 0.8);
				break;
			case 'policehat':
				drawPoliceHat(i * 60, 0, 0.8);
				break;
			case 'cowboyhat':
				drawCowboyHat(i * 60, 0, 0.8);
				break;
			case 'hardhat':
				drawHardHat(i * 60, 0, 0.8);
				break;
		}
	}
	pop();

	// Restart prompt
	textSize(25);
	fill(255);
	text("Press SPACE to restart", width / 2, height * 0.8);
}
// Modify your drawLevelCompleteScreen function
function drawLevelCompleteScreen() {
	// Fade in effect
	if (levelCompleteAlpha < 200) {
		levelCompleteAlpha += 2;
	}

	// Semi-transparent background
	fill(0, 0, 0, levelCompleteAlpha);
	rect(0, 0, width, height);

	// Title text with glow effect
	textAlign(CENTER);
	textSize(60);

	// Glow effect
	fill(34, 139, 34, levelCompleteAlpha);
	for (let i = 0; i < 10; i++) {
		text("Level Complete!", width / 2, height / 3 + sin(frameCount * 0.05) * 5);
	}

	// Main text
	fill(122, 181, 85, levelCompleteAlpha);
	text("Level Complete!", width / 2, height / 3 + sin(frameCount * 0.05) * 5);

	// Score and stats
	textSize(30);
	fill(255, 255, 255, levelCompleteAlpha);
	text("Final Score: " + game_score, width / 2, height / 2 - 20);
	text("Lives Remaining: " + lives, width / 2, height / 2 + 20);

	// Draw hats collected section
	textSize(25);
	text("Hats Collected:", width / 2, height / 2 + 80);

	// Draw collected hats in a row
	push();
	translate(width / 2 - (collectedHats.length * 60) / 2, height / 2 + 120);
	for (let i = 0; i < collectedHats.length; i++) {
		let hat = collectedHats[i];
		switch (hat.type) {
			case 'tophat':
				drawTopHat(i * 60, 0, 0.8);
				break;
			case 'beret':
				drawBeret(i * 60, 0, 0.8);
				break;
			case 'policehat':
				drawPoliceHat(i * 60, 0, 0.8);
				break;
			case 'cowboyhat':
				drawCowboyHat(i * 60, 0, 0.8);
				break;
			case 'hardhat':
				drawHardHat(i * 60, 0, 0.8);
				break;
		}
	}
	pop();

	// Draw decorative stars
	drawStars();

	// Continue prompt
	textSize(25);
	if (frameCount % 60 < 30) { // Blinking effect
		fill(255, 255, 255, levelCompleteAlpha);
		text("Press SPACE to continue", width / 2, height * 0.8);
	}
}
// Function to draw decorative stars
function drawStars() {
	// Drawing stars for the level complete screen
	// Draw a circle of stars
	push();
	starRotation += 0.01;

	for (let i = 0; i < 5; i++) {
		let angle = TWO_PI / 5 * i + starRotation;
		// Increase the 150 to a larger number to make the circle bigger
		let x = width / 2 + cos(angle) * 250; // Changed from 150 to 250
		let y = height / 2 + sin(angle) * 250; // Changed from 150 to 250

		push();
		translate(x, y);
		rotate(frameCount * 0.02);
		drawStar(0, 0, 20, 40, 5);
		pop();
	}
	pop();
}
// Function to draw a single star
function drawStar(x, y, radius1, radius2, npoints) {
	// Drawing stars for the level complete screen
	let angle = TWO_PI / npoints;
	let halfAngle = angle / 2.0;

	fill(255, 215, 0, levelCompleteAlpha);
	noStroke();

	beginShape();
	for (let a = 0; a < TWO_PI; a += angle) {
		let sx = x + cos(a) * radius2;
		let sy = y + sin(a) * radius2;
		vertex(sx, sy);
		sx = x + cos(a + halfAngle) * radius1;
		sy = y + sin(a + halfAngle) * radius1;
		vertex(sx, sy);
	}
	endShape(CLOSE);
}
// First, add a function to draw a heart
function drawHeart(x, y, size) {
	// Drawing hearts for lives
	push();
	fill(255, 0, 0);
	noStroke();
	beginShape();
	vertex(x, y);
	bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
	bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
	endShape(CLOSE);
	pop();
}

// ---------------------
// Game rendering functions
// ---------------------

// Function to draw character
function drawGameCharacter() {
	//the game character
	if (isLeft && isFalling) {
		// add your jumping-left code
		noStroke();
		fill(122, 181, 85);
		//Frog body
		ellipse(gameChar_x, gameChar_y - 32, 30, 35);
		//eye covers
		ellipse(gameChar_x - 7, gameChar_y - 45, 17, 17);
		//frog belly
		noStroke()
		fill(212, 242, 141);
		ellipse(gameChar_x - 7, gameChar_y - 25, 15, 18);
		//frog back legs
		noStroke();
		fill(104, 160, 27);
		push();
		translate(gameChar_x + 9, gameChar_y - 23);
		rotate(radians(-30)); // Rotate by -30 degrees
		ellipse(0, 0, 16, 15);
		pop();
		//Extended Legs
		ellipse(gameChar_x + 14, gameChar_y - 17, 10, 17);
		//Left Foot
		arc(gameChar_x + 14, gameChar_y - 7, 12, 13, PI - 20, PI + 40);
		//frog Front legs
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x - 7, gameChar_y - 22, 9, 20);
		//frog eyes
		noStroke();
		fill(255, 255, 255);
		ellipse(gameChar_x - 7, gameChar_y - 45, 15, 15);
		noStroke();
		fill(0, 0, 0);
		ellipse(gameChar_x - 10, gameChar_y - 45, 7, 7);
		noStroke();
		fill(122, 181, 85);
		arc(gameChar_x - 7, gameChar_y - 49, 14, 8, PI, 0);
		//frog mouth
		noFill();
		stroke(0);
		strokeWeight(1);
		arc(gameChar_x - 10, gameChar_y - 35, 7, 4, 0, PI);
	}
	else if (isRight && isFalling) {
		// add your jumping-right code
		noStroke();
		fill(122, 181, 85);
		//Frog body
		ellipse(gameChar_x, gameChar_y - 32, 30, 35);
		//eye covers
		ellipse(gameChar_x + 7, gameChar_y - 45, 17, 17);
		//frog belly
		noStroke()
		fill(212, 242, 141);
		ellipse(gameChar_x + 7, gameChar_y - 25, 15, 18);
		//frog back legs
		noStroke();
		fill(104, 160, 27);
		push();
		translate(gameChar_x - 9, gameChar_y - 23);
		rotate(radians(30)); // Rotate by 30 degrees
		ellipse(0, 0, 16, 15);
		pop();
		//Extended Legs
		ellipse(gameChar_x - 14, gameChar_y - 17, 10, 17);
		// Right Foot
		arc(gameChar_x - 14, gameChar_y - 7, 12, 13, PI + 20, PI - 40);
		//frog Front legs
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x + 7, gameChar_y - 22, 9, 20);
		//frog eyes
		noStroke();
		fill(255, 255, 255);
		ellipse(gameChar_x + 7, gameChar_y - 45, 15, 15);
		noStroke();
		fill(0, 0, 0);
		ellipse(gameChar_x + 10, gameChar_y - 45, 7, 7);
		noStroke();
		fill(122, 181, 85);
		arc(gameChar_x + 7, gameChar_y - 49, 14, 8, PI, 0);
		//frog mouth
		noFill();
		stroke(0);
		strokeWeight(1);
		arc(gameChar_x + 10, gameChar_y - 35, 7, 4, 0, PI);
	}
	else if (isLeft) {
		// add your walking left code
		noStroke();
		//Frog body
		fill(122, 181, 85);
		ellipse(gameChar_x, gameChar_y - 32, 30, 35);
		//eye covers
		ellipse(gameChar_x - 7, gameChar_y - 45, 17, 17);
		//frog belly
		noStroke()
		fill(212, 242, 141);
		ellipse(gameChar_x - 7, gameChar_y - 25, 15, 18);
		//frog back legs
		noStroke();
		fill(104, 160, 27);
		push();
		translate(gameChar_x + 10, gameChar_y - 26);
		rotate(radians(-30)); // Rotate by -30 degrees
		ellipse(0, 0, 15, 17);
		pop();
		//Left Foot
		arc(gameChar_x + 10, gameChar_y - 13, 12, 13, PI, 0);
		//frog Front legs
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x - 7, gameChar_y - 22, 9, 20);
		//frog eyes
		noStroke();
		fill(255, 255, 255);
		ellipse(gameChar_x - 7, gameChar_y - 45, 15, 15);
		noStroke();
		fill(0, 0, 0);
		ellipse(gameChar_x - 10, gameChar_y - 45, 7, 7);
		noStroke();
		fill(122, 181, 85);
		arc(gameChar_x - 7, gameChar_y - 49, 14, 8, PI, 0);
		//frog mouth
		noFill();
		stroke(0);
		strokeWeight(1);
		arc(gameChar_x - 10, gameChar_y - 35, 7, 4, 0, PI);
	}
	else if (isRight) {
		// add your walking right code
		noStroke();
		fill(122, 181, 85);
		//Frog body
		ellipse(gameChar_x, gameChar_y - 32, 30, 35);
		//eye covers
		ellipse(gameChar_x + 7, gameChar_y - 45, 17, 17);
		//frog belly
		noStroke()
		fill(212, 242, 141);
		ellipse(gameChar_x + 7, gameChar_y - 25, 15, 18);
		//frog back legs
		noStroke();
		fill(104, 160, 27);
		push();
		translate(gameChar_x - 10, gameChar_y - 26);
		rotate(radians(-30)); // Rotate by -30 degrees
		ellipse(0, 0, 15, 17);
		pop();
		//Left Foot
		arc(gameChar_x - 10, gameChar_y - 13, 12, 13, PI, 0);
		//frog Front legs
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x + 7, gameChar_y - 22, 9, 20);
		//frog eyes
		noStroke();
		fill(255, 255, 255);
		ellipse(gameChar_x + 7, gameChar_y - 45, 15, 15);
		noStroke();
		fill(0, 0, 0);
		ellipse(gameChar_x + 10, gameChar_y - 45, 7, 7);
		noStroke();
		fill(122, 181, 85);
		arc(gameChar_x + 7, gameChar_y - 49, 14, 8, PI, 0);
		//frog mouth
		noFill();
		stroke(0);
		strokeWeight(1);
		arc(gameChar_x + 10, gameChar_y - 35, 7, 4, 0, PI);
	}
	else if (isFalling || isPlummeting) {
		// add your jumping facing forwards code
		//frog back legs
		noStroke();
		fill(104, 160, 27);
		push();
		translate(gameChar_x - 17, gameChar_y - 23);
		rotate(radians(-20)); // Rotate by -30 degrees
		ellipse(0, 0, 10, 15);
		pop();
		push();
		translate(gameChar_x + 17, gameChar_y - 23);
		rotate(radians(20)); // Rotate by 30 degrees
		ellipse(0, 0, 10, 15);
		pop();
		//Extended Legs
		ellipse(gameChar_x - 11, gameChar_y - 17, 10, 17);
		ellipse(gameChar_x + 11, gameChar_y - 17, 10, 17);
		//Left Foot
		arc(gameChar_x - 12, gameChar_y - 7, 12, 13, PI - 20, PI + 40);
		// Right Foot
		arc(gameChar_x + 12, gameChar_y - 7, 12, 13, PI + 20, PI - 40);
		//Frog body
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x, gameChar_y - 32, 35, 35);
		//eye outlines
		ellipse(gameChar_x - 7, gameChar_y - 45, 17, 17);
		ellipse(gameChar_x + 7, gameChar_y - 45, 17, 17);
		//frog belly
		noStroke()
		fill(212, 242, 141);
		ellipse(gameChar_x, gameChar_y - 24, 25, 18);
		//frog Front legs
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x - 9, gameChar_y - 22, 9, 20);
		ellipse(gameChar_x + 9, gameChar_y - 22, 9, 20);
		//frog eyes
		noStroke();
		fill(255, 255, 255);
		ellipse(gameChar_x - 7, gameChar_y - 45, 15, 15);
		ellipse(gameChar_x + 7, gameChar_y - 45, 15, 15);
		noStroke();
		fill(0, 0, 0);
		ellipse(gameChar_x - 7, gameChar_y - 45, 7, 7);
		ellipse(gameChar_x + 7, gameChar_y - 45, 7, 7);
		noStroke();
		fill(122, 181, 85);
		arc(gameChar_x - 7, gameChar_y - 49, 14, 8, PI, 0);
		arc(gameChar_x + 7, gameChar_y - 49, 14, 8, PI, 0);
		//frog mouth
		noFill();
		stroke(0);
		strokeWeight(1);
		arc(gameChar_x, gameChar_y - 35, 7, 4, 0, PI);
	}
	else {
		// add your standing front facing code
		noStroke();
		fill(104, 160, 27);
		//frog back legs
		push();
		translate(gameChar_x - 17, gameChar_y - 23);
		rotate(radians(-30)); // Rotate by -30 degrees
		ellipse(0, 0, 10, 15);
		pop();
		push();
		translate(gameChar_x + 17, gameChar_y - 23);
		rotate(radians(30)); // Rotate by 30 degrees
		ellipse(0, 0, 10, 15);
		pop();
		//Left Foot
		arc(gameChar_x - 17, gameChar_y - 13, 12, 13, PI, 0);
		// Right Foot
		arc(gameChar_x + 17, gameChar_y - 13, 12, 13, PI, 0);
		//Frog body
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x, gameChar_y - 32, 35, 35);
		//eye outlines
		ellipse(gameChar_x - 7, gameChar_y - 45, 17, 17);
		ellipse(gameChar_x + 7, gameChar_y - 45, 17, 17);
		//frog belly
		noStroke()
		fill(212, 242, 141);
		ellipse(gameChar_x, gameChar_y - 24, 25, 18);
		//frog Front legs
		noStroke();
		fill(122, 181, 85);
		ellipse(gameChar_x - 9, gameChar_y - 22, 9, 20);
		ellipse(gameChar_x + 9, gameChar_y - 22, 9, 20);
		//frog eyes
		noStroke();
		fill(255, 255, 255);
		ellipse(gameChar_x - 7, gameChar_y - 45, 15, 15);
		ellipse(gameChar_x + 7, gameChar_y - 45, 15, 15);
		noStroke();
		fill(0, 0, 0);
		ellipse(gameChar_x - 7, gameChar_y - 45, 7, 7);
		ellipse(gameChar_x + 7, gameChar_y - 45, 7, 7);
		noStroke();
		fill(122, 181, 85);
		arc(gameChar_x - 7, gameChar_y - 49, 14, 8, PI, 0);
		arc(gameChar_x + 7, gameChar_y - 49, 14, 8, PI, 0);
		//frog mouth
		noFill();
		stroke(0);
		strokeWeight(1);
		arc(gameChar_x, gameChar_y - 35, 7, 4, 0, PI);
	}

	//---------------------------
	// Logic to make the game character move or the background scroll.
	//---------------------------

	//Characters faces
	//Conditional statements to move the game character left and right
	if (isLeft == true) {
		gameChar_x -= 5;
	}

	if (isRight == true) {
		gameChar_x += 5;
	}
	// Logic for jumping and falling
	// Remove or modify this section in drawGameCharacter
	if (gameChar_y < floorPos_y + 30) {
		let onPlatform = checkPlatformCollision();
		if (!onPlatform && !isPlummeting) { // Add check for isPlummeting
			gameChar_y += 2; // Gravity
			isFalling = true;
		}
	} else if (!isPlummeting) { // Add check for isPlummeting
		gameChar_y = floorPos_y + 30;
		isFalling = false;
		isJumping = false;
	}
	if (flagpole.isReached == false) {
		checkFlagpole();
	}
}
// Function to check the player dying
function checkPlayerDie() {
	if (gameChar_y > height) {
		lives -= 1;
		if (lives > 0) {
			// Reset character position and keep collected hats
			resetCharacter();
			// Restore collected hats after reset
			hats.forEach(hat => {
				hat.isCollected = false; // Reset all hats
				// Check if hat was previously collected
				if (collectedHats.some(collected => collected.type === hat.type)) {
					hat.isCollected = true; // Keep hat collected if it was before
				}
			});
		}
	}
}
// Function to draw the game scenery
function drawScenery() {

	// Draw mountains
	drawMountains();

	// Draw clouds
	drawClouds();

	// Draw trees
	drawTrees();

	// Draw bushes
	drawBushes()
}

// ------------------------------
// Draw scenery item functions
// ------------------------------

// Draw a mountain
function drawMountain(x, height) {
	// Draw mountain
	fill(100, 100, 100);
	beginShape();
	// Add the first mountain
	// Add the first control point and draw a segment to it.
	curveVertex(x - 92, floorPos_y);
	curveVertex(x - 92, floorPos_y);
	// Add the anchor points.
	curveVertex(x - 25, floorPos_y - 157);
	curveVertex(x + 45, floorPos_y - 157);
	// Add the second control point.
	curveVertex(x + 134, floorPos_y);
	curveVertex(x + 134, floorPos_y);
	// Stop drawing the shape.
	endShape();
	// Drawing Second Mountain
	fill(179, 148, 148);
	beginShape();
	// Add the first control point and draw a segment to it.
	curveVertex(x - 32, floorPos_y);
	curveVertex(x - 32, floorPos_y);
	// Add the anchor points.
	curveVertex(x + 15, floorPos_y - 107);
	curveVertex(x + 65, floorPos_y - 107);
	// Add the second control point.
	curveVertex(x + 144, floorPos_y);
	curveVertex(x + 144, floorPos_y);
	// Stop drawing the shape.
	endShape();
}
// Draw a cloud
function drawCloud(x, y) {
	noStroke();
	fill(255);
	ellipse(x - 40, y - 7, 50, 50);
	ellipse(x - 20, y - 13, 60, 60);
	ellipse(x, y - 17, 70, 70);
	ellipse(x + 20, y - 13, 60, 60);
	ellipse(x + 40, y - 7, 50, 50);
}
// Draw a tree
function drawTree(x, groundLevel) {
	// Tree trunk
	noStroke();
	fill(191, 156, 112);
	rect(x - 20, groundLevel - 150, 40, 150);
	// 3 tiers of tree foliage
	fill(99, 150, 100);
	ellipse(x, groundLevel - 150, 150, 150);
	ellipse(x - 50, groundLevel - 100, 100, 100);
	ellipse(x + 50, groundLevel - 100, 100, 100);
	// Apples on trees
	fill(255, 0, 0);
	ellipse(x, groundLevel - 180, 20, 20);
	ellipse(x - 50, groundLevel - 100, 20, 20);
	ellipse(x + 50, groundLevel - 100, 20, 20);
	// Leaves on apples
	fill(0, 255, 0);
	ellipse(x + 6, groundLevel - 190, 13, 10);
	ellipse(x - 40, groundLevel - 108, 13, 10);
	ellipse(x + 60, groundLevel - 108, 13, 10);
	// Apples on trees
	fill(255, 255, 255);
	ellipse(x - 5, groundLevel - 183, 5, 7);
	ellipse(x - 55, groundLevel - 103, 5, 7);
	ellipse(x + 45, groundLevel - 103, 5, 7);
}
// Draw the bush
function drawBush(x, groundLevel) {
	// Bushes
	noStroke();
	fill(90, 146, 98);
	ellipse(x - 20, groundLevel - 40, 40, 40);
	ellipse(x, groundLevel - 40, 40, 40);
	ellipse(x + 20, groundLevel - 40, 40, 40);
	ellipse(x - 10, groundLevel - 55, 40, 40);
	ellipse(x + 10, groundLevel - 65, 40, 40);
	//cherries on bush
	fill(93, 159, 191);
	ellipse(x - 20, groundLevel - 39, 5, 5);
	ellipse(x, groundLevel - 35, 5, 5);
	ellipse(x + 20, groundLevel - 35, 5, 5);
	ellipse(x - 10, groundLevel - 60, 5, 5);
	ellipse(x + 10, groundLevel - 45, 5, 5);
	ellipse(x + 20, groundLevel - 60, 5, 5);

}
// Draw the toads
function drawToad(x, y, size,) {
	if (toadIsAwake) {
		// Draw legs
		//frog back legs
		noStroke();
		fill(38, 82, 20);
		push();
		translate(x - 70 * size, y + 23 * size);
		rotate(radians(30)); // Rotate by -30 degrees
		ellipse(0, 0, 69 * size, 55 * size);
		pop();
		push();
		translate(x + 70 * size, y + 23 * size);
		rotate(radians(-30)); // Rotate by -30 degrees
		ellipse(0, 0, 69 * size, 55 * size);
		pop();
		//Left Foot
		arc(x - 75 * size, y + 68 * size, 36 * size, 36 * size, PI, 0);
		// Right Foot
		arc(x + 75 * size, y + 68 * size, 36 * size, 36 * size, PI, 0);
		ellipse(x - 60 * size, y + 30 * size, 30 * size, 60 * size);
		ellipse(x + 60 * size, y + 30 * size, 30 * size, 60 * size);

		// Draw body
		fill(34, 139, 34);
		ellipse(x, y, 150 * size, 140 * size);

		// Draw head
		ellipse(x, y - 25 * size, 130 * size, 90 * size);

		// Draw Belly
		fill(212, 242, 141);
		ellipse(x, y + 35 * size, 105 * size, 78 * size);

		// Draw front legs
		fill(34, 139, 34);
		ellipse(x - 50 * size, y + 40 * size, 30 * size, 60 * size);
		ellipse(x + 50 * size, y + 40 * size, 30 * size, 60 * size);

		// Draw eyes
		fill(255);
		ellipse(x - 30 * size, y - 60 * size, 30 * size, 30 * size);
		ellipse(x + 30 * size, y - 60 * size, 30 * size, 30 * size);

		// Draw pupils
		fill(0);
		ellipse(x - 35 * size, y - 60 * size, 20 * size, 20 * size);
		ellipse(x + 35 * size, y - 60 * size, 20 * size, 20 * size);
		fill(34, 139, 34);
		arc(x - 30 * size, y - 65 * size, 30 * size, 30 * size, PI, 0);
		arc(x + 30 * size, y - 65 * size, 30 * size, 30 * size, PI, 0);

		// Draw mouth
		noFill();
		stroke(0);
		strokeWeight(2 * size);
		arc(x, y - 37 * size, 76 * size, 35 * size, 0, PI);

		// Draw spots
		fill(0, 100, 0);
		noStroke();
		ellipse(x + 67 * size, y + 10 * size, 15 * size, 15 * size);
		ellipse(x + 45 * size, y + 13 * size, 10 * size, 10 * size);
		ellipse(x + 55 * size, y - 3 * size, 20 * size, 20 * size);
		ellipse(x - 67 * size, y + 10 * size, 15 * size, 15 * size);
		ellipse(x - 45 * size, y + 13 * size, 10 * size, 10 * size);
		ellipse(x - 55 * size, y - 3 * size, 20 * size, 20 * size);
	}
	else {
		// Draw legs
		//frog back legs
		noStroke();
		fill(38, 82, 20);
		push();
		translate(x - 70 * size, y + 23 * size);
		rotate(radians(30)); // Rotate by -30 degrees
		ellipse(0, 0, 69 * size, 55 * size);
		pop();
		push();
		translate(x + 70 * size, y + 23 * size);
		rotate(radians(-30)); // Rotate by -30 degrees
		ellipse(0, 0, 69 * size, 55 * size);
		pop();
		//Left Foot
		arc(x - 75 * size, y + 68 * size, 36 * size, 36 * size, PI, 0);
		// Right Foot
		arc(x + 75 * size, y + 68 * size, 36 * size, 36 * size, PI, 0);
		ellipse(x - 60 * size, y + 30 * size, 30 * size, 60 * size);
		ellipse(x + 60 * size, y + 30 * size, 30 * size, 60 * size);

		// Draw body
		fill(34, 139, 34);
		ellipse(x, y, 150 * size, 140 * size);

		// Draw head
		ellipse(x, y - 25 * size, 130 * size, 90 * size);

		// Draw Belly
		fill(212, 242, 141);
		ellipse(x, y + 35 * size, 105 * size, 78 * size);

		// Draw front legs
		fill(34, 139, 34);
		ellipse(x - 50 * size, y + 40 * size, 30 * size, 60 * size);
		ellipse(x + 50 * size, y + 40 * size, 30 * size, 60 * size);

		// Draw eyes
		fill(255);
		ellipse(x - 30 * size, y - 60 * size, 30 * size, 30 * size);
		ellipse(x + 30 * size, y - 60 * size, 30 * size, 30 * size);

		// Draw pupils
		fill(0);
		ellipse(x - 35 * size, y - 60 * size, 20 * size, 20 * size);
		ellipse(x + 35 * size, y - 60 * size, 20 * size, 20 * size);
		fill(34, 139, 34);
		arc(x - 30 * size, y - 65 * size, 30 * size, 30 * size, PI, 0);
		arc(x + 30 * size, y - 65 * size, 30 * size, 30 * size, PI, 0);

		// Draw closed eyes
		fill(34, 139, 34);
		ellipse(x - 30 * size, y - 60 * size, 30 * size, 26 * size);
		ellipse(x + 30 * size, y - 60 * size, 30 * size, 26 * size);

		// Draw mouth
		noFill();
		stroke(0);
		strokeWeight(2 * size);
		arc(x, y - 37 * size, 76 * size, 35 * size, 0, PI);

		// Draw spots
		fill(0, 100, 0);
		noStroke();
		ellipse(x + 67 * size, y + 10 * size, 15 * size, 15 * size);
		ellipse(x + 45 * size, y + 13 * size, 10 * size, 10 * size);
		ellipse(x + 55 * size, y - 3 * size, 20 * size, 20 * size);
		ellipse(x - 67 * size, y + 10 * size, 15 * size, 15 * size);
		ellipse(x - 45 * size, y + 13 * size, 10 * size, 10 * size);
		ellipse(x - 55 * size, y - 3 * size, 20 * size, 20 * size);
	}
}
// Add new function to draw patrolling toads
function drawPatrollingToads() {
	let originalToadState = toadIsAwake;
	// Making sure these toads are drawn awake
	for (let toad of patrollingToads) {
		toad.update();
		// Set toad to awake before drawing
		toadIsAwake = true;
		// Draw the toad
		drawToad(toad.x, toad.y, toad.size);
	}

	// Restore the original state for regular toads
	toadIsAwake = originalToadState;
}

//-------------------------
// Key control functions
//-------------------------

// Function to handle the key press event
function keyPressed() {
	// Handle start screen
	if (gamestart === true && keyCode === ENTER) {
		gamestart = false;
		startGame();
		return;
	}
	// Handle game over state first
	if (gameOver && keyCode == 32) { // SPACE key
		lives = 3;
		game_score = 0;
		gameOver = false;
		levelComplete = false;
		startGame();
		return;
	}
	// Handle level complete state
	if (levelComplete && keyCode == 32) {
		levelComplete = false;
		flagpole.isReached = false;
		levelCompleteAlpha = 0;
		lives = 3;
		startGame();
		gameOver = false; // Reset game over flag
		levelComplete = false; // Reset level complete flag
		return;
	}
	// If statements to control the animation of the character when keys are pressed.
	// Prevent movement if character is plummeting
	if (!isPlummeting) {
		if (gameChar_y < floorPos_y + 30) {
			gameChar_y += 2; // Gravity
			isFalling = true;
		} else {
			isFalling = false;
		}
		if (keyCode == 37) {
			isLeft = true;
		}
		if (keyCode == 39) {
			isRight = true;
		}
		// Check if character can jump (on ground or platform)
		let onPlatform = checkPlatformCollision();
		if (keyCode == 32 && (gameChar_y == floorPos_y + 30 || onPlatform) && !isJumping) {
			isJumping = true;
			gameChar_y -= 100;
			jumpSound.play();
		}
		if (gameOver || levelComplete) {
			return;
		}
	}
	// Check for space key to restart the game
	if (keyCode == 32 && gameOver) { // 32 is the keyCode for the space key
		startGame(); // Restart the game
		lives = 3; // Reset lives
		game_score = 0; // Reset score
		gameOver = false; // Reset game over flag
		levelComplete = false; // Reset level complete flag
	}
}
// Function to handle the key release event
function keyReleased() {
	// if statements to control the animation of the character when keys are released.
	if (keyCode == 37) {
		isLeft = false;
	}
	if (keyCode == 39) {
		isRight = false;
	}
	if (keyCode == 32) {
		isJumping = false;
	}
	if (gameOver || levelComplete) {
		return; // Stop player input if game is over or level is complete
	}
}

//---------------------------
// Scenery rendering functions
//---------------------------

//Draw Clouds and Move them
function drawClouds() {
	// Draw clouds.
	for (var i = 0; i < clouds.length; i++) {
		var cloud = clouds[i];
		drawCloud(cloud.x, cloud.y);
		cloud.x += cloud.speed; // Move the cloud based on its speed

		// Reset cloud position if it goes off screen
		if (cloud.x > width + 100) {
			cloud.x = -2660;
		}
	}
}
// Function to draw mountains out
function drawMountains() {
	// Draw mountains.
	for (var i = 0; i < mountains.length; i++) {
		var mountain = mountains[i];
		drawMountain(mountain.x, mountain.height);
	}
}
// Functions to draw trees
function drawTrees() {
	// Draw trees.
	for (var i = 0; i < trees_x.length; i++) {
		drawTree(trees_x[i], floorPos_y); // Call tree-drawing function
	}
}
// Function to draw bushes
function drawBushes() {
	// Draw bushes.
	for (var i = 0; i < bushes_x.length; i++) {
		drawBush(bushes_x[i], floorPos_y + 22); // Call bush-drawing function
	}
}
// Function to Draw Toads that are sleeping
function drawToads() {
	// Draw toads
	for (var i = 0; i < toads.length; i++) {
		drawToad(toads[i].x, toads[i].y, toads[i].size);
	}
}
// Moving awake toads constructor function
function PatrollingToad(x, y, size, platform) {
	this.x = x;
	this.y = y - 20; // Offset to place toad on platform
	this.size = size;
	this.platform = platform;
	this.direction = 1;
	this.speed = 2;
	this.isAwake = true;

	// Define start and end positions based on platform
	this.startX = platform.x + 20;
	this.endX = platform.x + platform.length - 20;

	this.update = function () {
		// Move toad back and forth
		this.x += this.direction * this.speed;

		// Change direction at platform edges
		if (this.x >= this.endX) {
			this.direction = -1;
		} else if (this.x <= this.startX) {
			this.direction = 1;
		}
	};
}
// Function to draw Canyons
function drawCanyon(t_canyon) {
	// Draw the canyon
	noStroke();
	fill(174, 219, 255,);
	rect(t_canyon.x_pos, floorPos_y, t_canyon.width, height - floorPos_y);
}
// Function to check the canyons 
function checkCanyon(t_canyon) {
	// Define character width for more precise collision
	let charWidth = 35; // Width of your frog character
	let charCenterX = gameChar_x;
	let charLeftEdge = charCenterX - charWidth / 2;
	let charRightEdge = charCenterX + charWidth / 2;

	// Check if character is mostly over canyon (more than 50% of width)
	let overCanyon =
		charLeftEdge + (charWidth * 0.3) > t_canyon.x_pos &&
		charRightEdge - (charWidth * 0.3) < t_canyon.x_pos + t_canyon.width;

	if (overCanyon && gameChar_y >= floorPos_y + 30) {
		isPlummeting = true;
		fallIntoCanyonSound.stop();
		fallIntoCanyonSound.play();

		// Lock x position while falling to prevent sliding
		if (isPlummeting) {
			gameChar_x = constrain(
				gameChar_x,
				t_canyon.x_pos + charWidth / 2,
				t_canyon.x_pos + t_canyon.width - charWidth / 2
			);
		}
	}

	// Add falling motion when plummeting
	if (isPlummeting) {
		gameChar_y += 2; // Falling speed
		isLeft = false;  // Disable left/right movement while falling
		isRight = false;
	}
}
// Function to draw the ground character walks on
function drawGround(offsetX) {
	let tileWidth = 1024; // The width of each tile
	let numTiles = 3; // Number of tiles to draw for seamless scrolling

	// Draw repeated ground tiles
	for (let i = -1; i < numTiles; i++) {
		let offsetX = i * tileWidth; // Offset for each tile
		noStroke();
		fill(150, 214, 180);
		rect(offsetX - cameraPosX % tileWidth, floorPos_y, tileWidth, height - floorPos_y);
	}
}

//---------------------------
// Collectable render and check functions
//---------------------------

// Draw the collectable items
function drawCollectable(t_collectable) {
	// Calculate new position based on angle
	let radius = 20; // Radius of the circular motion
	let newX = t_collectable.x_pos + radius * cos(t_collectable.angle);
	let newY = t_collectable.y_pos + radius * sin(t_collectable.angle);

	// Draw the fly body
	noStroke();
	fill(0, 0, 0);
	ellipse(newX, newY, t_collectable.size + 3, 10);
	// Draw the fly wings
	stroke(1);
	fill(197, 213, 222);
	ellipse(newX + 3, newY - 6, t_collectable.size - 4, 8);
	ellipse(newX - 1, newY - 6, t_collectable.size - 4, 8);
	// Draw fly eyes
	fill(255);
	ellipse(newX - 4, newY, 6, 6);
	fill(0);
	ellipse(newX - 4, newY, 2, 2);
}
// Function to check the frog collecting flies
function checkCollectable(t_collectable) {
	if (!isPlummeting) {
		// Draw the collectable item
		if (!t_collectable.isFound) {
			drawCollectable(t_collectable);
		}

		// Check for collectable interaction
		if (dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 50) {
			t_collectable.isFound = true;
			game_score += 1;
			collectedFlySound.play();
		}
	}
}
// Function to draw the flagpole
function renderFlagpole() {
	push();
	stroke(255, 255, 255);
	strokeWeight(5);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
	noStroke();
	if (flagpole.isReached) {
		fill(95, 161, 87);
		rect(flagpole.x_pos, floorPos_y - 250, 50, 50); // Move flag to the top
	} else {
		fill(255, 0, 0);
		rect(flagpole.x_pos, floorPos_y - 50, 50, 50); // Flag at the bottom
	}
	pop();
}
// Function to check the flagpole and character
function checkFlagpole() {
	var d = abs(gameChar_x - flagpole.x_pos);
	if (d < 15) {
		flagpole.isReached = true;
		// Add delay before showing level complete
		setTimeout(() => {
			levelComplete = true;
		}, 400); // 400 milliseconds = 2 seconds delay
	}
}
// Function for toad to wake up if frog touches it
function checkToadCollision() {
	for (let i = 0; i < toads.length; i++) {
		let t = toads[i];
		if (dist(gameChar_x, gameChar_y, t.x, t.y + 30) < 50) { // Adjust the distance
			toadIsAwake = true;
			toadIsAsleep = false;
			awakeToadSound.stop();
			awakeToadSound.play();
			// Reduce lives if the toad is awake
			setTimeout(() => {
				if (toadIsAwake) {
					lives -= 1;
					// Reset the toad state after collision
					toadIsAwake = false;
					toadIsAsleep = true;
					resetCharacter();
				}
			}, 150); // 150 milliseconds = 2 seconds delay
		}
	}
}
// Add collision check for patrolling toads
function checkPatrollingToadCollision() {
	for (let toad of patrollingToads) {
		if (dist(gameChar_x, gameChar_y, toad.x, toad.y + 30) < 50) {
			lives -= 1;
			awakeToadSound.play();
			if (lives > 0) {
				resetCharacter();
			}
		}
	}
}

//---------------------------
// Platform functions
//---------------------------

// Function to draw the platforms
function drawPlatform(platform) {
	fill(139, 69, 19); // Brown color for the platform
	noStroke();
	rect(platform.x, platform.y, platform.length, 10); // Draw the platform
}
// The Check Platform Collision function
function checkPlatformCollision() {
	let onPlatform = false;
	for (let i = 0; i < platform.length; i++) {
		let p = platform[i];
		if (gameChar_x > p.x && gameChar_x < p.x + p.length) {
			if (gameChar_y >= p.y - 10 && gameChar_y <= p.y + 20) {
				gameChar_y = p.y + 15; // Snap character to platform
				onPlatform = true;
				isFalling = false;
				isJumping = false; // Reset jumping state when landing
			}
		}
	}
	return onPlatform;
}
// Function to create a platform
function createPlatform(x, y, length) {
	return { x: x, y: y, length: length };
}

// ---------------------
// Game Character Hats
// ---------------------

// Function to draw and check all hats
function drawAndCheckHats() {
	for (let hat of hats) {
		// Only draw hat if not collected
		if (!hat.isCollected) {
			switch (hat.type) {
				case 'tophat':
					drawTopHat(hat.x, hat.y, hat.size);
					break;
				case 'beret':
					drawBeret(hat.x, hat.y, hat.size);
					break;
				case 'policehat':
					drawPoliceHat(hat.x, hat.y, hat.size);
					break;
				case 'cowboyhat':
					drawCowboyHat(hat.x, hat.y, hat.size);
					break;
				case 'hardhat':
					drawHardHat(hat.x, hat.y, hat.size);
					break;
			}

			// Check if character collects hat
			if (dist(gameChar_x, gameChar_y, hat.x, hat.y + 30) < 50) {
				hat.isCollected = true;
				currentHat = hat;
				if (!collectedHats.includes(hat)) {
					collectedHats.push(hat);
					collectedHatSound.setLoop(false);
					collectedHatSound.play();
				}
			}
		}
	}

	// Draw current hat on character if one is equipped
	if (currentHat) {
		let hatX = gameChar_x - 10;
		let hatY = gameChar_y - 77;

		switch (currentHat.type) {
			case 'tophat':
				drawTopHat(hatX, hatY, 0.5);
				break;
			case 'beret':
				drawBeret(hatX - 3, hatY + 14, 0.5);
				break;
			case 'policehat':
				drawPoliceHat(hatX, hatY + 10, 0.5);
				break;
			case 'cowboyhat':
				drawCowboyHat(hatX - 8, hatY + 13, 0.7);
				break;
			case 'hardhat':
				drawHardHat(hatX - 6, hatY + 10, 0.6);
				break;
		}
	}
}
// Function to draw frogs tophat
function drawTopHat(x, y, size) {
	// Draw the main part of the hat
	fill(30, 30, 60);
	noStroke();
	rect(x, y, 40 * size, 50 * size, 5);

	// Draw the hat band
	fill(100, 100, 150);
	rect(x, y + 15 * size, 40 * size, 10 * size);

	// Draw the brim of the hat
	fill(20, 20, 40);
	rect(x - 10 * size, y + 45 * size, 60 * size, 10 * size, 5);
}
// Function to draw the frog beret
function drawBeret(x, y, size) {
	// Draw the main part of the hat
	fill(200, 0, 0);
	noStroke();
	beginShape();
	vertex(x + 5 * size, y + 15 * size);
	bezierVertex(x + 20 * size, y, x + 30 * size, y, x + 45 * size, y + 15 * size);
	vertex(x + 40 * size, y + 25 * size);
	vertex(x + 10 * size, y + 25 * size);
	endShape(CLOSE);
	// Top of beret
	fill(0);
	ellipse(x + 25 * size, y + 5 * size, 5 * size, 10 * size);
}
// Function to draw the frog police hat
function drawPoliceHat(x, y, size) {
	// Draw the main part of the hat
	fill(50, 50, 200);
	noStroke();
	arc(x + 20 * size, y + 15 * size, 60 * size, 40 * size, PI, 0);
	rect(x + 5 * size, y + 10 * size, 30 * size, 10 * size);

	// Draw the badge
	fill(255, 215, 0);
	ellipse(x + 20 * size, y + 10 * size, 10 * size, 10 * size);
	stroke(255, 215, 0);
	line(x + 10 * size, y + 10 * size, x + 30 * size, y + 10 * size);

	// Draw the hat band
	fill(0, 0, 150);
	rect(x + 5 * size, y + 20 * size, 30 * size, 5 * size);

	// Draw the hat brim
	fill(50, 50, 200);
	arc(x + 20 * size, y + 25 * size, 60 * size, 20 * size, 0, PI);
}
// Function to draw the frog cowboy hat
function drawCowboyHat(x, y, size) {
	// Draw the brim of the hat
	fill(150, 100, 50);
	noStroke();
	beginShape();
	vertex(x + 0 * size, y + 10 * size);
	bezierVertex(x + 10 * size, y - 10 * size, x + 40 * size, y - 10 * size, x + 50 * size, y + 10 * size);
	vertex(x + 40 * size, y + 20 * size);
	vertex(x + 10 * size, y + 20 * size);
	endShape(CLOSE);

	// Draw the top part of the hat
	fill(150, 100, 50);
	beginShape();
	vertex(x + 10 * size, y + 10 * size);
	bezierVertex(x + 15 * size, y - 20 * size, x + 35 * size, y - 20 * size, x + 40 * size, y + 10 * size);
	vertex(x + 40 * size, y + 20 * size);
	vertex(x + 10 * size, y + 20 * size);
	endShape(CLOSE);

	// Draw the hat band
	fill(100, 50, 0);
	rect(x + 10 * size, y + 10 * size, 30 * size, 5 * size);

	// Draw the hat band details
	fill(255, 215, 0);
	ellipse(x + 15 * size, y + 12.5 * size, 5 * size, 5 * size);
	ellipse(x + 35 * size, y + 12.5 * size, 5 * size, 5 * size);
}
// Function to draw the frog hard hat
function drawHardHat(x, y, size) {
	fill(255, 200, 0);
	noStroke();
	arc(x + 25 * size, y + 15 * size, 50 * size, 30 * size, PI, 0);

	// Draw the brim of the hat
	fill(255, 200, 0);
	rect(x + 0 * size, y + 15 * size, 50 * size, 10 * size);

	// Draw the segment lines
	stroke(255, 150, 0);
	strokeWeight(2 * size);
	line(x + 10 * size, y + 15 * size, x + 40 * size, y + 15 * size);
	line(x + 25 * size, y + 15 * size, x + 25 * size, y + 0 * size);

	// Draw the rivets
	fill(255, 150, 0);
	noStroke();
	ellipse(x + 10 * size, y + 20 * size, 5 * size, 5 * size);
	ellipse(x + 40 * size, y + 20 * size, 5 * size, 5 * size);
	ellipse(x + 25 * size, y + 20 * size, 5 * size, 5 * size);
}