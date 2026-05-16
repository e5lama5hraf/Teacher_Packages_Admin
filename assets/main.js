const packages = {
    youtube8: {
        name: "Youtube - باكدج 8 ساعات استوديو",
        platform: "youtube",
        totalTasks: 22,
        summary: "8 ساعات تصوير، 5 ثامبنيل، 4 ريلز، رفع وجدولة، SEO، مشاركة في الجروبات"
    },
    youtube16: {
        name: "Youtube - باكدج 16 ساعة استوديو",
        platform: "youtube",
        totalTasks: 42,
        summary: "16 ساعة تصوير، 10 ثامبنيل، 8 ريلز، رفع وجدولة، SEO، مشاركة في الجروبات"
    },
    youtube30: {
        name: "Youtube - باكدج 30 ساعة استوديو",
        platform: "youtube",
        totalTasks: 71,
        summary: "30 ساعة تصوير، 15 ثامبنيل، 15 ريلز، رفع وجدولة، SEO، مشاركة في الجروبات"
    },
    facebook10: {
        name: "Facebook - إجمالي 10 بوست",
        platform: "facebook",
        totalTasks: 10,
        summary: "4 تصميمات، 2 ريلز، 4 بوست متنوع"
    },
    facebook16: {
        name: "Facebook - إجمالي 16 بوست",
        platform: "facebook",
        totalTasks: 16,
        summary: "8 تصميمات، 4 ريلز، 4 بوست متنوع"
    },
    facebook24: {
        name: "Facebook - إجمالي 24 بوست",
        platform: "facebook",
        totalTasks: 24,
        summary: "8 تصميمات، 8 ريلز، 8 بوست متنوع"
    }
};

const taskTypes = {
    design: "تصميم",
    video: "فيديو",
    "mixed-post": "بوست منوع",
    reel: "ريل"
};

const weekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
let selectedShootingDay = weekDays[0];

let clients = JSON.parse(localStorage.getItem("teacherPackageClientsV2")) || [];
let tasks = JSON.parse(localStorage.getItem("teacherPackageTasksV2")) || [];

const packageName = document.getElementById("packageName");
const packagePlatform = document.getElementById("packagePlatform");
const packageDetails = document.getElementById("packageDetails");
const packageTotalTasks = document.getElementById("packageTotalTasks");
const startDate = document.getElementById("startDate");
const clientForm = document.getElementById("clientForm");
const clientList = document.getElementById("clientList");
const shootingBookingFields = document.getElementById("shootingBookingFields");
const shootingDay = document.getElementById("shootingDay");
const shootingTime = document.getElementById("shootingTime");
const shootingNotes = document.getElementById("shootingNotes");

startDate.valueAsDate = new Date();

packagePlatform.addEventListener("change", toggleShootingBookingFields);
toggleShootingBookingFields();

document.querySelectorAll(".section-btn").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.target));
});

function showPanel(targetId) {
    document.querySelectorAll(".section-btn").forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".section-panel").forEach((panel) => panel.classList.remove("active"));
    const button = document.querySelector(`[data-target="${targetId}"]`);
    if (button) button.classList.add("active");
    document.getElementById(targetId).classList.add("active");
}

function saveData() {
    localStorage.setItem("teacherPackageClientsV2", JSON.stringify(clients));
    localStorage.setItem("teacherPackageTasksV2", JSON.stringify(tasks));
}

function getPackageInfo(client) {
    const oldPackage = packages[client.packageKey] || {};
    return {
        name: client.packageName || oldPackage.name || "باكدج بدون اسم",
        platform: client.packagePlatform || oldPackage.platform || "facebook",
        totalTasks: Number(client.packageTotalTasks ?? oldPackage.totalTasks ?? 0),
        summary: client.packageDetails || oldPackage.summary || ""
    };
}

function isYoutubeClient(client) {
    return getPackageInfo(client).platform === "youtube";
}

