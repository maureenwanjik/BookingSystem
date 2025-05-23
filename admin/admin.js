// Booking data is stored in localStorage for demo purposes.
document.addEventListener("DOMContentLoaded", function() {
    // Sidebar navigation
    const adminHomeBtn = document.getElementById("admin-home-btn");
    const showAdminDashboardBtn = document.getElementById("show-admin-dashboard-btn");
    const showBookingBtnAdmin = document.getElementById("show-booking-btn-admin");
    const showMyBookingsBtnAdmin = document.getElementById("show-my-bookings-btn-admin");

    // Map button IDs to section IDs
    const btnSectionMap = {
        "admin-home-btn": "home-section",
        "show-admin-dashboard-btn": "admin-section",
        "show-booking-btn-admin": "booking-section",
        "show-my-bookings-btn-admin": "my-bookings-section"
    };

    const sidebarBtns = [
        adminHomeBtn,
        showAdminDashboardBtn,
        showBookingBtnAdmin,
        showMyBookingsBtnAdmin
    ];

    function setSidebarActive(activeBtn) {
        sidebarBtns.forEach(btn => btn.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    function showSectionOnly(sectionId) {
        Object.values(btnSectionMap).forEach(id => {
            const sec = document.getElementById(id);
            if (sec) {
                if (id === sectionId) sec.classList.remove("hidden");
                else sec.classList.add("hidden");
            }
        });
    }

    sidebarBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            setSidebarActive(btn);
            showSectionOnly(btnSectionMap[btn.id]);
            if (btn.id === "show-admin-dashboard-btn") renderAdminDashboard();
            if (btn.id === "show-my-bookings-btn-admin") renderMyBookings();
        });
    });

    // Booking Handling
    function getBookings() {
        return JSON.parse(localStorage.getItem("domeBookings") || "[]");
    }
    function setBookings(bookings) {
        localStorage.setItem("domeBookings", JSON.stringify(bookings));
    }

    // Demo: Admin user is hardcoded
    const adminUser = "admin";

    // Handle booking form submission
    const bookingForm = document.getElementById("booking-form-section");
    bookingForm && bookingForm.addEventListener("submit", function(e) {
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
            user: adminUser,
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
        renderAdminDashboard();
        renderMyBookings();
    });

    // Render functions
    function renderAdminDashboard() {
        const bookings = getBookings();
        // Pending approvals
        const pendingList = bookings.filter(b => b.status === "pending");
        document.getElementById("pending-approvals").innerHTML = pendingList.length ?
            toTable(pendingList, true) : "<p>No pending bookings.</p>";

        // All bookings
        document.getElementById("all-bookings").innerHTML = bookings.length ?
            toTable(bookings, false) : "<p>No bookings found.</p>";
    }

    function renderMyBookings() {
        const bookings = getBookings().filter(b => b.user === adminUser);
        document.getElementById("bookings-list").innerHTML = bookings.length ?
            toTable(bookings, false, true) : "<p>No bookings yet.</p>";
    }

    // Table rendering helper
    function toTable(bookings, showAdminActions=false, onlyCancel=false) {
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Dome</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        ${showAdminActions || onlyCancel ? "<th>Actions</th>" : ""}
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
                </td>`;
            if (showAdminActions) {
                html += `<td>
                    <button class="btn-approve" data-action="approve" data-id="${b.id}">Approve</button>
                    <button class="btn-deny" data-action="deny" data-id="${b.id}">Deny</button>
                    <button class="btn-cancel" data-action="cancel" data-id="${b.id}">Cancel</button>
                </td>`;
            } else if (onlyCancel) {
                html += `<td>
                    ${b.status === "pending"
                        ? `<button class="btn-cancel" data-action="cancel" data-id="${b.id}">Cancel</button>`
                        : ""}
                </td>`;
            } else {
                html += "<td></td>";
            }
            html += "</tr>";
        }
        html += "</tbody></table>";
        return html;
    }

    // Handle actions in admin dashboard and my bookings
    document.addEventListener("click", function(e) {
        if (e.target.matches(".btn-approve, .btn-deny, .btn-cancel")) {
            const action = e.target.getAttribute("data-action");
            const id = Number(e.target.getAttribute("data-id"));
            let bookings = getBookings();
            const idx = bookings.findIndex(b => b.id === id);
            if (idx === -1) return;
            if (action === "approve") bookings[idx].status = "approved";
            if (action === "deny") bookings[idx].status = "denied";
            if (action === "cancel") bookings[idx].status = "cancelled";
            setBookings(bookings);
            renderAdminDashboard();
            renderMyBookings();
        }
    });

    // Delete all bookings
    const deleteBtn = document.getElementById("delete-all-bookings-btn");
    deleteBtn && deleteBtn.addEventListener("click", function() {
        if (confirm("Delete ALL bookings? This cannot be undone.")) {
            setBookings([]);
            renderAdminDashboard();
            renderMyBookings();
            document.getElementById("report-output").textContent = "All bookings deleted.";
        }
    });

    // Initial render for dashboard and my bookings
    renderAdminDashboard();
    renderMyBookings();
});