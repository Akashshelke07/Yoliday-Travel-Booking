const Booking = require('../models/bookingModel');

const createBooking = async (req, res) => {
    try {
        const {
            fullname,
            contact,
            email,
            destination,
            price,
            days,
            totalCost
        } = req.body;

        // Check if all required fields are provided
        if (!fullname || !contact || !email || !destination || !price || !days) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new booking entry
        const booking = await Booking.create({
            fullname,
            contact,
            email,
            destination,
            price,
            days,
            totalCost,
            user: req.user?._id // Optional: from auth middleware
        });

        res.status(201).json({
            message: 'Booking successfully created',
            booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createBooking, getBookings };