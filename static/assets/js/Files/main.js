document.addEventListener("DOMContentLoaded", () => {
    const legendButton = document.getElementById("btn-legend");
    const legend = document.getElementById("legend");
    const legendCheckboxes = document.querySelectorAll(".legend-checkbox");
    const basemapButton = document.getElementById("btn-basemap");
    const changeBasemap = document.getElementById("basemap");
    const closeButtons = document.querySelectorAll(".close-btn");

    // Show legend on load
    legend.classList.add("visible");
    legendButton.classList.add("active");

    // ✅ Helper: close both panels
    function closePanels() {
        legend.classList.remove("visible");
        legendButton.classList.remove("active");
        changeBasemap.classList.remove("visible");
        basemapButton?.classList.remove("active");
    }

    // ✅ Toggle basemap (and auto-close legend)
    function toggleBasemap() {
        if (changeBasemap && basemapButton) {
            const isVisible = changeBasemap.classList.contains("visible");

            closePanels(); // first close both

            if (!isVisible) {
                changeBasemap.classList.add("visible");
                basemapButton.classList.add("active");
            }
        }
    }

    // ✅ Toggle legend (and auto-close basemap)
    function toggleLegend() {
        if (legend && legendButton) {
            const isVisible = legend.classList.contains("visible");

            closePanels(); // first close both

            if (!isVisible) {
                legend.classList.add("visible");
                legendButton.classList.add("active");
            }
        }
    }

    function handleLayerToggle(event) {
        const layerName = event.target.id.replace("-checkbox", "");
        const isChecked = event.target.checked;
        console.log(`Layer ${layerName} is now ${isChecked ? "visible" : "hidden"}`);
    }

    basemapButton?.addEventListener("click", toggleBasemap);

    legendButton.addEventListener("click", (e) => {
        e.preventDefault();
        toggleLegend();
    });

    legendCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleLayerToggle);
    });

    // Handle all close buttons
    //closeButtons.forEach((button) => {
    //    button.addEventListener("click", (e) => {
    //        const parentDiv = e.target.closest(".map-overlay-box");
    //        if (parentDiv) {
    //            parentDiv.classList.remove("visible");
    //            switch (parentDiv.id) {
    //                case "basemap":
    //                    basemapButton?.classList.remove("active");
    //                    break;
    //                case "legend":
    //                    legendButton?.classList.remove("active");
    //                    break;
    //            }
    //        }
    //    });
    //});

    // ✅ Icon button hover + active effect
    const iconButtons = document.querySelectorAll(".icon-btn");
    iconButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const isActive = button.classList.contains("active");

            if (isActive) {
                // Unselect (remove active style)
                button.classList.remove("active");
                button.style.backgroundColor = "";
                button.style.borderColor = "";
                button.style.color = "";
                button.style.boxShadow = "";
            } else {
                // Select (apply active style)
                button.classList.add("active");
                button.style.backgroundColor = "#1058ad";
                button.style.borderColor = "#063f80";
                button.style.color = "#fff";
                button.style.boxShadow = "0 0 6px rgba(16, 88, 173, 0.6)";
            }
        });

        button.addEventListener("mouseenter", () => {
            if (!button.classList.contains("active")) {
                button.style.backgroundColor = "#1058ad";
                button.style.borderColor = "#063f80";
                button.style.color = "#fff";
            }
        });

        button.addEventListener("mouseleave", () => {
            if (!button.classList.contains("active")) {
                button.style.backgroundColor = "";
                button.style.borderColor = "";
                button.style.color = "";
            }
        });
    });

    // Table toggle buttons
    const closeTableBtn = document.getElementById("tableclosebtn");
    const tableContainer = document.getElementById("tableContainer");
    const coords = document.getElementById("coords");
    const tableButtons = [
        document.getElementById("table-conduit"),
        document.getElementById("table-sites")
    ];

    let activeButton = null;

    function updateCoordsPosition(isActive) {
        if (coords) {
            coords.style.transition = "bottom 1s ease";
            coords.style.bottom = isActive ? "24%" : "4px";
        }
    }

    function resetIcons() {
        tableButtons.forEach(btn => {
            const icon = btn?.querySelector("i");
            if (icon) icon.style.color = "";
        });
    }

    function closeTable() {
        tableContainer.classList.remove("active");
        updateCoordsPosition(false);
        resetIcons();
        activeButton = null;

        // ✅ Hide close button
        if (closeTableBtn) {
            closeTableBtn.classList.remove("show");
        }
    }

    if (closeTableBtn) {
        closeTableBtn.addEventListener("click", closeTable);
    }

    tableButtons.forEach(button => {
        if (!button) return;
        const icon = button.querySelector("i");

        button.addEventListener("click", () => {
            const isSameButton = activeButton === button;
            const isTableOpen = tableContainer.classList.contains("active");

            if (isSameButton && isTableOpen) {
                closeTable();
            } else {
                tableContainer.classList.add("active");
                updateCoordsPosition(true);
                resetIcons();
                if (icon) icon.style.color = "#630c06";

                // ✅ Show close button
                if (closeTableBtn) {
                    closeTableBtn.classList.add("show");
                }

                activeButton = button;
            }
        });
    });
});
