/**
 * navbar-loader.js
 * ----------------
 * Fetches and injects shared partials (primary navbar, secondary navbar, footer)
 * then runs post-load setup: active link highlighting, secondary navbar positioning,
 * and secondary nav link active state on click.
 *
 * Usage in HTML:
 *   1. Add placeholder elements:
 *        <div id="primary-navbar-placeholder"></div>
 *        <div id="secondary-navbar-placeholder"></div>  <!-- only on pages that need it -->
 *        <div id="footer-placeholder"></div>
 *
 *   2. Set the active page on <body>:
 *        <body data-page="hospital">
 *      Valid values: index, about, hospital, old-age-home, school, contact, donate
 *
 *   3. For pages with a secondary navbar, set the partial path on <body>:
 *        <body data-page="hospital" data-secondary-navbar="partials/navbar-secondary-hospital.html">
 *
 *   4. Include this script (defer recommended):
 *        <script src="js/navbar-loader.js" defer></script>
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. Helpers ─────────────────────────────────────────────── */
  
    /**
     * Fetch an HTML partial and inject it into a placeholder element.
     * Returns a Promise that resolves when the injection is complete.
     */
    function loadPartial(placeholderId, partialPath) {
      const placeholder = document.getElementById(placeholderId);
      if (!placeholder || !partialPath) return Promise.resolve();
  
      return fetch(partialPath)
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load partial: ' + partialPath);
          return res.text();
        })
        .then(function (html) {
          placeholder.innerHTML = html;
        })
        .catch(function (err) {
          console.error(err);
        });
    }
  
    /* ── 2. Read page metadata from <body> ───────────────────────── */
  
    const body               = document.body;
    const currentPage        = body.dataset.page        || '';
    const secondaryNavPath   = body.dataset.secondaryNavbar || '';
  
    /* ── 3. Load all partials in parallel, then run setup ─────────── */
  
    Promise.all([
      loadPartial('primary-navbar-placeholder',   'partials/navbar-primary.html'),
      loadPartial('secondary-navbar-placeholder', secondaryNavPath),
      loadPartial('footer-placeholder',           'partials/footer.html'),
    ]).then(function () {
  
      /* ── 4. Mark the active primary nav link ─────────────────────── */
      if (currentPage) {
        // Each <a> in the primary navbar has href like "hospital.html"
        // Match against data-page value
        const primaryLinks = document.querySelectorAll('#primaryNavbar .nav-link');
        primaryLinks.forEach(function (link) {
          const href = link.getAttribute('href') || '';
          // Strip ".html" from href filename and compare
          const pageName = href.replace('.html', '');
          if (pageName === currentPage) {
            link.classList.add('active');
          }
        });
      }
  
      /* ── 5. Secondary navbar: dynamic positioning ────────────────── */
      const primaryNavbar   = document.querySelector('#primaryNavbar');
      const secondaryNavbar = document.querySelector('#secondaryNavbar');
  
      if (primaryNavbar && secondaryNavbar) {
        function updateNavbarPositions() {
          const primaryHeight   = primaryNavbar.offsetHeight;
          const secondaryHeight = secondaryNavbar.offsetHeight;
          const totalHeight     = primaryHeight + secondaryHeight;
  
          // Pin secondary navbar just below primary
          secondaryNavbar.style.top = primaryHeight + 'px';
  
          // Give the body enough top padding to clear both bars
          body.style.paddingTop = totalHeight + 'px';
  
          // Offset anchor-link scrolling so sections aren't hidden under navbars
          document.querySelectorAll('section[id]').forEach(function (section) {
            section.style.scrollMarginTop = (totalHeight + 10) + 'px';
          });
        }
  
        updateNavbarPositions();
        window.addEventListener('resize', updateNavbarPositions);
  
        /* ── 6. Secondary nav link active state on click ─────────────── */
        document.querySelectorAll('.side-nav .nav-link').forEach(function (link) {
          link.addEventListener('click', function () {
            document.querySelectorAll('.side-nav .nav-link')
              .forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
          });
        });
      }
  
    });
  
  });