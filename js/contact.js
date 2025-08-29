// js/contact.js

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevents the page from reloading

            formStatus.textContent = 'Enviando sua mensagem...';
            formStatus.style.color = '#333';

            // Replace with your actual EmailJS service and template IDs
            emailjs.sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", this)
                .then(() => {
                    formStatus.textContent = '✅ Mensagem enviada com sucesso! Em breve retornaremos o contato.';
                    formStatus.style.color = 'green';
                    contactForm.reset();
                }, (error) => {
                    formStatus.textContent = '❌ Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.';
                    formStatus.style.color = 'red';
                    console.error('EmailJS Error:', JSON.stringify(error));
                });
        });
    }
});