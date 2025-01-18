// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve word goal, notes, and events from local storage or set default values
    let wordGoal = localStorage.getItem('wordGoal') || 500;
    let notes = localStorage.getItem('notes') || '';
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Get references to various elements in the DOM
    const wordGoalInput = document.getElementById('wordGoal');
    const writeSpace = document.getElementById('writeSpace');
    const progress = document.getElementById('progress');
    const wordCount = document.getElementById('wordCount');
    const clearBtn = document.getElementById('clearBtn');
    const modal = document.getElementById('eventModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const eventTitle = document.getElementById('eventTitle');
    const eventDesc = document.getElementById('eventDescription');
    const editEventBtn = document.getElementById('editEvent');
    const deleteEventBtn = document.getElementById('deleteEvent');

    // Set initial values for input fields and update the word count
    wordGoalInput.value = wordGoal;
    writeSpace.value = notes;
    updateWordCount();

    // Initialize the FullCalendar instance with configuration options
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true,
        events: events.map(event => ({
            id: event.id.toString(),
            title: event.title,
            start: event.date,
            description: event.description
        })),
        dateClick: function(info) {
            addNewEvent(info.dateStr); // Handle click on a date to add a new event
        },
        eventClick: function(info) {
            showEventDetails(info.event); // Show details when an event is clicked
        },
        height: 'auto',
        aspectRatio: 1.35,
        windowResize: function(view) {
            if (window.innerWidth < 768) {
                calendar.changeView('listMonth'); // Change view based on screen size
            } else {
                calendar.changeView('dayGridMonth');
            }
        }
    });

    // Render the calendar
    calendar.render();

    // Function to handle calendar responsiveness based on window size
    function handleCalendarResponsiveness() {
        if (window.innerWidth < 768) {
            calendar.changeView('listMonth');
        } else {
            calendar.changeView('dayGridMonth');
        }
    }

    // Initial call to handle calendar responsiveness
    handleCalendarResponsiveness();
    window.addEventListener('resize', handleCalendarResponsiveness);

    // Update the word count display and progress bar
    function updateWordCount() {
        const words = writeSpace.value.trim().split(/\s+/).filter(word => word.length > 0).length;
        const percentage = Math.min((words / wordGoal) * 100, 100);

        progress.style.width = `${percentage}%`;
        wordCount.textContent = `${words} / ${wordGoal} words`;

        if (words >= wordGoal) {
            progress.style.backgroundColor = '#4CAF50'; // Green color for achieved goal

            if (!progress.classList.contains('celebrated')) {
                alert('🎉 Congratulations! You\'ve reached your word goal! 🎉'); // Alert for achievement
                progress.classList.add('celebrated');
            }
        } else {
            progress.style.backgroundColor = '#4CAF50';
            progress.classList.remove('celebrated');
        }
    }

    // Add a new event to the calendar
    function addNewEvent(date) {
        const eventTitle = prompt('Event Title:'); // Prompt user for event title
        const eventDescription = prompt('Event Description:'); // Prompt user for event description

        if (eventTitle) {
            const newEvent = {
                id: Date.now(),
                title: eventTitle,
                date: date,
                description: eventDescription
            };

            events.push(newEvent);
            localStorage.setItem('events', JSON.stringify(events)); // Save event to local storage

            calendar.addEvent({
                id: newEvent.id.toString(),
                title: newEvent.title,
                start: newEvent.date,
                description: newEvent.description
            });
        }
    }

    // Display event details in the modal
    function showEventDetails(event) {
        eventTitle.textContent = event.title;
        eventDesc.textContent = event.extendedProps.description || 'No description provided.';
        modal.style.display = 'block';

        let currentEvent = event;

        // Set up event listeners for editing and deleting the event
        editEventBtn.onclick = function() {
            editEvent(currentEvent);
        };

        deleteEventBtn.onclick = function() {
            deleteEvent(currentEvent);
        };
    }

    // Edit an existing event
    function editEvent(event) {
        const newTitle = prompt('Edit Event Title:', event.title); // Prompt user for new event title
        const newDescription = prompt('Edit Event Description:', event.extendedProps.description); // Prompt user for new event description

        if (newTitle) {
            event.setProp('title', newTitle);
            event.setExtendedProp('description', newDescription);

            const updatedEvent = events.find(e => e.id.toString() === event.id);
            if (updatedEvent) {
                updatedEvent.title = newTitle;
                updatedEvent.description = newDescription;
                localStorage.setItem('events', JSON.stringify(events)); // Save changes to local storage
            }
            modal.style.display = 'none'; // Close the modal after editing
        }
    }

    // Delete an existing event
    function deleteEvent(event) {
        if (confirm('Are you sure you want to delete this event?')) { // Confirm deletion
            event.remove(); // Remove event from the calendar
            events = events.filter(e => e.id.toString() !== event.id); // Filter out the deleted event
            localStorage.setItem('events', JSON.stringify(events)); // Save changes to local storage
            modal.style.display = 'none'; // Close the modal after deletion
        }
    }

    // Update the word goal when the input field changes
    wordGoalInput.addEventListener('change', (e) => {
        wordGoal = parseInt(e.target.value) || 500;
        localStorage.setItem('wordGoal', wordGoal); // Save new word goal to local storage
        updateWordCount(); // Update the word count display
    });

    // Save notes and update the word count when the text area changes
    writeSpace.addEventListener('input', () => {
        localStorage.setItem('notes', writeSpace.value); // Save notes to local storage
        updateWordCount(); // Update the word count display
    });

    // Clear all text in the write space if confirmed by the user
    clearBtn.addEventListener('click', () => {
        if (writeSpace.value.trim() !== '' && confirm('Are you sure you want to clear all text?')) {
            writeSpace.value = ''; // Clear the text area
            localStorage.setItem('notes', ''); // Save empty notes to local storage
            updateWordCount(); // Update the word count display
        }
    });

    // Close the modal when the close button is clicked
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});