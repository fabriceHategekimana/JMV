/* =========================================================
   CONFIGURATION — à modifier
   ========================================================= */
const CONFIG = {
    // Numéro WhatsApp qui reçoit les demandes.
    // Format international, chiffres uniquement, sans "+" ni "00" (ex : 41791234567)
    whatsappNumber: '41000000000',
    openingHour: 7,   // première heure proposée
    closingHour: 20   // dernière heure proposée
};

// Liste des véhicules : ajoutez / modifiez ici.
const VEHICLES = [
    {
        id: 'sprinter',
        name: 'Mercedes-Benz Sprinter 313 CDI',
        similar: 'Fourgon utilitaire',
        type: 'utilitaire',
        images: ['img/voiture1.png', 'img/voiture2.jpeg'],
        specs: { seats: 3, gearbox: 'Manuelle', fuel: 'Diesel', extra: 'Grand volume' },
        price: 'Sur demande'
    },
    {
        id: 'lexus',
        name: 'Lexus RX 400h',
        similar: 'SUV hybride',
        type: 'voiture',
        images: ['img/voiture4.png', 'img/voiture3.png'],
        specs: { seats: 5, gearbox: 'Automatique', fuel: 'Hybride', extra: '5 portes' },
        price: 'Sur demande'
    }
];

/* ========================================================= */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const ICONS = {
    seats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    gearbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><path d="M5 7v10M12 7v10M19 7v5H5"/></svg>',
    fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M3 22h12M3 10h12"/><path d="M15 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3"/></svg>',
    extra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
};

const state = { filter: 'all', selected: null };

/* ---------- Helpers dates ---------- */
const pad = (n) => String(n).padStart(2, '0');
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const combine = (date, time) => (date && time ? new Date(`${date}T${time}`) : null);
const fmtDate = (d) => d.toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
const fmtDateTime = (date, time) => {
    const d = combine(date, time);
    return d ? `${fmtDate(d)} à ${time.replace(':', 'h')}` : '–';
};

function fillTimeSelect(select, defaultValue) {
    for (let h = CONFIG.openingHour; h <= CONFIG.closingHour; h++) {
        for (const m of ['00', '30']) {
            if (h === CONFIG.closingHour && m === '30') continue;
            const v = `${pad(h)}:${m}`;
            select.add(new Option(v, v, false, v === defaultValue));
        }
    }
}

/* ---------- Rendu de la flotte ---------- */
function renderFleet() {
    const grid = $('#fleetGrid');
    grid.innerHTML = '';
    VEHICLES
        .filter(v => state.filter === 'all' || v.type === state.filter)
        .forEach(v => {
            const card = document.createElement('article');
            card.className = 'car' + (state.selected === v.id ? ' selected' : '');
            card.dataset.id = v.id;
            const multi = v.images.length > 1;
            card.innerHTML = `
                <div class="car-media">
                    <span class="car-tag">${v.type === 'utilitaire' ? 'Utilitaire' : 'Voiture'}</span>
                    ${v.images.map((src, i) => `<img src="${src}" alt="${v.name} – photo ${i + 1}" loading="lazy" class="${i === 0 ? 'show' : ''}">`).join('')}
                    ${multi ? `
                        <button type="button" class="car-arrow prev" aria-label="Photo précédente">${ICONS.chevL}</button>
                        <button type="button" class="car-arrow next" aria-label="Photo suivante">${ICONS.chevR}</button>
                        <div class="car-dots">${v.images.map((_, i) => `<span class="${i === 0 ? 'on' : ''}"></span>`).join('')}</div>
                    ` : ''}
                </div>
                <div class="car-body">
                    <h3>${v.name}</h3>
                    <div class="similar">${v.similar}</div>
                    <div class="specs">
                        <span class="spec">${ICONS.seats}${v.specs.seats} places</span>
                        <span class="spec">${ICONS.gearbox}${v.specs.gearbox}</span>
                        <span class="spec">${ICONS.fuel}${v.specs.fuel}</span>
                        <span class="spec">${ICONS.extra}${v.specs.extra}</span>
                    </div>
                    <div class="car-foot">
                        <div class="price"><small>Tarif</small><strong>${v.price}</strong></div>
                        <button type="button" class="btn ${state.selected === v.id ? 'btn-dark' : 'btn-orange'} js-select">
                            ${state.selected === v.id ? 'Sélectionné ✓' : 'Réserver'}
                        </button>
                    </div>
                </div>`;
            grid.appendChild(card);

            if (multi) {
                let idx = 0;
                const imgs = card.querySelectorAll('.car-media img');
                const dots = card.querySelectorAll('.car-dots span');
                const go = (n) => {
                    imgs[idx].classList.remove('show'); dots[idx].classList.remove('on');
                    idx = (n + imgs.length) % imgs.length;
                    imgs[idx].classList.add('show'); dots[idx].classList.add('on');
                };
                card.querySelector('.prev').onclick = () => go(idx - 1);
                card.querySelector('.next').onclick = () => go(idx + 1);
            }
            card.querySelector('.js-select').onclick = () => {
                selectVehicle(v.id);
                $('#reserver').scrollIntoView({ behavior: 'smooth' });
            };
        });
}

