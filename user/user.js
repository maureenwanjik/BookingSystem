// User Dome Booking System - with localStorage
document.addEventListener("DOMContentLoaded", function () {
    // Sidebar navigation
    const userHomeBtn = document.getElementById("user-home-btn");
    const showBookingBtn = document.getElementById("show-booking-btn");
    const showMyBookingsBtn = document.getElementById("show-my-bookings-btn");
    const sections = {
        "user-home-btn": document.getElementById("home-section"),
        "show-booking-btn": document.getElementById("booking-section"),
        "show-my-bookings-btn": document.getElementById("my-bookings-section")
    };
    const sidebarBtns = [userHomeBtn, showBookingBtn, showMyBookingsBtn];

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
        const date = document.getElementById("booking-date").value;
        const time = document.getElementById("booking-time").value;
        const purpose = document.getElementById("purpose").value.trim();
        if (!dome || !date || !time || !purpose) {
            document.getElementById("booking-status").textContent = "Please fill all fields.";
            return;
        }
        const booking = {
            id: Date.now(),
            user: username,
            dome,
            date,
            time,
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

    // On load, show home and render user's bookings if on My Bookings
    renderMyBookings();
});