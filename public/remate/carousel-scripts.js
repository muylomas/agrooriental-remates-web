// Carrusel de "Destacados": arma una selección de 6 lotes y los renderiza
// arriba de la grilla de lotes, usando lotCarouselTemplate (ver lot-template.js).
//
// Criterio de selección:
//   - Los últimos 4 lotes con pique (ordenados por fecha del pique más reciente).
//   - Si hay menos de 4 lotes con pique, se completa al azar con otros lotes
//     hasta llegar a 6 en total.
//   - El orden final en el carrusel es aleatorio.
//
// Cada AOC_REFRESH_INTERVAL_MS se vuelve a pedir el estado de los lotes a la
// API (no se reusa el `lots` global de la grilla, para no interferir con los
// piques en vivo por socket) y se recalcula la selección. Los lotes que
// entran, salen o cambian de posición se animan de a uno, no todos juntos.

const AOC_REFRESH_INTERVAL_MS = 15000;
const AOC_STEP_ANIMATION_MS = 450;
const AOC_STEP_PAUSE_MS = 150;

let aocWrap = null;
let aocTrack = null;
let aocDotsWrap = null;
let aocPrevBtn = null;
let aocNextBtn = null;

let aocCards = [];
let aocDots = [];
let aocLotsSource = [];
let aocFeaturedIds = [];
let aocApplyingDiff = false;
let aocScrollTicking = false;

function aocShuffleArray(array) {
    const shuffled = array.slice();

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }

    return shuffled;
};

function getFeaturedLots(sourceLots) {
    const TARGET_COUNT = 6;
    const VOTED_COUNT = 4;

    if (sourceLots.length <= TARGET_COUNT) {
        return aocShuffleArray(sourceLots);
    }

    const bidLots = sourceLots
        .filter(function (lot) { return lot.auctionBidcustomerId && lot.lastBidDate; })
        .sort(function (a, b) { return new Date(b.lastBidDate) - new Date(a.lastBidDate); });

    const votedSelected = bidLots.slice(0, VOTED_COUNT);

    const votedIds = {};
    for (let index in votedSelected) {
        votedIds[votedSelected[index].lotId] = true;
    }

    const remainingPool = sourceLots.filter(function (lot) { return !votedIds[lot.lotId]; });
    const remainingNeeded = TARGET_COUNT - votedSelected.length;
    const randomFill = aocShuffleArray(remainingPool).slice(0, remainingNeeded);

    return aocShuffleArray(votedSelected.concat(randomFill));
};

function buildFeaturedLotCard(lot) {
    let cardHTML = lotCarouselTemplate;

    for (let field in lot) {
        if (cardHTML.indexOf("__lot_" + field + "__") != -1) {
            cardHTML = cardHTML.replace(new RegExp("__lot_" + field + "__", 'g'), lot[field]);
        }
    }

    cardHTML =
        cardHTML
            .replace(new RegExp("__lot_imagesArray_0__", 'g'), lot.imagesArray[0]);

    let lastPrice = 0;
    if ("lastPrice" in lot && lot.lastPrice) {
        lastPrice = lot.lastPrice;
    }

    const fixedDigits = lot.auctionPriceType == 1 ? 2 : 0;

    cardHTML =
        cardHTML
            .replace(new RegExp("__lot_lastPriceAuction_formatted__", 'g'), lastPrice.toFixed(fixedDigits));

    return cardHTML;
};

function createFeaturedLotElement(lot) {
    const temp = document.createElement('div');
    temp.innerHTML = buildFeaturedLotCard(lot).trim();
    return temp.firstElementChild;
};

function findFeaturedCardElement(lotId) {
    return aocTrack.querySelector('[data-lot-id="' + lotId + '"]');
};

function scrollToCard(i) {
    const card = aocCards[i];
    if (!card) {
        return;
    }
    aocTrack.scrollTo({ left: card.offsetLeft - aocTrack.offsetLeft, behavior: 'smooth' });
};

