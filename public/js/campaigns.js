/* =====================================================
   PLASTICLESS - CAMPAIGNS
===================================================== */

document.addEventListener("DOMContentLoaded", loadCampaigns);


/* =====================================================
   CAMPAIGN IMAGES
===================================================== */

const campaignImages = {

    "Clean Beach Campaign":
        "clean-beach.jpg",

    "Beach Plastic Cleanup":
        "cleanup.jpg",

    "Plastic-Free City Drive":
        "city-drive.jpg",

    "Plastic-Free Community Drive":
        "community.jpg",

    "Green City Recycling Day":
        "recycle.jpg",

    "Green School Awareness":
        "school.jpg"

};


/* =====================================================
   LOAD CAMPAIGNS
===================================================== */

async function loadCampaigns() {

    const grid =
        document.getElementById("campaignGrid");

    const count =
        document.getElementById("campaignCount");


    try {

        const response =
            await fetch("/api/campaigns", {
                credentials: "include",
                cache: "no-store"
            });


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load campaigns"
            );

        }


        const campaigns =
            data.campaigns || [];


        if (count) {

            count.textContent =
                `${campaigns.length} Campaigns`;

        }


        if (campaigns.length === 0) {

            grid.innerHTML = `

                <div class="empty-box">

                    <h3>
                        🌱 No campaigns available
                    </h3>

                    <p>
                        New campaigns will appear here soon.
                    </p>

                </div>

            `;

            return;

        }


        grid.innerHTML =
            campaigns.map(createCampaignCard).join("");


        await checkJoinedStatus(campaigns);


    } catch (error) {

        console.error(
            "Campaign loading error:",
            error
        );


        grid.innerHTML = `

            <div class="empty-box">

                <h3>
                    ⚠️ Unable to load campaigns
                </h3>

                <p>
                    Please make sure the server is running
                    and try again.
                </p>

            </div>

        `;

    }

}


/* =====================================================
   CREATE CAMPAIGN CARD
===================================================== */

function createCampaignCard(campaign) {

    const image =
        campaignImages[campaign.title]
        || "cleanup.jpg";


    const participants =
        Number(
            campaign.participant_count ||
            campaign.participants ||
            0
        );


    const maxParticipants =
        Number(
            campaign.max_participants ||
            100
        );


    let percentage =
        (participants / maxParticipants) * 100;


    percentage =
        Math.min(percentage, 100);


    const date =
        formatDate(campaign.campaign_date);


    return `

        <article
            class="campaign-card"
            data-campaign-id="${campaign.id}"
        >


            <div class="campaign-image-wrapper">

                <img
                    src="images/${image}"
                    alt="${escapeHtml(campaign.title)}"
                    class="campaign-image"
                    onerror="this.src='images/cleanup.jpg'"
                >

                <div class="campaign-status">
                    🌿 Plastic-Free
                </div>

            </div>


            <div class="campaign-content">


                <h3>
                    ${escapeHtml(campaign.title)}
                </h3>


                <p class="campaign-description">

                    ${escapeHtml(
                        campaign.description ||
                        "Join this campaign and help reduce plastic pollution."
                    )}

                </p>


                <div class="campaign-details">


                    <div class="detail">

                        <span class="detail-label">
                            📍 Location
                        </span>

                        <span class="detail-value">
                            ${escapeHtml(
                                campaign.location ||
                                "Community"
                            )}
                        </span>

                    </div>


                    <div class="detail">

                        <span class="detail-label">
                            📅 Date
                        </span>

                        <span class="detail-value">
                            ${date}
                        </span>

                    </div>


                </div>


                <div class="participant-header">

                    <span>
                        👥 Participants
                    </span>

                    <span>
                        ${participants}/${maxParticipants}
                    </span>

                </div>


                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width: ${percentage}%"
                    ></div>

                </div>


                <button
                    class="join-button"
                    data-id="${campaign.id}"
                    onclick="joinCampaign(${campaign.id}, this)"
                >
                    Join Campaign
                </button>


            </div>

        </article>

    `;

}


/* =====================================================
   CHECK JOINED STATUS
===================================================== */

async function checkJoinedStatus(campaigns) {

    for (const campaign of campaigns) {

        try {

            const response =
                await fetch(
                    `/api/campaigns/${campaign.id}/status`,
                    {
                        credentials: "include",
                        cache: "no-store"
                    }
                );


            const data =
                await response.json();


            if (
                data.success &&
                data.joined
            ) {

                const button =
                    document.querySelector(
                        `.join-button[data-id="${campaign.id}"]`
                    );


                if (button) {

                    button.textContent =
                        "✓ Joined";

                    button.classList.add("joined");

                    button.disabled = true;

                }

            }

        } catch (error) {

            console.log(
                "Status check failed:",
                error
            );

        }

    }

}


/* =====================================================
   JOIN CAMPAIGN
===================================================== */

async function joinCampaign(
    campaignId,
    button
) {

    button.disabled = true;

    button.textContent =
        "Joining...";


    try {

        const response =
            await fetch(
                `/api/campaigns/${campaignId}/join`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            data.loginRequired
        ) {

            alert(
                "Please login first to join a campaign."
            );

            window.location.href =
                "login.html";

            return;

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to join campaign"
            );

        }


        button.textContent =
            "✓ Joined";

        button.classList.add("joined");

        button.disabled = true;


        alert(
            "🎉 You successfully joined the campaign!"
        );


        loadCampaigns();


    } catch (error) {

        console.error(
            "Join campaign error:",
            error
        );


        button.disabled = false;

        button.textContent =
            "Join Campaign";


        alert(
            error.message ||
            "Unable to join campaign."
        );

    }

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString) {

    if (!dateString) {

        return "Date TBD";

    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}