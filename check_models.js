import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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" // <-- your API key here
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
