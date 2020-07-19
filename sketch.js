var gameState, previousState, monkey, invisibleGround, obstacleGroup, bananaGroup, restart, gameOver, score, life, framesElapsedInInitialState, framesElapsedTillLoseState, frameCount2, bananasCollected;

var scene_img, monkey_running, banana_img, obstacle_img, restart_img, gameOver_img;

var jumpSound, collectSound, collisionSound;

var monkeyY = 307; //this variable will ensure that the monkey jumps only one time

var monkeySize = 1;

function preload() {
  //Loading the images
  scene_img = loadImage("scene2.png");
  banana_img = loadImage("banana.png");
  obstacle_img = loadImage("stone.png");
  restart_img = loadImage("restart.png");
  gameOver_img = loadImage("gameOver.png");

  //Loading the animations
  monkey_running = loadAnimation("monkey_01.png", "monkey_02.png", "monkey_03.png", "monkey_04.png", "monkey_05.png", "monkey_06.png", "monkey_07.png", "monkey_08.png", "monkey_09.png", "monkey_10.png");

  //Loading the sounds
  jumpSound = loadSound("jump.mp3");
  collectSound = loadSound("clicky_crunch.mp3");
  collisionSound = loadSound("Ouch.mp3");
}

function setup() {
  createCanvas(400, 398);

  gameState = "displayRules"; //The initial state
  previousState = "displayRules"; //A special variable that stores the previous state

  //Creates the background
  scene = createSprite(200, 199, 400, 400);
  scene.addImage(scene_img);
  scene.x = scene.width / 2;
  scene.velocityX = -6;

  //Draws the monkey
  monkey = createSprite(50, 340, 50, 50);
  monkey.addAnimation("running", monkey_running);
  monkey.frameDelay = 2;
  monkey.scale = 0.1;
  monkey.setCollider("rectangle", 0, 0, 400, 490, 15); //Sets the collider radius of the monkey
  //monkey.debug = true;

  //Draws an invisible ground with which the monkey will collide 
  invisibleGround = createSprite(200, 340, 400, 2);
  invisibleGround.visible = false; //Makes the ground invisible

  //Create the obstacle and the banana group
  obstacleGroup = new Group();
  bananaGroup = new Group();

  //Creates the restart button
  restart = createSprite(200, 200, 10, 10);
  restart.addImage(restart_img);
  restart.scale = 0.6;
  restart.visible = false; //makes it invisible as it has to be visible in the lose state only

  //Creates the gameover sprite
  gameOver = createSprite(200, 160, 20, 20);
  gameOver.addImage(gameOver_img);
  gameOver.scale = 0.7;
  gameOver.visible = false;

  score = 0; //The variable for storing the score 
  life = 2; //the lives of the monkey that are remaining 

  var heading = "Welcome!";
  var text1 = "This is a monkey runner game. In this game, a monkey \nhas escaped from the zoo and is very hungry. ";
  var text2 = "You have to \nfeed him the bananas by making him jump. But be careful! ";
  var text3 = "\nThere are some obstacles also that you have to save the \nmonkey from colliding into. ";
  var text4 = "To make the monkey jump, \npress the space bar. ";
  var text5 = "All the best!";
  var information2 = "CLICK ANYWHERE ON THIS SCREEN TO CONTINUE.";
  /*Here, multiple strings are created because had this text been written in a single variable, that line 
  would have become too long to scroll*/
  // "\n" means a line break

  var information = text1 + text2 + text3 + text4 + text5; //concatenates the strings

  //displays the information regarding the game
  if (gameState == "displayRules") {
    background("blanchedAlmond");
    displayInformation(heading, 22, 170, 25);
    displayInformation(information, 16, 5, 50);
    displayInformation(information2, 14, 10, 380);
  }

  framesElapsedInInitialState = 0;
  framesElapsedTillLoseState = 0; //Number of frames elapsed till the game goes in play state after the lose state
  frameCount2 = 0; //A variable which is a kind of frameCount that can reset its value to 0

  bananasCollected = 0; //variable that stores the number of bananas collected
}

