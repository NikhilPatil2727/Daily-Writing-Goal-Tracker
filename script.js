document.addEventListener('DOMContentLoaded', function() {
    // Initialize data from localStorage
    let wordGoal = localStorage.getItem('wordGoal') || 500;
    let notes = localStorage.getItem('notes') || '';
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // DOM elements
    const wordGoalInput = document.getElementById('wordGoal');
    const writeSpace = document.getElementById('writeSpace');
    const progress = document.getElementById('progress');
    const wordCount = document.getElementById('wordCount');

    // Set initial values
    wordGoalInput.value = wordGoal;
    writeSpace.value = notes;
    updateWordCount();

    // Initialize the calendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        events: events.map(event => ({
            id: event.id.toString(),
            title: event.title,
            start: event.date,
            description: event.description
        })),
        dateClick: function(info) {
            const eventTitle = prompt('Event Title:');
            const eventDescription = prompt('Event Description:');
            if (eventTitle) {
                const newEvent = {
                    id: Date.now(),
                    title: eventTitle,
                    date: info.dateStr,
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
        },
        eventClick: function(info) {
            const event = events.find(e => e.id.toString() === info.event.id);
            const newTitle = prompt('Edit Event Title:', event.title);
            const newDescription = prompt('Edit Event Description:', event.description);
            if (newTitle) {
                event.title = newTitle;
                event.description = newDescription;
                localStorage.setItem('events', JSON.stringify(events));
                info.event.setProp('title', newTitle);
                info.event.setExtendedProp('description', newDescription);
            } else if (confirm('Are you sure you want to delete this event?')) {
                info.event.remove();
                events = events.filter(e => e.id.toString() !== info.event.id);
                localStorage.setItem('events', JSON.stringify(events));
            }
        }
    });
    calendar.render();

    // Word count and goal functionality
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

    // Event listeners
    wordGoalInput.addEventListener('change', (e) => {
        wordGoal = parseInt(e.target.value) || 500;
        localStorage.setItem('wordGoal', wordGoal);
        updateWordCount();
    });

    writeSpace.addEventListener('input', () => {
        localStorage.setItem('notes', writeSpace.value);
        updateWordCount();
    });
});
