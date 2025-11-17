# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-11-17

### Added - MCP (Model Context Protocol) Integration

#### Core Infrastructure
- **MCP Server Specification** (`server.json`)
  - Complete capability definitions for 10 tools, 3 resources, and 3 prompts
  - JSON Schema-compliant input/output definitions
  - Transport and authentication configuration
  - Deployment configurations for Docker and Railway

- **MCP API Endpoints** (`src/routes/mcp.ts`)
  - `GET /api/v2/mcp/tools` - List all available MCP tools
  - `POST /api/v2/mcp/tools/:toolName` - Execute specific tool
  - `GET /api/v2/mcp/resources` - List available resources
  - `GET /api/v2/mcp/resources/:resourceName` - Access specific resource
  - `GET /api/v2/mcp/prompts` - List available prompts
  - `POST /api/v2/mcp/prompts/:promptName` - Execute specific prompt
  - `GET /api/v2/mcp/server-info` - Get server metadata (public endpoint)

#### MCP Tools
- `browser_navigate` - Navigate browser to a URL
- `browser_click` - Click elements on the page
- `browser_type` - Type text into input fields
- `browser_screenshot` - Capture screenshots
- `browser_get_text` - Extract text from elements
- `browser_get_content` - Get full HTML content
- `browser_evaluate` - Execute JavaScript in browser context
- `workflow_create` - Create multi-step automation workflows
- `workflow_execute` - Execute workflows by ID
- `auth_get_token` - Get JWT authentication tokens

#### MCP Resources
- `workflows` - Access to saved workflows (application/json)
- `screenshots` - Access to captured screenshots (image/png)
- `page_content` - Access to extracted page content (text/html)

#### MCP Prompts
- `scrape_website` - Navigate and extract structured data
- `fill_form` - Automate form filling and submission
- `monitor_page` - Monitor pages for changes

#### Documentation
- **Complete MCP Documentation** (`.mcp/` directory)
  - `README.md` - Documentation index and navigation
  - `guides/PUBLISHING.md` - How to publish MCP servers (7,600+ words)
  - `guides/API_USAGE.md` - How to consume registry data (11,750+ words)
  - `guides/ECOSYSTEM_VISION.md` - Understanding MCP's purpose (9,800+ words)
  - `specs/SERVER_JSON_SPEC.md` - Complete server.json reference (10,500+ words)
  - `specs/API_SPEC.md` - MCP API endpoints specification (6,800+ words)
  - `cli/CLI_REFERENCE.md` - CLI command reference (9,800+ words)
  - `COMMUNITY_PROJECTS.md` - Community contributions framework (9,500+ words)
  - `examples/BASIC_USAGE.md` - Usage examples and patterns (9,900+ words)

#### GitHub Copilot Integration
- `.github/copilot/mcp-servers.json` - Copilot MCP server configuration
- `.github/copilot/README.md` - Quick setup guide for Copilot users
- Updated `.github/copilot-instructions.md` with MCP best practices

#### Testing
- **MCP Test Suite** (`tests/mcp.test.ts`)
  - 21 comprehensive test cases (all passing)
  - Tool listing and execution tests
  - Resource access tests
  - Prompt execution and validation tests
  - Authentication requirement tests
  - Error handling tests
  - 404 handling for unknown resources

### Changed

- Updated `README.md` with MCP badge and integration section
- Updated `.github/copilot-instructions.md` with MCP documentation references
- Enhanced `src/index.ts` to mount MCP routes on `/api/v2`

### Technical Details

**Architecture:**
- MCP endpoints integrate with existing JWT authentication middleware
- Rate limiting inherited from main application configuration
- Logging uses Winston logger with consistent format
- Routes mounted alongside existing automation endpoints

**Security:**
- JWT authentication required on all endpoints (except server-info)
- Input validation through existing middleware
- CORS configuration maintained
- Comprehensive error responses with appropriate status codes

**Compatibility:**
- Fully compatible with GitHub Copilot (Individual, Business, Enterprise)
- Follows MCP registry best practices
- Standard HTTP/REST transport
- Bearer token authentication

### Dependencies

No new dependencies added. Uses existing infrastructure:
- Express.js for routing
- JWT for authentication
- Winston for logging
- Jest/Supertest for testing

### Migration Notes

For existing users:
1. No breaking changes to existing API endpoints
2. MCP endpoints are additive (new `/api/v2/mcp/*` routes)
3. Existing authentication and rate limiting apply
4. No database schema changes required

### Documentation Links

- [MCP Documentation Index](.mcp/README.md)
- [API Specification](.mcp/specs/API_SPEC.md)
- [Publishing Guide](.mcp/guides/PUBLISHING.md)
- [GitHub Copilot Setup](.github/copilot/README.md)

### Contributors

- stackconsult (implementation and documentation)

---

## [1.0.0] - Previous Release

### Added
- Initial browser automation platform
- JWT authentication system
- Workflow orchestration engine
- Playwright-based browser control
- SQLite/PostgreSQL persistence
- Web dashboard interfaces
- Docker and Railway deployment support
- Comprehensive test suite (94% coverage)

### Security
- Rate limiting (100 req/15min general, 10 req/15min auth)
- Helmet security headers
- CORS protection
- IP anonymization in logs
- GDPR compliance features

---

## Version History

- **1.1.0** - MCP Integration (2024-11-17)
- **1.0.0** - Initial Release

## Roadmap

See [ROADMAP.md](docs/architecture/ROADMAP.md) for planned features.

---

For detailed API changes, see [API Documentation](docs/api/API.md).  
For upgrade guides, see [CONTRIBUTING.md](docs/guides/CONTRIBUTING.md).
