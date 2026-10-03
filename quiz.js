
const token = localStorage.getItem("wadToken");

const form = document.getElementById("quizForm");
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");

let questions = [];

if (!token) {
  statusEl.textContent = "Please log in first.";
  setTimeout(() => location.href = "/login.html", 800);
} else {
  loadQuestions();
}

async function loadQuestions() {
  try {
    const response = await fetch("/api/questions");
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Unable to load questions");
    }

    questions = data.slice(0, 10);

    if (questions.length !== 10) {
      statusEl.textContent =
        `Only ${questions.length} questions are available. Please add questions until there are 10.`;
      return;
    }

    statusEl.textContent = "Answer all 10 questions before submitting.";

    form.innerHTML = questions.map((q, i) => `
      <section class="question-card">
        <h5>Question ${i + 1} of 10</h5>
        <p>${escapeHtml(q.text)}</p>

        ${q.options.map((option, index) => `
          <label class="option">
            <input
              type="radio"
              name="q${i}"
              value="${index}"
              required
            >
            ${escapeHtml(option)}
          </label>
        `).join("")}
      </section>
    `).join("");

  } catch (error) {
    statusEl.textContent = "Could not load questions.";
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.getElementById("submitQuiz").addEventListener("click", async () => {

  if (questions.length !== 10) {
    messageEl.textContent = "The quiz must contain 10 questions.";
    return;
  }

  const answers = questions.map((q, i) => {
    const selected = form.querySelector(
      `input[name="q${i}"]:checked`
    );

    return {
      questionId: q._id,
      selectedIndex: selected ? Number(selected.value) : -1
    };
  });

  if (answers.some(a => a.selectedIndex === -1)) {
    messageEl.textContent = "Please answer all 10 questions.";
    return;
  }

  try {
    const response = await fetch("/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    const data = await response.json();

    if (!response.ok) {
      messageEl.textContent = data.message;
      return;
    }

    sessionStorage.setItem(
      "wadLastResult",
      JSON.stringify(data.result)
    );

    location.href = "/result.html";

  } catch {
    messageEl.textContent = "Could not save result.";
  }
});