const events = [
  {
    id: 1,
    title: "Taco Hemingway — 1-800-OŚWIECENIE Tour",
    type: "Koncert",
    city: "Warszawa",
    date: "21 czerwca 2026",
    time: "20:00",
    venue: "PGE Narodowy",
    image:
      "[images.unsplash.com](https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1400&auto=format&fit=crop)",
    vibe: "Energia",
    music: ["rap", "urban", "polski hip-hop"],
    people: 12,
    limit: 16,
    age: "20–31",
    compatibility: 94,
  },
  {
    id: 2,
    title: "Nocne kino: Diuna 3 — premiera",
    type: "Kino",
    city: "Kraków",
    date: "3 lipca 2026",
    time: "21:30",
    venue: "Kino Pod Baranami",
    image:
      "[images.unsplash.com](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400&auto=format&fit=crop)",
    vibe: "Kulturalnie",
    music: ["soundtrack", "ambient", "sci-fi"],
    people: 5,
    limit: 8,
    age: "23–35",
    compatibility: 88,
  },
  {
    id: 3,
    title: "Open’er Festival — dzień 2",
    type: "Festiwal",
    city: "Gdynia",
    date: "10 lipca 2026",
    time: "16:00",
    venue: "Lotnisko Gdynia-Kosakowo",
    image:
      "[images.unsplash.com](https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1400&auto=format&fit=crop)",
    vibe: "Afterparty",
    music: ["indie", "pop", "electro"],
    people: 18,
    limit: 24,
    age: "19–29",
    compatibility: 96,
  },
  {
    id: 4,
    title: "Derby miasta — wielki mecz",
    type: "Sport",
    city: "Poznań",
    date: "17 sierpnia 2026",
    time: "18:00",
    venue: "Stadion Miejski",
    image:
      "[images.unsplash.com](https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1400&auto=format&fit=crop)",
    vibe: "Energia",
    music: ["stadion", "rock"],
    people: 9,
    limit: 12,
    age: "21–38",
    compatibility: 83,
  },
  {
    id: 5,
    title: "Stand-up: Wieczór bez filtra",
    type: "Stand-up",
    city: "Wrocław",
    date: "29 sierpnia 2026",
    time: "19:30",
    venue: "Klub Komediowy",
    image:
      "[images.unsplash.com](https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1400&auto=format&fit=crop)",
    vibe: "Nowe znajomości",
    music: ["lo-fi", "funk"],
    people: 6,
    limit: 10,
    age: "24–34",
    compatibility: 91,
  },
  {
    id: 6,
    title: "Jazz Night nad Wisłą",
    type: "Koncert",
    city: "Warszawa",
    date: "7 września 2026",
    time: "20:30",
    venue: "Letnia Scena",
    image:
      "[images.unsplash.com](https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1400&auto=format&fit=crop)",
    vibe: "Chill",
    music: ["jazz", "soul", "neo soul"],
    people: 4,
    limit: 6,
    age: "25–40",
    compatibility: 87,
  },
];

const users = [
  {
    name: "Ola",
    age: 24,
    city: "Warszawa",
    photo:
      "[images.unsplash.com](https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop)",
    description: "Koncerty, spontaniczne plany i ludzie z dobrą energią.",
    interests: ["koncerty", "rap", "food spots"],
    music: ["Taco", "Daria Zawiałow", "Rosalía"],
    personality: "ENFP",
    social: "Extro",
    rating: 4.9,
    compatibility: 96,
    verified: true,
    trusted: true,
  },
  {
    name: "Kuba",
    age: 28,
    city: "Warszawa",
    photo:
      "[images.unsplash.com](https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop)",
    description: "Lubię koncerty, ale nie lubię chaosu organizacyjnego.",
    interests: ["hip-hop", "sport", "stand-up"],
    music: ["PRO8L3M", "Quebonafide", "The Weeknd"],
    personality: "INTJ",
    social: "Ambi",
    rating: 4.8,
    compatibility: 91,
    verified: true,
    trusted: true,
  },
  {
    name: "Nadia",
    age: 27,
    city: "Wrocław",
    photo:
      "[images.unsplash.com](https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop)",
    description: "Kino, indie koncerty i chillowe rozmowy po wydarzeniu.",
    interests: ["kino", "indie", "podróże"],
    music: ["The 1975", "Tame Impala", "Mela Koteluk"],
    personality: "INFJ",
    social: "Intro",
    rating: 5.0,
    compatibility: 89,
    verified: true,
    trusted: false,
  },
  {
    name: "Bartek",
    age: 29,
    city: "Kraków",
    photo:
      "[images.unsplash.com](https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop)",
    description: "Stand-upy, festiwale i ekipy, które nie zamulają.",
    interests: ["stand-up", "festiwale", "techno"],
    music: ["Fred again..", "Bicep", "Kiasmos"],
    personality: "ENTP",
    social: "Extro",
    rating: 4.7,
    compatibility: 93,
    verified: true,
    trusted: true,
  },
];