function toggleShootingBookingFields() {
    const isYoutube = packagePlatform.value === "youtube";
    shootingBookingFields.classList.toggle("active", isYoutube);
    if (!isYoutube) {
        shootingDay.value = "";
        shootingTime.value = "";
        shootingNotes.value = "";
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function addMonths(dateString, months) {
    const date = new Date(dateString + "T12:00:00");
    date.setMonth(date.getMonth() + months);
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
}

function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString + "T12:00:00").toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getClientTasks(clientId) {
    return tasks.filter((task) => task.clientId === clientId);
}

function getPackageTotal(client) {
    return getPackageInfo(client).totalTasks * Number(client.duration || 1);
}

function getRemainingTasks(client) {
    const added = getClientTasks(client.id).length;
    return Math.max(getPackageTotal(client) - added, 0);
}

clientForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedPlatform = packagePlatform.value;
    const isYoutube = selectedPlatform === "youtube";
    const selectedDay = shootingDay.value;
    const selectedTime = shootingTime.value.trim();
    const selectedNotes = shootingNotes.value.trim();
    const tasksCount = Number(packageTotalTasks.value);

    if (isYoutube && (selectedDay || selectedTime || selectedNotes) && (!selectedDay || !selectedTime)) {
        alert("لو هتضيف حجز تصوير، من فضلك اختار اليوم واكتب ميعاد التصوير.");
        return;
    }

    if (!tasksCount || tasksCount < 1) {
        alert("من فضلك اكتب عدد التاسكات داخل الباكدج بشكل صحيح.");
        return;
    }

    const client = {
        id: crypto.randomUUID(),
        teacherName: document.getElementById("teacherName").value.trim(),
        subjectName: document.getElementById("subjectName").value.trim(),
        startDate: startDate.value,
        duration: document.getElementById("duration").value,
        packageName: packageName.value.trim(),
        packagePlatform: selectedPlatform,
        packageDetails: packageDetails.value.trim(),
        packageTotalTasks: tasksCount,
        packageKey: selectedPlatform === "youtube" ? "customYoutube" : "customFacebook",
        shootingBooking: isYoutube && selectedDay && selectedTime ? {
            day: selectedDay,
            time: selectedTime,
            notes: selectedNotes
        } : null,
        createdAt: new Date().toISOString()
    };

    if (!client.teacherName || !client.subjectName || !client.startDate || !client.packageName || !client.packageDetails) return;

    clients.push(client);
    saveData();
    clientForm.reset();
    startDate.valueAsDate = new Date();
    toggleShootingBookingFields();
    render();

    const platform = getPackageInfo(client).platform;
    showPanel(platform === "facebook" ? "facebookPanel" : "youtubePanel");
});

function toggleTaskForm(clientId) {
    const form = document.getElementById(`taskForm-${clientId}`);
    if (form) form.classList.toggle("active");
}

function addManualTask(event, clientId) {
    event.preventDefault();
    const form = event.target;
    const client = clients.find((item) => item.id === clientId);
    const clientTasks = getClientTasks(clientId);

    if (clientTasks.length >= getPackageTotal(client)) {
        alert("تم الوصول إلى إجمالي عدد التاسكات داخل الباقة لهذا العميل.");
        return;
    }

    const task = {
        id: crypto.randomUUID(),
        clientId,
        type: form.taskType.value,
        details: form.taskDetails.value.trim(),
        executeDate: form.executeDate.value,
        uploadDate: form.uploadDate.value,
        done: false,
        createdAt: new Date().toISOString()
    };

    if (!task.details || !task.executeDate || !task.uploadDate) return;

    tasks.push(task);
    saveData();
    form.reset();
    render();
    document.getElementById(`taskForm-${clientId}`)?.classList.add("active");
}

function toggleTask(taskId) {
    tasks = tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task);
    saveData();
    render();
}

function deleteTask(taskId) {
    if (!confirm("هل تريد حذف هذا التاسك؟")) return;
    tasks = tasks.filter((task) => task.id !== taskId);
    saveData();
    render();
}

function deleteClient(clientId) {
    if (!confirm("سيتم حذف العميل وكل التاسكات الخاصة به. هل أنت متأكد؟")) return;
    clients = clients.filter((client) => client.id !== clientId);
    tasks = tasks.filter((task) => task.clientId !== clientId);
    saveData();
    render();
}


function getShootingBookings() {
    return clients
        .filter((client) => isYoutubeClient(client) && client.shootingBooking?.day && client.shootingBooking?.time)
        .map((client) => ({
            client,
            day: client.shootingBooking.day,
            time: client.shootingBooking.time,
            notes: client.shootingBooking.notes || ""
        }));
}

function selectShootingDay(day) {
    selectedShootingDay = day;
    renderShootingSchedule();
}

