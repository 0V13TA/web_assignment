// Initialize state arrays on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initPlanner();
  initContactValidation();
});

// ==========================================
// 1. Task Management Logic (Academic Planner)
// ==========================================
function initPlanner() {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");

  if (!taskInput || !addTaskBtn || !taskList) return;

  // Local application state array
  let tasks = [
    { id: 1, text: "Configure WebGL2 projection structures", completed: false },
    {
      id: 2,
      text: "Finish COS 106 term layout documentation",
      completed: true,
    },
  ];

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""}`;

      li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-btn-group">
                    <button class="complete-btn" onclick="toggleTask(${task.id})">✓</button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">✗</button>
                </div>
            `;
      taskList.appendChild(li);
    });
  }

  // Exposed to the global DOM context for straightforward inline attributes
  window.toggleTask = function (id) {
    tasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    renderTasks();
  };

  window.deleteTask = function (id) {
    tasks = tasks.filter((t) => t.id !== id);
    renderTasks();
  };

  addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (text === "") return;

    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
    };

    tasks.push(newTask);
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
  });

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTaskBtn.click();
    }
  });

  renderTasks();
}

// ==========================================
// 2. Strict Contact Form Validation Logics
// ==========================================
function initContactValidation() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name: {
      input: document.getElementById("user-name"),
      error: document.getElementById("name-error"),
    },
    email: {
      input: document.getElementById("user-email"),
      error: document.getElementById("email-error"),
    },
    phone: {
      input: document.getElementById("user-phone"),
      error: document.getElementById("phone-error"),
    },
    message: {
      input: document.getElementById("user-message"),
      error: document.getElementById("message-error"),
    },
  };

  const successBanner = document.getElementById("form-success");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset display errors
    Object.values(fields).forEach((f) => {
      f.error.innerText = "";
      f.input.style.borderColor = "";
    });
    successBanner.style.display = "none";

    // Requirement A: No field should be empty
    Object.keys(fields).forEach((key) => {
      if (!fields[key].input.value.trim()) {
        fields[key].error.innerText =
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
        fields[key].input.style.borderColor = "#ef4444";
        isValid = false;
      }
    });

    // Requirement B: Email structure check
    if (isValid) {
      const emailVal = fields.email.input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        fields.email.error.innerText = "Please enter a valid email format.";
        fields.email.input.style.borderColor = "#ef4444";
        isValid = false;
      }
    }

    // Requirement C: Phone number consists of digits only
    if (isValid) {
      const phoneVal = fields.phone.input.value.trim();
      const phoneRegex = /^[0-9]+$/;
      if (!phoneRegex.test(phoneVal)) {
        fields.phone.error.innerText =
          "Phone number must contain only numeric digits.";
        fields.phone.input.style.borderColor = "#ef4444";
        isValid = false;
      }
    }

    if (isValid) {
      // Show a loading state
      successBanner.innerText = "Sending your message...";
      successBanner.style.backgroundColor = "#fbbf24";
      successBanner.style.color = "#451a03";
      successBanner.style.display = "block";

      // 1. Gather all the data from the form
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // NEW: Tell FormSubmit to disable the CAPTCHA challenge for this AJAX request
      data._captcha = "false";

      // 2. Send it to FormSubmit's AJAX endpoint
      fetch("https://formsubmit.co/ajax/v.omorogbe1674@miva.edu.ng", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(async (response) => {
          // NEW: Read the response as raw text first to prevent JSON parse errors
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch (err) {
            console.error("FormSubmit returned non-JSON response:", text);
            throw new Error(
              "FormSubmit returned HTML. Check your email for an activation link.",
            );
          }
        })
        .then((result) => {
          if (result.success === "true" || result.success === true) {
            // Show success message
            successBanner.innerText = "Message sent successfully!";
            successBanner.style.backgroundColor = "#166534";
            successBanner.style.color = "#bbf7d0";
            form.reset();
          } else {
            throw new Error(
              result.message || "FormSubmit rejected the submission.",
            );
          }
        })
        .catch((error) => {
          // Show error message
          successBanner.innerText =
            "Error: Check the console or your email for activation.";
          successBanner.style.backgroundColor = "#991b1b";
          successBanner.style.color = "#fecaca";
          console.error(error);
        });
    }
  });
}
