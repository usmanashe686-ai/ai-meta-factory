import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "process.env.OPENAI_API_KEY" // <-- your API key here
});

async function listModels() {
  try {
    const response = await openai.models.list();
    console.log("Models your token can access:");
    response.data.forEach(model => {
      console.log(model.id);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
