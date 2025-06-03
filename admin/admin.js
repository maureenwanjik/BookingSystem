// Booking data is stored in localStorage for demo purposes.
document.addEventListener("DOMContentLoaded", function () {
    // Sidebar navigation
    const adminHomeBtn = document.getElementById("admin-home-btn");
    const showAdminDashboardBtn = document.getElementById("show-admin-dashboard-btn");
    const showBookingBtnAdmin = document.getElementById("show-booking-btn-admin");
    const showMyBookingsBtnAdmin = document.getElementById("show-my-bookings-btn-admin");
    const showAppointmentsBtn = document.getElementById("show-appointments-btn");

    // Map button IDs to section IDs
    const btnSectionMap = {
        "admin-home-btn": "home-section",
        "show-admin-dashboard-btn": "admin-section",
        "show-booking-btn-admin": "booking-section",
        "show-my-bookings-btn-admin": "my-bookings-section",
        "show-appointments-btn": "appointments-section"
    };

    const sidebarBtns = [
        adminHomeBtn,
        showAdminDashboardBtn,
        showBookingBtnAdmin,
        showMyBookingsBtnAdmin,
        showAppointmentsBtn
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
        btn.addEventListener("click", function () {
            setSidebarActive(btn);
            showSectionOnly(btnSectionMap[btn.id]);
            if (btn.id === "show-admin-dashboard-btn") renderAdminDashboard();
            if (btn.id === "show-my-bookings-btn-admin") renderMyBookings();
            if (btn.id === "show-appointments-btn") renderAppointments();
        });
    });

    // Booking Handling
    function getBookings() {
        return JSON.parse(localStorage.getItem("domeBookings") || "[]");
    }
    function setBookings(bookings) {
        localStorage.setItem("domeBookings", JSON.stringify(bookings));
    }

    // Appointment Handling
    function getAppointments() {
        return JSON.parse(localStorage.getItem("appointments") || "[]");
    }
    function setAppointments(appointments) {
        localStorage.setItem("appointments", JSON.stringify(appointments));
    }

    // Demo: Admin user is hardcoded
    const adminUser = "admin";

    // Handle booking form submission
    const bookingForm = document.getElementById("booking-form-section");
    bookingForm && bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const dome = document.getElementById("dome-select").value;
        const numberOfPeople = document.getElementById("number-of-people").value;
        const department = document.getElementById("department").value.trim();
        const date = document.getElementById("booking-date").value;
        const startTime = document.getElementById("booking-starttime").value;
        const endTime = document.getElementById("booking-endtime").value;
        const purpose = document.getElementById("purpose").value.trim();
        if (!dome || !date || !startTime || !endTime || !purpose || !numberOfPeople || !department) {
            document.getElementById("booking-status").textContent = "Please fill all fields.";
            return;
        }
        const booking = {
            id: Date.now(),
            user: adminUser,
            dome,
            date,
            time: `${startTime} - ${endTime}`,
            purpose,
            numberOfPeople: numberOfPeople,
            department: department,
            status: "pending",
            approvedBy: "",
            approvedTime: ""
        };
        const bookings = getBookings();
        bookings.push(booking);
        setBookings(bookings);
        document.getElementById("booking-status").textContent = "Booking submitted!";
        bookingForm.reset();
        renderAdminDashboard();
        renderMyBookings();
    });

    // Appointment booking form (admin and user can use same localStorage)
    const appointmentForm = document.getElementById("appointment-form-section");
    appointmentForm && appointmentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const date = document.getElementById("appointment-date").value;
        const startTime = document.getElementById("appointment-starttime").value;
        const endTime = document.getElementById("appointment-endtime").value;
        const person = document.getElementById("person-select").value;
        const reason = document.getElementById("appointment-reason").value.trim();
        if (!date || !startTime || !endTime || !person || !reason) {
            document.getElementById("appointment-status").textContent = "Please fill all fields.";
            return;
        }
        const appointment = {
            id: Date.now(),
            user: adminUser,
            date,
            time: `${startTime} - ${endTime}`,
            person,
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

    // Admin Dashboard - handle toggling of bookings and appointments
    function renderAdminDashboard() {
        const bookings = getBookings();
        // Buttons for toggling tables
        const pendingBtn = document.getElementById("show-pending-approvals-btn");
        const allBtn = document.getElementById("show-all-bookings-btn");
        const viewAppointmentsBtn = document.getElementById("view-appointments-btn");

        // Table containers
        const pendingDiv = document.getElementById("pending-approvals");
        const allDiv = document.getElementById("all-bookings");
        const appointmentTableDiv = document.getElementById("admin-appointments-table");

        // Button events
        if (pendingDiv && allDiv && appointmentTableDiv) {
            if (!pendingBtn.dataset.bound) {
                pendingBtn.addEventListener("click", function () {
                    pendingDiv.style.display = "block";
                    allDiv.style.display = "none";
                    appointmentTableDiv.style.display = "none";
                    pendingBtn.classList.add("active");
                    allBtn.classList.remove("active");
                    viewAppointmentsBtn.classList.remove("active");
                });
                allBtn.addEventListener("click", function () {
                    pendingDiv.style.display = "none";
                    allDiv.style.display = "block";
                    appointmentTableDiv.style.display = "none";
                    allBtn.classList.add("active");
                    pendingBtn.classList.remove("active");
                    viewAppointmentsBtn.classList.remove("active");
                });
                viewAppointmentsBtn.addEventListener("click", function () {
                    pendingDiv.style.display = "none";
                    allDiv.style.display = "none";
                    appointmentTableDiv.style.display = "block";
                    viewAppointmentsBtn.classList.add("active");
                    allBtn.classList.remove("active");
                    pendingBtn.classList.remove("active");
                    renderAppointmentsTable(appointmentTableDiv);
                });
                pendingBtn.dataset.bound = "true";
                allBtn.dataset.bound = "true";
                viewAppointmentsBtn.dataset.bound = "true";
            }
            // Update table contents
            const pendingList = bookings.filter(b => b.status === "pending");
            pendingDiv.innerHTML = pendingList.length ?
                toTable(bookings.filter(b => b.status === "pending"), true) : "<p>No pending bookings.</p>";

            allDiv.innerHTML = bookings.length ?
                toTable(bookings, false, false, false) : "<p>No bookings found.</p>";
            // Show All Bookings by default
            pendingDiv.style.display = "none";
            allDiv.style.display = "block";
            appointmentTableDiv.style.display = "none";
            allBtn.classList.add("active");
            pendingBtn.classList.remove("active");
            viewAppointmentsBtn.classList.remove("active");
        }
    }

    function renderAppointmentsTable(containerDiv) {
        // Fetch all appointments from both user and admin
        const appointments = getAppointments();
        if (!appointments.length) {
            containerDiv.innerHTML = "<p>No appointments found.</p>";
            return;
        }
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>With</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        for (const a of appointments) {
            html += `<tr>
                <td>${a.user || ""}</td>
                <td>${a.date}</td>
                <td>${a.time}</td>
                <td>${a.person || ""}</td>
                <td>${a.reason}</td>
                <td>
                    <span class="label label-${a.status}">
                        ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                </td>
                <td>
                    ${a.status === "pending" ? `
                        <button class="btn-approve-appointment" data-id="${a.id}">Approve</button>
                        <button class="btn-deny-appointment" data-id="${a.id}">Deny</button>
                        <button class="btn-cancel-appointment" data-id="${a.id}">Cancel</button>
                    ` : ""}
                </td>
            </tr>`;
        }
        html += "</tbody></table>";
        containerDiv.innerHTML = html;
    }

    function renderMyBookings() {
        const bookings = getBookings().filter(b => b.user === adminUser);
        document.getElementById("bookings-list").innerHTML = bookings.length ?
            toTable(bookings, false, true, false) : "<p>No bookings yet.</p>";
    }

    // Table rendering helper
    function toTable(bookings, showAdminActions = false, onlyCancel = false, showDeleteAll = false) {
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Dome</th>
                        <th>Capacity</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Approved By</th>
                        <th>Approval Time</th>
                        ${(showAdminActions || onlyCancel) ? "<th>Actions</th>" : ""}
                    </tr>
                </thead>
                <tbody>
        `;
        for (const b of bookings) {
            html += `<tr>
                <td>${b.user || ""}</td>
                <td>${b.department || ""}</td>
                <td>${b.dome}</td>
                <td>${b.numberOfPeople || ""}</td>
                <td>${b.date}</td>
                <td>${b.time}</td>
                <td>${b.purpose}</td>
                <td>
                    <span class="label label-${b.status}">
                        ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                </td>
                <td>${b.approvedBy || ""}</td>
                <td>${b.approvedTime || ""}</td>`;
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

    // Appointment section for admin/user: show only admin's own appointments
    function renderAppointments() {
        const appointments = getAppointments().filter(a => a.user === adminUser);
        const appointmentsList = document.getElementById("appointments-list");
        if (!appointmentsList) return;
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
                        <th>With</th>
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
                <td>${a.person || ""}</td>
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

    // Handle actions in admin dashboard and my bookings
    document.addEventListener("click", function (e) {
        // Bookings actions
        if (e.target.matches(".btn-approve, .btn-deny, .btn-cancel")) {
            const action = e.target.getAttribute("data-action");
            const id = Number(e.target.getAttribute("data-id"));
            let bookings = getBookings();
            const idx = bookings.findIndex(b => b.id === id);
            if (idx === -1) return;
            const now = new Date();
            if (action === "approve") {
                bookings[idx].status = "approved";
                bookings[idx].approvedBy = adminUser;
                bookings[idx].approvedTime = now.toLocaleString();
            }
            if (action === "deny") {
                bookings[idx].status = "denied";
                bookings[idx].approvedBy = adminUser;
                bookings[idx].approvedTime = now.toLocaleString();
            }
            if (action === "cancel") {
                bookings[idx].status = "cancelled";
                bookings[idx].approvedBy = adminUser;
                bookings[idx].approvedTime = now.toLocaleString();
            }
            setBookings(bookings);
            renderAdminDashboard();
            renderMyBookings();
        }
        // Appointments actions (admin dashboard)
        if (e.target.matches(".btn-approve-appointment, .btn-deny-appointment, .btn-cancel-appointment")) {
            const id = Number(e.target.getAttribute("data-id"));
            let appointments = getAppointments();
            const idx = appointments.findIndex(a => a.id === id);
            if (idx === -1) return;
            if (e.target.classList.contains("btn-approve-appointment")) appointments[idx].status = "approved";
            if (e.target.classList.contains("btn-deny-appointment")) appointments[idx].status = "denied";
            if (e.target.classList.contains("btn-cancel-appointment")) appointments[idx].status = "cancelled";
            setAppointments(appointments);
            renderAdminDashboard();
            renderAppointments();
        }
    });

    // Initial render for dashboard and my bookings
    renderAdminDashboard();
    renderMyBookings();
    renderAppointments();
});