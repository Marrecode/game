const socket = io();

const startEl = document.querySelector('#start');
const usernameForm = document.querySelector('#username-form');
const gamefield = document.querySelector('#game-field');
const board = document.querySelector('#gamingboard');
const image = document.getElementById('playimg');
const waitingRoom = document.querySelector('#waiting');
const gameOver = document.querySelector('#game-over');
const scoreOver = document.querySelector('#game-score')
const restart = document.querySelector('#restart')

let username = null;
let timer = null;

let playersInfo = {
    id: null,
    reactiontime: null,
};



const addNoticeToChat = (notice) => {
	const noticeEl = document.createElement('li');
	noticeEl.classList.add('list-group-item', 'list-group-item-light', 'notice');

	noticeEl.innerHTML = notice;
}

const showWaitingRoom = () => {
    waitingRoom.classList.add('hide');
    gamefield.classList.remove('hide');
}

const updateOnlineUsers = (users) => {
	document.querySelector('#online-users').innerHTML = users.map(user => `<li class="user">${user}</li>`).join("");
}

const updateScore = (scoreboard) => {
    document.querySelector('#score').innerHTML = Object.entries(scoreboard).map(([key, value]) => {
        console.log(`${key}: ${value}`)
        return `<li class="list-group-item users">${key}: ${value}</li>`
    }).join('');
};

//fixa
const closeTheRoom = (scoreboard) => {
	document.querySelector('#game-score').innerHTML = Object.entries(scoreboard).map(([key, value]) => {
        console.log(`${key}: ${value}`)
        return `<li class="list-group-item users">${key}: ${value} points</li>`
	}).join('');

	gamefield.classList.add('hide');
	gameOver.classList.remove('hide');
}

//

const randomClick = (clickDelay) => {
	setTimeout(() => {
		timer = Date.now();
		randomPosition(clickDelay.click)
	}, clickDelay.delay);
}

const randomPosition = (target) => {
	image.style.top = target.width + "px";
	image.style.left = target.height + "px";
};

image.addEventListener('click', e => {
	let clickedTime = Date.now();
	reactiontime = clickedTime - timer;
	console.log(Date.now())
	
	let username = {
        id: socket.id,
        reactiontime,
    }
	socket.emit('user-click', username)
	console.log('hej', username);
})

restart.addEventListener('click', e => {
	e.preventDefault();

	gameOver.classList.add('hide');
    startEl.classList.remove('hide');
})

usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = document.querySelector('#username').value;
	socket.emit('register-user', username, (status) => {
		console.log("Server acknowledged the registration :D", status);

		if (status.joinChat) {
			startEl.classList.add('hide');
			waitingRoom.classList.remove('hide');

			updateOnlineUsers(status.onlineUsers);
		}
	});

});


socket.on('reconnect', () => {
	if (username) {
		socket.emit('register-user', username, () => {
			console.log("The server acknowledged our reconnect.");
		});
	}
});

socket.on('online-users', (users) => {
	updateOnlineUsers(users);
});

socket.on('new-user-connected', (username) => {
	addNoticeToChat(`${username} connected to the chat 🥳!`);
});

socket.on('user-disconnected', (username) => {
	addNoticeToChat(`${username} left the chat 😢...`);
});

socket.on('user-click', (clickDelay) => {
	randomClick(clickDelay)
});

socket.on('game-over', closeTheRoom);
socket.on('update-score-board', updateScore);
socket.on('create-game-page', showWaitingRoom);


