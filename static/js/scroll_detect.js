document.addEventListener("DOMContentLoaded", function () {
    const triggerDiv = document.getElementById("nav_trigger");
    const untriggerDiv = document.getElementById("nav_untrigger");
    const fixedDiv = document.getElementById("fixed-div");

    window.addEventListener("scroll", function () {
        const triggerPosition = triggerDiv.getBoundingClientRect().top;
        const untriggerPosition = untriggerDiv.getBoundingClientRect().top;

        // Check if the top of trigger-div has scrolled past the top of the viewport
        if (untriggerPosition > window.innerHeight && triggerPosition <= 0) {
            fixedDiv.classList.remove("hidden");  // Show fixed div
        } else {
            fixedDiv.classList.add("hidden");     // Hide fixed div
        }

    });

});