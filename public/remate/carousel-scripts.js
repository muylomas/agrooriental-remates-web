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
// piques en vivo por socket) y se recalcula la selección.
//
// La cantidad de "slots" (tarjetas) del carrusel es fija: nunca se agregan,
// sacan ni reordenan elementos del DOM. Cuando un lote entra, sale o cambia de
// posición, lo único que pasa es que el slot correspondiente cambia de
// contenido (con un crossfade), un slot a la vez. Como el track nunca cambia
// de cantidad/orden de hijos, el scroll no se ve afectado.

const AOC_REFRESH_INTERVAL_MS = 15000;
const AOC_FADE_ANIMATION_MS = 350;
const AOC_STEP_PAUSE_MS = 150;

let aocWrap = null;
let aocTrack = null;
let aocDotsWrap = null;

let aocSlots = [];
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

// Actualiza el contenido de un slot ya existente en el DOM (no lo mueve, no lo
// saca, no crea uno nuevo): solo cambia lo que hay adentro.
function updateFeaturedSlotContent(slotEl, lot) {
    const freshEl = createFeaturedLotElement(lot);
    slotEl.setAttribute('data-lot-id', String(lot.lotId));
    slotEl.innerHTML = freshEl.innerHTML;
};

function scrollToCard(i) {
    const card = aocSlots[i];
    if (!card) {
        return;
    }
    aocTrack.scrollTo({ left: card.offsetLeft - aocTrack.offsetLeft, behavior: 'smooth' });
};

function currentCardIndex() {
    let closest = 0;
    let closestDist = Infinity;
    aocSlots.forEach(function (c, i) {
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

    aocSlots.forEach(function (_, i) {
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

// Reconstruye los slots desde cero (carga inicial, o el caso raro en que la
// cantidad de destacados cambia entre un refresh y el siguiente).
function rebuildFeaturedSlots(featuredLots) {
    aocTrack.innerHTML = "";

    featuredLots.forEach(function (lot) {
        aocTrack.appendChild(createFeaturedLotElement(lot));
    });

    aocFeaturedIds = featuredLots.map(function (lot) { return lot.lotId; });
    aocSlots = Array.prototype.slice.call(aocTrack.children);

    rebuildFeaturedDots();
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

    rebuildFeaturedSlots(featuredLots);
    aocWrap.classList.remove('d-none');

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

    // Caso raro: cambió la cantidad de destacados (remates con 6 lotes o
    // menos, donde esa cantidad total varió). Ahí sí reconstruimos todo.
    if (newFeaturedLots.length !== aocSlots.length) {
        rebuildFeaturedSlots(newFeaturedLots);
        return;
    }

    const newIds = newFeaturedLots.map(function (lot) { return lot.lotId; });

    const changedSlots = [];
    for (let i = 0; i < newIds.length; i++) {
        if (newIds[i] !== aocFeaturedIds[i]) {
            changedSlots.push(i);
        }
    }

    if (!changedSlots.length) {
        return;
    }

    aocApplyingDiff = true;
    updateSlotsSequentially(changedSlots, 0, newFeaturedLots, newIds, function () {
        aocFeaturedIds = newIds;
        aocApplyingDiff = false;
    });
};

// Actualiza, de a un slot por vez, solo los que efectivamente cambiaron de
// lote (ya sea porque el lote es nuevo en el carrusel, salió, o simplemente
// cambió de posición). Nunca se toca el DOM del track en sí (ni se agregan,
// sacan ni mueven elementos), así que el scroll queda intacto.
function updateSlotsSequentially(changedSlots, step, newFeaturedLots, newIds, onComplete) {
    if (step >= changedSlots.length) {
        onComplete();
        return;
    }

    const slotIndex = changedSlots[step];
    const slotEl = aocSlots[slotIndex];
    const nextLot = newFeaturedLots[slotIndex];

    slotEl.classList.add('aoc-card-fading');

    setTimeout(function () {
        updateFeaturedSlotContent(slotEl, nextLot);

        slotEl.offsetHeight; // fuerza reflow para que el navegador registre el estado "fading" antes de sacarlo

        requestAnimationFrame(function () {
            slotEl.classList.remove('aoc-card-fading');
        });

        setTimeout(function () {
            updateSlotsSequentially(changedSlots, step + 1, newFeaturedLots, newIds, onComplete);
        }, AOC_FADE_ANIMATION_MS + AOC_STEP_PAUSE_MS);
    }, AOC_FADE_ANIMATION_MS);
};

window.addEventListener('load', function () {
    initFeaturedLotsCarousel();
});
