namespace TurathApi.Models.Chatbot
{
    public static class ChatbotTools
    {
        public static readonly object[] ToolDefinitions = new object[]
        {
            new
            {
                type = "function",
                function = new
                {
                    name = "search_books",
                    description = "Search for books by title, author, category, or general topic. Use this whenever the customer asks for a book recommendation or mentions a genre, author, or topic.",
                    parameters = new
                    {
                        type = "object",
                        properties = new
                        {
                            query = new { type = "string", description = "Search term - a title, author, genre, or topic" },
                            category = new { type = "string", description = "Optional category filter, e.g. 'Fiction', 'History'" }
                        },
                        required = new[] { "query" }
                    }
                }
            }
        };
    }
}