// Carrusel de "Destacados": arma una selección de 6 lotes y los renderiza
// arriba de la grilla de lotes, usando lotCarouselTemplate (ver lot-template.js).
//
// Criterio de selección:
//   - Los últimos 4 lotes con pique (ordenados por fecha del pique más reciente).
//   - Si hay menos de 4 lotes con pique, se completa al azar con otros lotes
//     hasta llegar a 6 en total.
//   - El orden final en el carrusel es aleatorio.

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

function getFeaturedLots() {
    const TARGET_COUNT = 6;
    const VOTED_COUNT = 4;

    if (lots.length <= TARGET_COUNT) {
        return aocShuffleArray(lots);
    }

    const bidLots = lots
        .filter(function (lot) { return lot.auctionBidcustomerId && lot.lastBidDate; })
        .sort(function (a, b) { return new Date(b.lastBidDate) - new Date(a.lastBidDate); });

    const votedSelected = bidLots.slice(0, VOTED_COUNT);

    const votedIds = {};
    for (let index in votedSelected) {
        votedIds[votedSelected[index].lotId] = true;
    }

    const remainingPool = lots.filter(function (lot) { return !votedIds[lot.lotId]; });
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

function initFeaturedLotsCarousel() {
    const wrap = document.getElementById('aoc-carousel-wrap');
    const track = document.getElementById('aocTrack');
    const dotsWrap = document.getElementById('aocDots');

    if (!wrap || !track || !dotsWrap || !lots.length) {
        return;
    }

    const featuredLots = getFeaturedLots();
    if (!featuredLots.length) {
        return;
    }

    let cardsHTML = "";
    for (let index in featuredLots) {
        cardsHTML += buildFeaturedLotCard(featuredLots[index]);
    }

    track.innerHTML = cardsHTML;
    wrap.classList.remove('d-none');

    const cards = Array.prototype.slice.call(track.children);
    const prevBtn = wrap.querySelector('.aoc-arrow.aoc-prev');
    const nextBtn = wrap.querySelector('.aoc-arrow.aoc-next');

    cards.forEach(function (_, i) {
        const dot = document.createElement('button');
        if (i === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', function () { scrollToCard(i); });
        dotsWrap.appendChild(dot);
    });
    const dots = Array.prototype.slice.call(dotsWrap.children);

    function scrollToCard(i) {
        const card = cards[i];
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    };

    function currentIndex() {
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach(function (c, i) {
            const dist = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
            if (dist < closestDist) {
                closestDist = dist;
                closest = i;
            }
        });
        return closest;
    };

    let ticking = false;
    track.addEventListener('scroll', function () {
        if (ticking) {
            return;
        }
        ticking = true;
        requestAnimationFrame(function () {
            const idx = currentIndex();
            dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
            ticking = false;
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', function () { scrollToCard(Math.max(0, currentIndex() - 1)); });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function () { scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)); });
    }
};

window.addEventListener('load', function () {
    initFeaturedLotsCarousel();
});
