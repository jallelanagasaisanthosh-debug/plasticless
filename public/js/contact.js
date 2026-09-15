/* =====================================================
   PLASTICLESS CONTACT
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupContactForm();

        setupCharacterCounter();

    }
);


/* =====================================================
   CHARACTER COUNTER
   ===================================================== */

function setupCharacterCounter() {

    const message =
        document.getElementById("message");

    const counter =
        document.getElementById("characterCount");


    if (!message || !counter) {
        return;
    }


    function updateCounter() {

        counter.textContent =
            message.value.length;

    }


    message.addEventListener(
        "input",
        updateCounter
    );


    updateCounter();

}


/* =====================================================
   CONTACT FORM
   ===================================================== */

function setupContactForm() {

    const form =
        document.getElementById(
            "contactForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const submitBtn =
                document.getElementById(
                    "submitBtn"
                );

            const formMessage =
                document.getElementById(
                    "formMessage"
                );


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const subject =
                document.getElementById(
                    "subject"
                ).value.trim();


            const message =
                document.getElementById(
                    "message"
                ).value.trim();


            /* VALIDATION */

            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                showMessage(
                    "Please fill in all required fields.",
                    "error"
                );

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            /* BUTTON */

            submitBtn.disabled = true;

            submitBtn.innerHTML =
                `<span>Sending...</span><strong>⌛</strong>`;


            hideMessage();


            try {

                const response =
                    await fetch(
                        "/api/contact",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                subject:
                                    subject,

                                message:
                                    message

                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok &&
                    data.success
                ) {

                    showMessage(
                        "✅ Your message has been sent successfully!",
                        "success"
                    );


                    form.reset();


                    document.getElementById(
                        "characterCount"
                    ).textContent = "0";


                    submitBtn.innerHTML =
                        `<span>Message Sent ✓</span><strong>✓</strong>`;


                    setTimeout(
                        function () {

                            submitBtn.disabled =
                                false;

                            submitBtn.innerHTML =
                                `<span>Send Message</span><strong>→</strong>`;

                        },
                        2500
                    );


                    return;

                }


                /* LOGIN REQUIRED */

                if (
                    response.status === 401 ||
                    (
                        data.message &&
                        data.message
                            .toLowerCase()
                            .includes("login")
                    )
                ) {

                    showMessage(
                        "Please login first to send a message.",
                        "error"
                    );


                    submitBtn.disabled =
                        false;

                    submitBtn.innerHTML =
                        `<span>Send Message</span><strong>→</strong>`;

                    return;

                }


                throw new Error(
                    data.message ||
                    "Unable to send your message."
                );


            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Something went wrong. Please try again.",
                    "error"
                );


                submitBtn.disabled =
                    false;

                submitBtn.innerHTML =
                    `<span>Send Message</span><strong>→</strong>`;

            }

        }
    );

}


/* =====================================================
   EMAIL VALIDATION
   ===================================================== */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =====================================================
   SHOW MESSAGE
   ===================================================== */

function showMessage(
    text,
    type
) {

    const box =
        document.getElementById(
            "formMessage"
        );


    if (!box) {
        return;
    }


    box.textContent =
        text;


    box.className =
        "form-message show " +
        type;


    box.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


/* =====================================================
   HIDE MESSAGE
   ===================================================== */

function hideMessage() {

    const box =
        document.getElementById(
            "formMessage"
        );


    if (!box) {
        return;
    }


    box.className =
        "form-message";

}