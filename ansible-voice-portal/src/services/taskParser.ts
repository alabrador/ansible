export function parseTaskCommand(command: string): { task: string; params?: Record<string, any> } | null {
    const commandMapping: { [key: string]: string } = {
        "start server": "start_server",
        "stop server": "stop_server",
        "restart server": "restart_server",
        "deploy application": "deploy_app",
        // Add more command mappings as needed
    };

    const task = commandMapping[command.toLowerCase()];

    if (!task) {
        return null; // Command not recognized
    }

    // Example of extracting parameters from the command if needed
    const params: Record<string, any> = {};
    // Logic to parse parameters can be added here

    return { task, params };
}