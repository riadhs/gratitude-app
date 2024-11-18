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

 
    promptElement.textContent = prompts[Math.floor(Math.random() * prompts.length)];


    submitButton.addEventListener("click", async () => {
        const entry = entryElement.value;
        const mood = moodElement.value;
         
        const formatDate = (date) => {
            const month = String(date.getMonth() + 1).padStart(2, '0'); 
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${month}/${day}/${year}`; 
        };

        
        
  
        const date = formatDate(new Date());

        if (entry) {
            
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

           
            updateDateSelect(date);
            entryElement.value = ""; 
        } else {
            alert("Please enter a reflection.");
        }
    });

    
    const updateDateSelect = (date) => {
        if (!dateSelect.querySelector(`option[value="${date}"]`)) {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
        }
    };

  
    viewEntriesButton.addEventListener("click", async () => {
        const selectedDate = dateSelect.value;
        await displayEntriesForDate(selectedDate);
    });

    
    const displayEntriesForDate = async (date) => {
        dateEntriesElement.innerHTML = ''; 
    
        const dateParts = date.split('-'); 
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

document.addEventListener('DOMContentLoaded', function() {
    	var calendarEl = document.getElementById('calendar');

        if (calendarEl) {
    	var calendar = new FullCalendar.Calendar(calendarEl, {
      	headerToolbar: {
        	left: 'title',
        	center: 'prev,next today',
        	right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      	},
      	initialDate: new Date().toISOString().split('T')[0],
      	navLinks: true, 
      	editable: true,
      	selectable: true,
      	events: [
        	{
         	 title: 'Halloween',
         	 start: '2024-10-31',
         	 color: 'purple'
       	 	},
         	{
          	title: 'Thanksgiving',
         	 start: '2024-11-28',
          	color: 'burgundy'
        	},
      	      ]
   	 });

    	calendar.render();
	
      } else {
	 console.error('FullCalendar not found');
      }
  });
