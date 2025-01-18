document.addEventListener('DOMContentLoaded', function() {
    let wordGoal = localStorage.getItem('wordGoal') || 500;
    let notes = localStorage.getItem('notes') || '';
    let events = JSON.parse(localStorage.getItem('events')) || [];

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

    wordGoalInput.value = wordGoal;
    writeSpace.value = notes;

    updateWordCount();

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
            addNewEvent(info.dateStr);
        },
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        height: 'auto',
        aspectRatio: 1.35,
        windowResize: function(view) {
            if (window.innerWidth < 768) {
                calendar.changeView('listMonth');
            } else {
                calendar.changeView('dayGridMonth');
            }
        }
    });
    
    calendar.render();
    
    function handleCalendarResponsiveness() {
        if (window.innerWidth < 768) {
            calendar.changeView('listMonth');
        } else {
            calendar.changeView('dayGridMonth');
        }
    }

    handleCalendarResponsiveness();

    window.addEventListener('resize', handleCalendarResponsiveness);

    function updateWordCount() {
        const words = writeSpace.value.trim().split(/\s+/).filter(word => word.length > 0).length;
        const percentage = Math.min((words / wordGoal) * 100, 100);
        
        progress.style.width = `${percentage}%`;
        wordCount.textContent = `${words} / ${wordGoal} words`;
        
        if (words >= wordGoal) {
            progress.style.backgroundColor = '#4CAF50';
            
            if (!progress.classList.contains('celebrated')) {
                alert('🎉 Congratulations! You\'ve reached your word goal! 🎉');
                progress.classList.add('celebrated');
            }
        } else {
            progress.style.backgroundColor = '#4CAF50';
            progress.classList.remove('celebrated');
        }
    }

    function addNewEvent(date) {
        const eventTitle = prompt('Event Title:');
        const eventDescription = prompt('Event Description:');
        
        if (eventTitle) {
            const newEvent = {
                id: Date.now(),
                title: eventTitle,
                date: date,
                description: eventDescription
            };
            
            events.push(newEvent);
            localStorage.setItem('events', JSON.stringify(events));
            
            calendar.addEvent({
                id: newEvent.id.toString(),
                title: newEvent.title,
                start: newEvent.date,
                description: newEvent.description
            });
        }
    }

    function showEventDetails(event) {
        eventTitle.textContent = event.title;
        eventDesc.textContent = event.extendedProps.description || 'No description provided.';
        modal.style.display = 'block';

        let currentEvent = event;

        editEventBtn.onclick = function() {
            editEvent(currentEvent);
        };

        deleteEventBtn.onclick = function() {
            deleteEvent(currentEvent);
        };
    }

    function editEvent(event) {
        const newTitle = prompt('Edit Event Title:', event.title);
        const newDescription = prompt('Edit Event Description:', event.extendedProps.description);
        
        if (newTitle) {
            event.setProp('title', newTitle);
            event.setExtendedProp('description', newDescription);

            const updatedEvent = events.find(e => e.id.toString() === event.id);
            if (updatedEvent) {
                updatedEvent.title = newTitle;
                updatedEvent.description = newDescription;
                localStorage.setItem('events', JSON.stringify(events));
            }

            modal.style.display = 'none';
        }
    }

    function deleteEvent(event) {
        if (confirm('Are you sure you want to delete this event?')) {
            event.remove();
            events = events.filter(e => e.id.toString() !== event.id);
            localStorage.setItem('events', JSON.stringify(events));
            modal.style.display = 'none';
        }
    }

    wordGoalInput.addEventListener('change', (e) => {
        wordGoal = parseInt(e.target.value) || 500;
        localStorage.setItem('wordGoal', wordGoal);
        updateWordCount();
    });

    writeSpace.addEventListener('input', () => {
        localStorage.setItem('notes', writeSpace.value);
        updateWordCount();
    });

    clearBtn.addEventListener('click', () => {
        if (writeSpace.value.trim() !== '' && confirm('Are you sure you want to clear all text?')) {
            writeSpace.value = '';
            localStorage.setItem('notes', '');
            updateWordCount();
        }
    });

    closeModal.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});

