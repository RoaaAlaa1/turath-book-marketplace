namespace TurathApi.Models.Chatbot
{
    public class ChatbotTools
    {
        public static readonly object ToolDefinitions = new object[]
       {
            new
            {
                name = "search_books",
                description = "Search for books by title, author, category, or general topic. Use this when the customer asks for book recommendations or is looking for something to read.",
                input_schema = new
                {
                    type = "object",
                    properties = new
                    {
                        query = new { type = "string", description = "Search term - could be a title, author, genre, or topic" },
                        category = new { type = "string", description = "Optional category name filter, e.g. 'Fiction', 'History'" }
                    },
                    required = new[] { "query" }
                }
            }
       };

    }
}