function renderShootingSchedule() {
    const bookings = getShootingBookings();
    const selectedBookings = bookings.filter((booking) => booking.day === selectedShootingDay);

    document.getElementById("shootingStats").innerHTML = `
        <div class="stat"><span>إجمالي حجوزات التصوير</span><strong>${bookings.length}</strong></div>
        <div class="stat"><span>أيام بها حجوزات</span><strong>${weekDays.filter((day) => bookings.some((booking) => booking.day === day)).length}</strong></div>
        <div class="stat"><span>حجوزات اليوم المحدد</span><strong>${selectedBookings.length}</strong></div>
        <div class="stat"><span>اليوم المحدد</span><strong>${selectedShootingDay}</strong></div>
      `;

    document.getElementById("shootingScheduleDays").innerHTML = weekDays.map((day) => {
        const dayBookings = bookings.filter((booking) => booking.day === day);
        const times = dayBookings.length
            ? dayBookings.slice(0, 2).map((booking) => escapeHTML(booking.time)).join("<br>") + (dayBookings.length > 2 ? `<br>+${dayBookings.length - 2} مواعيد أخرى` : "")
            : "لا توجد حجوزات";
        return `
          <button class="day-btn ${selectedShootingDay === day ? "active" : ""}" type="button" onclick="selectShootingDay('${day}')">
            <strong>${day}</strong>
            <small>${times}</small>
          </button>
        `;
    }).join("");

    document.getElementById("shootingScheduleList").innerHTML = selectedBookings.length ? selectedBookings.map(({ client, time, notes }) => `
        <div class="booking-card">
          <strong>${escapeHTML(client.teacherName)}</strong>
          <span class="chip green">${escapeHTML(time)}</span>
          <p>${escapeHTML(client.subjectName)} • ${escapeHTML(getPackageInfo(client).name)}</p>
          ${notes ? `<p><strong style="font-size:14px;display:inline;">ملاحظات:</strong> ${escapeHTML(notes)}</p>` : ""}
        </div>
      `).join("") : `<div class="empty">لا توجد مواعيد تصوير محجوزة في يوم ${selectedShootingDay}</div>`;
}

function renderClientList() {
    document.getElementById("totalClients").textContent = clients.length;

    if (!clients.length) {
        clientList.innerHTML = `<div class="empty">لا يوجد عملاء حتى الآن</div>`;
        return;
    }

    clientList.innerHTML = clients.map((client) => {
        const pack = getPackageInfo(client);
        const added = getClientTasks(client.id).length;
        const total = getPackageTotal(client);
        const remaining = getRemainingTasks(client);
        return `
          <div class="client-card" onclick="openClientPackage('${client.id}')">
            <strong>${client.teacherName}</strong>
            <span>${client.subjectName} • ${pack.name}</span><br />
            <span>الاشتراك: ${formatDate(client.startDate)} • الانتهاء: ${formatDate(addMonths(client.startDate, Number(client.duration)))}</span><br />
            <span>التاسكات المضافة: ${added}/${total} • المتبقي للإضافة: ${remaining}</span><br />
            ${client.shootingBooking?.day && client.shootingBooking?.time ? `<span>حجز التصوير: ${client.shootingBooking.day} • ${client.shootingBooking.time}</span>` : ""}
          </div>
        `;
    }).join("");
}

function openClientPackage(clientId) {
    const client = clients.find((item) => item.id === clientId);
    const platform = getPackageInfo(client).platform;
    showPanel(platform === "facebook" ? "facebookPanel" : "youtubePanel");
    const filter = document.getElementById(`${platform}ClientFilter`);
    filter.value = clientId;
    renderBoards();
}

function renderPlatformFilters(platform) {
    const clientFilter = document.getElementById(`${platform}ClientFilter`);
    const current = clientFilter.value;
    clientFilter.innerHTML = `<option value="all">كل العملاء</option>`;
    clients
        .filter((client) => getPackageInfo(client).platform === platform)
        .forEach((client) => {
            const option = document.createElement("option");
            option.value = client.id;
            option.textContent = `${client.teacherName} - ${client.subjectName}`;
            clientFilter.appendChild(option);
        });
    clientFilter.value = [...clientFilter.options].some((option) => option.value === current) ? current : "all";
}