function setFilter(type) {
    state.filter = type;
    $$('#fleetFilters .chip, .widget-tabs .chip').forEach(c => c.classList.toggle('active', c.dataset.type === type));
    renderFleet();
}

function selectVehicle(id) {
    state.selected = id || null;
    $('#bVehicle').value = id || '';
    renderFleet();
    updateSummary();
}

/* ---------- Résumé ---------- */
function getDuration() {
    const start = combine($('#bStartDate').value, $('#bStartTime').value);
    const end = combine($('#bEndDate').value, $('#bEndTime').value);
    if (!start || !end || end <= start) return null;
    const hours = (end - start) / 36e5;
    return Math.max(1, Math.ceil(hours / 24));
}

function updateSummary() {
    const v = VEHICLES.find(x => x.id === state.selected);
    const img = $('#sumImg');
    if (v) {
        img.innerHTML = `<img src="${v.images[0]}" alt="${v.name}">`;
        $('#sumName').textContent = v.name;
        $('#sumSub').textContent = `${v.similar} · ${v.specs.seats} places · ${v.specs.gearbox}`;
    } else {
        img.innerHTML = '<div class="placeholder">Aucun véhicule sélectionné</div>';
        $('#sumName').textContent = 'Votre réservation';
        $('#sumSub').textContent = 'Choisissez un véhicule dans la liste';
    }
    $('#sumStart').textContent = fmtDateTime($('#bStartDate').value, $('#bStartTime').value);
    $('#sumEnd').textContent = fmtDateTime($('#bEndDate').value, $('#bEndTime').value);
    const days = getDuration();
    $('#sumDuration').textContent = days ? `${days} jour${days > 1 ? 's' : ''}` : '–';
}

/* ---------- Validation ---------- */
function validateDates(startDate, startTime, endDate, endTime) {
    const start = combine(startDate, startTime);
    const end = combine(endDate, endTime);
    if (!start || !end) return 'Veuillez indiquer les dates de départ et de retour.';
    if (start < new Date()) return 'La date de départ doit être dans le futur.';
    if (end <= start) return 'La date de retour doit être après la date de départ.';
    return null;
}

function showError(el, msg) {
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
}

function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 4500);
}

/* ---------- WhatsApp ---------- */
function openWhatsApp(text) {
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
}

function buildMessage() {
    const v = VEHICLES.find(x => x.id === $('#bVehicle').value);
    const days = getDuration();
    const lines = [
        '*Nouvelle demande de réservation – JMV Service*',
        '',
        `🚗 *Véhicule :* ${v.name} (${v.similar})`,
        `📍 *Prise en charge :* ${$('#bLocation').value.trim()}`,
        `📅 *Départ :* ${fmtDateTime($('#bStartDate').value, $('#bStartTime').value)}`,
        `📅 *Retour :* ${fmtDateTime($('#bEndDate').value, $('#bEndTime').value)}`,
        `⏱️ *Durée :* ${days} jour${days > 1 ? 's' : ''}`,
        '',
        `👤 *Nom :* ${$('#bFirstName').value.trim()} ${$('#bLastName').value.trim()}`,
        `📞 *Téléphone :* ${$('#bPhone').value.trim()}`
    ];
    const email = $('#bEmail').value.trim();
    if (email) lines.push(`✉️ *Email :* ${email}`);
    const msg = $('#bMessage').value.trim();
    if (msg) lines.push('', `💬 *Message :* ${msg}`);
    return lines.join('\n');
}

