

const formatTodosForAI = (board:Board) => {
    const todos = Array.from(board.columns.entries());

    const flatArray = todos.reduce((map, [key,value])=>{
        map[key] = value.todos;
        return map;
    }, {} as { [key in TypedColumns]: Todo[] }
    );

    const flatArrayCounted = Object.entries(flatArray).reduce(
        (map, [key, value]) => {
            map[key as TypedColumns] = value.length;
            return map;
        },
        {} as { [key in TypedColumns]: number }
    );
    return flatArrayCounted;
}



export const fetchSuggestionHelper = async (board:Board) => {
    const todos = formatTodosForAI(board)

    const response = await fetch("/api/generateSummary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ todos})
    });

    const gptData = await response.json();
    const {content} = gptData;
    return content;
    
}