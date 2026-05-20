const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Internshala Assignment API",
      version: "1.0.0",
      description:
        "Versioned REST API with JWT authentication, role-based access control (RBAC), and Notes CRUD.\n\n" +
        "## Authentication\n" +
        "All protected endpoints require a `Bearer <token>` header. Obtain a token via `/auth/register` or `/auth/login`.\n\n" +
        "## Roles\n" +
        "- **user** – can create, read, update, and delete their own notes.\n" +
        "- **admin** – can read, update, and delete any note in the system.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the JWT token returned by /auth/login or /auth/register",
        },
      },
      schemas: {
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string", example: "664a1f2e8b3c4d5e6f7a8b9c" },
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", format: "email", example: "jane@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            data: { $ref: "#/components/schemas/UserProfile" },
          },
        },
        Note: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1f2e8b3c4d5e6f7a8b9c" },
            title: { type: "string", example: "My first note" },
            content: { type: "string", example: "This is the note body." },
            owner: { type: "string", example: "664a1f2e8b3c4d5e6f7a8b9c" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        NoteInput: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: {
              type: "string",
              maxLength: 100,
              example: "My first note",
            },
            content: {
              type: "string",
              maxLength: 1000,
              example: "This is the note body.",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "fail" },
            message: { type: "string", example: "Descriptive error message" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Unauthorized – missing or invalid JWT token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { status: "fail", message: "Unauthorized access" },
            },
          },
        },
        Forbidden: {
          description: "Forbidden – you do not have permission to access this resource",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { status: "fail", message: "Forbidden" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { status: "fail", message: "Note not found" },
            },
          },
        },
        ValidationError: {
          description: "Validation error – check request body",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                status: "fail",
                message: '"title" is required, "content" is not allowed to be empty',
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
