document.addEventListener("DOMContentLoaded", () => {
    const legendButton = document.getElementById("btn-legend")
    const legend = document.getElementById("legend")
    const legendCheckboxes = document.querySelectorAll(".legend-checkbox")
    const basemapButton = document.getElementById("btn-basemap")
    const changeBasemap = document.getElementById("basemap")
    const outboundsButton = document.getElementById("btn-outbounds")
    const outboundsDiv = document.getElementById("outbounds")
    const closeButtons = document.querySelectorAll(".close-btn")
    const sidepanelButton = document.getElementById("btn-sidepanel")
    const sidepanelDiv = document.getElementById("sidepanel")

    // Show legend on load
    legend.classList.add("visible")
    legendButton.classList.add("active")

    function toggleBasemap() {
        if (changeBasemap && basemapButton) {
            const isVisible = changeBasemap.classList.contains("visible")
            if (isVisible) {
                changeBasemap.classList.remove("visible")
                basemapButton.classList.remove("active")
            } else {
                changeBasemap.classList.add("visible")
                basemapButton.classList.add("active")

                outboundsDiv?.classList.remove("visible")
                outboundsButton?.classList.remove("active")
            }
        }
    }

    function toggleLegend() {
        const isVisible = legend.classList.contains("visible")
        if (isVisible) {
            legend.classList.remove("visible")
            legendButton.classList.remove("active")
        } else {
            legend.classList.add("visible")
            legendButton.classList.add("active")
        }
    }

    function toggleOutbounds(e) {
        e.preventDefault()
        if (outboundsDiv && outboundsButton) {
            const isVisible = outboundsDiv.classList.contains("visible")
            if (isVisible) {
                outboundsDiv.classList.remove("visible")
                outboundsButton.classList.remove("active")
            } else {
                outboundsDiv.classList.add("visible")
                outboundsButton.classList.add("active")

                changeBasemap?.classList.remove("visible")
                basemapButton?.classList.remove("active")
            }
        }
    }

    function toggleSidepanelSlide() {
        const isActive = sidepanelDiv.classList.contains("active")
        if (isActive) {
            sidepanelDiv.classList.remove("active")
            sidepanelButton.classList.remove("active")
        } else {
            sidepanelDiv.classList.add("active")
            sidepanelButton.classList.add("active")
        }
    }

    function handleLayerToggle(event) {
        const layerName = event.target.id.replace("-checkbox", "")
        const isChecked = event.target.checked
        console.log(`Layer ${layerName} is now ${isChecked ? "visible" : "hidden"}`)
    }

    basemapButton?.addEventListener("click", toggleBasemap)
    legendButton.addEventListener("click", (e) => {
        e.preventDefault()
        toggleLegend()
    })
    outboundsButton?.addEventListener("click", toggleOutbounds)

    legendCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleLayerToggle)
    })

    // Handle all close buttons (for legend, basemap, outbounds, sidepanel)
    closeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const parentDiv = e.target.closest(".map-overlay-box")
            if (parentDiv) {
                parentDiv.classList.remove("visible")
                switch (parentDiv.id) {
                    case "basemap":
                        basemapButton?.classList.remove("active")
                        break
                    case "outbounds":
                        outboundsButton?.classList.remove("active")
                        break
                    case "legend":
                        legendButton?.classList.remove("active")
                        break
                    case "sidepanel":
                        sidepanelButton?.classList.remove("active")
                        sidepanelDiv.classList.remove("active")
                        break
                }
            }
        })
    })

    // Toggle sidepanel on click or hover
    sidepanelButton.addEventListener("click", toggleSidepanelSlide)
    sidepanelButton.addEventListener("mouseenter", () => {
        sidepanelDiv.classList.add("active")
        sidepanelButton.classList.add("active")
    })

    sidepanelDiv.addEventListener("mouseleave", () => {
        sidepanelDiv.classList.remove("active")
        sidepanelButton.classList.remove("active")
    })

    // Responsive handling
    //window.addEventListener("resize", handleResize)
    //handleResize()

    // Icon button hover effect
    const iconButtons = document.querySelectorAll(".icon-btn")
    iconButtons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#1058ad"
            button.style.borderColor = "#063f80"
        })
        button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = ""
            button.style.borderColor = ""
        })
    })
})
