var ellipsisInterval;

function animateEllipsis() {
var count = 0;
ellipsisInterval = setInterval(function() {
    if (count > 2) count = 0;
    $('#emailMessage').text('Submitting request' + '.'.repeat(count + 1) + ' '.repeat(2 - count));
    count++;
}, 500); // Update every 500 milliseconds
}


function popup(event) {
    event.preventDefault(); // Prevent form from submitting the traditional way
    animateEllipsis();

    // Get the form element
    const form = document.getElementById('emailForm');
    
    // Create a FormData object to gather the form data
    const formData = new FormData(form);

    // Fetch the CSRF token if you're using Django and CSRF protection
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Send the POST request with the form data
    fetch('/send_email_italian', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken // Attach CSRF token in the headers
        },
        body: formData
    })
    .then(response => {
        // Check if the response status is 200
        if (response.status === 200) {
            $('#emailMessage').text('Information request sent!');
            clearInterval(ellipsisInterval)
        } else {
            $('#emailMessage').text('Oops! Something went wrong, please try again in a few minutes');
            clearInterval(ellipsisInterval)
            
        }
    });
}

document.getElementById('emailForm').addEventListener('submit', popup);
