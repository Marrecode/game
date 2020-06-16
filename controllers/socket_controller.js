/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');

let io = null;
const users = {};

let game = {
    players: {},
    playedRounds: 0,
    score: {},
    reaction: {}
}

/**
 * Get usernames of online users
 */
function getOnlineUsers() {
	return Object.values(users);
}

//start new game
function startNewGame(socket) {
    console.log('creating one game from user: ', users[socket.id]);
        
    if (game.playedRounds < 10) {
        socket.emit('get-available-space', socket.id);
        console.log('Played rounds: ', game.playedRounds)
    } else {
        io.emit('game-over', game.players, game.score);
        game.playedRounds = 0;
    
        console.log("game over");
        return;
    }

};


/**
 * Handle user disconnecting
 */
function handleUserDisconnect() {
	debug(`Socket ${this.id} left the chat :(`);

	// broadcast to all connected sockets that this user has left the chat
	if (users[this.id]) {
		this.broadcast.emit('user-disconnected', users[this.id]);
	}

	// remove user from list of connected users
	delete users[this.id];
}

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

function checkUsersOnline(socket) {
    if (Object.keys(users).length === 2) {
        game.score[socket.id] = 0;

        io.emit('create-game-page');
        
        console.log(users[socket.id] + ' started the game');
        console.log('players of the game: ', game.players);

        startNewGame(socket);
    } else {
        return;
    }
}


/**
 * Handle a new user connecting
 */
function handleRegisterUser(username, callback) {
	debug("User '%s' connected to the chat", username);
	users[this.id] = username;
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
}
