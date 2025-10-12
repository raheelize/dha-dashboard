function showLoader(message = "Fetching Data...") {
  let loader = document.getElementById('page-loader');
  
  // Create loader if it doesn't exist yet
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'loader-overlay d-flex align-items-center justify-content-center';
    loader.innerHTML = `
      <div class="loader-glass text-center">
        <div class="spinner-border text-light loader-spinner" role="status"></div>
        <p class="mt-4 fw-semibold text-light loader-text">${message}</p>
      </div>
    `;
    document.body.appendChild(loader);
  } else {
    const textEl = loader.querySelector('.loader-text');
    if (textEl) {
      textEl.textContent = message;
    }
  }

  // Show loader with animation
  loader.classList.remove('d-none');
  document.body.style.pointerEvents = 'none';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => loader.classList.add('show'));
}

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.remove('show');
    setTimeout(() => {
      loader.classList.add('d-none');
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
    }, 300);
  }
}
////////////////////////////////////////////////////


/**
 * Show skeletons inside one or multiple elements
 * @param {HTMLElement|string|NodeList} el - element, selector, or NodeList
 * @param {number} count - number of skeleton lines
 */
function showSkeleton(el, count = 2) {
  const elements = typeof el === "string"
    ? document.querySelectorAll(el)
    : el instanceof NodeList
      ? el
      : [el];

  if (!elements.length) return;

  elements.forEach(element => {
    if (!element) return;

    // Backup original HTML (only if not already stored)
    if (!element.dataset.originalHTML) {
      element.dataset.originalHTML = element.innerHTML;
    }

    element.classList.add("skeleton-wrapper");

    let skeletonHTML = "";
    for (let i = 0; i < count; i++) {
      const sizeClass = i === 0 ? "skeleton-lg" : "skeleton-md";
      skeletonHTML += `<div class="skeleton-block ${sizeClass}"></div>`;
    }

    element.innerHTML = skeletonHTML;
  });
}

/**
 * Hide skeleton(s) and restore original content
 * @param {HTMLElement|string|NodeList} el - element, selector, or NodeList
 */
function hideSkeleton(el) {
  const elements = typeof el === "string"
    ? document.querySelectorAll(el)
    : el instanceof NodeList
      ? el
      : [el];

  if (!elements.length) return;

  elements.forEach(element => {
    if (!element || !element.dataset.originalHTML) return;

    element.innerHTML = element.dataset.originalHTML;
    element.classList.remove("skeleton-wrapper");
    delete element.dataset.originalHTML;
  });
}