function currentCardIndex() {
    let closest = 0;
    let closestDist = Infinity;
    aocCards.forEach(function (c, i) {
        const dist = Math.abs(c.offsetLeft - aocTrack.offsetLeft - aocTrack.scrollLeft);
        if (dist < closestDist) {
            closestDist = dist;
            closest = i;
        }
    });
    return closest;
};

function rebuildFeaturedDots() {
    aocDotsWrap.innerHTML = "";

    aocCards.forEach(function (_, i) {
        const dot = document.createElement('button');
        if (i === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', function () { scrollToCard(i); });
        aocDotsWrap.appendChild(dot);
    });

    aocDots = Array.prototype.slice.call(aocDotsWrap.children);
};

function bindCarouselControls() {
    if (aocPrevBtn) {
        aocPrevBtn.onclick = function () { scrollToCard(Math.max(0, currentCardIndex() - 1)); };
    }
    if (aocNextBtn) {
        aocNextBtn.onclick = function () { scrollToCard(Math.min(aocCards.length - 1, currentCardIndex() + 1)); };
    }

    aocTrack.onscroll = function () {
        if (aocScrollTicking) {
            return;
        }
        aocScrollTicking = true;
        requestAnimationFrame(function () {
            const idx = currentCardIndex();
            aocDots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
            aocScrollTicking = false;
        });
    };
};

function initFeaturedLotsCarousel() {
    aocWrap = document.getElementById('aoc-carousel-wrap');
    aocTrack = document.getElementById('aocTrack');
    aocDotsWrap = document.getElementById('aocDots');

    if (!aocWrap || !aocTrack || !aocDotsWrap || !lots.length) {
        return;
    }

    aocLotsSource = lots;

    const featuredLots = getFeaturedLots(aocLotsSource);
    if (!featuredLots.length) {
        return;
    }

    featuredLots.forEach(function (lot) {
        aocTrack.appendChild(createFeaturedLotElement(lot));
    });

    aocFeaturedIds = featuredLots.map(function (lot) { return lot.lotId; });
    aocCards = Array.prototype.slice.call(aocTrack.children);
    aocWrap.classList.remove('d-none');

    aocPrevBtn = aocWrap.querySelector('.aoc-arrow.aoc-prev');
    aocNextBtn = aocWrap.querySelector('.aoc-arrow.aoc-next');

    rebuildFeaturedDots();
    bindCarouselControls();

    setTimeout(refreshFeaturedLotsCarousel, AOC_REFRESH_INTERVAL_MS);
};

// ---- Actualización periódica (cada AOC_REFRESH_INTERVAL_MS) ----

function refreshFeaturedLotsCarousel() {
    $.get('/api/cattle/lots/refresh')
        .done(function (response) {
            const freshLots = (response && response.lots && response.lots.length) ? response.lots : null;
            if (freshLots) {
                aocLotsSource = freshLots;
            }

            const newFeatured = getFeaturedLots(aocLotsSource);
            applyFeaturedLotsDiff(newFeatured);
        })
        .always(function () {
            setTimeout(refreshFeaturedLotsCarousel, AOC_REFRESH_INTERVAL_MS);
        });
};

function applyFeaturedLotsDiff(newFeaturedLots) {
    if (aocApplyingDiff) {
        return;
    }

    const newIds = newFeaturedLots.map(function (lot) { return lot.lotId; });
    const sameOrder =
        newIds.length === aocFeaturedIds.length &&
        newIds.every(function (id, i) { return id === aocFeaturedIds[i]; });

    if (sameOrder) {
        return;
    }

    const steps = [];

    // 1) Lotes que salen del carrusel.
    aocFeaturedIds.forEach(function (lotId) {
        if (newIds.indexOf(lotId) === -1) {
            steps.push({ type: 'remove', lotId: lotId });
        }
    });

    // 2) Lotes que entran al carrusel.
    newFeaturedLots.forEach(function (lot) {
        if (aocFeaturedIds.indexOf(lot.lotId) === -1) {
            steps.push({ type: 'add', lot: lot });
        }
    });

    // 3) Lo que quedó en otro orden se corrige al final, un lote a la vez.
    steps.push({ type: 'reorder', order: newIds });

    aocApplyingDiff = true;
    runFeaturedStepsSequentially(steps, 0, function () {
        aocApplyingDiff = false;
    });
};

function runFeaturedStepsSequentially(steps, index, onComplete) {
    if (index >= steps.length) {
        if (onComplete) {
            onComplete();
        }
        return;
    }

    const step = steps[index];
    const next = function () {
        setTimeout(function () { runFeaturedStepsSequentially(steps, index + 1, onComplete); }, AOC_STEP_PAUSE_MS);
    };

    if (step.type === 'remove') {
        removeFeaturedLotCard(step.lotId, next);
    }
    else if (step.type === 'add') {
        addFeaturedLotCard(step.lot, next);
    }
    else if (step.type === 'reorder') {
        reorderFeaturedLotCards(step.order, next);
    }
    else {
        next();
    }
};

function removeFeaturedLotCard(lotId, done) {
    const card = findFeaturedCardElement(lotId);
    aocFeaturedIds = aocFeaturedIds.filter(function (id) { return id != lotId; });

    if (!card) {
        done();
        return;
    }

    card.classList.add('aoc-card-exit-active');

    setTimeout(function () {
        card.remove();
        aocCards = Array.prototype.slice.call(aocTrack.children);
        rebuildFeaturedDots();
        done();
    }, AOC_STEP_ANIMATION_MS);
};

function addFeaturedLotCard(lot, done) {
    const el = createFeaturedLotElement(lot);
    el.classList.add('aoc-card-enter');
    aocTrack.appendChild(el);

    aocFeaturedIds.push(lot.lotId);
    aocCards = Array.prototype.slice.call(aocTrack.children);
    rebuildFeaturedDots();

    // Doble rAF para asegurarnos de que el navegador pintó el estado "enter"
    // antes de sacarle la clase y disparar la transición hacia el estado final.
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            el.classList.remove('aoc-card-enter');
        });
    });

    setTimeout(done, AOC_STEP_ANIMATION_MS);
};

