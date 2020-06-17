/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');

let io = null;
let users = {};

let other = {};
let targets = 0; 
let gameTime = {
    players: {},
    playedRounds: 0,
    score: {},
    reaction: {}
}

let scoreboard = {};
/**
 * Get usernames of online users
 */
function getOnlineUsers() {
	return Object.values(users);
}

//start new game
function start(socket, id) {
	console.log('create a game ', users[socket.id]);
	
    if (gameTime.playedRounds < 10) {
        console.log('Played rounds: ', gameTime.playedRounds)
    } else {
		scoreboard[gameTime.players[id]] = gameTime.score[id];
        io.emit('game-over', scoreboard);
        gameTime.playedRounds = 0;
		console.log("game over");
		gameRestart();
        return;
    }

};

function randomPosition (range) {
	return Math.floor(Math.random() * range);
};

function usersClick(username) {
	console.log(username, "clicked")
		const click = {
			width: randomPosition(500),
			height: randomPosition(700)
		}
		
		const delay = randomPosition(2000);
		
		const clickDelay = {
			click,
			delay,
		};

		// Emit new image
		io.emit('user-click', clickDelay);
};


function updateScoreBoard(id) {
	scoreboard[gameTime.players[id]] = gameTime.score[id];
	console.log('update result', scoreboard);

	io.emit('update-score-board', scoreboard);
}

function reactiontime(playerInfo) {
	gameTime.reaction[playerInfo.id] = playerInfo.reactiontime;
	compareReactionTimes(this);
	targets++;
};

function compareReactionTimes(socket) {
    if (targets) {
        if (gameTime.reaction[socket.id] < other.reaction) {
            gameTime.score[socket.id]++;
            updateScoreBoard(socket.id); 
        } else if (gameTime.reaction[socket.id] > other.reaction) {
            gameTime.score[other.id]++;
            updateScoreBoard(other.id); 
        }
    } else { 
        other = {
            id: [socket.id], 
            reaction: gameTime.reaction[socket.id]
        }
        return;
    }
    gameTime.score;
    targets = 0;
    gameTime.playedRounds++;
 
    start(socket);
};

// Restart 
const gameRestart = () => {
	users = {};
     gameTime = {
		players: {},
		playedRounds: 0,
		score: {},
		reaction: {}
	}
    scoreboard = {};
}


/**
 * Handle user disconnecting
 */
function handleUserDisconnect() {
	debug(`Socket ${this.id} left the chat :(`);

	// broadcast to all connected sockets that this user has left the chat
	if (gameTime.players[this.id]) {
        if (users[this.id]) {
            this.broadcast.emit('user-disconnected', users[this.id]);
        }
        gameRestart();
    }
	// remove user from list of connected users
	delete users[this.id];
}

function checkUsersOnline(socket) {
    if (Object.keys(users).length === 2) {
        gameTime.score[socket.id] = 0;
		scoreboard[gameTime.players[socket.id]] = 0;

		io.emit('update-score-board', scoreboard);
        io.emit('create-game-page');
        
        console.log(users[socket.id] + ' started the game');
        console.log('players of the game: ', gameTime.players);

        start(socket);
    } else {
		gameTime.score[socket.id] = 0;
		scoreboard[gameTime.players[socket.id]] = 0;
        return;
    }
}



/**
 * Handle a new user connecting
 */
function handleRegisterUser(username, callback) {
	debug("User '%s' connected to the chat", username);
	users[this.id] = username;
	gameTime.players[this.id] = username;
	callback({
		joinChat: true,
		usernameInUse: false,
		onlineUsers: getOnlineUsers(),
	});

	checkUsersOnline(this);

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('new-user-connected', username);

	// broadcast online users to all connected sockets EXCEPT ourselves
	this.broadcast.emit('online-users', getOnlineUsers());
}

module.exports = function(socket) {
	// this = io
	io = this;
	debug(`Client ${socket.id} connected!`);

	
	socket.on('disconnect', handleUserDisconnect);
	socket.on('user-click', usersClick);
	socket.on('register-user', handleRegisterUser);
	socket.on('user-click', reactiontime);
}
