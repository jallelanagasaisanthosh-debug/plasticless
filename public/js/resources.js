document.addEventListener("DOMContentLoaded", function () {

    console.log("🌿 PlasticLess Resources JS Loaded");

    const modal =
        document.getElementById("resourceModal");

    const modalIcon =
        document.getElementById("modalIcon");

    const modalCategory =
        document.getElementById("modalCategory");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalContent =
        document.getElementById("modalContent");


    /* =====================================================
       RESOURCE THEORY DATA
    ===================================================== */

    const resources = {

        pollution: {

            icon: "🌊",

            category: "PLASTIC POLLUTION",

            title: "Understanding Plastic Pollution",

            content: `
                <h3>What is Plastic Pollution?</h3>

                <p>
                    Plastic pollution occurs when plastic products
                    and waste accumulate in the environment and
                    cause harm to land, water, wildlife and people.
                </p>

                <h3>Why is Plastic a Problem?</h3>

                <p>
                    Plastic is strong and long-lasting. Many plastic
                    products are used for only a few minutes but can
                    remain in the environment for many years.
                </p>

                <ul>
                    <li>Plastic waste can enter rivers and oceans.</li>
                    <li>Animals may swallow or become trapped in plastic.</li>
                    <li>Plastic waste can damage natural habitats.</li>
                    <li>Small plastic particles can spread through ecosystems.</li>
                </ul>

                <h3>What Can We Do?</h3>

                <p>
                    We can reduce unnecessary plastic use, choose
                    reusable products, separate waste properly and
                    recycle whenever suitable facilities are available.
                </p>

                <div class="theory-tip">
                    💡 <strong>Remember:</strong>
                    The best way to manage plastic waste is to reduce
                    unnecessary plastic use before it becomes waste.
                </div>
            `
        },


        reduce: {

            icon: "🛍️",

            category: "REDUCE",

            title: "Reduce Single-Use Plastic",

            content: `
                <h3>What is Single-Use Plastic?</h3>

                <p>
                    Single-use plastics are products designed to be
                    used for a short period and then thrown away.
                    Examples include plastic bags, cups, straws,
                    bottles and food containers.
                </p>

                <h3>Better Alternatives</h3>

                <ul>
                    <li>Use cloth or jute bags while shopping.</li>
                    <li>Carry a reusable water bottle.</li>
                    <li>Choose reusable food containers.</li>
                    <li>Avoid unnecessary plastic packaging.</li>
                    <li>Use reusable cups whenever possible.</li>
                </ul>

                <h3>Why Reduce?</h3>

                <p>
                    Reducing single-use plastic decreases the amount
                    of plastic entering waste systems and the natural
                    environment.
                </p>

                <div class="theory-tip">
                    🌱 <strong>Simple habit:</strong>
                    Carry your reusable bag and bottle whenever you
                    leave home.
                </div>
            `
        },


        recycling: {

            icon: "♻️",

            category: "RECYCLING",

            title: "How to Recycle Plastic",

            content: `
                <h3>What is Recycling?</h3>

                <p>
                    Recycling is the process of collecting and
                    processing suitable waste materials so that
                    they can be used again to make new products.
                </p>

                <h3>Basic Recycling Steps</h3>

                <ol>
                    <li>Collect plastic waste separately.</li>
                    <li>Keep recyclable materials as clean as possible.</li>
                    <li>Separate different types of waste.</li>
                    <li>Follow your local recycling rules.</li>
                    <li>Send recyclable material to an appropriate facility.</li>
                </ol>

                <h3>Important Point</h3>

                <p>
                    Not every plastic item can be recycled in every
                    location. Always check the recycling facilities
                    and rules available in your area.
                </p>

                <div class="theory-tip">
                    ♻️ <strong>Remember:</strong>
                    Reduce first, reuse when possible, and recycle
                    suitable materials responsibly.
                </div>
            `
        },


        cleanup: {

            icon: "🌍",

            category: "COMMUNITY",

            title: "Community Cleanup Guide",

            content: `
                <h3>What is a Cleanup Campaign?</h3>

                <p>
                    A cleanup campaign is a community activity in
                    which people work together to remove waste from
                    public spaces such as streets, parks, beaches
                    and other local areas.
                </p>

                <h3>How to Participate</h3>

                <ol>
                    <li>Choose a safe cleanup location.</li>
                    <li>Work with a group or community organization.</li>
                    <li>Use appropriate gloves and collection bags.</li>
                    <li>Separate recyclable materials when possible.</li>
                    <li>Dispose of collected waste responsibly.</li>
                </ol>

                <h3>Why Community Action Matters</h3>

                <p>
                    Community cleanup activities make public spaces
                    cleaner while encouraging people to understand
                    the importance of responsible waste management.
                </p>

                <div class="theory-tip">
                    🤝 <strong>Together:</strong>
                    One person can start a change, but a community
                    can create a much bigger impact.
                </div>
            `
        },


        habits: {

            icon: "🌱",

            category: "LIFESTYLE",

            title: "Build Sustainable Habits",

            content: `
                <h3>What is a Sustainable Habit?</h3>

                <p>
                    A sustainable habit is a regular action that
                    reduces unnecessary environmental impact and
                    helps conserve resources.
                </p>

                <h3>Simple Daily Habits</h3>

                <ul>
                    <li>Carry a reusable shopping bag.</li>
                    <li>Use a reusable water bottle.</li>
                    <li>Avoid unnecessary plastic packaging.</li>
                    <li>Reuse suitable containers.</li>
                    <li>Separate waste correctly.</li>
                    <li>Encourage others to reduce plastic use.</li>
                </ul>

                <h3>Start Small</h3>

                <p>
                    You do not need to change everything in one day.
                    Start with one simple habit and gradually add
                    more sustainable choices to your daily routine.
                </p>

                <div class="theory-tip">
                    💚 <strong>Small actions become powerful when
                    they become daily habits.</strong>
                </div>
            `
        },


        environment: {

            icon: "🌳",

            category: "ENVIRONMENT",

            title: "Protect Our Green Spaces",

            content: `
                <h3>What are Green Spaces?</h3>

                <p>
                    Green spaces include parks, forests, gardens,
                    wetlands and other natural areas that support
                    plants, animals and people.
                </p>

                <h3>How Does Plastic Affect Them?</h3>

                <p>
                    Plastic waste can accumulate in natural areas,
                    affect wildlife and reduce the cleanliness and
                    beauty of the environment.
                </p>

                <ul>
                    <li>Keep plastic waste out of natural areas.</li>
                    <li>Use reusable products.</li>
                    <li>Never throw plastic waste on the ground.</li>
                    <li>Participate in local cleanup activities.</li>
                    <li>Encourage responsible waste disposal.</li>
                </ul>

                <div class="theory-tip">
                    🌳 <strong>Protect nature:</strong>
                    Clean surroundings help communities and
                    ecosystems stay healthier.
                </div>
            `
        },


        bags: {

            icon: "🛍️",

            category: "QUICK TIP",

            title: "Carry Reusable Bags",

            content: `
                <h3>Why Use Reusable Bags?</h3>

                <p>
                    Reusable cloth and jute bags can be used many
                    times and can reduce the need for disposable
                    shopping bags.
                </p>

                <h3>Easy Habit</h3>

                <p>
                    Keep a reusable bag in your backpack, vehicle,
                    room or another convenient place so that it is
                    available when you go shopping.
                </p>

                <div class="theory-tip">
                    🛍️ <strong>Challenge:</strong>
                    Take a reusable bag with you on your next
                    shopping trip.
                </div>
            `
        },


        bottle: {

            icon: "💧",

            category: "QUICK TIP",

            title: "Use a Reusable Bottle",

            content: `
                <h3>Why Carry a Reusable Bottle?</h3>

                <p>
                    Carrying your own bottle can help reduce the
                    need to purchase single-use plastic bottles.
                </p>

                <h3>Benefits</h3>

                <ul>
                    <li>Reduces disposable bottle waste.</li>
                    <li>Can be reused many times.</li>
                    <li>Convenient for school, college and travel.</li>
                    <li>Encourages a sustainable daily habit.</li>
                </ul>

                <div class="theory-tip">
                    💧 <strong>Simple action:</strong>
                    Fill your reusable bottle before leaving home.
                </div>
            `
        },


        straws: {

            icon: "🥤",

            category: "QUICK TIP",

            title: "Avoid Plastic Straws",

            content: `
                <h3>Why Avoid Disposable Straws?</h3>

                <p>
                    Plastic straws are commonly used for a short
                    period and then discarded. Because of their
                    small size, they can be difficult to collect
                    after becoming waste.
                </p>

                <h3>Better Choices</h3>

                <ul>
                    <li>Drink directly from a suitable cup.</li>
                    <li>Refuse a straw when it is unnecessary.</li>
                    <li>Choose a reusable alternative when needed.</li>
                </ul>

                <div class="theory-tip">
                    🥤 <strong>One less disposable item is one less
                    item entering the waste stream.</strong>
                </div>
            `
        },


        recycle: {

            icon: "♻️",

            category: "QUICK TIP",

            title: "Recycle Properly",

            content: `
                <h3>Proper Waste Separation</h3>

                <p>
                    Separating recyclable materials from other waste
                    makes responsible waste management easier.
                </p>

                <h3>Good Practices</h3>

                <ol>
                    <li>Keep recyclable materials separate.</li>
                    <li>Do not mix them unnecessarily with food waste.</li>
                    <li>Check local recycling requirements.</li>
                    <li>Use authorized collection or recycling facilities.</li>
                </ol>

                <div class="theory-tip">
                    ♻️ <strong>Think before you throw:</strong>
                    Ask whether an item can be reduced, reused or
                    responsibly recycled.
                </div>
            `
        }

    };


    /* =====================================================
       OPEN RESOURCE
    ===================================================== */

    window.openResource = function (resourceKey) {

        console.log(
            "Opening resource:",
            resourceKey
        );


        const resource =
            resources[resourceKey];


        if (!resource) {

            console.error(
                "Resource not found:",
                resourceKey
            );

            return;

        }


        if (!modal) {

            console.error(
                "Resource modal not found."
            );

            return;

        }


        /* ICON */

        if (modalIcon) {

            modalIcon.textContent =
                resource.icon;

        }


        /* CATEGORY */

        if (modalCategory) {

            modalCategory.textContent =
                resource.category;

        }


        /* TITLE */

        if (modalTitle) {

            modalTitle.textContent =
                resource.title;

        }


        /* THEORY CONTENT */

        if (modalContent) {

            modalContent.innerHTML =
                resource.content;

        }


        /* SHOW MODAL */

        modal.classList.add(
            "active"
        );


        document.body.classList.add(
            "resource-modal-open"
        );


        /*
         * Prevent background scrolling
         */

        document.body.style.overflow =
            "hidden";

    };


    /* =====================================================
       CLOSE RESOURCE
    ===================================================== */

    window.closeResource = function () {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        document.body.classList.remove(
            "resource-modal-open"
        );


        document.body.style.overflow =
            "";

    };


    /* =====================================================
       CLICK OUTSIDE MODAL
    ===================================================== */

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    window.closeResource();

                }

            }
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                window.closeResource();

            }

        }
    );


    /* =====================================================
       ADD THEORY CONTENT STYLING
    ===================================================== */

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        .modal-text {
            text-align: left;
        }

        .modal-text h3 {
            color: #14532d;
            font-size: 19px;
            margin: 22px 0 9px;
        }

        .modal-text h3:first-child {
            margin-top: 0;
        }

        .modal-text p {
            color: #53675b;
            line-height: 1.8;
            margin: 0 0 15px;
        }

        .modal-text ul,
        .modal-text ol {
            color: #53675b;
            line-height: 1.8;
            padding-left: 24px;
            margin: 10px 0 18px;
        }

        .modal-text li {
            margin-bottom: 7px;
        }

        .theory-tip {
            margin-top: 20px;
            padding: 15px 17px;
            border-radius: 12px;
            background: #f0fdf4;
            border-left: 4px solid #16a34a;
            color: #166534;
            line-height: 1.6;
        }

        .resource-modal {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition:
                opacity 0.25s ease,
                visibility 0.25s ease;
        }

        .resource-modal.active {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

    `;


    document.head.appendChild(
        style
    );


    console.log(
        "✅ All PlasticLess resources are ready."
    );

});