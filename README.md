# Chat App

Chat App is a real-time chat application that allows users to send messages and interact with each other in real-time. The app uses Socket.IO for handling real-time communication, saves messages to MongoDB for persistence, and calls an external API to generate content for the messages.

## Features

- Real-time chat with Socket.IO
- Messages saved to MongoDB for persistence
- External API integration for message content generation 

## Technologies Used

- Docker
- Node.js
- Express
- Socket.IO
- MongoDB
- Axios (for API calls)
- [External API Name]

## Getting Started

## Prerequisites

Before getting started, make sure you have the following prerequisites installed on your machine:

1. **Docker**: Download and install Docker from the official website: [https://www.docker.com/get-started](https://www.docker.com/get-started).

2. **docker-compose**: docker-compose is usually included with Docker, but you may need to install it separately. Follow the instructions for your platform here: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/).

3. **Git**: If you don't have Git installed, you can download it from [https://git-scm.com/downloads](https://git-scm.com/downloads) and follow the installation instructions for your operating system.

## Configuration

The Chat App comes with default configuration parameters to get you started quickly. However, you may need to customize these parameters based on your specific requirements. You can find the configuration under chat-api/src/config

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/chat-api.git
   cd chat-api/docker
   docker build . -t chat-api
   docker-compose up -d

## Checking if the Chat App is Working

Once you have the Chat App running using Docker, you can check if it's working correctly by sending an HTTP request. By default, the app listens on port 8080 inside the Docker container, and you can access it through `http://localhost:8080` on your host machine.

To verify that the Chat App is up and running, you can use the `/health` endpoint. This endpoint is designed to provide a simple health check response.

To check the health of the Chat App, open your web browser or use tools like `curl` or `Postman` and send an HTTP GET request to `http://localhost:8080/health`.

If the Chat App is working correctly, you should receive a 200 OK response.

Example:
GET http://localhost:8080/health
Response: 200 OK

### Contributing

Contributions to the Chat App are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or create a pull request. Please refer to CONTRIBUTING.md for more information.

### License

This project is licensed under the MIT License. See the LICENSE file for details.