# Agent #17: AI-Powered Project Builder

## Purpose
Build a GitHub Coding Agent that generates comprehensive, production-ready project prompts following a "free before paid" philosophy with BYOK (Bring Your Own Key) integrations.

## Architecture
- **Type**: Node.js-based with TypeScript
- **Runtime**: Node.js 18+
- **Dependencies**: Playwright, Jest, TypeScript, ESLint
- **Philosophy**: Free open-source tools first, optional BYOK for premium features

## What This Agent Does

Agent #17 creates detailed project prompts that other AI agents (like GitHub Copilot) can execute to build complete, production-ready applications. It follows these core principles:

1. **Free Before Paid**: Always use free, open-source tools as defaults
2. **BYOK Optional**: Premium services require user-provided API keys
3. **Production Ready**: 80%+ test coverage, CI/CD, full documentation
4. **Security First**: No hardcoded secrets, secure key storage

## Inputs

### Configuration Files
- `agent-prompt.yml` - Complete agent specification
- Project templates in `templates/` directory
- Example prompts in `examples/` directory

### Environment Variables
None required for core functionality. BYOK services need user-provided keys:
- `OPENAI_API_KEY` (optional) - For OpenAI integrations
- `ANTHROPIC_API_KEY` (optional) - For Claude integrations
- `SENDGRID_API_KEY` (optional) - For email notifications
- `SLACK_WEBHOOK_URL` (optional) - For Slack alerts

### Triggers
- Manual: Run prompt generator on demand
- Scheduled: Generate project templates weekly
- Event-based: Auto-generate on new template requests

## Outputs

### Files Generated
- Complete project prompts (Markdown files)
- Project structure diagrams
- Configuration examples (.env.example, tsconfig.json, etc.)
- GitHub Actions workflows
- Test specifications

### Side Effects
- Creates example projects in `examples/` directory
- Updates template library
- Validates prompt completeness

### Reports
- Prompt generation summary
- Free vs BYOK service usage
- Project build success rates

## Integration Points

### Related Agents
- Can be used by any developer or AI agent
- Complements CI/CD workflows
- Integrates with GitHub Actions

### Workflows Triggered
- `build-projects.yml` - Generates projects from prompts
- `validate-prompts.yml` - Validates prompt quality

