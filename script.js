function formatDate(isoString) {
    const options = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
        hour12: true
    };
    return new Date(isoString).toLocaleString('en-US', options);
}

// Utility to get and save from localStorage
function getGuests() {
    return JSON.parse(localStorage.getItem('guests') || '[]');
}

function saveGuests(guests) {
    localStorage.setItem('guests', JSON.stringify(guests));
}

// Render all guests
function renderGuests() {
    const displayBox = document.getElementById('diplay-box');
    displayBox.innerHTML = ''; // Clear previous entries

    const guests = getGuests();
    guests.forEach((guest, index) => {
        const entry = document.createElement('div');
        entry.classList.add('guest-entry');

        // Assign a category class for coloring
        const categoryClass = guest.category.toLowerCase(); // "family", "friend", "collegue"
        const rsvpStatus = guest.isAttending ? '✅ Attending' : '❌ Not Attending';
        const rsvpClass = guest.isAttending ? 'attending' : 'not-attending';
        const dateAdded = formatDate(guest.createdAt);


        entry.innerHTML = `
            <p>
                <strong>${index + 1}.</strong> ${guest.name}
                <span class="category-label ${categoryClass}">${guest.category}</span>
                <span class="rsvp-status ${rsvpClass}">${rsvpStatus}</span>
                <small class="timestamp">Added: ${dateAdded}</small>
            </p>
            <button class="toggle-rsvp" data-index="${index}">Toggle RSVP</button>
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="remove" data-index="${index}">Remove</button>
        `;
        displayBox.appendChild(entry);
    });
}


// Add guest
document.querySelector('.btn-submit').addEventListener('click', function (e) {
    e.preventDefault();

    const nameInput = document.querySelector('.guest-txt');
    const name = nameInput.value.trim();
    const radios = document.querySelectorAll('input[name="guest-type"]');

    let category = '';
    radios.forEach(radio => {
        if (radio.checked) {
            category = radio.nextSibling.textContent.trim();
        }
    });

    if (!name || !category) {
        alert('Please enter a name and select a category.');
        return;
    }

    let guests = getGuests();
    //Limit the number of guests to 10
    if (guests.length >= 10) {
    alert('Guest limit reached (maximum 10).');
    return;
}


    // Prevent duplicate (same name and category)
    const isDuplicate = guests.some(g => g.name.toLowerCase() === name.toLowerCase() && g.category === category);
    if (isDuplicate) {
        alert('This guest and category already exist.');
        return;
    }

    guests.push({ name, category, isAttending: false, createdAt: new Date().toISOString() });
    saveGuests(guests);
    renderGuests();

    // Clear input
    nameInput.value = '';
    radios.forEach(radio => radio.checked = false);
});

document.querySelector('.btn-delete-by-name').addEventListener('click', function () {
    const input = document.querySelector('.guest-txt');
    const nameToDelete = input.value.trim().toLowerCase();

    if (!nameToDelete) {
        alert('Please enter a guest name to delete.');
        return;
    }

    let guests = getGuests();
    const index = guests.findIndex(g => g.name.toLowerCase() === nameToDelete);

    if (index === -1) {
        alert(`No guest named "${input.value}" found.`);
        return;
    }

    guests.splice(index, 1);
    saveGuests(guests);
    renderGuests();
    input.value = ''; // Clear input
});


// Handle delete and edit using event delegation
document.getElementById('diplay-box').addEventListener('click', function (e) {
    const guests = getGuests();
    const index = e.target.getAttribute('data-index');

    if (e.target.classList.contains('remove')) {
        if (index !== null && guests[index]) {
            guests.splice(index, 1);
            saveGuests(guests);
            renderGuests();
        }
    }

    if (e.target.classList.contains('edit-btn')) {
        const guest = guests[index];
        document.querySelector('.guest-txt').value = guest.name;

        // Check the correct radio
        const radios = document.querySelectorAll('input[name="guest-type"]');
        radios.forEach(radio => {
            if (radio.value === guest.category) radio.checked = true;
        });

        // Remove original for update
        guests.splice(index, 1);
        saveGuests(guests);
        renderGuests();
    }

    if (e.target.classList.contains('toggle-rsvp')) {
        guests[index].isAttending = !guests[index].isAttending;
        saveGuests(guests);
        renderGuests();
    }
});


// Initial render on page load
document.addEventListener('DOMContentLoaded', renderGuests);