function draw() {
  //Makes the gameState play when user clicks anywhere on the screen
  if (mouseDown() && gameState == "displayRules") {
    //gameState=="displayRules" ensures that this only happens when the user is in dispayRules state and not in the rest of the game
    framesElapsedInInitialState = frameCount; //This will record the number of frames elapsed when the user goes in play state
    gameState = "play";
  }

  if (monkey.isTouching(invisibleGround)) {
    setMonkeyY(); //calculates a threshold value above which the monkey can't jump. This value keeps on changing as the monkey grows bigger or smaller
  }

  monkey.collide(invisibleGround); //prevents the monkey from falling down

  if (gameState == "play") {

    if (previousState == "displayRules") {
      //This condition only executes when the user goes in play state for the first time
      frameCount2 = frameCount - framesElapsedInInitialState; //Resets the frameCount
    } else if (previousState == "lose") {
      //This condition will execute after the user goes in play state after the lose state
      frameCount2 = frameCount - framesElapsedTillLoseState; //Resets the frameCount
    }

    if (scene.x < 0) {
      //Gives a moving kind of illusion
      scene.x = scene.width / 2;
    }

    if (frameCount2 % 150 == 0) {
      //Draws the rocks after every 150 frames
      drawObstacles();
    }

    if (frameCount2 % 90 == 0) {
      //Draws the bananas after every 90 frames
      drawBananas();
    }

    if (monkey.y > monkeyY) {
      //Gives the monkey animation when it is on the ground
      monkey.play();
    }

    if (keyDown("space") && monkey.y > monkeyY) {
      //makes the monkey jump
      monkey.velocityY = -10;
      jumpSound.play();
      monkey.pause(); //Stops the monkey's animation when it is in the air
    }

    monkey.velocityY += 0.5; //Adding gravity

    if (obstacleGroup.isTouching(monkey)) {
      //Makes the gameState lose when the rock touches the monkey
      collisionSound.play();
      monkey.velocityY = 0; //This will prevent the monkey from flying if it touches the obstacle while jumping
      monkey.x += 100; //This will make sure that the obstacle touches the monkey only one time 
      decreaseSize(); //decreases the size of the monkey
    }

    if (bananaGroup.isTouching(monkey)) {
      //Increases the number of bananas collected after the monkey touches the banana
      bananaGroup.destroyEach();
      collectSound.play();
      bananasCollected++;
      monkeySize++; //this variable will grow the size of the monkey

      switch (bananasCollected) {
        case bananasCollected:
          monkey.scale = 0.1 + (monkeySize / 300); //makes the monkey grow 
          break;

        default:
          break;
      }
    }

    scene.velocityX = -1 * (6 + 2 * score / 100); //Makes the scene move faster as the score increases

    score = score + Math.round(getFrameRate() / 60); //Increases the score

  }

  if (gameState == "lose") {
    scene.velocityX = 0; //Stops the background from moving
    obstacleGroup.setVelocityXEach(0); //Stops the obstacles from moving
    obstacleGroup.setLifetimeEach(-1); //Assigns a negative lifetime to the obstacles (which it will never reach) 
    bananaGroup.setVelocityXEach(0);
    bananaGroup.setLifetimeEach(-1);
    monkey.pause(); //Stops the animation for the monkey
    restart.visible = true;
    gameOver.visible = true;
    if (mousePressedOver(restart)) {
      //restarts the game when the user clicks on the restart icon
      reset();
    }
  }

  if (gameState != "displayRules") {
    //Information to be displayed while the game is in any other state than displayRules
    drawSprites();
    displayInformation("Score: " + score, 18, 230, 50);
    displayInformation("Bananas Collected: " + bananasCollected, 18, 230, 70);
    
    if (gameState != "lose") {
      displayInformation("Lives remaining: " + life, 18, 230, 90);
    }

  }
}

function displayInformation(information, size, coordinateX, coordinateY) {
  //Function which allows us to format the text in one line
  fill("black");
  textSize(size);
  textFont("cursive");
  text(information, coordinateX, coordinateY);
}

function drawObstacles() {
  //function for drawing the obstacles
  var obstacle = createSprite(420, 320);
  obstacle.addImage(obstacle_img);
  obstacle.scale = 0.15;
  obstacle.velocityX = -1 * (6 + 2 * score / 100); //Makes the obstacle move along with the scene
  monkey.depth = obstacle.depth + 1; //Makes the monnkey appear over the obstacl
  obstacle.setCollider("circle", 0, 0, 150);
  //obstacle.debug = true;
  obstacle.lifetime = Math.round(420 / (obstacle.velocityX * -1)); //Assigns lifetime to prevent memory leak
  obstacleGroup.add(obstacle);
}

function drawBananas() {
  //function for drawing the bananas
  var banana = createSprite(420, random(200, 260));
  banana.addImage(banana_img);
  banana.scale = 0.07;
  banana.velocityX = -1 * (6 + 2 * score / 100);
  banana.rotation = random(0, 360); //randomely rotates the banana
  monkey.depth = banana.depth + 1;
  restart.depth = banana.depth + 1; //Makes the restart icon appear over the banana
  banana.setCollider("circle", 0, -200, 550);
  //banana.debug = true;
  banana.lifetime = Math.round(420 / (banana.velocityX * -1));
  bananaGroup.add(banana);
}

function decreaseSize() {
  //function for decreasing the size of the monkey
  life--;

  //switch statement for reducing the size of monkey according to the lives remaining
  switch (life) {
    case 1:
      monkey.scale = 0.083;
      break;

    case 0:
      monkey.scale = 0.07;
      break;

    case -1:
      monkey.scale = 0.07;
      gameState = "lose"; //makes the gameState lose when there is no life remaining
      break;

    default:
      break;
  }
  monkeySize = monkey.scale;
}

function setMonkeyY() {
  monkeyY = monkey.y - 1; //this will set the threshold value above which the monkey cannot jump
}

function reset() {
  //function for resetting the game
  gameState = "play";
  framesElapsedTillLoseState = frameCount;
  /*This will count the number of frames elapsed when the user goes into the 
      play state after resetting the game*/
  previousState = "lose";
  //initializes the values
  scene.x = scene.width / 2;
  frameCount2 = 0;
  obstacleGroup.destroyEach();
  bananaGroup.destroyEach();
  score = 0;
  bananasCollected = 0;
  monkeySize = 1;
  life = 2;
  monkey.scale = 0.1;
  monkey.x = 50;
  restart.visible = false;
  gameOver.visible = false;
}