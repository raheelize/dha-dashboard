document.addEventListener('DOMContentLoaded', function () {

  // --- Grab elements ---
  const statCards = document.querySelectorAll('.stat-card');
  const cityCards = document.querySelectorAll('.city-card');

  const chartsFront = document.querySelector('.charts-panel');
  const chartsBack = document.querySelector('.charts-panel-back');

  const progressbarspanel = document.getElementById('progressbarspanel');
  const purchasedbarspanel = document.getElementById('purchasedbarspanel');
  const stationwisechartpanel = document.getElementById('stationwisechartpanel');

  // --- Helper to show/hide elements ---
  function show(el) { if (el) el.classList.remove('d-none'); }
  function hide(el) { if (el) el.classList.add('d-none'); }

  // --- Helper to mark selection ---
  function setSelected(cards, selectedCard) {
    cards.forEach(c => c.classList.remove('selected'));
    if (selectedCard) selectedCard.classList.add('selected');
  }

  // --- Show front or back ---
  function showFront() {
    hide(chartsBack);
    show(chartsFront);
  }

  function showBack() {
    hide(chartsFront);
    show(chartsBack);
  }

  // --- Logic when a stat card is clicked ---
  function handleStatCardClick(card) {
    setSelected(statCards, card);
    showFront(); // Always show front for stat cards

    // Hide both front panels first
    hide(progressbarspanel);
    hide(purchasedbarspanel);

    const cardId = card.id;

    if (cardId === 'stat-card-purchased') {
      show(purchasedbarspanel);
    } else {
      show(progressbarspanel);
    }
  }

  // --- Logic when a city card is clicked ---
  function handleCityCardClick(card) {
    setSelected(cityCards, card);
    showBack(); // Flip to back
    hide(progressbarspanel);
    hide(purchasedbarspanel);
    show(stationwisechartpanel);
  }

  // --- Event Listeners ---
  // statCards.forEach(card => {
  //   card.addEventListener('click', () => handleStatCardClick(card));
  // });

  document.addEventListener('click', function (e) {
    const card = e.target.closest('.stat-card'); 
    if (!card) return;
    handleStatCardClick(card);
  });

  // cityCards.forEach(card => {
  //   card.addEventListener('click', () => handleCityCardClick(card));
  // });


  document.addEventListener('click', function (e) {
    const card = e.target.closest('.city-card'); 
    if (!card) return;
    handleCityCardClick(card);
  });

  // --- Default state on page load ---
  const defaultCard = document.getElementById('stat-card-possessed');
  if (defaultCard) {
    setSelected(statCards, defaultCard);
    handleStatCardClick(defaultCard);
  } else if (statCards.length) {
    handleStatCardClick(statCards[0]);
  }

});


document.querySelector('.close-btn').addEventListener('click', () => {
    const wrapper = document.getElementById('legend');
    wrapper.style.display = 'none'; // hides the entire legend
});