using System.Text;
using System.Text.Json;
using TurathApi.Models.Chatbot;

namespace TurathApi.Services
{
    public class ChatbotService
    {
        private readonly HttpClient _httpClient;
        private readonly ChatbotToolService _toolService;
        private readonly IConfiguration _config;
        private readonly ILogger<ChatbotService> _logger;

        private const string SystemPrompt =
            "You are Turath's friendly, sophisticated book recommendation companion named Jalis (جليس). " +
            "You help readers discover pre-loved and recycled books from our catalog based on their interests, mood, or requests.\n\n" +
            "FORMATTING GUIDELINES:\n" +
            "- Write in clean, conversational, beautifully formatted prose.\n" +
            "- NEVER use markdown tables (no '|' pipes or '---' table dividers) and never use raw grid formatting.\n" +
            "- When recommending books, format each book as a clean, readable item: 📖 **Title** by *Author* — brief captivating description.\n" +
            "- Keep replies warm, concise, and easy to read in a compact chat window.\n" +
            "- Use the search_books tool whenever a customer asks for recommendations or mentions a genre, topic, or author.\n" +
            "- If asked about orders, accounts, or non-book topics, politely direct them to support.";

        public ChatbotService(HttpClient httpClient, ChatbotToolService toolService, IConfiguration config, ILogger<ChatbotService> logger)
        {
            _httpClient = httpClient;
            _toolService = toolService;
            _config = config;
            _logger = logger;
        }

        public async Task<string> GetReplyAsync(string userMessage, List<GroqMessage>? history = null)
        {
            var apiKey = _config["Groq:ApiKey"] ?? Environment.GetEnvironmentVariable("GROQ_API_KEY");
            var model = _config["Groq:Model"] ?? Environment.GetEnvironmentVariable("GROQ_MODEL") ?? "llama-3.3-70b-versatile";

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return "The book assistant is unavailable because the Groq API key is not configured. Add GROQ_API_KEY to your environment to enable recommendations.";
            }

            var messages = new List<GroqMessage>
            {
                new GroqMessage { Role = "system", Content = SystemPrompt }
            };

            if (history != null)
                messages.AddRange(history);

            messages.Add(new GroqMessage { Role = "user", Content = userMessage });

            // First call - Claude/Groq decides whether to use the tool
            var firstResponse = await CallGroqAsync(messages, ChatbotTools.ToolDefinitions, apiKey!, model);
            var choice = firstResponse.Choices.First();

            if (choice.FinishReason == "tool_calls" && choice.Message.ToolCalls != null)
            {
                messages.Add(choice.Message);

                foreach (var toolCall in choice.Message.ToolCalls)
                {
                    if (toolCall.Function.Name == "search_books")
                    {
                        var args = JsonDocument.Parse(toolCall.Function.Arguments);
                        var query = args.RootElement.GetProperty("query").GetString() ?? "";
                        var category = args.RootElement.TryGetProperty("category", out var catEl) ? catEl.GetString() : null;

                        var results = await _toolService.SearchBooks(query, category);
                        var resultJson = JsonSerializer.Serialize(results);

                        messages.Add(new GroqMessage
                        {
                            Role = "tool",
                            ToolCallId = toolCall.Id,
                            Content = resultJson
                        });
                    }
                }

                // Second call - Groq turns the tool result into a natural reply
                var secondResponse = await CallGroqAsync(messages, null, apiKey!, model);
                return secondResponse.Choices.First().Message.Content ?? "Sorry, I couldn't come up with a reply.";
            }

            return choice.Message.Content ?? "Sorry, I couldn't come up with a reply.";
        }

        private async Task<GroqChatResponse> CallGroqAsync(List<GroqMessage> messages, object[]? tools, string apiKey, string model)
        {
            var request = new GroqChatRequest
            {
                Model = model,
                Messages = messages,
                Tools = tools,
                ToolChoice = tools == null ? "none" : "auto"
            };

            var json = JsonSerializer.Serialize(request, new JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _httpClient.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Groq API error: {StatusCode} - {Body}", response.StatusCode, responseBody);
                throw new Exception($"Groq API call failed: {response.StatusCode}");
            }

            return JsonSerializer.Deserialize<GroqChatResponse>(responseBody)!;
        }
    }
}