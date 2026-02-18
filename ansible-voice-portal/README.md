# Ansible Voice Portal

Ansible Voice Portal is a web application that allows users to execute tasks in Ansible using voice commands. The application leverages the Web Speech API for voice recognition and interacts with the AWX API to manage task execution.

## Features

- Voice command input for executing Ansible tasks
- Real-time status updates of task execution
- User-friendly interface for managing tasks

## Project Structure

```
ansible-voice-portal
├── src
│   ├── components
│   │   ├── VoiceInput.tsx
│   │   ├── TaskExecutor.tsx
│   │   └── StatusDisplay.tsx
│   ├── services
│   │   ├── awxClient.ts
│   │   ├── voiceRecognition.ts
│   │   └── taskParser.ts
│   ├── pages
│   │   ├── Dashboard.tsx
│   │   └── index.tsx
│   ├── types
│   │   └── index.ts
│   └── App.tsx
├── public
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/alabrador/ansible-voice-portal.git
   ```
2. Navigate to the project directory:
   ```
   cd ansible-voice-portal
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000` to access the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.