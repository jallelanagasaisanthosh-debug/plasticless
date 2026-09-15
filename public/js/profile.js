document.addEventListener("DOMContentLoaded", () => {

    const profileAvatar = document.getElementById("profileAvatar");
    const profileImage = document.getElementById("profileImage");
    const avatarLetter = document.getElementById("avatarLetter");

    const profilePictureInput =
        document.getElementById("profilePictureInput");

    const changePictureBtn =
        document.getElementById("changePictureBtn");

    const removePictureBtn =
        document.getElementById("removePictureBtn");

    const pictureMessage =
        document.getElementById("pictureMessage");


    let currentUser = null;



    /* =========================================
       MESSAGE
    ========================================= */

    function showMessage(message, type) {

        pictureMessage.textContent = message;

        pictureMessage.className =
            "picture-message " + type;

    }



    /* =========================================
       LOAD USER
    ========================================= */

    async function loadProfile() {

        try {

            const response = await fetch("/api/me", {
                credentials: "include"
            });

            const data = await response.json();


            if (!data.loggedIn) {

                window.location.href = "login.html";

                return;

            }


            currentUser = data.user;


            const name =
                currentUser.name ||
                currentUser.full_name ||
                currentUser.username ||
                "User";


            const email =
                currentUser.email || "";


            const role =
                currentUser.role || "citizen";


            document.getElementById("profileName")
                .textContent = name;


            document.getElementById("profileEmail")
                .textContent = email;


            document.getElementById("profileRole")
                .textContent =
                capitalize(role);


            document.getElementById("detailName")
                .textContent = name;


            document.getElementById("detailEmail")
                .textContent = email;


            document.getElementById("detailRole")
                .textContent =
                capitalize(role);


            document.getElementById("detailDate")
                .textContent =
                formatDate(
                    currentUser.created_at ||
                    currentUser.createdAt
                );


            setProfilePicture(
                currentUser.profile_picture
            );


        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

        }

    }



    /* =========================================
       SET PROFILE PICTURE
    ========================================= */

    function setProfilePicture(imagePath) {

        const name =
            currentUser?.name ||
            currentUser?.full_name ||
            currentUser?.username ||
            "User";


        const firstLetter =
            name.trim().charAt(0).toUpperCase();


        avatarLetter.textContent =
            firstLetter || "U";


        if (imagePath) {

            profileImage.src =
                imagePath + "?t=" + Date.now();

            profileImage.style.display =
                "block";

            avatarLetter.style.display =
                "none";

            removePictureBtn.style.display =
                "inline-block";

        } else {

            profileImage.src = "";

            profileImage.style.display =
                "none";

            avatarLetter.style.display =
                "block";

            removePictureBtn.style.display =
                "none";

        }

    }



    /* =========================================
       CHANGE PICTURE BUTTON
    ========================================= */

    changePictureBtn.addEventListener(
        "click",
        () => {

            profilePictureInput.click();

        }
    );



    /* =========================================
       SELECT IMAGE
    ========================================= */

    profilePictureInput.addEventListener(
        "change",
        async () => {

            const file =
                profilePictureInput.files[0];


            if (!file) {

                return;

            }


            /* File type */

            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp"
            ];


            if (!allowedTypes.includes(file.type)) {

                showMessage(
                    "Please select a JPG, PNG or WebP image.",
                    "error"
                );

                profilePictureInput.value = "";

                return;

            }


            /* File size */

            if (file.size > 5 * 1024 * 1024) {

                showMessage(
                    "Image must be smaller than 5MB.",
                    "error"
                );

                profilePictureInput.value = "";

                return;

            }


            /* Preview */

            const reader =
                new FileReader();


            reader.onload = function(event) {

                profileImage.src =
                    event.target.result;

                profileImage.style.display =
                    "block";

                avatarLetter.style.display =
                    "none";

            };


            reader.readAsDataURL(file);


            /* Upload */

            await uploadProfilePicture(file);

        }
    );



    /* =========================================
       UPLOAD PROFILE PICTURE
    ========================================= */

    async function uploadProfilePicture(file) {

        const formData =
            new FormData();

        formData.append(
            "profile_picture",
            file
        );


        changePictureBtn.disabled = true;

        changePictureBtn.textContent =
            "⏳ Uploading...";


        try {

            const response =
                await fetch(
                    "/api/profile/picture",
                    {
                        method: "POST",
                        credentials: "include",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Upload failed."
                );

            }


            currentUser.profile_picture =
                data.profile_picture;


            setProfilePicture(
                data.profile_picture
            );


            showMessage(
                "✓ Profile picture updated successfully!",
                "success"
            );


        } catch (error) {

            console.error(
                "Picture upload error:",
                error
            );


            showMessage(
                error.message ||
                "Could not upload profile picture.",
                "error"
            );


            setProfilePicture(
                currentUser.profile_picture
            );

        }


        changePictureBtn.disabled = false;

        changePictureBtn.textContent =
            "📷 Change Picture";

        profilePictureInput.value = "";

    }



    /* =========================================
       REMOVE PROFILE PICTURE
    ========================================= */

    removePictureBtn.addEventListener(
        "click",
        async () => {

            if (
                !confirm(
                    "Remove your profile picture?"
                )
            ) {

                return;

            }


            removePictureBtn.disabled =
                true;


            try {

                const response =
                    await fetch(
                        "/api/profile/picture",
                        {
                            method: "DELETE",
                            credentials: "include"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Could not remove picture."
                    );

                }


                currentUser.profile_picture =
                    null;


                setProfilePicture(null);


                showMessage(
                    "✓ Profile picture removed.",
                    "success"
                );


            } catch (error) {

                showMessage(
                    error.message ||
                    "Could not remove profile picture.",
                    "error"
                );

            }


            removePictureBtn.disabled =
                false;

        }
    );



    /* =========================================
       HELPERS
    ========================================= */

    function capitalize(value) {

        if (!value) {

            return "Citizen";

        }

        return value.charAt(0).toUpperCase() +
            value.slice(1);

    }


    function formatDate(dateValue) {

        if (!dateValue) {

            return "—";

        }


        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {

            return "—";

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



    loadProfile();

});