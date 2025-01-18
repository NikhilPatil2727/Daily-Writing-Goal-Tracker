document.addEventListener('DOMContentLoaded', function() {
    // Retrieve saved word goal from local storage or default to 500 words
    let wordGoal = localStorage.getItem('wordGoal') || 500;
    
    // Retrieve saved notes from local storage or default to an empty string
    let notes = localStorage.getItem('notes') || '';
    
    // Retrieve saved events from local storage or default to an empty array
    let events = JSON.parse(localStorage.getItem('events')) || [];
    
    // Get references to various DOM elements
    const wordGoalInput = document.getElementById('wordGoal');
    const writeSpace = document.getElementById('writeSpace');
    const progress = document.getElementById('progress');
    const wordCount = document.getElementById('wordCount');
    const clearButton = document.getElementById('clearButton');
    
    // Set initial values for word goal input and writing space
    wordGoalInput.value = wordGoal;
    writeSpace.value = notes;
    
    // Update the word count display
    updateWordCount();
    
    // Initialize FullCalendar on the calendar element
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        
        // Map stored events to the format expected by FullCalendar
        events: events.map(event => ({
            id: event.id.toString(),
            title: event.title,
            start: event.date,
            description: event.description
        })),
        
        // Handle clicks on dates to add new events
        dateClick: function(info) {
            const eventTitle = prompt('Event Title:');
            const eventDescription = prompt('Event Description:');
            
            if (eventTitle) {
                // Create a new event object and add it to the events array
                const newEvent = {
                    id: Date.now(),
                    title: eventTitle,
                    date: info.dateStr,
                    description: eventDescription
                };
                
                events.push(newEvent);
                localStorage.setItem('events', JSON.stringify(events));
                
                // Add the new event to the calendar
                calendar.addEvent({
                    id: newEvent.id.toString(),
                    title: newEvent.title,
                    start: newEvent.date,
                    description: newEvent.description
                });
            }
        },
        
        // Handle clicks on existing events to edit or delete them
        eventClick: function(info) {
            const event = events.find(e => e.id.toString() === info.event.id);
            
            const newTitle = prompt('Edit Event Title:', event.title);
            const newDescription = prompt('Edit Event Description:', event.description);
            
            if (newTitle) {
                // Update the event's title and description
                event.title = newTitle;
                event.description = newDescription;
                localStorage.setItem('events', JSON.stringify(events));
                
                // Update the event's properties on the calendar
                info.event.setProp('title', newTitle);
                info.event.setExtendedProp('description', newDescription);
            } else if (confirm('Are you sure you want to delete this event?')) {
                // Remove the event from both the calendar and the events array
                info.event.remove();
                events = events.filter(e => e.id.toString() !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
            }
        }
    });
    
    // Render the calendar
    calendar.render();

    // Function to update the word count and progress bar
    function updateWordCount() {
        // Calculate the number of words in the writing space
        const words = writeSpace.value.trim().split(/\s+/).filter(word => word.length > 0).length;
        
        // Calculate the percentage of the word goal achieved
        const percentage = Math.min((words / wordGoal) * 100, 100);
        
        // Update the width of the progress bar
        progress.style.width = `${percentage}%`;
        
        // Update the word count display text
        wordCount.textContent = `${words} / ${wordGoal} words`;
        
        // Change the color of the progress bar when the word goal is reached
        if (words >= wordGoal) {
            progress.style.backgroundColor = '#4CAF50';
            
            // Show a congratulatory message only once
            if (!progress.classList.contains('celebrated')) {
                alert('🎉 Congratulations! You\'ve reached your word goal! 🎉');
                progress.classList.add('celebrated');
            }
        } else {
            progress.style.backgroundColor = '#4CAF50';
            progress.classList.remove('celebrated');
        }
    }

    // Handle changes to the word goal input
    wordGoalInput.addEventListener('change', (e) => {
        // Update the word goal and save it to local storage
        wordGoal = parseInt(e.target.value) || 500;
        localStorage.setItem('wordGoal', wordGoal);
        
        // Update the word count display based on the new word goal
        updateWordCount();
    });

    // Handle changes to the writing space content
    writeSpace.addEventListener('input', () => {
        // Save the current content of the writing space to local storage
        localStorage.setItem('notes', writeSpace.value);
        
        // Update the word count display
        updateWordCount();
    });

    // Handle clicks on the clear button
    clearButton.addEventListener('click', () => {
        // Confirm before clearing all text in the writing space
        if (writeSpace.value.trim() !== '' && confirm('Are you sure you want to clear all text?')) {
            writeSpace.value = '';
            localStorage.setItem('notes', '');
            updateWordCount();
        }
    });
});