/* ---------- Init ---------- */
function init() {
    $('#year').textContent = new Date().getFullYear();

    const today = new Date();
    const start = addDays(today, 1);
    const end = addDays(today, 2);
    const minDate = toISODate(today);

    ['#qStartTime', '#qEndTime', '#bStartTime', '#bEndTime'].forEach(s => fillTimeSelect($(s), '09:00'));
    ['#qStartDate', '#qEndDate', '#bStartDate', '#bEndDate'].forEach(s => $(s).min = minDate);
    $('#qStartDate').value = $('#bStartDate').value = toISODate(start);
    $('#qEndDate').value = $('#bEndDate').value = toISODate(end);
    $('#bLocation').value = $('#qLocation').value;

    VEHICLES.forEach(v => $('#bVehicle').add(new Option(`${v.name} – ${v.similar}`, v.id)));

    // Le retour ne peut pas précéder le départ
    const linkDates = (startSel, endSel) => {
        $(startSel).addEventListener('change', () => {
            $(endSel).min = $(startSel).value;
            if ($(endSel).value < $(startSel).value) $(endSel).value = $(startSel).value;
        });
    };
    linkDates('#qStartDate', '#qEndDate');
    linkDates('#bStartDate', '#bEndDate');

    // Filtres
    $$('#fleetFilters .chip, .widget-tabs .chip').forEach(c => c.addEventListener('click', () => setFilter(c.dataset.type)));

    // Recherche rapide -> copie vers le formulaire et affiche la flotte
    $('#quickSearch').addEventListener('submit', (e) => {
        e.preventDefault();
        const err = validateDates($('#qStartDate').value, $('#qStartTime').value, $('#qEndDate').value, $('#qEndTime').value);
        showError($('#quickError'), err);
        if (err) return;
        $('#bLocation').value = $('#qLocation').value;
        ['StartDate', 'StartTime', 'EndDate', 'EndTime'].forEach(k => $('#b' + k).value = $('#q' + k).value);
        updateSummary();
        $('#flotte').scrollIntoView({ behavior: 'smooth' });
    });

    // Formulaire de réservation
    $('#bVehicle').addEventListener('change', (e) => selectVehicle(e.target.value));
    ['#bStartDate', '#bStartTime', '#bEndDate', '#bEndTime'].forEach(s => $(s).addEventListener('change', updateSummary));

    $('#bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = $('#bookingError');
        const form = e.target;

        const firstInvalid = [...form.querySelectorAll('[required]')].find(el => !el.checkValidity());
        if (firstInvalid) {
            const msg = firstInvalid.id === 'bLicense'
                ? 'Veuillez confirmer que vous avez un permis de conduire valide.'
                : firstInvalid.id === 'bVehicle'
                    ? 'Veuillez sélectionner un véhicule.'
                    : 'Veuillez remplir tous les champs obligatoires (*).';
            showError(errEl, msg);
            firstInvalid.focus();
            return;
        }
        const email = $('#bEmail');
        if (email.value && !email.checkValidity()) {
            showError(errEl, 'L\'adresse email n\'est pas valide.');
            email.focus();
            return;
        }
        const dateErr = validateDates($('#bStartDate').value, $('#bStartTime').value, $('#bEndDate').value, $('#bEndTime').value);
        if (dateErr) { showError(errEl, dateErr); return; }

        showError(errEl, null);
        openWhatsApp(buildMessage());
        toast('WhatsApp s\'ouvre : appuyez sur « Envoyer » pour transmettre votre demande.');
    });

    // Liens WhatsApp directs
    $$('.js-wa-direct').forEach(a => a.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsApp('Bonjour JMV Service, je souhaite des informations sur la location de véhicules.');
    }));

    renderFleet();
    updateSummary();
}

init();