function getFilteredClients(platform) {
    const search = document.getElementById(`${platform}Search`).value.trim().toLowerCase();
    const clientFilter = document.getElementById(`${platform}ClientFilter`).value;
    const statusFilter = document.getElementById(`${platform}StatusFilter`).value;
    const typeFilter = document.getElementById(`${platform}TypeFilter`).value;

    return clients
        .filter((client) => getPackageInfo(client).platform === platform)
        .filter((client) => clientFilter === "all" || client.id === clientFilter)
        .filter((client) => {
            const clientTasks = getClientTasks(client.id);
            const searchableTasks = clientTasks.map((task) => `${task.details} ${taskTypes[task.type]}`).join(" ");
            const packageInfo = getPackageInfo(client);
            const searchable = `${client.teacherName} ${client.subjectName} ${packageInfo.name} ${packageInfo.summary} ${searchableTasks}`.toLowerCase();
            return !search || searchable.includes(search);
        })
        .map((client) => {
            const clientTasks = getClientTasks(client.id)
                .filter((task) => statusFilter === "all" || (statusFilter === "done" ? task.done : !task.done))
                .filter((task) => typeFilter === "all" || task.type === typeFilter);
            return { ...client, visibleTasks: clientTasks };
        });
}

function renderStats(platform, filteredClients) {
    const platformTasks = filteredClients.flatMap((client) => client.visibleTasks || []);
    const added = platformTasks.length;
    const done = platformTasks.filter((task) => task.done).length;
    const pending = added - done;
    const totalPackageTasks = filteredClients.reduce((sum, client) => sum + getPackageTotal(client), 0);
    const remainingToAdd = Math.max(totalPackageTasks - filteredClients.reduce((sum, client) => sum + getClientTasks(client.id).length, 0), 0);

    document.getElementById(`${platform}Stats`).innerHTML = `
        <div class="stat"><span>إجمالي التاسكات داخل الباقات</span><strong>${totalPackageTasks}</strong></div>
        <div class="stat"><span>التاسكات المضافة</span><strong>${added}</strong></div>
        <div class="stat"><span>المتبقي للإضافة</span><strong>${remainingToAdd}</strong></div>
        <div class="stat"><span>المتبقي للتنفيذ</span><strong>${pending}</strong></div>
      `;
}

function renderBoards() {
    ["facebook", "youtube"].forEach((platform) => {
        renderPlatformFilters(platform);
        const filteredClients = getFilteredClients(platform);
        renderStats(platform, filteredClients);

        const board = document.getElementById(`${platform}Board`);

        if (!filteredClients.length) {
            board.innerHTML = `<div class="empty">لا يوجد عملاء في هذا القسم حتى الآن</div>`;
            return;
        }

        board.innerHTML = filteredClients.map((client) => renderClientPackage(client)).join("");
    });
}

