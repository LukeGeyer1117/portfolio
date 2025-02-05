
// Change the dropdown arrow based on where the mouse is hovering
let dropdownHolder = document.querySelector("#dropdown-holder");
let dropdownArrow = document.querySelector("#dropdown-holder img");

dropdownHolder.addEventListener("mouseover", function() {
    dropdownArrow.src = `${window.location.origin}/images/dropdown_arrow.svg`;
});

dropdownHolder.addEventListener("mouseout", function () {
    dropdownArrow.src = `${window.location.origin}/images/dropup_arrow.svg`;
});

// Keep the dropdown arrow if the user hovers over the dropdown-content
let dropdown = document.querySelector(".dropdown");
dropdown.addEventListener("mouseover", function () {
    dropdownArrow.src = `${window.location.origin}/images/dropdown_arrow.svg`;
});

dropdown.addEventListener("mouseout", function () {
    dropdownArrow.src = `${window.location.origin}/images/dropup_arrow.svg`;
});