/* =====================================================================
   A. ADMIN DATA – THIS IS WHERE ADMIN EDITS SPORTS & MATCH TIMINGS
   ===================================================================== */

// List of sports (icon + name). Add a new line to add a new sport.
const SPORTS = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "badminton", name: "Badminton", icon: "🏸" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "cricket", name: "Cricket", icon: "🏏" },
  { id: "tabletennis", name: "Table Tennis", icon: "🏓" },
  { id: "chess", name: "Chess", icon: "♟️" },
  { id: "athletics", name: "Athletics", icon: "🏃" },
  { id: "volleyball", name: "Volleyball", icon: "🏐" },
];

// Match schedule. Change date/time/venue here and the website updates itself.
// date format: YYYY-MM-DD   time: any text you like
const SCHEDULE = [
  {
    date: "2026-11-10",
    time: "09:00 AM",
    sport: "Cricket",
    venue: "Main Ground",
  },
  {
    date: "2026-11-11",
    time: "10:30 AM",
    sport: "Football",
    venue: "Football Field",
  },
  {
    date: "2026-11-12",
    time: "02:00 PM",
    sport: "Badminton",
    venue: "Indoor Hall",
  },
  {
    date: "2026-11-13",
    time: "11:00 AM",
    sport: "Basketball",
    venue: "Basketball Court",
  },
  {
    date: "2026-11-14",
    time: "03:00 PM",
    sport: "Table Tennis",
    venue: "Indoor Hall",
  },
  {
    date: "2026-11-15",
    time: "10:00 AM",
    sport: "Chess",
    venue: "Seminar Room",
  },
  {
    date: "2026-11-16",
    time: "07:30 AM",
    sport: "Athletics",
    venue: "Running Track",
  },
];

/* =====================================================================
   B. SMALL HELPER FUNCTIONS
   ===================================================================== */
const $ = (id) => document.getElementById(id);

// Read / write data in the browser (localStorage). Demo only – see notes.
const load = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Nice date like "10 Nov 2026"
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* =====================================================================
   C. BUILD THE SPORT ICONS, CALENDAR AND UPCOMING CARDS
   ===================================================================== */
// Footer icons: all sports + bigger calendar icon
$("footerIcons").innerHTML =
  SPORTS.map(
    (s) =>
      `<a class="sport-icon" href="#/sport/${s.id}"><span>${s.icon}</span>${s.name}</a>`,
  ).join("") +
  `<a class="sport-icon calendar" href="#/calendar"><span>📅</span>Calendar</a>`;

// Sports grid on home page (these cards also use scroll reveal)
$("sportGrid").innerHTML = SPORTS.map(
  (s) =>
    `<a class="card reveal" href="#/sport/${s.id}"><div class="big">${s.icon}</div>${s.name}<br><small>Tap to participate</small></a>`,
).join("");

// Calendar table rows
$("scheduleBody").innerHTML = SCHEDULE.map(
  (m) =>
    `<tr><td>${fmt(m.date)}</td><td>${m.time}</td><td>${m.sport}</td><td>${m.venue}</td></tr>`,
).join("");

// First 3 matches on home page
$("upcoming").innerHTML = SCHEDULE.slice(0, 3)
  .map(
    (m, i) =>
      `<div class="card reveal ${i == 0 ? "from-left" : i == 2 ? "from-right" : ""}"><div class="big">${m.sport}</div>${fmt(m.date)} · ${m.time}<br>${m.venue}</div>`,
  )
  .join("");

/* =====================================================================
   D. PAGE SWITCHING (works with the # part of the web address)
   #/ = home   #/register   #/calendar   #/sport/badminton
   ===================================================================== */
function route() {
  const hash = location.hash || "#/";
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  if (hash.startsWith("#/register")) {
    $("page-register").classList.add("active");
  } else if (hash.startsWith("#/calendar")) {
    $("page-calendar").classList.add("active");
  } else if (hash.startsWith("#/sport/")) {
    const sport = SPORTS.find((s) => s.id === hash.split("/")[2]);
    if (sport) {
      $("sportTitle").textContent =
        sport.icon + " " + sport.name + " – participation";
      $("joinForm").dataset.sport = sport.name; // remember which sport
      $("joinMsg").className = "msg";
      $("page-sport").classList.add("active");
    }
  } else {
    $("page-home").classList.add("active");
  }
  window.scrollTo(0, 0);
  setTimeout(watchReveal, 50); // re-check which elements should animate
}
window.addEventListener("hashchange", route);

/* =====================================================================
   E. REGISTRATION FORM
   ===================================================================== */
$("regForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("rEmail").value.trim().toLowerCase();
  const msg = $("regMsg");

  // Only Gmail addresses allowed
  if (!email.endsWith("@gmail.com")) {
    msg.className = "msg err";
    msg.textContent = "Please use your Gmail ID (example@gmail.com).";
    return;
  }
  const students = load("students");
  if (students.some((s) => s.email === email)) {
    msg.className = "msg err";
    msg.textContent = "This Gmail is already registered.";
    return;
  }
  students.push({
    name: $("rName").value,
    email,
    year: $("rYear").value,
    dept: $("rDept").value,
    course: $("rCourse").value,
    sem: $("rSem").value,
  });
  save("students", students);
  msg.className = "msg ok";
  msg.textContent =
    "Registration done! Now choose a sport from the icons below.";
  e.target.reset();
});

/* =====================================================================
   F. SPORT PARTICIPATION FORM
   ===================================================================== */
$("joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("jEmail").value.trim().toLowerCase();
  const sport = e.target.dataset.sport;
  const msg = $("joinMsg");

  // Student must be registered first
  if (!load("students").some((s) => s.email === email)) {
    msg.className = "msg err";
    msg.innerHTML =
      "Please <a href='#/register' style='text-decoration:underline'>register</a> first.";
    return;
  }
  const apps = load("applications");
  if (apps.some((a) => a.email === email && a.sport === sport)) {
    msg.className = "msg err";
    msg.textContent = "You already applied for " + sport + ".";
    return;
  }
  apps.push({
    email,
    sport,
    role: $("jRole").value,
    appliedOn: new Date().toISOString(),
  });
  save("applications", apps);
  msg.className = "msg ok";
  msg.textContent = "Applied for " + sport + " successfully. Good luck!";
});

/* =====================================================================
   G. SCROLL ANIMATIONS
   ===================================================================== */
// 1) Reveal elements when they enter the screen
let observer;
function watchReveal() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("show");
          // number counter animation
          en.target.querySelectorAll("[data-count]").forEach(countUp);
        }
      });
    },
    { threshold: 0.25 },
  );
  document
    .querySelectorAll(".page.active .reveal")
    .forEach((el) => observer.observe(el));
}

// 2) Count-up numbers (0 -> target)
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const target = +el.dataset.count;
  let n = 0;
  const step = setInterval(() => {
    n += Math.ceil(target / 40);
    if (n >= target) {
      n = target;
      clearInterval(step);
    }
    el.textContent = n + (target >= 100 ? "+" : "");
  }, 30);
}

// 3) On scroll: progress bar, solid navbar, parallax hero background
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  $("progress").style.width = (y / max) * 100 + "%";
  $("nav").classList.toggle("solid", y > 60);
  $("heroBg").style.transform =
    `translateY(${y * 0.35}px) scale(${1 + y / 3000})`; // parallax
});

/* ============ START ============ */
route();
