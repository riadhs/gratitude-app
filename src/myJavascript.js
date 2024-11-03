const prompts = [
    "What made you smile today?",
    "Who are you thankful for today?",
    "What’s a small victory you achieved today?",
    "What’s something you learned today?"
];

document.addEventListener("DOMContentLoaded", async() => {
    const promptElement = document.getElementById("prompt");
    const entryElement = document.getElementById("entry");
    const moodElement = document.getElementById("mood");
    const submitButton = document.getElementById("submit");
    const entriesElement = document.getElementById("entries");
    const dateSelect = document.getElementById("dateSelect");
    const viewEntriesButton = document.getElementById("viewEntries");
    const dateEntriesElement = document.getElementById("dateEntries");

    // Display a random prompt
    promptElement.textContent = prompts[Math.floor(Math.random() * prompts.length)];

    // Handle submission
    submitButton.addEventListener("click", async () => {
        const entry = entryElement.value;
        const mood = moodElement.value;
         
        const formatDate = (date) => {
            const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${month}/${day}/${year}`; // MM/DD/YYYY format
        };

        
        
        // Get the current date formatted as MM/DD/YYYY
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

            // Update date dropdown
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

    // View entries for the selected date
    viewEntriesButton.addEventListener("click", async () => {
        const selectedDate = dateSelect.value;
        await displayEntriesForDate(selectedDate);
    });

    
    const displayEntriesForDate = async (date) => {
        dateEntriesElement.innerHTML = ''; // Clear previous entries
    
        // Convert the input date (YYYY-MM-DD) to MM/DD/YYYY
        const dateParts = date.split('-'); // Split the date string
        const formattedDate = `${dateParts[1].padStart(2, '0')}/${dateParts[2].padStart(2, '0')}/${dateParts[0]}`;
    
        const response = await fetch(`/entries?date=${formattedDate}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            dateEntriesElement.innerHTML = `<p>Error: ${errorData.error}</p>`;
            return;
        }
        
        const entries = await response.json();
    
        if (entries.length > 0) {
            entries.forEach(entry => {
                dateEntriesElement.innerHTML += 
                    `<div>
                        <strong>${formattedDate}</strong>: ${entry.entry} (Mood: ${entry.mood})
                    </div>`;
            });
        } else {
            dateEntriesElement.innerHTML = `<p>No Record!</p>`;
        }
    };
    
    
});