// Reordena de a un lote por vez: busca la primera posición que no coincide
// con el orden nuevo, mueve ese lote a su lugar animando el desplazamiento
// (técnica FLIP) y repite hasta que el orden en pantalla coincide.
function reorderFeaturedLotCards(newOrder, done) {
    const currentOrder = Array.prototype.slice.call(aocTrack.children)
        .map(function (el) { return el.getAttribute('data-lot-id'); });

    let mismatchIndex = -1;
    for (let i = 0; i < newOrder.length; i++) {
        if (String(newOrder[i]) !== currentOrder[i]) {
            mismatchIndex = i;
            break;
        }
    }

    if (mismatchIndex === -1) {
        aocFeaturedIds = newOrder.slice();
        done();
        return;
    }

    const lotIdToPlace = String(newOrder[mismatchIndex]);
    const card = findFeaturedCardElement(lotIdToPlace);
    const referenceEl = aocTrack.children[mismatchIndex];

    if (!card || card === referenceEl) {
        aocFeaturedIds = newOrder.slice();
        done();
        return;
    }

    const beforeLeft = card.offsetLeft;
    aocTrack.insertBefore(card, referenceEl);
    const afterLeft = card.offsetLeft;
    const delta = beforeLeft - afterLeft;

    card.style.transition = 'none';
    card.style.transform = 'translateX(' + delta + 'px)';
    card.offsetHeight; // fuerza reflow para que el navegador registre la posición inicial

    requestAnimationFrame(function () {
        card.style.transition = 'transform ' + AOC_STEP_ANIMATION_MS + 'ms ease';
        card.style.transform = 'translateX(0)';
    });

    aocCards = Array.prototype.slice.call(aocTrack.children);

    setTimeout(function () {
        card.style.transition = '';
        card.style.transform = '';
        reorderFeaturedLotCards(newOrder, done);
    }, AOC_STEP_ANIMATION_MS + AOC_STEP_PAUSE_MS);
};

window.addEventListener('load', function () {
    initFeaturedLotsCarousel();
});
