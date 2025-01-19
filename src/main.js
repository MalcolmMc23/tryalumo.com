import "./style.css";
import OpenAI from "openai";
import { marked } from "marked";
import alumniData from "./data2.json"; // Import alumni JSON data

let alumniDataPars = JSON.stringify(alumniData)
console.log(alumniDataPars)

// Initialize the OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Initialize the conversation with system messages
let conversation = [
  {
    role: "system",
    content: `You are an AI that helps users connect with alumni. you will try your best to relate the users prompt to the dataset given (specifficlly their title). You will provide information relevant to the user's prompt (including email, LinkedIn URL, locations, company, etc). Format your responses as readable text without JSON brackets. If you don't have some information, leave it blank. ONLY RESPOND WITH THE DATA PROVIDED! please give advice on what to prompt when you cant find matchs`,
  },
  {
    role: "system",
    content: `Here is a JSON dataset of alumni information for reference:
    
Context:
    
    ${alumniDataPars}`,
  },
];

// Function to fetch career advice using OpenAI
async function fetchCareerAdvice(question) {
  conversation.push({ role: "user", content: question });

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: conversation,
      temperature: 0.7,
    });

    const assistantReply = completion.choices[0].message.content;
    conversation.push({ role: "assistant", content: assistantReply });
    return assistantReply;
  } catch (error) {
    console.error("Error making API call:", error);
    throw error;
  }
}

// Set up the UI
document.querySelector("#app").innerHTML = `
  <div class="container">
    <header class="header">
      <div class="logo">
        <img src="https://i.imgur.com/CipeLd6.png" alt="Alumo Logo" class="logo-image" />
        <span class="logo-text">Alumo</span>
      </div>
      <div class="nav-buttons">
        <a href="https://tryalumo.circle.so/c/template-library/" target="_blank" class="nav-button">Templates</a>
        <a href="https://tryalumo.circle.so/c/find-a-mentor/" target="_blank" class="nav-button">Mentorship</a>
        <a href="https://tryalumo.circle.so/c/upcoming-events/?sort=asc" target="_blank" class="nav-button">Events</a>
      </div>
    </header>
    <div class="welcome-message">
      <h1>Welcome to Alumo 👋</h1>
      <p>Real people, real opportunities—welcome to the network that works for you.</p>
    </div>
    <div class="input-container">
      <input type="text" id="userInput" placeholder="Search for alumni by industry, location, or role..." />
      <button id="sendButton">Search</button>
    </div>
    <div id="output" class="message hidden"></div>
  </div>
`;

// Get DOM elements
const userInput = document.querySelector("#userInput");
const sendButton = document.querySelector("#sendButton");
const outputDiv = document.querySelector("#output");

// Handle form submission
async function handleSubmit() {
  const text = userInput.value.trim();
  if (!text) return;

  try {
    outputDiv.classList.remove("hidden");
    outputDiv.textContent = "Searching...";
    const aiResponse = await fetchCareerAdvice(text);

    // Log the API output before rendering it
    console.log("API Response:", aiResponse);

    // Use marked to parse markdown and render as HTML
    outputDiv.innerHTML = marked(aiResponse);
  } catch (error) {
    console.error("Error in handleSubmit:", error);
    outputDiv.textContent = `Error: ${error.message}`;
  }

  userInput.value = "";
}

// Add event listeners
sendButton.addEventListener("click", handleSubmit);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSubmit();
  }
});