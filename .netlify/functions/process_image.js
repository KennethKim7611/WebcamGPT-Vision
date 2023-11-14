const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body);
  const base64Image = body.image; // Your base64 encoded image string

  // Check if the image data is not provided
  if (!base64Image) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No image data received.' }) };
  }

  // Initialize OpenAI with your API key
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  // Define the payload for the OpenAI API
  const payload = {
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [{
        type: "text",
        text: "Is the person in the image smiling? If the person is smiling, then return 'You are smiling', if the person is not smiling, then return 'You are not smiling'. If a person is not recognized, then return 'No face to recognize'"
      }, {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
        }
      }]
    }],
    max_tokens: 300
  };


  try {
    // Your code to handle the image and make the OpenAI API call
    // ...

    // Example: Return a success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Image processed successfully" }),
    };
  } catch (error) {
    // Handle error response
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
