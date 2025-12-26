import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai"

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// const llm = new ChatTogetherAI({
//   model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
//   temperature: 0,
//   apiKey: process.env.TOGETHERAI_API_KEY,
// })

// const messages=[
//   {
//     role: "system",
//     content: "What is the capital of France?"
//   },
//   {
//     role: "user",
//     content: "The capital of France is Paris."
//   }
// ]

// const result = await llm.invoke(messages)

// console.log(result)