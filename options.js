var settings;
var accContainer;
var editAccDlg;
var accItemTemplate;
var emptyAccItemTemplate;

function refreshAccountList() {
	accContainer.children('.acc').remove();
	if(settings.accounts.length == 0) {
		emptyAccItemTemplate.clone().prependTo(accContainer);
	}
	else {
		$.each(settings.accounts, function(index, account) {
			var accItem = accItemTemplate.clone();
			accItem.find('.name').text(account.name);
			accItem.find('.email').text(account.emails.split(',')[0]);
			accItem.find('.remove-button').click(function() {
				settings.accounts.splice(index, 1);
				accItem.remove();
			});
			accItem.prependTo(accContainer);
		});		
	}
}

function addAccount() {
	var authType = $('#login-type-switcher .highlight').text().toLowerCase();
	console.log("inside addAccount" + authType);
	if(authType == 'api') {
		var inputs = $('#edit-accdlg .form.api input');
		var account = {sid:inputs.first().val(), token:inputs.last().val()}
		editAccDlg.addClass('busy')
		apiCall('users', account,
			function(resp) {
				$.extend(account, resp);
				settings.accounts.push(account);
				refreshAccountList();
				editAccDlg.hide();
			},
			function() {
				editAccDlg.removeClass('busy').addClass('error');
			}
		);
	}
}

function showEditAccDlg() {
	editAccDlg.find('input').val('');
	editAccDlg.find('#login-type-switcher span').removeClass('highlight').first().addClass('highlight');
	editAccDlg.find('.form').hide().first().show();
	editAccDlg.removeClass('busy error').show();
}

function save() {
	chrome.runtime.getBackgroundPage(function(bgPage) {
		bgPage.saveSettings(settings);
		console.log('Settings saved');
	});
}

$(document).ready(function() {
	accItemTemplate = $('#options-container .acc').detach();
	emptyAccItemTemplate = $('#options-container .empty').detach();
	
	accContainer = $('#options-container .acc-container');
	editAccDlg = $('#edit-accdlg');

	$('#saveopt-button').click(save);
	$('#addacc-button').click(showEditAccDlg);
	$('#addbutton').click(addAccount);
	$('.cancelbutton').click(function() {
		editAccDlg.hide();
	});

	$('#login-type-switcher').click(function() {
		$(this).find('span').toggleClass('highlight');
		editAccDlg.find('.form').toggle();
	})

	chrome.runtime.getBackgroundPage(function(bgPage) {
        settings = bgPage.getSettings();
        refreshAccountList();
     });
})