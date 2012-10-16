var accounts = [];
var accContainer;
var editAccDlg;
var accItemTemplate;

function refreshAccountList() {
	accContainer.children().remove();
	$.each(accounts, function(index, account) {
		var accItem = accItemTemplate.clone();
		accItem.find('.name').text(account.name);
		accItem.find('.email').text(account.emails.split(',')[0]);
		accItem.appendTo(accContainer);
	})
}

function addAccount() {
	var authType = $('#login-type-switcher .highlight').text().toLowerCase();
	console.log("inside addAccount" + authType);
	if(authType == 'api') {
		var inputs = $('#edit-accdlg .form.api input');
		var auth = {sid:inputs.first().val(), token:inputs.last().val()}
		editAccDlg.addClass('busy')
		apiCall('users', auth,
			function(account) {
				auth.account = account;
				accounts.push(account);
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

function saveOptions() {
	console.log('Not implemented yet');
}

$(document).ready(function() {
	accItemTemplate = $('#options-container .acc').detach();
	accContainer = $('#options-container .acc-container');
	editAccDlg = $('#edit-accdlg');

	$('#addacc-button').click(showEditAccDlg);
	$('#addbutton').click(addAccount);
	$('.cancelbutton').click(function() {
		editAccDlg.hide();
	});

	$('#login-type-switcher').click(function() {
		$(this).find('span').toggleClass('highlight');
		editAccDlg.find('.form').toggle();
	})

	refreshAccountList();
})