### Services Accessed
- GitHub Actions (free)
- npm registry (free)
- Optional BYOK services (user's own keys)

## Technology Stack

### Free (Default)
- **Playwright** (v1.40+) - Browser automation
- **TypeScript** (v5.3+) - Type safety
- **Jest** (v29.7+) - Testing framework
- **ESLint** (v8.0+) - Code linting
- **GitHub Actions** - CI/CD automation

### BYOK (Optional - User Provides Keys)
- **OpenAI API** - Advanced AI features
- **Anthropic Claude** - Long context analysis
- **SendGrid** - Email notifications
- **Slack** - Team notifications
- **AWS/GCP** - Cloud services

### Free Alternatives to BYOK
- **OpenAI** → Ollama (local LLMs)
- **SendGrid** → nodemailer with Gmail SMTP
- **Slack** → GitHub issue comments
- **AWS S3** → GitHub artifacts
- **Monitoring** → GitHub Actions logs

## Quick Start

### Installation
```bash
cd agents/agent17
npm install
npm test          # Run tests
npm run build     # Compile TypeScript
```

### Generate a Project Prompt
```bash
npm run generate -- --template competitor-tracker
```

This creates a complete prompt in `output/competitor-tracker-prompt.md` that you can paste into GitHub Copilot to build the project.

### Available Templates
1. **competitor-tracker** - E-commerce price monitoring
2. **web-scraper** - General web scraping framework
3. **api-wrapper** - Type-safe API client
4. **automation-suite** - Browser automation tests
5. **data-pipeline** - ETL data processing

## Example Usage

### 1. Generate Competitor Price Tracker
```bash
npm run generate -- --template competitor-tracker --output ./my-price-tracker.md
```

### 2. Copy prompt to GitHub Copilot
Open VS Code, press Cmd+Shift+I (or Ctrl+Shift+I), paste the generated prompt.

### 3. Watch AI Build Your Project
GitHub Copilot will generate:
- Complete TypeScript project structure
- All scraper implementations
- Test suites (80%+ coverage)
- GitHub Actions workflows
- Complete documentation

### 4. Add Optional BYOK Services
Edit `.env` to add your own API keys:
```env
# Optional - only if you want email alerts
SENDGRID_API_KEY=your-key-here

# Optional - only if you want Slack notifications  
SLACK_WEBHOOK_URL=your-webhook-here
```

Project works perfectly fine without any keys!

## Testing

```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report (must be 80%+)
```

## Configuration

### .env.example (No Keys Required)
```env
# Core settings (no API keys needed)
NODE_ENV=development
LOG_LEVEL=info

# Optional BYOK Services (uncomment to use)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# SENDGRID_API_KEY=SG...
# SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Free Alternatives Are Always Shown
Every BYOK service includes free alternative instructions in the generated prompts.

## Best Practices

### For Prompt Generation
1. Always provide free alternatives to BYOK services
2. Include complete code examples
3. Specify 80%+ test coverage requirement
4. Add error handling patterns
5. Include GitHub Actions workflows
6. Document all environment variables

### For BYOK Integration
1. Make all premium services optional
2. Validate keys before use
3. Graceful degradation when keys missing
4. Clear setup instructions
5. Never commit .env file
6. Document free alternatives

### For Security
1. Use .env for all secrets
2. Validate all user inputs
3. Follow principle of least privilege
4. Rotate keys regularly
5. Monitor API usage
6. Log security events

## CI/CD Integration

### GitHub Actions (Free)
Agent #17 automatically includes GitHub Actions workflows in all generated projects:

```yaml
name: Build and Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Scheduled Tasks
```yaml
name: Run Scraper
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - run: npm run scrape
```

## Troubleshooting

### Issue: Generated prompt doesn't work
**Solution**: Validate prompt completeness with:
```bash
npm run validate -- --file output/my-prompt.md
```

### Issue: Want to add BYOK service
**Solution**: Edit template and add:
```yaml
byok_service:
  my_service:
    optional: true
    requires: "MY_API_KEY environment variable"
    free_alternative: "Alternative service name"
```

### Issue: Need higher test coverage
**Solution**: Prompts always specify 80%+ coverage. AI will generate comprehensive tests.

## Contributing

To add a new project template:

1. Create template in `templates/new-template/`
2. Add prompt structure
3. Include free alternatives for all BYOK
4. Test prompt generates working project
5. Document in README
6. Submit PR

## Performance

- Prompt generation: < 1 second
- Project scaffolding: < 5 seconds
- Full project build by AI: 2-5 minutes
- Test execution: Varies by project size

## Monitoring

Agent #17 tracks:
- Number of prompts generated
- Project build success rates
- Free vs BYOK service adoption
- Test coverage achieved
- Common failure patterns

## Success Metrics

A generated project is successful when:
- ✅ AI builds it without errors
- ✅ `npm install` works
- ✅ `npm test` passes (80%+ coverage)
- ✅ `npm run build` succeeds
- ✅ GitHub Actions workflows run
- ✅ Project works without API keys (BYOK optional)
- ✅ README complete and accurate

## Example Projects

See `examples/` directory for complete working examples:
- `competitor-tracker.md` - Full price tracking system
- `web-scraper.md` - General scraper framework
- `api-wrapper.md` - Type-safe API client

Each example can be pasted into GitHub Copilot to generate a complete, production-ready project in minutes.

## License

ISC License - Free to use, modify, and distribute

## Support

For issues or questions:
1. Check documentation in `agent-prompt.yml`
2. Review example prompts in `examples/`
3. Open GitHub issue
4. Follow free-before-paid philosophy

---

**Remember**: This agent prioritizes free, open-source solutions. BYOK services are always optional enhancements, never requirements.