function renderClientPackage(client) {
    const pack = getPackageInfo(client);
    const allClientTasks = getClientTasks(client.id);
    const total = getPackageTotal(client);
    const added = allClientTasks.length;
    const remaining = getRemainingTasks(client);
    const done = allClientTasks.filter((task) => task.done).length;
    const endDate = addMonths(client.startDate, Number(client.duration));

    const tasksHtml = client.visibleTasks.length ? `
        <div class="tasks-table-wrap">
          <table>
            <thead>
              <tr>
                <th>تم؟</th>
                <th>نوع التاسك</th>
                <th>تفاصيل التاسك</th>
                <th>تاريخ التنفيذ</th>
                <th>تاريخ الرفع</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${client.visibleTasks.map((task) => `
                <tr class="${task.done ? "done-row" : ""}">
                  <td><input type="checkbox" ${task.done ? "checked" : ""} onchange="toggleTask('${task.id}')" /></td>
                  <td><span class="chip">${taskTypes[task.type]}</span></td>
                  <td class="task-details">${task.details}</td>
                  <td>${formatDate(task.executeDate)}</td>
                  <td>${formatDate(task.uploadDate)}</td>
                  <td><span class="status-pill ${task.done ? "done" : ""}">${task.done ? "تم" : "متبقي"}</span></td>
                  <td><button class="danger" type="button" onclick="deleteTask('${task.id}')">حذف</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="empty">لم تتم إضافة أي تاسكات مطابقة للفلاتر الحالية</div>`;

    return `
        <article class="teacher-package">
          <div class="package-head">
            <div>
              <h3>${client.teacherName}</h3>
              <div class="package-meta">
                <span>${client.subjectName}</span>
                <span>•</span>
                <span>${pack.name}</span>
                <span>•</span>
                <span>${pack.summary}</span>
              </div>
            </div>
            <div class="package-actions">
              <button class="success" type="button" onclick="toggleTaskForm('${client.id}')">+ إضافة تاسك</button>
              <button class="danger" type="button" onclick="deleteClient('${client.id}')">حذف العميل</button>
            </div>
          </div>

          <div class="package-body">
            <div class="stats" style="margin-bottom:0;">
              <div class="stat"><span>تاريخ الاشتراك</span><strong>${formatDate(client.startDate)}</strong></div>
              <div class="stat"><span>تاريخ الانتهاء</span><strong>${formatDate(endDate)}</strong></div>
              <div class="stat"><span>إجمالي التاسكات داخل الباقة</span><strong>${total}</strong></div>
              <div class="stat"><span>مضافة / متبقية</span><strong>${added} / ${remaining}</strong></div>
            </div>

            <div class="stats" style="margin-bottom:0;">
              <div class="stat"><span>تم تنفيذها</span><strong>${done}</strong></div>
              <div class="stat"><span>باقي تنفيذها</span><strong>${Math.max(added - done, 0)}</strong></div>
              <div class="stat"><span>مدة الاشتراك</span><strong>${client.duration} شهر</strong></div>
              <div class="stat"><span>حالة إضافة التاسكات</span><strong>${remaining === 0 ? "مكتملة" : "ناقصة"}</strong></div>
            </div>

            ${client.shootingBooking?.day && client.shootingBooking?.time ? `
              <div class="stat">
                <span>حجز تصوير الاستوديو</span>
                <strong>${client.shootingBooking.day} - ${client.shootingBooking.time}</strong>
                ${client.shootingBooking.notes ? `<p style="margin:8px 0 0;color:var(--muted);font-weight:800;line-height:1.7;">${client.shootingBooking.notes}</p>` : ""}
              </div>
            ` : ""}

            <form id="taskForm-${client.id}" class="task-form" onsubmit="addManualTask(event, '${client.id}')">
              <div class="two-cols">
                <div class="form-row">
                  <label>نوع التاسك</label>
                  <select name="taskType" required>
                    <option value="design">تصميم</option>
                    <option value="video">فيديو</option>
                    <option value="mixed-post">بوست منوع</option>
                    <option value="reel">ريل</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>تاريخ التنفيذ</label>
                  <input name="executeDate" type="date" required />
                </div>
              </div>

              <div class="two-cols">
                <div class="form-row">
                  <label>تاريخ الرفع</label>
                  <input name="uploadDate" type="date" required />
                </div>
                <div class="form-row">
                  <label>عدد التاسكات المتبقية للإضافة</label>
                  <input type="text" value="${remaining}" disabled />
                </div>
              </div>

              <div class="form-row">
                <label>تفاصيل التاسك</label>
                <textarea name="taskDetails" placeholder="اكتب تفاصيل التاسك هنا... مثال: تصميم بوست مراجعة ليلة الامتحان / قص ريل من فيديو شرح الوحدة الأولى" required></textarea>
              </div>

              <div class="btns">
                <button class="primary" type="submit">حفظ التاسك</button>
                <button class="secondary" type="button" onclick="toggleTaskForm('${client.id}')">إغلاق</button>
              </div>
            </form>

            ${tasksHtml}
          </div>
        </article>
      `;
}

["facebook", "youtube"].forEach((platform) => {
    ["Search", "ClientFilter", "StatusFilter", "TypeFilter"].forEach((suffix) => {
        const element = document.getElementById(`${platform}${suffix}`);
        element.addEventListener("input", renderBoards);
        element.addEventListener("change", renderBoards);
    });
});

document.getElementById("clearAll").addEventListener("click", () => {
    if (!confirm("هل تريد مسح كل العملاء والتاسكات؟")) return;
    clients = [];
    tasks = [];
    saveData();
    render();
});

document.getElementById("exportCsv").addEventListener("click", () => {
    const rows = [["اسم المدرس", "المادة", "الباكدج", "يوم تصوير الاستوديو", "ميعاد تصوير الاستوديو", "ملاحظات التصوير", "نوع التاسك", "تفاصيل التاسك", "تاريخ التنفيذ", "تاريخ الرفع", "الحالة"]];

    tasks.forEach((task) => {
        const client = clients.find((item) => item.id === task.clientId);
        if (!client) return;
        rows.push([
            client.teacherName,
            client.subjectName,
            getPackageInfo(client).name,
            client.shootingBooking?.day || "",
            client.shootingBooking?.time || "",
            client.shootingBooking?.notes || "",
            taskTypes[task.type],
            task.details,
            task.executeDate,
            task.uploadDate,
            task.done ? "تم" : "متبقي"
        ]);
    });

    const csv = "﻿" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teacher-packages-manual-tasks.csv";
    link.click();
    URL.revokeObjectURL(url);
});

function render() {
    renderClientList();
    renderBoards();
    renderShootingSchedule();
}

render();
