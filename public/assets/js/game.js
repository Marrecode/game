const socket = io();



const startEl = document.querySelector('#start');
const usernameForm = document.querySelector('#username-form');
const gamefield = document.querySelector('#game-field');
const board = document.querySelector('#gamingboard');
const image = document.getElementById('playimg');


let username = null;

const addNoticeToChat = (notice) => {
	const noticeEl = document.createElement('li');
	noticeEl.classList.add('list-group-item', 'list-group-item-light', 'notice');

	noticeEl.innerHTML = notice;

	document.querySelector('#messages').appendChild(noticeEl);
}

const updateOnlineUsers = (users) => {
	document.querySelector('#online-users').innerHTML = users.map(user => `<li class="user">${user}</li>`).join("");
}

const randomPosition = (target) => {
	image.style.top = target.width + "px";
	image.style.left = target.height + "px";
}

image.addEventListener('click', e => {
	console.log('hej');
	socket.emit('user-click', username)
	console.log('hej', username);
})

// get username from form and emit `register-user`-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = document.querySelector('#username').value;
	socket.emit('register-user', username, (status) => {
		console.log("Server acknowledged the registration :D", status);

		if (status.joinChat) {
			startEl.classList.add('hide');
			gamefield.classList.remove('hide');

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

socket.on('user-click', (target) => {
	randomPosition(target)
});




