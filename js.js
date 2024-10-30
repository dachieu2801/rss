const message = document.querySelector('#message');
document.querySelector('#submit').addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const link = document.querySelector('#link').value;
    if (!email.trim() || !password.trim() || !link.trim()) {
        message.innerHTML = 'Please enter all fields';
        return
    }

    const response = await fetch('/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, link }),
    });
    if (!response.ok) {
        message.innerHTML = 'Something went wrong, try again!';
    }
    const data = await response.json();
    if (data && data.success === true) {
        document.getElementById('progress-container').style.display = 'block';
        let progress = 0;
        const progressFill = document.getElementById('progress-fill');

        const interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);

            } else {
                progress += 2;
                progressFill.style.width = progress + '%';
            }
        }, 6);
        setTimeout(() => {
            document.getElementById('progress-container').style.display = 'none';
            message.innerHTML = data?.message || 'Connected';
            message.style.color = 'green';
        }, 3006)

    } else {
        message.innerHTML = data?.message || 'Has an error, please try again';
        message.style.color = 'red';
    }
})