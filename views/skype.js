var url       = require('url');
var remote    = require('remote');
var TrayIcon  = remote.require('./tray');
var Settings  = require('../settings');

var skypeView = document.getElementById('skype-view');
var title     = document.querySelector('title');

/**
 * If the user has a Microsoft account, we skip the Skype login
 * form and go straight to the Microsoft login page
 */
function checkMicrosoftAccount(currentURL) {
	if (!Settings.MicrosoftAccount) return;

	if (currentURL.hostname === "login.skype.com" && currentURL.query.client_id) {
		let oathURL = [
			"https://login.skype.com/login/oauth/microsoft?mssso=1&client_id=",
			currentURL.query.client_id,
			"&redirect_uri=https://web.skype.com/"
		].join('');

		skypeView.loadURL(oathURL);
		return;
	}
}

/**
 * Decides if the user has any unread notifications and
 * provides the appropriate feedback to the tray icon
 */
function checkTrayIcon(title) {
	let result = /^\((\d+)\)/.exec(title);

	if (result !== null && result.length === 2) {
		TrayIcon.setNotificationCount(Number(result[1]));
	} else {
		TrayIcon.setNotificationCount(0);
	}
}

skypeView.addEventListener('page-title-updated', function(event) {
	let currentURL = url.parse(skypeView.getURL(), true);

	title.innerHTML = event.title;

	checkMicrosoftAccount(currentURL);
	checkTrayIcon(event.title);
});

skypeView.addEventListener('new-window', function(e) {
	// Open links in external browser
	var protocol = url.parse(e.url).protocol;
	if (protocol === 'http:' || protocol === 'https:') {
		require('electron').shell.openExternal(e.url);
	}
});
