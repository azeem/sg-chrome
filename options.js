var settings;             // settings object
var accContainer;         // container div for accounts list
var editAccDlg;           // container for account edit dialog
var accItemTemplate;      // template for each item in account list
var emptyAccItemTemplate; // template for empty account list

/*
 * Refresh the account list
 */
function refreshAccountList() {
	accContainer.children('.acc,.empty').remove();
	if(settings.accounts.length == 0) {
		emptyAccItemTemplate.clone().prependTo(accContainer);
		return;
	}
	$.each(settings.accounts, function(index, account) {
		var accItem = accItemTemplate.clone();
		accItem.find('.name').text(account.name);
		accItem.find('.email').text(account.emails.split(',')[0]);
		accItem.find('.remove-button').click(function() {
			settings.accounts.splice(index, 1);
			if(settings.accounts.length == 0) {
				emptyAccItemTemplate.clone().prependTo(accContainer);
			}
			accItem.remove();
		});
		accItem.prependTo(accContainer);
	});
}

/*
 * Edit account dialog Add button event handler
 */
function addAccount() {
	var errorHandler = function(XMLHttpRequest, textStatus, errorThrown) {
		editAccDlg.find('.errorbox .errormsg').text(textStatus + " : " + errorThrown);
		editAccDlg.removeClass('busy').addClass('error');
	};

	var successHandler = function(resp) {
		settings.accounts.push(resp);
		refreshAccountList();
		editAccDlg.hide();
	};

	var authType = $('#login-type-switcher .highlight').text().toLowerCase();
	editAccDlg.addClass('busy')
	if(authType == 'api') {
		var inputs = $('#edit-accdlg .form.api input');
		var account = {sid:inputs.first().val(), token:inputs.last().val()}
		apiCall('users', account, function(resp) {
			$.extend(account, resp);
			successHandler(account);
		}, errorHandler);
	}
	else if(authType == 'login') {
		var inputs = $('#edit-accdlg .form.login input');
		var email = inputs.first().val();
		var password = inputs.last().val();
		apiAjax('login', {
			type: 'POST',
			data: {email:email, password:password},
			error: errorHandler,
			success: successHandler
		});
	}
}

/*
 * Update frequency dropdown change handler
 */
function updateRefreshFreq() {
	settings.refreshFreq = parseInt($(this).val());
}

/*
 * Setup and displays edit account dialog
 */
function showEditAccDlg() {
	editAccDlg.find('input').val('');
	editAccDlg.find('#login-type-switcher span').removeClass('highlight').first().addClass('highlight');
	editAccDlg.find('.form').hide().first().show();
	editAccDlg.removeClass('busy error').show();
}

/*
 * Save all settings in background page
 */
function save() {
	chrome.runtime.getBackgroundPage(function(bgPage) {
		bgPage.saveSettings(settings);
		console.log('Settings saved');
	});
}

/*
 * Bootstrap
 */
function boot() {
	// init globals
	emptyAccItemTemplate = $('#options-container .empty').detach();
	accItemTemplate = $('#options-container .acc').detach();
	accContainer = $('#options-container .acc-container');
	editAccDlg = $('#edit-accdlg');

	// Add events
	$('#saveopt-button').click(save);
	$('#addacc-button').click(showEditAccDlg);
	$('#addbutton').click(addAccount);
	$('.cancelbutton').click(function() {
		editAccDlg.hide();
	});
	$('#refresh-freq').change(updateRefreshFreq)
	$('#login-type-switcher').click(function() {
		$(this).find('span').toggleClass('highlight');
		editAccDlg.find('.form').toggle();
	})

	// Update account list
	chrome.runtime.getBackgroundPage(function(bgPage) {
        settings = bgPage.getSettings();
        refreshAccountList();
        $('#refresh-freq').val(settings.refreshFreq);
     });	
}

$(document).ready(boot);