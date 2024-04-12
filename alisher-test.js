const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
app.use(bodyParser.json());

const providers = new Map();
const slots = new Map();
const reservations = new Map();

// Middleware to handle expired reservations
app.use((req, res, next) => {
    const now = moment();
    for (let [id, reservation] of reservations) {
        if (reservation.expires.isBefore(now)) {
            const slot = slots.get(reservation.slotId);
            slot.reserved = false;
            reservations.delete(id);
        }
    }
    next();
});

app.post('/providers/:providerId/schedule', (req, res) => {
    const { providerId } = req.params;
    const { start, end } = req.body;
    const startMoment = moment(start);
    const endMoment = moment(end);

    const provider = providers.get(providerId) || { schedules: [] };
    provider.schedules.push({ start: startMoment, end: endMoment });
    providers.set(providerId, provider);

    for (let m = moment(startMoment); m.isBefore(endMoment); m.add(15, 'minutes')) {
        const slotId = `${providerId}-${m.format()}`;
        slots.set(slotId, { providerId, time: moment(m), reserved: false });
    }

    res.status(200).send({ message: 'Schedule saved.' });
});

app.get('/slots', (req, res) => {
    const availableSlots = Array.from(slots.values()).filter(slot => !slot.reserved);
    res.status(200).send(availableSlots);
});

app.post('/slots/:slotId/reserve', (req, res) => {
    const { slotId } = req.params;
    const slot = slots.get(slotId);
    if (!slot || slot.reserved) {
        return res.status(400).send({ message: 'Slot not available.' });
    }

    // Check if the slot is at least 24 hours from now
    if (moment().add(24, 'hours').isAfter(slot.time)) {
        return res.status(400).send({ message: 'Reservations must be made at least 24 hours in advance.' });
    }

    const reservationId = `res-${slotId}`;
    reservations.set(reservationId, { slotId, expires: moment().add(30, 'minutes') });
    slot.reserved = true;

    res.status(200).send({ message: 'Slot reserved.', reservationId });
});

app.post('/reservations/:reservationId/confirm', (req, res) => {
    const { reservationId } = req.params;
    const reservation = reservations.get(reservationId);
    if (!reservation) {
        return res.status(400).send({ message: 'Reservation not found.' });
    }

    reservation.confirmed = true;
    reservation.expires = moment().add(1, 'year');

    res.status(200).send({ message: 'Reservation confirmed.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});