let activeType = "all";

const eventsGrid = document.querySelector("#eventsGrid");
const matchesGrid = document.querySelector("#matchesGrid");
const filterButtons = document.querySelectorAll(".filter");
const cityFilter = document.querySelector("#cityFilter");
const vibeFilter = document.querySelector("#vibeFilter");

function renderEvents() {
  const selectedCity = cityFilter.value;
  const selectedVibe = vibeFilter.value;

  const filteredEvents = events.filter((event) => {
    const typeMatch = activeType === "all" || event.type === activeType;
    const cityMatch = selectedCity === "all" || event.city === selectedCity;
    const vibeMatch = selectedVibe === "all" || event.vibe === selectedVibe;

    return typeMatch && cityMatch && vibeMatch;
  });

  eventsGrid.innerHTML = filteredEvents
    .map(
      (event) => `
      <article class="event-card glass">
        <div class="event-image" style="background-image: url('${event.image}')">
          <span class="event-type">${event.type}</span>
        </div>

        <div class="event-content">
          <h3>${event.title}</h3>

          <div class="meta">
            <span>${event.city}</span>
            <span>·</span>
            <span>${event.date}</span>
            <span>·</span>
            <span>${event.time}</span>
          </div>

          <p class="meta">${event.venue} · wiek ${event.age}</p>

          <div class="tags">
            <span class="tag">${event.vibe}</span>
            ${event.music.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>

          <div class="event-bottom">
            <div>
              <strong>${event.people}/${event.limit}</strong>
              <span class="meta"> osób</span>
              <div class="compatibility">${event.compatibility}% match</div>
            </div>

            <button class="join-btn">Dołącz</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  if (filteredEvents.length === 0) {
    eventsGrid.innerHTML = `
      <article class="event-card glass" style="padding: 24px;">
        <h3>Brak wydarzeń dla tych filtrów</h3>
        <p class="meta">Zmień miasto, typ wydarzenia albo vibe.</p>
      </article>
    `;
  }
}

function renderMatches() {
  matchesGrid.innerHTML = users
    .map(
      (user) => `
      <article class="match-card glass">
        <div class="match-top">
          <img src="${user.photo}" alt="Zdjęcie profilu: ${user.name}" />
          <div>
            <h3>
              ${user.name}, ${user.age}
              ${user.verified ? `<span class="verified">✓</span>` : ""}
            </h3>
            <p>${user.city} · ${user.personality} · ${user.social}</p>
            <p>⭐ ${user.rating} ${user.trusted ? "· trusted user" : ""}</p>
          </div>
        </div>

        <div class="match-score">${user.compatibility}% kompatybilności</div>

        <p class="section-copy" style="font-size: 0.92rem; margin-top: 0;">
          ${user.description}
        </p>

        <div class="tags">
          ${user.interests.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          ${user.music.slice(0, 2).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>

        <button class="join-btn">Dołącz do grupy</button>
      </article>
    `
    )
    .join("");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeType = button.dataset.filter;
    renderEvents();
  });
});

cityFilter.addEventListener("change", renderEvents);
vibeFilter.addEventListener("change", renderEvents);

const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = chatInput.value.trim();

  if (!value) return;

  const message = document.createElement("div");
  message.className = "message own";
  message.innerHTML = `
    <div>
      <strong>Ty</strong>
      <p>${escapeHtml(value)}</p>
    </div>
  `;

  chatMessages.appendChild(message);
  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char];
  });
}

function updateCountdown() {
  const targetDate = new Date("2026-06-21T20:00:00").getTime();
  const now = new Date().getTime();
  const distance = targetDate - now;

  const countdown = document.querySelector("#countdown");

  if (distance <= 0) {
    countdown.textContent = "wydarzenie trwa";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);

  countdown.textContent = `${days} dni ${hours}h ${minutes}m`;
}

renderEvents();
renderMatches();
updateCountdown();

setInterval(updateCountdown, 60 * 1000);
