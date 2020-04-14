var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, "gameDiv");

var resizeTimeout;
window.addEventListener('resize', function(event) {
      clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function(){
            window.location.reload();

    }, 50);

});

var mainState = {

    preload: function () {
        if (!game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.setMinMax(game.width / 2, game.height / 2, game.width, game.height);
        }

        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', 'assets/tuxbird.png');
        game.load.image('column', 'assets/wincolumn.png');

        // Load the jump sound
        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.columns = game.add.group();
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.bird = game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;

        // New anchor position
        this.bird.anchor.setTo(-0.2, 0.5);

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onDown.add(this.jump, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

        // Add the jump sound
        this.jumpSound = game.add.audio('jump');
        this.jumpSound.volume = 0.2;
    },

    update: function () {
        if (this.bird.y < 0 || this.bird.y > game.world.height)
            this.restartGame();

        game.physics.arcade.overlap(this.bird, this.columns, this.hitPipe, null, this);

        // Slowly rotate the bird downward, up to a certain point.
        if (this.bird.angle < 20)
            this.bird.angle += 1;
    },

    jump: function () {
        // If the bird is dead, he can't jump
        if (this.bird.alive == false)
            return;

        this.bird.body.velocity.y = -350;

        // Jump animation
        game.add.tween(this.bird).to({ angle: -20 }, 100).start();

        // Play sound
        this.jumpSound.play();
    },

    hitPipe: function () {
        // If the bird has already hit a column, we have nothing to do
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new columns from appearing
        game.time.events.remove(this.timer);

        // Go through all the columns, and stop their movement
        this.columns.forEach(function (p) {
            p.body.velocity.x = 0;
        }, this);
    },

    restartGame: function () {
        game.state.start('main');
    },

    addOnePipe: function (x, y) {
        var column = game.add.sprite(x, y, 'column');
        this.columns.add(column);
        game.physics.arcade.enable(column);

        column.body.velocity.x = -200;
        column.checkWorldBounds = true;
        column.outOfBoundsKill = true;
    },

    addRowOfPipes: function () {
        var hole = Math.floor(Math.random() * 5) + 1;

        for (var i = 0; i < window.innerHeight; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(window.innerWidth, i * 60 );

        this.score += 1;
        this.labelScore.text = this.score;
    },
};

game.state.add('main', mainState);
game.state.start('main');