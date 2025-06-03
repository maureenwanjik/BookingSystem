// User Dome Booking System - with localStorage
document.addEventListener("DOMContentLoaded", function () {
    // Sidebar navigation
    const userHomeBtn = document.getElementById("user-home-btn");
    const showBookingBtn = document.getElementById("show-booking-btn");
    const showMyBookingsBtn = document.getElementById("show-my-bookings-btn");
    const showAppointmentsBtn = document.getElementById("show-appointments-btn"); // New
    const sections = {
        "user-home-btn": document.getElementById("home-section"),
        "show-booking-btn": document.getElementById("booking-section"),
        "show-my-bookings-btn": document.getElementById("my-bookings-section"),
        "show-appointments-btn": document.getElementById("appointments-section") // New
    };
    const sidebarBtns = [
        userHomeBtn,
        showBookingBtn,
        showMyBookingsBtn,
        showAppointmentsBtn // New
    ];

    function setSidebarActive(activeBtn) {
        sidebarBtns.forEach(btn => btn.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    function showSectionOnly(shownSection) {
        Object.values(sections).forEach(sec => sec.classList.add('hidden'));
        shownSection.classList.remove('hidden');
    }

    userHomeBtn.addEventListener("click", function () {
        setSidebarActive(userHomeBtn);
        showSectionOnly(sections["user-home-btn"]);
    });
    showBookingBtn.addEventListener("click", function () {
        setSidebarActive(showBookingBtn);
        showSectionOnly(sections["show-booking-btn"]);
    });
    showMyBookingsBtn.addEventListener("click", function () {
        setSidebarActive(showMyBookingsBtn);
        showSectionOnly(sections["show-my-bookings-btn"]);
        renderMyBookings();
    });
    showAppointmentsBtn.addEventListener("click", function () {
        setSidebarActive(showAppointmentsBtn);
        showSectionOnly(sections["show-appointments-btn"]);
        renderAppointments();
    });

    // Booking logic
    const username = "maureenwanjik"; // In a real app, get from auth/user session
    function getBookings() {
        return JSON.parse(localStorage.getItem("domeBookings") || "[]");
    }
    function setBookings(bookings) {
        localStorage.setItem("domeBookings", JSON.stringify(bookings));
    }

    // Submit booking form
    const bookingForm = document.getElementById("booking-form-section");
    bookingForm && bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const dome = document.getElementById("dome-select").value;
        const capacity = document.getElementById("booking-capacity").value;
        const department = document.getElementById("department").value.trim();
        const date = document.getElementById("booking-date").value;
        const startTime = document.getElementById("booking-starttime").value;
        const endTime = document.getElementById("booking-endtime").value;
        const purpose = document.getElementById("purpose").value.trim();
        if (!dome || !capacity || !department || !date || !startTime || !endTime || !purpose) {
            document.getElementById("booking-status").textContent = "Please fill all fields.";
            return;
        }
        if (isNaN(Number(capacity)) || Number(capacity) < 1) {
            document.getElementById("booking-status").textContent = "Please enter a valid number of people.";
            return;
        }
        const booking = {
            id: Date.now(),
            user: username,
            dome,
            capacity,
            department,
            date,
            time: `${startTime} - ${endTime}`,
            purpose,
            status: "pending"
        };
        const bookings = getBookings();
        bookings.push(booking);
        setBookings(bookings);
        document.getElementById("booking-status").textContent = "Booking submitted!";
        bookingForm.reset();
        renderMyBookings();
    });

    // Render user's bookings
    function renderMyBookings() {
        const bookings = getBookings().filter(b => b.user === username);
        const bookingsList = document.getElementById("bookings-list");
        if (bookings.length === 0) {
            bookingsList.innerHTML = "<p>No bookings yet.</p>";
            return;
        }
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Dome</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>People</th>
                        <th>Department</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        for (const b of bookings) {
            html += `<tr>
                <td>${b.dome}</td>
                <td>${b.date}</td>
                <td>${b.time}</td>
                <td>${b.capacity ? b.capacity : "-"}</td>
                <td>${b.department ? b.department : "-"}</td>
                <td>${b.purpose}</td>
                <td>
                    <span class="label label-${b.status}">
                        ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                </td>
                <td>
                    ${b.status === "pending" ? `<button class="btn-cancel" data-id="${b.id}">Cancel</button>` : ""}
                </td>
            </tr>`;
        }
        html += "</tbody></table>";
        bookingsList.innerHTML = html;
    }

    // Handle cancel booking action
    document.addEventListener("click", function (e) {
        if (e.target.matches(".btn-cancel")) {
            const id = Number(e.target.getAttribute("data-id"));
            let bookings = getBookings();
            const idx = bookings.findIndex(b => b.id === id && b.user === username);
            if (idx === -1) return;
            bookings[idx].status = "cancelled";
            setBookings(bookings);
            renderMyBookings();
        }
    });

    // --- Appointment Booking Logic ---
    function getAppointments() {
        return JSON.parse(localStorage.getItem("appointments") || "[]");
    }
    function setAppointments(appointments) {
        localStorage.setItem("appointments", JSON.stringify(appointments));
    }

    const appointmentForm = document.getElementById("appointment-form-section");
    appointmentForm && appointmentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const date = document.getElementById("appointment-date").value;
        const startTime = document.getElementById("appointment-starttime").value;
        const endTime = document.getElementById("appointment-endtime").value;
        const person = document.getElementById("person-select").value;
        const reason = document.getElementById("appointment-reason").value.trim();
        if (!date || !startTime || !endTime || !reason) {
            document.getElementById("appointment-status").textContent = "Please fill all fields.";
            return;
        }
        const appointment = {
            id: Date.now(),
            user: username,
            date,
            time: `${startTime} - ${endTime}`,
            reason,
            status: "pending"
        };
        const appointments = getAppointments();
        appointments.push(appointment);
        setAppointments(appointments);
        document.getElementById("appointment-status").textContent = "Appointment booked!";
        appointmentForm.reset();
        renderAppointments();
    });

    function renderAppointments() {
        const appointments = getAppointments().filter(a => a.user === username);
        const appointmentsList = document.getElementById("appointments-list");
        if (appointments.length === 0) {
            appointmentsList.innerHTML = "<p>No appointments booked yet.</p>";
            return;
        }
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        for (const a of appointments) {
            html += `<tr>
                <td>${a.date}</td>
                <td>${a.time}</td>
                <td>${a.reason}</td>
                <td>
                    <span class="label label-${a.status}">
                        ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                </td>
                <td>
                    ${a.status === "pending" ? `<button class="btn-cancel-appointment" data-id="${a.id}">Cancel</button>` : ""}
                </td>
            </tr>`;
        }
        html += "</tbody></table>";
        appointmentsList.innerHTML = html;
    }

    // Handle cancel appointment action
    document.addEventListener("click", function (e) {
        if (e.target.matches(".btn-cancel-appointment")) {
            const id = Number(e.target.getAttribute("data-id"));
            let appointments = getAppointments();
            const idx = appointments.findIndex(a => a.id === id && a.user === username);
            if (idx === -1) return;
            appointments[idx].status = "cancelled";
            setAppointments(appointments);
            renderAppointments();
        }
    });

    // On load, show home and render user's bookings if on My Bookings
    renderMyBookings();
    renderAppointments(); // Ensure appointments are rendered on load if needed
});