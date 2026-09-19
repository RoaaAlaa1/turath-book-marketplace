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
            "You are Turath's friendly book recommendation assistant. You help customers find " +
            "used books they'll love based on their interests, mood, or specific requests. Keep " +
            "replies warm, concise, and focused only on books available in our catalog. Use the " +
            "search_books tool whenever a customer asks for a recommendation or mentions a genre, " +
            "author, or topic. If asked about anything unrelated to books (orders, account issues, " +
            "etc.), politely explain that you can only help with book recommendations and suggest " +
            "they contact support for other questions.";

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