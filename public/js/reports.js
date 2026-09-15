/* ============================================================
   PLASTICLESS - REPORTS JAVASCRIPT
============================================================ */


/* ============================================================
   LOAD CAMPAIGN REPORT DATA
============================================================ */

async function loadReportData() {

    try {

        const response = await fetch(
            "/api/campaigns",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );


        if (!response.ok) {

            console.error(
                "Unable to load campaign data."
            );

            return;

        }


        const data =
            await response.json();


        const campaigns =
            data.campaigns || [];


        /* ====================================================
           VOLUNTEERS
        ==================================================== */

        let volunteers = 0;


        campaigns.forEach(
            function (campaign) {

                volunteers += Number(
                    campaign.participant_count || 0
                );

            }
        );


        const volunteerElement =
            document.getElementById(
                "volunteers"
            );


        if (volunteerElement) {

            volunteerElement.textContent =
                volunteers;

        }


        /* ====================================================
           CAMPAIGN COUNT
        ==================================================== */

        const campaignElement =
            document.getElementById(
                "campaigns"
            );


        if (campaignElement) {

            campaignElement.textContent =
                campaigns.length;

        }


        console.log(
            "Reports loaded successfully:",
            campaigns
        );


    } catch (error) {

        console.error(
            "Report data error:",
            error
        );

    }

}


/* ============================================================
   REPORT BUTTON
============================================================ */

function showReport(reportName) {

    if (!reportName) {

        reportName =
            "Campaign Report";

    }


    alert(
        reportName +
        "\n\n" +
        "This report is ready to view.\n\n" +
        "The report data is connected to your PlasticLess campaign system."
    );

}


/* ============================================================
   RESOURCE
============================================================ */

function openResource(resourceName) {

    if (!resourceName) {

        resourceName =
            "Resource";

    }


    alert(
        resourceName +
        "\n\n" +
        "Resource selected successfully."
    );

}


/* ============================================================
   EXPORT / PRINT REPORT
============================================================ */

function exportReport() {

    window.print();

}


/* ============================================================
   COLLECTION REPORT
============================================================ */

function openCollectionReport() {

    showReport(
        "Collection Report"
    );

}


/* ============================================================
   AREA WISE REPORT
============================================================ */

function openAreaReport() {

    showReport(
        "Area Wise Report"
    );

}


/* ============================================================
   VOLUNTEER REPORT
============================================================ */

function openVolunteerReport() {

    showReport(
        "Volunteer Report"
    );

}


/* ============================================================
   RESOURCE HELPERS
============================================================ */

function openRecyclingGuide() {

    openResource(
        "Recycling Guide"
    );

}


function openAwarenessPosters() {

    openResource(
        "Awareness Posters"
    );

}


function openEducationalVideos() {

    openResource(
        "Educational Videos"
    );

}


function openPracticeQuiz() {

    openResource(
        "Practice Quiz"
    );

}


function openCertificates() {

    openResource(
        "Certificates"
    );

}


/* ============================================================
   START
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadReportData();

    }
);