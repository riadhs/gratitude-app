onst prompts = [
        "What made you smile today?",
        "Who are you thankful for today?",
        "What’s a small victory you achieved today?",
        "What’s something you learned today?"
];

document.addEventListener("DOMContentLoaded", async () => {
    const promptElement = document.getElementById("prompt");
    const entryElement = document.getElementById("entry");
    const moodElement = document.getElementById("mood");
    const submitButton = document.getElementById("submit");
    const entriesElement = document.getElementById("entries");
    const dateSelect = document.getElementById("dateSelect");
    const viewEntriesButton = document.getElementById("viewEntries");
    const dateEntriesElement = document.getElementById("dateEntries");
    const calendarEl = document.getElementById('calendar');

    // Initialize FullCalendar
    let calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left: 'title',
            center: 'prev,next today',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        initialDate: new Date().toISOString().split('T')[0],
        navLinks: true, // Can click day/week names to navigate views
        editable: true,
        selectable: true,
	events: async function(info, success, failure) {
	try {
		const responseObject = await fetch('/events')
		const JSONEvent = await responseObject.json();
		success(JSONEvent);
	}
	catch (error) {
		failure(error);
	}
	},
    });

    calendar.render();

    // Fetch a random prompt
 
    promptElement.textContent = prompts[Math.floor(Math.random() * prompts.length)];

    // Handle submission
    submitButton.addEventListener("click", async () => {
        const entry = entryElement.value;
        const mood = moodElement.value;

        const formatDate = (date) => {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
      	    return `${year}-${month}-${day}`; 
	};

        const date = formatDate(new Date());

        if (entry) {
            // Send entry to the server
            await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ entry, mood, date })
            });

            const entryHtml =
                `<div class="entry">
                    <strong>${date}</strong>: ${entry} (Mood: ${mood})
                </div>`;
            entriesElement.innerHTML += entryHtml;

            // Update FullCalendar events for the specific date
	   calendar.addEvent({
		title: entry,
		start: date,
		color: mood === 'Sad' ? 'blue':
		       mood === 'Serious' ? 'red':
		       mood === 'Happy' ? 'green':
		       mood === 'Excited' ? 'orange':
		       'gray'
	    });

            // Update the date dropdown
            updateDateSelect(date);
            entryElement.value = ""; // Clear the textarea
        } else {
            alert("Please enter a reflection.");
        }
    });

    // Update the dropdown with available dates
    const updateDateSelect = (date) => {
        if (!dateSelect.querySelector(`option[value="${date}"]`)) {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
        }
    };

    // View entries for the selected date and update FullCalendar
    viewEntriesButton.addEventListener("click", async () => {
        const selectedDate = dateSelect.value;
        await displayEntriesForDate(selectedDate);
    });

    const displayEntriesForDate = async (date) => {
        dateEntriesElement.innerHTML = ''; // Clear previous entries

	const [formatYear, formatMonth, formatDay] = date.split('-');
	const formatted = `${formatYear}-${formatMonth.padStart(2, '0')}-${formatDay.padStart(2, '0')}`;

        const response = await fetch(`/entries?date=${formatted}`);
        const entries = await response.json();

	calendar.getEvents().forEach(currentEvent => currentEvent.remove()); // Remove existing events

        if (entries.length > 0) {
            entries.forEach(entry => {
                dateEntriesElement.innerHTML +=
                    `<div>
                        <strong>${formatted}</strong>: ${entry.entry} (Mood: ${entry.mood})
                    </div>`;

                // Adding entry as a new event on the calendar
		calendar.addEvent({
			title: entry.entry,
			start: entry.date,
			color: entry.mood === 'Sad' ? 'blue':
		       	       entry.mood === 'Serious' ? 'red':
		               entry.mood === 'Happy' ? 'green':
		               entry.mood === 'Excited' ? 'orange':
		       'gray'
		});
	});
        } else {
            dateEntriesElement.innerHTML = `<p>No record!</p>`;
        }
    };
});

