//  SUBMIT BUTTONS

const activateAccountButton = document.getElementById('activate-account-button');
const makeAdminButton = document.getElementById('make-admin-button');

// Button submit logic

activateAccountButton.addEventListener('click', () => {
    document.getElementById('verify-id').value = inputId.innerHTML;
    document.getElementById('verify-username').value = inputUsername.innerHTML;
});

makeAdminButton.addEventListener('click', () => {
    document.getElementById('admin-id').value = inputId.innerHTML;
    document.getElementById('admin-username').value = inputUsername.innerHTML;
});

// input values

const inputId = document.getElementById('input-id');
const inputUsername = document.getElementById('input-username');

// Get selected row of table, change the row background highlighting and put the values in
// the inputs for submissions.

let tableRows = document.getElementsByClassName('user-rows');

function resetTableColour() {
    for (let i = 0; i < tableRows.length; i++) {
        tableRows[i].style.background = 'white';
    };
};


for (let i = 0; i < tableRows.length; i++) {
    tableRows[i].addEventListener('click', () => {
        resetTableColour();
        tableRows[i].style.background = "gray";

        inputId.innerHTML = tableRows[i].childNodes[1].innerHTML;
        inputUsername.innerHTML = tableRows[i].childNodes[3].innerHTML;

        if (inputId.innerHTML == 'EMPTY' || inputUsername.innerHTML == 'EMPTY') {
            // If the inputs would be empty, then don't put those in the fields.
            inputId.innerHTML = '';
            inputUsername.innerHTML = '';
        };



        if (tableRows[i].childNodes[5].innerHTML == 'true') {
            activateAccountButton.innerHTML = 'Disable Account';
        } else {
            activateAccountButton.innerHTML = 'Enable Account';
        };

        if (tableRows[i].childNodes[7].innerHTML == 'true') {
            makeAdminButton.innerHTML = 'Demote Admin';
        } else {
            makeAdminButton.innerHTML = 'Promote Admin';
        };

        // hide buttons, if fields are empty.

        if (tableRows[i].childNodes[5].innerHTML == 'EMPTY') {
            activateAccountButton.style.display = 'none';
        } else {
            activateAccountButton.style.display = 'block';
        };

        if (tableRows[i].childNodes[7].innerHTML == 'EMPTY') {
            makeAdminButton.style.display = 'none';
        } else {
            makeAdminButton.style.display = 'block';
        }
    });
};
